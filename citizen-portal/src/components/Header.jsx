import React, { useState } from 'react';
import { ShieldCheck, User, LogOut, CheckCircle, Clock, CreditCard, Sparkles } from 'lucide-react';
import DigitalCardModal from './DigitalCardModal';

export default function Header({ citizen, onLogout }) {
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  return (
    <>
      {/* Tricolor Accent Bar */}
      <div className="gov-tricolor-bar" />

      {/* Top Government Disclaimer & Accessibility Ticker */}
      <div className="gov-top-ticker">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="badge-proto">Citizen Portal</span>
          <span>BhoomiChain Unified Land Records & Civil Identity Registry</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Demo Environment: Maharashtra Division</span>
          <span>Standard Time: IST</span>
        </div>
      </div>

      {/* Main Portal Header */}
      <header className="portal-header">
        <div className="portal-header-inner">
          <div className="portal-brand">
            <div className="gov-emblem-badge">
              <ShieldCheck size={26} color="#ffffff" />
            </div>
            <div className="portal-title-wrap">
              <h1>
                BhoomiChain
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--saffron-500)', background: 'var(--saffron-50)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--saffron-100)' }}>
                  CITIZEN PORTAL
                </span>
              </h1>
              <p>Own with Trust. Transfer with Proof.</p>
            </div>
          </div>

          {citizen ? (
            <div className="user-session-bar" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Profile / Digital BhoomiCard Button */}
              <button
                type="button"
                onClick={() => setIsCardModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #0a192f, #1e3a8a)',
                  color: '#ffffff',
                  border: '1px solid var(--gov-gold)',
                  borderRadius: '24px',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(10, 25, 47, 0.25)',
                  transition: 'all 0.2s ease',
                }}
                title="View your official Digital BhoomiCard, PIN and Card details"
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'var(--gov-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0a192f',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                >
                  <User size={15} />
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>{citizen.fullName || 'Citizen Profile'}</span>
                    <Sparkles size={11} color="var(--gov-gold)" />
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#cbd5e1', fontFamily: 'monospace' }}>
                    {citizen.bcid}
                  </div>
                </div>
                <CreditCard size={15} color="var(--gov-gold)" style={{ marginLeft: '4px' }} />
              </button>

              <button
                onClick={onLogout}
                className="btn-gov-outline"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                title="Log out of citizen session"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div>
              <span className="status-badge status-pending">
                <Clock size={12} />
                <span>Session Required</span>
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Official Digital BhoomiCard Modal */}
      <DigitalCardModal
        citizen={citizen}
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
      />
    </>
  );
}
