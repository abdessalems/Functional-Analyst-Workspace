/**
 * Checks the studio password.
 *
 * The check happens here rather than in the browser because this route only
 * exists on the machine running `next dev` — `pageExtensions` drops `.dev.ts`
 * from the static export. That is what makes the password real: it lives in
 * .env.local, is never compiled into the bundle, and cannot be read out of the
 * published page, because the published page has no idea it exists.
 *
 * On the published site the request simply 404s, which the studio reads as
 * "authoring is not available here" — the honest answer.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ ok: false, message: "Not available here." }, { status: 403 });
  }

  const expected = process.env.STUDIO_PASSWORD;
  if (!expected) {
    return Response.json(
      {
        ok: false,
        message: "No STUDIO_PASSWORD is set. Add one to .env.local and restart the dev server.",
      },
      { status: 403 },
    );
  }

  const { password } = (await request.json()) as { password?: string };
  if (password !== expected) {
    return Response.json({ ok: false, message: "Wrong password." }, { status: 401 });
  }

  return Response.json({ ok: true });
}
