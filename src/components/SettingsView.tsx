import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Mic, Shield } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, signOutUser, signInWithGoogle } = useAuth();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#09090b] text-zinc-100 pb-16">
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-40 z-0" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 pt-8 space-y-6 text-left">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-zinc-100">Account & Preferences</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Manage your authenticated profile, voice permissions, and persistent data
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Profile Details */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">User Profile</h3>
            <p className="text-xs text-zinc-400">Connected account for Firestore synchronization</p>

            {user ? (
              <div className="mt-4 flex items-center gap-4 p-4 border border-zinc-800 rounded-xl bg-zinc-950/60">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-12 w-12 rounded-full object-cover border border-zinc-700"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                    <User className="h-6 w-6" />
                  </div>
                )}
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-zinc-100">{user.displayName || 'Candidate'}</p>
                  <p className="text-xs text-zinc-400">{user.email}</p>
                  <p className="text-[10px] text-zinc-500 font-mono">UID: {user.uid}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-5 border border-zinc-800 rounded-xl bg-zinc-950/60 text-center space-y-3">
                <p className="text-xs text-zinc-400">You are currently using the app as a guest.</p>
                <button
                  onClick={() => signInWithGoogle()}
                  className="px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-white transition cursor-pointer"
                >
                  Sign in with Google
                </button>
              </div>
            )}
          </div>

          {/* Voice Input Info */}
          <div className="border-t border-zinc-800/80 pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Mic className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Speech-to-Text Recognition</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Voice transcription connects directly to the native Web Speech API. For ideal recognition, allow microphone access in your browser preferences.
            </p>
          </div>

          {/* Security & Firestore Data */}
          <div className="border-t border-zinc-800/80 pt-6">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-200">Data Isolation</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your mock interview transcripts and evaluation feedback are encrypted and secured under strict Firestore rules linked exclusively to your user ID.
            </p>
          </div>

          {user && (
            <div className="border-t border-zinc-800/80 pt-6 flex justify-between items-center">
              <div>
                <p className="text-xs font-medium text-zinc-200">Sign Out</p>
                <p className="text-xs text-zinc-500">Disconnect this session from your Google account</p>
              </div>
              <button
                onClick={signOutUser}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-zinc-800 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
