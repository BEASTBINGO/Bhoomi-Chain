import React, { useState } from 'react';
import { ShieldCheck, UserCheck, ArrowRight, Lock, AlertCircle } from 'lucide-react';
import { loginCitizen } from '../services/api';

export default function LoginModal({ onLoginSuccess }) {
  const [bcid, setBcid] = useState('BCID-IND-2026-000001');
  const [mobile, setMobile] = useState('9876543210');
  const [secretPin, setSecretPin] = useState('1234');
  const [aadhaarNumber, setAadhaarNumber] = useState('5489 3210 1001');
  const [cardExpiryDate, setCardExpiryDate] = useState('12/30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginCitizen({
        bcid: bcid.trim(),
        mobile: mobile.trim(),
        secretPin: secretPin.trim(),
        aadhaarNumber: aadhaarNumber.trim(),
        cardExpiryDate: cardExpiryDate.trim(),
      });
      if (res.success && res.token) {
        localStorage.setItem('bhoomichain_citizen_token', res.token);
        localStorage.setItem('bhoomichain_citizen_data', JSON.stringify(res.citizen));
        onLoginSuccess(res.citizen);
      } else {
        setError(res.message || 'Unable to authenticate citizen');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login request failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (demoBcid, demoMobile, demoPin, demoAadhaar, demoExp) => {
    setBcid(demoBcid);
    setMobile(demoMobile);
    setSecretPin(demoPin);
    setAadhaarNumber(demoAadhaar);
    setCardExpiryDate(demoExp);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" style={{ maxWidth: '480px' }}>
        <div className="modal-header" style={{ borderTop: '4px solid var(--saffron-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="gov-emblem-badge" style={{ width: '36px', height: '36px' }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Citizen BhoomiCard Sign In</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                Digital Card Identity Verification &bull; BhoomiChain
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          <div className="modal-body">
            {error && (
              <div style={{ background: 'var(--gov-red-50)', border: '1px solid var(--gov-red-100)', color: 'var(--gov-red-600)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>1. BID / BCID Code *</label>
              <input
                type="text"
                className="form-control"
                value={bcid}
                onChange={(e) => setBcid(e.target.value)}
                placeholder="e.g. BCID-IND-2026-000001"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>2. Phone Number (Contact) *</label>
              <input
                type="text"
                className="form-control"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px', marginBottom: '12px' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>3. Secret PIN *</label>
                <input
                  type="password"
                  maxLength={6}
                  className="form-control"
                  value={secretPin}
                  onChange={(e) => setSecretPin(e.target.value)}
                  placeholder="e.g. 1234"
                  required
                />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>5. Card Expiry *</label>
                <input
                  type="text"
                  maxLength={5}
                  className="form-control"
                  value={cardExpiryDate}
                  onChange={(e) => setCardExpiryDate(e.target.value)}
                  placeholder="12/30"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>4. Aadhaar Card No. *</label>
              <input
                type="text"
                className="form-control"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                placeholder="12-digit Aadhaar Card Number"
                required
              />
            </div>

            {/* Quick Demo Citizen Fill */}
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                1-Click Test Citizen Credentials:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-gov-outline"
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                  onClick={() => setDemoUser('BCID-IND-2026-000001', '9876543210', '1234', '5489 3210 1001', '12/30')}
                >
                  <UserCheck size={13} color="var(--gov-navy-800)" />
                  <span>Mehul Kasrung (Seller)</span>
                </button>
                <button
                  type="button"
                  className="btn-gov-outline"
                  style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                  onClick={() => setDemoUser('BCID-IND-2026-000002', '9876543211', '1234', '5489 3210 1002', '12/30')}
                >
                  <UserCheck size={13} color="var(--gov-navy-800)" />
                  <span>Pooja Sharma (Buyer)</span>
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={13} />
              <span>Simulated authentication session &bull; Valid for 2 hours</span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="submit"
              className="btn-gov-saffron"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
