import Papa from "papaparse";

export type CampaignCsvRow = Record<string, string>;

export type CampaignUpload = {
  id: string;
  fileName: string;
  campaignName: string;
  headers: string[];
  rows: CampaignCsvRow[];
  parseErrors: string[];
  uploadedAt: number;
};

export type ClickedLead = {
  id: string;
  email: string;
  fullName: string;
  company: string;
  phone: string;
  website: string;
  linkedIn: string;
  location: string;
  status: string;
  sequence: string;
  totalClicks: number;
  campaignCount: number;
  campaignNames: string[];
  campaigns: string[];
  sourceFiles: string[];
  clickEvidence: string[];
  details: CampaignCsvRow;
};

export type ProspectInput = {
  email: string;
  fullName: string;
};

export type CampaignClickSummary = {
  leads: ClickedLead[];
  headers: string[];
  totalRows: number;
  clickedRows: number;
  skippedRowsWithoutEmail: number;
  filesWithClickColumns: number;
  filesWithoutClickColumns: number;
  totalClicks: number;
};

type LeadAccumulator = {
  email: string;
  totalClicks: number;
  campaigns: Map<string, number>;
  sourceFiles: Set<string>;
  clickEvidence: string[];
  details: CampaignCsvRow;
  statuses: Set<string>;
  sequences: Set<string>;
};

const EMAIL_FIELDS = ["email", "email address", "lead email", "business email"];
const FIRST_NAME_FIELDS = ["first name", "firstname", "given name"];
const LAST_NAME_FIELDS = ["last name", "lastname", "surname", "family name"];
const FULL_NAME_FIELDS = ["full name", "name", "lead name"];
const COMPANY_FIELDS = ["company name", "company", "organization", "organisation"];
const PHONE_FIELDS = ["phone number", "phone", "mobile", "mobile number"];
const WEBSITE_FIELDS = ["website", "company website", "domain"];
const LINKEDIN_FIELDS = ["linkedin profile", "linkedin", "linkedin url", "linkedin profile url"];
const LOCATION_FIELDS = ["location", "city", "country", "state"];
const STATUS_FIELDS = ["status", "lead status", "email status"];
const SEQUENCE_FIELDS = [
  "current sequence number",
  "sequence",
  "sequence number",
  "email sequence",
  "current step",
  "step",
];

