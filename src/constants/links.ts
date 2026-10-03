/**
 * Public pages required by the stores. Hosted from site/ via .github/workflows/pages.yml.
 * If you move to a custom domain, change SITE_URL only.
 */
const SITE_URL = 'https://ms-singh83.github.io/Peptify';

export const Links = {
  site: `${SITE_URL}/`,
  privacy: `${SITE_URL}/privacy.html`,
  terms: `${SITE_URL}/terms.html`,
  support: `${SITE_URL}/support.html`,
  /** Replace with your real address (also in site/ and legal/). */
  supportEmail: 'support@example.com',
} as const;
