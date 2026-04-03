import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { getFileLocal } from '../../lib/storage';
import PDFViewer from '../../components/PDFViewer';
import GameShell from '../../components/GameShell';
import Leaderboard from '../../components/Leaderboard';
import ReactionOverlay from '../../components/ReactionOverlay';
import { useGameInstance } from '../../hooks/useGameInstance';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useReactions } from '../../hooks/useReactions';
import { useRemoteControl } from '../../hooks/useRemoteControl';

export default function Present() {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [session, setSession] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [games, setGames] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showCode, setShowCode] = useState(true);

  const { activeInstance, setActiveInstance, responses, launchGame, closeGame, forceCloseGame, dismissResults } = useGameInstance(session?.id);
  const { rankings } = useLeaderboard(session?.id);
  const { reactions } = useReactions(session?.id);

  const handleRemoteCommand = useCallback(({ command }) => {
    if (command === 'sync_slide') {
      supabase.from('sessions').select('*').eq('id', id).single()
        .then(({ data }) => { if (data) setSession(prev => ({ ...prev, ...data })); });
    }
    else if (command === 'next_slide') handleAdvance();
    else if (command === 'prev_slide') handleGoBack();
    else if (command === 'toggle_game') handleToggleGame();
    else if (command === 'toggle_leaderboard') setShowLeaderboard(prev => !prev);
    else if (command === 'dismiss_results') dismissResults();
  }, [session, games, activeInstance]);

  useRemoteControl(session?.id, handleRemoteCommand);

  useEffect(() => { loadSessionAndPDF(); }, [id]);

  useEffect(() => {
    if (showCode) {
      const t = setTimeout(() => setShowCode(false), 15000);
      return () => clearTimeout(t);
    }
  }, [showCode]);

  useEffect(() => {
    if (!session) return;
    const channel = supabase.channel(`telao_session_${session.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'sessions',
        filter: `id=eq.${session.id}`,
      }, (payload) => {
        setSession(prev => {
          const next = { ...prev, ...payload.new };
          if (prev && prev.active_game_instance_id !== next.active_game_instance_id) {
            if (next.active_game_instance_id) {
              supabase.from('game_instances').select('*').eq('id', next.active_game_instance_id).single()
                .then(({ data }) => { if (data) setActiveInstance(data); });
            } else {
              if (activeInstance?.status === 'active') {
                setActiveInstance(null);
              }
            }
          }
          return next;
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session?.id]);

  const loadSessionAndPDF = async () => {
    const { data: sess, error } = await supabase.from('sessions').select('*, classes(*)').eq('id', id).single();
    if (error || !sess) {
      alert('Sessão fechada ou inválida!');
      navigate('/admin');
      return;
    }

    setSession(sess);

    const { data: g } = await supabase.from('games').select('*').eq('class_id', sess.class_id);
    if (g) setGames(g);

    if (sess.active_game_instance_id) {
      const { data: inst } = await supabase.from('game_instances').select('*').eq('id', sess.active_game_instance_id).single();
      if (inst) setActiveInstance(inst);
    }

    const localBlob = await getFileLocal(`pdf_${sess.class_id}`);
    if (localBlob) {
      setPdfFile(localBlob);
    } else {
      alert('PDF não encontrado no cache local. Recrie a aula.');
      navigate('/admin');
    }
  };

  const goToSlide = async (newSlide) => {
    if (newSlide < 1 || (numPages && newSlide > numPages)) return;
    setSession(prev => ({ ...prev, current_slide: newSlide }));
    await supabase.from('sessions').update({ current_slide: newSlide }).eq('id', id);

    const gameOnSlide = games.find(g => g.slide_number === newSlide);
    if (gameOnSlide) {
      await launchGame(gameOnSlide.id);
    }
  };

  const handleAdvance = async () => {
    if (activeInstance && activeInstance.status === 'active') {
      const currentGame = games.find(g => g.id === activeInstance.game_id);
      if (currentGame) await closeGame(currentGame);
    } else if (activeInstance && activeInstance.status === 'showing_results') {
      await dismissResults();
      await goToSlide((session?.current_slide || 1) + 1);
    } else {
      await goToSlide((session?.current_slide || 1) + 1);
    }
  };

  const handleGoBack = async () => {
    if (activeInstance && activeInstance.status === 'active') {
      const currentGame = games.find(g => g.id === activeInstance.game_id);
      if (currentGame) await forceCloseGame(currentGame);
    }
    if (activeInstance && activeInstance.status === 'showing_results') {
      await dismissResults();
    }
    await goToSlide((session?.current_slide || 1) - 1);
  };

  const handleToggleGame = async () => {
    if (activeInstance && activeInstance.status === 'active') {
      const currentGame = games.find(g => g.id === activeInstance.game_id);
      if (currentGame) await closeGame(currentGame);
    } else if (activeInstance && activeInstance.status === 'showing_results') {
      await dismissResults();
    } else {
      const currentGame = games.find(g => g.slide_number === session?.current_slide);
      if (currentGame) await launchGame(currentGame.id);
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.code === 'Space') {
      e.preventDefault();
      handleAdvance();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      handleGoBack();
    } else if (e.key === 'g' || e.key === 'G') {
      handleToggleGame();
    } else if (e.key === 'l' || e.key === 'L') {
      setShowLeaderboard(prev => !prev);
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    } else if (e.key === 'c' || e.key === 'C') {
      setShowCode(prev => !prev);
    }
  }, [session, numPages, activeInstance, games]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    if (!isFullscreen) {
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el).catch(() => {});
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document).catch(() => {});
    }
  };

  if (!session) return (
    <div style={{ background: '#0D1117', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', animation: 'fadeIn 500ms cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="skeleton" style={{ width: '180px', height: '12px', margin: '0 auto 0.8rem', background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)', backgroundSize: '200% 100%' }} />
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', fontFamily: "'SF Mono', monospace" }}>Iniciando transmissao</p>
      </div>
    </div>
  );

  const currentGame = games.find(g => g.id === activeInstance?.game_id);
  const hasActiveGame = activeInstance && (activeInstance.status === 'active' || activeInstance.status === 'showing_results');

  return (
    <div
      ref={containerRef}
      style={{
        background: '#0D1117',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      <ReactionOverlay reactions={reactions} />
      <Leaderboard rankings={rankings} visible={showLeaderboard} theme="dark" />

      {/* Entry code badge */}
      {showCode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 50,
            background: 'rgba(64,114,148,0.15)', backdropFilter: 'blur(12px)',
            padding: '0.8rem 1.2rem', borderRadius: '12px',
            border: '1px solid rgba(64,114,148,0.3)',
            textAlign: 'center',
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Codigo de entrada</p>
          <p style={{ color: '#407294', fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '6px', fontFamily: "'SF Mono', monospace" }}>
            {session.code}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', margin: '0.2rem 0 0' }}>{rankings.length} conectado(s)</p>
        </motion.div>
      )}

      {/* Slide counter */}
      <div style={{
        position: 'absolute', bottom: '1rem', left: '1.5rem', zIndex: 50,
        color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontWeight: 600,
      }}>
        {session.current_slide} / {numPages || '?'}
      </div>

      {/* Bottom-right controls */}
      <div style={{
        position: 'absolute', bottom: '1rem', right: '1.5rem', zIndex: 50,
        display: 'flex', gap: '0.5rem',
      }}>
        <button
          onClick={() => window.open(`/admin/panel/${id}`, '_blank')}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', borderRadius: '8px',
            padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem',
          }}
        >
          Abrir Painel
        </button>
        <button
          onClick={toggleFullscreen}
          style={{
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.4)', borderRadius: '8px',
            padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem',
          }}
        >
          Tela Cheia (F)
        </button>
      </div>

      {/* === MAIN CONTENT === */}
      <AnimatePresence mode="wait">
        {hasActiveGame && currentGame ? (
          <motion.div
            key={`game-${activeInstance.id}-${activeInstance.status}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%', maxWidth: '900px', padding: '2rem',
            }}
          >
            {/* Full-bleed: no white wrapper, games render directly on dark background */}
            {activeInstance.status === 'showing_results' ? (
              <>
                <GameShell
                  gameType={currentGame.game_type}
                  config={currentGame.config}
                  role="results"
                  responses={responses}
                  theme="dark"
                />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '1.5rem', textAlign: 'center' }}>
                  Aguardando professor avancar...
                </p>
              </>
            ) : (
              <>
                <h2 style={{
                  color: '#fff', fontWeight: 800, marginBottom: '1.2rem',
                  fontSize: '1.6rem', textAlign: 'center',
                }}>
                  {currentGame.title}
                </h2>
                <GameShell
                  gameType={currentGame.game_type}
                  config={currentGame.config}
                  role="presenter"
                  responses={responses}
                  theme="dark"
                />
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="pdf"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PDFViewer
              fileUrl={pdfFile}
              pageNumber={session.current_slide}
              onDocumentLoadSuccess={({ numPages }) => setNumPages(numPages)}
              width={Math.min(window.innerWidth - 40, 1400)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
