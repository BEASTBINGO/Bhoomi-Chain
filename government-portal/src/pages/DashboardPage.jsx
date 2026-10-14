import React, { useState, useEffect } from 'react';
import {
  Users, Building2, Clock, CheckCircle2,
  ArrowRightLeft, Link2, TrendingUp, AlertTriangle,
} from 'lucide-react';
import { getDashboardStats } from '../services/api';

function StatCard({ icon: Icon, value, label, color, bgColor }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: bgColor }}>
        <Icon size={20} color={color} />
      </div>
      <div className="stat-card-value">{value ?? '—'}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
}

export default function DashboardPage({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();

    // Auto-refresh interval (polling every 4 seconds for real-time stats updates)
    const interval = setInterval(() => {
      loadStats(true);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError('');
    try {
      const data = await getDashboardStats();
      if (data.success) setStats(data.stats);
      else if (!isSilent) setError('Failed to load statistics.');
    } catch (err) {
      if (!isSilent) setError('Could not connect to backend. Is the server running on port 5000?');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-700) 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        color: 'white',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', right: -20, top: -20, width: 180, height: 180,
          borderRadius: '50%', background: 'rgba(255,255,255,0.04)',
        }} />
        <div style={{
          position: 'absolute', right: 60, bottom: -40, width: 120, height: 120,
          borderRadius: '50%', background: 'rgba(245,158,11,0.06)',
        }} />
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Government Registrar Dashboard
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Welcome, Registrar
          </div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
            BhoomiChain Land Records System · Maharashtra Division · Demo Environment
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: 'var(--radius-md)', padding: '10px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>System</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4ade80' }}>ONLINE</div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <div className="stat-card-grid">
          <StatCard
            icon={Users}
            value={stats?.totalCitizens}
            label="Registered Citizens"
            color="var(--navy-500)"
            bgColor="var(--navy-50)"
          />
          <StatCard
            icon={CheckCircle2}
            value={stats?.verifiedProperties}
            label="Verified Properties"
            color="var(--green-600)"
            bgColor="var(--green-50)"
          />
          <StatCard
            icon={Clock}
            value={stats?.pendingVerifications}
            label="Pending Verification"
            color="var(--saffron-600)"
            bgColor="var(--saffron-50)"
          />
          <StatCard
            icon={ArrowRightLeft}
            value={stats?.pendingTransfers}
            label="Active Transfers"
            color="var(--orange-600)"
            bgColor="var(--orange-100)"
          />
          <StatCard
            icon={TrendingUp}
            value={stats?.completedTransfers}
            label="Completed Transfers"
            color="var(--green-600)"
            bgColor="var(--green-50)"
          />
          <StatCard
            icon={Link2}
            value={stats?.blockchainRecords}
            label="Ledger Blocks"
            color="#7c3aed"
            bgColor="#f5f3ff"
          />
        </div>
      )}

      {/* Quick Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginTop: 8 }}>
        <QuickActionCard
          title="Property Registration & AI"
          desc={`${stats?.pendingVerifications ?? 0} application(s) awaiting your review`}
          btnLabel="Verify Registrations"
          color="var(--saffron-500)"
          bg="var(--saffron-50)"
          borderColor="var(--saffron-100)"
          onClick={() => onNavigate('registration')}
          icon={Building2}
          urgent={stats?.pendingVerifications > 0}
        />
        <QuickActionCard
          title="Master Land Database"
          desc="100 official state cadastral records across Maharashtra"
          btnLabel="Explore Master Registry"
          color="#0d9488"
          bg="#f0fdfa"
          borderColor="#ccfbf1"
          onClick={() => onNavigate('masterland')}
          icon={TrendingUp}
        />
        <QuickActionCard
          title="Transfer Management"
          desc={`${stats?.pendingTransfers ?? 0} active transfer(s) in progress`}
          btnLabel="Manage Transfers"
          color="var(--navy-500)"
          bg="var(--navy-50)"
          borderColor="var(--navy-100)"
          onClick={() => onNavigate('transfers')}
          icon={ArrowRightLeft}
        />
        <QuickActionCard
          title="Ledger Integrity"
          desc={`${stats?.blockchainRecords ?? 0} blocks recorded · Click to verify chain`}
          btnLabel="View & Verify Ledger"
          color="#7c3aed"
          bg="#f5f3ff"
          borderColor="#e9d5ff"
          onClick={() => onNavigate('ledger')}
          icon={Link2}
        />
      </div>
    </div>
  );
}

function QuickActionCard({ title, desc, btnLabel, color, bg, borderColor, onClick, icon: Icon, urgent }) {
  return (
    <div style={{
      background: bg, border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-lg)', padding: '20px',
      display: 'flex', flexDirection: 'column', gap: 12,
      transition: 'transform 0.15s, box-shadow 0.15s',
      cursor: 'default',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, background: color, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color="white" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {title}
            {urgent && <span style={{ marginLeft: 6, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{desc}</div>
        </div>
      </div>
      <button
        className="btn btn-sm"
        style={{ background: color, color: 'white', alignSelf: 'flex-start' }}
        onClick={onClick}
      >
        {btnLabel}
      </button>
    </div>
  );
}
