import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  Settings,
  LogOut,
  LogIn,
  User as UserIcon,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'dashboard' | 'new-interview' | 'history' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onStartNewInterview: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onStartNewInterview,
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-interview' as ActiveTab, label: 'New Interview', icon: PlusCircle },
    { id: 'history' as ActiveTab, label: 'Past History', icon: History },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200/70 bg-white/75 backdrop-blur-xl flex flex-col justify-between h-screen sticky top-0 z-20 shadow-[4px_0_24px_-4px_rgba(15,23,42,0.03)]">
      <div>
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-slate-200/60 justify-between">
          <div className="flex items-center gap-2.5">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="h-8 w-8 rounded-lg bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-indigo-950/20"
            >
              <Sparkles className="h-4 w-4 text-indigo-300" />
            </motion.div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-slate-900 block leading-tight">
                Mock Interview
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                AI Platform
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                onClick={() => {
                  if (item.id === 'new-interview') {
                    onStartNewInterview();
                  } else {
                    onTabChange(item.id);
                  }
                }}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                {/* Active Tab Spring Pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className="absolute inset-0 rounded-lg bg-white/90 border border-slate-200/80 shadow-xs -z-10"
                  />
                )}

                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <span className="relative z-10">{item.label}</span>

                {item.id === 'new-interview' && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium border border-indigo-100">
                    +
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* User Section Bottom */}
      <div className="p-3 border-t border-slate-200/60">
        {user ? (
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-2 rounded-lg bg-white/60 border border-slate-200/60 backdrop-blur-md shadow-xs transition"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                  <UserIcon className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user.displayName || 'Candidate'}
                </p>
                <p className="text-[10px] text-slate-500 truncate font-mono">
                  {user.email}
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={signOutUser}
              title="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-600 transition"
            >
              <LogOut className="h-3.5 w-3.5" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-medium text-slate-700 bg-white/80 hover:bg-white border border-slate-200/80 rounded-lg shadow-2xs transition"
          >
            <LogIn className="h-3.5 w-3.5 text-slate-500" />
            <span>Sign in with Google</span>
          </motion.button>
        )}
      </div>
    </aside>
  );
};
