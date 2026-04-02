import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getFileLocal } from '../../lib/storage';
import PDFViewer from '../../components/PDFViewer';
import GameShell from '../../components/GameShell';
import Leaderboard from '../../components/Leaderboard';
import PresenterNotes from '../../components/PresenterNotes';
import { useGameInstance } from '../../hooks/useGameInstance';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { usePresenterTimer } from '../../hooks/usePresenterTimer';
import { useRemoteControl } from '../../hooks/useRemoteControl';
import { QRCodeSVG } from 'qrcode.react';

export default function ControlPanel() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [games, setGames] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const { activeInstance, setActiveInstance, responses, launchGame, closeGame, forceCloseGame, dismissResults } = useGameInstance(session?.id);
  const { rankings } = useLeaderboard(session?.id);
  const { formatted: timerFormatted } = usePresenterTimer();
  const { sendCommand } = useRemoteControl(session?.id);

  useEffect(() => { loadData(); }, [id]);

  useEffect(() => {
    if (!session) return;
    const channel = supabase.channel(`panel_session_${session.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'sessions',
        filter: `id=eq.${session.id}`,
      }, (payload) => {
        setSession(prev => {
          const next = { ...prev, ...payload.new };
          if (next.active_game_instance_id && next.active_game_instance_id !== prev?.active_game_instance_id) {
            supabase.from('game_instances').select('*').eq('id', next.active_game_instance_id).single()
              .then(({ data }) => { if (data) setActiveInstance(data); });
          } else if (!next.active_game_instance_id && prev?.active_game_instance_id) {
            setActiveInstance(null);
          }
          return next;
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.id]);

  const loadData = async () => {
    const { data: sess, error } = await supabase.from('sessions').select('*, classes(*)').eq('id', id).single();
    if (error || !sess) {
      alert('Sessao fechada ou invalida.');
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
    if (localBlob) setPdfFile(localBlob);
  };

  const goToSlide = async (newSlide) => {
    if (newSlide < 1 || (numPages && newSlide > numPages)) return;
    setSession(prev => ({ ...prev, current_slide: newSlide }));
    await supabase.from('sessions').update({ current_slide: newSlide }).eq('id', id);
    sendCommand('sync_slide');

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

  const endSession = async () => {
    if (!confirm('Encerrar a aula para todos?')) return;
    await supabase.from('sessions').update({ is_active: false }).eq('id', id);
    navigate('/admin');
  };

  const handleKeyDown = useCallback((e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.code === 'Space') {
      e.preventDefault();
      handleAdvance();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      handleGoBack();
    } else if (e.key === 'g' || e.key === 'G') handleToggleGame();
    else if (e.key === 'l' || e.key === 'L') setShowLeaderboard(prev => !prev);
    else if (e.key === 'n' || e.key === 'N') setShowNotes(prev => !prev);
  }, [session, numPages, activeInstance, games]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!session) return (
    <div className="container min-h-screen flex-col animate-fade-in" style={{ padding: '0.8rem 1rem', maxWidth: '1200px' }}>
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', padding: '0.7rem 1.2rem' }}>
        <div style={{ flex: 1 }}>
          <div className="skeleton skeleton-title" style={{ width: '50%' }} />
          <div className="skeleton skeleton-text" style={{ width: '30%' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.8rem', flex: 1 }}>
        <div style={{ flex: 2 }}><div className="skeleton skeleton-card" style={{ height: '300px' }} /></div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div className="skeleton skeleton-card" style={{ height: '80px' }} />
          <div className="skeleton skeleton-card" style={{ height: '200px' }} />
        </div>
      </div>
    </div>
  );

  const currentGame = games.find(g => g.slide_number === session.current_slide);
  const activeGame = games.find(g => g.id === activeInstance?.game_id);
  const telaoUrl = `${window.location.origin}/admin/present/${id}`;
  const participationRate = rankings.length > 0 && responses.length > 0
    ? Math.round((responses.length / rankings.length) * 100) : 0;

  return (
    <div className="container min-h-screen flex-col animate-fade-in" style={{ padding: '0.8rem 1rem', maxWidth: '1200px' }}>
      <Leaderboard rankings={rankings} visible={showLeaderboard} />

      {/* QR Code modal */}
      {showQR && (
        <div className="modal-overlay" style={{ cursor: 'pointer' }} onClick={() => setShowQR(false)}>
          <div className="glass-panel" style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Abra no navegador da TV</h3>
            <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius)', display: 'inline-block', border: '1px solid var(--border)' }}>
              <QRCodeSVG value={telaoUrl} size={200} />
            </div>
            <p style={{ color: 'var(--text-tertiary)', marginTop: '1rem', fontSize: '0.75rem', wordBreak: 'break-all', fontFamily: "'SF Mono', monospace" }}>{telaoUrl}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', padding: '0.7rem 1.2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.25rem', fontWeight: 600, fontFamily: "'SF Pro Display', sans-serif" }}>
            {session.classes?.title}
          </h2>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <kbd style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '3px', padding: '0.2rem 0.6rem' }}>
              {session.code}
            </kbd>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontFamily: "'SF Mono', monospace" }}>{timerFormatted}</span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{rankings.length} conectados</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
          <button onClick={() => setShowQR(true)} className="btn-secondary" style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}>
            QR
          </button>
          <button onClick={() => window.open(telaoUrl, '_blank')} className="btn-secondary" style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}>
            Telao
          </button>
          <button onClick={endSession} className="btn-secondary" style={{ color: 'var(--accent-red-text)', borderColor: 'var(--accent-red-bg)', padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}>
            Encerrar
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.8rem', flex: 1 }}>
        {/* Left: Slide preview + nav */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div className="glass-panel" style={{ padding: '0.8rem', textAlign: 'center' }}>
            {pdfFile ? (
              <PDFViewer
                fileUrl={pdfFile}
                pageNumber={session.current_slide}
                onDocumentLoadSuccess={({ numPages: n }) => setNumPages(n)}
                width={450}
              />
            ) : (
              <div style={{ padding: '3rem', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>Slide {session.current_slide}</p>
                <p style={{ fontSize: '0.85rem' }}>Preview nao disponivel neste dispositivo</p>
              </div>
            )}
          </div>

          {/* Nav controls */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={handleGoBack}
              disabled={session.current_slide <= 1 && !activeInstance}
              className="btn-secondary"
              style={{ padding: '0.8rem 1.5rem', fontSize: '0.95rem', minHeight: '48px', opacity: session.current_slide <= 1 && !activeInstance ? 0.3 : 1 }}
            >
              Voltar
            </button>
            <div style={{ textAlign: 'center', minWidth: '72px' }}>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, fontFamily: "'SF Mono', monospace" }}>{session.current_slide}</p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', margin: 0 }}>
                {activeInstance?.status === 'active' ? 'game ativo' : activeInstance?.status === 'showing_results' ? 'resultado' : `de ${numPages || '?'}`}
              </p>
            </div>
            <button
              onClick={handleAdvance}
              disabled={!activeInstance && numPages && session.current_slide >= numPages}
              className="btn-primary"
              style={{ padding: '0.8rem 1.5rem', fontSize: '0.95rem', minHeight: '48px', opacity: !activeInstance && numPages && session.current_slide >= numPages ? 0.3 : 1 }}
            >
              {activeInstance?.status === 'active' ? 'Encerrar game' : activeInstance?.status === 'showing_results' ? 'Proximo' : 'Avancar'}
            </button>
          </div>

          {showNotes && (
            <PresenterNotes classId={session.class_id} slideNumber={session.current_slide} visible={true} />
          )}
        </div>

        {/* Right: Games + Stats */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {/* Stats */}
          <div className="glass-panel" style={{ padding: '0.7rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', textAlign: 'center' }}>
              <div>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, fontFamily: "'SF Mono', monospace" }}>{rankings.length}</p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Alunos</p>
              </div>
              <div>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, fontFamily: "'SF Mono', monospace", color: 'var(--accent-blue-text)' }}>{responses.length}</p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Respostas</p>
              </div>
              <div>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, fontFamily: "'SF Mono', monospace", color: 'var(--accent-green-text)' }}>{participationRate}%</p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Taxa</p>
              </div>
            </div>
          </div>

          {/* Game panel */}
          <div className="glass-panel" style={{ flex: 1, padding: '0.8rem', overflow: 'auto' }}>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: '0.6rem', fontSize: '0.7rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
              Slide {session.current_slide}
            </p>

            {activeInstance && activeGame ? (
              <div className="animate-fade-in">
                {activeInstance.status === 'showing_results' ? (
                  <>
                    <GameShell gameType={activeGame.game_type} config={activeGame.config} role="results" responses={responses} />
                    <button onClick={dismissResults} className="btn-secondary" style={{ width: '100%', marginTop: '0.8rem' }}>
                      Fechar resultados
                    </button>
                  </>
                ) : (
                  <>
                    <GameShell gameType={activeGame.game_type} config={activeGame.config} role="presenter" responses={responses} />
                    <button onClick={() => closeGame(activeGame)} className="btn-primary" style={{ width: '100%', marginTop: '0.8rem', background: 'var(--accent-red-text)' }}>
                      Encerrar game
                    </button>
                  </>
                )}
              </div>
            ) : currentGame ? (
              <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                  Game disponivel:
                </p>
                <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.8rem' }}>{currentGame.title}</p>
                <button onClick={() => launchGame(currentGame.id)} className="btn-primary" style={{ width: '100%' }}>
                  Lancar game &middot; <kbd style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'inherit' }}>G</kbd>
                </button>
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem 0' }}>
                Nenhum game neste slide.
              </p>
            )}
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => setShowLeaderboard(prev => !prev)} className="btn-secondary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem' }}>
              Ranking &middot; <kbd>L</kbd>
            </button>
            <button onClick={() => setShowNotes(prev => !prev)} className="btn-secondary" style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem' }}>
              Notas &middot; <kbd>N</kbd>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
