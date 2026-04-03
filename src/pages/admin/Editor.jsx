import { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { getFileLocal } from '../../lib/storage';
import GameSelector from '../../components/GameSelector';
import SlideTimeline from '../../components/SlideTimeline';
import { getPlugin } from '../../games/registry';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [games, setGames] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [numPages, setNumPages] = useState(0);

  // Selection & form state
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [editingGame, setEditingGame] = useState(null); // existing game being edited, or null for create
  const [gameType, setGameType] = useState('quiz');
  const [title, setTitle] = useState('');
  const [config, setConfig] = useState({});
  const [timeLimit, setTimeLimit] = useState('');
  const [points, setPoints] = useState(100);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    const { data: c } = await supabase.from('classes').select('*').eq('id', id).single();
    if (c) setCls(c);

    const blob = await getFileLocal(`pdf_${id}`);
    if (blob) setPdfFile(blob);

    const { data: g } = await supabase.from('games').select('*').eq('class_id', id).order('slide_number', { ascending: true });
    if (g) setGames(g);
  };

  // When a slide is selected, check if it has a game and load it
  const handleSelectSlide = (slideNum) => {
    setSelectedSlide(slideNum);

    const existing = games.filter(g => g.slide_number === slideNum);
    if (existing.length > 0) {
      // Load first game on this slide for editing
      loadGameIntoForm(existing[0]);
    } else {
      // Reset form for creation
      resetForm();
    }
  };

  const loadGameIntoForm = (game) => {
    setEditingGame(game);
    setGameType(game.game_type);
    setTitle(game.title);
    setConfig(game.config || {});
    setTimeLimit(game.time_limit ? String(game.time_limit) : '');
    setPoints(game.points || 100);
  };

  const resetForm = () => {
    setEditingGame(null);
    const defaultType = 'quiz';
    setGameType(defaultType);
    setTitle('');
    const plugin = getPlugin(defaultType);
    setConfig(plugin?.defaultConfig || {});
    setTimeLimit('');
    setPoints(100);
  };

  const handleTypeSelect = (type) => {
    setGameType(type);
    // Only reset config if changing type (not when loading existing)
    if (!editingGame || editingGame.game_type !== type) {
      const plugin = getPlugin(type);
      setConfig(plugin?.defaultConfig || {});
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const plugin = getPlugin(gameType);
    if (!plugin) return;

    const validationError = plugin.validateConfig(config);
    if (validationError) return alert(validationError);
    if (!title.trim()) return alert('Dê um título ao jogo.');

    setSaving(true);

    const payload = {
      class_id: id,
      slide_number: selectedSlide,
      game_type: gameType,
      title: title.trim(),
      config,
      time_limit: timeLimit ? parseInt(timeLimit) : null,
      points: parseInt(points) || 100,
    };

    if (editingGame) {
      await supabase.from('games').update(payload).eq('id', editingGame.id);
    } else {
      await supabase.from('games').insert(payload);
    }

    setSaving(false);
    await loadData();

    // Re-select same slide to refresh state
    const { data: g } = await supabase.from('games').select('*').eq('class_id', id).order('slide_number', { ascending: true });
    if (g) {
      setGames(g);
      const updated = g.filter(game => game.slide_number === selectedSlide);
      if (updated.length > 0) {
        loadGameIntoForm(updated[0]);
      }
    }
  };

  const handleDelete = async () => {
    if (!editingGame) return;
    if (!confirm('Apagar este game?')) return;

    await supabase.from('games').delete().eq('id', editingGame.id);
    resetForm();

    const { data: g } = await supabase.from('games').select('*').eq('class_id', id).order('slide_number', { ascending: true });
    if (g) setGames(g);
  };

  // Switch between multiple games on the same slide
  const slideGames = selectedSlide ? games.filter(g => g.slide_number === selectedSlide) : [];
  const handleAddAnother = () => {
    resetForm();
  };

  const plugin = getPlugin(gameType);
  const EditorForm = plugin?.EditorForm;

  if (!cls) return (
    <div className="container min-h-screen flex-col animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div><div className="skeleton skeleton-title" /><div className="skeleton skeleton-text" style={{ width: '40%' }} /></div>
      </div>
      <div className="skeleton skeleton-card" style={{ height: '180px', marginBottom: '1.5rem' }} />
      <div className="skeleton skeleton-card" style={{ height: '300px' }} />
    </div>
  );

  return (
    <div className="container min-h-screen flex-col animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Editor de Games</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{cls.title}</p>
        </div>
        <button onClick={() => navigate('/admin')} className="btn-secondary">Voltar</button>
      </div>

      {/* Slide Timeline */}
      <SlideTimeline
        pdfFile={pdfFile}
        numPages={numPages}
        games={games}
        selectedSlide={selectedSlide}
        onSelectSlide={handleSelectSlide}
        onNumPages={setNumPages}
      />

      {/* Config Panel */}
      <AnimatePresence mode="wait">
        {selectedSlide ? (
          <motion.div
            key={selectedSlide}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="glass-panel"
            style={{ marginTop: '1.5rem' }}
          >
            {/* Panel header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  background: 'var(--bg-canvas)', border: '1px solid var(--border)',
                  padding: '0.35rem 0.7rem', borderRadius: 'var(--radius)',
                  fontWeight: 700, fontSize: '0.8rem',
                  fontFamily: "'SF Mono', monospace", color: 'var(--text-primary)',
                }}>
                  Slide {selectedSlide}
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {editingGame ? 'Editando game' : 'Novo game'}
                </span>
              </div>

              {/* If slide has multiple games, show tabs */}
              {slideGames.length > 0 && (
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {slideGames.map((g, i) => {
                    const p = getPlugin(g.game_type);
                    const isActive = editingGame?.id === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => loadGameIntoForm(g)}
                        className={isActive ? 'tag tag-blue' : 'tag'}
                        style={{
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          border: isActive ? undefined : '1px solid var(--border)',
                          background: isActive ? undefined : 'var(--bg-surface)',
                        }}
                      >
                        {p?.label?.split(' ')[0] || g.game_type}
                      </button>
                    );
                  })}
                  <button
                    onClick={handleAddAnother}
                    className="tag"
                    style={{
                      cursor: 'pointer', fontSize: '0.7rem',
                      border: '1px dashed var(--border)',
                      background: !editingGame ? 'var(--accent-blue-bg)' : 'transparent',
                      color: !editingGame ? 'var(--accent-blue-text)' : 'var(--text-tertiary)',
                    }}
                  >
                    + Novo
                  </button>
                </div>
              )}
            </div>

            {/* Form layout: selector left, config right */}
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, auto) 1fr', gap: '1.5rem', alignItems: 'start' }}>
                {/* Left: type selector + basic fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Tipo</label>
                    <GameSelector onSelect={handleTypeSelect} selectedType={gameType} />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Título</label>
                    <input className="input-glass" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome do game" required />
                  </div>

                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Tempo (s)</label>
                      <input type="number" min="5" className="input-glass" style={{ width: '80px', textAlign: 'center', fontFamily: "'SF Mono', monospace" }} value={timeLimit} onChange={e => setTimeLimit(e.target.value)} placeholder="--" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Pontos</label>
                      <input type="number" min="0" className="input-glass" style={{ width: '80px', textAlign: 'center', fontFamily: "'SF Mono', monospace" }} value={points} onChange={e => setPoints(e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Right: game-specific config form */}
                <div>
                  {EditorForm && (
                    <Suspense fallback={<p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Carregando...</p>}>
                      <EditorForm config={config} onChange={setConfig} />
                    </Suspense>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : editingGame ? 'Atualizar game' : 'Salvar game'}
                </button>
                {editingGame && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="btn-secondary"
                    style={{ color: 'var(--accent-red-text)', borderColor: 'var(--accent-red-bg)' }}
                  >
                    Apagar game
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel flex-center flex-col"
            style={{ marginTop: '1.5rem', minHeight: '200px' }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-blue-bg)', border: '1px solid rgba(31,108,159,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 0.8rem',
              color: 'var(--accent-blue-text)', fontSize: '1.2rem', fontWeight: 700,
            }}>
              🎮
            </div>
            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>
              {numPages > 0 ? 'Clique num slide para adicionar um game' : 'Carregando slides...'}
            </p>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
              {numPages > 0 && `${games.length} game${games.length !== 1 ? 's' : ''} configurado${games.length !== 1 ? 's' : ''} em ${numPages} slides`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
