import { matchState, PINCODE_PATTERN } from "@/lib/checkout/address";

// Checks PIN codes against India Post's directory through the free api.postalpincode.in
// service (no key needed). To use a different provider, change lookupPincode and keep its
// result type.
const PINCODE_LOOKUP_URL = "https://api.postalpincode.in/pincode";
const LOOKUP_TIMEOUT_MS = 8_000;

export type PincodeLookup =
  /** The PIN code exists. City and state come from its post offices, when known. */
  | { status: "valid"; city?: string; state?: string }
  /** India Post has no record of this PIN code. */
  | { status: "invalid" }
  /** The check could not run (offline or the service is down), so the PIN code is not blocked. */
  | { status: "unknown" };

const results = new Map<string, PincodeLookup>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readText(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseLookup(data: unknown): PincodeLookup {
  const result = Array.isArray(data) ? data[0] : undefined;
  if (!isRecord(result)) {
    return { status: "unknown" };
  }
  if (result.Status === "Error") {
    return { status: "invalid" };
  }

  const postOffices = Array.isArray(result.PostOffice) ? result.PostOffice.filter(isRecord) : [];
  if (result.Status !== "Success" || postOffices.length === 0) {
    return { status: "unknown" };
  }

  const office = postOffices[0];
  return {
    status: "valid",
    city: readText(office, "District"),
    state: matchState(readText(office, "State")),
  };
}

/** Looks up a 6-digit PIN code. Results are remembered for the visit, so each code is checked once. */
export async function lookupPincode(pincode: string, signal?: AbortSignal): Promise<PincodeLookup> {
  if (!PINCODE_PATTERN.test(pincode)) {
    return { status: "invalid" };
  }

  const remembered = results.get(pincode);
  if (remembered) {
    return remembered;
  }

  try {
    const timeout = AbortSignal.timeout(LOOKUP_TIMEOUT_MS);
    const response = await fetch(`${PINCODE_LOOKUP_URL}/${pincode}`, {
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    if (!response.ok) {
      return { status: "unknown" };
    }

    const lookup = parseLookup(await response.json());
    if (lookup.status !== "unknown") {
      results.set(pincode, lookup);
    }
    return lookup;
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    return { status: "unknown" };
  }
}
