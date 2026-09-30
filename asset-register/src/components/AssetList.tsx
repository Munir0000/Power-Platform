import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { listAssets, type Asset, type Site, type User } from '../data/assetRegister';
import { categoryLabel, errorMessage, formatDate, formatRelative } from '../lib/format';
import { consumeSearchFocus } from '../lib/flash';
import { href } from '../lib/router';
import { Alert, RatingMeter, Skeleton, StatusBadge } from './common';
import { Icon } from './Icon';

interface Props {
  sites: Site[];
  users: User[];
  siteId: string;
  onSiteChange: (id: string) => void;
}

const SEARCH_DEBOUNCE_MS = 300;
const SKELETON_ROWS = 8;

function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

/** "/" jumps to search from anywhere on the list, like most data tools. */
function useSlashToFocus(ref: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.closest('input, textarea, select, [contenteditable="true"]');
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ref]);
}

export function AssetList({ sites, users, siteId, onSiteChange }: Props) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, SEARCH_DEBOUNCE_MS);
  const [items, setItems] = useState<Asset[]>([]);
  const [nextToken, setNextToken] = useState<string>();
  const [loadedKey, setLoadedKey] = useState<string>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  useSlashToFocus(searchRef);

  useEffect(() => {
    if (consumeSearchFocus()) searchRef.current?.focus();
  }, []);

  // Loading is derived: the shown results belong to a different query than the current one.
  const queryKey = `${siteId}|${debouncedSearch}|${attempt}`;
  const loading = loadedKey !== queryKey;
  const firstLoad = loadedKey === undefined;

  const siteNames = useMemo(() => new Map(sites.map((s) => [s.cr_siteid, s.cr_sitename])), [sites]);
  const userNames = useMemo(() => new Map(users.map((u) => [u.systemuserid, u.fullname])), [users]);
  const scopeName = siteId ? siteNames.get(siteId) : undefined;

  useEffect(() => {
    let cancelled = false;
    const key = `${siteId}|${debouncedSearch}|${attempt}`;
    listAssets({ search: debouncedSearch, siteId })
      .then((page) => {
        if (cancelled) return;
        setItems(page.items);
        setNextToken(page.nextToken);
        setError(undefined);
      })
      .catch((e) => {
        if (cancelled) return;
        setItems([]);
        setNextToken(undefined);
        setError(errorMessage(e));
      })
      .finally(() => !cancelled && setLoadedKey(key));
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, siteId, attempt]);

  async function loadMore() {
    if (!nextToken) return;
    setLoadingMore(true);
    try {
      const page = await listAssets({ search: debouncedSearch, siteId }, nextToken);
      setItems((prev) => [...prev, ...page.items]);
      setNextToken(page.nextToken);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoadingMore(false);
    }
  }

  function clearFilters() {
    setSearch('');
    onSiteChange('');
    searchRef.current?.focus();
  }

  const hasFilters = Boolean(debouncedSearch || siteId);
  // When the empty state offers "New asset" itself, the header copy steps back to secondary.
  const emptyOffersCreate = !loading && !error && items.length === 0 && !hasFilters;
  const countText = loading
    ? 'Searching…'
    : error
      ? 'Not loaded'
      : `${items.length}${nextToken ? '+' : ''} ${items.length === 1 ? 'asset' : 'assets'}`;

  return (
    <section className="page" aria-labelledby="list-title">
      <header className="page-header is-list">
        <div className="page-title">
          <h1 id="list-title">Assets</h1>
          <p className="page-sub" aria-live="polite">
            <span className="num">{countText}</span>
            {scopeName && <span> · {scopeName}</span>}
          </p>
        </div>
        <a className={emptyOffersCreate ? 'btn' : 'btn btn-primary'} href={href({ name: 'new' })}>
          <Icon name="plus" />
          New asset
        </a>
      </header>

      <div className="toolbar" role="search">
        <div className="search">
          <label htmlFor="asset-search" className="sr-only">
            Search assets by name, tag or serial
          </label>
          <Icon name="search" />
          <input
            ref={searchRef}
            id="asset-search"
            type="search"
            placeholder="Search name, tag or serial"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setSearch('')}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
          />
          <kbd className="search-kbd" aria-hidden="true">
            /
          </kbd>
        </div>
        <div className="select-wrap scope">
          <label htmlFor="site-scope" className="sr-only">
            Site
          </label>
          <Icon name="pin" />
          <select id="site-scope" value={siteId} onChange={(e) => onSiteChange(e.target.value)}>
            <option value="">All sites</option>
            {sites.map((s) => (
              <option key={s.cr_siteid} value={s.cr_siteid}>
                {s.cr_sitename}
                {s.cr_sitecode ? ` (${s.cr_sitecode})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <Alert
          action={
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => setAttempt((n) => n + 1)}>
              <Icon name="retry" />
              Try again
            </button>
          }
        >
          <strong>Couldn’t load assets.</strong> {error}
        </Alert>
      )}

      {loading && firstLoad ? (
        <ListSkeleton />
      ) : !error && items.length === 0 ? (
        <div className="empty">
          {hasFilters ? (
            <>
              <h2>No matching assets</h2>
              <p>
                Nothing matches
                {debouncedSearch ? ` “${debouncedSearch}”` : ' this filter'}
                {scopeName ? ` at ${scopeName}` : ''}. Check the spelling, or search all sites.
              </p>
              <div className="empty-actions">
                <button type="button" className="btn" onClick={clearFilters}>
                  Clear search and site
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>No assets yet</h2>
              <p>Add the first asset to start tracking where it is and how it’s holding up.</p>
              <div className="empty-actions">
                <a className="btn btn-primary" href={href({ name: 'new' })}>
                  <Icon name="plus" />
                  New asset
                </a>
              </div>
            </>
          )}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className={`table-wrap${loading ? ' is-stale' : ''}`} aria-busy={loading}>
            <table className="asset-table">
              <thead>
                <tr>
                  <th scope="col" className="col-asset">Asset</th>
                  <th scope="col" className="col-category">Category</th>
                  <th scope="col" className="col-site">Site</th>
                  <th scope="col" className="col-status">Status</th>
                  <th scope="col" className="col-assigned">Assigned to</th>
                  <th scope="col" className="col-condition">Condition</th>
                  <th scope="col" className="col-checked">Last checked</th>
                  <th scope="col" className="col-action">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((a) => {
                  const assignee = a._cr_assignedto_value ? userNames.get(a._cr_assignedto_value) : undefined;
                  const site = a._cr_site_value ? siteNames.get(a._cr_site_value) : undefined;
                  return (
                    <tr key={a.cr_assetid}>
                      <td className="col-asset">
                        <a className="row-link" href={href({ name: 'asset', id: a.cr_assetid })}>
                          {a.cr_assetname}
                        </a>
                        {(a.cr_assettag || a.cr_serialnumber) && (
                          <span className="asset-ids">
                            {a.cr_assettag && <span className="mono">{a.cr_assettag}</span>}
                            {a.cr_serialnumber && <span className="mono muted">S/N {a.cr_serialnumber}</span>}
                          </span>
                        )}
                      </td>
                      <td className="col-category">{categoryLabel(a.cr_category)}</td>
                      <td className={`col-site${site ? '' : ' is-empty'}`}>{site ?? '—'}</td>
                      <td className="col-status">
                        <StatusBadge value={a.cr_status} />
                      </td>
                      <td className={`col-assigned${assignee ? '' : ' is-empty'}`}>{assignee ?? '—'}</td>
                      <td className="col-condition">
                        <RatingMeter value={a.cr_conditionrating} />
                      </td>
                      <td className="col-checked">
                        {a.cr_lastchecked ? (
                          <time dateTime={a.cr_lastchecked} title={formatDate(a.cr_lastchecked)}>
                            <span className="num">{formatDate(a.cr_lastchecked)}</span>
                            <span className="rel">{formatRelative(a.cr_lastchecked)}</span>
                          </time>
                        ) : (
                          <span className="muted">Never</span>
                        )}
                      </td>
                      <td className="col-action">
                        <a
                          className="btn btn-quiet btn-sm row-action"
                          href={href({ name: 'check', id: a.cr_assetid })}
                          aria-label={`Record condition check for ${a.cr_assetname}`}
                        >
                          <Icon name="clipboard" />
                          <span>Check</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {nextToken && (
            <div className="load-more">
              <button type="button" className="btn" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}

function ListSkeleton() {
  return (
    <div className="table-wrap skeleton-list" aria-busy="true" role="status">
      <span className="sr-only">Loading assets…</span>
      {Array.from({ length: SKELETON_ROWS }, (_, i) => (
        <div className="skeleton-row" key={i}>
          <span className="skeleton-stack">
            <Skeleton size={i % 3 === 0 ? 'lg' : 'md'} />
            <Skeleton size="xs" />
          </span>
          <Skeleton size="sm" />
          <Skeleton size="sm" />
          <Skeleton size="xs" />
        </div>
      ))}
    </div>
  );
}
