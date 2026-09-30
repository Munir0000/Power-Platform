import { useEffect, useMemo, useState } from 'react';
import {
  ATTENTION_MAX_RATING,
  getOverviewLists,
  getOverviewTotals,
  type OverviewLists,
  type OverviewTotals,
  type Site,
  type SiteStats,
  type User,
} from '../data/assetRegister';
import { requestSearchFocus } from '../lib/flash';
import { RATING_LABELS, errorMessage, formatRelative } from '../lib/format';
import { href } from '../lib/router';
import { Alert, RatingMeter, Skeleton } from './common';
import { Icon } from './Icon';

interface Props {
  sites: Site[];
  users: User[];
  currentUserId?: string;
  siteId: string;
  onSiteChange: (id: string) => void;
}

const EMPTY_STATS: Omit<SiteStats, 'siteId'> = { total: 0, inRepair: 0, ratings: [0, 0, 0, 0, 0], unrated: 0, attention: 0 };

/** Result tagged with the query it answers, so a stale response is never shown as current. */
interface Loaded<T> {
  key: string;
  data?: T;
  error?: string;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function Home({ sites, users, currentUserId, siteId, onSiteChange }: Props) {
  const [attempt, setAttempt] = useState(0);
  const [totals, setTotals] = useState<Loaded<OverviewTotals>>();
  const [lists, setLists] = useState<Loaded<OverviewLists>>();

  // Site cards and header counts: $count queries, re-run only when the set of sites changes.
  const siteIdsKey = sites.map((s) => s.cr_siteid).join(',');
  const totalsKey = `${siteIdsKey}|${attempt}`;
  useEffect(() => {
    let cancelled = false;
    const key = `${siteIdsKey}|${attempt}`;
    getOverviewTotals(siteIdsKey ? siteIdsKey.split(',') : [])
      .then((data) => !cancelled && setTotals({ key, data }))
      .catch((e) => !cancelled && setTotals({ key, error: errorMessage(e) }));
    return () => {
      cancelled = true;
    };
  }, [siteIdsKey, attempt]);

  // The two lists follow the selected site and are filtered, sorted and limited by Dataverse.
  const listsKey = `${siteId}|${attempt}`;
  useEffect(() => {
    let cancelled = false;
    const key = `${siteId}|${attempt}`;
    getOverviewLists(siteId || undefined)
      .then((data) => !cancelled && setLists({ key, data }))
      .catch((e) => !cancelled && setLists({ key, error: errorMessage(e) }));
    return () => {
      cancelled = true;
    };
  }, [siteId, attempt]);

  const totalsData = totals?.key === totalsKey ? totals.data : undefined;
  const listsData = lists?.key === listsKey ? lists.data : undefined;
  const error = (totals?.key === totalsKey && totals.error) || (lists?.key === listsKey && lists.error) || undefined;

  const firstName = users.find((u) => u.systemuserid === currentUserId)?.fullname?.split(' ')[0];
  const scopeName = sites.find((s) => s.cr_siteid === siteId)?.cr_sitename;
  const siteNames = useMemo(() => new Map(sites.map((s) => [s.cr_siteid, s.cr_sitename])), [sites]);

  // Everything below is already aggregated server-side; this only pairs counts with site names.
  const view = useMemo(() => {
    if (!totalsData || !listsData) return undefined;
    const statsById = new Map(totalsData.sites.map((s) => [s.siteId, s]));
    return {
      total: totalsData.total,
      attentionTotal: totalsData.attention,
      attention: listsData.attention,
      attentionMatches: listsData.attentionTotal,
      recent: listsData.recent,
      bySite: sites.map((site) => ({ site, ...(statsById.get(site.cr_siteid) ?? EMPTY_STATS) })),
    };
  }, [totalsData, listsData, sites]);

  const summary = view
    ? [
        `${sites.length} ${sites.length === 1 ? 'site' : 'sites'}`,
        `${view.total} assets`,
        `${view.attentionTotal} need attention`,
      ].join(' · ')
    : error
      ? 'Snapshot not loaded'
      : 'Loading your snapshot…';

  return (
    <section className="page home" aria-labelledby="home-title">
      <header className="page-header home-head">
        <div className="page-title">
          <h1 id="home-title" className="home-title">
            {greeting()}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="page-sub num" aria-live="polite">
            {summary}
          </p>
        </div>
        <div className="home-actions">
          <a className="btn btn-primary" href={href({ name: 'list' })} onClick={requestSearchFocus}>
            <Icon name="search" />
            Find an asset
          </a>
          <a className="btn" href={href({ name: 'new' })}>
            <Icon name="plus" />
            New asset
          </a>
        </div>
      </header>

      {error && (
        <Alert
          action={
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setAttempt((n) => n + 1)}>
              <Icon name="retry" />
              Try again
            </button>
          }
        >
          <strong>Couldn’t load the snapshot.</strong> {error}
        </Alert>
      )}

      {!(error && !view) && (
        <>
      <section className="home-section" aria-labelledby="sites-title">
        <div className="section-head">
          <h2 id="sites-title">Sites</h2>
          <p className="section-note">Choose a site to scope the asset list.</p>
        </div>
        {!view ? (
          !error && <SiteSkeleton count={Math.max(sites.length, 3)} />
        ) : (
          <ul className="site-grid">
            {view.bySite.map(({ site, total, attention, inRepair, ratings, unrated }) => {
              const current = site.cr_siteid === siteId;
              return (
                <li key={site.cr_siteid}>
                  <a
                    className={`site-card${current ? ' is-current' : ''}`}
                    href={href({ name: 'list' })}
                    onClick={() => onSiteChange(site.cr_siteid)}
                    aria-current={current ? 'true' : undefined}
                  >
                    <span className="site-card-head">
                      <span className="site-name">{site.cr_sitename}</span>
                      {site.cr_sitecode && <span className="chip mono">{site.cr_sitecode}</span>}
                      {current && <span className="site-current">Your site</span>}
                    </span>
                    {site.cr_city && <span className="site-city">{site.cr_city}</span>}
                    <span className="site-count num">
                      {total} <span className="site-count-unit">{total === 1 ? 'asset' : 'assets'}</span>
                    </span>
                    <DistributionBar ratings={ratings} unrated={unrated} />
                    <span className="site-foot">
                      <span className={attention ? 'site-flag tone-danger' : 'site-flag'}>
                        <span className="status-dot" aria-hidden="true" />
                        {attention} need attention
                      </span>
                      {inRepair > 0 && <span className="site-flag-muted">{inRepair} in repair</span>}
                      <span className="site-go" aria-hidden="true">
                        <Icon name="arrow" size={16} />
                      </span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="home-lists">
        <section className="pane home-list" aria-labelledby="attention-title">
          <div className="section-head">
            <h2 id="attention-title">Needs attention</h2>
            <p className="section-note">
              Condition {ATTENTION_MAX_RATING} or lower{scopeName ? ` at ${scopeName}` : ''}
            </p>
          </div>
          {!view ? (
            !error && <ListSkeleton />
          ) : view.attention.length === 0 ? (
            <p className="home-empty">
              Nothing needs attention{scopeName ? ` at ${scopeName}` : ''}. Every rated asset is{' '}
              {RATING_LABELS[ATTENTION_MAX_RATING].toLowerCase()} or better.
            </p>
          ) : (
            <ol className="home-rows">
              {view.attention.map((a) => (
                <li key={a.cr_assetid} className="home-row">
                  <span className="home-row-main">
                    <a className="row-link" href={href({ name: 'asset', id: a.cr_assetid })}>
                      {a.cr_assetname}
                    </a>
                    <span className="home-row-sub">
                      {a.cr_assettag && <span className="mono">{a.cr_assettag}</span>}
                      {!siteId && a._cr_site_value && <span>{siteNames.get(a._cr_site_value)}</span>}
                    </span>
                  </span>
                  <RatingMeter value={a.cr_conditionrating} />
                  <a
                    className="btn btn-quiet btn-sm row-action"
                    href={href({ name: 'check', id: a.cr_assetid })}
                    aria-label={`Record condition check for ${a.cr_assetname}`}
                  >
                    <Icon name="clipboard" />
                    <span>Check</span>
                  </a>
                </li>
              ))}
            </ol>
          )}
          {view && view.attentionMatches > view.attention.length && (
            <p className="section-note home-more">
              {view.attentionMatches - view.attention.length} more with condition {ATTENTION_MAX_RATING} or lower.
            </p>
          )}
        </section>

        <section className="pane home-list" aria-labelledby="recent-title">
          <div className="section-head">
            <h2 id="recent-title">Recently checked</h2>
            <p className="section-note">{scopeName ? `At ${scopeName}` : 'Across all sites'}</p>
          </div>
          {!view ? (
            !error && <ListSkeleton />
          ) : view.recent.length === 0 ? (
            <p className="home-empty">No checks recorded yet. Open an asset and record its first check.</p>
          ) : (
            <ol className="home-rows">
              {view.recent.map((a) => (
                <li key={a.cr_assetid} className="home-row">
                  <span className="home-row-main">
                    <a className="row-link" href={href({ name: 'asset', id: a.cr_assetid })}>
                      {a.cr_assetname}
                    </a>
                    <span className="home-row-sub">
                      {a.cr_assettag && <span className="mono">{a.cr_assettag}</span>}
                      {!siteId && a._cr_site_value && <span>{siteNames.get(a._cr_site_value)}</span>}
                    </span>
                  </span>
                  <RatingMeter value={a.cr_conditionrating} />
                  <time className="home-when" dateTime={a.cr_lastchecked}>
                    {formatRelative(a.cr_lastchecked)}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

        </>
      )}

    </section>
  );
}

/** A site's condition spread: one band per rating, sized by how many assets sit there. */
function DistributionBar({ ratings, unrated }: { ratings: number[]; unrated: number }) {
  const total = ratings.reduce((sum, n) => sum + n, 0) + unrated;
  const tones = ['danger', 'warn', 'muted', 'ok', 'ok'];
  const bands = [
    ...ratings.map((n, i) => ({ n, tone: tones[i], key: `r${i + 1}` })),
    { n: unrated, tone: 'none', key: 'unrated' },
  ].filter((b) => b.n > 0);
  const GAP = 0.8;
  const usable = 100 - GAP * Math.max(bands.length - 1, 0);
  let x = 0;
  const label = total
    ? ratings.map((n, i) => `${n} at ${i + 1} ${RATING_LABELS[i]}`).join(', ') + (unrated ? `, ${unrated} not rated` : '')
    : 'No assets';
  return (
    <svg className="dist-bar" viewBox="0 0 100 8" preserveAspectRatio="none" role="img" aria-label={`Condition: ${label}`}>
      <g className="dist-grow">
        {total === 0 ? (
          <rect className="dist-seg tone-none" x="0" y="0" width="100" height="8" rx="1.5" />
        ) : (
          bands.map((b) => {
            const width = (b.n / total) * usable;
            const rect = (
              <rect key={b.key} className={`dist-seg tone-${b.tone}`} x={x} y="0" width={width} height="8" rx="1.5" />
            );
            x += width + GAP;
            return rect;
          })
        )}
      </g>
    </svg>
  );
}

function SiteSkeleton({ count }: { count: number }) {
  return (
    <ul className="site-grid" aria-busy="true">
      <li className="sr-only" role="status">
        Loading sites…
      </li>
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className="site-card is-skeleton">
            <Skeleton size="md" />
            <Skeleton size="xs" tall />
            <Skeleton size="full" />
            <Skeleton size="sm" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ListSkeleton() {
  return (
    <div className="home-rows" aria-hidden="true">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="home-row">
          <span className="home-row-main">
            <Skeleton size={i % 2 ? 'md' : 'lg'} />
            <Skeleton size="xs" />
          </span>
          <Skeleton size="xs" />
        </div>
      ))}
    </div>
  );
}
