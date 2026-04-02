import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useStudentIdentity } from '../../hooks/useStudentIdentity';
import { useReactions } from '../../hooks/useReactions';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import GameShell from '../../components/GameShell';
import Leaderboard from '../../components/Leaderboard';
import ReactionOverlay from '../../components/ReactionOverlay';
import NicknameModal from '../../components/NicknameModal';
import PDFViewer from '../../components/PDFViewer';

export default function Room() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [games, setGames] = useState([]);
  const [activeInstance, setActiveInstance] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [responded, setResponded] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [responses, setResponses] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);

  const responseStartRef = useRef(null);

  const { student, register } = useStudentIdentity(session?.id);
  const { reactions, sendReaction, REACTION_EMOJIS } = useReactions(session?.id);
  const { rankings } = useLeaderboard(session?.id);

  useEffect(() => {
    const subs = loadSessionAndSubscribe();
    return () => {
      subs.then(channels => {
        if (channels) channels.forEach(ch => supabase.removeChannel(ch));
      });
    };
  }, [id]);

  useEffect(() => {
    if (!session?.active_game_instance_id) {
      if (activeInstance) {
        setShowLeaderboard(true);
        setTimeout(() => setShowLeaderboard(false), 5000);
      }
      setActiveInstance(null);
      setActiveGame(null);
      setResponded(false);
      setResponses([]);
      return;
    }

    supabase
      .from('game_instances')
      .select('*, games(*)')
      .eq('id', session.active_game_instance_id)
      .single()
      .then(({ data }) => {
        if (data) {
          setActiveInstance(data);
          setActiveGame(data.games);
          setResponded(false);
          setResponses([]);
          responseStartRef.current = Date.now();

          if (navigator.vibrate) navigator.vibrate(200);

          if (student) {
            supabase
              .from('responses')
              .select('id')
              .eq('game_instance_id', data.id)
              .eq('student_id', student.id)
              .single()
              .then(({ data: resp }) => {
                if (resp) setResponded(true);
              });
          }
        }
      });
  }, [session?.active_game_instance_id, student]);

  useEffect(() => {
    if (!activeInstance) return;
    const channel = supabase.channel(`room_responses_${activeInstance.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'responses',
        filter: `game_instance_id=eq.${activeInstance.id}`,
      }, () => {
        supabase.from('responses').select('*').eq('game_instance_id', activeInstance.id)
          .then(({ data }) => { if (data) setResponses(data); });
      })
      .subscribe();

    const statusChannel = supabase.channel(`room_instance_status_${activeInstance.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'game_instances',
        filter: `id=eq.${activeInstance.id}`,
      }, (payload) => {
        setActiveInstance(prev => prev ? { ...prev, ...payload.new } : null);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(statusChannel);
    };
  }, [activeInstance?.id]);

  const loadSessionAndSubscribe = async () => {
    const { data: sess, error } = await supabase.from('sessions').select('*, classes(pdf_url)').eq('code', id).eq('is_active', true).single();
    if (error || !sess) {
      alert('Codigo invalido ou aula finalizada.');
      navigate('/');
      return null;
    }

    setSession(sess);
    setLoading(false);

    if (sess.classes?.pdf_url) {
      setPdfUrl(sess.classes.pdf_url);
    }

    const { data: g } = await supabase.from('games').select('*').eq('class_id', sess.class_id);
    if (g) setGames(g);

    const channel = supabase.channel(`sessao_${sess.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'sessions',
        filter: `id=eq.${sess.id}`,
      }, (payload) => {
        setSession(payload.new);
      })
      .subscribe();

    return [channel];
  };

  const handleRespond = async (payload) => {
    if (responded || !student || !activeInstance) return;
    setResponded(true);

    const responseTimeMs = responseStartRef.current ? Date.now() - responseStartRef.current : 0;

    await supabase.from('responses').insert({
      game_instance_id: activeInstance.id,
      student_id: student.id,
      payload,
      response_time_ms: responseTimeMs,
    });
  };

  const handleNicknameSubmit = async (nickname) => {
    await register(nickname);
  };

  if (loading) return (
    <div className="min-h-screen flex-center flex-col" style={{ padding: '1rem' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '800px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem' }}>
          <div className="skeleton skeleton-title" style={{ width: '40%', margin: '0 auto' }} />
          <div className="skeleton" style={{ height: '200px', borderRadius: 'var(--radius)' }} />
          <div className="skeleton skeleton-text" style={{ width: '30%', margin: '0 auto' }} />
        </div>
      </div>
    </div>
  );

  if (!student) {
    return (
      <div className="min-h-screen flex-center flex-col" style={{ padding: '1rem' }}>
        <NicknameModal onSubmit={handleNicknameSubmit} />
      </div>
    );
  }

  const isShowingResults = activeInstance?.status === 'showing_results';

  return (
    <div className="min-h-screen flex-center flex-col animate-fade-in" style={{ padding: '1rem', background: 'var(--bg-canvas)' }}>
      <ReactionOverlay reactions={reactions} />
      <Leaderboard rankings={rankings} visible={showLeaderboard} />

      <div style={{ width: '100%', maxWidth: '800px' }}>
        <div className="glass-panel" style={{ minHeight: '60vh', position: 'relative', overflow: 'hidden' }}>

          {/* Status bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            background: 'var(--accent-green-bg)', padding: '0.25rem 1rem',
            fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent-green-text)',
            letterSpacing: '0.05em', textTransform: 'uppercase',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>Conectado</span>
            <span>{student.nickname}</span>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.3rem', textAlign: 'center', fontWeight: 600 }}>GameClass</h2>

            {/* Active game */}
            {activeInstance && activeGame ? (
              <div style={{ marginTop: '1rem', width: '100%', animation: 'fadeIn 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                {/* Mini slide preview during game */}
                {pdfUrl && (
                  <div style={{ marginBottom: '0.8rem', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)', opacity: 0.9 }}>
                    <PDFViewer
                      fileUrl={pdfUrl}
                      pageNumber={session?.current_slide || 1}
                      onDocumentLoadSuccess={() => {}}
                      width={Math.min(window.innerWidth - 100, 350)}
                    />
                  </div>
                )}
                {isShowingResults ? (
                  <div>
                    <p className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '0.8rem' }}>Resultado</p>
                    <GameShell
                      gameType={activeGame.game_type}
                      config={activeGame.config}
                      role="results"
                      responses={responses}
                    />
                  </div>
                ) : responded ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                      <span className="tag tag-green">Resposta enviada</span>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', fontFamily: "'SF Mono', monospace" }}>
                        {responses.length} resposta(s)
                      </span>
                    </div>
                    <GameShell
                      gameType={activeGame.game_type}
                      config={activeGame.config}
                      role="presenter"
                      responses={responses}
                    />
                  </div>
                ) : (
                  <div>
                    <p className="tag tag-blue" style={{ display: 'inline-flex', marginBottom: '0.8rem' }}>{activeGame.title}</p>
                    <GameShell
                      gameType={activeGame.game_type}
                      config={activeGame.config}
                      role="player"
                      timeLimit={activeGame.time_limit}
                      timerRunning={activeInstance.status === 'active'}
                      onTimerEnd={() => {}}
                      onRespond={handleRespond}
                      disabled={responded}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Synced slide on phone */}
                {pdfUrl ? (
                  <div style={{ marginTop: '1rem', width: '100%', textAlign: 'center' }}>
                    <PDFViewer
                      fileUrl={pdfUrl}
                      pageNumber={session?.current_slide || 1}
                      onDocumentLoadSuccess={() => {}}
                      width={Math.min(window.innerWidth - 80, 700)}
                    />
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginTop: '0.6rem', fontFamily: "'SF Mono', monospace" }}>
                      Slide {session?.current_slide}
                    </p>
                  </div>
                ) : (
                  <div style={{ marginTop: '2rem', padding: '2rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-canvas)', border: '1px solid var(--border)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Slide atual</p>
                    <p style={{ fontSize: '3rem', fontWeight: 700, fontFamily: "'SF Mono', monospace", margin: 0 }}>
                      {session?.current_slide}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Reaction bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '0.8rem' }}>
          {REACTION_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '50%', width: '44px', height: '44px',
                fontSize: '1.2rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.9)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
