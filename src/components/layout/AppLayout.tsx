import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { useUIStore } from '@/store/uiStore';
import './AppLayout.css';

export function AppLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main" style={{ marginLeft: sidebarCollapsed ? 72 : 260 }}>
        <Topbar />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
      <CommandPalette />
    </div>
  );
}
