import type { Peptide, PeptideCategory } from '@/types/domain';

export const CATEGORY_LABELS: Record<PeptideCategory, string> = {
  recovery: 'Recovery',
  'gh-secretagogue': 'GH secretagogues',
  metabolic: 'Metabolic',
  cognitive: 'Cognitive',
  'skin-hair': 'Skin & hair',
  sleep: 'Sleep',
  other: 'Other',
};

export const RESEARCH_STATUS_LABELS: Record<Peptide['researchStatus'], string> = {
  'approved-drug': 'Approved medicine (in some countries)',
  'clinical-trials': 'In clinical trials',
  preclinical: 'Mostly lab and animal research',
  limited: 'Limited research',
};

/** "0.5" → "about 30 minutes", "168" → "about 7 days". */
export function describeHalfLife(hours: number): string {
  if (hours < 1) return `about ${Math.round(hours * 60)} minutes`;
  if (hours < 48) return `about ${Math.round(hours * 10) / 10} hours`;
  return `about ${Math.round(hours / 24)} days`;
}
