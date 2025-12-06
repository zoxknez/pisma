'use client';

import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher, useI18n } from '@/lib/i18n';
import { Globe, Mail, Inbox, Menu, X } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setLastScrollY(latest);
  });

  // Close mobile menu when route changes or screen resizes
  useEffect(() => {
    const handleResize = () => setMobileMenuOpen(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0 },
          hidden: { y: -100 },
        }}
        animate={hidden ? "hidden" : "visible"}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-4 backdrop-blur-md bg-black/50 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-white z-50">
            PISMA
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/community">
              <Button variant="ghost" className="text-gray-400 hover:text-white gap-2">
                <Globe className="w-4 h-4" /> {t.nav.community}
              </Button>
            </Link>
            {session ? (
              <>
                <Link href="/write">
                  <Button variant="ghost" className="text-gray-400 hover:text-white gap-2">
                    <Mail className="w-4 h-4" /> {t.nav.write}
                  </Button>
                </Link>
                <Link href="/inbox">
                  <Button variant="outline" className="gap-2 border-white/20 hover:bg-white/10 text-white">
                    <Inbox className="w-4 h-4" /> {t.nav.inbox}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-400 hover:text-white">
                    {t.nav.login}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white">
                    {t.nav.register}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 z-50"
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 md:hidden flex flex-col gap-6"
          >
            <Link href="/community" onClick={() => setMobileMenuOpen(false)}>
              <div className="flex items-center gap-4 text-xl text-gray-300 hover:text-white py-2 border-b border-white/10">
                <Globe className="w-6 h-6" /> {t.nav.community}
              </div>
            </Link>
            
            {session ? (
              <>
                <Link href="/write" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-4 text-xl text-gray-300 hover:text-white py-2 border-b border-white/10">
                    <Mail className="w-6 h-6" /> {t.nav.write}
                  </div>
                </Link>
                <Link href="/inbox" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-4 text-xl text-gray-300 hover:text-white py-2 border-b border-white/10">
                    <Inbox className="w-6 h-6" /> {t.nav.inbox}
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <div className="text-xl text-gray-300 hover:text-white py-2 border-b border-white/10">
                    {t.nav.login}
                  </div>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <div className="text-xl text-white font-semibold py-2">
                    {t.nav.register}
                  </div>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
