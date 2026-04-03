import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createBroadcastChannel } from '../../lib/realtime';
import { supabase } from '../../lib/supabase';

export default function QnAPlayerView({ config, onRespond, disabled, responses }) {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [votedIds, setVotedIds] = useState(new Set());
  const [votes, setVotes] = useState({});
  const channelRef = useRef(null);
  const votesChannelRef = useRef(null);

  // Derive instanceId from responses (if available) or use a fallback
  const instanceId = responses?.[0]?.game_instance_id;

  // Sync questions from responses prop (already answered by others via DB)
  useEffect(() => {
    if (!responses) return;
    const fromDb = responses.map(r => ({
      id: r.id,
      text: r.payload?.text || '',
    }));
    setQuestions(prev => {
      const existing = new Set(prev.map(q => q.id));
      const newOnes = fromDb.filter(q => !existing.has(q.id));
      return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
    });
  }, [responses]);

  // Subscribe to broadcast channels for new questions + upvotes
  useEffect(() => {
    if (!instanceId) return;

    const qChannel = createBroadcastChannel(`qna_questions_${instanceId}`);
    qChannel.on('broadcast', { event: 'new_question' }, ({ payload }) => {
      setQuestions(prev => {
        if (prev.some(q => q.id === payload.id)) return prev;
        return [...prev, { id: payload.id, text: payload.text }];
      });
    }).subscribe();
    channelRef.current = qChannel;

    const vChannel = createBroadcastChannel(`qna_votes_${instanceId}`);
    vChannel.on('broadcast', { event: 'upvote' }, ({ payload }) => {
      setVotes(prev => ({
        ...prev,
        [payload.responseId]: (prev[payload.responseId] || 0) + 1,
      }));
    }).subscribe();
    votesChannelRef.current = vChannel;

    return () => {
      supabase.removeChannel(qChannel);
      supabase.removeChannel(vChannel);
    };
  }, [instanceId]);

  const handleSend = useCallback(() => {
    if (!text.trim() || sent || disabled) return;
    if (navigator.vibrate) navigator.vibrate(50);
    const trimmed = text.trim();
    setSent(true);
    onRespond({ text: trimmed });

    // Broadcast the question so other players see it immediately
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'new_question',
        payload: { id: tempId, text: trimmed },
      });
    }
    // Add locally
    setQuestions(prev => [...prev, { id: tempId, text: trimmed }]);
  }, [text, sent, disabled, onRespond]);

  const handleVote = useCallback((qId) => {
    if (votedIds.has(qId)) return;
    setVotedIds(prev => new Set(prev).add(qId));
    setVotes(prev => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }));

    if (votesChannelRef.current) {
      votesChannelRef.current.send({
        type: 'broadcast',
        event: 'upvote',
        payload: { responseId: qId },
      });
    }
  }, [votedIds]);

  // Sort questions by votes descending
  const sorted = [...questions].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));

  return (
    <div style={{ width: '100%' }}>
      <h3 style={{ marginBottom: '1rem', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.4, textAlign: 'center' }}>
        {config.prompt}
      </h3>

      {/* Input area */}
      {!sent && !disabled && (
        <div style={{ marginBottom: '1rem' }}>
          <textarea
            className="input-glass"
            value={text}
            onChange={e => setText(e.target.value.slice(0, 200))}
            rows="2"
            maxLength={200}
            placeholder="Escreva sua pergunta..."
            style={{ width: '100%', marginBottom: '0.3rem', fontSize: '16px', resize: 'none' }}
          />
          <p style={{
            textAlign: 'right', fontSize: '0.7rem', marginBottom: '0.4rem',
            fontFamily: "'SF Mono', monospace",
            color: text.length > 170 ? 'var(--game-orange)' : 'var(--text-tertiary)',
          }}>
            {text.length}/200
          </p>
          <motion.button
            onClick={handleSend}
            disabled={!text.trim()}
            whileTap={text.trim() ? { scale: 0.95 } : {}}
            animate={{ opacity: text.trim() ? 1 : 0.4 }}
            style={{
              width: '100%', padding: '0.8rem',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, #407294, #0E2F44)',
              border: 'none', color: '#fff',
              fontWeight: 700, fontSize: '1rem',
              cursor: text.trim() ? 'pointer' : 'default',
            }}
          >
            Enviar pergunta
          </motion.button>
        </div>
      )}

      {sent && (
        <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
          Pergunta enviada! Vote nas perguntas abaixo.
        </p>
      )}

      {/* Questions list */}
      {sorted.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <AnimatePresence>
            {sorted.map(q => {
              const voteCount = votes[q.id] || 0;
              const hasVoted = votedIds.has(q.id);
              return (
                <motion.div
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius)',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <motion.button
                    onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(30);
                      handleVote(q.id);
                    }}
                    disabled={hasVoted}
                    whileTap={!hasVoted ? { scale: 0.85 } : {}}
                    animate={hasVoted ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: '0.15rem',
                      border: hasVoted ? '1.5px solid #407294' : '1.5px solid var(--border)',
                      background: hasVoted ? 'rgba(64,114,148,0.08)' : 'none',
                      cursor: hasVoted ? 'default' : 'pointer',
                      padding: '0.35rem 0.5rem', borderRadius: '8px',
                      color: hasVoted ? '#407294' : 'var(--text-tertiary)',
                      minWidth: '44px', minHeight: '44px',
                      justifyContent: 'center',
                      transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                    }}
                  >
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>
                      {hasVoted ? '▲' : '△'}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: "'SF Mono', monospace" }}>
                      {voteCount}
                    </span>
                  </motion.button>
                  <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {q.text}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
