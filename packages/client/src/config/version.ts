/**
 * Aeturnis Online Client Version Configuration
 * Version Format: Phase.Step.Patches
 */

export interface ClientVersion {
  phase: number;
  step: number;
  patches: number;
  full: string;
  codename: string;
  buildDate: string;
  features: string[];
}

export const CLIENT_VERSION: ClientVersion = {
  phase: 1,
  step: 2,
  patches: 0,
  full: '1.2.0',
  codename: 'Mobile Gaming Platform',
  buildDate: '2025-07-11',
  features: [
    'React Native TypeScript Interface',
    'PWA Mobile-First Design',
    'WebSocket Real-time Communication',
    'Touch Gesture Controls',
    'Service Worker Caching',
    'Responsive Game Interface',
    'Framer Motion Animations',
    'React Query State Management',
    'Tailwind CSS Styling',
    'Mobile Game Development Platform'
  ]
};

export const getClientVersionString = (): string => {
  return `v${CLIENT_VERSION.full}`;
};

export const getClientFullVersionInfo = (): string => {
  return `v${CLIENT_VERSION.full} "${CLIENT_VERSION.codename}"`;
};

export const getClientVersionBanner = (): string => {
  return `Aeturnis Online Client ${getClientVersionString()} - ${CLIENT_VERSION.codename}`;
};