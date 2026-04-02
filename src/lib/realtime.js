import { supabase } from './supabase';

export function createBroadcastChannel(channelName) {
  return supabase.channel(channelName);
}

export async function broadcastSend(channel, event, payload) {
  await channel.send({ type: 'broadcast', event, payload });
}

export function subscribeToTable(channelName, table, event, filter, callback) {
  const config = { event, schema: 'public', table };
  if (filter) config.filter = filter;
  return supabase.channel(channelName)
    .on('postgres_changes', config, callback)
    .subscribe();
}
