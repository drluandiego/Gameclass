import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

/**
 * TELÃO — Tela de projeção para TV/projetor.
 * Mostra APENAS o slide em tela cheia + overlay de game/resultados/reações.
 * O professor controla via /admin/panel/:id
 */
export default function Present() {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [session, setSession] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [games, setGames] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showCode, setShowCode] = useState(true); // Mostra código no início

  const { activeInstance, setActiveInstance, responses, launchGame, closeGame, forceCloseGame, dismissResults } = useGameInstance(session?.id);
  const { rankings } = useLeaderboard(session?.id);
  const { reactions } = useReactions(session?.id);

  // Escuta comandos do painel de controle
  const handleRemoteCommand = useCallback(({ command }) => {
    if (command === 'sync_slide') {
      // Recarrega sessão do banco para sincronizar
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

  // Esconde código de entrada após 15s
  useEffect(() => {
    if (showCode) {
      const t = setTimeout(() => setShowCode(false), 15000);
      return () => clearTimeout(t);
    }
  }, [showCode]);

  // Escuta mudanças na sessão (vindo do painel de controle)
  useEffect(() => {
    if (!session) return;
    const channel = supabase.channel(`telao_session_${session.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'sessions',
        filter: `id=eq.${session.id}`,
      }, (payload) => {
        setSession(prev => {
          const next = { ...prev, ...payload.new };
          // Se o slide mudou, verifica se precisa atualizar game
          if (prev && prev.active_game_instance_id !== next.active_game_instance_id) {
            if (next.active_game_instance_id) {
              // Novo game lançado — busca instância
              supabase.from('game_instances').select('*').eq('id', next.active_game_instance_id).single()
                .then(({ data }) => { if (data) setActiveInstance(data); });
            } else {
              // Game foi fechado
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

  // Navega direto para um slide (usado internamente)
  const goToSlide = async (newSlide) => {
    if (newSlide < 1 || (numPages && newSlide > numPages)) return;
    setSession(prev => ({ ...prev, current_slide: newSlide }));
    await supabase.from('sessions').update({ current_slide: newSlide }).eq('id', id);

    // Auto-lançar game se o slide destino tem um
    const gameOnSlide = games.find(g => g.slide_number === newSlide);
    if (gameOnSlide) {
      await launchGame(gameOnSlide.id);
    }
  };

  // Avançar (seta direita / space)
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

  // Voltar (seta esquerda)
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

  // Keyboard: setas para slides, G para game, L para leaderboard, F para fullscreen
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
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (!session) return (
    <div style={{ background: '#0A0A0A', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
        background: '#0A0A0A',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Reações flutuantes */}
      <ReactionOverlay reactions={reactions} />

      {/* Leaderboard overlay */}
      <Leaderboard rankings={rankings} visible={showLeaderboard} />

      {/* Entry code badge */}
      {showCode && (
        <div style={{
          position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 50,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          padding: '0.8rem 1.2rem', borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center', animation: 'fadeIn 600ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'SF Pro Display', sans-serif" }}>Codigo de entrada</p>
          <p style={{ color: 'white', fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '6px', fontFamily: "'SF Mono', monospace" }}>
            {session.code}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', margin: '0.2rem 0 0' }}>{rankings.length} conectado(s)</p>
        </div>
      )}

      {/* Indicador de slide (canto inferior esquerdo, discreto) */}
      <div style={{
        position: 'absolute', bottom: '1rem', left: '1.5rem', zIndex: 50,
        color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', fontWeight: 600,
      }}>
        {session.current_slide} / {numPages || '?'}
      </div>

      {/* Link para o painel de controle (canto inferior direito) */}
      <div style={{
        position: 'absolute', bottom: '1rem', right: '1.5rem', zIndex: 50,
        display: 'flex', gap: '0.5rem',
      }}>
        <button
          onClick={() => window.open(`/admin/panel/${id}`, '_blank')}
          style={{
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: 'rgba(255,255,255,0.4)', borderRadius: '6px',
            padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem',
          }}
        >
          Abrir Painel
        </button>
        <button
          onClick={toggleFullscreen}
          style={{
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: 'rgba(255,255,255,0.4)', borderRadius: '6px',
            padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.75rem',
          }}
        >
          Tela Cheia (F)
        </button>
      </div>

      {/* === CONTEÚDO PRINCIPAL === */}

      {/* Game overlay (quando tem game ativo, substitui o slide) */}
      {hasActiveGame && currentGame ? (
        <div style={{
          width: '100%', maxWidth: '900px', padding: '3rem',
          animation: 'fadeIn 500ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #eaeaea', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
            {activeInstance.status === 'showing_results' ? (
              <>
                <GameShell
                  gameType={currentGame.game_type}
                  config={currentGame.config}
                  role="results"
                  responses={responses}
                />
                <p style={{ color: '#787774', fontSize: '0.75rem', marginTop: '1.5rem' }}>
                  Aguardando professor avancar...
                </p>
              </>
            ) : (
              <>
                <h2 style={{ color: '#2F3437', fontWeight: 700, marginBottom: '1.2rem', fontSize: '1.5rem', fontFamily: "'Newsreader', serif" }}>
                  {currentGame.title}
                </h2>
                <GameShell
                  gameType={currentGame.game_type}
                  config={currentGame.config}
                  role="presenter"
                  responses={responses}
                />
              </>
            )}
          </div>
        </div>
      ) : (
        /* Slide em tela cheia */
        <PDFViewer
          fileUrl={pdfFile}
          pageNumber={session.current_slide}
          onDocumentLoadSuccess={({ numPages }) => setNumPages(numPages)}
          width={Math.min(window.innerWidth - 40, 1400)}
        />
      )}
    </div>
  );
}
