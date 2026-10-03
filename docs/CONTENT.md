# Peptify — Library Content Spec

File: `src/content/peptides.json` — an array of entries. 25 entries for the MVP, 5 with `"free": true`.

## Schema

```json
{
  "slug": "bpc-157",
  "name": "BPC-157",
  "aliases": ["Body Protection Compound 157"],
  "category": "recovery",
  "free": true,
  "summary": "One or two neutral sentences on what it is.",
  "studiedFor": ["Short phrases of research areas, e.g. 'tendon healing in animal models'"],
  "halfLifeHours": 4,
  "halfLifeNote": "Estimated; human data limited.",
  "storage": "Lyophilized: refrigerate. Reconstituted: refrigerate, use within ~30 days.",
  "researchStatus": "preclinical",
  "references": [
    { "title": "Paper or review title", "url": "https://pubmed.ncbi.nlm.nih.gov/..." }
  ]
}
```

- `category`: `recovery` · `gh-secretagogue` · `metabolic` · `cognitive` · `skin-hair` · `sleep` · `other`
- `researchStatus`: `approved-drug` · `clinical-trials` · `preclinical` · `limited`
- Omit a field when you don't have a sourced value. Never invent numbers.

## MVP list (25)

Free (5): BPC-157, TB-500, Ipamorelin, GHK-Cu, Semaglutide
Pro (20): CJC-1295 (no DAC), CJC-1295 DAC, Tesamorelin, Sermorelin, Tirzepatide, Retatrutide, AOD-9604, MOTS-c, Selank, Semax, DSIP, Epitalon, PT-141, Melanotan II, Thymosin Alpha-1, KPV, LL-37, NAD+, Kisspeptin-10, Hexarelin

Generate with the `content-writer` agent in batches of 5. Have a human spot-check each batch's references.
