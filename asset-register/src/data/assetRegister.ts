/**
 * App-facing data access for the Asset Register.
 *
 * Every Dataverse call goes through the generated services in `src/generated`.
 * This module only shapes queries (OData $filter/$select/$orderby), unwraps
 * IOperationResult, and builds lookup binds — it never talks HTTP directly.
 */
import {
  Cr_assetsService,
  Cr_conditionchecksService,
  Cr_sitesService,
  SystemusersService,
} from '../generated';
import { getContext } from '@microsoft/power-apps/app';
import type { Cr_assets, Cr_assetsBase } from '../generated/models/Cr_assetsModel';
import type { Cr_conditionchecks, Cr_conditionchecksBase } from '../generated/models/Cr_conditionchecksModel';
import type { Cr_sites } from '../generated/models/Cr_sitesModel';
import type { Systemusers } from '../generated/models/SystemusersModel';
import type { IGetAllOptions } from '../generated/models/CommonModels';
import type { IOperationResult } from '@microsoft/power-apps/data';

export type Asset = Cr_assets;
export type Site = Cr_sites;
export type ConditionCheck = Cr_conditionchecks;
export type User = Pick<Systemusers, 'systemuserid' | 'fullname' | 'internalemailaddress'>;

export {
  Cr_assetscr_category as AssetCategory,
  Cr_assetscr_status as AssetStatus,
} from '../generated/models/Cr_assetsModel';

/**
 * Fields the Asset Detail form can edit. `null` clears a column.
 * `siteId` / `assignedToId` are translated into @odata.bind. Site can be changed
 * but not cleared; Assigned To can be cleared (bind set to null).
 */
export interface AssetEditable {
  cr_assetname: string;
  cr_assettag: string | null;
  cr_serialnumber: string | null;
  cr_category: Cr_assetsBase['cr_category'] | null;
  cr_status: Cr_assetsBase['cr_status'] | null;
  cr_purchasedate: string | null;
  cr_purchasecost: number | null;
  cr_notes: string | null;
  siteId: string | null;
  assignedToId: string | null;
}

export interface NewConditionCheck {
  assetId: string;
  assetName: string;
  checkDate: string; // ISO date (yyyy-mm-dd)
  rating: number;
  comments?: string;
  checkedById?: string;
}

const ASSET_LIST_COLUMNS = [
  'cr_assetid',
  'cr_assetname',
  'cr_assettag',
  'cr_serialnumber',
  'cr_category',
  'cr_status',
  'cr_conditionrating',
  'cr_lastchecked',
  '_cr_site_value',
  '_cr_assignedto_value',
];

/** Everything the Asset Detail and Condition Check screens read. */
const ASSET_DETAIL_COLUMNS = [
  'cr_assetid',
  'cr_assetname',
  'cr_assettag',
  'cr_serialnumber',
  'cr_category',
  'cr_status',
  'cr_conditionrating',
  'cr_lastchecked',
  'cr_purchasedate',
  'cr_purchasecost',
  'cr_notes',
  '_cr_site_value',
  '_cr_assignedto_value',
];

/** Rows on the Overview lists: name, ids, site and condition only. */
const OVERVIEW_LIST_COLUMNS = [
  'cr_assetid',
  'cr_assetname',
  'cr_assettag',
  'cr_conditionrating',
  'cr_lastchecked',
  '_cr_site_value',
];

/** Condition history: date (createdon is the fallback), rating, comment, who. */
const CHECK_COLUMNS = [
  'cr_conditioncheckid',
  'cr_checkdate',
  'createdon',
  'cr_conditionrating',
  'cr_comments',
  '_cr_checkedby_value',
];

const PAGE_SIZE = 50;
const ACTIVE = 'statecode eq 0';
const IN_REPAIR = 100000002;
export const ATTENTION_MAX_RATING = 2;
export const OVERVIEW_LIST_SIZE = 6;

function unwrap<T>(result: IOperationResult<T>, action: string): T {
  if (!result.success) {
    const detail = result.error?.message ?? 'Unknown error';
    throw new Error(`${action} failed: ${detail}`);
  }
  return result.data;
}

/**
 * The SDK sends `$count=true` and returns `result.count`, but the generated
 * IGetAllOptions type predates that option, so it's added here.
 */
type CountableOptions = IGetAllOptions & { count?: boolean };

/**
 * Server-side row count for a filter: one row per page, `$count=true`.
 * Dataverse caps @odata.count at 5,000.
 */
async function countAssets(filter: string): Promise<number> {
  const options: CountableOptions = { select: ['cr_assetid'], filter, maxPageSize: 1, count: true };
  const result = await Cr_assetsService.getAll(options as IGetAllOptions);
  unwrap(result, 'Counting assets');
  return result.count ?? 0;
}

