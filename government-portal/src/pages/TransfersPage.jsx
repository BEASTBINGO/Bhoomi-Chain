import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Eye,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  AlertTriangle,
  User,
  Plus,
  CreditCard,
  X,
  Info,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
  ArrowRight,
  DollarSign,
  FileText,
} from 'lucide-react';
import {
  getAllTransfers,
  getTransferById,
  governmentTransferDecision,
  createTransferRequest,
  lookupCitizen,
  getCitizenProperties,
} from '../services/api';

const STATUS_FILTERS = [
  { id: '', label: 'All Transfers' },
  { id: 'SELLER_ACCEPTANCE_PENDING', label: 'Step 1: Seller Pending' },
  { id: 'BUYER_ACCEPTANCE_PENDING', label: 'Step 2: Buyer Pending' },
  { id: 'SECURITY_CONFIRMATION_PENDING', label: 'Step 3: Security Signing' },
  { id: 'PAYMENT_PENDING', label: 'Step 4: Payment Pending' },
  { id: 'GOVERNMENT_REVIEW', label: 'Step 5: Sub-Registrar Review' },
  { id: 'COMPLETED', label: 'Step 6: Sealed in Ledger' },
];

function getDetailedStepBadge(t) {
  const status = t.status;

  if (status === 'SELLER_ACCEPTANCE_PENDING' || status === 'SELLER_VERIFICATION_PENDING') {
    return {
      step: 1,
      text: 'Step 1: Seller Review',
      subtext: 'Awaiting Seller Acceptance',
      badgeClass: 'badge badge-seller',
    };
  }

  if (status === 'BUYER_ACCEPTANCE_PENDING' || status === 'BUYER_VERIFICATION_PENDING') {
    return {
      step: 2,
      text: 'Step 2: Buyer Review',
      subtext: 'Awaiting Buyer Acceptance',
      badgeClass: 'badge badge-buyer',
    };
  }

  if (status === 'SECURITY_CONFIRMATION_PENDING') {
    if (t.sellerSecurityConfirmed && !t.buyerSecurityConfirmed) {
      return {
        step: 3,
        text: 'Step 3: Card Signing',
        subtext: 'Wait for Buyer to complete',
        badgeClass: 'badge badge-pending',
      };
    }
    if (!t.sellerSecurityConfirmed && t.buyerSecurityConfirmed) {
      return {
        step: 3,
        text: 'Step 3: Card Signing',
        subtext: 'Wait for Seller to complete',
        badgeClass: 'badge badge-pending',
      };
    }
    return {
      step: 3,
      text: 'Step 3: Card Signing',
      subtext: 'Awaiting Both Card Credentials',
      badgeClass: 'badge badge-pending',
    };
  }

  if (status === 'PAYMENT_PENDING') {
    return {
      step: 4,
      text: 'Step 4: Payment Entry',
      subtext: 'Awaiting Buyer Bank Transfer / UPI',
      badgeClass: 'badge badge-pending',
    };
  }

  if (status === 'GOVERNMENT_REVIEW' || status === 'PAYMENT_SUBMITTED') {
    return {
      step: 5,
      text: 'Step 5: Gov Action Ready',
      subtext: 'Payment Verified & Ready to Seal',
      badgeClass: 'badge badge-review',
    };
  }

  if (status === 'COMPLETED' || status === 'BLOCKCHAIN_RECORDED') {
    return {
      step: 6,
      text: 'Step 6: Completed',
      subtext: 'Sealed on Blockchain Ledger',
      badgeClass: 'badge badge-completed',
    };
  }

  if (status === 'CANCELLED' || status === 'REJECTED') {
    return {
      step: 0,
      text: 'Declined / Cancelled',
      subtext: t.rejectionReason || 'Deed Cancelled',
      badgeClass: 'badge badge-rejected',
    };
  }

  return {
    step: 1,
    text: status.replace(/_/g, ' '),
    subtext: '',
    badgeClass: 'badge badge-pending',
  };
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  // Selected Transfer Detail Drawer
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Decision Modal
  const [decisionModal, setDecisionModal] = useState(null); // { id, action: 'APPROVE' | 'REJECT' }
  const [remarks, setRemarks] = useState('');
  const [rejReason, setRejReason] = useState('');
  const [deciding, setDeciding] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // ─── Initiate Transfer Form States (Requirement #4) ─────────────
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [sellerBcid, setSellerBcid] = useState('');
  const [sellerInfo, setSellerInfo] = useState(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerProperties, setSellerProperties] = useState([]);

  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  const [buyerBcid, setBuyerBcid] = useState('');
  const [buyerInfo, setBuyerInfo] = useState(null);
  const [buyerLoading, setBuyerLoading] = useState(false);

  const [agreedAmount, setAgreedAmount] = useState('');
  const [transferType, setTransferType] = useState('SALE');
  const [transferRemarks, setTransferRemarks] = useState('');

  // Initial load & Polling interval for real-time updates (Requirement #9)
  useEffect(() => {
    loadTransfers();

    const interval = setInterval(() => {
      loadTransfers(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [filter]);

  const loadTransfers = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const data = await getAllTransfers(filter);
      if (data.success) {
        setTransfers(data.transfers || []);
      }
    } catch (err) {
      if (!isSilent) setError('Failed to load transfers.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const openDetail = async (t) => {
    setSelected(t);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await getTransferById(t._id);
      if (data.success) {
        setDetail(data);
      }
    } catch (err) {
      console.error('Failed to get transfer details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Dynamic Lookups for Transfer Form (Requirement #4) ──────────
  const lookupSeller = async (bcidToLookup = sellerBcid) => {
    if (!bcidToLookup.trim()) return;
    setSellerLoading(true);
    setCreateError('');
    try {
      const [citizenRes, propRes] = await Promise.all([
        lookupCitizen(bcidToLookup.trim()),
        getCitizenProperties(bcidToLookup.trim()),
      ]);

      if (citizenRes.success) {
        setSellerInfo(citizenRes.citizen);
      } else {
        setSellerInfo(null);
      }

      if (propRes.success) {
        const eligible = (propRes.properties || []).filter((p) => p.status !== 'TRANSFER_PENDING');
        setSellerProperties(eligible);
        if (eligible.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId(eligible[0]._id);
        }
      } else {
        setSellerProperties([]);
      }
    } catch (err) {
      setSellerInfo(null);
      setSellerProperties([]);
      setCreateError(err.response?.data?.message || 'Seller BCID lookup failed.');
    } finally {
      setSellerLoading(false);
    }
  };

  const lookupBuyer = async (bcidToLookup = buyerBcid) => {
    if (!bcidToLookup.trim()) return;
    setBuyerLoading(true);
    setCreateError('');
    try {
      const res = await lookupCitizen(bcidToLookup.trim());
      if (res.success) {
        setBuyerInfo(res.citizen);
      } else {
        setBuyerInfo(null);
      }
    } catch (err) {
      setBuyerInfo(null);
      setCreateError(err.response?.data?.message || 'Buyer BCID lookup failed.');
    } finally {
      setBuyerLoading(false);
    }
  };

  // 1-Click Fast Transfer Fill for College Viva
  const handleFastTransferFill = async () => {
    setCreateError('');
    const demoSeller = 'BCID-IND-2026-000001';
    const demoBuyer = 'BCID-IND-2026-000002';
    setSellerBcid(demoSeller);
    setBuyerBcid(demoBuyer);
    setAgreedAmount('5500000');
    setTransferRemarks('Statutory deed transfer approved via Sub-Registrar Escrow');

    await Promise.all([lookupSeller(demoSeller), lookupBuyer(demoBuyer)]);
  };

  const handleCreateTransferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPropertyId || !buyerBcid.trim() || !agreedAmount) {
      setCreateError('Please select a property, enter buyer ID, and specify agreed amount.');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const res = await createTransferRequest({
        propertyId: selectedPropertyId,
        buyerBcid: buyerBcid.trim(),
        agreedAmount: Number(agreedAmount),
        transferType,
        remarks: transferRemarks,
      });

      if (res.success) {
        setSuccessMsg('✅ Transfer Request initiated successfully! Request forwarded to Seller.');
        setShowCreate(false);
        // Reset form
        setSellerBcid('');
        setSellerInfo(null);
        setSellerProperties([]);
        setSelectedPropertyId('');
        setBuyerBcid('');
        setBuyerInfo(null);
        setAgreedAmount('');
        setTransferRemarks('');
        await loadTransfers();
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setCreateError(res.message || 'Failed to initiate transfer');
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Transfer initiation failed');
    } finally {
      setCreating(false);
    }
  };

  const handleDecision = async () => {
    if (!decisionModal) return;
    const { id, action } = decisionModal;
    if (action === 'REJECT' && !rejReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }

    setDeciding(true);
    try {
      const data = await governmentTransferDecision(id, action, remarks, rejReason);
      if (data.success) {
        setSuccessMsg(
          action === 'APPROVE'
            ? '✅ Transfer approved! Ownership updated & permanently sealed in blockchain ledger.'
            : '❌ Transfer rejected. Property status restored to ACTIVE.'
        );
        setDecisionModal(null);
        setSelected(null);
        setDetail(null);
        setRemarks('');
        setRejReason('');
        await loadTransfers();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Decision failed.');
    } finally {
      setDeciding(false);
    }
  };

  const filteredTransfers = transfers.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.transferRequestId?.toLowerCase().includes(q) ||
      t.property?.propertyCode?.toLowerCase().includes(q) ||
      t.property?.surveyNumber?.toLowerCase().includes(q) ||
      t.seller?.fullName?.toLowerCase().includes(q) ||
      t.buyer?.fullName?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--gov-navy-900)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowRightLeft size={22} color="var(--gov-gold)" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--gov-navy-950)' }}>
                Property Ownership Transfer Lifecycle
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Multi-party real-time escrow: Seller Review &rarr; Buyer Review &rarr; BhoomiCard Signing &rarr; Non-Cash Payment &rarr; Ledger Sealing
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              setShowCreate(true);
              setCreateError('');
            }}
            className="btn-gov-saffron"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '10px 18px' }}
          >
            <Plus size={16} />
            <span>Initiate Transfer Request</span>
          </button>

          <button
            onClick={() => loadTransfers()}
            className="btn-gov-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            background: 'var(--gov-green-50)',
            border: '1px solid var(--gov-green-100)',
            color: 'var(--gov-green-700)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle2 size={20} color="var(--gov-green-700)" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Tabs Toolbar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '14px 18px',
          border: '1px solid var(--border-light)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: filter === s.id ? 'var(--gov-navy-900)' : '#f1f5f9',
                color: filter === s.id ? '#ffffff' : 'var(--text-muted)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '260px' }}>
          <input
            type="text"
            className="gov-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transfer ID, survey #, names..."
            style={{ width: '100%', paddingLeft: '34px', fontSize: '0.8rem' }}
          />
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>
      </div>

      {/* Main Grid: Transfers Table & Detail Review Drawer */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        <div style={{ flex: selected ? '1.2' : '1', transition: 'all 0.3s ease' }}>
          <div
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border-light)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-light)', fontWeight: 800, color: 'var(--gov-navy-950)', fontSize: '0.9rem' }}>
              Official Deeds Register ({filteredTransfers.length})
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="gov-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Transfer ID</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Property / Survey #</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Seller (Current)</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Buyer (Prospective)</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Amount (₹)</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700 }}>Current Step Progress</th>
                    <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div className="spinner" style={{ margin: '0 auto 10px auto' }} />
                        <span>Loading active transfers…</span>
                      </td>
                    </tr>
                  ) : filteredTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No transfers found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTransfers.map((t) => {
                      const stepInfo = getDetailedStepBadge(t);

                      return (
                        <tr
                          key={t._id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: selected?._id === t._id ? 'var(--navy-50)' : '#ffffff',
                            cursor: 'pointer',
                          }}
                          onClick={() => openDetail(t)}
                        >
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--gov-navy-950)' }}>
                            {t.transferRequestId}
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--gov-navy-900)' }}>
                              {t.property?.propertyCode || 'PROPERTY'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Survey #{t.property?.surveyNumber} ({t.property?.district || 'Palghar'})
                            </div>
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600 }}>{t.seller?.fullName || 'Seller'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {t.seller?.bcid}
                            </div>
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 600 }}>{t.buyer?.fullName || 'Buyer'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              {t.buyer?.bcid}
                            </div>
                          </td>

                          <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--gov-green-700)' }}>
                            ₹{Number(t.agreedAmount || 0).toLocaleString('en-IN')}
                          </td>

                          <td style={{ padding: '12px 14px' }}>
                            <span className={stepInfo.badgeClass} style={{ display: 'inline-block', fontSize: '0.72rem', fontWeight: 700 }}>
                              {stepInfo.text}
                            </span>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {stepInfo.subtext}
                            </div>
                          </td>

                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetail(t);
                              }}
                              className="btn-gov-navy"
                              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Transfer Detail & Review Desk */}
        {selected && (
          <div
            style={{
              flex: '1.2',
              background: '#ffffff',
              borderRadius: '12px',
              border: '2px solid var(--gov-navy-900)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
          >
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
                <ShieldCheck size={20} color="var(--gov-gold)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>
                    Transfer Deed Desk &bull; {selected.transferRequestId}
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Survey #{selected.property?.surveyNumber} &bull; Consideration ₹{Number(selected.agreedAmount).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {detailLoading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 10px auto' }} />
                <span>Loading complete deed history & payment proofs…</span>
              </div>
            ) : detail ? (
              <div style={{ padding: '20px', maxHeight: '78vh', overflowY: 'auto' }}>
                {/* Real-time Step Status */}
                <div style={{ marginBottom: '16px', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Current Escrow Lifecycle Step:
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gov-navy-950)', marginTop: '2px' }}>
                    {getDetailedStepBadge(detail.transfer).text}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {getDetailedStepBadge(detail.transfer).subtext}
                  </div>
                </div>

                {/* Seller & Buyer Party Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#f0f7ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>SELLER</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e3a8a' }}>{detail.transfer.seller?.fullName}</div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#3b82f6' }}>{detail.transfer.seller?.bcid}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                      Security Signed: {detail.transfer.sellerSecurityConfirmed ? '✅ Confirmed' : '⏳ Pending'}
                    </div>
                  </div>

                  <div style={{ background: '#fefce8', padding: '12px', borderRadius: '8px', border: '1px solid #fef08a' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase' }}>BUYER</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#713f12' }}>{detail.transfer.buyer?.fullName}</div>
                    <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#ca8a04' }}>{detail.transfer.buyer?.bcid}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                      Security Signed: {detail.transfer.buyerSecurityConfirmed ? '✅ Confirmed' : '⏳ Pending'}
                    </div>
                  </div>
                </div>

                {/* Payment Proof details if available */}
                {(detail.transfer.paymentDetails || detail.paymentProof) && (
                  <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1px solid #86efac', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.85rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={15} />
                      <span>Non-Cash Payment Verified Proof</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div>Payment Mode: <strong>{detail.transfer.paymentDetails?.paymentMode || detail.paymentProof?.paymentMode}</strong></div>
                      <div>UTR / Ref: <strong>{detail.transfer.paymentDetails?.referenceNumber || detail.paymentProof?.paymentReference}</strong></div>
                      <div>Bank / Switch: <strong>{detail.transfer.paymentDetails?.bankName || 'State Bank of India'}</strong></div>
                      <div>Amount: <strong>₹{Number(detail.transfer.paymentDetails?.amount || detail.transfer.agreedAmount).toLocaleString('en-IN')}</strong></div>
                    </div>
                  </div>
                )}

                {/* Final Registrar Decision Action (Step 5) */}
                {detail.transfer.status === 'GOVERNMENT_REVIEW' && (
                  <div style={{ paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      Official Statutory Review: Both parties have signed with card credentials, and non-cash payment has been reconciled.
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => setDecisionModal({ id: detail.transfer._id, action: 'APPROVE' })}
                        className="btn-gov-success"
                        style={{ flex: 1, padding: '12px', fontSize: '0.88rem', justifyContent: 'center' }}
                      >
                        <ShieldCheck size={16} />
                        <span>Approve Deed & Seal on Blockchain</span>
                      </button>
                      <button
                        onClick={() => setDecisionModal({ id: detail.transfer._id, action: 'REJECT' })}
                        className="btn-gov-danger"
                        style={{ padding: '12px 18px', fontSize: '0.88rem' }}
                      >
                        <XCircle size={16} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                )}

                {detail.transfer.status === 'COMPLETED' && (
                  <div style={{ padding: '12px', background: '#dcfce7', borderRadius: '8px', border: '1px solid #86efac', color: '#14532d', fontSize: '0.82rem', fontWeight: 700 }}>
                    ✅ Transfer Completed: Legal title permanently transferred to {detail.transfer.buyer?.fullName} and sealed in Blockchain block.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          REQUIREMENT #4: NEW TRANSFER INITIATION MODAL
          Seller ID -> Properties -> Buyer ID -> Amount & Remarks
         ───────────────────────────────────────────────────────────── */}
      {showCreate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 15, 25, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowCreate(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '620px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-light)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 22px',
                background: 'linear-gradient(135deg, var(--gov-navy-950), var(--gov-navy-900))',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '2px solid var(--gov-gold)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Plus size={20} color="var(--gov-gold)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                    Initiate Property Transfer Deed
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Sub-Registrar Desk &bull; Dynamic Citizen & Asset Verification
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* 1-Click Fast Fill for College Viva */}
                <button
                  type="button"
                  onClick={handleFastTransferFill}
                  className="btn-gov-outline"
                  style={{
                    background: 'rgba(255, 184, 0, 0.15)',
                    borderColor: 'var(--gov-gold)',
                    color: 'var(--gov-gold)',
                    fontSize: '0.72rem',
                    padding: '4px 10px',
                    fontWeight: 800,
                  }}
                  title="Fast auto-fill for demonstration"
                >
                  <Sparkles size={12} color="var(--gov-gold)" />
                  <span>⚡ 1-Click Fast Transfer Fill</span>
                </button>

                <button
                  onClick={() => setShowCreate(false)}
                  style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateTransferSubmit} style={{ padding: '22px' }}>
              {createError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '16px' }}>
                  <AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />
                  <span>{createError}</span>
                </div>
              )}

              {/* 1. SELLER ID INPUT & DYNAMIC COMMON INFO */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gov-navy-950)' }}>
                    1. Enter Seller ID Number (BCID) *
                  </label>
                  <button
                    type="button"
                    onClick={() => lookupSeller()}
                    style={{ background: 'none', border: 'none', color: 'var(--gov-navy-700)', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {sellerLoading ? 'Fetching...' : 'Verify Seller ID'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={sellerBcid}
                    onChange={(e) => setSellerBcid(e.target.value)}
                    onBlur={() => lookupSeller()}
                    placeholder="e.g. BCID-IND-2026-000001"
                    required
                    style={{ fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => lookupSeller()}
                    className="btn-gov-navy"
                    style={{ padding: '0 16px', fontSize: '0.78rem' }}
                  >
                    Lookup
                  </button>
                </div>

                {/* Common Info Shown Below Seller ID (Requirement #4) */}
                {sellerInfo && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      marginTop: '8px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Seller Name: </span>
                      <strong style={{ color: '#166534' }}>{sellerInfo.fullName}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Aadhaar Card No: </span>
                      <strong style={{ fontFamily: 'monospace' }}>{sellerInfo.aadhaarNumber || '5489 3210 1001'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Phone: </span>
                      <strong>{sellerInfo.mobile}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. SELECT PROPERTY FROM LIST OF PROPERTIES SELLER OWNS */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gov-navy-950)', display: 'block', marginBottom: '4px' }}>
                  2. Select Property to Transfer (From Seller's Verified Landholdings) *
                </label>

                {sellerProperties.length > 0 ? (
                  <select
                    className="form-control"
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                    required
                    style={{ fontSize: '0.85rem' }}
                  >
                    <option value="">-- Choose one of the seller's verified properties --</option>
                    {sellerProperties.map((p) => (
                      <option key={p._id} value={p._id}>
                        Survey #{p.surveyNumber} &bull; Gat #{p.gatNumber || 'N/A'} &bull; {p.district} ({p.area} {p.areaUnit}) &bull; Code: {p.propertyCode}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {sellerBcid ? 'No verified active properties found for this seller.' : 'Enter seller ID above to populate owned properties list.'}
                  </div>
                )}
              </div>

              {/* 3. BUYER ID INPUT & DYNAMIC COMMON INFO */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gov-navy-950)' }}>
                    3. Enter Buyer ID Number (BCID) *
                  </label>
                  <button
                    type="button"
                    onClick={() => lookupBuyer()}
                    style={{ background: 'none', border: 'none', color: 'var(--gov-navy-700)', fontSize: '0.72rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {buyerLoading ? 'Fetching...' : 'Verify Buyer ID'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={buyerBcid}
                    onChange={(e) => setBuyerBcid(e.target.value)}
                    onBlur={() => lookupBuyer()}
                    placeholder="e.g. BCID-IND-2026-000002"
                    required
                    style={{ fontSize: '0.85rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => lookupBuyer()}
                    className="btn-gov-navy"
                    style={{ padding: '0 16px', fontSize: '0.78rem' }}
                  >
                    Lookup
                  </button>
                </div>

                {/* Common Info Shown Below Buyer ID (Requirement #4) */}
                {buyerInfo && (
                  <div
                    style={{
                      background: '#fefce8',
                      border: '1px solid #fef08a',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      marginTop: '8px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Buyer Name: </span>
                      <strong style={{ color: '#854d0e' }}>{buyerInfo.fullName}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Aadhaar Card No: </span>
                      <strong style={{ fontFamily: 'monospace' }}>{buyerInfo.aadhaarNumber || '5489 3210 1002'}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Phone: </span>
                      <strong>{buyerInfo.mobile}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. AMOUNT & REMARKS (Requirement #4) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px', marginBottom: '14px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gov-navy-950)', display: 'block', marginBottom: '4px' }}>
                    4. Agreed Consideration Amount (₹) *
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={agreedAmount}
                    onChange={(e) => setAgreedAmount(e.target.value)}
                    placeholder="e.g. 5500000"
                    required
                    style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gov-green-700)' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gov-navy-950)', display: 'block', marginBottom: '4px' }}>
                    Deed Type
                  </label>
                  <select
                    className="form-control"
                    value={transferType}
                    onChange={(e) => setTransferType(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <option value="SALE">SALE</option>
                    <option value="GIFT">GIFT</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gov-navy-950)', display: 'block', marginBottom: '4px' }}>
                  5. Registrar Remarks & Legal Notes
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  placeholder="e.g. Registered in presence of Sub-Registrar Officer"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Submit Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn-gov-outline"
                  style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-gov-saffron"
                  style={{ padding: '10px 24px', fontSize: '0.88rem' }}
                >
                  {creating ? 'Creating Request…' : 'Create Transfer Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {decisionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 15, 25, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setDecisionModal(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '520px',
              background: '#ffffff',
              borderRadius: '14px',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-light)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '16px 20px',
                background: decisionModal.action === 'APPROVE' ? 'linear-gradient(135deg, #14532d, #16a34a)' : 'linear-gradient(135deg, #7f1d1d, #dc2626)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                {decisionModal.action === 'APPROVE' ? 'Approve & Seal Ownership Transfer' : 'Reject Transfer Request'}
              </h3>
              <button onClick={() => setDecisionModal(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {decisionModal.action === 'APPROVE' ? (
                <div style={{ fontSize: '0.85rem', color: '#166534', background: '#f0fdf4', padding: '12px', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '16px' }}>
                  This will permanently re-assign legal ownership to the Buyer and mint a cryptographic Block on the BhoomiChain simulated ledger with an immutable SHA-256 seal.
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Rejection Reason *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={rejReason}
                    onChange={(e) => setRejReason(e.target.value)}
                    placeholder="e.g. Payment reference reconciliation mismatch"
                    required
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Official Registrar Remarks
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Approved following digital BhoomiCard signatures and verified non-cash settlement"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setDecisionModal(null)} className="btn-gov-outline" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDecision}
                  disabled={deciding}
                  className={decisionModal.action === 'APPROVE' ? 'btn-gov-success' : 'btn-gov-danger'}
                  style={{ padding: '8px 20px' }}
                >
                  {deciding ? 'Processing…' : decisionModal.action === 'APPROVE' ? 'Confirm Approval & Record in Ledger' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
