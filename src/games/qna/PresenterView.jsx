import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBroadcastChannel } from '../../lib/realtime';
import { supabase } from '../../lib/supabase';
import AnimatedCounter from '../../components/AnimatedCounter';

export default function QnAPresenterView({ config, responses, theme }) {
  const [votes, setVotes] = useState({});
  const votesChannelRef = useRef(null);

  // Derive instanceId from first response
  const instanceId = responses?.[0]?.game_instance_id;

  // Subscribe to upvotes broadcast
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

  // Sort by votes
  const sorted = [...questions].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));

  const textColor = theme === 'dark' ? '#fff' : 'var(--text-primary)';
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)';
  const cardBg = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'var(--bg-canvas)';
  const cardBorder = theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'var(--border)';

  return (
    <div style={{ textAlign: 'left' }}>
      <span className="tag tag-purple">Perguntas</span>

      <h4 style={{ marginTop: '0.6rem', fontSize: '1.1rem', lineHeight: 1.4, fontWeight: 700, color: textColor }}>
        {config.prompt}
      </h4>

      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <AnimatePresence>
          {sorted.map((q, i) => {
            const voteCount = votes[q.id] || 0;
            return (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius)',
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  minWidth: '36px', color: '#407294',
                }}>
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>&#9650;</span>
                  <span style={{ fontWeight: 700, fontFamily: "'SF Mono', monospace", fontSize: '0.85rem' }}>
                    <AnimatedCounter value={voteCount} duration={400} />
                  </span>
                </div>
                <span style={{ flex: 1, fontSize: '1rem', color: textColor, lineHeight: 1.4 }}>
                  {q.text}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {sorted.length === 0 && (
          <p style={{ textAlign: 'center', color: subtextColor, fontSize: '0.9rem', padding: '2rem 0' }}>
            Aguardando perguntas...
          </p>
        )}
      </div>

      <p style={{ textAlign: 'center', marginTop: '0.8rem', color: subtextColor, fontSize: '0.8rem', fontFamily: "'SF Mono', monospace" }}>
        {responses.length} perguntas
      </p>
    </div>
  );
}
