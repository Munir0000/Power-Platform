import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RATING_HINTS, RATING_LABELS, conditionTone } from '../../lib/format';
import { prefersReducedMotion, useInView } from '../../lib/motion';
import { RatingMeter, StatusBadge } from '../common';
import { Icon } from '../Icon';

/** One loop of the condition-check flow, played by a scripted cursor. */
const STEPS = [
  { name: 'idle', ms: 1400 },
  { name: 'aim-key', ms: 900 },
  { name: 'pick', ms: 1200 },
  { name: 'aim-save', ms: 800 },
  { name: 'press', ms: 500 },
  { name: 'saved', ms: 3000 },
] as const;

const SAVED = STEPS.length - 1;
const PICKED_RATING = 4;
const IN_REPAIR = 100000002;

export function HeroDemo() {
  const reduced = prefersReducedMotion();
  const [step, setStep] = useState(reduced ? SAVED : 0);
  const [wrapRef, visible] = useInView<HTMLDivElement>({ margin: '0px' });
  const frameRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLSpanElement>(null);
  const saveRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);

  const name = STEPS[step].name;
  const picked = step >= 2;
  const saved = step === SAVED;

  // Advance the loop only while the demo is on screen and the tab is visible.
  useEffect(() => {
    if (reduced || !visible) return;
    const timer = window.setTimeout(() => {
      if (!document.hidden) setStep((s) => (s + 1) % STEPS.length);
    }, STEPS[step].ms);
    return () => window.clearTimeout(timer);
  }, [step, visible, reduced]);

  // Place the cursor over the element the current step is aiming at.
  const placeCursor = useCallback(() => {
    const frame = frameRef.current;
    const cursor = cursorRef.current;
    if (!frame || !cursor) return;
    const target =
      name === 'aim-key' || name === 'pick' ? keyRef.current : name === 'aim-save' || name === 'press' ? saveRef.current : null;
    const box = frame.getBoundingClientRect();
    let x = box.width * 0.82;
    let y = box.height * 0.9;
    if (target) {
      const t = target.getBoundingClientRect();
      x = t.left - box.left + t.width * 0.55;
      y = t.top - box.top + t.height * 0.6;
    }
    cursor.style.setProperty('--x', `${x}px`);
    cursor.style.setProperty('--y', `${y}px`);
  }, [name]);

  useLayoutEffect(() => {
    placeCursor();
    window.addEventListener('resize', placeCursor);
    return () => window.removeEventListener('resize', placeCursor);
  }, [placeCursor]);

  return (
    <div className="demo-wrap" ref={wrapRef}>
      <div className={`demo${saved ? ' is-saved' : ''}`} ref={frameRef} aria-hidden="true">
        <div className="demo-chrome">
          <span className="demo-mark">
            <Icon name="tag" size={12} />
          </span>
          <span className="demo-app">Asset Register</span>
          <span className="demo-path mono">#/assets/LT-01098/check</span>
        </div>

        <div className="demo-body">
          <div className="demo-head">
            <div>
              <p className="demo-title">Condition check</p>
              <p className="demo-asset">
                Dell Latitude 7440 <span className="chip mono">LT-01098</span>
              </p>
            </div>
            <StatusBadge value={IN_REPAIR} />
          </div>

          <div className="demo-prev">
            <span className="demo-prev-label">Last check</span>
            <RatingMeter value={saved ? PICKED_RATING : 2} showLabel />
            <span className="muted">{saved ? 'today' : '3 mo ago'}</span>
          </div>

          <div className="demo-keys">
            {RATING_LABELS.map((label, i) => {
              const n = i + 1;
              const selected = picked && n === PICKED_RATING;
              return (
                <span
                  key={n}
                  ref={n === PICKED_RATING ? keyRef : undefined}
                  className={`demo-key tone-${conditionTone(n)}${selected ? ' is-selected' : ''}${
                    selected && name === 'pick' ? ' is-tapped' : ''
                  }`}
                >
                  <span className="demo-key-num">{n}</span>
                  <span className="demo-key-word">{label}</span>
                </span>
              );
            })}
          </div>
          <p className="demo-hint">{picked ? RATING_HINTS[PICKED_RATING - 1] : 'Choose the rating that best matches what you see.'}</p>

          <div className="demo-actions">
            <span className="demo-btn">Cancel</span>
            <span ref={saveRef} className={`demo-btn is-primary${name === 'press' ? ' is-pressed' : ''}`}>
              {name === 'press' ? 'Saving…' : 'Save check'}
            </span>
          </div>
        </div>

        <div className={`demo-toast${saved ? ' is-shown' : ''}`}>
          <Icon name="check" size={14} />
          Check saved · {PICKED_RATING} {RATING_LABELS[PICKED_RATING - 1]}
        </div>

        {!reduced && (
          <span className={`demo-cursor${name === 'pick' || name === 'press' ? ' is-down' : ''}`} ref={cursorRef}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
              <path d="M5 3.5 18.5 12l-6 1.6L9.4 19.4Z" />
            </svg>
          </span>
        )}
      </div>
      <p className="demo-caption">
        <span className="sr-only">
          Animated demo: a condition check on a Dell Latitude 7440 is rated 4, Very good, and saved.{' '}
        </span>
        Live demo with sample data
      </p>
    </div>
  );
}
