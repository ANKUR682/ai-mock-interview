import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { Dashboard } from './components/Dashboard';
import { SetupModal } from './components/SetupModal';
import { InterviewRoom } from './components/InterviewRoom';
import { EvaluationReportView } from './components/EvaluationReportView';
import { InterviewSession } from './types/interview';
import { Loader2 } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'interview' | 'evaluation'>('landing');
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Sync view when auth state changes
  useEffect(() => {
    if (!loading) {
      if (user && currentView === 'landing') {
        setCurrentView('dashboard');
      } else if (!user && currentView !== 'landing') {
        setCurrentView('landing');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-gray-500">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-red-600" />
          <p className="mt-3 text-xs tracking-wider uppercase font-bold text-red-600 font-['Outfit']">Loading Mock Interview...</p>
        </div>
      </div>
    );
  }

  const handleStartNewInterview = () => {
    setIsSetupModalOpen(true);
  };

  const handleSessionReady = (session: InterviewSession) => {
    setActiveSession(session);
    setCurrentView('interview');
  };

  const handleFinishInterview = (completedSession: InterviewSession) => {
    setActiveSession(completedSession);
    setCurrentView('evaluation');
  };

  const handleSelectPastSession = (session: InterviewSession) => {
    setActiveSession(session);
    setCurrentView('evaluation');
  };

  const handleResumeSession = (session: InterviewSession) => {
    setActiveSession(session);
    setCurrentView('interview');
  };

  const handleGoToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleRetakeFromReport = () => {
    setIsSetupModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onStartNewInterview={handleStartNewInterview}
        onGoToDashboard={handleGoToDashboard}
        currentView={currentView}
      />

      {/* Main Content Area */}
      <main className="flex-1 bg-white">
        {currentView === 'landing' && (
          <LandingHero onGetStarted={() => {
            if (user) {
              setCurrentView('dashboard');
            } else {
              setIsSetupModalOpen(true);
            }
          }} />
        )}

        {currentView === 'dashboard' && user && (
          <Dashboard
            onStartNewInterview={handleStartNewInterview}
            onSelectSession={handleSelectPastSession}
            onResumeSession={handleResumeSession}
          />
        )}

        {currentView === 'interview' && activeSession && (
          <InterviewRoom
            session={activeSession}
            onFinish={handleFinishInterview}
            onExit={handleGoToDashboard}
          />
        )}

        {currentView === 'evaluation' && activeSession && (
          <EvaluationReportView
            session={activeSession}
            onBackToDashboard={handleGoToDashboard}
            onRetake={handleRetakeFromReport}
          />
        )}
      </main>

      {/* Setup Modal */}
      <SetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onSessionReady={handleSessionReady}
      />

      {/* Clean Footer */}
      <footer className="border-t border-red-100 bg-white py-6 text-center text-xs text-gray-500">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold text-gray-600">&copy; {new Date().getFullYear()} <span className="text-red-600 font-bold font-['Outfit']">Mock Interview</span></p>
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span className="font-medium hover:text-red-600 transition">Role-Specific Questions</span>
            <span>&bull;</span>
            <span className="font-medium hover:text-red-600 transition">Voice & Audio</span>
            <span>&bull;</span>
            <span className="font-medium hover:text-red-600 transition">Cloud Saved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
