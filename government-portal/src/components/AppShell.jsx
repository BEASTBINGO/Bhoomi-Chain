import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  ArrowRightLeft,
  Link2,
  ClipboardList,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Database,
  FileCheck2,
} from 'lucide-react';

import DashboardPage from '../pages/DashboardPage';
import PropertiesPage from '../pages/PropertiesPage';
import TransfersPage from '../pages/TransfersPage';
import LedgerPage from '../pages/LedgerPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import MasterLandPage from '../pages/MasterLandPage';
import PropertyRegistrationsPage from '../pages/PropertyRegistrationsPage';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'registration', label: 'Property Registration', icon: FileCheck2 },
  { id: 'masterland', label: 'Master Land Database', icon: Database },
  { id: 'transfers', label: 'Transfer Management', icon: ArrowRightLeft },
  { id: 'properties', label: 'Verified Properties', icon: Building2 },
  { id: 'ledger', label: 'Blockchain Ledger', icon: Link2 },
  { id: 'audit', label: 'Audit Logs', icon: ClipboardList },
];

const PAGE_TITLES = {
  dashboard: 'Overview Dashboard',
  registration: 'Citizen Property Registration & AI Forensics',
  masterland: 'Official State Land Records Master Database (100 Cadastral Records)',
  transfers: 'Property Transfer & Multi-Party Escrow Desk',
  properties: 'All Government-Verified Properties',
  ledger: 'Blockchain Ledger Explorer',
  audit: 'System Audit Logs',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

export default function AppShell({ registrar, onLogout }) {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':     return <DashboardPage onNavigate={setActivePage} />;
      case 'registration':  return <PropertyRegistrationsPage />;
      case 'masterland':    return <MasterLandPage />;
      case 'transfers':     return <TransfersPage />;
      case 'properties':    return <PropertiesPage />;
      case 'ledger':        return <LedgerPage />;
      case 'audit':         return <AuditLogsPage />;
      default:              return <DashboardPage onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="gov-app-shell">
      {/* ── Sidebar ── */}
      <aside className="gov-sidebar">
        <div className="gov-sidebar-header">
          <div className="gov-brand">
            <div className="gov-emblem">
              <ShieldCheck size={22} color="#1a1a1a" />
            </div>
            <div>
              <div className="gov-brand-name">BhoomiChain</div>
              <div className="gov-brand-sub">GOV PORTAL</div>
            </div>
          </div>
          <div className="gov-sidebar-tagline">Own with Trust. Transfer with Proof.</div>
        </div>

        <nav className="gov-sidebar-nav">
          <div className="gov-nav-section-label">Main Menu</div>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`gov-nav-item ${activePage === id ? 'active' : ''}`}
              onClick={() => setActivePage(id)}
              id={`nav-${id}`}
            >
              <Icon size={16} />
              <span>{label}</span>
              {activePage === id && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
            </button>
          ))}
        </nav>

        <div className="gov-sidebar-user">
          <div className="gov-user-avatar">{getInitials(registrar.fullName)}</div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div className="gov-user-name">{registrar.fullName}</div>
            <div className="gov-user-role">{registrar.role} &bull; {registrar.govId || 'GOV-MH'}</div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '4px', borderRadius: '6px', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="gov-main">
        <div className="gov-tricolor-bar" />
        <div className="gov-topbar">
          <div className="gov-topbar-title">{PAGE_TITLES[activePage]}</div>
          <div className="gov-topbar-actions">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Demo Environment · Maharashtra Division
            </span>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: 'var(--green-50)', color: 'var(--green-700)',
                border: '1px solid var(--green-100)',
                padding: '3px 10px', borderRadius: '20px',
                fontSize: '0.72rem', fontWeight: 700,
              }}
            >
              <span style={{ width: 6, height: 6, background: 'var(--green-500)', borderRadius: '50%' }} />
              LIVE REGISTER
            </span>
          </div>
        </div>

        <main className="gov-content">
          {renderPage()}
        </main>

        <footer style={{
          background: 'white', borderTop: '1px solid var(--border-light)',
          padding: '12px 24px', textAlign: 'center',
          fontSize: '0.72rem', color: 'var(--text-muted)',
        }}>
          BhoomiChain Government Registrar Portal · Third-Year BE IT Capstone Project · Demo Prototype Only
        </footer>
      </div>
    </div>
  );
}
