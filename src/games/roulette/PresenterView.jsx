import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import Confetti from '../../components/Confetti';

const LABELS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];
const GLOW_COLORS = ['#FF4000', '#407294', '#FFD900', '#2D9F5D', '#1B5E8A'];

export default function RoulettePresenterView({ config, theme }) {
  const [students, setStudents] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [displayLabel, setDisplayLabel] = useState('');
  const [tick, setTick] = useState(0);
  const textColor = theme === 'dark' ? '#fff' : 'var(--text-primary)';
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)';

  const anonLabels = useMemo(() => {
    const map = {};
    students.forEach((s, i) => {
      map[s.id] = `Participante ${LABELS[i % LABELS.length]}`;
    });
    return map;
  }, [students]);

  useEffect(() => {
    const fetchStudents = async () => {
      const { data } = await supabase.from('students').select('*');
      if (data) setStudents(data);
    };
    fetchStudents();
  }, []);

  const spin = () => {
    if (students.length === 0) return;
    setSpinning(true);
    setWinner(null);

    let count = 0;
    const totalCycles = 20 + Math.floor(Math.random() * 10);

    const runCycle = () => {
      const randomIdx = Math.floor(Math.random() * students.length);
      setDisplayLabel(anonLabels[students[randomIdx].id]);
      setTick(prev => prev + 1);
      count++;

      if (count >= totalCycles) {
        const winnerIdx = Math.floor(Math.random() * students.length);
        setWinner(students[winnerIdx]);
        setDisplayLabel(anonLabels[students[winnerIdx].id]);
        setSpinning(false);
        return;
      }

      const delay = 60 + (count / totalCycles) * 200;
      setTimeout(runCycle, delay);
    };

    runCycle();
  };

  const glowColor = GLOW_COLORS[tick % GLOW_COLORS.length];

  return (
    <div style={{ textAlign: 'center' }}>
      <Confetti trigger={!!winner} />

      <span className="tag tag-purple">Sorteio</span>
      <h4 style={{ marginTop: '0.6rem', fontSize: '1rem', color: subtextColor, fontWeight: 600 }}>{config.title}</h4>

      <div style={{
        marginTop: '1.2rem', padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'var(--bg-canvas)',
        backdropFilter: 'blur(10px)',
        minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
        boxShadow: spinning
          ? `0 0 30px ${glowColor}50, 0 0 60px ${glowColor}25, 0 0 90px ${glowColor}10`
          : winner
            ? `0 0 40px ${glowColor}40, 0 0 80px ${glowColor}20`
            : 'none',
        transition: 'box-shadow 0.15s ease',
      }}>
        {/* Radial gradient pulse during spin */}
        {spinning && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(circle, ${glowColor}15 0%, transparent 70%)`,
            animation: 'pulseGlow 0.6s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        )}

        <AnimatePresence mode="popLayout">
          {!spinning && !winner ? (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ color: subtextColor, fontSize: '1rem' }}
            >
              {students.length} participante(s)
            </motion.p>
          ) : (
            <motion.p
              key={displayLabel}
              initial={{ opacity: 0, y: 40, scale: 0.8 }}
              animate={{
                opacity: 1, y: 0,
                scale: winner ? [1, 1.15, 1] : 1,
              }}
              exit={{ opacity: 0, y: -40 }}
              transition={{
                duration: winner ? 0.4 : 0.15,
                scale: winner ? { duration: 0.6, times: [0, 0.5, 1] } : undefined,
              }}
              style={{
                fontSize: winner ? '2.2rem' : '1.5rem',
                fontWeight: 800,
                color: winner ? glowColor : textColor,
                fontFamily: "'SF Mono', monospace",
                textShadow: winner ? `0 0 20px ${glowColor}80, 0 0 40px ${glowColor}40` : 'none',
                position: 'relative',
              }}
            >
              {displayLabel}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {winner && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            color: 'var(--game-green)', marginTop: '1rem', fontSize: '1.1rem', fontWeight: 700,
            textShadow: '0 0 12px rgba(45,159,93,0.5), 0 0 24px rgba(45,159,93,0.25)',
          }}
        >
          Sorteado!
        </motion.p>
      )}

      <button
        onClick={spin}
        disabled={spinning || students.length === 0}
        className="btn-primary"
        style={{
          marginTop: '1rem', fontSize: '1rem', padding: '0.8rem 2rem',
          opacity: spinning || students.length === 0 ? 0.4 : 1,
        }}
      >
        {spinning ? 'Girando...' : winner ? 'Girar novamente' : 'Girar roleta'}
      </button>
    </div>
  );
}
