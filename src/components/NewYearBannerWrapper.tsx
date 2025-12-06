'use client';

import dynamic from 'next/dynamic';

const NewYearBanner = dynamic(
  () => import('./NewYearEffects').then(mod => mod.NewYearBanner),
  { ssr: false }
);

export function NewYearBannerWrapper() {
  return <NewYearBanner />;
}
