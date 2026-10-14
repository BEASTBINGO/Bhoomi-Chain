import React, { useState, useEffect } from 'react';
import {
  ClipboardList, RefreshCw, Search, AlertTriangle, Clock,
} from 'lucide-react';
import { getAuditLogs } from '../services/api';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

const ACTION_COLORS = {
  PROPERTY_VERIFIED_AND_APPROVED: { bg: 'var(--green-50)', color: 'var(--green-700)', border: 'var(--green-100)' },
  PROPERTY_REGISTRATION_REJECTED: { bg: 'var(--red-50)', color: 'var(--red-700)', border: 'var(--red-100)' },
  PROPERTY_OWNERSHIP_TRANSFERRED: { bg: 'var(--navy-50)', color: 'var(--navy-500)', border: 'var(--navy-100)' },
  TRANSFER_REQUEST_CREATED: { bg: 'var(--saffron-50)', color: 'var(--saffron-600)', border: 'var(--saffron-100)' },
  TRANSFER_REQUEST_REJECTED: { bg: 'var(--red-50)', color: 'var(--red-700)', border: 'var(--red-100)' },
  PAYMENT_PROOF_SUBMITTED: { bg: 'var(--green-50)', color: 'var(--green-700)', border: 'var(--green-100)' },
  REGISTRAR_LOGIN: { bg: 'var(--slate-50)', color: 'var(--slate-600)', border: 'var(--slate-200)' },
};

const ACTION_LABELS = {
  PROPERTY_VERIFIED_AND_APPROVED: '✅ Property Approved',
  PROPERTY_REGISTRATION_REJECTED: '❌ Property Rejected',
  PROPERTY_OWNERSHIP_TRANSFERRED: '🔄 Ownership Transferred',
  TRANSFER_REQUEST_CREATED: '📋 Transfer Initiated',
  TRANSFER_REQUEST_REJECTED: '❌ Transfer Rejected',
  PAYMENT_PROOF_SUBMITTED: '💳 Payment Submitted',
  REGISTRAR_LOGIN: '🔐 Registrar Login',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAuditLogs();
      if (data.success) setLogs(data.logs || []);
      else setError(data.message || 'Failed to load logs.');
    } catch {
      setError('Cannot connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return (
      !q ||
      l.action?.toLowerCase().includes(q) ||
      l.actorRole?.toLowerCase().includes(q) ||
      l.entityType?.toLowerCase().includes(q) ||
      l.actor?.fullName?.toLowerCase().includes(q) ||
      l.actor?.bcid?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="section-head">
        <div className="section-title">
          <ClipboardList size={20} color="var(--navy-500)" />
          System Audit Log ({logs.length} records)
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="search-bar">
            <Search size={14} color="var(--text-muted)" />
            <input
              placeholder="Filter by action, role, actor…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-outline btn-sm" onClick={loadLogs}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 20 }}>
        <ClipboardList size={15} />
        Audit logs are immutable records of all critical actions taken in the system. Showing last 100 entries.
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <AlertTriangle size={16} />{error}
        </div>
      )}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="gov-card">
          <div className="empty-state">
            <ClipboardList size={40} />
            <div className="empty-state-title">No audit logs found</div>
            <div className="empty-state-desc">System actions will appear here as they are performed.</div>
          </div>
        </div>
      ) : (
        <div className="gov-card">
          <div className="gov-table-wrap">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, idx) => {
                  const style = ACTION_COLORS[log.action] || { bg: 'var(--slate-50)', color: 'var(--slate-600)', border: 'var(--slate-200)' };
                  return (
                    <tr key={log._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{filtered.length - idx}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                        {formatDate(log.createdAt)}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          background: style.bg, color: style.color,
                          border: `1px solid ${style.border}`,
                          padding: '3px 8px', borderRadius: '20px',
                          fontSize: '0.72rem', fontWeight: 700,
                        }}>
                          {ACTION_LABELS[log.action] || log.action}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{log.actor?.fullName || 'System'}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.actor?.bcid}</div>
                      </td>
                      <td>
                        <span className="badge badge-review" style={{ fontSize: '0.7rem' }}>{log.actorRole}</span>
                      </td>
                      <td style={{ fontSize: '0.78rem' }}>
                        <span style={{ fontWeight: 600 }}>{log.entityType}</span>
                        {log.entityId && <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{log.entityId.slice(-8)}</div>}
                      </td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: 200 }}>
                        {log.metadata && Object.entries(log.metadata)
                          .filter(([, v]) => v && typeof v === 'string' || typeof v === 'number')
                          .slice(0, 2)
                          .map(([k, v]) => (
                            <div key={k}><strong>{k}:</strong> {String(v).slice(0, 40)}</div>
                          ))
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
