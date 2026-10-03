import data from '@/content/peptides.json';
import type { Peptide } from '@/types/domain';

export const PEPTIDES = data as Peptide[];

const bySlug = new Map(PEPTIDES.map((p) => [p.slug, p]));

export function getPeptide(slug: string | null | undefined): Peptide | undefined {
  return slug ? bySlug.get(slug) : undefined;
}

/** Display name for anything that has either a library slug or a custom name. */
export function displayName(item: { peptideSlug: string | null; customName: string | null }): string {
  return getPeptide(item.peptideSlug)?.name ?? item.customName ?? 'Unnamed';
}

/** Case-insensitive match on name or aliases. */
export function searchPeptides(query: string): Peptide[] {
  const q = query.trim().toLowerCase();
  if (!q) return PEPTIDES;
  return PEPTIDES.filter(
    (p) => p.name.toLowerCase().includes(q) || p.aliases.some((a) => a.toLowerCase().includes(q)),
  );
}