export function summarizeCampaignClicks(uploads: CampaignUpload[]): CampaignClickSummary {
  const headers = uniqueHeaders(uploads.flatMap((upload) => upload.headers));
  const leadDetailsByEmail = new Map<string, CampaignCsvRow>();
  const accumulators = new Map<string, LeadAccumulator>();
  let totalRows = 0;
  let clickedRows = 0;
  let skippedRowsWithoutEmail = 0;
  let filesWithClickColumns = 0;
  let filesWithoutClickColumns = 0;

  uploads.forEach((upload) => {
    totalRows += upload.rows.length;
    const clickColumns = detectClickColumns(upload.headers, upload.rows);
    if (clickColumns.length) {
      filesWithClickColumns += 1;
    } else {
      filesWithoutClickColumns += 1;
    }

    upload.rows.forEach((row) => {
      const rowEmail = normalizeEmail(readField(row, EMAIL_FIELDS));
      if (rowEmail) {
        const details = leadDetailsByEmail.get(rowEmail) ?? {};
        mergeRowDetails(details, row);
        leadDetailsByEmail.set(rowEmail, details);
        const clickedLead = accumulators.get(rowEmail);
        if (clickedLead) {
          mergeRowDetails(clickedLead.details, row);
        }
      }

      const clickSignal = getClickSignal(row);
      if (clickSignal.clicks <= 0) {
        return;
      }

      if (!rowEmail) {
        skippedRowsWithoutEmail += 1;
        return;
      }

      clickedRows += 1;
      const existing =
        accumulators.get(rowEmail) ??
        ({
          email: rowEmail,
          totalClicks: 0,
          campaigns: new Map<string, number>(),
          sourceFiles: new Set<string>(),
          clickEvidence: [],
          details: { ...(leadDetailsByEmail.get(rowEmail) ?? {}) },
          statuses: new Set<string>(),
          sequences: new Set<string>(),
        } satisfies LeadAccumulator);

      existing.totalClicks += clickSignal.clicks;
      existing.campaigns.set(
        upload.campaignName,
        (existing.campaigns.get(upload.campaignName) ?? 0) + clickSignal.clicks
      );
      existing.sourceFiles.add(upload.fileName);
      mergeRowDetails(existing.details, row);

      const status = readField(row, STATUS_FIELDS);
      const sequence = readField(row, SEQUENCE_FIELDS);
      if (status) existing.statuses.add(status);
      if (sequence) existing.sequences.add(sequence);

      if (clickSignal.evidence.length) {
        existing.clickEvidence.push(
          `${upload.campaignName}: ${clickSignal.evidence.slice(0, 4).join(", ")}`
        );
      }

      accumulators.set(rowEmail, existing);
    });
  });

  const leads = Array.from(accumulators.values())
    .map((lead) => {
      const campaignEntries = Array.from(lead.campaigns.entries()).sort(
        (left, right) => right[1] - left[1] || left[0].localeCompare(right[0])
      );
      const campaignNames = campaignEntries.map(([campaignName]) => campaignName);
      const campaigns = campaignEntries.map(([campaignName, clicks]) => `${campaignName} (${clicks})`);
      const details = lead.details;
      const fullName = buildFullName(details);

      return {
        id: lead.email,
        email: lead.email,
        fullName,
        company: readField(details, COMPANY_FIELDS),
        phone: readField(details, PHONE_FIELDS),
        website: readField(details, WEBSITE_FIELDS),
        linkedIn: readField(details, LINKEDIN_FIELDS),
        location: readField(details, LOCATION_FIELDS),
        status: joinSet(lead.statuses),
        sequence: joinSet(lead.sequences),
        totalClicks: lead.totalClicks,
        campaignCount: lead.campaigns.size,
        campaignNames,
        campaigns,
        sourceFiles: Array.from(lead.sourceFiles).sort(),
        clickEvidence: lead.clickEvidence,
        details,
      } satisfies ClickedLead;
    })
    .sort((left, right) => right.totalClicks - left.totalClicks || left.email.localeCompare(right.email));

  return {
    leads,
    headers,
    totalRows,
    clickedRows,
    skippedRowsWithoutEmail,
    filesWithClickColumns,
    filesWithoutClickColumns,
    totalClicks: leads.reduce((sum, lead) => sum + lead.totalClicks, 0),
  };
}

export function detectClickColumns(headers: string[], rows: CampaignCsvRow[]): string[] {
  return headers.filter((header) => {
    const normalized = normalizeHeader(header);
    if (isClickCountHeader(normalized) || isClickedAtHeader(normalized) || normalized.includes("click")) {
      return true;
    }

    if (!isActivityHeader(normalized)) {
      return false;
    }

    return rows.some((row) => valueLooksClicked(row[header] ?? ""));
  });
}

export function buildClickedLeadsCsv(leads: ClickedLead[]): string {
  const headers = ["Lead Name", "Email", "Company Name", "Campaign Name"];
  const rows = leads.map((lead) => {
    return {
      "Lead Name": lead.fullName,
      Email: lead.email,
      "Company Name": lead.company,
      "Campaign Name": lead.campaignNames.join("; "),
    };
  });
  return Papa.unparse(rows, { columns: headers, newline: "\r\n" });
}

export function makeCampaignName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createUploadId(file: File, index: number): string {
  const fallback = `${file.name}-${file.lastModified}-${index}`;
  if (typeof crypto === "undefined" || typeof crypto.randomUUID !== "function") {
    return fallback;
  }
  return crypto.randomUUID();
}

