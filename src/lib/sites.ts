import { INJECTION_SITES, type InjectionSite } from '@/types/domain';

export const SITE_LABELS: Record<InjectionSite, string> = {
  'abdomen-upper-left': 'Abdomen · upper left',
  'abdomen-upper-right': 'Abdomen · upper right',
  'abdomen-lower-left': 'Abdomen · lower left',
  'abdomen-lower-right': 'Abdomen · lower right',
  'thigh-left': 'Thigh · left',
  'thigh-right': 'Thigh · right',
  'deltoid-left': 'Upper arm · left',
  'deltoid-right': 'Upper arm · right',
};

export type SiteUse = { site: InjectionSite; lastUsed: string };

/**
 * Least-recently-used site. Never-used sites come first (in canonical order),
 * then the oldest last-use. Pure: callers pass the last use per site.
 */
export function suggestSite(uses: SiteUse[]): InjectionSite {
  const last = new Map(uses.map((u) => [u.site, u.lastUsed]));
  let best: InjectionSite = INJECTION_SITES[0];
  let bestTime: string | undefined = last.get(best);
  for (const site of INJECTION_SITES) {
    const t = last.get(site);
    if (t === undefined) return site; // first never-used site wins
    if (bestTime !== undefined && t < bestTime) {
      best = site;
      bestTime = t;
    }
  }
  return best;
}
