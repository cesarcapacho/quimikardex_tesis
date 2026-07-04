import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FlaskConical, ArrowLeftRight, FileText, 
  Users, LogOut, ChevronLeft, Menu, X
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useIsProfesor } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/reactivos', label: 'Reactivos', icon: FlaskConical },
  { path: '/kardex', label: 'Kardex', icon: ArrowLeftRight },
  { path: '/reportes', label: 'Reportes', icon: FileText },
];

const PROFESOR_ITEMS = [
  { path: '/usuarios', label: 'Usuarios', icon: Users },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const isProfesor = useIsProfesor();

  const items = isProfesor ? [...NAV_ITEMS, ...PROFESOR_ITEMS] : NAV_ITEMS;

  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  return (
    <>
      {/* Mobile top bar — always visible on mobile */}
      <div className="fixed top-0 left-0 right-0 h-14 z-40 flex items-center md:hidden bg-background border-b border-border px-4">
        {/* Hamburger: only when sidebar is closed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className={`flex-1 flex items-center gap-2 ${collapsed ? 'justify-center' : 'justify-start pl-2'}`}>
          <FlaskConical className="w-4 h-4 text-primary" />
          <span className="font-heading font-semibold text-sm">QUIMIKARDEX</span>
        </div>
        {/* Spacer to keep title centered when hamburger is visible */}
        {collapsed && <div className="w-9" />}
      </div>

      {/* Sidebar drawer */}
      <aside className={`
        fixed top-0 left-0 z-40 h-full bg-sidebar border-r border-sidebar-border
        transition-all duration-200 ease-in-out flex flex-col w-60
        md:translate-x-0 ${collapsed ? '-translate-x-full' : 'translate-x-0'}
      `}>
        {/* Header — desktop */}
        <div className="h-14 hidden md:flex items-center px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FlaskConical className="w-5 h-5 text-sidebar-primary shrink-0" />
            <span className="font-heading font-semibold text-sm text-sidebar-foreground truncate">
              QUIMIKARDEX
            </span>
          </div>
        </div>

        {/* Mobile sidebar header: close button + title */}
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border md:hidden">
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-md hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex-1 flex items-center justify-center gap-2">
            <FlaskConical className="w-4 h-4 text-sidebar-primary" />
            <span className="font-heading font-semibold text-sm text-sidebar-foreground">QUIMIKARDEX</span>
          </div>
          <div className="w-7" />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 768) setCollapsed(true); }}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'}
                `}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 px-3"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm">Cerrar sesión</span>
          </Button>
        </div>
      </aside>
    </>
  );
}