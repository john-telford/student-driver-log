export { auth as default } from '@/auth';

// auth.ts imports @libsql/client which uses file: URLs incompatible with the
// edge runtime's Web-API-only libSQL client. Force Node.js runtime here.
export const runtime = 'nodejs';

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api/auth (NextAuth endpoints)
     * - api/v1 (Bearer-auth REST API — guarded by requireApiUser, not the
     *   session cookie; must NOT be redirected to /login)
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     * - /login, /register, /forgot-password, /reset-password (public auth pages)
     * - /about, /privacy, /terms, /faq, /support, /brand (public info pages)
     * - .well-known (Apple's app-site-association file; Apple's CDN fetches it
     *   signed out and won't follow a redirect to /login)
     */
    '/((?!api/auth|api/v1|_next/static|_next/image|favicon.ico|icon|apple-icon|login|register|forgot-password|reset-password|about|privacy|terms|faq|support|brand|\\.well-known).*)',
  ],
};
