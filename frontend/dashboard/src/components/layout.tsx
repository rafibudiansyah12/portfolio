import {
  Activity,
  BookOpenText,
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  FolderKanban,
  Gauge,
  Image,
  LogOut,
  Mail,
  Moon,
  RefreshCw,
  Settings2,
  Sun,
  UserRound,
  Wrench,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { apiDocsUrl, googleLoginUrl } from '../lib/api';
import { useTheme } from './theme';

const navigation = [
  { label: 'Ringkasan', to: '/', icon: Gauge, group: 'Dashboard' },
  { label: 'Proyek', to: '/projects', icon: FolderKanban, group: 'Konten' },
  { label: 'Keahlian', to: '/skills', icon: Wrench, group: 'Konten' },
  { label: 'Pengalaman', to: '/experiences', icon: BriefcaseBusiness, group: 'Konten' },
  { label: 'Profil', to: '/profile', icon: UserRound, group: 'Konten' },
  { label: 'Blog', to: '/posts', icon: BookOpenText, group: 'Konten' },
  { label: 'Media', to: '/media', icon: Image, group: 'Dashboard' },
  { label: 'Inbox', to: '/inbox', icon: Mail, group: 'Dashboard' },
  { label: 'Pengaturan', to: '/settings', icon: Settings2, group: 'Situs' },
  { label: 'Audit log', to: '/audit-logs', icon: Activity, group: 'Situs' },
];

const titles = new Map(navigation.map((item) => [item.to, item.label]));

export function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);
  useEffect(() => setMenuOpen(false), [location.pathname]);
  const title = titles.get(location.pathname) ?? 'Portfolio Admin';
  const groups = [...new Set(navigation.map((item) => item.group))];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">r.</div>
          <div>
            <strong>
              rafi<span>folio</span>
            </strong>
            <small>PANEL PORTOFOLIO</small>
          </div>
        </div>
        <nav className="side-nav" aria-label="Navigasi dashboard">
          {groups.map((group) => (
            <div className="nav-group" key={group}>
              <span className="nav-label">{group}</span>
              {navigation
                .filter((item) => item.group === group)
                .map(({ label, to, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    <span>{label}</span>
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-status">Panel pengelolaan</div>
          <div className="profile-menu-wrap" ref={menuRef}>
            {menuOpen && (
              <div className="profile-menu" role="menu">
                <NavLink
                  to="/profile"
                  className="profile-menu-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserRound size={15} /> Profil &amp; akun
                </NavLink>
                <a className="profile-menu-item" role="menuitem" href={googleLoginUrl}>
                  <RefreshCw size={15} /> Ganti akun Google
                </a>
                <NavLink
                  to="/settings"
                  className="profile-menu-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings2 size={15} /> Pengaturan
                </NavLink>
                <button
                  className="profile-menu-item"
                  role="menuitem"
                  onClick={() => void toggleTheme()}
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />} Ganti tema
                </button>
                <span className="profile-menu-divider" />
                <button
                  className="profile-menu-item danger"
                  role="menuitem"
                  onClick={() => void logout()}
                >
                  <LogOut size={15} /> Keluar
                </button>
              </div>
            )}
            <button
              className="profile-switch"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="avatar-small">{user?.name.slice(0, 1).toUpperCase() ?? 'R'}</span>
              <span className="profile-switch-copy">
                <strong>{user?.name ?? 'Administrator'}</strong>
                <small>{user?.email ?? 'admin@portfolio.dev'}</small>
              </span>
              <ChevronDown size={15} className={menuOpen ? 'chevron-open' : ''} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Dashboard</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <button
              className="topbar-button"
              title="Ganti tema"
              aria-label="Ganti tema"
              onClick={toggleTheme}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <a
              className="topbar-button"
              href={apiDocsUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Dokumentasi API"
            >
              <FileText size={17} />
            </a>
            <span className="topbar-divider" />
            <button className="topbar-user" aria-label="Keluar" onClick={() => void logout()}>
              <span className="avatar-small">{user?.name.slice(0, 1).toUpperCase() ?? 'R'}</span>
              <LogOut size={15} />
            </button>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
        <footer className="app-footer">
          <span>Rafi Folio / Panel pengelolaan</span>
          <span>
            Data tersimpan melalui <strong>API portofolio</strong>
          </span>
        </footer>
      </div>
    </div>
  );
}
