'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  velocity: number;
  rotation: number;
  type: 'confetti' | 'star' | 'sparkle';
}

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

export function NewYearConfetti({ isActive }: { isActive: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const createParticle = useCallback((index: number): Particle => {
    const types: ('confetti' | 'star' | 'sparkle')[] = ['confetti', 'star', 'sparkle'];
    return {
      id: Date.now() + index,
      x: Math.random() * 100,
      y: -10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      angle: Math.random() * 360,
      velocity: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      type: types[Math.floor(Math.random() * types.length)],
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Initial burst
    const initialParticles = Array.from({ length: 50 }, (_, i) => createParticle(i));
    setParticles(initialParticles);

    // Continuous particles
    const interval = setInterval(() => {
      setParticles(prev => {
        const filtered = prev.filter(p => p.y < 110);
        const newParticles = Array.from({ length: 3 }, (_, i) => createParticle(i));
        return [...filtered, ...newParticles].slice(-100);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isActive, createParticle]);

  useEffect(() => {
    if (!isActive) return;

    const animationFrame = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          y: p.y + p.velocity,
          x: p.x + Math.sin(p.angle * Math.PI / 180) * 0.5,
          rotation: p.rotation + 5,
        }))
      );
    }, 50);

    return () => clearInterval(animationFrame);
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              transform: `rotate(${particle.rotation}deg)`,
            }}
          >
            {particle.type === 'confetti' && (
              <div
                style={{
                  width: particle.size,
                  height: particle.size * 0.6,
                  backgroundColor: particle.color,
                  borderRadius: '2px',
                }}
              />
            )}
            {particle.type === 'star' && (
              <div style={{ color: particle.color, fontSize: particle.size }}>
                ★
              </div>
            )}
            {particle.type === 'sparkle' && (
              <div style={{ color: particle.color, fontSize: particle.size }}>
                ✦
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function NewYearCountdown() {
  const [timeToNewYear, setTimeToNewYear] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const newYear = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0);
      const diff = newYear.getTime() - now.getTime();

      if (diff <= 0) return null;

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeToNewYear(calculateTime());
    const interval = setInterval(() => {
      setTimeToNewYear(calculateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!timeToNewYear) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-yellow-500/20 via-orange-500/10 to-red-500/20 border border-yellow-500/30 rounded-xl p-4 mb-4"
    >
      <div className="text-center">
        <p className="text-yellow-300 text-sm mb-2">🎆 Countdown to 2026</p>
        <div className="flex justify-center gap-4 font-mono">
          <div className="text-center">
            <span className="text-2xl font-bold text-white">{timeToNewYear.days}</span>
            <p className="text-xs text-yellow-200/60">days</p>
          </div>
          <span className="text-2xl text-yellow-400">:</span>
          <div className="text-center">
            <span className="text-2xl font-bold text-white">{String(timeToNewYear.hours).padStart(2, '0')}</span>
            <p className="text-xs text-yellow-200/60">hours</p>
          </div>
          <span className="text-2xl text-yellow-400">:</span>
          <div className="text-center">
            <span className="text-2xl font-bold text-white">{String(timeToNewYear.minutes).padStart(2, '0')}</span>
            <p className="text-xs text-yellow-200/60">min</p>
          </div>
          <span className="text-2xl text-yellow-400">:</span>
          <div className="text-center">
            <span className="text-2xl font-bold text-white">{String(timeToNewYear.seconds).padStart(2, '0')}</span>
            <p className="text-xs text-yellow-200/60">sec</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function NewYearBanner() {
  const [isVisible, setIsVisible] = useState(true);

  // Check if it's New Year season (December 1 - January 15)
  const isNewYearSeason = (() => {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();
    return (month === 11 && day >= 1) || (month === 0 && day <= 15);
  })();

  if (!isNewYearSeason || !isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="relative mt-20 md:mt-24 bg-gradient-to-r from-yellow-900/90 via-red-900/90 to-purple-900/90 backdrop-blur-md border-b border-white/10 text-white py-3 px-4 overflow-hidden z-40"
    >
      {/* Animated sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-200"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 8 + 6}px`,
            }}
          >
            ✦
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎆</span>
          <span className="font-serif font-medium text-sm sm:text-base">
            New Year Special! Send wishes that arrive at midnight 🎊
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href="/write?template=new-year" 
            className="px-4 py-1.5 bg-white text-black text-xs sm:text-sm font-bold rounded-full hover:bg-yellow-100 transition-colors shadow-lg shadow-yellow-500/20"
          >
            Write Now
          </a>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/50 hover:text-white transition-colors p-1"
            aria-label="Close banner"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
}
