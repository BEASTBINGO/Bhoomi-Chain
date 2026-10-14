import React, { useState, useEffect } from 'react';
import { X, History, ShieldCheck, Landmark, ArrowRight, UserCheck, CheckCircle2 } from 'lucide-react';
import { getPropertyOwnershipHistory } from '../services/api';

export default function OwnershipHistoryModal({ isOpen, onClose, propertyId, propertyCode }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && propertyId) {
      loadHistory();
    }
  }, [isOpen, propertyId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await getPropertyOwnershipHistory(propertyId);
      if (res.success) {
        setHistory(res.history);
      }
    } catch (err) {
      console.error('Failed to load ownership history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-dialog-wide">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="gov-emblem-badge" style={{ width: '36px', height: '36px' }}>
              <History size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Blockchain Ownership History Graph</h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Immutable Chain of Custody &bull; Property: <strong className="code-badge">{propertyCode}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              Loading immutable ownership chain from ledger...
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
              No historical transfer events recorded yet for this property. Initial registration will appear upon registrar approval.
            </div>
          ) : (
            <div className="timeline-container">
              {history.map((item, index) => {
                const isCurrent = index === history.length - 1;
                const fromOwner = item.previousOwner?.fullName || 'State Land Records Directorate (Genesis)';
                const toOwner = item.newOwner?.fullName || 'Registered Citizen';

                return (
                  <div key={item._id} className={`timeline-node ${isCurrent ? 'current-owner' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge-proto" style={{ background: isCurrent ? 'var(--gov-green-600)' : 'var(--gov-navy-800)' }}>
                          Node #{index + 1}
                        </span>
                        <span className="code-badge">{item.transactionType}</span>
                        {isCurrent && (
                          <span className="status-badge status-verified">
                            <CheckCircle2 size={12} />
                            <span>Current Legal Owner</span>
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(item.transferDate || item.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* Parties */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0', fontSize: '0.9rem' }}>
                      <div style={{ flex: 1, background: '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Transferor / Prior Owner</div>
                        <div style={{ fontWeight: 700, color: 'var(--gov-navy-900)' }}>{fromOwner}</div>
                        {item.previousOwner?.bcid && (
                          <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                            {item.previousOwner.bcid}
                          </div>
                        )}
                      </div>

                      <ArrowRight size={20} color="var(--saffron-500)" />

                      <div style={{ flex: 1, background: isCurrent ? 'var(--gov-green-50)' : '#f8fafc', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: `1px solid ${isCurrent ? 'var(--gov-green-100)' : 'var(--border-light)'}` }}>
                        <div style={{ fontSize: '0.7rem', color: isCurrent ? 'var(--gov-green-700)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Transferee / New Owner
                        </div>
                        <div style={{ fontWeight: 700, color: isCurrent ? 'var(--gov-green-700)' : 'var(--gov-navy-900)' }}>
                          {toOwner}
                        </div>
                        {item.newOwner?.bcid && (
                          <div style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: isCurrent ? 'var(--gov-green-700)' : 'var(--text-muted)' }}>
                            {item.newOwner.bcid}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Blockchain Metadata */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', background: '#fafbfd', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '0.75rem', marginTop: '12px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Ledger Tx ID: </span>
                        <strong className="code-badge">{item.blockchainTransactionId || 'TX-GENESIS'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Gov Approval ID: </span>
                        <strong style={{ color: 'var(--gov-navy-900)' }}>{item.governmentApprovalId || 'REG-MH-2026'}</strong>
                      </div>
                      {item.transferAmount ? (
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Settled Consideration: </span>
                          <strong style={{ color: 'var(--gov-green-700)' }}>₹{Number(item.transferAmount).toLocaleString('en-IN')}</strong>
                        </div>
                      ) : null}
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Registry: </span>
                        <span>{item.governmentOffice?.officeName || 'Vasai-Virar Sub-Registrar'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-gov-primary">
            Close History Chain
          </button>
        </div>
      </div>
    </div>
  );
}
