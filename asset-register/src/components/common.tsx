import { useEffect, useRef, type ReactNode } from 'react';
import {
  RATING_LABELS,
  conditionTone,
  ratingLabel,
  statusLabel,
  statusTone,
} from '../lib/format';
import { href } from '../lib/router';
import { Icon } from './Icon';

export function StatusBadge({ value }: { value?: number }) {
  return (
    <span className={`status tone-${statusTone(value)}`}>
      <span className="status-dot" aria-hidden="true" />
      {statusLabel(value)}
    </span>
  );
}

/** Five-segment condition meter; the number keeps it readable without colour. */
export function RatingMeter({ value, showLabel = false }: { value?: number; showLabel?: boolean }) {
  if (value == null) return <span className="meter-none">Not rated</span>;
  const label = ratingLabel(value);
  return (
    <span className={`meter tone-${conditionTone(value)}`} title={`${value}/5 · ${label}`}>
      <span className="meter-bar" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={n <= value ? 'seg on' : 'seg'} />
        ))}
      </span>
      <span className="meter-num" aria-hidden="true">
        {value}
      </span>
      {showLabel && (
        <span className="meter-label" aria-hidden="true">
          {label}
        </span>
      )}
      <span className="sr-only">
        Condition {value} of 5, {label}
      </span>
    </span>
  );
}

export function RatingInput({
  value,
  onChange,
  name,
  describedBy,
}: {
  value: number;
  onChange: (v: number) => void;
  name: string;
  describedBy?: string;
}) {
  return (
    <div className="rating-input" role="radiogroup" aria-labelledby={`${name}-legend`} aria-describedby={describedBy}>
      {RATING_LABELS.map((label, i) => {
        const n = i + 1;
        const selected = value === n;
        return (
          <label key={n} className={`rating-key tone-${conditionTone(n)}${selected ? ' is-selected' : ''}`}>
            <input type="radio" name={name} value={n} checked={selected} onChange={() => onChange(n)} />
            <span className="rating-num">{n}</span>
            <span className="rating-word">{label}</span>
          </label>
        );
      })}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  children,
  wide,
  hint,
  required,
  error,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
  wide?: boolean;
  hint?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className={`field${wide ? ' wide' : ''}${error ? ' has-error' : ''}`}>
      <div className="field-head">
        <label htmlFor={htmlFor}>{label}</label>
        {required && <span className="field-req">Required</span>}
        {hint && !error && (
          <span className="field-hint" id={`${htmlFor}-hint`}>
            {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p className="field-error" id={`${htmlFor}-error`}>
          <Icon name="alert" size={14} />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Inline message. With `focus`, it takes focus and scrolls into view when it
 * appears, so a result is never announced somewhere off-screen.
 */
export function Alert({
  kind = 'error',
  children,
  action,
  focus = false,
}: {
  kind?: 'error' | 'success';
  children: ReactNode;
  action?: ReactNode;
  focus?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!focus || !ref.current) return;
    ref.current.focus({ preventScroll: true });
    ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focus, children]);
  return (
    <div
      ref={ref}
      tabIndex={focus ? -1 : undefined}
      className={`alert alert-${kind}`}
      role={kind === 'error' ? 'alert' : 'status'}
    >
      <Icon name={kind === 'error' ? 'alert' : 'check'} />
      <div className="alert-body">{children}</div>
      {action}
    </div>
  );
}

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <a className="back" href={to}>
      <Icon name="back" />
      <span className="back-label">{label}</span>
    </a>
  );
}

export function BackToList() {
  return <BackLink to={href({ name: 'list' })} label="Assets" />;
}

/** Calm placeholder block for loading states (the wrapper carries aria-busy and the announcement). */
export function Skeleton({ size, tall = false }: { size: 'xs' | 'sm' | 'md' | 'lg' | 'full'; tall?: boolean }) {
  return <span className={`skeleton sk-${size}${tall ? ' sk-tall' : ''}`} aria-hidden="true" />;
}
