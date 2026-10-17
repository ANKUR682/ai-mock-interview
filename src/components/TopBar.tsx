import React from 'react';
import { Plus, User as UserIcon, LogOut, Sparkles, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export type TopNavTab = 'dashboard' | 'history' | 'settings';

interface TopBarProps {
  activeTab: TopNavTab;
  onTabChange: (tab: TopNavTab) => void;
  onStartNewInterview: () => void;
  onOpenFeatures: () => void;
  onOpenPricing: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onTabChange,
  onStartNewInterview,
  onOpenFeatures,
  onOpenPricing,
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();

  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
      {/* Left: Brand Logo & Navigation Links */}
      <div className="flex items-center gap-6 sm:gap-8">
        <div
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="h-7 w-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950 shadow-xs group-hover:bg-white transition">
            <Terminal className="h-4 w-4 stroke-[2.2]" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-100 group-hover:text-white transition">
            Mock Interview
          </span>
        </div>

        {/* Real Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-zinc-100 bg-zinc-800/80'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={onStartNewInterview}
            className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-md transition cursor-pointer"
          >
            Practice
          </button>

          <button
            onClick={() => onTabChange('history')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
              activeTab === 'history'
                ? 'text-zinc-100 bg-zinc-800/80'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            History
          </button>

          <button
            onClick={onOpenFeatures}
            className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-md transition cursor-pointer"
          >
            Features
          </button>

          <button
            onClick={onOpenPricing}
            className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-md transition cursor-pointer"
          >
            Pricing
          </button>
        </nav>
      </div>

      {/* Right: Actions & User Account */}
      <div className="flex items-center gap-3">
        {/* Primary Action Button (Slate White: #fafafa with #18181b hover) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartNewInterview}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#fafafa] px-3.5 py-1.5 text-xs font-semibold text-[#09090b] hover:bg-white shadow-xs transition cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>New Interview</span>
        </motion.button>

        {/* Compact User Profile / Sign-in */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
            <button
              onClick={() => onTabChange('settings')}
              title={`Signed in as ${user.displayName || user.email}`}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-800/80 transition cursor-pointer"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-7 w-7 rounded-full object-cover border border-zinc-700"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
              )}
            </button>
            <button
              onClick={signOutUser}
              title="Sign out"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => signInWithGoogle()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800 transition cursor-pointer"
          >
            <UserIcon className="h-3.5 w-3.5 text-zinc-400" />
            <span>Sign In</span>
          </motion.button>
        )}
      </div>
    </header>
  );
};
