import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function PresenterNotes({ classId, slideNumber, visible }) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!classId || !slideNumber) return;

    supabase
      .from('presenter_notes')
      .select('content')
      .eq('class_id', classId)
      .eq('slide_number', slideNumber)
      .single()
      .then(({ data }) => {
        setContent(data?.content || '');
      });
  }, [classId, slideNumber]);

  const saveNote = (text) => {
    setContent(text);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      setSaving(true);
      await supabase
        .from('presenter_notes')
        .upsert({
          class_id: classId,
          slide_number: slideNumber,
          content: text,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'class_id,slide_number' });
      setSaving(false);
    }, 500);
  };

  if (!visible) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>
          Notas — Slide {slideNumber}
        </span>
        {saving && <span style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>Salvando...</span>}
      </div>
      <textarea
        className="input-glass"
        value={content}
        onChange={e => saveNote(e.target.value)}
        rows="4"
        placeholder="Anotacoes privadas para este slide..."
        style={{ fontSize: '0.85rem', resize: 'vertical' }}
      />
    </div>
  );
}
