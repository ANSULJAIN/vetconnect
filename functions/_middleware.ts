/**
 * Splits one deployment into three addresses:
 *
 *   vetconnect.co.in         pet parents: website, booking, their chats
 *   vet.vetconnect.co.in     veterinarians: registration, dashboard, their chats
 *   admin.vetconnect.co.in   the team: approvals, assignment, funnel
 *
 * Same code and database; the browser keeps a separate sign-in per address,
 * so a vet's dashboard session never mixes with a customer session.
 *
 * Preview deployments (*.pages.dev) and localhost are left alone so every
 * page stays testable on one address.
 */

const MAIN = "vetconnect.co.in";
const VET = "vet.vetconnect.co.in";
const ADMIN = "admin.vetconnect.co.in";

/** Paths every area needs: sign-in, chat, API, and static files. */
const SHARED = [/^\/login\/?/, /^\/chat\/?/, /^\/api\//, /^\/_next\//, /^\/images\//, /^\/favicon/, /\.[a-z0-9]+$/i];

function redirect(host: string, path: string, search: string) {
  return Response.redirect(`https://${host}${path}${search}`, 302);
}

export const onRequest: PagesFunction = async (ctx) => {
  const url = new URL(ctx.request.url);
  const host = url.hostname;
  const path = url.pathname;
  const isShared = SHARED.some((re) => re.test(path));

  // Main site (and www): vet and admin pages live on their own addresses now.
  if (host === MAIN || host === `www.${MAIN}`) {
    if (path.startsWith("/doctor")) return redirect(VET, "/doctor/", url.search);
    if (path.startsWith("/admin")) return redirect(ADMIN, "/admin/", url.search);
    return ctx.next();
  }

  // Vet area: its home is the doctor dashboard.
  if (host === VET) {
    if (path === "/" || path === "") return redirect(VET, "/doctor/", url.search);
    if (path.startsWith("/doctor") || isShared) return ctx.next();
    if (path.startsWith("/admin")) return redirect(ADMIN, "/admin/", url.search);
    return redirect(MAIN, path, url.search); // marketing pages belong on the main site
  }

  // Admin area: its home is the admin panel.
  if (host === ADMIN) {
    if (path === "/" || path === "") return redirect(ADMIN, "/admin/", url.search);
    if (path.startsWith("/admin") || isShared) return ctx.next();
    if (path.startsWith("/doctor")) return redirect(VET, "/doctor/", url.search);
    return redirect(MAIN, path, url.search);
  }

  return ctx.next();
};
