import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Plus, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  onStartNewInterview?: () => void;
  onGoToDashboard?: () => void;
  currentView?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onStartNewInterview,
  onGoToDashboard,
  currentView = 'landing',
}) => {
  const { user, signInWithGoogle, signOutUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand: Luxurious Crimson Gradient */}
        <button
          onClick={onGoToDashboard}
          className="flex items-center text-left transition-opacity hover:opacity-90"
        >
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-rose-700 via-red-600 to-rose-600 bg-clip-text text-transparent font-['Outfit']">
            Mock Interview
          </span>
        </button>

        {/* Right Top Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {currentView === 'dashboard' && onStartNewInterview && (
                <button
                  onClick={onStartNewInterview}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-600/20 transition-all hover:from-rose-500 hover:to-red-500 active:scale-95 font-['Outfit']"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Start New Interview</span>
                </button>
              )}

              {currentView !== 'dashboard' && onGoToDashboard && (
                <button
                  onClick={onGoToDashboard}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-700 transition-colors hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700"
                >
                  Dashboard
                </button>
              )}

              {/* User Profile */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-8 w-8 rounded-full border border-rose-200 object-cover ring-2 ring-rose-500/20"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200 font-bold">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                    {user.displayName || 'Candidate'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {user.email}
                  </div>
                </div>

                <button
                  onClick={signOutUser}
                  title="Sign out"
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 shadow-xs transition hover:bg-rose-50/60 hover:border-rose-200 hover:text-rose-700 active:scale-95"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Login with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
