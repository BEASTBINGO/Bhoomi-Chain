import React, { useState, useEffect } from 'react';
import {
  Link2, RefreshCw, ShieldCheck, ShieldX,
  AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react';
import { getLedger, verifyLedgerIntegrity } from '../services/api';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const EVENT_LABELS = {
  PROPERTY_REGISTERED: 'Property Registered',
  OWNERSHIP_TRANSFERRED: 'Ownership Transferred',
  DOCUMENT_UPLOADED: 'Document Uploaded',
};

export default function LedgerPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [integrity, setIntegrity] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    setLoading(true);
    setError('');
    setIntegrity(null);
    try {
      const data = await getLedger();
      if (data.success) setRecords(data.records || []);
      else setError(data.message || 'Failed to load ledger.');
    } catch {
      setError('Cannot connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setIntegrity(null);
    try {
      const data = await verifyLedgerIntegrity();
      if (data.success) setIntegrity(data.verification);
    } catch {
      setError('Ledger verification request failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="section-head">
        <div className="section-title">
          <Link2 size={20} color="var(--navy-500)" />
          Blockchain Ledger ({records.length} blocks)
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={loadLedger}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleVerify} disabled={verifying}>
            {verifying ? (
              <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Verifying…</>
            ) : (
              <><ShieldCheck size={13} /> Verify Chain Integrity</>
            )}
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="alert alert-warning" style={{ marginBottom: 20 }}>
        <AlertTriangle size={15} />
        <span>
          <strong>Educational Note:</strong> This is a simulated hash-chain ledger — not a real decentralized blockchain.
          Chain integrity is verified by checking hash links between sequential blocks.
        </span>
      </div>

      {/* Integrity Banner */}
      {integrity && (
        <div className={`integrity-banner ${integrity.isValid ? 'valid' : 'invalid'}`} style={{ marginBottom: 20 }}>
          {integrity.isValid ? (
            <ShieldCheck size={28} color="var(--green-600)" />
          ) : (
            <ShieldX size={28} color="var(--red-600)" />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: integrity.isValid ? 'var(--green-700)' : 'var(--red-700)' }}>
              {integrity.isValid ? 'Chain Integrity Verified ✓' : 'Chain Integrity COMPROMISED ✗'}
            </div>
            <div style={{ fontSize: '0.82rem', color: integrity.isValid ? 'var(--green-600)' : 'var(--red-600)' }}>
              {integrity.isValid
                ? `All ${integrity.totalBlocks} blocks verified. ${integrity.message}`
                : `Tampering detected at block ${integrity.compromisedAtBlock} (TX: ${integrity.compromisedTransactionId}). Reason: ${integrity.reason}`
              }
            </div>
            {integrity.isValid && integrity.headHash && (
              <div style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--green-600)', marginTop: 4 }}>
                HEAD: {integrity.headHash}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 20 }}>
          <AlertTriangle size={16} />{error}
        </div>
      )}

      {/* Ledger Blocks */}
      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : records.length === 0 ? (
        <div className="gov-card">
          <div className="empty-state">
            <Link2 size={40} />
            <div className="empty-state-title">Ledger is Empty</div>
            <div className="empty-state-desc">
              No transactions have been recorded yet. Approve a property registration or transfer to create the first block.
            </div>
          </div>
        </div>
      ) : (
        <div>
          {records.map((rec, idx) => {
            const isExpanded = expanded === rec._id;
            const isInvalidBlock = integrity && !integrity.isValid && integrity.compromisedAtBlock === records.length - idx;
            return (
              <div
                key={rec._id}
                className={`ledger-block ${isInvalidBlock ? 'invalid' : 'valid'}`}
                style={{ cursor: 'pointer', marginBottom: 8 }}
                onClick={() => setExpanded(isExpanded ? null : rec._id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {/* Block number */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: isInvalidBlock ? 'var(--red-100)' : 'var(--navy-50)',
                    border: `1px solid ${isInvalidBlock ? 'var(--red-200)' : 'var(--navy-100)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 800, color: isInvalidBlock ? 'var(--red-600)' : 'var(--navy-500)',
                  }}>
                    #{records.length - idx}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem' }}>{rec.transactionId}</span>
                      <span className={`badge ${isInvalidBlock ? 'badge-rejected' : 'badge-verified'}`} style={{ fontSize: '0.68rem' }}>
                        {isInvalidBlock ? 'INVALID' : rec.blockStatus}
                      </span>
                      <span className="badge badge-review" style={{ fontSize: '0.68rem' }}>
                        {EVENT_LABELS[rec.eventType] || rec.eventType}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span>🏠 {rec.property?.propertyCode || '—'}</span>
                      {rec.newOwner && <span>→ {rec.newOwner.fullName} ({rec.newOwner.bcid})</span>}
                      <span><Clock size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {formatDate(rec.timestamp)}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isExpanded ? '▲ Hide' : '▼ Details'}
                  </div>
                </div>

                {/* Expanded hash details */}
                {isExpanded && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--slate-200)' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {rec.previousOwner && (
                        <div>
                          <div className="info-label">Previous Owner</div>
                          <div className="info-value">{rec.previousOwner.fullName} ({rec.previousOwner.bcid})</div>
                        </div>
                      )}
                      <div>
                        <div className="info-label">New Owner</div>
                        <div className="info-value">{rec.newOwner?.fullName} ({rec.newOwner?.bcid})</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <div className="info-label" style={{ marginBottom: 4 }}>Previous Hash</div>
                      <div className="ledger-hash">{rec.previousHash}</div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div className="info-label" style={{ marginBottom: 4 }}>Current Hash (SHA-256)</div>
                      <div className="ledger-hash" style={{ color: 'var(--navy-400)', fontWeight: 600 }}>{rec.currentHash}</div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div className="info-label" style={{ marginBottom: 4 }}>Data Hash</div>
                      <div className="ledger-hash">{rec.dataHash}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
