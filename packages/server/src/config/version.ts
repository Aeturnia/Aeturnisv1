/**
 * Aeturnis Online Server Version Configuration
 * Version Format: Phase.Step.Patches
 */

export interface ServerVersion {
  phase: number;
  step: number;
  patches: number;
  full: string;
  codename: string;
  buildDate: string;
  features: string[];
}

export const SERVER_VERSION: ServerVersion = {
  phase: 3,
  step: 2,
  patches: 2,
  full: '3.2.2',
  codename: 'Real Database Architecture',
  buildDate: '2025-07-11',
  features: [
    '14 Real Database Services',
    'Complete Mock Service Elimination',
    'Professional Console Display',
    'CSP Security Configuration',
    'AIPE Infinite Progression Engine',
    'Socket.IO Real-time Communication',
    'PostgreSQL with Drizzle ORM',
    'JWT Authentication System',
    'Redis Caching Layer',
    'Combat Engine v2.0'
  ]
};

export const getVersionString = (): string => {
  return `v${SERVER_VERSION.full}`;
};

export const getFullVersionInfo = (): string => {
  return `v${SERVER_VERSION.full} "${SERVER_VERSION.codename}"`;
};

export const getVersionBanner = (): string => {
  return `Aeturnis Online ${getVersionString()} - ${SERVER_VERSION.codename}`;
};