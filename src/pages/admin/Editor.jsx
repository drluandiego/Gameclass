import { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import GameSelector from '../../components/GameSelector';
import { getPlugin } from '../../games/registry';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cls, setCls] = useState(null);
  const [games, setGames] = useState([]);

  const [slide, setSlide] = useState(1);
  const [gameType, setGameType] = useState('quiz');
  const [title, setTitle] = useState('');
  const [config, setConfig] = useState({});
  const [timeLimit, setTimeLimit] = useState('');
  const [points, setPoints] = useState(100);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    const { data: c } = await supabase.from('classes').select('*').eq('id', id).single();
    if (c) setCls(c);
    const { data: g } = await supabase.from('games').select('*').eq('class_id', id).order('slide_number', { ascending: true });
    if (g) setGames(g);
  };

  const handleTypeSelect = (type) => {
    setGameType(type);
    const plugin = getPlugin(type);
    setConfig(plugin?.defaultConfig || {});
  };

  const handleAddGame = async (e) => {
    e.preventDefault();

    const plugin = getPlugin(gameType);
    if (!plugin) return;

    const validationError = plugin.validateConfig(config);
    if (validationError) return alert(validationError);

    if (!title.trim()) return alert('De um titulo ao jogo.');

    await supabase.from('games').insert({
      class_id: id,
      slide_number: parseInt(slide),
      game_type: gameType,
      title: title.trim(),
      config,
      time_limit: timeLimit ? parseInt(timeLimit) : null,
      points: parseInt(points) || 100,
    });

    setTitle('');
    setConfig(plugin.defaultConfig || {});
    setTimeLimit('');
    setSlide(prev => parseInt(prev) + 1);
    loadData();
  };

  const handleDelete = async (gameId) => {
    await supabase.from('games').delete().eq('id', gameId);
    loadData();
  };

  const plugin = getPlugin(gameType);
  const EditorForm = plugin?.EditorForm;

  if (!cls) return (
    <div className="container min-h-screen flex-col animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div><div className="skeleton skeleton-title" /><div className="skeleton skeleton-text" style={{ width: '40%' }} /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '1.5rem' }}>
        <div className="skeleton skeleton-card" style={{ height: '400px' }} />
        <div className="skeleton skeleton-card" style={{ height: '300px' }} />
      </div>
    </div>
  );

  return (
    <div className="container min-h-screen flex-col animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Editor de Games</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{cls.title}</p>
        </div>
        <button onClick={() => navigate('/admin')} className="btn-secondary">Voltar</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Form */}
        <div className="glass-panel" style={{ position: 'sticky', top: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Novo game</h3>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Tipo</label>
            <GameSelector onSelect={handleTypeSelect} selectedType={gameType} />
          </div>

          <form onSubmit={handleAddGame} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Slide</label>
                <input type="number" min="1" required className="input-glass" style={{ width: '72px', textAlign: 'center', fontFamily: "'SF Mono', monospace" }} value={slide} onChange={e => setSlide(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Titulo</label>
                <input className="input-glass" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome do game" required />
              </div>
            </div>

            {EditorForm && (
              <Suspense fallback={<p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Carregando...</p>}>
                <EditorForm config={config} onChange={setConfig} />
              </Suspense>
            )}

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Tempo (s)</label>
                <input type="number" min="5" className="input-glass" style={{ width: '72px', textAlign: 'center', fontFamily: "'SF Mono', monospace" }} value={timeLimit} onChange={e => setTimeLimit(e.target.value)} placeholder="--" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}>Pontos</label>
                <input type="number" min="0" className="input-glass" style={{ width: '72px', textAlign: 'center', fontFamily: "'SF Mono', monospace" }} value={points} onChange={e => setPoints(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
              Salvar game
            </button>
          </form>
        </div>

        {/* Game list */}
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {games.length === 0 ? (
            <div className="glass-panel flex-center flex-col" style={{ minHeight: '320px', '--index': 0 }}>
              <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', background: 'var(--accent-blue-bg)', border: '1px solid rgba(31,108,159,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--accent-blue-text)', fontSize: '1.4rem', fontWeight: 700 }}>?</div>
              <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>Nenhum game criado</p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '0.4rem', maxWidth: '280px', textAlign: 'center' }}>Use o formulario ao lado para adicionar quiz, verdadeiro/falso, nuvem de palavras e mais.</p>
            </div>
          ) : (
            games.map((g, i) => {
              const p = getPlugin(g.game_type);
              return (
                <div key={g.id} className="glass-panel" style={{ '--index': i, display: 'flex', gap: '1.2rem', alignItems: 'center', padding: '16px 20px' }}>
                  <div style={{
                    background: 'var(--bg-canvas)', border: '1px solid var(--border)',
                    padding: '0.6rem 0.8rem', borderRadius: 'var(--radius)',
                    fontWeight: 700, fontSize: '0.85rem', minWidth: '72px', textAlign: 'center',
                    fontFamily: "'SF Mono', monospace", color: 'var(--text-primary)',
                  }}>
                    Slide {g.slide_number}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span className="tag tag-blue">{p?.label || g.game_type}</span>
                      {g.time_limit && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', fontFamily: "'SF Mono', monospace" }}>{g.time_limit}s</span>}
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', fontFamily: "'SF Mono', monospace" }}>{g.points}pts</span>
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{g.title}</h4>
                  </div>
                  <button onClick={() => handleDelete(g.id)} className="btn-secondary" style={{ color: 'var(--accent-red-text)', borderColor: 'var(--accent-red-bg)', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    Apagar
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
