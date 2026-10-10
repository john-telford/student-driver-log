// GET /.well-known/apple-app-site-association — Apple's association file. Its
// webcredentials entry lets iOS offer passwords saved for www.studentdriver.site
// in the iOS app's sign-in fields (the app's Associated Domains entitlement lists
// webcredentials:www.studentdriver.site). Apple's CDN fetches this from the www
// host without following redirects, so the apex domain is not listed in the app.
// The Team ID is public by design: it's in every copy of the app and this file.
export const APP_ID = 'AXUD79ZTFA.site.studentdriver.ios';

export const dynamic = 'force-static';

export function GET(): Response {
  return Response.json({ webcredentials: { apps: [APP_ID] } });
}
