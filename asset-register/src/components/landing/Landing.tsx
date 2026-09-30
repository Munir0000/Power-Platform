import { Fragment, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { RATING_HINTS, RATING_LABELS, conditionTone } from '../../lib/format';
import { prefersReducedMotion, useInView } from '../../lib/motion';
import { href } from '../../lib/router';
import { RatingMeter, StatusBadge } from '../common';
import { Icon, type IconName } from '../Icon';
import { HeroDemo } from './HeroDemo';
import './landing.css';

const SECTIONS = [
  { id: 'problem', label: 'Problem' },
  { id: 'approach', label: 'Approach' },
  { id: 'build', label: 'Build' },
  { id: 'result', label: 'Result' },
] as const;

const HEADLINE = 'Know where every asset is, and how it’s holding up.';

/** Scroll to a section without touching the hash (the hash drives routing). */
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

/** Fades and lifts its children into place the first time they scroll into view. */
function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [ref, inView] = useInView<HTMLDivElement>({ once: true });
  return (
    <div ref={ref} className={`reveal${inView ? ' is-in' : ''} ${className}`}>
      {children}
    </div>
  );
}

function RevealItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [ref, inView] = useInView<HTMLLIElement>({ once: true });
  return (
    <li ref={ref} className={`reveal${inView ? ' is-in' : ''} ${className}`}>
      {children}
    </li>
  );
}

/** Thin progress line + current-section tracking for the header. */
function useScrollState(barRef: RefObject<HTMLSpanElement | null>) {
  const [active, setActive] = useState<string>();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      barRef.current?.style.setProperty('--progress', String(progress));
      setScrolled(window.scrollY > 8);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [barRef]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id === 'top' ? undefined : hit.target.id);
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5] },
    );
    ['top', ...SECTIONS.map((s) => s.id)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return { active, scrolled };
}

/** Gentle pointer-follow tilt for the hero window (fine pointers only, never under reduced motion). */
function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      const box = node.getBoundingClientRect();
      const x = (e.clientX - box.left) / box.width - 0.5;
      const y = (e.clientY - box.top) / box.height - 0.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        node.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`);
        node.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`);
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      node.style.setProperty('--ry', '0deg');
      node.style.setProperty('--rx', '0deg');
    };
    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', onLeave);
    return () => {
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);
  return ref;
}

