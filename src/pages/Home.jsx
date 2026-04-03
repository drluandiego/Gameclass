import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import NicknameModal from '../components/NicknameModal';
import { useStudentIdentity } from '../hooks/useStudentIdentity';

export default function Home() {
  const [code, setCode] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [showNickname, setShowNickname] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
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
      // No active session — check if it's a valid room_code (fixed class code)
      const { data: cls } = await supabase
        .from('classes')
        .select('id, room_code')
        .eq('room_code', code.trim())
        .single();

      if (cls) {
        // Valid class code, redirect to waiting room
        navigate(`/join/${cls.room_code}`);
        return;
      }

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
    <div className="min-h-screen flex-center flex-col" style={{ padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="glass-panel"
        style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
          Junte-se usando o codigo disponibilizado.
        </p>

        <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <input
            type="text"
            placeholder="Codigo da sala"
            className="input-glass"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 700 }}
          />
          <button type="submit" className="btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '0.75rem' }}>
            Entrar na aula
          </button>
        </form>

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <button onClick={() => setShowPasswordModal(true)} className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
            Acesso do professor
          </button>
        </div>
      </motion.div>

      {showNickname && (
        <NicknameModal onSubmit={handleNicknameSubmit} />
      )}

      {showPasswordModal && (
        <div className="modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="glass-panel"
            style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}
          >
            <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 800 }}>
              Acesso do professor
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
              Digite a senha para continuar.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (password === 'Redentor@10') {
                navigate('/admin');
              } else {
                setPasswordError('Senha incorreta.');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <input
                type="password"
                placeholder="Senha"
                className="input-glass"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                autoFocus
                style={{ textAlign: 'center', fontSize: '1rem' }}
              />
              {passwordError && (
                <p style={{ color: 'var(--game-red)', fontSize: '0.8rem', margin: 0 }}>{passwordError}</p>
              )}
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Entrar
              </button>
              <button type="button" onClick={() => { setShowPasswordModal(false); setPassword(''); setPasswordError(''); }}
                className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                Cancelar
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
