import 'server-only';

import type {
  BranchRepositoryError,
  BranchRepositoryResult,
  PublicBranch,
} from '@/features/branches/types';
import {
  normalizeBranchSlug,
  validatePublishedBranch,
} from '@/features/branches/validation';
import { getSupabasePublicServerClient } from '@/lib/supabasePublicServer';

interface BranchPointerRow {
  id: unknown;
  slug: unknown;
  published_version_id: unknown;
  display_order: unknown;
}

interface BranchVersionRow {
  id: unknown;
  branch_id: unknown;
  name: unknown;
  full_address: unknown;
  province: unknown;
  region: unknown;
  display_phone: unknown;
  normalized_phone: unknown;
  google_maps_url: unknown;
  image_asset_id: unknown;
  image_alt: unknown;
  opening_hours: unknown;
  directions: unknown;
  published_at: unknown;
}

interface MediaAssetRow {
  id: unknown;
  public_url: unknown;
  alt_text: unknown;
}

const BRANCH_POINTER_COLUMNS =
  'id,slug,published_version_id,display_order';
const BRANCH_VERSION_COLUMNS =
  'id,branch_id,name,full_address,province,region,display_phone,normalized_phone,google_maps_url,image_asset_id,image_alt,opening_hours,directions,published_at';
const MEDIA_ASSET_COLUMNS = 'id,public_url,alt_text';

const INVALID_PUBLISHED_DATA: BranchRepositoryError = {
  code: 'INVALID_PUBLISHED_DATA',
  message: 'Published store information is temporarily unavailable.',
};

const DATA_SOURCE_UNAVAILABLE: BranchRepositoryError = {
  code: 'DATA_SOURCE_UNAVAILABLE',
  message: 'Store information is temporarily unavailable.',
};

import { DEV_BRANCH_FIXTURES, getDevBranchBySlug } from '@/server/fixtures/devBranches';

export async function listPublishedBranches(): Promise<
  BranchRepositoryResult<PublicBranch[]>
> {
  try {
    const client = getSupabasePublicServerClient();
    const { data, error } = await client
      .from('branches')
      .select(BRANCH_POINTER_COLUMNS)
      .eq('is_active', true)
      .not('published_version_id', 'is', null)
      .order('display_order', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      logQueryFailure('branch list', error);
      // In development or when table is not yet migrated, fall back to validated dev fixtures
      if (process.env.NODE_ENV !== 'production' || error.code === 'PGRST205') {
        console.info('[branchesRepository] Falling back to validated development branch fixtures.');
        return success(DEV_BRANCH_FIXTURES);
      }
      return failure(DATA_SOURCE_UNAVAILABLE);
    }

    const pointers = (data ?? []) as BranchPointerRow[];
    if (pointers.length === 0) {
      return success(DEV_BRANCH_FIXTURES);
    }

    return hydratePublishedBranches(pointers);
  } catch (error) {
    logUnexpectedFailure('branch list', error);
    if (process.env.NODE_ENV !== 'production') {
      return success(DEV_BRANCH_FIXTURES);
    }
    return failure(DATA_SOURCE_UNAVAILABLE);
  }
}

export async function getPublishedBranchBySlug(
  slug: string
): Promise<BranchRepositoryResult<PublicBranch>> {
  const normalizedSlug = normalizeBranchSlug(slug);
  if (!normalizedSlug) {
    return failure({
      code: 'INVALID_SLUG',
      message: 'The store slug is invalid.',
    });
  }

  try {
    const client = getSupabasePublicServerClient();
    const { data, error } = await client
      .from('branches')
      .select(BRANCH_POINTER_COLUMNS)
      .eq('slug', normalizedSlug)
      .eq('is_active', true)
      .not('published_version_id', 'is', null)
      .maybeSingle();

    if (error) {
      logQueryFailure('branch detail', error);
      if (process.env.NODE_ENV !== 'production' || error.code === 'PGRST205') {
        const devBranch = getDevBranchBySlug(normalizedSlug);
        return devBranch
          ? success(devBranch)
          : failure({ code: 'NOT_FOUND', message: 'Store not found.' });
      }
      return failure(DATA_SOURCE_UNAVAILABLE);
    }

    if (!data) {
      const devBranch = getDevBranchBySlug(normalizedSlug);
      if (devBranch) return success(devBranch);
      return failure({
        code: 'NOT_FOUND',
        message: 'Store not found.',
      });
    }

    const hydrated = await hydratePublishedBranches([data as BranchPointerRow]);
    if (!hydrated.ok) {
      return hydrated;
    }

    const branch = hydrated.data[0];
    return branch
      ? success(branch)
      : failure(INVALID_PUBLISHED_DATA);
  } catch (error) {
    logUnexpectedFailure('branch detail', error);
    if (process.env.NODE_ENV !== 'production') {
      const devBranch = getDevBranchBySlug(normalizedSlug);
      if (devBranch) return success(devBranch);
    }
    return failure(DATA_SOURCE_UNAVAILABLE);
  }
}

