// FDA drug label lookup through openFDA. Network calls and response parsing
// live here so screens only deal with the typed results below.
//
// Docs: https://open.fda.gov/apis/drug/label/
// No API key is used. Without one openFDA allows 240 requests per minute and
// 1,000 per day per device IP, which is enough for individual users.

const BASE_URL = 'https://api.fda.gov/drug/label.json';
const SEARCH_LIMIT = 20;
const TIMEOUT_MS = 15000;

export type DrugLabelSummary = {
  setId: string;
  // Brand, else generic, else a fallback, so there is always a name to show.
  displayName: string;
  brandName?: string;
  genericName?: string;
  manufacturer?: string;
  route?: string;
  isPrescription?: boolean;
};

export type LabelSectionKey =
  | 'boxedWarning'
  | 'purpose'
  | 'uses'
  | 'contraindications'
  | 'warnings'
  | 'doNotUse'
  | 'askDoctor'
  | 'stopUse'
  | 'sideEffects'
  | 'dosage'
  | 'interactions';

export type LabelSection = {
  key: LabelSectionKey;
  title: string;
  // Label text as written, with its leading heading removed.
  text: string;
};

export type DrugLabel = DrugLabelSummary & {
  // YYYY-MM-DD from the label's effective_time, when present.
  effectiveDate?: string;
  // Only the sections this label has, in display order.
  sections: LabelSection[];
};

export type DrugSearchResult = {
  results: DrugLabelSummary[];
  // Total matching labels, which can be more than were returned.
  total: number;
};

export type DrugLookupErrorKind = 'network' | 'timeout' | 'rateLimited' | 'server' | 'notFound';

export class DrugLookupError extends Error {
  constructor(
    public kind: DrugLookupErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'DrugLookupError';
  }
}

// Where each section comes from. Prescription and over-the-counter labels use
// different fields for similar content, so some sections read several.
const SECTION_FIELDS: {
  key: LabelSectionKey;
  title: string;
  fields: string[];
  headings: string[];
}[] = [
  { key: 'boxedWarning', title: 'Boxed warning', fields: ['boxed_warning'], headings: ['boxed warning', 'warning'] },
  { key: 'purpose', title: 'Purpose', fields: ['purpose'], headings: ['purposes?'] },
  { key: 'uses', title: 'Uses', fields: ['indications_and_usage'], headings: ['indications (and|&) usage', 'uses?'] },
  { key: 'contraindications', title: 'Who should not take it', fields: ['contraindications'], headings: ['contraindications'] },
  {
    key: 'warnings',
    title: 'Warnings',
    fields: ['warnings_and_cautions', 'warnings'],
    headings: ['warnings and precautions', 'warnings?'],
  },
  { key: 'doNotUse', title: 'Do not use', fields: ['do_not_use'], headings: ['do not use'] },
  {
    key: 'askDoctor',
    title: 'Ask a doctor or pharmacist before use',
    fields: ['ask_doctor', 'ask_doctor_or_pharmacist'],
    headings: ['ask a doctor( or pharmacist)?( before use)?( if)?'],
  },
  { key: 'stopUse', title: 'Stop use and ask a doctor if', fields: ['stop_use'], headings: ['stop use and ask a doctor if', 'stop use'] },
  { key: 'sideEffects', title: 'Side effects', fields: ['adverse_reactions'], headings: ['adverse reactions'] },
  {
    key: 'dosage',
    title: 'Dosage and how to take it',
    fields: ['dosage_and_administration'],
    headings: ['dosage (and|&) administration', 'directions'],
  },
  { key: 'interactions', title: 'Drug interactions', fields: ['drug_interactions'], headings: ['drug interactions'] },
];

type RawLabel = {
  set_id?: string;
  effective_time?: string;
  openfda?: {
    brand_name?: string[];
    generic_name?: string[];
    manufacturer_name?: string[];
    route?: string[];
    product_type?: string[];
  };
} & Record<string, unknown>;

// Labels from the latest search, so opening one does not fetch it again.
const labelCache = new Map<string, DrugLabel>();

