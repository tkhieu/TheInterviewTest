import * as React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { cn } from '../lib/cn';

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export interface RecipientTagInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  /** Validator. Default: simple RFC-ish email regex. */
  validate?: (value: string) => boolean;
  placeholder?: string;
  className?: string;
  /** Render a counter line under the box. Default true. */
  showCounter?: boolean;
}

/**
 * Tag input that turns pasted comma/newline-separated emails into pills.
 * Invalid entries render in red; deletion via × button or Backspace on empty input.
 */
export const RecipientTagInput = ({
  value,
  onChange,
  validate = isEmail,
  placeholder = 'Paste more emails…',
  className,
  showCounter = true,
}: RecipientTagInputProps) => {
  const [draft, setDraft] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const commit = (raw: string) => {
    const items = raw
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length === 0) return;
    const merged = Array.from(new Set([...value, ...items]));
    onChange(merged);
    setDraft('');
  };

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ';') {
      e.preventDefault();
      if (draft.trim()) commit(draft);
    } else if (e.key === 'Backspace' && draft === '' && value.length) {
      e.preventDefault();
      remove(value.length - 1);
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (/[\s,;]/.test(text)) {
      e.preventDefault();
      commit(text);
    }
  };

  const valid = value.filter(validate).length;
  const invalid = value.length - valid;

  return (
    <div className={className}>
      <div
        className="border border-border rounded-md bg-surface px-2 py-1.5 min-h-[88px] flex flex-wrap gap-1.5 items-start cursor-text focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((em, i) => {
          const ok = validate(em);
          return (
            <span
              key={`${em}-${i}`}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12.5px] leading-5',
                ok
                  ? 'bg-surface-2 text-fg'
                  : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:ring-rose-900/40 dark:text-rose-300'
              )}
            >
              {!ok && <AlertCircle className="h-3 w-3 shrink-0" />}
              <span className="max-w-[240px] truncate">{em}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(i);
                }}
                className="text-fg-subtle hover:text-fg shrink-0"
                aria-label={`Remove ${em}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onPaste={onPaste}
          onBlur={() => draft.trim() && commit(draft)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] outline-none text-[13px] px-1.5 py-1 bg-transparent text-fg placeholder:text-fg-subtle"
        />
      </div>
      {showCounter && (
        <div className="mt-1.5 text-[12px] text-fg-subtle tabular-nums">
          {valid} valid
          {invalid > 0 && <span className="text-rose-600"> · {invalid} invalid</span>}
        </div>
      )}
    </div>
  );
};
