'use client';

import { motion } from 'framer-motion';
import { FileQuestion, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center max-w-md"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/10 flex items-center justify-center">
          <FileQuestion className="w-10 h-10 text-purple-500" />
        </div>

        <h1 className="text-6xl font-serif font-bold mb-4">404</h1>

        <h2 className="text-2xl font-semibold mb-4">
          Letter Not Found
        </h2>

        <p className="text-white/60 mb-8">
          This letter seems to have gotten lost in transit. Perhaps it was never sent, or maybe it found another home.
        </p>

        <div className="flex gap-4 justify-center">
          <Button variant="default" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/track">
              <Search className="w-4 h-4 mr-2" />
              Track Letter
            </Link>
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