export async function searchDrugLabels(
  query: string,
  signal?: AbortSignal,
): Promise<DrugSearchResult> {
  const term = cleanQuery(query);
  if (!term) return { results: [], total: 0 };

  // A space between clauses means OR in openFDA search syntax.
  const search = `openfda.brand_name:"${term}" openfda.generic_name:"${term}"`;
  const data = await request(`search=${encodeURIComponent(search)}&limit=${SEARCH_LIMIT}`, signal);
  if (!data) return { results: [], total: 0 };

  const labels = data.results.map(parseLabel).filter((label): label is DrugLabel => !!label);
  labels.forEach((label) => labelCache.set(label.setId, label));

  // Many manufacturers publish near-identical labels. Show one row per
  // distinct product so the list is easier to scan.
  const seen = new Set<string>();
  const results = labels.filter((label) => {
    const id = [label.brandName, label.genericName, label.manufacturer, label.route]
      .join('|')
      .toLowerCase();
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  // openFDA's order puts combination products first for some names, so show
  // exact matches, then names starting with the search, then the rest.
  const rank = (label: DrugLabel) => {
    const names = [label.brandName, label.genericName].map((name) => name?.toLowerCase() ?? '');
    const lower = term.toLowerCase();
    if (names.includes(lower)) return 0;
    return names.some((name) => name.startsWith(lower)) ? 1 : 2;
  };
  results.sort((a, b) => rank(a) - rank(b));

  return { results: results.map(toSummary), total: data.total };
}

export async function getDrugLabel(setId: string, signal?: AbortSignal): Promise<DrugLabel> {
  const cached = labelCache.get(setId);
  if (cached) return cached;

  if (!/^[a-f0-9-]{36}$/i.test(setId)) {
    throw new DrugLookupError('notFound', 'That label link is not valid.');
  }
  const data = await request(`search=${encodeURIComponent(`set_id:"${setId}"`)}&limit=1`, signal);
  const label = data?.results[0] && parseLabel(data.results[0]);
  if (!label) throw new DrugLookupError('notFound', 'This label is no longer available from the FDA.');

  labelCache.set(label.setId, label);
  return label;
}

// DailyMed is the National Library of Medicine's site for the same FDA labels.
export function dailyMedUrl(setId: string) {
  return `https://dailymed.nlm.nih.gov/dailymed/lookup.cfm?setid=${encodeURIComponent(setId)}`;
}

// Drug names only need letters, numbers, spaces and hyphens. Dropping quotes
// and other symbols keeps user input from changing the search syntax.
function cleanQuery(query: string) {
  return query.replace(/[^a-zA-Z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Returns null when nothing matches, which openFDA reports as a 404.
async function request(
  params: string,
  signal?: AbortSignal,
): Promise<{ results: RawLabel[]; total: number } | null> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort);

  try {
    const response = await fetch(`${BASE_URL}?${params}`, { signal: controller.signal });
    if (response.status === 404) return null;
    if (response.status === 429) {
      throw new DrugLookupError('rateLimited', 'Too many searches right now. Please wait a minute and try again.');
    }
    if (!response.ok) {
      throw new DrugLookupError('server', 'The FDA service is having trouble. Please try again later.');
    }
    const json = (await response.json()) as { results?: RawLabel[]; meta?: { results?: { total?: number } } };
    const results = json.results ?? [];
    return { results, total: json.meta?.results?.total ?? results.length };
  } catch (error) {
    if (error instanceof DrugLookupError) throw error;
    if (timedOut) {
      throw new DrugLookupError('timeout', 'The search took too long. Check your connection and try again.');
    }
    // Cancelled by the caller (for example, a newer search started).
    if (signal?.aborted) throw error;
    throw new DrugLookupError('network', 'Could not reach the FDA. Check your internet connection.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

function parseLabel(raw: RawLabel): DrugLabel | null {
  if (!raw.set_id) return null;
  const openfda = raw.openfda ?? {};
  const brandName = first(openfda.brand_name);
  const genericName = first(openfda.generic_name);
  const productType = first(openfda.product_type);

  const sections: LabelSection[] = [];
  for (const { key, title, fields, headings } of SECTION_FIELDS) {
    const text = fields
      .flatMap((field) => stringArray(raw[field]))
      .map((part) => stripHeading(part, headings))
      .filter(Boolean)
      .join('\n\n');
    if (text) sections.push({ key, title, text });
  }

  return {
    setId: raw.set_id,
    displayName: toTitleCaseIfAllCaps(brandName ?? genericName) ?? 'Unnamed product',
    brandName: brandName && isAllCaps(brandName) ? toTitleCase(brandName) : brandName,
    genericName: genericName ? toTitleCase(genericName) : undefined,
    manufacturer: first(openfda.manufacturer_name),
    route: first(openfda.route)?.toLowerCase(),
    isPrescription: productType ? productType.includes('PRESCRIPTION') : undefined,
    effectiveDate: formatDate(raw.effective_time),
    sections,
  };
}

function toSummary({ effectiveDate, sections, ...summary }: DrugLabel): DrugLabelSummary {
  return summary;
}

function first(values: string[] | undefined) {
  const value = values?.[0]?.trim();
  return value || undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

// Label text usually repeats its heading, sometimes numbered ("7 DRUG
// INTERACTIONS ...") or twice, often after an invisible zero-width space. The
// card already shows a title, so drop it.
function stripHeading(text: string, headings: string[]) {
  const pattern = new RegExp(
    `^(\\s*(\\d+(\\.\\d+)*\\s+)?(${headings.join('|')})\\b\\s*:?)+\\s*`,
    'i',
  );
  return text
    .replace(/[\u200B\uFEFF]/g, '')
    .replace(pattern, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function isAllCaps(text: string) {
  return text === text.toUpperCase();
}

function toTitleCaseIfAllCaps(text: string | undefined) {
  return text && isAllCaps(text) ? toTitleCase(text) : text;
}

function toTitleCase(text: string) {
  return text.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | undefined) {
  if (!value || !/^\d{8}$/.test(value)) return undefined;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}
