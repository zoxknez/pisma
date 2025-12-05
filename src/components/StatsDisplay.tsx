'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { 
  Mail, Users, Send, Clock, Heart, TrendingUp, 
  Sparkles, Globe, Award, Zap 
} from 'lucide-react';

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const spring = useSpring(0, { damping: 30, stiffness: 100 });
  
  useEffect(() => {
    spring.set(target);
  }, [target, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      setCount(Math.round(latest));
    });
    return unsubscribe;
  }, [spring]);

  return count;
}

// Single stat card
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  delay?: number;
}

function StatCard({ icon, label, value, suffix = '', color, delay = 0 }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const animatedValue = useAnimatedCounter(isVisible ? value : 0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
      <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 overflow-hidden">
        {/* Background glow */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
          style={{ backgroundColor: color }}
        />
        
        {/* Icon */}
        <motion.div 
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ backgroundColor: `${color}20` }}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ color }}>{icon}</div>
        </motion.div>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">
            {animatedValue.toLocaleString()}
          </span>
          {suffix && (
            <span className="text-lg text-white/60">{suffix}</span>
          )}
        </div>

        {/* Label */}
        <p className="text-white/60 text-sm mt-1">{label}</p>

        {/* Sparkle effect on hover */}
        <motion.div
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Live activity indicator
function LiveActivity() {
  const [activities, setActivities] = useState<string[]>([]);

  const sampleActivities = [
    '💌 Pismo poslato u Beograd',
    '📬 Novo pismo stiglo u Zagreb',
    '❤️ Neko je reagovao na pismo',
    '✉️ Pismo čeka otključavanje',
    '🎉 Novi korisnik se pridružio',
    '💝 Ljubavno pismo u tranzitu',
  ];

  useEffect(() => {
    const addActivity = () => {
      const newActivity = sampleActivities[Math.floor(Math.random() * sampleActivities.length)];
      setActivities(prev => [newActivity, ...prev.slice(0, 2)]);
    };

    addActivity();
    const interval = setInterval(addActivity, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
        </span>
        <span className="text-white/80 text-sm font-medium">Uživo aktivnost</span>
      </div>
      <AnimatePresence mode="popLayout">
        {activities.map((activity, index) => (
          <motion.div
            key={activity + index}
            initial={{ opacity: 0, x: -20, height: 0 }}
            animate={{ opacity: 1 - index * 0.3, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: 20, height: 0 }}
            className="text-white/60 text-sm py-1"
          >
            {activity}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// World map visualization (simplified)
function GlobalReach() {
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-blue-400" />
        <span className="text-white/80 text-sm font-medium">Globalni doseg</span>
      </div>
      <div className="relative h-24 overflow-hidden">
        {/* Animated dots representing letter destinations */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-amber-400"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              delay: i * 0.3,
              repeat: Infinity,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/40 text-xs">Pisma putuju širom sveta</span>
        </div>
      </div>
    </div>
  );
}

// Main stats dashboard component
interface PlatformStatsProps {
  className?: string;
}

interface Stats {
  overview: {
    totalUsers: number;
    totalLetters: number;
    lettersDeliveredToday: number;
    lettersInTransit: number;
  };
  trends: {
    lettersSent: number;
    deliveryRate: number;
  };
}

export function PlatformStats({ className = '' }: PlatformStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-2xl p-6 animate-pulse">
            <div className="w-12 h-12 bg-white/10 rounded-xl mb-4" />
            <div className="h-8 bg-white/10 rounded w-20 mb-2" />
            <div className="h-4 bg-white/10 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  // Use mock data if API fails
  const data = stats || {
    overview: { totalUsers: 1247, totalLetters: 8934, lettersDeliveredToday: 127, lettersInTransit: 342 },
    trends: { lettersSent: 892, deliveryRate: 94 },
  };

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Aktivnih korisnika"
          value={data.overview.totalUsers}
          color="#8B5CF6"
          delay={0}
        />
        <StatCard
          icon={<Mail className="w-6 h-6" />}
          label="Poslato pisama"
          value={data.overview.totalLetters}
          color="#EC4899"
          delay={100}
        />
        <StatCard
          icon={<Send className="w-6 h-6" />}
          label="Isporučeno danas"
          value={data.overview.lettersDeliveredToday}
          color="#10B981"
          delay={200}
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="U tranzitu"
          value={data.overview.lettersInTransit}
          color="#F59E0B"
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LiveActivity />
        <GlobalReach />
      </div>
    </div>
  );
}

// User personal stats component
interface UserStatsProps {
  lettersSent: number;
  lettersReceived: number;
  reactionsReceived: number;
  className?: string;
}

export function UserStats({ lettersSent, lettersReceived, reactionsReceived, className = '' }: UserStatsProps) {
  const sentCount = useAnimatedCounter(lettersSent);
  const receivedCount = useAnimatedCounter(lettersReceived);
  const reactionsCount = useAnimatedCounter(reactionsReceived);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-amber-900/20 to-orange-900/20 rounded-2xl p-6 border border-amber-500/20 ${className}`}
    >
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-amber-400" />
        Tvoja statistika
      </h3>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">{sentCount}</div>
          <div className="text-xs text-white/60">Poslato</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-400">{receivedCount}</div>
          <div className="text-xs text-white/60">Primljeno</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-400">{reactionsCount}</div>
          <div className="text-xs text-white/60">Reakcija</div>
        </div>
      </div>

      {/* Achievement hint */}
      {lettersSent >= 10 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 bg-yellow-500/10 rounded-lg p-2 flex items-center gap-2"
        >
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-yellow-400">Pismonoša veteran! 🏆</span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default PlatformStats;
