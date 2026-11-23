import { normalizeText } from './normalization';

/**
 * ============================================================
 * TRUELABEL DOMAIN: IDENTITY MATCHING
 * Compares confirmed pack identity fields against official records.
 * Identifies brand matches, product name matches, manufacturer matches,
 * and flags potential lookalike names.
 * ============================================================
 */

export interface IdentityMatchResult {
  brandMatches: boolean;
  productNameMatches: boolean;
  manufacturerMatches: boolean;
  isLookalikeName: boolean;
  isMaterialMismatch: boolean;
  mismatchDetails: string[];
  overallIdentityMatch: boolean;
  confidenceScore: number;
}

/**
 * Calculates Levenshtein edit distance between two normalized strings.
 */
export function calculateLevenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d: number[][] = [];
  for (let i = 0; i <= m; i++) {
    d[i] = [];
    d[i]![0] = i;
  }
  for (let j = 0; j <= n; j++) {
    d[0]![j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const row = d[i]!;
      const prevRow = d[i - 1]!;
      row[j] = Math.min(
        (prevRow[j] ?? 0) + 1, // deletion
        (row[j - 1] ?? 0) + 1, // insertion
        (prevRow[j - 1] ?? 0) + cost // substitution
      );
    }
  }

  return d[m]?.[n] ?? 0;
}

/**
 * Calculates normalized string similarity ratio between 0 and 1.
 */
export function calculateTextSimilarity(a: string, b: string): number {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (!normA && !normB) return 1.0;
  if (!normA || !normB) return 0.0;
  if (normA === normB) return 1.0;

  // Substring or token overlap check
  if (normA.includes(normB) || normB.includes(normA)) {
    const minLen = Math.min(normA.length, normB.length);
    const maxLen = Math.max(normA.length, normB.length);
    return minLen / maxLen > 0.6 ? 0.85 : 0.7;
  }

  const distance = calculateLevenshteinDistance(normA, normB);
  const maxLength = Math.max(normA.length, normB.length);
  return Math.max(0, 1 - distance / maxLength);
}

/**
 * Matches confirmed pack details with a registry record.
 */
export function matchIdentity(
  packBrand: string | undefined,
  packProductName: string | undefined,
  packManufacturer: string | undefined,
  recordBrand: string | undefined,
  recordProductName: string | undefined,
  recordManufacturer: string | undefined
): IdentityMatchResult {
  const mismatchDetails: string[] = [];

  const normPackBrand = normalizeText(packBrand);
  const normRecBrand = normalizeText(recordBrand);
  const normPackProd = normalizeText(packProductName);
  const normRecProd = normalizeText(recordProductName);
  const normPackMfg = normalizeText(packManufacturer);
  const normRecMfg = normalizeText(recordManufacturer);

  // 1. Brand matching
  let brandMatches = false;
  let isLookalike = false;

  if (normPackBrand && normRecBrand) {
    const brandSim = calculateTextSimilarity(normPackBrand, normRecBrand);
    if (brandSim >= 0.88) {
      brandMatches = true;
    } else if (brandSim >= 0.55) {
      // Close spelling resemblance without exact match indicates a potential lookalike
      isLookalike = true;
      mismatchDetails.push(`Brand on pack ("${packBrand}") resembles registered brand ("${recordBrand}") but does not match`);
    } else {
      mismatchDetails.push(`Brand on pack ("${packBrand}") does not match record brand ("${recordBrand}")`);
    }
  } else if (!normRecBrand && normPackBrand) {
    // Record has no brand, check if brand is included inside record product name
    if (normRecProd.includes(normPackBrand)) {
      brandMatches = true;
    }
  } else {
    brandMatches = true; // Brand absent on both
  }

  // 2. Product name matching
  let productNameMatches = false;
  if (normPackProd && normRecProd) {
    const prodSim = calculateTextSimilarity(normPackProd, normRecProd);
    if (prodSim >= 0.65 || normPackProd.includes(normRecProd) || normRecProd.includes(normPackProd)) {
      productNameMatches = true;
    } else {
      mismatchDetails.push(`Product name on pack ("${packProductName}") differs from registered product ("${recordProductName}")`);
    }
  } else {
    productNameMatches = false;
    mismatchDetails.push('Product name is missing or unreadable');
  }

  // 3. Manufacturer matching
  let manufacturerMatches = true;
  if (normPackMfg && normRecMfg) {
    const mfgSim = calculateTextSimilarity(normPackMfg, normRecMfg);
    if (mfgSim < 0.6 && !normPackMfg.includes(normRecMfg) && !normRecMfg.includes(normPackMfg)) {
      manufacturerMatches = false;
      mismatchDetails.push(`Manufacturer on pack ("${packManufacturer}") differs from registered manufacturer ("${recordManufacturer}")`);
    }
  }

  const overallIdentityMatch = brandMatches && productNameMatches && manufacturerMatches;
  const isMaterialMismatch = !brandMatches || !manufacturerMatches;

  return {
    brandMatches,
    productNameMatches,
    manufacturerMatches,
    isLookalikeName: isLookalike,
    isMaterialMismatch,
    mismatchDetails,
    overallIdentityMatch,
    confidenceScore: overallIdentityMatch ? 0.95 : isLookalike ? 0.6 : 0.3,
  };
}