export function Landing() {
  const barRef = useRef<HTMLSpanElement>(null);
  const { active, scrolled } = useScrollState(barRef);
  const tiltRef = useTilt();

  return (
    <div className="landing">
      <header className={`lp-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="lp-header-inner">
          <a className="brand" href={href({ name: 'home' })}>
            <span className="brand-mark" aria-hidden="true">
              <Icon name="tag" size={15} />
            </span>
            Asset Register
          </a>
          <nav className="lp-nav" aria-label="Sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="lp-nav-link"
                aria-current={active === s.id ? 'true' : undefined}
                onClick={() => scrollToSection(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <a className="btn btn-primary btn-sm lp-header-cta" href={href({ name: 'overview' })}>
            Open the app
          </a>
        </div>
        <span className="lp-progress" ref={barRef} aria-hidden="true" />
      </header>

      <main id="main" tabIndex={-1} className="lp-main">
        {/* ---------- Hero ---------- */}
        <section id="top" className="lp-hero" aria-labelledby="lp-title">
          <div className="lp-hero-inner">
            <div className="lp-hero-copy">
              <h1 id="lp-title" className="lp-display">
                {HEADLINE.split(' ').map((word, i) => (
                  <Fragment key={i}>
                    <span className="lp-word">
                      <span>{word}</span>
                    </span>{' '}
                  </Fragment>
                ))}
              </h1>
              <p className="lp-lead lp-fade">
                A condition register for IT and facilities teams. Find any asset, record how it’s holding up in a few
                taps, and see every site at a glance.
              </p>
              <div className="lp-actions lp-fade">
                <a className="btn btn-primary lp-btn-lg" href={href({ name: 'overview' })}>
                  Open the live app
                  <Icon name="arrow" />
                </a>
                <button type="button" className="btn lp-btn-lg" onClick={() => scrollToSection('problem')}>
                  See how it works
                </button>
              </div>
              <ul className="lp-stack lp-fade" aria-label="Built with">
                {['Power Apps code app', 'Dataverse', 'React 19', 'TypeScript'].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="lp-hero-demo" ref={tiltRef}>
              <HeroDemo />
            </div>
          </div>
        </section>

        {/* ---------- Problem ---------- */}
        <section id="problem" className="lp-section" aria-labelledby="problem-title">
          <div className="lp-split">
            <Reveal className="lp-copy">
              <h2 id="problem-title" className="lp-h2">
                The problem
              </h2>
              <p className="lp-lead">Equipment lives in spreadsheets that drift.</p>
              <p className="lp-body">
                Nobody is quite sure which laptop is at which site, who has the projector, or what is quietly wearing out
                until it fails. Condition is the missing column: rarely recorded, and never in one place.
              </p>
            </Reveal>
            <Reveal className="lp-visual">
              <StaleSheet />
            </Reveal>
          </div>
        </section>

        {/* ---------- Approach ---------- */}
        <section id="approach" className="lp-section" aria-labelledby="approach-title">
          <Reveal className="lp-copy lp-copy-center">
            <h2 id="approach-title" className="lp-h2">
              The approach
            </h2>
            <p className="lp-lead">Make condition the one live signal.</p>
            <p className="lp-body">
              Every asset carries a single rating from 1 to 5, recorded on the spot. Everything else in the interface
              stays quiet so that signal can stand out. Try the scale.
            </p>
          </Reveal>
          <Reveal>
            <ConditionScale />
          </Reveal>
          <ul className="lp-principles">
            {PRINCIPLES.map((p) => (
              <RevealItem key={p.title} className="lp-principle">
                <span className="lp-principle-icon" aria-hidden="true">
                  <Icon name={p.icon} size={18} />
                </span>
                <span>
                  <strong>{p.title}</strong>
                  <span className="lp-principle-text">{p.text}</span>
                </span>
              </RevealItem>
            ))}
          </ul>
        </section>

        {/* ---------- Build ---------- */}
        <section id="build" className="lp-section" aria-labelledby="build-title">
          <Reveal className="lp-copy lp-copy-center">
            <h2 id="build-title" className="lp-h2">
              Inside the build
            </h2>
            <p className="lp-lead">A Power Apps code app, typed end to end.</p>
          </Reveal>
          <Reveal>
            <BuildDiagram />
          </Reveal>
          <ul className="lp-facts">
            {FACTS.map((f) => (
              <RevealItem key={f.title} className="lp-fact">
                <strong>{f.title}</strong>
                <span>{f.text}</span>
              </RevealItem>
            ))}
          </ul>
        </section>

        {/* ---------- Result ---------- */}
        <section id="result" className="lp-section" aria-labelledby="result-title">
          <div className="lp-split lp-split-result">
            <Reveal className="lp-copy">
              <h2 id="result-title" className="lp-h2">
                The result
              </h2>
              <p className="lp-lead">One register, from the desk to the stockroom floor.</p>
              <p className="lp-body">
                A dense table on desktop, fewer columns on tablets, and cards with thumb-sized actions on phones. Light and
                dark come from the same set of tokens, and every save confirms itself.
              </p>
            </Reveal>
            <DeviceDuo />
          </div>
        </section>

        {/* ---------- Close ---------- */}
        <section className="lp-close" aria-labelledby="close-title">
          <Reveal className="lp-close-inner">
            <h2 id="close-title" className="lp-h2">
              See it working.
            </h2>
            <p className="lp-lead">Open the app to browse the register, or jump straight to the asset list.</p>
            <div className="lp-actions lp-actions-center">
              <a className="btn btn-primary lp-btn-lg" href={href({ name: 'overview' })}>
                Open the live app
                <Icon name="arrow" />
              </a>
              <a className="btn lp-btn-lg" href={href({ name: 'list' })}>
                Browse assets
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="lp-footer">
        <span>Asset Register · Power Apps code app on Dataverse</span>
        <nav aria-label="App">
          <a href={href({ name: 'overview' })}>Overview</a>
          <a href={href({ name: 'list' })}>Assets</a>
          <a href={href({ name: 'new' })}>New asset</a>
        </nav>
      </footer>
    </div>
  );
}

const PRINCIPLES: { icon: IconName; title: string; text: string }[] = [
  { icon: 'pin', title: 'Scoped to your site', text: 'Pick a site once; the app remembers it on that device.' },
  {
    icon: 'clipboard',
    title: 'One tap from any row',
    text: 'Large rating keys, a save bar under the thumb, and the check form one tap away.',
  },
  { icon: 'check', title: 'Every save confirms itself', text: 'Clear confirmations, and errors that say what to do next.' },
];

const FACTS = [
  { title: 'No hand-written fetch', text: 'Every read and write goes through services generated from the Dataverse schema.' },
  { title: 'Deep links in a frame', text: 'Hash routing keeps links working inside the Power Apps host.' },
  { title: 'One token set', text: 'Light and dark themes, with Inter bundled from npm rather than a font CDN.' },
  { title: 'Review without a tenant', text: 'A sample-data mode for design review that never reaches the production build.' },
];

/** The problem, drawn: a spreadsheet whose cells go stale one by one. */
function StaleSheet() {
  const rows = [
    ['Dell Latitude 7440', 'Riyadh HQ', 'Omar K.', 'Mar 2024'],
    ['Epson projector', '?', '?', '—'],
    ['Aeron chair', 'Jeddah', 'Lina H.', '—'],
    ['Fluke multimeter', 'Dammam?', '—', 'Never'],
    ['MacBook Pro 14"', 'Riyadh HQ', '?', '2023?'],
  ];
  return (
    <div className="sheet" role="img" aria-label="A spreadsheet with unknown locations, holders and check dates">
      <div className="sheet-row sheet-head" aria-hidden="true">
        <span>Asset</span>
        <span>Location</span>
        <span>Holder</span>
        <span>Checked</span>
      </div>
      {rows.map((r, i) => (
        <div className="sheet-row" key={i} aria-hidden="true">
          {r.map((c, j) => (
            <span key={j} className={/[?—]|Never/.test(c) ? 'sheet-cell is-stale' : 'sheet-cell'}>
              {c}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/** The approach, interactive: pick a rating and read what it means. */
function ConditionScale() {
  const [value, setValue] = useState(4);
  return (
    <div className="scale">
      <div className="scale-keys" role="group" aria-label="Condition scale">
        {RATING_LABELS.map((label, i) => {
          const n = i + 1;
          return (
            <button
              key={n}
              type="button"
              className={`scale-key tone-${conditionTone(n)}${value === n ? ' is-selected' : ''}`}
              aria-pressed={value === n}
              onClick={() => setValue(n)}
              onMouseEnter={() => setValue(n)}
              onFocus={() => setValue(n)}
            >
              <span className="scale-num">{n}</span>
              <span className="scale-word">{label}</span>
            </button>
          );
        })}
      </div>
      <div className="scale-readout" aria-live="polite">
        <RatingMeter value={value} showLabel />
        <p>{RATING_HINTS[value - 1]}</p>
      </div>
    </div>
  );
}

/** Inside the build: data flows from Dataverse to the screens. */
function BuildDiagram() {
  const nodes = [
    { title: 'Dataverse', items: ['cr_assets', 'cr_sites', 'cr_conditionchecks', 'systemusers'] },
    { title: 'Generated services', items: ['Cr_assetsService', 'Cr_sitesService', 'Cr_conditionchecksService', 'SystemusersService'] },
    { title: 'Data layer', items: ['assetRegister.ts', 'OData queries', 'Lookup binds', 'Readable errors'] },
    { title: 'Screens', items: ['Overview', 'Assets', 'Asset detail', 'Condition check'] },
  ];
  return (
    <ol className="flow" aria-label="Data flow from Dataverse to the screens">
      {nodes.map((n, i) => (
        <li key={n.title} className="flow-step">
          <div className="flow-node">
            <strong>{n.title}</strong>
            <ul>
              {n.items.map((it) => (
                <li key={it} className={i < 3 ? 'mono' : undefined}>
                  {it}
                </li>
              ))}
            </ul>
          </div>
          {i < nodes.length - 1 && <span className="flow-link" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  );
}

/** The result: desktop and phone frames, drawn in code, drifting gently with scroll. */
function DeviceDuo() {
  const ref = useRef<HTMLDivElement>(null);
  const [inViewRef, inView] = useInView<HTMLDivElement>({ once: true });

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = node.getBoundingClientRect();
      const centre = box.top + box.height / 2 - window.innerHeight / 2;
      const t = Math.max(-1, Math.min(1, centre / window.innerHeight));
      node.style.setProperty('--drift', t.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const rows = [
    { name: 'Dell Latitude 7440', tag: 'LT-01098', site: 'Riyadh HQ', status: 100000002, rating: 1 },
    { name: 'Dell UltraSharp U2723QE', tag: 'MN-01357', site: 'Jeddah Office', status: 100000001, rating: 4 },
    { name: 'Epson EB-L630U Projector', tag: 'AV-01161', site: 'Riyadh HQ', status: 100000000, rating: 4 },
    { name: 'Herman Miller Aeron Chair', tag: 'FN-01441', site: 'Dammam Warehouse', status: 100000002, rating: 2 },
    { name: 'Lenovo ThinkPad T14 Gen 4', tag: 'LT-01406', site: 'Dammam Warehouse', status: 100000000, rating: 5 },
  ];

  return (
    <div className={`duo${inView ? ' is-in' : ''}`} ref={inViewRef}>
      <div className="duo-stage" ref={ref} aria-hidden="true">
        <div className="duo-desktop">
          <div className="duo-bar">
            <span className="demo-mark">
              <Icon name="tag" size={11} />
            </span>
            Assets
          </div>
          <div className="duo-table">
            {rows.map((r) => (
              <div className="duo-row" key={r.tag}>
                <span className="duo-name">
                  {r.name}
                  <span className="mono">{r.tag}</span>
                </span>
                <span className="duo-site">{r.site}</span>
                <StatusBadge value={r.status} />
                <RatingMeter value={r.rating} />
              </div>
            ))}
          </div>
        </div>
        <div className="duo-phone">
          <div className="duo-notch" />
          {rows.slice(0, 3).map((r) => (
            <div className="duo-card" key={r.tag}>
              <span className="duo-name">
                {r.name}
                <span className="mono">{r.tag}</span>
              </span>
              <span className="duo-card-foot">
                <StatusBadge value={r.status} />
                <RatingMeter value={r.rating} />
              </span>
              <span className="duo-check">
                <Icon name="clipboard" size={12} /> Check
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="demo-caption">Drawn in code with sample data</p>
    </div>
  );
}
