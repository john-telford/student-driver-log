export { auth as default } from '@/auth';

// auth.ts imports @libsql/client which uses file: URLs incompatible with the
// edge runtime's Web-API-only libSQL client. Force Node.js runtime here.
export const runtime = 'nodejs';

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api/auth (NextAuth endpoints)
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     * - /login, /register (public auth pages)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|icon|apple-icon|login|register).*)',
  ],
};
