/**
 * ============================================================
 * TRUELABEL DOMAIN: DATE VALIDATION
 * Pure TypeScript date parsing, expiry check, and ambiguity flags.
 * Autoritative reference time: Server UTC.
 * Display time: Africa/Lagos.
 * ============================================================
 */

export interface DateValidationResult {
  isExpired: boolean;
  isFutureMfg: boolean;
  isDateInconsistent: boolean;
  isAmbiguous: boolean;
  expiryDateParsed: Date | null;
  mfgDateParsed: Date | null;
  flags: ('DATE_ISSUE' | 'EXPIRED_PRODUCT')[];
  humanReadableExpiry: string;
}

/**
 * Parses printed pack dates across common formats:
 * - DD/MM/YYYY, DD-MM-YYYY
 * - MM/YYYY, MM-YYYY (Month-end expiry)
 * - YYYY-MM-DD
 * - Short months: EXP: 11/26, 11/2026, NOV 2026
 */
export function parsePackDate(rawDate: string | undefined): {
  date: Date | null;
  isMonthOnly: boolean;
  isAmbiguous: boolean;
} {
  if (!rawDate || !rawDate.trim()) {
    return { date: null, isMonthOnly: false, isAmbiguous: false };
  }

  const clean = rawDate.trim().toUpperCase();

  // Pattern: MM/YYYY or MM-YYYY
  const monthYearMatch = clean.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (monthYearMatch) {
    const month = parseInt(monthYearMatch[1] ?? '0', 10);
    const year = parseInt(monthYearMatch[2] ?? '0', 10);
    if (month >= 1 && month <= 12) {
      // Month-end expiry: day 0 of month + 1
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      return { date: endOfMonth, isMonthOnly: true, isAmbiguous: false };
    }
  }

  // Pattern: MM/YY (e.g. 11/26 -> November 2026)
  const monthShortYearMatch = clean.match(/^(\d{1,2})[\/\-](\d{2})$/);
  if (monthShortYearMatch) {
    const month = parseInt(monthShortYearMatch[1] ?? '0', 10);
    const shortYear = parseInt(monthShortYearMatch[2] ?? '0', 10);
    const year = 2000 + shortYear;
    if (month >= 1 && month <= 12) {
      const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59));
      return { date: endOfMonth, isMonthOnly: true, isAmbiguous: false };
    }
  }

  // Pattern: YYYY-MM-DD
  const isoMatch = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const d = new Date(`${clean}T23:59:59Z`);
    if (!isNaN(d.getTime())) {
      return { date: d, isMonthOnly: false, isAmbiguous: false };
    }
  }

  // Pattern: DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1] ?? '0', 10);
    const month = parseInt(dmyMatch[2] ?? '0', 10);
    const year = parseInt(dmyMatch[3] ?? '0', 10);
    // Ambiguity check: if day <= 12 and month <= 12, could be MM/DD or DD/MM
    const isAmbiguous = day <= 12 && month <= 12 && day !== month;
    const d = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
    return { date: d, isMonthOnly: false, isAmbiguous };
  }

  // Fallback: standard Date.parse
  const parsed = Date.parse(clean);
  if (!isNaN(parsed)) {
    return { date: new Date(parsed), isMonthOnly: false, isAmbiguous: false };
  }

  return { date: null, isMonthOnly: false, isAmbiguous: true };
}

/**
 * Evaluates date status against authoritative server UTC time.
 */
export function evaluateDateStatus(
  expiryStr?: string,
  mfgStr?: string,
  referenceNow?: Date
): DateValidationResult {
  const now = referenceNow || new Date();
  const flags: ('DATE_ISSUE' | 'EXPIRED_PRODUCT')[] = [];

  const expiryParsed = parsePackDate(expiryStr);
  const mfgParsed = parsePackDate(mfgStr);

  let isExpired = false;
  let isFutureMfg = false;
  let isDateInconsistent = false;
  const isAmbiguous = expiryParsed.isAmbiguous || mfgParsed.isAmbiguous;

  if (isAmbiguous) {
    flags.push('DATE_ISSUE');
  }

  // Check expiry
  if (expiryParsed.date) {
    if (expiryParsed.date.getTime() < now.getTime()) {
      isExpired = true;
      flags.push('EXPIRED_PRODUCT');
    }
  }

  // Check manufacturing date
  if (mfgParsed.date) {
    if (mfgParsed.date.getTime() > now.getTime()) {
      isFutureMfg = true;
      flags.push('DATE_ISSUE');
    }
    // Check if mfg is after expiry
    if (expiryParsed.date && mfgParsed.date.getTime() > expiryParsed.date.getTime()) {
      isDateInconsistent = true;
      flags.push('DATE_ISSUE');
    }
  }

  let humanReadable = 'Not specified';
  if (expiryParsed.date) {
    humanReadable = expiryParsed.date.toLocaleDateString('en-GB', {
      timeZone: 'Africa/Lagos',
      year: 'numeric',
      month: 'short',
      day: expiryParsed.isMonthOnly ? undefined : 'numeric',
    });
  }

  return {
    isExpired,
    isFutureMfg,
    isDateInconsistent,
    isAmbiguous,
    expiryDateParsed: expiryParsed.date,
    mfgDateParsed: mfgParsed.date,
    flags,
    humanReadableExpiry: humanReadable,
  };
}
