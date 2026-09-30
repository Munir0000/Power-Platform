import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  createAsset,
  getAsset,
  listConditionChecks,
  updateAsset,
  type Asset,
  type AssetEditable,
  type ConditionCheck,
  type Site,
  type User,
} from '../data/assetRegister';
import { clearFlash, peekFlash, setFlash } from '../lib/flash';
import {
  categoryOptions,
  errorMessage,
  formatDate,
  formatRelative,
  statusOptions,
  toDateInput,
  todayInput,
} from '../lib/format';
import { href, navigate } from '../lib/router';
import { Alert, BackToList, Field, RatingMeter, Skeleton, StatusBadge } from './common';
import { Icon } from './Icon';

interface Props {
  assetId?: string; // undefined = create
  sites: Site[];
  users: User[];
  defaultSiteId: string;
}

interface FormState {
  name: string;
  tag: string;
  serial: string;
  category: string;
  status: string;
  siteId: string;
  assignedToId: string;
  purchaseDate: string;
  purchaseCost: string;
  notes: string;
}

function toForm(a?: Asset, defaultSiteId = ''): FormState {
  return {
    name: a?.cr_assetname ?? '',
    tag: a?.cr_assettag ?? '',
    serial: a?.cr_serialnumber ?? '',
    category: a?.cr_category != null ? String(a.cr_category) : '',
    status: a?.cr_status != null ? String(a.cr_status) : a ? '' : '100000000',
    siteId: a ? (a._cr_site_value ?? '') : defaultSiteId,
    assignedToId: a?._cr_assignedto_value ?? '',
    purchaseDate: toDateInput(a?.cr_purchasedate),
    purchaseCost: a?.cr_purchasecost != null ? String(a.cr_purchasecost) : '',
    notes: a?.cr_notes ?? '',
  };
}

function toEditable(f: FormState): AssetEditable {
  const text = (s: string) => (s.trim() ? s.trim() : null);
  return {
    cr_assetname: f.name.trim(),
    cr_assettag: text(f.tag),
    cr_serialnumber: text(f.serial),
    cr_category: f.category ? (Number(f.category) as AssetEditable['cr_category']) : null,
    cr_status: f.status ? (Number(f.status) as AssetEditable['cr_status']) : null,
    // Date-only: anchor at midday so no timezone shifts the calendar day.
    cr_purchasedate: f.purchaseDate ? new Date(`${f.purchaseDate}T12:00:00`).toISOString() : null,
    cr_purchasecost: f.purchaseCost ? Number(f.purchaseCost) : null,
    cr_notes: text(f.notes),
    siteId: f.siteId || null,
    assignedToId: f.assignedToId || null,
  };
}

const sameForm = (a: FormState, b: FormState) =>
  (Object.keys(a) as (keyof FormState)[]).every((k) => a[k] === b[k]);

