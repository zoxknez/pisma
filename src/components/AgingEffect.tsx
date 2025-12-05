'use client';

import { useMemo } from 'react';

interface AgingEffectProps {
  createdAt: Date;
  openedAt?: Date | null;
  paperType: string;
  agingEnabled: boolean;
  children: React.ReactNode;
}

export function AgingEffect({ createdAt, openedAt, paperType, agingEnabled, children }: AgingEffectProps) {
  const agingStyle = useMemo(() => {
    if (!agingEnabled) return {};

    const now = openedAt ? new Date(openedAt) : new Date();
    const created = new Date(createdAt);
    const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    
    // Calculate aging intensity (0 to 1, maxes out at ~1 week)
    const intensity = Math.min(hoursElapsed / 168, 1);

    // Generate deterministic "random" positions for stains based on hours
    const seed = hoursElapsed % 100;
    
    return {
      // Yellowing effect
      filter: `sepia(${intensity * 0.3}) contrast(${1 - intensity * 0.1})`,
      
      // CSS variables for pseudo-elements
      '--aging-intensity': intensity,
      '--stain-opacity': Math.min(intensity * 0.3, 0.2),
      '--fold-opacity': Math.min(intensity * 0.4, 0.3),
      '--edge-wear': intensity * 2,
    } as React.CSSProperties;
  }, [createdAt, openedAt, agingEnabled]);

  const getAgingOverlays = () => {
    if (!agingEnabled) return null;

    const now = openedAt ? new Date(openedAt) : new Date();
    const created = new Date(createdAt);
    const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    const intensity = Math.min(hoursElapsed / 168, 1);

    if (intensity < 0.1) return null;

    return (
      <>
        {/* Coffee/Tea stain */}
        {intensity > 0.2 && (
          <div
            className="absolute pointer-events-none rounded-full mix-blend-multiply"
            style={{
              width: 60 + intensity * 40,
              height: 50 + intensity * 30,
              top: '15%',
              right: '10%',
              background: `radial-gradient(ellipse, rgba(139, 90, 43, ${intensity * 0.15}) 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Fold lines */}
        {intensity > 0.3 && (
          <>
            <div
              className="absolute left-0 right-0 h-[1px] pointer-events-none"
              style={{
                top: '33%',
                background: `linear-gradient(90deg, transparent, rgba(0,0,0,${intensity * 0.1}), transparent)`,
              }}
            />
            <div
              className="absolute left-0 right-0 h-[1px] pointer-events-none"
              style={{
                top: '66%',
                background: `linear-gradient(90deg, transparent, rgba(0,0,0,${intensity * 0.1}), transparent)`,
              }}
            />
          </>
        )}

        {/* Edge wear/darkening */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 ${30 + intensity * 50}px rgba(139, 90, 43, ${intensity * 0.2})`,
          }}
        />

        {/* Small spots/foxing */}
        {intensity > 0.5 && (
          <>
            {[...Array(Math.floor(intensity * 5))].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 2 + Math.random() * 4,
                  height: 2 + Math.random() * 4,
                  top: `${20 + (i * 17) % 60}%`,
                  left: `${10 + (i * 23) % 80}%`,
                  background: `rgba(139, 90, 43, ${0.1 + Math.random() * 0.1})`,
                }}
              />
            ))}
          </>
        )}

        {/* Corner curl shadow */}
        {intensity > 0.4 && (
          <div
            className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,${intensity * 0.1}) 100%)`,
            }}
          />
        )}

        {/* Vintage vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,${intensity * 0.15}) 100%)`,
          }}
        />
      </>
    );
  };

  return (
    <div className="relative" style={agingStyle}>
      {children}
      {getAgingOverlays()}
    </div>
  );
}

// Utility function to get aging description
export function getAgingDescription(createdAt: Date): string {
  const now = new Date();
  const hoursElapsed = (now.getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);

  if (hoursElapsed < 1) return 'Fresh ink';
  if (hoursElapsed < 24) return 'Recently written';
  if (hoursElapsed < 72) return 'Paper settling';
  if (hoursElapsed < 168) return 'Gently aged';
  if (hoursElapsed < 720) return 'Naturally weathered';
  if (hoursElapsed < 2160) return 'Time-worn patina';
  return 'Antique character';
}
