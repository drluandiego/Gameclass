import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBroadcastChannel } from '../../lib/realtime';
import { supabase } from '../../lib/supabase';
import AnimatedCounter from '../../components/AnimatedCounter';

export default function QnAResultsView({ config, responses, theme }) {
  const [votes, setVotes] = useState({});
  const votesChannelRef = useRef(null);

  const instanceId = responses?.[0]?.game_instance_id;

  // Keep listening to votes even in results mode
  useEffect(() => {
    if (!instanceId) return;

    const vChannel = createBroadcastChannel(`qna_votes_${instanceId}`);
    vChannel.on('broadcast', { event: 'upvote' }, ({ payload }) => {
      setVotes(prev => ({
        ...prev,
        [payload.responseId]: (prev[payload.responseId] || 0) + 1,
      }));
    }).subscribe();
    votesChannelRef.current = vChannel;

    return () => { supabase.removeChannel(vChannel); };
  }, [instanceId]);

  const questions = useMemo(() => {
    return responses
      .filter(r => r.payload?.text)
      .map(r => ({ id: r.id, text: r.payload.text }));
  }, [responses]);

  const sorted = [...questions].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));

  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'var(--text-tertiary)';
  const textColor = theme === 'dark' ? '#fff' : 'var(--text-primary)';
  const cardBg = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--bg-canvas)';
  const cardBorder = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'var(--border)';

  const MEDAL_COLORS = ['#FFD900', '#C0C0C0', '#CD7F32'];

  return (
    <div style={{ textAlign: 'center' }}>
      <span className="tag tag-yellow" style={{ display: 'inline-flex', marginBottom: '1rem' }}>Resultado</span>

      <h4 style={{ fontSize: '1rem', lineHeight: 1.4, fontWeight: 700, color: textColor, marginBottom: '1rem' }}>
        {config.prompt}
      </h4>

      <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {sorted.map((q, i) => {
          const voteCount = votes[q.id] || 0;
          const isTop3 = i < 3;
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.8rem',
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius)',
                background: cardBg,
                border: `1px solid ${isTop3 ? MEDAL_COLORS[i] + '40' : cardBorder}`,
                backdropFilter: 'blur(8px)',
                boxShadow: isTop3 ? `0 0 12px ${MEDAL_COLORS[i]}20` : 'none',
              }}
            >
              {isTop3 ? (
                <span style={{
                  minWidth: '28px', height: '28px', borderRadius: '50%',
                  background: MEDAL_COLORS[i], color: '#000',
                  fontWeight: 800, fontSize: '0.75rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  #{i + 1}
                </span>
              ) : (
                <span style={{ minWidth: '28px', textAlign: 'center', color: subtextColor, fontWeight: 600, fontSize: '0.8rem' }}>
                  #{i + 1}
                </span>
              )}
              <span style={{ flex: 1, fontSize: '1rem', color: textColor, lineHeight: 1.4 }}>
                {q.text}
              </span>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                minWidth: '36px', color: '#407294',
              }}>
                <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>&#9650;</span>
                <span style={{ fontWeight: 700, fontFamily: "'SF Mono', monospace", fontSize: '0.85rem' }}>
                  <AnimatedCounter value={voteCount} duration={400} />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <p style={{ color: subtextColor, marginTop: '1rem', fontSize: '0.85rem' }}>
        {responses.length} perguntas enviadas
      </p>
    </div>
  );
}
