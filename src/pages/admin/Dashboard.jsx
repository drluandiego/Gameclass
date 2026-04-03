import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { saveFileLocal, getFileLocal, deleteFileLocal } from '../../lib/storage';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [qrClass, setQrClass] = useState(null);

  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: false });
    if (!error) setClasses(data || []);
    setLoading(false);
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!title || !file) return alert('Preencha titulo e anexe o PDF dos slides');
    setCreating(true);

    try {
      const room_code = Math.floor(100000 + Math.random() * 900000).toString();
      const { data, error } = await supabase.from('classes').insert({ title, room_code }).select().single();
      if (error) throw error;

      await saveFileLocal(`pdf_${data.id}`, file);

      // Upload PDF to Supabase Storage so students can see slides on their phones
      const filePath = `classes/${data.id}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('slides')
        .upload(filePath, file, { contentType: 'application/pdf', upsert: true });

      if (uploadError) {
        console.warn('Upload falhou, tentando novamente...', uploadError.message);
        // Retry once
        const { error: retryError } = await supabase.storage
          .from('slides')
          .upload(filePath, file, { contentType: 'application/pdf', upsert: true });
        if (retryError) {
          console.error('Upload falhou definitivamente:', retryError.message);
          alert('Aviso: O PDF foi salvo localmente mas nao foi possivel enviar ao servidor. Os alunos verao apenas o numero do slide. Verifique se o bucket "slides" existe no Supabase Storage com acesso publico.');
        } else {
          const { data: urlData } = supabase.storage.from('slides').getPublicUrl(filePath);
          if (urlData?.publicUrl) {
            await supabase.from('classes').update({ pdf_url: urlData.publicUrl }).eq('id', data.id);
          }
        }
      } else {
        const { data: urlData } = supabase.storage.from('slides').getPublicUrl(filePath);
        if (urlData?.publicUrl) {
          await supabase.from('classes').update({ pdf_url: urlData.publicUrl }).eq('id', data.id);
        }
      }

      setShowModal(false);
      setTitle('');
      setFile(null);
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert('Erro inesperado ao criar a aula.');
    } finally {
      setCreating(false);
    }
  };

  const startPresentation = async (cls) => {
    const code = cls.room_code;

    // Deactivate any old sessions with this code
    await supabase.from('sessions').update({ is_active: false }).eq('code', code).eq('is_active', true);

    const { data, error } = await supabase.from('sessions').insert({
      class_id: cls.id,
      code: code,
      current_slide: 1,
      is_active: true
    }).select().single();

    if (error) return alert('Erro ao iniciar a transmissao.');

    window.open(`/admin/present/${data.id}`, '_blank');
    navigate(`/admin/panel/${data.id}`);
  };

  const [deletingId, setDeletingId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleDelete = async (cls) => {
    setDeletingId(cls.id);
    try {
      // Delete games, sessions, storage PDF, local cache
      await supabase.from('games').delete().eq('class_id', cls.id);
      await supabase.from('sessions').delete().eq('class_id', cls.id);
      await supabase.storage.from('slides').remove([`classes/${cls.id}.pdf`]);
      await deleteFileLocal(`pdf_${cls.id}`);
      await supabase.from('classes').delete().eq('id', cls.id);
      setConfirmDelete(null);
      fetchClasses();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir a aula.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (cls) => {
    setDuplicatingId(cls.id);
    try {
      // 1. Create new class with new room_code
      const room_code = Math.floor(100000 + Math.random() * 900000).toString();
      const { data: newClass, error } = await supabase.from('classes').insert({
        title: `${cls.title} (cópia)`,
        room_code,
        pdf_url: null,
      }).select().single();
      if (error) throw error;

      // 2. Copy games
      const { data: games } = await supabase.from('games').select('*').eq('class_id', cls.id);
      if (games && games.length > 0) {
        const copies = games.map(g => ({
          class_id: newClass.id,
          slide_number: g.slide_number,
          game_type: g.game_type,
          title: g.title,
          config: g.config,
          time_limit: g.time_limit,
          points: g.points,
        }));
        await supabase.from('games').insert(copies);
      }

      // 3. Copy PDF from storage
      if (cls.pdf_url) {
        // Download original and re-upload
        const oldPath = `classes/${cls.id}.pdf`;
        const newPath = `classes/${newClass.id}.pdf`;
        const { data: fileData } = await supabase.storage.from('slides').download(oldPath);
        if (fileData) {
          await supabase.storage.from('slides').upload(newPath, fileData, { contentType: 'application/pdf', upsert: true });
          const { data: urlData } = supabase.storage.from('slides').getPublicUrl(newPath);
          if (urlData?.publicUrl) {
            await supabase.from('classes').update({ pdf_url: urlData.publicUrl }).eq('id', newClass.id);
          }
          // Also save to local cache
          await saveFileLocal(`pdf_${newClass.id}`, fileData);
        }
      } else {
        // Try local cache
        const localBlob = await getFileLocal(`pdf_${cls.id}`);
        if (localBlob) {
          await saveFileLocal(`pdf_${newClass.id}`, localBlob);
        }
      }

      fetchClasses();
    } catch (err) {
      console.error(err);
      alert('Erro ao duplicar a aula.');
    } finally {
      setDuplicatingId(null);
    }
  };

  return (
    <div className="container min-h-screen animate-fade-in flex-col">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Minhas Aulas</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.3rem' }}>
            Gerencie suas apresentacoes interativas
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Nova aula
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-text" style={{ width: '40%' }} />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
                <div className="skeleton" style={{ height: '40px', flex: 1 }} />
                <div className="skeleton" style={{ height: '40px', flex: 1 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {classes.length === 0 && (
            <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem' }}>
               <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius)', background: 'var(--bg-canvas)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem', fontSize: '1.2rem', color: 'var(--text-tertiary)' }}>+</div>
               <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Nenhuma aula criada</h3>
               <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '320px', margin: '0 auto' }}>Exporte um PowerPoint ou Google Slides como PDF e clique em "Nova aula" para comecar.</p>
            </div>
          )}

          {classes.map((cls, i) => (
            <div key={cls.id} className="glass-panel" style={{ '--index': i, display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: 'var(--bg-canvas)', height: '6px', margin: '-24px -24px 20px -24px', borderRadius: '12px 12px 0 0' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem', fontWeight: 600 }}>{cls.title}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: "'SF Mono', monospace", margin: 0 }}>
                  {new Date(cls.created_at).toLocaleDateString()}
                </p>
                {cls.room_code && (
                  <button
                    onClick={() => setQrClass(cls)}
                    style={{
                      background: 'var(--bg-canvas)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', padding: '0.15rem 0.5rem',
                      fontSize: '0.75rem', fontFamily: "'SF Mono', monospace",
                      fontWeight: 600, cursor: 'pointer', color: 'var(--game-blue)',
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                    }}
                  >
                    QR {cls.room_code}
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button onClick={() => startPresentation(cls)} className="btn-primary" style={{ flex: 1 }}>
                  Apresentar
                </button>
                <button onClick={() => navigate(`/admin/editor/${cls.id}`)} className="btn-secondary" style={{ flex: 1 }}>
                  Games
                </button>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                <button
                  onClick={() => handleDuplicate(cls)}
                  disabled={duplicatingId === cls.id}
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem' }}
                >
                  {duplicatingId === cls.id ? 'Duplicando...' : 'Duplicar'}
                </button>
                <button
                  onClick={() => setConfirmDelete(cls)}
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem', color: 'var(--accent-red-text)', borderColor: 'var(--accent-red-bg)' }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - QR Code */}
      {qrClass && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.3rem', fontSize: '1.3rem', fontWeight: 700 }}>{qrClass.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Imprima este QR code e cole na mesa dos alunos
            </p>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 'var(--radius)', display: 'inline-block', marginBottom: '1rem' }}>
              <QRCodeSVG value={`${window.location.origin}/join/${qrClass.room_code}`} size={200} />
            </div>
            <p style={{
              fontSize: '2rem', fontWeight: 800, fontFamily: "'SF Mono', monospace",
              letterSpacing: '6px', margin: '0.5rem 0 0.3rem', color: 'var(--game-blue)',
            }}>
              {qrClass.room_code}
            </p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginBottom: '1.5rem', fontFamily: "'SF Mono', monospace" }}>
              {window.location.origin}/join/{qrClass.room_code}
            </p>
            <button onClick={() => setQrClass(null)} className="btn-secondary" style={{ width: '100%' }}>
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal - Confirmar exclusão */}
      {confirmDelete && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '380px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Excluir aula?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
              <strong>{confirmDelete.title}</strong>
            </p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              Todos os games, sessoes e o PDF serao apagados permanentemente.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-secondary"
                style={{ flex: 1 }}
                disabled={deletingId === confirmDelete.id}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="btn-primary"
                style={{ flex: 1, background: 'var(--game-red)' }}
                disabled={deletingId === confirmDelete.id}
              >
                {deletingId === confirmDelete.id ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Nova Aula */}
      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '460px' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.4rem' }}>Importar apresentacao</h2>
            <form onSubmit={handleCreateClass} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Titulo da materia</label>
                <input required type="text" className="input-glass" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Anatomia Sistemica Aula 01" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Arquivo PDF</label>
                <input required type="file" accept="application/pdf" className="input-glass" onChange={e => setFile(e.target.files[0])} style={{ cursor: 'pointer' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" disabled={creating} className="btn-primary" style={{ flex: 1 }}>{creating ? 'Processando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