/** Escape a user-typed value for use inside an OData string literal. */
function odataString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertGuid(id: string): string {
  if (!GUID.test(id)) throw new Error(`Invalid id: ${id}`);
  return id;
}

// ---------- Sites ----------

export async function listSites(): Promise<Site[]> {
  const result = await Cr_sitesService.getAll({
    select: ['cr_siteid', 'cr_sitename', 'cr_sitecode', 'cr_city'],
    filter: 'statecode eq 0',
    orderBy: ['cr_sitename asc'],
  });
  return unwrap(result, 'Loading sites') ?? [];
}

// ---------- Users ----------

/** Enabled, interactive (Read-Write access) people — excludes app/service accounts. */
export async function listUsers(): Promise<User[]> {
  const result = await SystemusersService.getAll({
    select: ['systemuserid', 'fullname', 'internalemailaddress'],
    filter: 'isdisabled eq false and accessmode eq 0 and applicationid eq null',
    orderBy: ['fullname asc'],
    top: 500,
  });
  return unwrap(result, 'Loading users') ?? [];
}

/** Resolves the signed-in Entra ID user to their Dataverse systemuserid, if possible. */
export async function getCurrentUserId(): Promise<string | undefined> {
  const { user } = await getContext();
  if (!user.objectId || !GUID.test(user.objectId)) return undefined;
  const result = await SystemusersService.getAll({
    select: ['systemuserid'],
    filter: `azureactivedirectoryobjectid eq ${user.objectId}`,
    top: 1,
  });
  return unwrap(result, 'Resolving current user')?.[0]?.systemuserid;
}

// ---------- Assets ----------

export interface AssetQuery {
  search?: string;
  siteId?: string; // empty/undefined = all sites
}

export interface AssetPage {
  items: Asset[];
  nextToken?: string;
}

export async function listAssets(query: AssetQuery, skipToken?: string): Promise<AssetPage> {
  const clauses = ['statecode eq 0'];
  if (query.siteId) clauses.push(`_cr_site_value eq ${assertGuid(query.siteId)}`);
  const term = query.search?.trim();
  if (term) {
    // startswith() is index-friendly; contains() forces a scan on large tables.
    const t = odataString(term);
    clauses.push(
      `(startswith(cr_assettag,${t}) or startswith(cr_assetname,${t}) or startswith(cr_serialnumber,${t}))`,
    );
  }
  const result = await Cr_assetsService.getAll({
    select: ASSET_LIST_COLUMNS,
    filter: clauses.join(' and '),
    orderBy: ['cr_assetname asc'],
    maxPageSize: PAGE_SIZE,
    skipToken,
  });
  return { items: unwrap(result, 'Loading assets') ?? [], nextToken: result.skipToken };
}

export async function getAsset(id: string): Promise<Asset> {
  return unwrap(await Cr_assetsService.get(assertGuid(id), { select: ASSET_DETAIL_COLUMNS }), 'Loading asset');
}

// ---------- Overview (all aggregation happens in Dataverse) ----------

export interface SiteStats {
  siteId: string;
  total: number;
  inRepair: number;
  /** Count of assets at ratings 1..5 (index 0 = rating 1). */
  ratings: number[];
  unrated: number;
  attention: number;
}

export interface OverviewTotals {
  total: number;
  attention: number;
  sites: SiteStats[];
}

/** Per-site counts via `$count` queries run in parallel: 8 per site plus 2 totals. */
export async function getOverviewTotals(siteIds: string[]): Promise<OverviewTotals> {
  const attentionFilter = `${ACTIVE} and cr_conditionrating le ${ATTENTION_MAX_RATING}`;
  const [total, attention, sites] = await Promise.all([
    countAssets(ACTIVE),
    countAssets(attentionFilter),
    Promise.all(
      siteIds.map(async (id) => {
        const site = `${ACTIVE} and _cr_site_value eq ${assertGuid(id)}`;
        const [siteTotal, inRepair, unrated, ...ratings] = await Promise.all([
          countAssets(site),
          countAssets(`${site} and cr_status eq ${IN_REPAIR}`),
          countAssets(`${site} and cr_conditionrating eq null`),
          ...[1, 2, 3, 4, 5].map((r) => countAssets(`${site} and cr_conditionrating eq ${r}`)),
        ]);
        return {
          siteId: id,
          total: siteTotal,
          inRepair,
          ratings,
          unrated,
          attention: ratings.slice(0, ATTENTION_MAX_RATING).reduce((a, b) => a + b, 0),
        };
      }),
    ),
  ]);
  return { total, attention, sites };
}

