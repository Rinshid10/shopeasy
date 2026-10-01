import type { Address } from "@/types";

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

/** Matches a state name from an outside service to the form's list, e.g. "NCT of Delhi" to "Delhi". */
export function matchState(name: string | undefined): string | undefined {
  if (!name) {
    return undefined;
  }
  const lower = name.trim().toLowerCase();
  return (
    INDIAN_STATES.find((state) => state.toLowerCase() === lower) ??
    INDIAN_STATES.find((state) => lower.includes(state.toLowerCase()))
  );
}

export const EMPTY_ADDRESS: Address = {
  fullName: "",
  phone: "",
  houseNumber: "",
  area: "",
  landmark: "",
  pincode: "",
  city: "",
  state: "",
};

export type AddressErrors = Partial<Record<keyof Address, string>>;

/** A 10-digit Indian mobile number, without +91. */
export const PHONE_PATTERN = /^[6-9]\d{9}$/;
export const PINCODE_PATTERN = /^[1-9]\d{5}$/;

/** Returns a message for each field that needs fixing; an empty object means the address is valid. */
export function validateAddress(address: Address): AddressErrors {
  const errors: AddressErrors = {};

  if (address.fullName.trim().length < 2) {
    errors.fullName = "Enter the full name of the person receiving the order.";
  }
  if (!PHONE_PATTERN.test(address.phone)) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }
  if (!address.houseNumber.trim()) {
    errors.houseNumber = "Enter the house number and building name.";
  }
  if (!address.area.trim()) {
    errors.area = "Enter the road name, area or colony.";
  }
  if (!PINCODE_PATTERN.test(address.pincode)) {
    errors.pincode = "Enter a valid 6-digit PIN code.";
  }
  if (!address.city.trim()) {
    errors.city = "Enter the city.";
  }
  if (!address.state) {
    errors.state = "Choose the state.";
  }

  return errors;
}

/** The address on one line, for compact display. */
export function formatAddressLine(address: Address): string {
  return [
    address.houseNumber,
    address.area,
    address.landmark,
    address.city,
    `${address.state} - ${address.pincode}`,
  ]
    .filter(Boolean)
    .join(", ");
}
