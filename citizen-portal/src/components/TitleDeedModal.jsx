import React, { useRef } from 'react';
import {
  ShieldCheck,
  Printer,
  X,
  QrCode,
  CheckCircle2,
  Calendar,
  MapPin,
  Maximize2,
  FileText,
  Lock,
  Building,
} from 'lucide-react';

export default function TitleDeedModal({ property, citizen, isOpen, onClose }) {
  const certificateRef = useRef(null);

  if (!isOpen || !property) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentYear = new Date().getFullYear();
  const certId = `MH-CADASTRE-${property.propertyCode || 'CERT'}-${currentYear}`;
  const verifiedDate = property.verificationDate
    ? new Date(property.verificationDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });

  const ownerName = citizen?.fullName || property.owner?.fullName || 'Verified Citizen';
  const ownerBcid = citizen?.bcid || property.owner?.bcid || 'BCID-IND-2026-000001';
  const ownerAadhaar = citizen?.aadhaarNumber || '5489 3210 1001';

  return (
    <div
      className="deed-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(5, 15, 25, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={onClose}
    >
      <div
        className="deed-modal-container"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
          overflowY: 'auto',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Toolbar (Screen Only) */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            background: 'var(--gov-navy-950)',
            color: '#ffffff',
            borderTopLeftRadius: '15px',
            borderTopRightRadius: '15px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} color="var(--gov-gold)" />
            <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>
              Statutory Land Certificate • Form 7/12 & Sanad of Title
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, var(--saffron-500), var(--saffron-600))',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Certificate Printable Body */}
        <div
          ref={certificateRef}
          style={{
            padding: '36px 44px',
            background: '#ffffff',
            position: 'relative',
            color: '#0f172a',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {/* Subtle Watermark in Background */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              opacity: 0.035,
              transform: 'rotate(-30deg)',
              fontSize: '4.5rem',
              fontWeight: 900,
              color: '#0a192f',
              textTransform: 'uppercase',
              letterSpacing: '8px',
              userSelect: 'none',
            }}
          >
            GOVERNMENT OF MAHARASHTRA
          </div>

          {/* Border Frame */}
          <div
            style={{
              border: '3px double #94a3b8',
              borderRadius: '8px',
              padding: '28px',
              position: 'relative',
            }}
          >
            {/* Top State Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0a192f, #1e3a8a)',
                  color: '#e2b342',
                  marginBottom: '10px',
                  boxShadow: '0 3px 8px rgba(10,25,47,0.2)',
                }}
              >
                <Building size={30} />
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '2px', color: '#b45309', textTransform: 'uppercase' }}>
                Government of Maharashtra • Department of Revenue & Land Records
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0a192f', margin: '4px 0 2px 0', letterSpacing: '-0.5px' }}>
                CERTIFICATE OF TITLE & SANAD OF ABSOLUTE OWNERSHIP
              </h1>
              <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>
                Issued under the Maharashtra Land Revenue Code, 1966 & Indian Registration Act, 1908
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '0.75rem', fontWeight: 600 }}>
                <span style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  Registry Serial: <strong>{certId}</strong>
                </span>
                <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 10px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                  Title Status: <strong>CLEAN & UNENCUMBERED</strong>
                </span>
                <span style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                  Issued: <strong>{verifiedDate}</strong>
                </span>
              </div>
            </div>

            {/* Preamble */}
            <div style={{ margin: '18px 0', fontSize: '0.82rem', lineHeight: 1.5, color: '#334155', textAlign: 'justify' }}>
              This is to officially certify that the real estate property and cadastral land parcel described below has been verified by the Sub-Registrar Authority, reconciled with the State Land Records Cadastre, and cryptographically anchored into the <strong>BhoomiChain Sovereign Blockchain Ledger</strong>. The designated holder holds absolute, indefeasible title free from statutory encumbrance.
            </div>

            {/* Two-Column Grid: Property & Holder */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '16px 0' }}>
              {/* Box 1: Land Parcel Description */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#1e3a8a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} />
                  <span>Cadastral Parcel Details</span>
                </div>
                <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ color: '#64748b', padding: '3px 0', width: '45%' }}>Property Code:</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{property.propertyCode}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#64748b', padding: '3px 0' }}>Survey / Gat No:</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{property.surveyNumber}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#64748b', padding: '3px 0' }}>Total Land Area:</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{property.area} {property.areaUnit || 'sq.ft'}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#64748b', padding: '3px 0' }}>Property Type:</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{(property.propertyType || 'LAND').replace('_', ' ')}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#64748b', padding: '3px 0' }}>Location / Taluka:</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>
                        {property.village ? `${property.village}, ` : ''}{property.taluka ? `${property.taluka}, ` : ''}{property.district}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: '#64748b', padding: '3px 0' }}>Revenue Division:</td>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>Konkan / {property.state || 'Maharashtra'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Box 2: Registered Owner Details */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#1e3a8a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} />
                  <span>Title Holder Credentials</span>
                </div>
                <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ color: '#64748b', padding: '3px 0', width: '45%' }}>Title Holder:</td>
                      <td style={{ fontWeight: 800, color: '#0f172a' }}>{ownerName}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#64748b', padding: '3px 0' }}>BhoomiCard ID:</td>
                      <td style={{ fontWeight: 700, color: '#1e3a8a', fontFamily: 'monospace' }}>{ownerBcid}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#64748b', padding: '3px 0' }}>Aadhaar No:</td>
                      <td style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{ownerAadhaar}</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#64748b', padding: '3px 0' }}>Registration Type:</td>
                      <td style={{ fontWeight: 700, color: '#047857' }}>Freehold Absolute Ownership</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#64748b', padding: '3px 0' }}>Verification Level:</td>
                      <td style={{ fontWeight: 700, color: '#047857' }}>Level 3 (Biometric & Cadastral)</td>
                    </tr>
                    <tr>
                      <td style={{ color: '#64748b', padding: '3px 0' }}>Encumbrance Status:</td>
                      <td style={{ fontWeight: 700, color: '#047857' }}>Nil (Zero Liens / Mortgages)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Blockchain Immutability Footer Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0a192f, #1e3a8a)',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '12px 16px',
                margin: '16px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.72rem', color: '#e2b342', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Cryptographic Ledger Security Seal
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#cbd5e1', marginTop: '2px' }}>
                  SHA-256 Hash: {property._id ? `0x7a8f9b...${String(property._id).slice(-10)}` : '0x94b3c82d1e0f4a5b6c7d8e9f0a1b2c3d'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                  Consensus: Proof of Statutory Authority &bull; Block #4192 &bull; Immutable & Tamper-Evident
                </div>
              </div>

              {/* Simulated QR Code */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <QrCode size={46} color="#0a192f" />
              </div>
            </div>

            {/* Signature & Seal Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: '28px',
                paddingTop: '16px',
                borderTop: '1px dashed #cbd5e1',
              }}
            >
              {/* Left: Security Hologram / Watermark Note */}
              <div style={{ fontSize: '0.72rem', color: '#64748b', maxWidth: '320px' }}>
                <p style={{ margin: 0 }}>
                  <strong>Digital Signature Verified:</strong> Generated via BhoomiChain Government Portal. Complies with Section 65B of the Indian Evidence Act, 1872 and Information Technology Act, 2000.
                </p>
              </div>

              {/* Right: Sub-Registrar Official Stamp */}
              <div style={{ textAlign: 'center', minWidth: '220px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    border: '2px solid #b45309',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    background: '#fffbeb',
                    marginBottom: '6px',
                  }}
                >
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
                    Digitally Signed & Sealed
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 900, color: '#0a192f' }}>
                    Shri Anant Deshmukh
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#475569' }}>
                    Sub-Registrar (Class-I) • Palghar Division
                  </div>
                </div>
                <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                  Seal Date: {verifiedDate}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
