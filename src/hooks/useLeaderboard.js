import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useLeaderboard(sessionId) {
  const [rankings, setRankings] = useState([]);

  const fetchRankings = async () => {
    if (!sessionId) return;
    const { data } = await supabase
      .from('students')
      .select('id, nickname, avatar_seed, total_score')
      .eq('session_id', sessionId)
      .order('total_score', { ascending: false });

    if (data) setRankings(data);
  };

  useEffect(() => {
    if (!sessionId) return;
    fetchRankings();

    const channel = supabase.channel(`leaderboard_${sessionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'students',
        filter: `session_id=eq.${sessionId}`,
      }, () => {
        fetchRankings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  return { rankings, refresh: fetchRankings };
}
