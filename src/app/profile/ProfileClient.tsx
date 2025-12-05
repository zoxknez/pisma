'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  LogOut, 
  ArrowLeft,
  Send,
  Inbox,
  Edit2,
  Save,
  X,
  Shield,
  Bell,
  Palette,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

interface UserStats {
  lettersSent: number;
  lettersReceived: number;
  lettersOpened: number;
}

export default function ProfileClient() {
  const { t, language } = useI18n();
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({ lettersSent: 0, lettersReceived: 0, lettersOpened: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/profile');
    }
  }, [status, router]);

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user) return;
      
      try {
        const [sentRes, receivedRes] = await Promise.all([
          fetch('/api/letters?type=sent'),
          fetch('/api/letters?type=received'),
        ]);

        if (sentRes.ok && receivedRes.ok) {
          const sentData = await sentRes.json();
          const receivedData = await receivedRes.json();

          const sent = sentData.data || [];
          const received = receivedData.data || [];
          
          setStats({
            lettersSent: sent.length,
            lettersReceived: received.length,
            lettersOpened: received.filter((l: { status: string }) => l.status === 'opened').length,
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchStats();
      setName(session.user.name || '');
    }
  }, [session]);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      toast.error(t.profile.nameEmpty);
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        await update({ name: name.trim() });
        setEditing(false);
        toast.success(t.profile.profileUpdated);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch {
      toast.error(t.profile.updateFailed);
    } finally {
      setSaving(false);
    }
  }, [name, update, t]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const user = session.user;

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 p-6 flex justify-between items-center border-b border-white/5">
        <Link 
          href="/inbox"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.profile.backToInbox}</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t.profile.signOut}
        </Button>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center gap-6 mb-12"
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-4xl md:text-5xl font-serif">
              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            {user.image && (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="absolute inset-0 w-full h-full rounded-full object-cover"
              />
            )}
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-1">
            {editing ? (
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="max-w-xs bg-white/5 border-white/10"
                  placeholder={t.profile.yourName}
                  autoFocus
                />
                <Button
                  size="icon"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setName(user.name || '');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <h1 className="text-3xl md:text-4xl font-serif font-bold">
                  {user.name || t.profile.anonymousUser}
                </h1>
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Edit name"
                >
                  <Edit2 className="w-4 h-4 text-white/60" />
                </button>
              </div>
            )}
            <p className="text-white/60 flex items-center gap-2 mt-2 justify-center md:justify-start">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
            <p className="text-white/40 flex items-center gap-2 mt-1 justify-center md:justify-start text-sm">
              <Calendar className="w-4 h-4" />
              {t.profile.memberSince} {new Date().toLocaleDateString(language === 'sr' ? 'sr-RS' : 'en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-white/60">{t.profile.lettersSent}</span>
            </div>
            <p className="text-4xl font-serif font-bold">{stats.lettersSent}</p>
          </div>

          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Inbox className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-white/60">{t.profile.lettersReceived}</span>
            </div>
            <p className="text-4xl font-serif font-bold">{stats.lettersReceived}</p>
          </div>

          <div className="bg-zinc-900/50 rounded-2xl p-6 border border-white/5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-white/60">{t.profile.lettersOpened}</span>
            </div>
            <p className="text-4xl font-serif font-bold">{stats.lettersOpened}</p>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5" />
            {t.profile.settings}
          </h2>

          <div className="bg-zinc-900/50 rounded-2xl border border-white/5 divide-y divide-white/5">
            {/* Notifications */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium">{t.profile.emailNotifications}</p>
                  <p className="text-sm text-white/50">{t.profile.emailNotifDesc}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Theme */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">{t.profile.theme}</p>
                  <p className="text-sm text-white/50">{t.profile.themeDesc}</p>
                </div>
              </div>
              <span className="text-white/60 text-sm">{t.profile.dark} (Default)</span>
            </div>

            {/* Privacy */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{t.profile.privacy}</p>
                  <p className="text-sm text-white/50">{t.profile.privacyDesc}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                {t.profile.manage}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <h2 className="text-xl font-semibold text-red-400 mb-4">{t.profile.dangerZone}</h2>
          <div className="bg-red-500/5 rounded-2xl border border-red-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t.profile.deleteAccount}</p>
                <p className="text-sm text-white/50">{t.profile.deleteAccountDesc}</p>
              </div>
              <Button variant="destructive" size="sm">
                {t.profile.deleteAccount}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
