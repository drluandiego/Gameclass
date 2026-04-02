import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';

const LABELS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];

export default function RoulettePresenterView({ config }) {
  const [students, setStudents] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [displayLabel, setDisplayLabel] = useState('');

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
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * students.length);
      setDisplayLabel(anonLabels[students[randomIdx].id]);
      count++;

      if (count >= totalCycles) {
        clearInterval(interval);
        const winnerIdx = Math.floor(Math.random() * students.length);
        setWinner(students[winnerIdx]);
        setDisplayLabel(anonLabels[students[winnerIdx].id]);
        setSpinning(false);
      }
    }, 80 + count * 8);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <span className="tag tag-purple">Sorteio</span>
      <h4 style={{ marginTop: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{config.title}</h4>

      <div style={{
        marginTop: '1rem', padding: '1.5rem',
        borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)',
        background: 'var(--bg-canvas)',
        minHeight: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {!spinning && !winner ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
            {students.length} participante(s)
          </p>
        ) : (
          <p style={{
            fontSize: winner ? '1.8rem' : '1.2rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            transition: 'all 100ms',
            fontFamily: "'SF Mono', monospace",
          }}>
            {displayLabel}
          </p>
        )}
      </div>

      {winner && (
        <p style={{ color: 'var(--accent-green-text)', marginTop: '0.8rem', fontSize: '0.9rem', fontWeight: 600 }}>
          Sorteado!
        </p>
      )}

      <button
        onClick={spin}
        disabled={spinning || students.length === 0}
        className="btn-primary"
        style={{
          marginTop: '1rem',
          opacity: spinning || students.length === 0 ? 0.4 : 1,
        }}
      >
        {spinning ? 'Girando...' : winner ? 'Girar novamente' : 'Girar roleta'}
      </button>
    </div>
  );
}