export interface OverviewLists {
  attention: Asset[];
  /** Server-side total matching the attention filter (the list shows the first few). */
  attentionTotal: number;
  recent: Asset[];
}

/** "Needs attention" and "Recently checked", filtered, sorted and limited by Dataverse. */
export async function getOverviewLists(siteId?: string): Promise<OverviewLists> {
  const scope = siteId ? ` and _cr_site_value eq ${assertGuid(siteId)}` : '';
  const attentionOptions: CountableOptions = {
    select: OVERVIEW_LIST_COLUMNS,
    filter: `${ACTIVE}${scope} and cr_conditionrating le ${ATTENTION_MAX_RATING}`,
    orderBy: ['cr_conditionrating asc', 'cr_lastchecked asc'],
    // Page size rather than $top, so $count still reports the full total.
    maxPageSize: OVERVIEW_LIST_SIZE,
    count: true,
  };
  const [attention, recent] = await Promise.all([
    Cr_assetsService.getAll(attentionOptions as IGetAllOptions),
    Cr_assetsService.getAll({
      select: OVERVIEW_LIST_COLUMNS,
      filter: `${ACTIVE}${scope} and cr_lastchecked ne null`,
      orderBy: ['cr_lastchecked desc'],
      top: OVERVIEW_LIST_SIZE,
    }),
  ]);
  const attentionItems = unwrap(attention, 'Loading assets that need attention') ?? [];
  return {
    attention: attentionItems,
    attentionTotal: attention.count ?? attentionItems.length,
    recent: unwrap(recent, 'Loading recently checked assets') ?? [],
  };
}

function toAssetPayload(values: AssetEditable): Partial<Omit<Cr_assetsBase, 'cr_assetid'>> {
  const { siteId, assignedToId, ...fields } = values;
  // Dataverse accepts null to clear a column; the generated types only model undefined.
  const payload = { ...fields } as Record<string, unknown>;
  if (siteId) payload['cr_Site@odata.bind'] = `/cr_sites(${assertGuid(siteId)})`;
  payload['cr_AssignedTo@odata.bind'] = assignedToId ? `/systemusers(${assertGuid(assignedToId)})` : null;
  return payload as Partial<Omit<Cr_assetsBase, 'cr_assetid'>>;
}

export async function updateAsset(id: string, values: AssetEditable): Promise<Asset> {
  return unwrap(await Cr_assetsService.update(assertGuid(id), toAssetPayload(values)), 'Saving asset');
}

export async function createAsset(values: AssetEditable): Promise<Asset> {
  // Drop nulls on create; owner/state columns are typed as required by the
  // generator but Dataverse fills them in.
  const payload = Object.fromEntries(
    Object.entries(toAssetPayload(values)).filter(([, v]) => v != null),
  ) as Omit<Cr_assetsBase, 'cr_assetid'>;
  return unwrap(await Cr_assetsService.create(payload), 'Creating asset');
}

// ---------- Condition checks ----------

export async function listConditionChecks(assetId: string): Promise<ConditionCheck[]> {
  const result = await Cr_conditionchecksService.getAll({
    select: CHECK_COLUMNS,
    filter: `_cr_asset_value eq ${assertGuid(assetId)} and statecode eq 0`,
    orderBy: ['cr_checkdate desc', 'createdon desc'],
    top: 20,
  });
  return unwrap(result, 'Loading condition checks') ?? [];
}

/**
 * Records a condition check and rolls the rating/date up onto the asset so the
 * list view shows the latest condition without a join.
 */
export async function addConditionCheck(check: NewConditionCheck): Promise<ConditionCheck> {
  const assetId = assertGuid(check.assetId);
  const checkDate = new Date(`${check.checkDate}T12:00:00`).toISOString();
  const payload = {
    cr_checkname: `${check.assetName} – ${check.checkDate}`.slice(0, 850),
    'cr_Asset@odata.bind': `/cr_assets(${assetId})`,
    cr_checkdate: checkDate,
    cr_conditionrating: check.rating,
    cr_comments: check.comments || undefined,
    'cr_CheckedBy@odata.bind': check.checkedById
      ? `/systemusers(${assertGuid(check.checkedById)})`
      : undefined,
  } as Omit<Cr_conditionchecksBase, 'cr_conditioncheckid'>;

  const created = unwrap(await Cr_conditionchecksService.create(payload), 'Saving condition check');

  unwrap(
    await Cr_assetsService.update(assetId, {
      cr_conditionrating: check.rating,
      cr_lastchecked: checkDate,
    }),
    'Updating asset condition',
  );
  return created;
}
