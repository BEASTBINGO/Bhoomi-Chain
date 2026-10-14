import React from 'react';
import {
  Landmark,
  MapPin,
  Maximize2,
  FileText,
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  FileCheck,
} from 'lucide-react';

export default function MyLand({ properties, onOpenRegister, onOpenUpload, onOpenHistory, onOpenTitleDeed }) {
  return (
    <div>
      <div className="page-intro-header">
        <div>
          <h2>My Land Parcels & Registered Estates</h2>
          <p>Official digital records of real estate titles registered under your BCID</p>
        </div>
        <button onClick={onOpenRegister} className="btn-gov-saffron">
          <PlusCircle size={16} />
          <span>Add New Land Parcel</span>
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="content-card">
          <div className="card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div className="gov-emblem-badge" style={{ margin: '0 auto 16px auto', width: '56px', height: '56px' }}>
              <Landmark size={28} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--gov-navy-900)' }}>No Properties Found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '8px auto 20px auto', fontSize: '0.875rem' }}>
              You currently do not have any land parcels registered under your account. Click below to initiate registration.
            </p>
            <button onClick={onOpenRegister} className="btn-gov-saffron">
              <PlusCircle size={16} />
              <span>Register First Property</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {properties.map((p) => (
            <div key={p._id} className="content-card" style={{ marginBottom: 0 }}>
              <div className="card-header">
                <div>
                  <span className="code-badge">{p.propertyCode}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Survey No: <strong>{p.surveyNumber}</strong>
                  </div>
                </div>
                <span
                  className={`status-badge ${
                    p.verificationStatus === 'VERIFIED'
                      ? 'status-verified'
                      : p.verificationStatus === 'REJECTED'
                      ? 'status-rejected'
                      : 'status-pending'
                  }`}
                >
                  {p.verificationStatus === 'VERIFIED' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  <span>{p.verificationStatus}</span>
                </span>
              </div>

              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <MapPin size={16} color="var(--gov-navy-700)" />
                    <span>
                      {p.address}, {p.village && `${p.village}, `}
                      {p.taluka && `${p.taluka}, `}
                      {p.district}, {p.state} - {p.pincode}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                    <Maximize2 size={16} color="var(--gov-navy-700)" />
                    <span>
                      Total Area: <strong>{p.area} {p.areaUnit || 'sq.ft'}</strong> &bull; {p.propertyType.replace('_', ' ')}
                    </span>
                  </div>

                  {p.description && (
                    <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      "{p.description}"
                    </div>
                  )}

                  {p.status === 'TRANSFER_PENDING' && (
                    <div style={{ background: 'var(--saffron-50)', border: '1px solid var(--saffron-100)', color: 'var(--saffron-600)', padding: '8px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={14} />
                      <span>Property is currently locked under an active transfer process.</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
                  <button
                    onClick={() => onOpenTitleDeed(p)}
                    className="btn-gov-saffron"
                    style={{ justifyContent: 'center', fontSize: '0.76rem', padding: '7px 8px' }}
                    title="View and print official Form 7/12 & Title Sanad Certificate"
                  >
                    <FileCheck size={14} />
                    <span>Title Deed</span>
                  </button>
                  <button
                    onClick={() => onOpenUpload(p)}
                    className="btn-gov-primary"
                    style={{ justifyContent: 'center', fontSize: '0.76rem', padding: '7px 8px' }}
                  >
                    <FileText size={14} />
                    <span>Docs & AI</span>
                  </button>
                  <button
                    onClick={() => onOpenHistory(p._id, p.propertyCode)}
                    className="btn-gov-outline"
                    style={{ justifyContent: 'center', fontSize: '0.76rem', padding: '7px 8px' }}
                  >
                    <History size={14} />
                    <span>Ledger</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
