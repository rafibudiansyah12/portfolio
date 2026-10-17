import {
  Activity,
  BookOpenText,
  BriefcaseBusiness,
  ChevronDown,
  Command,
  FileText,
  FolderKanban,
  Gauge,
  Image,
  LogOut,
  Mail,
  Moon,
  Settings2,
  Sun,
  UserRound,
  Wrench,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { apiDocsUrl } from '../lib/api';
import { useTheme } from './theme';

const navigation = [
  { label: 'Ringkasan', to: '/', icon: Gauge, group: 'Workspace' },
  { label: 'Proyek', to: '/projects', icon: FolderKanban, group: 'Konten' },
  { label: 'Keahlian', to: '/skills', icon: Wrench, group: 'Konten' },
  { label: 'Pengalaman', to: '/experiences', icon: BriefcaseBusiness, group: 'Konten' },
  { label: 'Profil', to: '/profile', icon: UserRound, group: 'Konten' },
  { label: 'Blog', to: '/posts', icon: BookOpenText, group: 'Konten' },
  { label: 'Media', to: '/media', icon: Image, group: 'Workspace' },
  { label: 'Inbox', to: '/inbox', icon: Mail, group: 'Workspace' },
  { label: 'Pengaturan', to: '/settings', icon: Settings2, group: 'Situs' },
  { label: 'Audit log', to: '/audit-logs', icon: Activity, group: 'Situs' },
];

const titles = new Map(navigation.map((item) => [item.to, item.label]));

export function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
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
            <small>STUDIO CONSOLE</small>
          </div>
        </div>
        <div className="workspace-picker">
          <div className="workspace-avatar">R</div>
          <div>
            <strong>Personal workspace</strong>
            <small>Portfolio utama</small>
          </div>
          <ChevronDown size={15} />
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
                    {label === 'Inbox' && <i className="nav-dot" />}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-status">
            <span className="online-dot" />
            API workspace<span className="status-mini">LIVE</span>
          </div>
          <button className="profile-switch">
            <span className="avatar-small">{user?.name.slice(0, 1).toUpperCase() ?? 'R'}</span>
            <span className="profile-switch-copy">
              <strong>{user?.name ?? 'Administrator'}</strong>
              <small>{user?.email ?? 'admin@portfolio.dev'}</small>
            </span>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-separator">/</span>
            <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <span className="keyboard-hint">
              <Command size={13} /> K
            </span>
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
          <span>
            Portfolio Studio <b>·</b> Content workspace
          </span>
          <span>
            Connected to <strong>portfolio API</strong>
          </span>
        </footer>
      </div>
    </div>
  );
}
