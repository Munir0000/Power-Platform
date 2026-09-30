/**
 * DEV-ONLY sample data. Never imported by application code: vite.config.ts swaps
 * `src/data/assetRegister.ts` for this module only under `vite --mode sample`
 * (npm run dev:sample), so it cannot reach a production build.
 *
 * Same exports as the real data layer. Add `?state=` before the hash to see other states:
 *   ?state=loading  asset requests never resolve
 *   ?state=empty    no assets
 *   ?state=error    asset requests fail
 *   ?state=slow     1.5s latency
 */
import type {
  Asset,
  AssetEditable,
  AssetPage,
  AssetQuery,
  ConditionCheck,
  NewConditionCheck,
  OverviewLists,
  OverviewTotals,
  Site,
  User,
} from '../data/assetRegister';

export const ATTENTION_MAX_RATING = 2;
export const OVERVIEW_LIST_SIZE = 6;

export type {
  Asset,
  AssetEditable,
  AssetPage,
  AssetQuery,
  ConditionCheck,
  NewConditionCheck,
  OverviewLists,
  OverviewTotals,
  SiteStats,
  Site,
  User,
} from '../data/assetRegister';
export {
  Cr_assetscr_category as AssetCategory,
  Cr_assetscr_status as AssetStatus,
} from '../generated/models/Cr_assetsModel';

const state = new URLSearchParams(window.location.search).get('state') ?? '';
const LATENCY_MS = state === 'slow' ? 1500 : 250;
const PAGE_SIZE = 50;
const DAY_MS = 86_400_000;

console.info(`[sample data] active${state ? ` (state=${state})` : ''}. This never ships in a production build.`);

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

const never = <T>() => new Promise<T>(() => undefined);

function fail<T>(): Promise<T> {
  return new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error('Dataverse returned 503 Service Unavailable. Check your connection and try again.')),
      LATENCY_MS,
    ),
  );
}

