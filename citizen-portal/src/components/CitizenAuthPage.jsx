import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Lock,
  Sparkles,
  Info,
} from 'lucide-react';
import { loginCitizen, registerCitizen } from '../services/api';

export default function CitizenAuthPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login form state
  const [loginBcid, setLoginBcid] = useState('BCID-IND-2026-000001');
  const [loginMobile, setLoginMobile] = useState('9876543210');
  const [loginSecretPin, setLoginSecretPin] = useState('1234');
  const [loginAadhaar, setLoginAadhaar] = useState('5489 3210 1001');
  const [loginCardExpiry, setLoginCardExpiry] = useState('12/30');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regForm, setRegForm] = useState({
    fullName: '',
    dob: '',
    gender: 'MALE',
    fatherName: '',
    motherName: '',
    mobile: '',
    email: '',
    aadhaarNumber: '',
    panNumber: '',
    occupation: 'AGRICULTURE',
    address: '',
    village: '',
    taluka: '',
    district: 'Palghar',
    state: 'Maharashtra',
    pincode: '401303',
    agreedToTerms: false,
  });

  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(null); // stores new citizen data on success

  // Quick autofill demo registration for viva/presentation
  const fillSampleRegistration = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setRegForm({
      fullName: 'Vikram Dnyaneshwar Patil',
      dob: '1988-06-14',
      gender: 'MALE',
      fatherName: 'Dnyaneshwar Mahadev Patil',
      motherName: 'Sunita Dnyaneshwar Patil',
      mobile: `987654${randomSuffix}`,
      email: 'vikram.patil@example.in',
      aadhaarNumber: `5489-3210-${randomSuffix}`,
      panNumber: `BKLPP${randomSuffix}F`,
      occupation: 'AGRICULTURE',
      address: 'Plot No. 42, Kisan Nagar, Near Gram Panchayat',
      village: 'Bolinj',
      taluka: 'Vasai',
      district: 'Palghar',
      state: 'Maharashtra',
      pincode: '401303',
      agreedToTerms: true,
    });
    setRegError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await loginCitizen({
        bcid: loginBcid.trim(),
        mobile: loginMobile.trim(),
        secretPin: loginSecretPin.trim(),
        aadhaarNumber: loginAadhaar.trim(),
        cardExpiryDate: loginCardExpiry.trim(),
      });
      if (res.success && res.token) {
        localStorage.setItem('bhoomichain_citizen_token', res.token);
        localStorage.setItem('bhoomichain_citizen_data', JSON.stringify(res.citizen));
        onLoginSuccess(res.citizen);
      } else {
        setLoginError(res.message || 'Unable to authenticate citizen');
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login request failed. Ensure backend is running.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.fullName.trim() || !regForm.mobile.trim()) {
      setRegError('Full legal name and registered mobile number are required.');
      return;
    }
    if (!regForm.agreedToTerms) {
      setRegError('You must confirm the statutory declaration to register.');
      return;
    }

    setRegLoading(true);
    setRegError('');

    try {
      const res = await registerCitizen(regForm);
      if (res.success && res.citizen) {
        setRegSuccess(res);
        if (res.token) {
          localStorage.setItem('bhoomichain_citizen_token', res.token);
          localStorage.setItem('bhoomichain_citizen_data', JSON.stringify(res.citizen));
        }
      } else {
        setRegError(res.message || 'Unable to register citizen.');
      }
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed. Check if mobile number is already registered.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="citizen-auth-page" style={{ minHeight: 'calc(100vh - 120px)', background: 'var(--bg-page)', padding: '32px 16px' }}>
      <div style={{ maxWidth: mode === 'register' ? '920px' : '520px', margin: '0 auto', transition: 'max-width 0.3s ease' }}>
        
        {/* Top Civic Emblem Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 12px auto',
              background: 'linear-gradient(135deg, var(--gov-navy-900), var(--gov-navy-700))',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(10, 37, 64, 0.15)',
              border: '3px solid #ffffff',
            }}
          >
            <ShieldCheck size={36} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--gov-navy-950)', margin: '0 0 6px 0' }}>
            BhoomiChain Citizen Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Unified Digital Land Records & Civil Identity Registry &bull; Maharashtra Division
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#e2e8f0',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '24px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('login'); setRegSuccess(null); }}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              background: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? 'var(--gov-navy-900)' : 'var(--text-muted)',
              boxShadow: mode === 'login' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <User size={15} />
            Citizen Sign In (Existing BCID)
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setLoginError(''); }}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              background: mode === 'register' ? '#ffffff' : 'transparent',
              color: mode === 'register' ? 'var(--saffron-600)' : 'var(--text-muted)',
              boxShadow: mode === 'register' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <FileText size={15} />
            New Citizen Registration (Civil Enrollment)
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MODE 1: CITIZEN SIGN IN
           ───────────────────────────────────────────────────────────── */}
        {mode === 'login' && (
          <div
            className="content-card"
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
          >
            <div style={{ height: '5px', background: 'linear-gradient(90deg, #FF9933 33.3%, #ffffff 33.3% 66.6%, #138808 66.6%)' }} />

            <div style={{ padding: '28px 24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gov-navy-900)', margin: '0 0 4px 0' }}>
                  Secure Citizen Sign In
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Enter your assigned BCID and registered mobile number to manage land parcels.
                </p>
              </div>

              {loginError && (
                <div
                  style={{
                    background: 'var(--gov-red-50)',
                    border: '1px solid var(--gov-red-100)',
                    color: 'var(--gov-red-600)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '18px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                    1. BID / BCID Code *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={loginBcid}
                      onChange={(e) => setLoginBcid(e.target.value)}
                      placeholder="e.g. BCID-IND-2026-000001"
                      required
                      style={{ paddingLeft: '36px' }}
                    />
                    <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                    2. Phone Number (Contact) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={loginMobile}
                      onChange={(e) => setLoginMobile(e.target.value)}
                      placeholder="10-digit registered phone number"
                      required
                      style={{ paddingLeft: '36px' }}
                    />
                    <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                      3. Secret PIN *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        maxLength={6}
                        className="form-control"
                        value={loginSecretPin}
                        onChange={(e) => setLoginSecretPin(e.target.value)}
                        placeholder="e.g. 1234"
                        required
                        style={{ paddingLeft: '36px', letterSpacing: '2px', fontWeight: 700 }}
                      />
                      <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                      5. Card Expiry *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        maxLength={5}
                        className="form-control"
                        value={loginCardExpiry}
                        onChange={(e) => setLoginCardExpiry(e.target.value)}
                        placeholder="MM/YY (12/30)"
                        required
                        style={{ paddingLeft: '34px', fontFamily: 'monospace', fontWeight: 700 }}
                      />
                      <Calendar size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                    4. Aadhaar Card No. *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={loginAadhaar}
                      onChange={(e) => setLoginAadhaar(e.target.value)}
                      placeholder="12-digit Aadhaar Card Number"
                      required
                      style={{ paddingLeft: '36px', fontFamily: 'monospace' }}
                    />
                    <CreditCard size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-gov-saffron"
                  disabled={loginLoading}
                  style={{ width: '100%', padding: '12px', fontSize: '0.92rem', justifyContent: 'center' }}
                >
                  {loginLoading ? 'Verifying Card & Identity…' : (
                    <>
                      <span>Sign In with BhoomiCard</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Test Demo Credentials */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  marginTop: '22px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  <Sparkles size={13} color="var(--saffron-500)" />
                  <span>1-Click Test Citizen Credentials:</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginBcid('BCID-IND-2026-000001');
                      setLoginMobile('9876543210');
                      setLoginSecretPin('1234');
                      setLoginAadhaar('5489 3210 1001');
                      setLoginCardExpiry('12/30');
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-medium)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gov-navy-700)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-medium)'}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--gov-navy-900)' }}>Mehul Kasrung (Seller)</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PIN: 1234 &bull; Exp: 12/30</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginBcid('BCID-IND-2026-000002');
                      setLoginMobile('9876543211');
                      setLoginSecretPin('1234');
                      setLoginAadhaar('5489 3210 1002');
                      setLoginCardExpiry('12/30');
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-medium)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--gov-navy-700)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-medium)'}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--gov-navy-900)' }}>Pooja Sharma (Buyer)</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PIN: 1234 &bull; Exp: 12/30</div>
                  </button>
                </div>
              </div>

              {/* Registration Callout */}
              <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Not registered yet on BhoomiChain?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--saffron-600)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
                >
                  Enroll / Register as New Citizen &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODE 2: NEW CITIZEN REGISTRATION FORM
           ───────────────────────────────────────────────────────────── */}
        {mode === 'register' && !regSuccess && (
          <div
            className="content-card"
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
          >
            <div style={{ height: '5px', background: 'linear-gradient(90deg, #FF9933 33.3%, #ffffff 33.3% 66.6%, #138808 66.6%)' }} />

            <div style={{ padding: '28px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--gov-navy-900)', margin: '0 0 4px 0' }}>
                    New Citizen Civil Identity Registration
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Official digital enrollment form under the Digital Land Governance Act. Generates your statutory BCID.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fillSampleRegistration}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--saffron-50)',
                    color: 'var(--saffron-600)',
                    border: '1px solid var(--saffron-100)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Auto-fill sample citizen profile for quick viva presentation"
                >
                  <Sparkles size={14} />
                  <span>Auto-Fill Sample Citizen</span>
                </button>
              </div>

              {regError && (
                <div
                  style={{
                    background: 'var(--gov-red-50)',
                    border: '1px solid var(--gov-red-100)',
                    color: 'var(--gov-red-600)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '20px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit}>
                
                {/* ── SECTION 1: Personal & Civil Details ── */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
                    <User size={16} color="var(--gov-navy-700)" />
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--gov-navy-900)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      1. Personal & Civil Identity
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        Full Legal Name (as per Aadhaar / PAN) *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={regForm.fullName}
                        onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                        placeholder="e.g. Ramesh Shankar Rao"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        value={regForm.dob}
                        onChange={(e) => setRegForm({ ...regForm, dob: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        Gender *
                      </label>
                      <select
                        className="form-control"
                        value={regForm.gender}
                        onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        Father's / Guardian's Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={regForm.fatherName}
                        onChange={(e) => setRegForm({ ...regForm, fatherName: e.target.value })}
                        placeholder="Father's full name"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        Mother's Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={regForm.motherName}
                        onChange={(e) => setRegForm({ ...regForm, motherName: e.target.value })}
                        placeholder="Mother's full name"
                      />
                    </div>
                  </div>
                </div>

                {/* ── SECTION 2: Contact, Tax & Statutory Proofs ── */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
                    <CreditCard size={16} color="var(--gov-navy-700)" />
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--gov-navy-900)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      2. Contact & National ID Proofs
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        Registered Mobile Number (10 digits) *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={regForm.mobile}
                        onChange={(e) => setRegForm({ ...regForm, mobile: e.target.value })}
                        placeholder="e.g. 9876543210"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        Official Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        placeholder="citizen@domain.com"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        Aadhaar / National UID Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={regForm.aadhaarNumber}
                        onChange={(e) => setRegForm({ ...regForm, aadhaarNumber: e.target.value })}
                        placeholder="e.g. 5489-3210-9876"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        Permanent Account Number (PAN)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={regForm.panNumber}
                        onChange={(e) => setRegForm({ ...regForm, panNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g. ABCDE1234F"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        Primary Occupation
                      </label>
                      <select
                        className="form-control"
                        value={regForm.occupation}
                        onChange={(e) => setRegForm({ ...regForm, occupation: e.target.value })}
                      >
                        <option value="AGRICULTURE">Farmer / Agriculture</option>
                        <option value="BUSINESS">Business / Self-Employed</option>
                        <option value="PRIVATE_SERVICE">Private Sector Employee</option>
                        <option value="GOV_SERVICE">Government Service</option>
                        <option value="PROFESSIONAL">Professional (Doctor/Lawyer/CA)</option>
                        <option value="OTHER">Other / Retired</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ── SECTION 3: Permanent Residential Address ── */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingBottom: '6px', borderBottom: '1px solid var(--border-light)' }}>
                    <MapPin size={16} color="var(--gov-navy-700)" />
                    <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--gov-navy-900)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      3. Permanent Residential Address
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        House / Flat No., Building & Street Address *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={regForm.address}
                        onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                        placeholder="e.g. 102, Shanti Bhavan, Station Road"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        Village / Town / Ward
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={regForm.village}
                        onChange={(e) => setRegForm({ ...regForm, village: e.target.value })}
                        placeholder="e.g. Bolinj"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        Taluka / Sub-District
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={regForm.taluka}
                        onChange={(e) => setRegForm({ ...regForm, taluka: e.target.value })}
                        placeholder="e.g. Vasai"
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        District *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={regForm.district}
                        onChange={(e) => setRegForm({ ...regForm, district: e.target.value })}
                        placeholder="e.g. Palghar"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        State
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={regForm.state}
                        onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
                        readOnly
                      />
                    </div>

                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '5px' }}>
                        Pincode (6 digits) *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={regForm.pincode}
                        onChange={(e) => setRegForm({ ...regForm, pincode: e.target.value })}
                        placeholder="e.g. 401303"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ── SECTION 4: Statutory Declaration ── */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border-light)',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '24px',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={regForm.agreedToTerms}
                      onChange={(e) => setRegForm({ ...regForm, agreedToTerms: e.target.checked })}
                      style={{ marginTop: '3px' }}
                    />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <strong>Statutory Civil Undertaking:</strong> I hereby declare that the particulars provided
                      above are true and correct to the best of my knowledge under the Indian Registration Act & IT Act.
                      I authorize the generation of my immutable <strong>BhoomiChain Citizen Identifier (BCID)</strong>{' '}
                      to record land ownership and participate in digital deed transfers.
                    </span>
                  </label>
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button
                    type="submit"
                    className="btn-gov-saffron"
                    disabled={regLoading}
                    style={{ flex: 1, padding: '12px', fontSize: '0.92rem', justifyContent: 'center' }}
                  >
                    {regLoading ? 'Enrolling Citizen & Generating BCID…' : (
                      <>
                        <ShieldCheck size={18} />
                        <span>Complete Registration & Issue Digital BCID</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn-gov-outline"
                    onClick={() => setMode('login')}
                    style={{ padding: '12px 18px', fontSize: '0.85rem' }}
                  >
                    Cancel / Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODE 2 SUCCESS: CITIZEN BCID ISSUED CELEBRATION CARD
           ───────────────────────────────────────────────────────────── */}
        {mode === 'register' && regSuccess && (
          <div
            className="content-card"
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '2px solid var(--gov-green-500)',
              boxShadow: '0 12px 28px rgba(16, 185, 129, 0.15)',
              overflow: 'hidden',
              textAlign: 'center',
            }}
          >
            <div style={{ height: '6px', background: 'var(--gov-green-500)' }} />

            <div style={{ padding: '36px 28px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 16px auto',
                  background: 'var(--gov-green-50)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gov-green-600)',
                }}
              >
                <CheckCircle2 size={36} />
              </div>

              <span
                style={{
                  display: 'inline-block',
                  background: 'var(--gov-green-100)',
                  color: 'var(--gov-green-700)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginBottom: '10px',
                }}
              >
                CIVIL ENROLLMENT SUCCESSFUL
              </span>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gov-navy-900)', margin: '0 0 6px 0' }}>
                Welcome, {regSuccess.citizen.fullName}!
              </h2>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px auto' }}>
                Your digital civil identity has been officially minted into the BhoomiChain Land Registry database.
              </p>

              {/* Digital Identity Pass Card */}
              <div
                style={{
                  maxWidth: '440px',
                  margin: '0 auto 28px auto',
                  background: 'linear-gradient(135deg, #0a2540 0%, #07192f 100%)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'left',
                  boxShadow: '0 10px 20px rgba(7, 25, 47, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.08 }}>
                  <ShieldCheck size={140} color="#ffffff" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.72rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                    BHOOMICHAIN CITIZEN CARD
                  </div>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                    ACTIVE &bull; VERIFIED
                  </span>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)' }}>CITIZEN IDENTIFIER (BCID)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'monospace', color: '#fbbf24', letterSpacing: '0.5px' }}>
                    {regSuccess.citizen.bcid}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>HOLDER NAME</div>
                    <div style={{ fontWeight: 600 }}>{regSuccess.citizen.fullName}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>REGISTERED MOBILE</div>
                    <div style={{ fontWeight: 600 }}>{regSuccess.citizen.mobile}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-gov-saffron"
                  onClick={() => onLoginSuccess(regSuccess.citizen)}
                  style={{ padding: '12px 28px', fontSize: '0.9rem' }}
                >
                  <span>Enter Citizen Portal Dashboard &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
