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
  Lock,
  XCircle,
} from 'lucide-react';

export default function MyLand({ properties, onOpenRegister, onOpenUpload, onOpenHistory, onOpenTitleDeed, onSwitchTab }) {
  // Only show lands which user owns (officially verified by Government)
  const ownedProperties = properties.filter((p) => p.verificationStatus === 'VERIFIED');
  const pendingCount = properties.filter((p) => p.verificationStatus !== 'VERIFIED').length;

  return (
    <div>
      <div className="page-intro-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2>My Land Parcels & Registered Estates</h2>
            <span
              style={{
                background: '#dcfce7',
                color: '#15803d',
                border: '1px solid #86efac',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              Officially Owned Titles
            </span>
          </div>
          <p>Official legal records of real estate titles owned by your BCID and sealed in the blockchain ledger</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {pendingCount > 0 && onSwitchTab && (
            <button
              onClick={() => onSwitchTab('verification')}
              className="btn-gov-outline"
              style={{ fontSize: '0.82rem' }}
            >
              <span>Track In-Verification Parcels ({pendingCount}) &rarr;</span>
            </button>
          )}
          <button onClick={onOpenRegister} className="btn-gov-saffron">
            <PlusCircle size={16} />
            <span>Add New Land Parcel</span>
          </button>
        </div>
      </div>

      {ownedProperties.length === 0 ? (
        <div className="content-card">
          <div className="card-body" style={{ textAlign: 'center', padding: '56px 24px' }}>
            <div className="gov-emblem-badge" style={{ margin: '0 auto 16px auto', width: '60px', height: '60px' }}>
              <Landmark size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--gov-navy-900)', margin: '0 0 8px 0' }}>
              No Verified Owned Lands Yet
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 24px auto', fontSize: '0.875rem', lineHeight: '1.6' }}>
              This tab displays exclusively the land titles that you legally own with Government Registrar approval.
              {pendingCount > 0
                ? ` You currently have ${pendingCount} land parcel(s) undergoing statutory verification in the "Property in Verification" tab.`
                : ' Click below to register your first land parcel and submit it for cadastral verification.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {pendingCount > 0 && onSwitchTab && (
                <button onClick={() => onSwitchTab('verification')} className="btn-gov-navy">
                  <Clock size={16} />
                  <span>View Properties in Verification ({pendingCount})</span>
                </button>
              )}
              <button onClick={onOpenRegister} className="btn-gov-saffron">
                <PlusCircle size={16} />
                <span>Register New Land Parcel</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {ownedProperties.map((p) => (
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
                  {p.verificationStatus === 'VERIFIED' ? (
                    <button
                      onClick={() => onOpenTitleDeed(p)}
                      className="btn-gov-saffron"
                      style={{ justifyContent: 'center', fontSize: '0.76rem', padding: '7px 8px' }}
                      title="View and print official Form 7/12 & Title Sanad Certificate"
                    >
                      <FileCheck size={14} />
                      <span>Title Deed</span>
                    </button>
                  ) : p.verificationStatus === 'REJECTED' ? (
                    <button
                      onClick={() => onOpenTitleDeed(p)}
                      style={{
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        padding: '7px 6px',
                        background: '#fee2e2',
                        color: '#b91c1c',
                        border: '1px solid #fca5a5',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      title={`Application Rejected: ${p.rejectionReason || 'Deed/Master DB mismatch'}`}
                    >
                      <XCircle size={13} />
                      <span>Rejected</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenTitleDeed(p)}
                      style={{
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        padding: '7px 6px',
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      title="Certificate Locked: Will appear only after Government approves uploaded documents and land details."
                    >
                      <Lock size={13} color="#94a3b8" />
                      <span>Cert. Locked</span>
                    </button>
                  )}
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
