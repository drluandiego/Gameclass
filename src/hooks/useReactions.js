import { useState, useEffect, useCallback, useRef } from 'react';
import { createBroadcastChannel } from '../lib/realtime';
import { supabase } from '../lib/supabase';

const REACTION_EMOJIS = ['👏', '❤️', '😂', '🔥', '💡', '👍'];
const MAX_VISIBLE = 50;

export function useReactions(sessionId) {
  const [reactions, setReactions] = useState([]);
  const channelRef = useRef(null);
  const idCounter = useRef(0);

  useEffect(() => {
    if (!sessionId) return;

    const channel = createBroadcastChannel(`reactions_${sessionId}`);

    channel.on('broadcast', { event: 'reaction' }, ({ payload }) => {
      addReaction(payload.emoji);
    }).subscribe();

    channelRef.current = channel;

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  const addReaction = useCallback((emoji) => {
    const id = ++idCounter.current;
    const x = 10 + Math.random() * 80; // posição horizontal %
    setReactions(prev => {
      const next = [...prev, { id, emoji, x }];
      return next.slice(-MAX_VISIBLE);
    });

    // Remove após animação
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 3000);
  }, []);

  const sendReaction = useCallback(async (emoji) => {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: 'broadcast',
      event: 'reaction',
      payload: { emoji },
    });
    addReaction(emoji); // Mostra localmente também
  }, [addReaction]);

  return { reactions, sendReaction, REACTION_EMOJIS };
}
