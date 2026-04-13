export { auth as default } from '@/auth';

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api/auth (NextAuth endpoints)
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico
     * - /login, /register (public auth pages)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
};
