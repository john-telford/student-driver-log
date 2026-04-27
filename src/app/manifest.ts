import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Student Driver Log',
    short_name: 'Driver Log',
    description: "Track Illinois learner's permit practice hours",
    start_url: '/dashboard',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: '#006B3C',
    background_color: '#006B3C',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
