import { checkEmail } from "@/lib/email-check";

/** Checks an email address looks real (format, mail domain, not throwaway) without emailing it. */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const email =
    typeof body === "object" && body !== null && "email" in body ? String(body.email) : "";
  return Response.json(await checkEmail(email));
}
