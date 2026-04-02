import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'gameclass_student';

export function useStudentIdentity(sessionId) {
  const [student, setStudent] = useState(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.sessionId === sessionId && parsed.studentId) {
          supabase
            .from('students')
            .select('*')
            .eq('id', parsed.studentId)
            .single()
            .then(({ data }) => {
              if (data) {
                setStudent(data);
                setNickname(data.nickname);
              }
              setLoading(false);
            });
          return;
        }
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, [sessionId]);

  const register = useCallback(async (nick) => {
    if (!sessionId || !nick.trim()) return null;

    const avatarSeed = Math.random().toString(36).substring(2, 8);

    const { data, error } = await supabase
      .from('students')
      .insert({ session_id: sessionId, nickname: nick.trim(), avatar_seed: avatarSeed })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        const { data: existing } = await supabase
          .from('students')
          .select('*')
          .eq('session_id', sessionId)
          .eq('nickname', nick.trim())
          .single();

        if (existing) {
          setStudent(existing);
          setNickname(existing.nickname);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, studentId: existing.id }));
          return existing;
        }
      }
      throw error;
    }

    setStudent(data);
    setNickname(data.nickname);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessionId, studentId: data.id }));
    return data;
  }, [sessionId]);

  return { student, nickname, setNickname, register, loading };
}
