import React from 'react';
import {
  Landmark,
  ShieldCheck,
  Clock,
  ArrowRightLeft,
  PlusCircle,
  FileText,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  FileCheck,
  Lock,
  XCircle,
} from 'lucide-react';

export default function Dashboard({
  properties,
  transfers,
  onOpenRegister,
  onOpenUpload,
  onOpenHistory,
  onOpenTitleDeed,
  onSwitchTab,
}) {
  const verifiedCount = properties.filter((p) => p.verificationStatus === 'VERIFIED').length;
  const inVerificationCount = properties.filter((p) => p.verificationStatus !== 'VERIFIED').length;
  const pendingTransfersCount = transfers.filter(
    (t) =>
      t.status === 'SELLER_VERIFICATION_PENDING' ||
      t.status === 'BUYER_VERIFICATION_PENDING' ||
      t.status === 'PAYMENT_PENDING' ||
      t.status === 'GOVERNMENT_REVIEW'
  ).length;

  return (
    <div>
      {/* Intro Header */}
      <div className="page-intro-header">
        <div>
          <h2>Citizen Property Overview</h2>
          <p>Real-time records from BhoomiChain Government Registrar Prototype Database</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {inVerificationCount > 0 && (
            <button
              onClick={() => onSwitchTab('verification')}
              className="btn-gov-outline"
              style={{ fontSize: '0.82rem', borderColor: '#f59e0b', color: '#b45309' }}
            >
              <Clock size={15} />
              <span>In Verification ({inVerificationCount})</span>
            </button>
          )}
          <button onClick={onOpenRegister} className="btn-gov-saffron">
            <PlusCircle size={16} />
            <span>Register New Land</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div
          className="metric-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onSwitchTab('myland')}
          title="Click to view your owned land parcels"
        >
          <div className="metric-data">
            <h4>Land Parcels Owned</h4>
            <div className="metric-value">{verifiedCount}</div>
            <div className="metric-subtext">Legally owned titles under your BCID &rarr;</div>
          </div>
          <div className="metric-icon-box metric-icon-navy">
            <Landmark size={24} />
          </div>
        </div>

        <div
          className="metric-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onSwitchTab('verification')}
          title="Click to track properties in verification"
        >
          <div className="metric-data">
            <h4>In Verification</h4>
            <div className="metric-value">{inVerificationCount}</div>
            <div className="metric-subtext" style={{ color: 'var(--gov-amber-600)' }}>
              Under Registrar cadastre & doc review &rarr;
            </div>
          </div>
          <div className="metric-icon-box metric-icon-amber">
            <Clock size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-data">
            <h4>Verified Titles</h4>
            <div className="metric-value">{verifiedCount}</div>
            <div className="metric-subtext" style={{ color: 'var(--gov-green-700)' }}>
              Legally authenticated by Registrar
            </div>
          </div>
          <div className="metric-icon-box metric-icon-green">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div
          className="metric-card"
          style={{ cursor: 'pointer' }}
          onClick={() => onSwitchTab('transfers')}
          title="Click to view transfer requests"
        >
          <div className="metric-data">
            <h4>Transfer Requests</h4>
            <div className="metric-value">{pendingTransfersCount}</div>
            <div className="metric-subtext" style={{ color: 'var(--saffron-600)' }}>
              Awaiting digital verification / payment &rarr;
            </div>
          </div>
          <div className="metric-icon-box metric-icon-saffron">
            <ArrowRightLeft size={24} />
          </div>
        </div>
      </div>

      {/* Action Notification Banner if transfers are pending */}
      {pendingTransfersCount > 0 && (
        <div
          style={{
            background: 'var(--saffron-50)',
            border: '1px solid var(--saffron-100)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} color="var(--saffron-500)" />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--gov-navy-900)', fontSize: '0.95rem' }}>
                Action Required: {pendingTransfersCount} Property Transfer Request(s) Pending
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                You have active transfer requests awaiting seller digital approval or buyer payment proof.
              </div>
            </div>
          </div>
          <button
            onClick={() => onSwitchTab('transfers')}
            className="btn-gov-saffron"
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
          >
            <span>Review Transfers</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      )}

      {/* My Land Summary Table Card */}
      <div className="content-card">
        <div className="card-header">
          <h3>
            <Landmark size={18} color="var(--gov-navy-800)" />
            <span>My Registered Land Parcels</span>
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {inVerificationCount > 0 && (
              <button
                onClick={() => onSwitchTab('verification')}
                className="btn-gov-outline"
                style={{ padding: '6px 12px', fontSize: '0.78rem', borderColor: '#f59e0b', color: '#b45309' }}
                title="View parcels currently undergoing statutory verification"
              >
                <Clock size={13} />
                <span>In Verification ({inVerificationCount})</span>
              </button>
            )}
            <button
              onClick={() => onSwitchTab('myland')}
              className="btn-gov-outline"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              title="View your verified owned estates"
            >
              <span>Owned Lands ({verifiedCount})</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>

        <div className="gov-table-wrapper">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Property Code</th>
                <th>Survey Number</th>
                <th>Type</th>
                <th>Location</th>
                <th>Area</th>
                <th>Verification Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                    No land records currently registered under your BCID. Click "Register New Land" to add your property.
                  </td>
                </tr>
              ) : (
                properties.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <span className="code-badge">{p.propertyCode}</span>
                    </td>
                    <td>
                      <strong>{p.surveyNumber}</strong>
                    </td>
                    <td>{p.propertyType.replace('_', ' ')}</td>
                    <td>
                      {p.village || p.address}, {p.district}, {p.state}
                    </td>
                    <td>
                      {p.area} {p.areaUnit}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          p.verificationStatus === 'VERIFIED'
                            ? 'status-verified'
                            : p.verificationStatus === 'REJECTED'
                            ? 'status-rejected'
                            : 'status-pending'
                        }`}
                      >
                        {p.verificationStatus === 'VERIFIED' && <CheckCircle2 size={12} />}
                        {p.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {p.verificationStatus === 'VERIFIED' ? (
                          <button
                            onClick={() => onOpenTitleDeed(p)}
                            className="btn-gov-saffron"
                            style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                            title="View & Print Official Title Deed Certificate"
                          >
                            <FileCheck size={13} />
                            <span>Deed</span>
                          </button>
                        ) : p.verificationStatus === 'REJECTED' ? (
                          <button
                            onClick={() => onOpenTitleDeed(p)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              border: '1px solid #fca5a5',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                            title={`Registration Rejected: ${p.rejectionReason || 'Deed/Master DB mismatch'}`}
                          >
                            <XCircle size={12} />
                            <span>Rejected</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenTitleDeed(p)}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              background: '#f1f5f9',
                              color: '#64748b',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                            title="Certificate Locked: Appears only after Government approves uploaded documents and land details."
                          >
                            <Lock size={12} color="#94a3b8" />
                            <span>Locked</span>
                          </button>
                        )}
                        <button
                          onClick={() => onOpenUpload(p)}
                          className="btn-gov-outline"
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          title="Upload & Verify Documents"
                        >
                          <FileText size={13} />
                          <span>Docs</span>
                        </button>
                        <button
                          onClick={() => onOpenHistory(p._id, p.propertyCode)}
                          className="btn-gov-outline"
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          title="Inspect Blockchain Ownership History"
                        >
                          <History size={13} />
                          <span>History</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
