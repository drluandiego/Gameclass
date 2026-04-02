import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useRemoteControl } from '../../hooks/useRemoteControl';

export default function RemoteControl() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const { sendCommand } = useRemoteControl(sessionId);

  useEffect(() => {
    supabase.from('sessions').select('*, classes(title)').eq('id', sessionId).single()
      .then(({ data }) => { if (data) setSession(data); });

    const channel = supabase.channel(`remote_session_${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'sessions',
        filter: `id=eq.${sessionId}`,
      }, (payload) => {
        setSession(prev => ({ ...prev, ...payload.new }));
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  if (!session) return (
    <div className="min-h-screen flex-center" style={{ padding: '1rem' }}>
      <p style={{ color: 'var(--text-muted)' }}>Conectando...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex-col animate-fade-in" style={{ padding: '1rem', maxWidth: '400px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ textAlign: 'center', marginBottom: '1rem', padding: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 800, marginBottom: '0.3rem' }}>
          Controle Remoto
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {session.classes?.title}
        </p>
        <p style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>
          Slide {session.current_slide}
        </p>
      </div>

      {/* Navegação de slides */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={() => sendCommand('prev_slide')}
          className="btn-secondary"
          style={{ padding: '2rem', fontSize: '1.5rem', minHeight: '80px' }}
        >
          ◄ Voltar
        </button>
        <button
          onClick={() => sendCommand('next_slide')}
          className="btn-primary"
          style={{ padding: '2rem', fontSize: '1.5rem', minHeight: '80px' }}
        >
          Avançar ►
        </button>
      </div>

      {/* Ações rápidas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        <button
          onClick={() => sendCommand('toggle_game')}
          className="btn-primary"
          style={{ padding: '1.5rem', fontSize: '1.1rem', background: '#fbbf24', color: '#000', fontWeight: 800 }}
        >
          Lançar / Fechar Game
        </button>

        <button
          onClick={() => sendCommand('toggle_leaderboard')}
          className="btn-secondary"
          style={{ padding: '1.2rem', fontSize: '1rem' }}
        >
          Ranking
        </button>
      </div>
    </div>
  );
}
