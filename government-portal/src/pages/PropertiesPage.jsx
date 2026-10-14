import React, { useState, useEffect } from 'react';
import {
  Building2, Search, Eye, CheckCircle2, XCircle,
  FileText, AlertTriangle, MapPin, User, Calendar,
  ChevronRight, RefreshCw, X,
} from 'lucide-react';
import { getAllProperties, getPropertyReviewDetails, verifyProperty } from '../services/api';

function statusBadge(status) {
  const map = {
    PENDING: 'badge badge-pending',
    UNDER_REVIEW: 'badge badge-review',
    VERIFIED: 'badge badge-verified',
    REJECTED: 'badge badge-rejected',
  };
  return map[status] || 'badge badge-pending';
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  // Decision modal
  const [decisionModal, setDecisionModal] = useState(null); // { id, action }
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [deciding, setDeciding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    loadProperties();
  }, [filter]);

  const loadProperties = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllProperties(filter);
      if (data.success) setProperties(data.properties || []);
      else setError(data.message || 'Failed to fetch properties.');
    } catch (err) {
      setError('Failed to connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (prop) => {
    setSelected(prop);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await getPropertyReviewDetails(prop._id);
      if (data.success) setDetail(data);
    } catch {}
    setDetailLoading(false);
  };

  const handleDecision = async () => {
    if (!decisionModal) return;
    const { id, action } = decisionModal;
    if (action === 'REJECT' && !reason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    setDeciding(true);
    try {
      const data = await verifyProperty(id, action, reason, remarks);
      if (data.success) {
        setSuccessMsg(action === 'APPROVE' ? '✅ Property approved and recorded in ledger.' : '❌ Property registration rejected.');
        setDecisionModal(null);
        setReason('');
        setRemarks('');
        setSelected(null);
        loadProperties();
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Decision failed.');
    } finally {
      setDeciding(false);
    }
  };

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.propertyCode?.toLowerCase().includes(q) ||
      p.surveyNumber?.toLowerCase().includes(q) ||
      p.district?.toLowerCase().includes(q) ||
      p.currentOwner?.fullName?.toLowerCase().includes(q) ||
      p.currentOwner?.bcid?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Success message */}
      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>
          <CheckCircle2 size={16} />
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="section-head">
        <div className="section-title">
          <Building2 size={20} color="var(--navy-500)" />
          Property Records
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadProperties}>
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {['', 'PENDING', 'VERIFIED', 'REJECTED', 'UNDER_REVIEW'].map((f) => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => { setFilter(f); setSelected(null); }}
          >
            {f === '' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
        <div className="search-bar" style={{ marginLeft: 'auto' }}>
          <Search size={14} color="var(--text-muted)" />
          <input
            placeholder="Search by code, survey, owner…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main layout — table + detail panel */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Table */}
        <div className="gov-card" style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : error ? (
            <div className="alert alert-danger" style={{ margin: 20 }}>
              <AlertTriangle size={16} />{error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <Building2 size={40} />
              <div className="empty-state-title">No properties found</div>
              <div className="empty-state-desc">Try changing your filter or search term.</div>
            </div>
          ) : (
            <div className="gov-table-wrap">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Property Code</th>
                    <th>Owner</th>
                    <th>Type</th>
                    <th>District</th>
                    <th>Area</th>
                    <th>Status</th>
                    <th>Docs</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p._id} style={selected?._id === p._id ? { background: 'var(--navy-50)' } : {}}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700 }}>
                          {p.propertyCode}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>{p.currentOwner?.fullName || '—'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.currentOwner?.bcid}</div>
                      </td>
                      <td>{p.propertyType || '—'}</td>
                      <td>{p.district || '—'}</td>
                      <td>{p.area ? `${p.area} ${p.areaUnit || 'sqm'}` : '—'}</td>
                      <td><span className={statusBadge(p.verificationStatus)}>{p.verificationStatus}</span></td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}>
                          <FileText size={12} color="var(--text-muted)" />
                          {p.documentsCount ?? 0}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {formatDate(p.createdAt)}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => openDetail(p)}>
                          <Eye size={13} />
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div className="gov-card" style={{ width: 360, flexShrink: 0 }}>
            <div className="gov-card-header">
              <div className="gov-card-title">
                <Eye size={16} />
                Property Review
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                onClick={() => setSelected(null)}
              >
                <X size={15} />
              </button>
            </div>

            {detailLoading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : detail ? (
              <div className="gov-card-body" style={{ padding: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <span className={statusBadge(detail.property.verificationStatus)}>
                    {detail.property.verificationStatus}
                  </span>
                </div>

                <div className="info-grid" style={{ border: '1px solid var(--slate-100)', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
                  {[
                    ['Property Code', detail.property.propertyCode],
                    ['Survey Number', detail.property.surveyNumber],
                    ['Type', detail.property.propertyType],
                    ['Area', `${detail.property.area ?? '—'} ${detail.property.areaUnit ?? ''}`],
                    ['Village', detail.property.village],
                    ['Taluka', detail.property.taluka],
                    ['District', detail.property.district],
                    ['State', detail.property.state],
                  ].map(([label, val]) => (
                    <div key={label} className="info-row">
                      <span className="info-label">{label}</span>
                      <span className="info-value">{val || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Owner */}
                <div style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--navy-50)', borderRadius: 8, border: '1px solid var(--navy-100)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--navy-500)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <User size={12} /> Applicant / Owner
                  </div>
                  <div style={{ fontWeight: 600 }}>{detail.property.currentOwner?.fullName}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {detail.property.currentOwner?.bcid} · {detail.property.currentOwner?.mobile}
                  </div>
                </div>

                {/* Documents */}
                {detail.documents?.length > 0 ? (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Uploaded Documents
                    </div>
                    {detail.documents.map((doc) => (
                      <div key={doc._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'var(--slate-50)', borderRadius: 6, marginBottom: 6, border: '1px solid var(--slate-200)' }}>
                        <FileText size={14} color="var(--navy-400)" style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.fileName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{doc.documentType} · AI: {doc.aiStatus || 'Not analyzed'}</div>
                        </div>
                        <span className={doc.aiStatus === 'SUSPICIOUS' ? 'badge badge-rejected' : doc.aiStatus === 'VERIFIED' ? 'badge badge-verified' : 'badge badge-pending'} style={{ fontSize: '0.65rem' }}>
                          {doc.governmentStatus || 'PENDING'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16, padding: '10px', background: 'var(--slate-50)', borderRadius: 6, textAlign: 'center' }}>
                    No documents uploaded yet
                  </div>
                )}

                {/* Actions */}
                {(detail.property.verificationStatus === 'PENDING' || detail.property.verificationStatus === 'UNDER_REVIEW') && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-success btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => setDecisionModal({ id: detail.property._id, action: 'APPROVE' })}
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => setDecisionModal({ id: detail.property._id, action: 'REJECT' })}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <Building2 size={30} />
                <div>Could not load details</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decision Confirmation Modal */}
      {decisionModal && (
        <div className="modal-backdrop" onClick={() => setDecisionModal(null)}>
          <div className="modal-box sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {decisionModal.action === 'APPROVE' ? <CheckCircle2 size={18} color="var(--green-600)" /> : <XCircle size={18} color="var(--red-600)" />}
                {decisionModal.action === 'APPROVE' ? 'Approve Property Registration' : 'Reject Registration'}
              </div>
              <button className="modal-close" onClick={() => setDecisionModal(null)}><X size={14} /></button>
            </div>
            <div className="modal-body">
              {decisionModal.action === 'APPROVE' ? (
                <div className="alert alert-info">
                  <CheckCircle2 size={15} />
                  This will mark the property as VERIFIED and create a permanent record in the blockchain ledger.
                </div>
              ) : (
                <>
                  <div className="alert alert-danger">
                    <AlertTriangle size={15} />
                    This will reject the registration. The applicant will need to re-submit.
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rejection Reason *</label>
                    <input
                      className="form-control"
                      placeholder="Enter reason for rejection…"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      autoFocus
                    />
                  </div>
                </>
              )}
              <div className="form-group">
                <label className="form-label">Official Remarks (Optional)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Any additional remarks for the record…"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDecisionModal(null)}>Cancel</button>
              <button
                className={`btn ${decisionModal.action === 'APPROVE' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleDecision}
                disabled={deciding}
              >
                {deciding ? 'Processing…' : decisionModal.action === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