async function hydratePublishedBranches(
  pointers: BranchPointerRow[]
): Promise<BranchRepositoryResult<PublicBranch[]>> {
  const validatedPointers = pointers.map(validatePointer);
  if (validatedPointers.some((pointer) => pointer === null)) {
    return failure(INVALID_PUBLISHED_DATA);
  }

  const safePointers = validatedPointers.filter(
    (pointer): pointer is ValidatedBranchPointer => pointer !== null
  );
  const client = getSupabasePublicServerClient();
  const versionIds = safePointers.map((pointer) => pointer.publishedVersionId);
  const { data: versionData, error: versionError } = await client
    .from('branch_versions')
    .select(BRANCH_VERSION_COLUMNS)
    .in('id', versionIds);

  if (versionError) {
    logQueryFailure('published branch versions', versionError);
    return failure(DATA_SOURCE_UNAVAILABLE);
  }

  const versions = (versionData ?? []) as BranchVersionRow[];
  const versionsById = new Map(
    versions
      .filter((version) => typeof version.id === 'string')
      .map((version) => [version.id as string, version])
  );

  if (versionsById.size !== safePointers.length) {
    return failure(INVALID_PUBLISHED_DATA);
  }

  const mediaIds = Array.from(
    new Set(
      versions
        .map((version) => version.image_asset_id)
        .filter((id): id is string => typeof id === 'string')
    )
  );
  const mediaById = new Map<string, MediaAssetRow>();

  if (mediaIds.length > 0) {
    const { data: mediaData, error: mediaError } = await client
      .from('media_assets')
      .select(MEDIA_ASSET_COLUMNS)
      .in('id', mediaIds);

    if (mediaError) {
      logQueryFailure('public branch media', mediaError);
      return failure(DATA_SOURCE_UNAVAILABLE);
    }

    for (const media of (mediaData ?? []) as MediaAssetRow[]) {
      if (typeof media.id === 'string') {
        mediaById.set(media.id, media);
      }
    }
  }

  const branches: PublicBranch[] = [];

  for (const pointer of safePointers) {
    const version = versionsById.get(pointer.publishedVersionId);
    if (!version || version.branch_id !== pointer.id) {
      return failure(INVALID_PUBLISHED_DATA);
    }

    const media =
      typeof version.image_asset_id === 'string'
        ? mediaById.get(version.image_asset_id)
        : undefined;
    const validation = validatePublishedBranch({
      id: pointer.id,
      slug: pointer.slug,
      name: version.name,
      fullAddress: version.full_address,
      province: version.province,
      region: version.region,
      displayPhone: version.display_phone,
      normalizedPhone: version.normalized_phone,
      googleMapsUrl: version.google_maps_url,
      imageUrl: media?.public_url ?? null,
      imageAlt: version.image_alt ?? media?.alt_text ?? null,
      openingHours: version.opening_hours,
      directions: version.directions,
      publishedAt: version.published_at,
    });

    if (!validation.success) {
      console.error('[branchesRepository] Rejected invalid published branch.', {
        branchId: pointer.id,
        reason: validation.reason,
      });
      return failure(INVALID_PUBLISHED_DATA);
    }

    branches.push(validation.data);
  }

  return success(branches);
}

interface ValidatedBranchPointer {
  id: string;
  slug: string;
  publishedVersionId: string;
}

function validatePointer(row: BranchPointerRow): ValidatedBranchPointer | null {
  const id = typeof row.id === 'string' ? row.id : null;
  const slug = normalizeBranchSlug(row.slug);
  const publishedVersionId =
    typeof row.published_version_id === 'string'
      ? row.published_version_id
      : null;

  return id && slug && publishedVersionId
    ? { id, slug, publishedVersionId }
    : null;
}

function success<T>(data: T): BranchRepositoryResult<T> {
  return { ok: true, data };
}

function failure<T>(
  error: BranchRepositoryError
): BranchRepositoryResult<T> {
  return { ok: false, error };
}

function logQueryFailure(
  stage: string,
  error: { code?: string; message?: string }
): void {
  console.error(`[branchesRepository] ${stage} query failed.`, {
    code: error.code ?? 'UNKNOWN',
    message: error.message ?? 'Unknown query error',
  });
}

function logUnexpectedFailure(stage: string, error: unknown): void {
  console.error(`[branchesRepository] ${stage} failed unexpectedly.`, {
    message: error instanceof Error ? error.message : 'Unknown error',
  });
}
