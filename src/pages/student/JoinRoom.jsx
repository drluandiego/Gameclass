import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useStudentIdentity } from '../../hooks/useStudentIdentity';
import NicknameModal from '../../components/NicknameModal';
import JellyfishCanvas from '../../components/JellyfishCanvas';

const WAITING_KEY = 'gameclass_waiting';
const POLL_INTERVAL = 10000;

export default function JoinRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [nickname, setNickname] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const { register } = useStudentIdentity(sessionData?.id);
  const pollRef = useRef(null);
  const channelRef = useRef(null);
  const navigatingRef = useRef(false);

  // On mount: look up class and check for active session
  useEffect(() => {
    init();
    return () => cleanup();
  }, [roomCode]);

  const cleanup = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (channelRef.current) supabase.removeChannel(channelRef.current);
  };

  const init = async () => {
    setLoading(true);
    setError('');

    // 1. Find class by room_code
    const { data: cls, error: clsErr } = await supabase
      .from('classes')
      .select('*')
      .eq('room_code', roomCode)
      .single();

    if (clsErr || !cls) {
      setError('Codigo invalido. Verifique o QR code ou o codigo da sala.');
      setLoading(false);
      return;
    }

    setClassData(cls);

    // 2. Check for active session
    const { data: sess } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', roomCode)
      .eq('is_active', true)
      .single();

    if (sess) {
      setSessionData(sess);
      // Check if we have a stored nickname to auto-join
      const stored = localStorage.getItem(WAITING_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.roomCode === roomCode && parsed.nickname) {
            setLoading(false);
            await autoRegisterAndNavigate(sess.id, parsed.nickname);
            return;
          }
        } catch { /* ignore */ }
      }
    } else {
      // No active session — check for stored nickname to go straight to waiting
      const stored = localStorage.getItem(WAITING_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.roomCode === roomCode && parsed.nickname) {
            setNickname(parsed.nickname);
            setWaiting(true);
            setLoading(false);
            subscribeForSession();
            return;
          }
        } catch { /* ignore */ }
      }
    }

    setLoading(false);
  };

  const autoRegisterAndNavigate = async (sessId, nick) => {
    if (navigatingRef.current) return;
    navigatingRef.current = true;
    try {
      // Temporarily create a direct register call since hook needs sessionId
      const avatarSeed = Math.random().toString(36).substring(2, 8);
      const { data, error: regErr } = await supabase
        .from('students')
        .insert({ session_id: sessId, nickname: nick.trim(), avatar_seed: avatarSeed })
        .select()
        .single();

      if (regErr && regErr.code === '23505') {
        // Already registered — that's fine
      } else if (regErr) {
        console.error('Registration error:', regErr);
      }

      if (data) {
        localStorage.setItem('gameclass_student', JSON.stringify({ sessionId: sessId, studentId: data.id }));
      }

      localStorage.removeItem(WAITING_KEY);
      navigate(`/room/${roomCode}`, { replace: true });
    } catch (err) {
      console.error('Auto-register failed:', err);
      navigatingRef.current = false;
    }
  };

  const handleNicknameSubmit = async (nick) => {
    if (sessionData) {
      // Session already active — register and go
      await register(nick);
      localStorage.removeItem(WAITING_KEY);
      navigate(`/room/${roomCode}`, { replace: true });
    } else {
      // No session — save nickname and enter waiting room
      setNickname(nick);
      localStorage.setItem(WAITING_KEY, JSON.stringify({ roomCode, nickname: nick }));
      setWaiting(true);
      subscribeForSession();
    }
  };

  const subscribeForSession = useCallback(() => {
    cleanup();

    // Realtime: listen for INSERT on sessions with this code
    const channel = supabase.channel(`waiting_${roomCode}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'sessions',
      }, (payload) => {
        if (payload.new.code === roomCode && payload.new.is_active) {
          onSessionDetected(payload.new);
        }
      })
      .subscribe();

    channelRef.current = channel;

    // Fallback poll every 10s
    pollRef.current = setInterval(async () => {
      const { data: sess } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', roomCode)
        .eq('is_active', true)
        .single();

      if (sess) {
        onSessionDetected(sess);
      }
    }, POLL_INTERVAL);
  }, [roomCode]);

  const onSessionDetected = async (sess) => {
    cleanup();
    setSessionData(sess);

    const stored = localStorage.getItem(WAITING_KEY);
    let nick = nickname;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.nickname) nick = parsed.nickname;
      } catch { /* ignore */ }
    }

    if (nick) {
      await autoRegisterAndNavigate(sess.id, nick);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex-center flex-col" style={{ padding: '2rem' }}>
        <div className="glass-panel animate-fade-in" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div className="skeleton skeleton-title" style={{ width: '60%', margin: '0 auto' }} />
          <div className="skeleton skeleton-text" style={{ width: '40%', margin: '1rem auto 0' }} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex-center flex-col" style={{ padding: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel"
          style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}
        >
          <div style={{
            width: '48px', height: '48px', borderRadius: 'var(--radius)',
            background: 'var(--bg-canvas)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', fontSize: '1.4rem',
          }}>
            !
          </div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>Codigo invalido</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {error}
          </p>
          <button className="btn-primary" onClick={() => navigate('/')} style={{ width: '100%' }}>
            Voltar ao inicio
          </button>
        </motion.div>
      </div>
    );
  }

  // Waiting room — immersive jellyfish experience
  if (waiting && !sessionData) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(0,114,206,0.06) 0%, transparent 70%)',
        padding: '1.5rem',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          {/* Class title */}
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{
              fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem',
              background: 'linear-gradient(135deg, #0072CE, #00A9E0)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}
          >
            {classData?.title}
          </motion.h2>

          {/* Nickname pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(0, 114, 206, 0.06)',
              border: '1px solid rgba(0, 169, 224, 0.15)',
              borderRadius: '20px', padding: '0.3rem 1rem',
              marginBottom: '0.5rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Voce:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0072CE' }}>{nickname}</span>
          </motion.div>

          {/* Jellyfish */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 1.5, ease: 'easeOut' }}
          >
            <JellyfishCanvas width={340} height={360} />
          </motion.div>

          {/* Status text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <p style={{
              color: '#0072CE', fontSize: '0.95rem', fontWeight: 600,
              letterSpacing: '0.02em',
            }}>
              Aguardando o professor iniciar...
            </p>
            <p style={{
              color: 'var(--text-tertiary)', fontSize: '0.75rem',
              marginTop: '0.4rem', opacity: 0.7,
            }}>
              A aula vai comecar automaticamente
            </p>
          </motion.div>

          {/* Subtle pulsing ring at bottom */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.05, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '180px', height: '180px', borderRadius: '50%',
              border: '1px solid rgba(0, 169, 224, 0.2)',
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none', zIndex: -1,
            }}
          />
        </motion.div>
      </div>
    );
  }

  // Nickname modal (no session active = will go to waiting, session active = will go to room)
  return (
    <div className="min-h-screen flex-center flex-col" style={{ padding: '2rem' }}>
      {classData && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            color: 'var(--text-secondary)', fontSize: '0.85rem',
            marginBottom: '0.8rem', fontWeight: 500,
          }}
        >
          {classData.title}
        </motion.p>
      )}
      <NicknameModal onSubmit={handleNicknameSubmit} />
    </div>
  );
}
