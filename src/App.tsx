/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BackgroundMusicProvider } from './context/BackgroundMusicContext';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { QuickSearchModal } from './components/QuickSearchModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { TeamDetailModal } from './components/TeamDetailModal';
import { LoginModal } from './components/LoginModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { QuickScorePage } from './pages/QuickScorePage';
import { StudentsPage } from './pages/StudentsPage';
import { CriteriaPage } from './pages/CriteriaPage';
import { WeeklyReportPage } from './pages/WeeklyReportPage';
import { LogsPage } from './pages/LogsPage';
import { SettingsPage } from './pages/SettingsPage';

// Mobile Bottom Nav Icons
import { LayoutDashboard, Trophy, Zap, FileBarChart, Menu } from 'lucide-react';
import { Student } from './types';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Student passed specifically to QuickScorePage
  const [preselectedStudentForScore, setPreselectedStudentForScore] = useState<Student | null>(null);

  const { user, setSelectedStudent, setSelectedTeam } = useApp();

  // If user is not logged in, automatically open login modal
  useEffect(() => {
    if (!user) {
      setIsLoginModalOpen(true);
    }
  }, [user]);

  const handleQuickScoreStudent = (student: Student) => {
    setPreselectedStudentForScore(student);
    setCurrentTab('quick-score');
  };

  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigateToLeaderboard={() => setCurrentTab('leaderboard')}
            onNavigateToQuickScore={() => setCurrentTab('quick-score')}
            onNavigateToReport={() => setCurrentTab('report')}
            onSelectStudent={(s) => setSelectedStudent(s)}
            onSelectTeam={(teamNum) => setSelectedTeam(teamNum)}
          />
        );
      case 'leaderboard':
        return (
          <LeaderboardPage
            onSelectStudent={(s) => setSelectedStudent(s)}
            onQuickScore={handleQuickScoreStudent}
          />
        );
      case 'quick-score':
        return (
          <QuickScorePage
            preselectedStudent={preselectedStudentForScore}
            onClearPreselected={() => setPreselectedStudentForScore(null)}
          />
        );
      case 'students':
        return (
          <StudentsPage
            onSelectStudent={(s) => setSelectedStudent(s)}
            onQuickScore={handleQuickScoreStudent}
          />
        );
      case 'criteria':
        return <CriteriaPage />;
      case 'report':
        return <WeeklyReportPage onSelectStudent={(s) => setSelectedStudent(s)} />;
      case 'logs':
        return <LogsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <DashboardPage
            onNavigateToLeaderboard={() => setCurrentTab('leaderboard')}
            onNavigateToQuickScore={() => setCurrentTab('quick-score')}
            onNavigateToReport={() => setCurrentTab('report')}
            onSelectStudent={(s) => setSelectedStudent(s)}
            onSelectTeam={(teamNum) => setSelectedTeam(teamNum)}
          />
        );
    }
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden font-sans bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(248, 250, 252, 0.86), rgba(241, 245, 249, 0.90)), url('https://i.postimg.cc/13L3CcKG/anh-nen-lop-8-1.png')`,
      }}
    >
      {/* Sidebar for Desktop & Mobile Drawer */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6 pb-24 lg:pb-8">
          {renderCurrentPage()}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (OPTIMIZED FOR 1-HAND PHONE USAGE) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md lg:hidden shadow-lg">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 text-[10px] font-bold transition-colors ${
            currentTab === 'dashboard' ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>Tổng quan</span>
        </button>

        <button
          onClick={() => setCurrentTab('leaderboard')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 text-[10px] font-bold transition-colors ${
            currentTab === 'leaderboard' ? 'text-amber-600' : 'text-slate-500'
          }`}
        >
          <Trophy className="h-5 w-5" />
          <span>Bảng hạng</span>
        </button>

        {/* Center Floating Quick Score Button */}
        <button
          onClick={() => setCurrentTab('quick-score')}
          className="relative -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-tr from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/40 active:scale-90 transition-transform"
          aria-label="Chấm điểm nhanh"
        >
          <Zap className="h-6 w-6 fill-white" />
        </button>

        <button
          onClick={() => setCurrentTab('report')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 text-[10px] font-bold transition-colors ${
            currentTab === 'report' ? 'text-indigo-600' : 'text-slate-500'
          }`}
        >
          <FileBarChart className="h-5 w-5" />
          <span>Báo cáo</span>
        </button>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2 text-[10px] font-bold text-slate-500 hover:text-slate-900"
        >
          <Menu className="h-5 w-5" />
          <span>Menu</span>
        </button>
      </div>

      {/* Global Modals */}
      <QuickSearchModal onOpenQuickScoreForStudent={handleQuickScoreStudent} />
      <StudentProfileModal onQuickScore={handleQuickScoreStudent} />
      <TeamDetailModal onQuickScore={handleQuickScoreStudent} />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <BackgroundMusicProvider>
        <MainLayout />
      </BackgroundMusicProvider>
    </AppProvider>
  );
}