export function AssetDetail({ assetId, sites, users, defaultSiteId }: Props) {
  const isNew = !assetId;
  const [asset, setAsset] = useState<Asset>();
  const [baseline, setBaseline] = useState<FormState>(() => toForm(undefined, defaultSiteId));
  const [form, setForm] = useState<FormState>(baseline);
  const [checks, setChecks] = useState<ConditionCheck[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [nameError, setNameError] = useState<string>();
  const [savedAt, setSavedAt] = useState<number>();
  const [attempt, setAttempt] = useState(0);
  const [flash] = useState(() => (assetId ? peekFlash(assetId) : undefined));
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (flash) clearFlash();
  }, [flash]);

  useEffect(() => {
    if (!assetId) return;
    // Component is keyed by asset id in App, so initial state is already "loading".
    let cancelled = false;
    Promise.all([getAsset(assetId), listConditionChecks(assetId)])
      .then(([a, c]) => {
        if (cancelled) return;
        const loaded = toForm(a);
        setAsset(a);
        setBaseline(loaded);
        setForm(loaded);
        setChecks(c);
      })
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [assetId, attempt]);

  function retry() {
    setError(undefined);
    setLoading(true);
    setAttempt((n) => n + 1);
  }

  const dirty = !sameForm(form, baseline);

  const set = (key: keyof FormState) => (e: { target: { value: string } }) => {
    setSavedAt(undefined);
    if (key === 'name') setNameError(undefined);
    setForm((f) => ({ ...f, [key]: e.target.value }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setNameError('Give the asset a name so people can find it.');
      nameRef.current?.focus();
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      if (isNew) {
        const created = await createAsset(toEditable(form));
        setFlash({ assetId: created.cr_assetid, text: 'Asset created.' });
        navigate({ name: 'asset', id: created.cr_assetid });
      } else {
        await updateAsset(assetId, toEditable(form));
        const fresh = await getAsset(assetId);
        const saved = toForm(fresh);
        setAsset(fresh);
        setBaseline(saved);
        setForm(saved);
        setSavedAt(Date.now());
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <DetailSkeleton />;
  if (!isNew && !asset) {
    return (
      <section className="page">
        <BackToList />
        <Alert
          focus
          action={
            <button type="button" className="btn btn-quiet btn-sm" onClick={retry}>
              <Icon name="retry" />
              Try again
            </button>
          }
        >
          <strong>Couldn’t open this asset.</strong> {error ?? 'It may have been removed.'}
        </Alert>
      </section>
    );
  }

  const siteName = sites.find((s) => s.cr_siteid === asset?._cr_site_value)?.cr_sitename ?? asset?.cr_sitename;

  return (
    <section className={isNew ? 'page is-form-page' : 'page'} aria-labelledby="detail-title">
      <BackToList />
      <header className="page-header">
        <div className="page-title">
          <h1 id="detail-title">{isNew ? 'New asset' : asset!.cr_assetname}</h1>
          {isNew ? (
            <p className="page-sub">Name is all you need to start. Everything else can be filled in later.</p>
          ) : (
            <p className="page-meta">
              {asset!.cr_assettag && (
                <span className="chip mono">
                  <Icon name="tag" size={14} />
                  {asset!.cr_assettag}
                </span>
              )}
              <StatusBadge value={asset!.cr_status} />
              {siteName && (
                <span className="meta-item">
                  <Icon name="pin" size={14} />
                  {siteName}
                </span>
              )}
            </p>
          )}
        </div>
        {!isNew && (
          <a className="btn btn-primary" href={href({ name: 'check', id: assetId })}>
            <Icon name="clipboard" />
            Record check
          </a>
        )}
      </header>

      {flash && (
        <Alert kind="success" focus>
          {flash.text}
        </Alert>
      )}

      <div className={isNew ? 'detail-layout is-new' : 'detail-layout'}>
        {!isNew && (
          <aside className="pane condition-pane" aria-labelledby="condition-title">
            <h2 id="condition-title">Condition</h2>
            <div className="condition-now">
              <RatingMeter value={asset!.cr_conditionrating} showLabel />
              <p className="muted">
                {asset!.cr_lastchecked ? (
                  <>
                    Checked <span className="num">{formatDate(asset!.cr_lastchecked)}</span> ·{' '}
                    {formatRelative(asset!.cr_lastchecked)}
                  </>
                ) : (
                  'Never checked'
                )}
              </p>
            </div>
            <h3>Recent checks</h3>
            {checks.length === 0 ? (
              <p className="muted history-empty">No checks yet. Record one to start the history.</p>
            ) : (
              <ol className="history">
                {checks.map((c, i) => (
                  <li key={c.cr_conditioncheckid} className={flash && i === 0 ? 'is-new' : undefined}>
                    <div className="history-head">
                      <time className="num" dateTime={c.cr_checkdate ?? c.createdon}>
                        {formatDate(c.cr_checkdate ?? c.createdon)}
                      </time>
                      <RatingMeter value={c.cr_conditionrating} />
                    </div>
                    {c.cr_comments && <p className="history-note">{c.cr_comments}</p>}
                    {c.cr_checkedbyname && <p className="history-by">by {c.cr_checkedbyname}</p>}
                  </li>
                ))}
              </ol>
            )}
          </aside>
        )}

        <form className="pane form" onSubmit={onSubmit} noValidate aria-labelledby="details-title">
          <h2 id="details-title">Details</h2>
          {error && (
            <Alert focus>
              <strong>Changes not saved.</strong> {error}
            </Alert>
          )}

          <fieldset className="group">
            <legend>
              Identity
              <span className="legend-desc">How people find and recognise it.</span>
            </legend>
            <div className="form-grid">
              <Field label="Asset name" htmlFor="f-name" wide required error={nameError}>
                <input
                  ref={nameRef}
                  id="f-name"
                  value={form.name}
                  onChange={set('name')}
                  maxLength={850}
                  required
                  aria-invalid={nameError ? true : undefined}
                  aria-describedby={nameError ? 'f-name-error' : undefined}
                  autoComplete="off"
                />
              </Field>
              <Field label="Asset tag" htmlFor="f-tag">
                <input id="f-tag" className="mono" value={form.tag} onChange={set('tag')} maxLength={100} autoComplete="off" />
              </Field>
              <Field label="Serial number" htmlFor="f-serial">
                <input
                  id="f-serial"
                  className="mono"
                  value={form.serial}
                  onChange={set('serial')}
                  maxLength={100}
                  autoComplete="off"
                />
              </Field>
              <Field label="Category" htmlFor="f-category">
                <div className="select-wrap">
                  <select id="f-category" value={form.category} onChange={set('category')}>
                    <option value="">Not set</option>
                    {categoryOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>
            </div>
          </fieldset>

          <fieldset className="group">
            <legend>
              Where and who
              <span className="legend-desc">Its site, status and current holder.</span>
            </legend>
            <div className="form-grid">
              <Field label="Status" htmlFor="f-status">
                <div className="select-wrap">
                  <select id="f-status" value={form.status} onChange={set('status')}>
                    <option value="">Not set</option>
                    {statusOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>
              <Field label="Site" htmlFor="f-site">
                <div className="select-wrap">
                  <select id="f-site" value={form.siteId} onChange={set('siteId')}>
                    <option value="" disabled={!isNew && !!asset?._cr_site_value}>
                      Select a site
                    </option>
                    {sites.map((s) => (
                      <option key={s.cr_siteid} value={s.cr_siteid}>
                        {s.cr_sitename}
                        {s.cr_city ? ` · ${s.cr_city}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>
              <Field label="Assigned to" htmlFor="f-assigned" wide>
                <div className="select-wrap">
                  <select id="f-assigned" value={form.assignedToId} onChange={set('assignedToId')}>
                    <option value="">Unassigned</option>
                    {/* Keep the current assignee selectable even if they're outside the loaded list. */}
                    {form.assignedToId && !users.some((u) => u.systemuserid === form.assignedToId) && (
                      <option value={form.assignedToId}>{asset?.cr_assignedtoname ?? 'Current assignee'}</option>
                    )}
                    {users.map((u) => (
                      <option key={u.systemuserid} value={u.systemuserid}>
                        {u.fullname}
                        {u.internalemailaddress ? ` · ${u.internalemailaddress}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>
            </div>
          </fieldset>

          <fieldset className="group">
            <legend>
              Purchase and notes
              <span className="legend-desc">Optional records for finance and handover.</span>
            </legend>
            <div className="form-grid">
              <Field label="Purchase date" htmlFor="f-pdate">
                <input
                  id="f-pdate"
                  type="date"
                  value={form.purchaseDate}
                  max={todayInput()}
                  onChange={set('purchaseDate')}
                />
              </Field>
              <Field label="Purchase cost" htmlFor="f-pcost">
                <input
                  id="f-pcost"
                  className="num"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={form.purchaseCost}
                  onChange={set('purchaseCost')}
                />
              </Field>
              <Field label="Notes" htmlFor="f-notes" wide hint={`${form.notes.length}/100`}>
                <textarea
                  id="f-notes"
                  rows={3}
                  value={form.notes}
                  onChange={set('notes')}
                  maxLength={100}
                  aria-describedby="f-notes-hint"
                />
              </Field>
            </div>
          </fieldset>

          {/* On phones the bar pins to the bottom only while there's something to save or confirm. */}
          <div className={isNew || dirty || savedAt ? 'action-bar is-pinned' : 'action-bar'}>
            <p className="action-status" role="status">
              {savedAt ? (
                <span className="saved">
                  <Icon name="check" />
                  Changes saved
                </span>
              ) : dirty && !isNew ? (
                'Unsaved changes'
              ) : null}
            </p>
            <a className="btn" href={href({ name: 'list' })}>
              Cancel
            </a>
            <button
              className={isNew || dirty ? 'btn btn-primary' : 'btn'}
              type="submit"
              disabled={saving}
            >
              {saving ? 'Saving…' : isNew ? 'Create asset' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <section className="page" aria-busy="true">
      <span className="sr-only" role="status">
        Loading asset…
      </span>
      <Skeleton size="xs" />
      <div className="page-title">
        <Skeleton size="lg" tall />
        <Skeleton size="md" />
      </div>
      <div className="detail-layout">
        <div className="pane skeleton-pane">
          <Skeleton size="sm" />
          <Skeleton size="md" tall />
          <Skeleton size="full" />
          <Skeleton size="lg" />
        </div>
        <div className="pane skeleton-pane">
          <Skeleton size="sm" />
          <Skeleton size="full" tall />
          <Skeleton size="full" tall />
          <Skeleton size="full" tall />
        </div>
      </div>
    </section>
  );
}
