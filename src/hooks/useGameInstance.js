import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { getPlugin } from '../games/registry';

export function useGameInstance(sessionId) {
  const [activeInstance, setActiveInstance] = useState(null);
  const [responses, setResponses] = useState([]);
  const activeInstanceRef = useRef(null);

  // Mantém ref atualizada (resolve bug de closure stale)
  useEffect(() => {
    activeInstanceRef.current = activeInstance;
  }, [activeInstance]);

  // Subscribe a respostas quando há instância ativa
  useEffect(() => {
    if (!activeInstance) {
      setResponses([]);
      return;
    }

    supabase
      .from('responses')
      .select('*')
      .eq('game_instance_id', activeInstance.id)
      .then(({ data }) => { if (data) setResponses(data); });

    const channel = supabase.channel(`responses_${activeInstance.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'responses',
        filter: `game_instance_id=eq.${activeInstance.id}`,
      }, (payload) => {
        setResponses(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeInstance?.id]);

  const launchGame = useCallback(async (gameId) => {
    const { data: instance } = await supabase
      .from('game_instances')
      .insert({
        session_id: sessionId,
        game_id: gameId,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!instance) return null;

    await supabase
      .from('sessions')
      .update({ active_game_instance_id: instance.id })
      .eq('id', sessionId);

    setActiveInstance(instance);
    setResponses([]);
    return instance;
  }, [sessionId]);

  const closeGame = useCallback(async (game) => {
    const inst = activeInstanceRef.current;
    if (!inst) return;

    const plugin = getPlugin(game.game_type);

    // Calcula scores (fire-and-forget, não bloqueia o encerramento)
    if (plugin?.scoreResponse) {
      const { data: allResponses } = await supabase
        .from('responses')
        .select('*')
        .eq('game_instance_id', inst.id);

      if (allResponses) {
        const scoreUpdates = allResponses.map(async (resp) => {
          try {
            const { score } = plugin.scoreResponse(
              game.config, resp.payload, resp.response_time_ms, game.time_limit, game.points
            );
            if (score > 0) {
              await supabase.from('responses').update({ score_awarded: score }).eq('id', resp.id);
              const { data: s } = await supabase.from('students').select('total_score').eq('id', resp.student_id).single();
              if (s) {
                await supabase.from('students').update({ total_score: (s.total_score || 0) + score }).eq('id', resp.student_id);
              }
            }
          } catch (e) {
            console.warn('Erro ao calcular score:', e);
          }
        });
        await Promise.all(scoreUpdates);
      }
    }

    // Fecha instância
    await supabase
      .from('game_instances')
      .update({ status: 'showing_results', ended_at: new Date().toISOString() })
      .eq('id', inst.id);

    // Remove da sessão ativa
    await supabase
      .from('sessions')
      .update({ active_game_instance_id: null })
      .eq('id', sessionId);

    setActiveInstance(prev => prev ? { ...prev, status: 'showing_results' } : null);
  }, [sessionId]);

  // Encerra game silenciosamente (sem mostrar resultados — usado ao passar slide)
  const forceCloseGame = useCallback(async (game) => {
    const inst = activeInstanceRef.current;
    if (!inst) return;

    // Fecha instância direto como 'closed'
    await supabase
      .from('game_instances')
      .update({ status: 'closed', ended_at: new Date().toISOString() })
      .eq('id', inst.id);

    await supabase
      .from('sessions')
      .update({ active_game_instance_id: null })
      .eq('id', sessionId);

    setActiveInstance(null);
    setResponses([]);
  }, [sessionId]);

  const dismissResults = useCallback(async () => {
    const inst = activeInstanceRef.current;
    if (!inst) return;
    await supabase
      .from('game_instances')
      .update({ status: 'closed' })
      .eq('id', inst.id);
    setActiveInstance(null);
    setResponses([]);
  }, []);

  return {
    activeInstance,
    setActiveInstance,
    responses,
    launchGame,
    closeGame,
    forceCloseGame,
    dismissResults,
  };
}
