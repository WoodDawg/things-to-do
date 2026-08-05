import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Things To Do',
    short_name: 'Things To Do',
    description: 'Personal place tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3f5f1',
    theme_color: '#2c5e45',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
