import { useEffect, useState, type FormEvent } from 'react';
import { addConditionCheck, getAsset, type Asset, type User } from '../data/assetRegister';
import { setFlash } from '../lib/flash';
import { errorMessage, formatDate, formatRelative, ratingHint, ratingLabel, todayInput } from '../lib/format';
import { href, navigate } from '../lib/router';
import { Alert, BackLink, BackToList, Field, RatingInput, RatingMeter, Skeleton, StatusBadge } from './common';
import { Icon } from './Icon';

interface Props {
  assetId: string;
  users: User[];
  currentUserId?: string;
}

export function ConditionCheckForm({ assetId, users, currentUserId }: Props) {
  const [asset, setAsset] = useState<Asset>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [ratingError, setRatingError] = useState<string>();
  const [checkDate, setCheckDate] = useState(todayInput());
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');
  const [attempt, setAttempt] = useState(0);
  // Undefined until the user picks someone; falls back to the signed-in user.
  const [checkedByChoice, setCheckedByChoice] = useState<string>();
  const checkedById = checkedByChoice ?? currentUserId ?? '';

  useEffect(() => {
    let cancelled = false;
    getAsset(assetId)
      .then((a) => !cancelled && setAsset(a))
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [assetId, attempt]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!asset) return;
    if (rating < 1) {
      setRatingError('Choose a rating from 1 to 5.');
      document.getElementById('rating-legend')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      (document.querySelector('input[name="rating"]') as HTMLInputElement | null)?.focus({ preventScroll: true });
      return;
    }
    if (!checkDate || checkDate > todayInput()) {
      setError('The check date must be today or earlier.');
      return;
    }
    setSaving(true);
    setError(undefined);
    try {
      await addConditionCheck({
        assetId,
        assetName: asset.cr_assetname,
        checkDate,
        rating,
        comments: comments.trim(),
        checkedById: checkedById || undefined,
      });
      setFlash({ assetId, text: `Check saved · ${rating} ${ratingLabel(rating)}.` });
      navigate({ name: 'asset', id: assetId });
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  }

  if (loading) return <CheckSkeleton />;

  if (!asset) {
    return (
      <section className="page narrow">
        <BackToList />
        <Alert
          focus
          action={
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() => {
                setError(undefined);
                setLoading(true);
                setAttempt((n) => n + 1);
              }}
            >
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

  return (
    <section className="page narrow" aria-labelledby="check-title">
      <BackLink to={href({ name: 'asset', id: assetId })} label="Asset details" />
      <header className="page-header">
        <div className="page-title">
          <h1 id="check-title">Condition check</h1>
          <p className="page-meta">
            <strong className="meta-strong">{asset.cr_assetname}</strong>
            {asset.cr_assettag && <span className="chip mono">{asset.cr_assettag}</span>}
            <StatusBadge value={asset.cr_status} />
          </p>
        </div>
      </header>

      <form className="pane form check-form" onSubmit={onSubmit} noValidate>
        <div className="previous">
          <span className="previous-label">Last check</span>
          <RatingMeter value={asset.cr_conditionrating} showLabel />
          {asset.cr_lastchecked && (
            <span className="muted">
              <span className="num">{formatDate(asset.cr_lastchecked)}</span> · {formatRelative(asset.cr_lastchecked)}
            </span>
          )}
        </div>

        {error && (
          <Alert focus>
            <strong>Check not saved.</strong> {error}
          </Alert>
        )}

        <fieldset className={`rating-field${ratingError ? ' has-error' : ''}`}>
          <legend id="rating-legend">
            How is it holding up? <span className="field-req">Required</span>
          </legend>
          <RatingInput
            name="rating"
            value={rating}
            onChange={(v) => {
              setRating(v);
              setRatingError(undefined);
            }}
            describedBy="rating-hint"
          />
          {ratingError ? (
            <p className="field-error" id="rating-hint">
              <Icon name="alert" size={14} />
              {ratingError}
            </p>
          ) : (
            <p className="rating-hint" id="rating-hint" aria-live="polite">
              {ratingHint(rating)}
            </p>
          )}
        </fieldset>

        <div className="form-grid">
          <Field label="Check date" htmlFor="c-date" required>
            <input
              id="c-date"
              type="date"
              value={checkDate}
              max={todayInput()}
              onChange={(e) => setCheckDate(e.target.value)}
              required
            />
          </Field>
          <Field label="Checked by" htmlFor="c-by">
            <div className="select-wrap">
              <select id="c-by" value={checkedById} onChange={(e) => setCheckedByChoice(e.target.value)}>
                <option value="">Not recorded</option>
                {users.map((u) => (
                  <option key={u.systemuserid} value={u.systemuserid}>
                    {u.fullname}
                  </option>
                ))}
              </select>
            </div>
          </Field>
          <Field label="Comments" htmlFor="c-comments" wide hint={`${comments.length}/100`}>
            <textarea
              id="c-comments"
              rows={3}
              maxLength={100}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Scratches, missing parts, battery health…"
              aria-describedby="c-comments-hint"
            />
          </Field>
        </div>

        <div className="action-bar is-pinned">
          <a className="btn" href={href({ name: 'asset', id: assetId })}>
            Cancel
          </a>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save check'}
          </button>
        </div>
      </form>
    </section>
  );
}

function CheckSkeleton() {
  return (
    <section className="page narrow" aria-busy="true">
      <span className="sr-only" role="status">
        Loading asset…
      </span>
      <Skeleton size="sm" />
      <div className="page-title">
        <Skeleton size="md" tall />
        <Skeleton size="lg" />
      </div>
      <div className="pane skeleton-pane">
        <Skeleton size="md" />
        <Skeleton size="full" tall />
        <Skeleton size="lg" />
        <Skeleton size="full" tall />
      </div>
    </section>
  );
}
