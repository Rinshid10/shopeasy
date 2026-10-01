import { matchState } from "@/lib/checkout/address";
import type { Address } from "@/types";

// Turns the visitor's coordinates into an address with OpenStreetMap's free Nominatim
// service. Its usage policy allows light use like this (one lookup per tap); for heavy
// traffic, switch to a paid geocoding API here and keep the function signature.
const REVERSE_GEOCODE_URL = "https://nominatim.openstreetmap.org/reverse";
const LOCATION_TIMEOUT_MS = 15_000;

export type LocationAddress = Partial<
  Pick<Address, "houseNumber" | "area" | "city" | "state" | "pincode">
>;

export type LocateErrorReason = "unsupported" | "denied" | "unavailable" | "lookup-failed";

export class LocateError extends Error {
  constructor(readonly reason: LocateErrorReason) {
    super(reason);
  }
}

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new LocateError("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) =>
        reject(new LocateError(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable")),
      { enableHighAccuracy: true, timeout: LOCATION_TIMEOUT_MS, maximumAge: 60_000 },
    );
  });
}

/** Reads a text field from the geocoder's address details, if present. */
function pick(details: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = details[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

async function reverseGeocode(latitude: number, longitude: number): Promise<LocationAddress> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: "jsonv2",
    addressdetails: "1",
    "accept-language": "en",
  });

  let data: unknown;
  try {
    const response = await fetch(`${REVERSE_GEOCODE_URL}?${params}`);
    if (!response.ok) {
      throw new LocateError("lookup-failed");
    }
    data = await response.json();
  } catch {
    throw new LocateError("lookup-failed");
  }

  const details =
    typeof data === "object" && data !== null && "address" in data ? data.address : null;
  if (typeof details !== "object" || details === null) {
    throw new LocateError("lookup-failed");
  }
  const address = details as Record<string, unknown>;

  const road = pick(address, "road", "pedestrian");
  const locality = pick(address, "neighbourhood", "suburb", "quarter", "residential", "hamlet");
  const pincode = pick(address, "postcode")?.replace(/\D/g, "");

  return {
    houseNumber: pick(address, "house_number", "building"),
    area: [road, locality].filter(Boolean).join(", ") || undefined,
    city: pick(address, "city", "town", "village", "city_district", "county", "state_district"),
    state: matchState(pick(address, "state")),
    pincode: pincode?.length === 6 ? pincode : undefined,
  };
}

/** Asks for the visitor's location and returns the address fields it could work out. */
export async function locateAddress(): Promise<LocationAddress> {
  const position = await getCurrentPosition();
  return reverseGeocode(position.coords.latitude, position.coords.longitude);
}
