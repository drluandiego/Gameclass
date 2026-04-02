import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { saveFileLocal } from '../../lib/storage';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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
      const { data, error } = await supabase.from('classes').insert({ title }).select().single();
      if (error) throw error;

      await saveFileLocal(`pdf_${data.id}`, file);

      const filePath = `classes/${data.id}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from('slides')
        .upload(filePath, file, { contentType: 'application/pdf', upsert: true });

      if (!uploadError) {
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

  const startPresentation = async (classId) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const { data, error } = await supabase.from('sessions').insert({
      class_id: classId,
      code: code,
      current_slide: 1,
      is_active: true
    }).select().single();

    if (error) return alert('Erro ao iniciar a transmissao.');

    window.open(`/admin/present/${data.id}`, '_blank');
    navigate(`/admin/panel/${data.id}`);
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
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.8rem', fontFamily: "'SF Mono', monospace" }}>
                {new Date(cls.created_at).toLocaleDateString()}
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button onClick={() => startPresentation(cls.id)} className="btn-primary" style={{ flex: 1 }}>
                  Apresentar
                </button>
                <button onClick={() => navigate(`/admin/editor/${cls.id}`)} className="btn-secondary" style={{ flex: 1 }}>
                  Games
                </button>
              </div>
            </div>
          ))}
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
