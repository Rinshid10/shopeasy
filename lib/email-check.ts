import "server-only";

import { resolveMx } from "node:dns/promises";

// Checks that an email address looks real without sending anything: the format, that its
// domain can receive email, and that it isn't a throwaway inbox. It can't prove the person
// owns the inbox; only an emailed code can do that.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Common temporary-inbox domains. */
const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com",
  "20minutemail.com",
  "dispostable.com",
  "emailondeck.com",
  "fakeinbox.com",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "maildrop.cc",
  "mailinator.com",
  "mailnesia.com",
  "mintemail.com",
  "mohmal.com",
  "sharklasers.com",
  "temp-mail.org",
  "tempmail.com",
  "tempmail.net",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
]);

/** Misspellings of popular providers, with the address the customer probably meant. */
const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "yaho.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "hotmal.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "rediffmial.com": "rediffmail.com",
};

export type EmailCheck = { ok: true } | { ok: false; reason: string };

export async function checkEmail(rawEmail: string): Promise<EmailCheck> {
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { ok: false, reason: "Enter a valid email address." };
  }

  const domain = email.slice(email.lastIndexOf("@") + 1);
  const suggestion = DOMAIN_TYPOS[domain];
  if (suggestion) {
    return { ok: false, reason: `Did you mean ${email.replace(domain, suggestion)}?` };
  }
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { ok: false, reason: "Please use your own email, not a temporary one." };
  }

  try {
    const records = await resolveMx(domain);
    if (records.length === 0) {
      return { ok: false, reason: "This email address can't receive mail. Check it." };
    }
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return { ok: false, reason: "This email address can't receive mail. Check it." };
    }
    // A DNS hiccup on our side: don't block a customer for it.
  }
  return { ok: true };
}
