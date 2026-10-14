import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  X,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  User,
  Phone,
  Calendar,
  Sparkles,
  QrCode,
  Landmark,
} from 'lucide-react';

export default function DigitalCardModal({ citizen, isOpen, onClose }) {
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen || !citizen) return null;

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const cardExpiry = citizen.cardExpiryDate || '12/30';
  const secretCode = citizen.secretCardCode || (citizen.bcid?.includes('000002') ? '456' : '789');
  const secretPin = citizen.secretPin || '1234';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 15, 25, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid var(--border-light)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, var(--gov-navy-950), var(--gov-navy-900))',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid var(--gov-gold)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 184, 0, 0.15)',
                border: '1px solid var(--gov-gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gov-gold)',
              }}
            >
              <CreditCard size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                Official Citizen BhoomiCard
              </h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
                Digital Land Registry & Civil Identity Card &bull; Government of Maharashtra
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Physical Style Digital Smart Card */}
          <div
            style={{
              position: 'relative',
              borderRadius: '16px',
              padding: '24px',
              background: 'linear-gradient(135deg, #0a192f 0%, #1e3a8a 55%, #0f172a 100%)',
              color: '#ffffff',
              boxShadow: '0 15px 30px rgba(10, 25, 47, 0.4), inset 0 1px 1px rgba(255,255,255,0.2)',
              border: '1px solid rgba(255, 215, 0, 0.35)',
              marginBottom: '20px',
              overflow: 'hidden',
            }}
          >
            {/* Subtle card sheen watermark */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,184,0,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Card Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '0.62rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gov-gold)', fontWeight: 800 }}>
                  GOVERNMENT OF MAHARASHTRA &bull; REVENUE DEPT
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.5px' }}>
                  BHOMICHAIN DIGITAL IDENTITY CARD
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: '#4ade80',
                }}
              >
                <ShieldCheck size={12} />
                <span>VERIFIED</span>
              </div>
            </div>

            {/* Chip & Contactless Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              {/* Gold Chip Graphic */}
              <div
                style={{
                  width: '44px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #d4af37, #fef08a, #b45309)',
                  border: '1px solid #78350f',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ width: '28px', height: '18px', border: '1px solid rgba(0,0,0,0.3)', borderRadius: '3px' }} />
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '2px' }}>)))</span>
            </div>

            {/* BID / BCID Number */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px', marginBottom: '2px' }}>
                BhoomiChain Identifier (BID / BCID)
              </div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                  color: '#ffffff',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{citizen.bcid}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(citizen.bcid, 'bcid')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  title="Copy BCID"
                >
                  {copiedField === 'bcid' ? <Check size={16} color="#4ade80" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Cardholder Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 0.8fr', gap: '12px', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                  Cardholder Name
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {citizen.fullName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                  Aadhaar Card No.
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace', color: '#f1f5f9' }}>
                  {citizen.aadhaarNumber || '5489 3210 1001'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.58rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.5px' }}>
                  Expires
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--gov-gold)' }}>
                  {cardExpiry}
                </div>
              </div>
            </div>
          </div>

          {/* Security Credentials & PIN Details Section */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid var(--border-light)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Lock size={15} color="var(--gov-navy-900)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--gov-navy-950)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Transfer Authorization Credentials
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {/* Secret PIN */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Card Secret PIN:
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--gov-navy-900)' }}>
                    {showPin ? secretPin : '••••'}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(secretPin, 'pin')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      title="Copy PIN"
                    >
                      {copiedField === 'pin' ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Secret 3-digit Code */}
              <div
                style={{
                  background: '#ffffff',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Secret Card Code (CVC):
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--gov-navy-900)' }}>
                    {showSecretCode ? secretCode : '•••'}
                  </span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setShowSecretCode(!showSecretCode)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showSecretCode ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(secretCode, 'code')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      title="Copy Secret Code"
                    >
                      {copiedField === 'code' ? <Check size={16} color="#16a34a" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick explanation */}
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: 1.4 }}>
              💡 <strong>Presentation Tip:</strong> Use this Secret PIN (<code>{secretPin}</code>) and Secret Card Code (<code>{secretCode}</code>) along with your Aadhaar (<code>{citizen.aadhaarNumber || '5489 3210 1001'}</code>) when confirming property transfer requests.
            </div>
          </div>

          {/* Quick Copy All Details Button */}
          <button
            type="button"
            onClick={() => {
              const fullDetails = `BhoomiCard Details:\nBCID: ${citizen.bcid}\nName: ${citizen.fullName}\nPhone: ${citizen.mobile}\nAadhaar: ${citizen.aadhaarNumber}\nExpiry: ${cardExpiry}\nPIN: ${secretPin}\nSecret Code: ${secretCode}`;
              handleCopy(fullDetails, 'all');
            }}
            className="btn-gov-outline"
            style={{ width: '100%', padding: '10px', fontSize: '0.85rem', justifyContent: 'center' }}
          >
            {copiedField === 'all' ? (
              <>
                <Check size={16} color="#16a34a" />
                <span style={{ color: '#16a34a', fontWeight: 700 }}>Card Details Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Full BhoomiCard Credentials</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
