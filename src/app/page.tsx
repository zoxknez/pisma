'use client';

import { useEffect, useState, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { PlatformStats } from "@/components/StatsDisplay";
import { useI18n, LanguageSwitcher } from "@/lib/i18n";
import { Navbar } from "@/components/Navbar";
import { 
  Clock, Palette, Mic, Heart, Shield, Mail, 
  ArrowRight, Sparkles 
} from "lucide-react";

// Feature card component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors group"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; moveY: number; duration: number }[]>([]);
  const { scrollY } = useScroll();
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Features data - now using translations
  const features = useMemo(() => [
    {
      icon: <Clock className="w-6 h-6 text-amber-400" />,
      title: t.features.timeLocked,
      description: t.features.timeLockedDesc,
    },
    {
      icon: <Palette className="w-6 h-6 text-pink-400" />,
      title: t.features.personalized,
      description: t.features.personalizedDesc,
    },
    {
      icon: <Mic className="w-6 h-6 text-blue-400" />,
      title: t.features.voice,
      description: t.features.voiceDesc,
    },
    {
      icon: <Heart className="w-6 h-6 text-red-400" />,
      title: t.features.reactions,
      description: t.features.reactionsDesc,
    },
    {
      icon: <Shield className="w-6 h-6 text-green-400" />,
      title: t.features.secure,
      description: t.features.secureDesc,
    },
    {
      icon: <Mail className="w-6 h-6 text-purple-400" />,
      title: t.features.qrCode,
      description: t.features.qrCodeDesc,
    },
  ], [t]);

  useEffect(() => {
    setParticles(
      [...Array(30)].map((_, i) => ({
        id: i,
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
        moveY: Math.random() * -200,
        duration: Math.random() * 8 + 5,
      }))
    );
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center relative overflow-hidden bg-black selection:bg-white selection:text-black">
      
      <Navbar />
      
      {/* Hero Section */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity }}
        className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      >
        {/* Ambient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/20 rounded-full blur-[150px]" />
          <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-blue-900/20 rounded-full blur-[100px]" />
        </div>

        <div className="z-10 max-w-5xl w-full flex flex-col items-center text-center space-y-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <span className="text-sm font-mono text-gray-300">{t.home.tagline}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl sm:text-7xl md:text-9xl font-serif font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-500 px-4"
          >
            {t.home.title}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl font-light leading-relaxed px-4"
          >
            {t.home.subtitle} <br className="hidden sm:block"/>
            <span className="text-gray-500">{t.home.subtitleSecond}</span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Link href="/write">
              <Button size="lg" variant="glow" className="text-lg px-8 h-14 rounded-full group">
                {t.home.composeButton}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href="/track">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14 rounded-full border-white/20 hover:bg-white/10 text-white">
                {t.home.trackButton}
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-white/40"
          >
            <span className="text-xs">{t.home.scroll}</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>

        {/* Decorative Circles */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full pointer-events-none z-0"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none z-0"
        />
      </motion.section>

      {/* Stats Section */}
      <section className="w-full max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-white mb-4">
            {t.home.communityTitle}
          </h2>
          <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
            {t.home.communitySubtitle}
          </p>
          <PlatformStats />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-white mb-4">
            {t.home.whyTitle}
          </h2>
          <p className="text-center text-white/60 mb-12 max-w-2xl mx-auto">
            {t.home.whySubtitle}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-3xl p-6 md:p-12 text-center border border-amber-500/20 overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-6xl mb-6"
            >
              ✉️
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
              {t.home.ctaTitle}
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              {t.home.ctaSubtitle}
            </p>
            <Link href={session ? "/write" : "/auth/register"}>
              <Button size="lg" variant="glow" className="text-lg px-10 h-14 rounded-full">
                {session ? t.home.composeButton : t.home.ctaButton}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-2xl font-serif font-bold text-white/80">PISMA</div>
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Pisma. {t.home.footer}
          </p>
          <div className="flex gap-6">
            <Link href="/track" className="text-white/40 hover:text-white text-sm transition-colors">
              {t.nav.track}
            </Link>
            <Link href="/write" className="text-white/40 hover:text-white text-sm transition-colors">
              {t.nav.write}
            </Link>
            <Link href="/inbox" className="text-white/40 hover:text-white text-sm transition-colors">
              {t.nav.inbox}
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-white/20 rounded-full pointer-events-none"
          initial={{
            x: p.x,
            y: p.y,
          }}
          animate={{
            y: [null, p.moveY],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

    </main>
  );
}
