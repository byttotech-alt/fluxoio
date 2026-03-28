import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useThemeStore } from '@/store/themeStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { getInitials, formatDateTime } from '@/lib/utils';
import {
  Search, Bell, Sun, Moon, Menu, ChevronRight, X, Settings, User, LogOut, CreditCard
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Topbar.css';

const BREADCRUMB_MAP: Record<string, string> = {
  '/': 'Dashboard',
  '/leads': 'Leads / CRM',
  '/propostas': 'Propostas',
  '/metas': 'Metas & OKRs',
  '/comissoes': 'Comissões',
  '/financeiro': 'Financeiro',
  '/estoque': 'Estoque',
  '/agenda': 'Agenda',
  '/clientes': 'Clientes',
  '/lista-espera': 'Lista de Espera',
  '/equipe': 'Equipe',
  '/tarefas': 'Tarefas',
  '/wiki': 'Wiki',
  '/configuracoes': 'Configurações',
  '/perfil': 'Meu Perfil',
};

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { toggleMode, mode } = useThemeStore();
  const { setCommandPaletteOpen, setSidebarMobileOpen } = useUIStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Ctrl+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setCommandPaletteOpen]);

  const breadcrumbLabel = BREADCRUMB_MAP[location.pathname] || 'Página';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={() => setSidebarMobileOpen(true)}>
          <Menu size={20} />
        </button>
        <div className="topbar-breadcrumb">
          <span className="breadcrumb-home" onClick={() => navigate('/')}>Dashboard</span>
          {location.pathname !== '/' && (
            <>
              <ChevronRight size={14} />
              <span className="breadcrumb-current">{breadcrumbLabel}</span>
            </>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {/* Search */}
        <button className="topbar-search" onClick={() => setCommandPaletteOpen(true)}>
          <Search size={16} />
          <span>Buscar...</span>
          <kbd>Ctrl+K</kbd>
        </button>

        {/* Theme toggle */}
        <button className="topbar-icon-btn" onClick={toggleMode} title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
          {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="topbar-notif-wrapper" ref={notifRef}>
          <button className="topbar-icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={18} />
            {unreadCount > 0 && <span className="topbar-notif-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="topbar-dropdown notif-dropdown">
              <div className="dropdown-header">
                <h3>Notificações</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead}>Marcar todas como lidas</button>
                )}
              </div>
              <div className="dropdown-body">
                {notifications.length === 0 ? (
                  <p className="dropdown-empty">Nenhuma notificação</p>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}
                      onClick={() => markAsRead(n.id)}>
                      <div className={`notif-dot ${n.type}`} />
                      <div className="notif-content">
                        <span className="notif-title">{n.title}</span>
                        <span className="notif-msg">{n.message}</span>
                        <span className="notif-time">{formatDateTime(n.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="topbar-user-wrapper" ref={userRef}>
          <button className="topbar-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="topbar-avatar" />
            ) : (
              <div className="topbar-avatar-fallback">
                {getInitials(profile?.full_name || 'U')}
              </div>
            )}
          </button>

          {showUserMenu && (
            <div className="topbar-dropdown user-dropdown">
              <div className="dropdown-user-info">
                <span className="dropdown-user-name">{profile?.full_name}</span>
                <span className="dropdown-user-email">{profile?.company_name}</span>
              </div>
              <div className="dropdown-divider" />
              <button className="dropdown-action" onClick={() => { navigate('/perfil'); setShowUserMenu(false); }}>
                <User size={16} /> Meu Perfil
              </button>
              <button className="dropdown-action" onClick={() => { navigate('/configuracoes'); setShowUserMenu(false); }}>
                <Settings size={16} /> Configurações
              </button>
              <button className="dropdown-action" onClick={() => { navigate('/configuracoes'); setShowUserMenu(false); }}>
                <CreditCard size={16} /> Planos
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-action danger" onClick={async () => { await signOut(); navigate('/auth'); }}>
                <LogOut size={16} /> Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
