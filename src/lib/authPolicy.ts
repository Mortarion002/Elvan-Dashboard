const DEFAULT_ALLOWED_DOMAINS = ["getelvan.com", "elvan.com"];

export function getAllowedEmailDomains(): string[] {
  const configuredDomains = process.env.AUTH_ALLOWED_DOMAINS?.split(",") ?? [];
  const normalizedDomains = configuredDomains
    .map(normalizeDomain)
    .filter((domain): domain is string => Boolean(domain));

  return normalizedDomains.length ? normalizedDomains : DEFAULT_ALLOWED_DOMAINS;
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  const domain = extractEmailDomain(email);
  if (!domain) {
    return false;
  }

  return getAllowedEmailDomains().includes(domain);
}

export function isNeonAuthConfigured(): boolean {
  return Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET);
}

function extractEmailDomain(email: string | null | undefined): string | null {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) {
    return null;
  }

  const atIndex = normalizedEmail.lastIndexOf("@");
  if (atIndex <= 0 || atIndex === normalizedEmail.length - 1) {
    return null;
  }

  return normalizedEmail.slice(atIndex + 1);
}

function normalizeDomain(domain: string): string | null {
  const normalizedDomain = domain.trim().toLowerCase().replace(/^@/, "");
  return normalizedDomain || null;
}
