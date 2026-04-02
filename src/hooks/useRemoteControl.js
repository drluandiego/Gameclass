import { useEffect, useRef, useCallback } from 'react';
import { createBroadcastChannel } from '../lib/realtime';
import { supabase } from '../lib/supabase';

/**
 * Hook para controle remoto via Broadcast.
 * No presenter: listen to commands.
 * No remote: send commands.
 */
export function useRemoteControl(sessionId, onCommand) {
  const channelRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    const channel = createBroadcastChannel(`remote_${sessionId}`);

    if (onCommand) {
      channel.on('broadcast', { event: 'command' }, ({ payload }) => {
        onCommand(payload);
      }).subscribe();
    } else {
      channel.subscribe();
    }

    channelRef.current = channel;

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  const sendCommand = useCallback(async (command, data = {}) => {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: 'broadcast',
      event: 'command',
      payload: { command, ...data },
    });
  }, []);

  return { sendCommand };
}
