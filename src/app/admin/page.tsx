'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Users, Mail, Eye, Globe, TrendingUp, Shield, Trash2, 
  UserCheck, Loader2, RefreshCw, BarChart3, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Stats {
  overview: {
    totalUsers: number;
    totalLetters: number;
    openedLetters: number;
    publicLetters: number;
    deliveryRate: string;
  };
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string | null;
    createdAt: string;
    isAdmin: boolean;
    _count: {
      sentLetters: number;
      receivedLetters: number;
    };
  }>;
  recentLetters: Array<{
    id: string;
    status: string;
    createdAt: string;
    openedAt: string | null;
    isPublic: boolean;
    senderName: string | null;
    recipientName: string | null;
    recipientEmail: string | null;
    sender: { name: string | null; email: string | null } | null;
    recipient: { name: string | null; email: string | null } | null;
  }>;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'letters'>('overview');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      if (res.status === 403) {
        toast.error('Access denied. Admin only.');
        router.push('/inbox');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      setActionLoading(userId);
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Action failed');
      }
      
      toast.success('Action completed successfully');
      fetchStats();
    } catch (error: any) {
      toast.error(error.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-serif font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-500" />
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Manage Pisma platform</p>
          </div>
          <Button 
            onClick={fetchStats} 
            variant="outline" 
            className="border-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          >
            <StatCard 
              icon={<Users className="w-6 h-6" />}
              label="Total Users"
              value={stats.overview.totalUsers}
              color="blue"
            />
            <StatCard 
              icon={<Mail className="w-6 h-6" />}
              label="Total Letters"
              value={stats.overview.totalLetters}
              color="purple"
            />
            <StatCard 
              icon={<Eye className="w-6 h-6" />}
              label="Opened"
              value={stats.overview.openedLetters}
              color="green"
            />
            <StatCard 
              icon={<Globe className="w-6 h-6" />}
              label="Public Letters"
              value={stats.overview.publicLetters}
              color="orange"
            />
            <StatCard 
              icon={<TrendingUp className="w-6 h-6" />}
              label="Delivery Rate"
              value={`${stats.overview.deliveryRate}%`}
              color="red"
            />
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview', 'users', 'letters'] as const).map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? 'default' : 'outline'}
              className={activeTab === tab 
                ? 'bg-white text-black' 
                : 'border-white/20 hover:bg-white/10'
              }
            >
              {tab === 'overview' && <BarChart3 className="w-4 h-4 mr-2" />}
              {tab === 'users' && <Users className="w-4 h-4 mr-2" />}
              {tab === 'letters' && <Mail className="w-4 h-4 mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
        >
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Platform Overview</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg text-gray-400">Recent Activity</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                      <span>New users today</span>
                      <span className="font-bold text-blue-400">
                        {stats.recentUsers.filter(u => 
                          new Date(u.createdAt).toDateString() === new Date().toDateString()
                        ).length}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                      <span>Letters sent today</span>
                      <span className="font-bold text-purple-400">
                        {stats.recentLetters.filter(l => 
                          new Date(l.createdAt).toDateString() === new Date().toDateString()
                        ).length}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg text-gray-400">Quick Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                      <span>Avg letters per user</span>
                      <span className="font-bold text-green-400">
                        {stats.overview.totalUsers > 0 
                          ? (stats.overview.totalLetters / stats.overview.totalUsers).toFixed(1)
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-white/5 rounded-lg">
                      <span>Pending letters</span>
                      <span className="font-bold text-orange-400">
                        {stats.overview.totalLetters - stats.overview.openedLetters}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && stats && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Users ({stats.recentUsers.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-white/10">
                      <th className="pb-3 pr-4">User</th>
                      <th className="pb-3 pr-4">Email</th>
                      <th className="pb-3 pr-4">Joined</th>
                      <th className="pb-3 pr-4">Letters</th>
                      <th className="pb-3 pr-4">Role</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-white/5">
                        <td className="py-3 pr-4">
                          <span className="font-medium">{user.name || 'Anonymous'}</span>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{user.email}</td>
                        <td className="py-3 pr-4 text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-blue-400">{user._count.sentLetters} sent</span>
                          {' / '}
                          <span className="text-green-400">{user._count.receivedLetters} received</span>
                        </td>
                        <td className="py-3 pr-4">
                          {user.isAdmin ? (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">
                              Admin
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-sm">
                              User
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            {!user.isAdmin ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                                onClick={() => handleUserAction(user.id, 'makeAdmin')}
                                disabled={actionLoading === user.id}
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <UserCheck className="w-3 h-3" />
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                                onClick={() => handleUserAction(user.id, 'removeAdmin')}
                                disabled={actionLoading === user.id}
                              >
                                {actionLoading === user.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Shield className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this user?')) {
                                  handleUserAction(user.id, 'delete');
                                }
                              }}
                              disabled={actionLoading === user.id}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'letters' && stats && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recent Letters</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-white/10">
                      <th className="pb-3 pr-4">From</th>
                      <th className="pb-3 pr-4">To</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Created</th>
                      <th className="pb-3 pr-4">Opened</th>
                      <th className="pb-3">Public</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentLetters.map((letter) => (
                      <tr key={letter.id} className="border-b border-white/5">
                        <td className="py-3 pr-4">
                          {letter.sender?.name || letter.senderName || 'Anonymous'}
                        </td>
                        <td className="py-3 pr-4">
                          {letter.recipient?.name || letter.recipientName || letter.recipientEmail || 'Unknown'}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded text-sm ${
                            letter.status === 'opened' 
                              ? 'bg-green-500/20 text-green-400'
                              : letter.status === 'delivered'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {letter.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">
                          {new Date(letter.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 pr-4 text-gray-400">
                          {letter.openedAt 
                            ? new Date(letter.openedAt).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td className="py-3">
                          {letter.isPublic ? (
                            <Globe className="w-4 h-4 text-green-400" />
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}

function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
  color: 'blue' | 'purple' | 'green' | 'orange' | 'red';
}) {
  const colors = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30',
    green: 'from-green-500/20 to-green-600/5 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/30',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30',
  };

  const iconColors = {
    blue: 'text-blue-400',
    purple: 'text-purple-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
    red: 'text-red-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
      <div className={`${iconColors[color]} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  );
}
