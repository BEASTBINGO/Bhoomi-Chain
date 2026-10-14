import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  User,
  KeyRound,
  FileCheck2,
  Cpu,
  Fingerprint,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
import { loginRegistrar } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [govId, setGovId] = useState('GOV-MH-2026-001');
  const [secretPin, setSecretPin] = useState('9801');
  const [mobile, setMobile] = useState('9800000001');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) + ' ' + now.toLocaleTimeString('en-IN', { hour12: true }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!govId.trim() || !secretPin.trim() || !mobile.trim()) {
      setError('GOV ID NUMBER, SECRET PIN, and PHONE NUMBER are all required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await loginRegistrar({
        govId: govId.trim(),
        secretPin: secretPin.trim(),
        mobile: mobile.trim(),
      });
      if (data.success) {
        localStorage.setItem('bhoomichain_gov_token', data.token);
        localStorage.setItem('bhoomichain_gov_user', JSON.stringify(data.registrar));
        onLoginSuccess(data.registrar);
      } else {
        setError(data.message || 'Officer authentication rejected. Verify credentials.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Connection error. Ensure backend server is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickOfficerLogin = () => {
    setGovId('GOV-MH-2026-001');
    setSecretPin('9801');
    setMobile('9800000001');
    setError('');
  };

  return (
    <div className="gov-command-screen">
      {/* ─────────────────────────────────────────────────────────────
          LEFT PANEL: HIGH-SECURITY STATE COMMAND & GOVERNANCE HERO
         ───────────────────────────────────────────────────────────── */}
      <div className="gov-hero-panel">
        <div className="gov-hero-watermark">
          <ShieldCheck size={420} />
        </div>

        <div className="gov-hero-content">
          {/* Official Emblem & State Header */}
          <div className="gov-official-header">
            <div className="gov-crest-emblem">
              <ShieldCheck size={32} color="#f59e0b" />
            </div>
            <div>
              <div className="gov-dept-name">GOVERNMENT OF MAHARASHTRA</div>
              <div className="gov-subdept-name">Department of Land Records & Inspector General of Registration</div>
            </div>
          </div>

          {/* Main Title */}
          <div className="gov-hero-title-box">
            <div className="gov-clearance-pill">
              <span className="gov-pulse-dot" />
              RESTRICTED STATUTORY REGISTRAR DESK
            </div>
            <h1 className="gov-hero-h1">
              BhoomiChain
              <span className="gov-hero-accent"> REGISTRAR CONSOLE</span>
            </h1>
            <p className="gov-hero-desc">
              National land governance infrastructure delivering immutable deed verification,
              multi-party transfer approvals, and cryptographic hash-chain ledger security.
            </p>
          </div>

          {/* 4 Core Pillars of Statutory Security */}
          <div className="gov-pillars-grid">
            <div className="gov-pillar-card">
              <div className="gov-pillar-icon" style={{ color: '#38bdf8' }}>
                <Cpu size={20} />
              </div>
              <div>
                <div className="gov-pillar-title">Cryptographic Ledger</div>
                <div className="gov-pillar-desc">SHA-256 chained transaction blocks preventing record manipulation.</div>
              </div>
            </div>

            <div className="gov-pillar-card">
              <div className="gov-pillar-icon" style={{ color: '#34d399' }}>
                <FileCheck2 size={20} />
              </div>
              <div>
                <div className="gov-pillar-title">Deed Validation</div>
                <div className="gov-pillar-desc">Multi-party digital workflow ensuring buyer, seller & state concurrence.</div>
              </div>
            </div>

            <div className="gov-pillar-card">
              <div className="gov-pillar-icon" style={{ color: '#fbbf24' }}>
                <Fingerprint size={20} />
              </div>
              <div>
                <div className="gov-pillar-title">AI Forensic Review</div>
                <div className="gov-pillar-desc">Automated title parcel parsing & tamper-risk scoring across uploaded deeds.</div>
              </div>
            </div>

            <div className="gov-pillar-card">
              <div className="gov-pillar-icon" style={{ color: '#a78bfa' }}>
                <Award size={20} />
              </div>
              <div>
                <div className="gov-pillar-title">Statutory Audit Trail</div>
                <div className="gov-pillar-desc">Permanent, tamper-evident audit logs logged under the Indian Evidence Act.</div>
              </div>
            </div>
          </div>

          {/* Live Node Status & Statutory Advisory */}
          <div className="gov-security-advisory">
            <div className="gov-node-ticker">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="gov-live-dot" />
                <span>NODE-MH-01 &bull; 256-BIT SECURITY ENCRYPTED</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={13} />
                <span>{currentTime || 'IST ACTIVE'}</span>
              </div>
            </div>
            <p className="gov-advisory-text">
              <strong>STATUTORY NOTICE:</strong> This terminal is strictly reserved for authorized Sub-Registrars
              and Gazetted Officers. Unauthorized access attempts are monitored and punishable under Section 43 & 66
              of the Information Technology Act, 2000.
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT PANEL: OFFICER AUTHENTICATION TERMINAL
         ───────────────────────────────────────────────────────────── */}
      <div className="gov-terminal-panel">
        <div className="gov-terminal-box">
          <div className="gov-terminal-tricolor" />

          <div className="gov-terminal-inner">
            <div className="gov-terminal-header">
              <div className="gov-terminal-icon">
                <KeyRound size={22} color="#f59e0b" />
              </div>
              <div>
                <h2 className="gov-terminal-title">Officer Sign In</h2>
                <p className="gov-terminal-sub">Class-I Statutory Registrar Authentication</p>
              </div>
            </div>

            {error && (
              <div className="gov-terminal-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Demo Officer Profile Fill Card */}
            <div
              className="gov-officer-profile-card"
              onClick={handleQuickOfficerLogin}
              title="Click to auto-fill official demo registrar credentials"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="gov-officer-badge">GAZETTED OFFICER PROFILE</span>
                <span className="gov-officer-click-hint">Click to Auto-fill</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="gov-officer-avatar">AD</div>
                <div style={{ flex: 1 }}>
                  <div className="gov-officer-name">Shri Anant Deshmukh</div>
                  <div className="gov-officer-role">Sub-Registrar (Class-I) &bull; Palghar Division</div>
                </div>
              </div>
              <div className="gov-officer-creds">
                <span>GOV ID: <strong>GOV-MH-2026-001</strong></span>
                <span>PIN: <strong>9801</strong></span>
                <span>Phone: <strong>9800000001</strong></span>
              </div>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="gov-form-group">
                <label className="gov-label" htmlFor="reg-govid">
                  <User size={13} style={{ display: 'inline', marginRight: 6 }} />
                  GOV ID NUMBER *
                </label>
                <div className="gov-input-wrap">
                  <input
                    id="reg-govid"
                    type="text"
                    className="gov-input"
                    value={govId}
                    onChange={(e) => setGovId(e.target.value)}
                    placeholder="e.g. GOV-MH-2026-001"
                    required
                  />
                </div>
                <span className="gov-input-hint">Official Revenue Department Officer Identity Number</span>
              </div>

              <div className="gov-form-group">
                <label className="gov-label" htmlFor="reg-secretpin">
                  <Lock size={13} style={{ display: 'inline', marginRight: 6 }} />
                  SECRET PIN *
                </label>
                <div className="gov-input-wrap" style={{ position: 'relative' }}>
                  <input
                    id="reg-secretpin"
                    type={showPin ? 'text' : 'password'}
                    className="gov-input"
                    value={secretPin}
                    onChange={(e) => setSecretPin(e.target.value)}
                    placeholder="4-digit Secret PIN (9801)"
                    maxLength={6}
                    required
                    style={{ paddingRight: '40px', letterSpacing: '2px', fontWeight: 700 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="gov-eye-toggle"
                  >
                    {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="gov-form-group">
                <label className="gov-label" htmlFor="reg-mobile">
                  <Fingerprint size={13} style={{ display: 'inline', marginRight: 6 }} />
                  PHONE NUMBER *
                </label>
                <div className="gov-input-wrap">
                  <input
                    id="reg-mobile"
                    type="text"
                    className="gov-input"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="10-digit registered officer mobile number"
                    required
                  />
                </div>
              </div>

              <div className="gov-token-status">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="gov-token-dot" />
                  <span>Hardware Key Simulation: Active</span>
                </div>
                <span>Secured via SHA-256</span>
              </div>

              <button
                type="submit"
                className="gov-login-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="gov-spinner" />
                    <span>Verifying Statutory Officer Identity…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Authenticate & Enter Registrar Desk</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
