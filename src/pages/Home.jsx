import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import NicknameModal from '../components/NicknameModal';
import { useStudentIdentity } from '../hooks/useStudentIdentity';

export default function Home() {
  const [code, setCode] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [showNickname, setShowNickname] = useState(false);
  const navigate = useNavigate();

  const { register } = useStudentIdentity(sessionData?.id);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    const { data: sess, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code.trim())
      .eq('is_active', true)
      .single();

    if (error || !sess) {
      alert('Codigo invalido ou aula finalizada pelo professor.');
      return;
    }

    setSessionData(sess);
    setShowNickname(true);
  };

  const handleNicknameSubmit = async (nickname) => {
    await register(nickname);
    navigate(`/room/${code}`);
  };

  return (
    <div className="min-h-screen flex-center flex-col animate-fade-in" style={{ padding: '2rem' }}>
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '2.2rem', fontWeight: 700 }}>
          GameClass
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.9rem' }}>
          Junte-se usando o codigo disponibilizado pelo professor.
        </p>

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <input
            type="text"
            placeholder="Codigo da sala"
            className="input-glass"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '2px' }}
          />
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Entrar na aula
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <button onClick={() => navigate('/admin')} className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
            Acesso do professor
          </button>
        </div>
      </div>

      {showNickname && (
        <NicknameModal onSubmit={handleNicknameSubmit} />
      )}
    </div>
  );
}