function getClickSignal(row: CampaignCsvRow): { clicks: number; evidence: string[] } {
  let explicitClicks = 0;
  const evidence: string[] = [];
  let fallbackClicked = false;

  Object.entries(row).forEach(([header, rawValue]) => {
    const value = String(rawValue ?? "").trim();
    if (!value) {
      return;
    }

    const normalizedHeader = normalizeHeader(header);
    if (isClickCountHeader(normalizedHeader)) {
      const clicks = parsePositiveNumber(value);
      if (clicks > 0) {
        explicitClicks += clicks;
        evidence.push(`${header} ${clicks}`);
      }
      return;
    }

    if (isClickedAtHeader(normalizedHeader) && !isNegativeValue(value)) {
      fallbackClicked = true;
      evidence.push(`${header} ${value}`);
      return;
    }

    if (normalizedHeader.includes("click") && isTruthyClickValue(value)) {
      fallbackClicked = true;
      evidence.push(`${header} ${value}`);
      return;
    }

    if (isActivityHeader(normalizedHeader) && valueLooksClicked(value)) {
      fallbackClicked = true;
      evidence.push(`${header} ${value}`);
    }
  });

  return {
    clicks: explicitClicks > 0 ? explicitClicks : fallbackClicked ? 1 : 0,
    evidence,
  };
}

function mergeRowDetails(target: CampaignCsvRow, row: CampaignCsvRow) {
  Object.entries(row).forEach(([header, value]) => {
    const cleanValue = String(value ?? "").trim();
    if (!cleanValue) {
      return;
    }

    if (!target[header]) {
      target[header] = cleanValue;
    }
  });
}

function buildFullName(row: CampaignCsvRow): string {
  const fullName = readField(row, FULL_NAME_FIELDS);
  if (fullName) {
    return fullName;
  }

  return [readField(row, FIRST_NAME_FIELDS), readField(row, LAST_NAME_FIELDS)]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function readField(row: CampaignCsvRow, acceptedNames: string[]): string {
  const accepted = new Set(acceptedNames.map(normalizeHeader));
  const exact = Object.entries(row).find(([header]) => accepted.has(normalizeHeader(header)));
  if (exact) {
    return String(exact[1] ?? "").trim();
  }

  return "";
}

function uniqueHeaders(headers: string[]): string[] {
  const seen = new Set<string>();
  return headers.filter((header) => {
    const clean = header.trim();
    if (!clean || seen.has(clean)) {
      return false;
    }

    seen.add(clean);
    return true;
  });
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");
}

function isClickCountHeader(normalizedHeader: string): boolean {
  return (
    normalizedHeader === "clicks" ||
    normalizedHeader.includes("click count") ||
    normalizedHeader.includes("clicked count") ||
    normalizedHeader.includes("link clicks") ||
    (normalizedHeader.includes("click") && normalizedHeader.includes("count"))
  );
}

function isClickedAtHeader(normalizedHeader: string): boolean {
  return (
    normalizedHeader.includes("click") &&
    (normalizedHeader.includes("time") ||
      normalizedHeader.includes("date") ||
      normalizedHeader.endsWith("at") ||
      normalizedHeader.includes("clicked on"))
  );
}

function isActivityHeader(normalizedHeader: string): boolean {
  return [
    "status",
    "lead status",
    "email status",
    "category",
    "activity",
    "event",
    "event type",
    "type",
    "latest activity",
    "last activity",
  ].includes(normalizedHeader);
}

function parsePositiveNumber(value: string): number {
  const normalized = value.replace(/,/g, "").trim();
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return parsed;
}

function valueLooksClicked(value: string): boolean {
  const normalized = value.toLowerCase();
  return /\bclick(ed|s|ing)?\b/.test(normalized) && !isNegativeValue(normalized);
}

function isTruthyClickValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (isNegativeValue(normalized)) {
    return false;
  }

  return ["true", "yes", "y", "1", "clicked"].includes(normalized) || valueLooksClicked(normalized);
}

function isNegativeValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    !normalized ||
    normalized === "0" ||
    normalized === "false" ||
    normalized === "no" ||
    normalized === "n" ||
    normalized.includes("not clicked") ||
    normalized.includes("no click") ||
    normalized.includes("unclicked")
  );
}

function joinSet(values: Set<string>): string {
  return Array.from(values).filter(Boolean).sort().join(", ");
}
