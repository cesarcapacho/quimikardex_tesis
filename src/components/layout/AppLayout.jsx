import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';

export default function AppLayout() {
  // collapsed only used on mobile; desktop sidebar is always visible
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      {/* Overlay — mobile only, closes sidebar on tap */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
      {/* Desktop: always offset by sidebar width. Mobile: only top-bar offset */}
      <main className="min-h-screen md:ml-60 pt-14 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}