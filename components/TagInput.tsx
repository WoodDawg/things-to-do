'use client';

import { useId, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { normalizeTag } from '@/lib/tags';

type Props = {
  existingTags: string[];
  initial?: string[];
};

export function TagInput({ existingTags, initial = [] }: Props) {
  const [selected, setSelected] = useState<string[]>(initial);
  const [text, setText] = useState('');
  const listId = useId();

  const suggestions = useMemo(() => {
    const q = normalizeTag(text);
    return existingTags
      .filter((t) => !selected.includes(t) && (q ? t.includes(q) : true))
      .slice(0, 6);
  }, [existingTags, selected, text]);

  function add(raw: string) {
    const tag = normalizeTag(raw);
    if (tag && !selected.includes(tag)) setSelected([...selected, tag]);
    setText('');
  }

  function remove(tag: string) {
    setSelected(selected.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="tags" value={selected.join(',')} />

      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {selected.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                onClick={() => remove(tag)}
                className="flex min-h-8 items-center gap-1 rounded-full bg-spruce px-3 py-1 text-sm font-bold text-white"
                aria-label={`Remove tag ${tag}`}
              >
                {tag}
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (text.trim()) add(text);
          } else if (e.key === 'Backspace' && !text && selected.length) {
            remove(selected[selected.length - 1]);
          }
        }}
        onBlur={() => {
          if (text.trim()) add(text);
        }}
        placeholder="hike, waterfall…"
        aria-label="Add tags"
        aria-describedby={listId}
        className="h-11 rounded-lg border border-gravel/25 bg-card px-3 text-base"
      />

      {suggestions.length > 0 ? (
        <div id={listId} className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => add(tag)}
              className="min-h-8 rounded-full border border-gravel/25 bg-card px-3 py-1 text-sm text-mist"
            >
              + {tag}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
