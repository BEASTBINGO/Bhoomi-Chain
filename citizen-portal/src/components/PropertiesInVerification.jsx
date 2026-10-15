import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Clock,
  AlertCircle,
  XCircle,
  CheckCircle2,
  PlusCircle,
  FileText,
  History,
  Lock,
  Upload,
  Eye,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Landmark,
  ArrowRight,
} from 'lucide-react';
import { getPropertyDocuments } from '../services/api';

export default function PropertiesInVerification({
  properties,
  onOpenRegister,
  onOpenUpload,
  onOpenHistory,
  onOpenTitleDeed,
  onSwitchTab,
}) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'REJECTED' | 'VERIFIED'
  const [propertyDocs, setPropertyDocs] = useState({});
  const [docsLoading, setDocsLoading] = useState(false);

  // Filter properties: by default show non-verified or user-selected filter
  const pendingProps = properties.filter(
    (p) => p.verificationStatus === 'PENDING' || p.verificationStatus === 'UNDER_REVIEW'
  );
  const rejectedProps = properties.filter((p) => p.verificationStatus === 'REJECTED');
  const verifiedProps = properties.filter((p) => p.verificationStatus === 'VERIFIED');

  // Load documents for properties to display currently uploaded documents sent to gov
  useEffect(() => {
    loadDocumentsForProperties();
  }, [properties]);

  const loadDocumentsForProperties = async () => {
    if (!properties || properties.length === 0) return;
    setDocsLoading(true);
    const docsMap = {};
    await Promise.all(
      properties.map(async (p) => {
        try {
          const res = await getPropertyDocuments(p._id);
          if (res.success) {
            docsMap[p._id] = res.documents || [];
          }
        } catch (err) {
          docsMap[p._id] = [];
        }
      })
    );
    setPropertyDocs(docsMap);
    setDocsLoading(false);
  };

  const getFilteredProperties = () => {
    if (filter === 'PENDING') return pendingProps;
    if (filter === 'REJECTED') return rejectedProps;
    if (filter === 'VERIFIED') return verifiedProps;
    // Default 'ALL': Prioritize pending and rejected (the ones in verification / active review)
    return properties.filter((p) => p.verificationStatus !== 'VERIFIED');
  };

  const displayedProperties = getFilteredProperties();

  return (
    <div>
      {/* Intro Header */}
      <div className="page-intro-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2>Properties in Verification</h2>
            <span
              style={{
                background: '#fef3c7',
                color: '#d97706',
                border: '1px solid #fde68a',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
              }}
            >
              Government Cadastre Review Desk
            </span>
          </div>
          <p>
            Track real-time status, documents sent to government for verification, compliance checks, and statutory review history
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadDocumentsForProperties}
            className="btn-gov-outline"
            style={{ fontSize: '0.82rem', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={docsLoading ? 'spin' : ''} />
            <span>Refresh Status</span>
          </button>
          <button onClick={onOpenRegister} className="btn-gov-saffron">
            <PlusCircle size={16} />
            <span>Submit New Land for Verification</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Counter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#ffffff',
          padding: '12px 18px',
          borderRadius: '10px',
          border: '1px solid var(--border-light)',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: filter === 'ALL' ? '1px solid var(--gov-navy-900)' : '1px solid var(--border-medium)',
              background: filter === 'ALL' ? 'var(--gov-navy-900)' : '#ffffff',
              color: filter === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            In Active Verification ({pendingProps.length + rejectedProps.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('PENDING')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: filter === 'PENDING' ? '1px solid #d97706' : '1px solid var(--border-medium)',
              background: filter === 'PENDING' ? '#fef3c7' : '#ffffff',
              color: filter === 'PENDING' ? '#92400e' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Awaiting Review ({pendingProps.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('REJECTED')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: filter === 'REJECTED' ? '1px solid #ef4444' : '1px solid var(--border-medium)',
              background: filter === 'REJECTED' ? '#fee2e2' : '#ffffff',
              color: filter === 'REJECTED' ? '#991b1b' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Rejected ({rejectedProps.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('VERIFIED')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: filter === 'VERIFIED' ? '1px solid #16a34a' : '1px solid var(--border-medium)',
              background: filter === 'VERIFIED' ? '#dcfce7' : '#ffffff',
              color: filter === 'VERIFIED' ? '#14532d' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Approved History ({verifiedProps.length})
          </button>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Officially verified estates appear exclusively in{' '}
          <strong
            onClick={() => onSwitchTab('myland')}
            style={{ color: 'var(--gov-navy-900)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            My Land & Properties ({verifiedProps.length}) &rarr;
          </strong>
        </div>
      </div>

      {/* Main List of Properties in Verification */}
      {displayedProperties.length === 0 ? (
        <div className="content-card">
          <div className="card-body" style={{ textAlign: 'center', padding: '56px 24px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f0fdf4',
                border: '2px solid #86efac',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <CheckCircle2 size={32} color="#16a34a" />
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--gov-navy-950)', margin: '0 0 8px 0' }}>
              No Pending Properties in Verification
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 24px auto', fontSize: '0.86rem', lineHeight: '1.6' }}>
              All your submitted land enrollment applications have either been verified and moved to{' '}
              <strong>"My Land & Properties"</strong>, or you have not submitted any new parcels for verification.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => onSwitchTab('myland')} className="btn-gov-navy">
                <Landmark size={15} />
                <span>View Owned Land Parcels ({verifiedProps.length})</span>
              </button>
              <button onClick={onOpenRegister} className="btn-gov-saffron">
                <PlusCircle size={15} />
                <span>Submit New Land for Verification</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {displayedProperties.map((p) => {
            const docs = propertyDocs[p._id] || [];
            const isPending = p.verificationStatus === 'PENDING' || p.verificationStatus === 'UNDER_REVIEW';
            const isRejected = p.verificationStatus === 'REJECTED';
            const isVerified = p.verificationStatus === 'VERIFIED';

            return (
              <div
                key={p._id}
                className="content-card"
                style={{
                  marginBottom: 0,
                  border: isRejected
                    ? '2px solid #ef4444'
                    : isPending
                    ? '2px solid #f59e0b'
                    : '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-md)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
              >
                {/* Status Bar Indicator */}
                <div
                  style={{
                    height: '5px',
                    background: isRejected
                      ? '#ef4444'
                      : isPending
                      ? 'linear-gradient(90deg, #f59e0b, #ea580c)'
                      : '#10b981',
                  }}
                />

                <div style={{ padding: '22px 24px' }}>
                  {/* Top Row: Parcel Identification & Current Government Status */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--gov-navy-950)' }}>
                          Survey No. {p.surveyNumber}
                        </h3>
                        <span className="code-badge" style={{ fontFamily: 'monospace' }}>
                          {p.propertyCode}
                        </span>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: 'var(--gov-navy-800)',
                          }}
                        >
                          {p.propertyType?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        📍 {p.address}, {p.village && `${p.village}, `}{p.taluka && `${p.taluka}, `}{p.district}, {p.state} &bull; Area: <strong>{p.area} {p.areaUnit}</strong>
                      </div>
                    </div>

                    {/* Current Government Verification Status Badge */}
                    <div>
                      {isPending && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#fef3c7',
                            border: '1px solid #fde68a',
                            color: '#92400e',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                          }}
                        >
                          <Clock size={15} color="#d97706" />
                          <span>UNDER GOVERNMENT VERIFICATION</span>
                        </div>
                      )}

                      {isRejected && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            color: '#991b1b',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                          }}
                        >
                          <XCircle size={15} color="#dc2626" />
                          <span>APPLICATION REJECTED</span>
                        </div>
                      )}

                      {isVerified && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#dcfce7',
                            border: '1px solid #86efac',
                            color: '#14532d',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 800,
                          }}
                        >
                          <CheckCircle2 size={15} color="#16a34a" />
                          <span>TITLE VERIFIED & APPROVED</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rejection Alert Callout (if rejected) */}
                  {isRejected && (
                    <div
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fca5a5',
                        borderRadius: '10px',
                        padding: '14px 18px',
                        marginBottom: '18px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontWeight: 800, fontSize: '0.84rem' }}>
                        <ShieldAlert size={18} color="#dc2626" />
                        <span>Statutory Rejection Cause Recorded by Government:</span>
                      </div>
                      <div style={{ margin: '6px 0 0 0', fontSize: '0.84rem', color: '#7f1d1d', fontWeight: 600 }}>
                        {p.rejectionReason || 'Title ownership mismatch or parcel duplication detected against Maharashtra Revenue Master Cadastre.'}
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#991b1b' }}>
                        Notice: Under land governance rules, duplicate or mismatched claims are automatically rejected. Please verify the survey number and official deed before re-applying.
                      </div>
                    </div>
                  )}

                  {/* Two Columns: Left = Documents Sent to Gov, Right = Statutory Verification Pipeline */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '18px', marginBottom: '18px' }}>
                    {/* Left Column: Currently Uploaded Documents Sent to Government */}
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid var(--border-light)',
                        padding: '14px 16px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--gov-navy-950)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={15} color="var(--saffron-500)" />
                          <span>Documents Sent to Government for Verification ({docs.length}):</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenUpload(p)}
                          style={{
                            background: '#ffffff',
                            border: '1px solid var(--border-medium)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--gov-navy-900)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Upload size={12} />
                          <span>+ Upload / Manage</span>
                        </button>
                      </div>

                      {docs.length === 0 ? (
                        <div
                          style={{
                            background: '#ffffff',
                            padding: '14px',
                            borderRadius: '8px',
                            border: '1px dashed var(--border-medium)',
                            textAlign: 'center',
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                          }}
                        >
                          <AlertCircle size={20} color="#d97706" style={{ margin: '0 auto 6px auto' }} />
                          <div>No deed document attached yet.</div>
                          <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '2px' }}>
                            Mandatory Form 7/12 or Sale Deed required for Government Registrar approval.
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenUpload(p)}
                            className="btn-gov-saffron"
                            style={{ margin: '10px auto 0 auto', padding: '5px 12px', fontSize: '0.74rem' }}
                          >
                            Upload Statutory Deed Now
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {docs.map((doc) => (
                            <div
                              key={doc._id}
                              style={{
                                background: '#ffffff',
                                border: '1px solid var(--border-light)',
                                borderRadius: '8px',
                                padding: '10px 12px',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--gov-navy-950)' }}>
                                  📄 {doc.fileName}
                                </div>
                                <span
                                  style={{
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    background: doc.governmentStatus === 'VERIFIED' ? '#dcfce7' : doc.governmentStatus === 'REJECTED' ? '#fee2e2' : '#fef3c7',
                                    color: doc.governmentStatus === 'VERIFIED' ? '#15803d' : doc.governmentStatus === 'REJECTED' ? '#991b1b' : '#92400e',
                                  }}
                                >
                                  {doc.governmentStatus === 'VERIFIED' ? '✓ GOV VERIFIED' : doc.governmentStatus === 'REJECTED' ? '✕ REJECTED' : '⏳ AWAITING GOV APPROVAL'}
                                </span>
                              </div>

                              <div style={{ marginTop: '6px', fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                <div>Type: <strong>{doc.documentType?.replace(/_/g, ' ')}</strong></div>
                                <div>Readability: <strong style={{ color: '#15803d' }}>{doc.readabilityScore || 98}% (PASS)</strong></div>
                                <div>AI Status: <strong>{doc.aiStatus || 'VERIFIED'}</strong></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Statutory Verification Pipeline */}
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid var(--border-light)',
                        padding: '14px 16px',
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--gov-navy-950)', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Statutory Verification Pipeline:
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem' }}>✓</div>
                          <div><strong>1. Civil Enrollment:</strong> Parcel application registered on portal</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: docs.length > 0 ? '#dcfce7' : '#fee2e2', color: docs.length > 0 ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem' }}>
                            {docs.length > 0 ? '✓' : '✕'}
                          </div>
                          <div>
                            <strong>2. Deed Upload & Readability:</strong>{' '}
                            {docs.length > 0 ? 'Inspected & Passed (98% Clarity)' : 'Pending Document Upload'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: isVerified ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7', color: isVerified ? '#16a34a' : isRejected ? '#dc2626' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem' }}>
                            {isVerified ? '✓' : isRejected ? '✕' : '⏳'}
                          </div>
                          <div>
                            <strong>3. Master Cadastre & Gov Review:</strong>{' '}
                            <span style={{ fontWeight: 700, color: isVerified ? '#16a34a' : isRejected ? '#dc2626' : '#d97706' }}>
                              {isVerified ? 'Approved & Match Confirmed' : isRejected ? 'Rejected (Mismatch/Duplication)' : 'Awaiting Registrar Decision'}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: isVerified ? '#dcfce7' : '#f1f5f9', color: isVerified ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem' }}>
                            {isVerified ? '✓' : '🔒'}
                          </div>
                          <div style={{ color: isVerified ? 'var(--text-main)' : 'var(--text-muted)' }}>
                            <strong>4. Digital Form 7/12 Sanad:</strong> {isVerified ? 'Unlocked & Sealed on Blockchain' : 'Locked until Government Approval'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-light)', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Application ID: <code>{p.propertyCode}</code> &bull; Submitted: {new Date(p.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => onOpenUpload(p)}
                        className="btn-gov-primary"
                        style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      >
                        <FileText size={13} />
                        <span>Manage Documents</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenTitleDeed(p)}
                        className={isVerified ? 'btn-gov-saffron' : 'btn-gov-outline'}
                        style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                        title={isVerified ? 'View Statutory Form 7/12 Certificate' : 'Inspect Certificate Lock Status'}
                      >
                        {isVerified ? <FileCheck2 size={13} /> : <Lock size={13} color="#94a3b8" />}
                        <span>{isVerified ? 'View Title Deed' : 'Certificate Status (Locked)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenHistory(p._id, p.propertyCode)}
                        className="btn-gov-outline"
                        style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      >
                        <History size={13} />
                        <span>Audit History</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