// Deterministic pseudo-random so screenshots are stable run to run.
let seed = 42;
function rand(): number {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
const pick = <T>(list: readonly T[]): T => list[Math.floor(rand() * list.length)];
const guid = (n: number) => `00000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;

const sites = [
  { cr_siteid: guid(1), cr_sitename: 'Riyadh HQ', cr_sitecode: 'RUH', cr_city: 'Riyadh' },
  { cr_siteid: guid(2), cr_sitename: 'Jeddah Office', cr_sitecode: 'JED', cr_city: 'Jeddah' },
  { cr_siteid: guid(3), cr_sitename: 'Dammam Warehouse', cr_sitecode: 'DMM', cr_city: 'Dammam' },
] as Site[];

const users = [
  'Noura Al-Harbi',
  'Omar Khalid',
  'Sara Al-Qahtani',
  'Faisal Al-Otaibi',
  'Lina Haddad',
  'Yousef Al-Shehri',
  'Maha Al-Dosari',
  'Khalid Mansour',
].map((fullname, i) => ({
  systemuserid: guid(100 + i),
  fullname,
  internalemailaddress: `${fullname.split(' ')[0].toLowerCase()}@contoso.example`,
})) as User[];

const MODELS: [number, string, string][] = [
  [100000000, 'Laptop', 'Dell Latitude 7440'],
  [100000000, 'Laptop', 'Lenovo ThinkPad T14 Gen 4'],
  [100000000, 'Laptop', 'MacBook Pro 14"'],
  [100000001, 'Monitor', 'Dell UltraSharp U2723QE'],
  [100000001, 'Monitor', 'LG 27UP850 27" 4K'],
  [100000002, 'Peripheral', 'Logitech MX Keys'],
  [100000002, 'Peripheral', 'Jabra Evolve2 65 Headset'],
  [100000003, 'AV', 'Epson EB-L630U Projector'],
  [100000003, 'AV', 'Poly Studio X50 Video Bar'],
  [100000004, 'Tool', 'Fluke 117 Multimeter'],
  [100000004, 'Tool', 'Bosch GSR 18V Drill'],
  [100000005, 'Furniture', 'Herman Miller Aeron Chair'],
  [100000005, 'Furniture', 'Sit-stand Desk 160cm'],
];

const PREFIX: Record<string, string> = {
  Laptop: 'LT',
  Monitor: 'MN',
  Peripheral: 'PR',
  AV: 'AV',
  Tool: 'TL',
  Furniture: 'FN',
};

const COMMENTS = [
  'Minor scuffs on lid, otherwise fine.',
  'Battery holds about 3 hours.',
  'Screen has one dead pixel near the corner.',
  'Cable replaced, working normally.',
  'Hinge is loose. Logged for repair.',
  'Like new, still in original packaging.',
  'Fan noisy under load.',
  '',
  '',
];

const now = Date.now();
const assets: Asset[] = [];
const checks: ConditionCheck[] = [];
let checkSeq = 1;

for (let i = 1; i <= 72; i++) {
  const [category, kind, model] = pick(MODELS);
  const site = pick(sites);
  const status = i % 11 === 0 ? 100000003 : i % 7 === 0 ? 100000002 : rand() > 0.45 ? 100000001 : 100000000;
  const assignee = status === 100000001 ? pick(users) : undefined;
  const lastChecked = rand() > 0.08 ? new Date(now - Math.floor(rand() * 420) * DAY_MS).toISOString() : undefined;
  const rating = lastChecked ? (status === 100000002 ? pick([1, 2]) : pick([2, 3, 3, 4, 4, 4, 5, 5])) : undefined;
  const id = guid(1000 + i);
  const name = i === 5 ? `${model} with docking station, charger and spare battery (Finance team)` : model;

  assets.push({
    cr_assetid: id,
    cr_assetname: name,
    cr_assettag: `${PREFIX[kind]}-${String(1000 + i * 7).padStart(5, '0')}`,
    cr_serialnumber: rand() > 0.2 ? Math.floor(rand() * 36 ** 8).toString(36).toUpperCase().padStart(8, 'X') : undefined,
    cr_category: category,
    cr_status: status,
    cr_conditionrating: rating,
    cr_lastchecked: lastChecked,
    cr_purchasedate: new Date(now - Math.floor(400 + rand() * 1200) * DAY_MS).toISOString(),
    cr_purchasecost: Math.round((150 + rand() * 4200) * 100) / 100,
    cr_notes: i % 4 === 0 ? 'Keep with the room booking kit.' : undefined,
    _cr_site_value: site.cr_siteid,
    cr_sitename: site.cr_sitename,
    _cr_assignedto_value: assignee?.systemuserid,
    cr_assignedtoname: assignee?.fullname,
    statecode: 0,
  } as Asset);

  if (lastChecked && rating) {
    const count = 1 + Math.floor(rand() * 4);
    for (let c = 0; c < count; c++) {
      const date = new Date(new Date(lastChecked).getTime() - c * (60 + Math.floor(rand() * 90)) * DAY_MS);
      const by = pick(users);
      checks.push({
        cr_conditioncheckid: guid(5000 + checkSeq++),
        cr_checkname: `${name} – ${date.toISOString().slice(0, 10)}`,
        cr_checkdate: date.toISOString(),
        cr_conditionrating: c === 0 ? rating : Math.min(5, rating + Math.floor(rand() * 2)),
        cr_comments: pick(COMMENTS) || undefined,
        _cr_asset_value: id,
        _cr_checkedby_value: by.systemuserid,
        cr_checkedbyname: by.fullname,
      } as ConditionCheck);
    }
  }
}

// ---------- Same API as src/data/assetRegister.ts ----------

export function listSites(): Promise<Site[]> {
  return delay([...sites]);
}

export function listUsers(): Promise<User[]> {
  return delay([...users]);
}

export function getCurrentUserId(): Promise<string | undefined> {
  return delay(users[0].systemuserid);
}

export function listAssets(query: AssetQuery, skipToken?: string): Promise<AssetPage> {
  if (state === 'loading') return never();
  if (state === 'error') return fail();
  if (state === 'empty') return delay({ items: [] });
  const term = query.search?.trim().toLowerCase();
  const matches = [...assets]
    .filter((a) => !query.siteId || a._cr_site_value === query.siteId)
    .filter(
      (a) =>
        !term ||
        [a.cr_assetname, a.cr_assettag, a.cr_serialnumber].some((v) => v?.toLowerCase().startsWith(term)),
    )
    .sort((a, b) => a.cr_assetname.localeCompare(b.cr_assetname));
  const start = Number(skipToken ?? 0);
  const end = start + PAGE_SIZE;
  return delay({
    items: matches.slice(start, end),
    nextToken: end < matches.length ? String(end) : undefined,
  });
}

export function getAsset(id: string): Promise<Asset> {
  if (state === 'loading') return never();
  if (state === 'error') return fail();
  const found = assets.find((a) => a.cr_assetid === id);
  return found ? delay({ ...found }) : Promise.reject(new Error('Asset not found.'));
}

function apply(target: Asset, values: AssetEditable): void {
  const { siteId, assignedToId, ...fields } = values;
  Object.assign(target, fields);
  if (siteId) {
    target._cr_site_value = siteId;
    target.cr_sitename = sites.find((s) => s.cr_siteid === siteId)?.cr_sitename;
  }
  target._cr_assignedto_value = assignedToId ?? undefined;
  target.cr_assignedtoname = users.find((u) => u.systemuserid === assignedToId)?.fullname;
}

export function updateAsset(id: string, values: AssetEditable): Promise<Asset> {
  const target = assets.find((a) => a.cr_assetid === id);
  if (!target) return Promise.reject(new Error('Asset not found.'));
  apply(target, values);
  return delay({ ...target });
}

export function createAsset(values: AssetEditable): Promise<Asset> {
  const created = { cr_assetid: guid(9000 + assets.length), statecode: 0 } as Asset;
  apply(created, values);
  assets.push(created);
  return delay({ ...created });
}

export function listConditionChecks(assetId: string): Promise<ConditionCheck[]> {
  return delay(
    checks
      .filter((c) => c._cr_asset_value === assetId)
      .sort((a, b) => (b.cr_checkdate ?? '').localeCompare(a.cr_checkdate ?? ''))
      .slice(0, 20),
  );
}

export function addConditionCheck(check: NewConditionCheck): Promise<ConditionCheck> {
  const checkDate = new Date(`${check.checkDate}T12:00:00`).toISOString();
  const by = users.find((u) => u.systemuserid === check.checkedById);
  const created = {
    cr_conditioncheckid: guid(5000 + checkSeq++),
    cr_checkname: `${check.assetName} – ${check.checkDate}`,
    cr_checkdate: checkDate,
    cr_conditionrating: check.rating,
    cr_comments: check.comments || undefined,
    _cr_asset_value: check.assetId,
    _cr_checkedby_value: by?.systemuserid,
    cr_checkedbyname: by?.fullname,
  } as ConditionCheck;
  checks.push(created);
  const asset = assets.find((a) => a.cr_assetid === check.assetId);
  if (asset) {
    asset.cr_conditionrating = check.rating;
    asset.cr_lastchecked = checkDate;
  }
  return delay(created);
}

// Overview mirrors: the real module answers these with $count and filtered queries.
export function getOverviewTotals(siteIds: string[]): Promise<OverviewTotals> {
  if (state === 'loading') return never();
  if (state === 'error') return fail();
  const active = state === 'empty' ? [] : assets;
  const attention = (a: Asset) => a.cr_conditionrating != null && a.cr_conditionrating <= ATTENTION_MAX_RATING;
  return delay({
    total: active.length,
    attention: active.filter(attention).length,
    sites: siteIds.map((id) => {
      const items = active.filter((a) => a._cr_site_value === id);
      const ratings = [1, 2, 3, 4, 5].map((r) => items.filter((a) => a.cr_conditionrating === r).length);
      return {
        siteId: id,
        total: items.length,
        inRepair: items.filter((a) => a.cr_status === 100000002).length,
        ratings,
        unrated: items.filter((a) => a.cr_conditionrating == null).length,
        attention: ratings[0] + ratings[1],
      };
    }),
  });
}

export function getOverviewLists(siteId?: string): Promise<OverviewLists> {
  if (state === 'loading') return never();
  if (state === 'error') return fail();
  const scoped = (state === 'empty' ? [] : assets).filter((a) => !siteId || a._cr_site_value === siteId);
  const attention = scoped
    .filter((a) => a.cr_conditionrating != null && a.cr_conditionrating <= ATTENTION_MAX_RATING)
    .sort(
      (a, b) =>
        (a.cr_conditionrating ?? 0) - (b.cr_conditionrating ?? 0) ||
        (a.cr_lastchecked ?? '').localeCompare(b.cr_lastchecked ?? ''),
    );
  const recent = scoped
    .filter((a) => a.cr_lastchecked)
    .sort((a, b) => (b.cr_lastchecked ?? '').localeCompare(a.cr_lastchecked ?? ''));
  return delay({
    attention: attention.slice(0, OVERVIEW_LIST_SIZE),
    attentionTotal: attention.length,
    recent: recent.slice(0, OVERVIEW_LIST_SIZE),
  });
}
