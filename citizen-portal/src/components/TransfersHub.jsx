import React, { useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  CreditCard,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  User,
  Landmark,
  Lock,
  Building2,
  Sparkles,
  Check,
  FileText,
  DollarSign,
  Info,
  Calendar,
  Phone,
} from 'lucide-react';
import {
  sellerVerifyTransfer,
  buyerVerifyTransfer,
  securityConfirmTransfer,
  submitPaymentProof,
} from '../services/api';
import TransferStepTracker from './TransferStepTracker';

export default function TransfersHub({ transfers = [], currentCitizen, onRefreshTransfers }) {
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Security confirmation forms keyed by transferId
  const [securityFormState, setSecurityFormState] = useState({});

  // Payment forms keyed by transferId
  const [paymentFormState, setPaymentFormState] = useState({});

  const getSecurityForm = (transferId) => {
    return (
      securityFormState[transferId] || {
        bcid: currentCitizen?.bcid || '',
        aadhaarNumber: currentCitizen?.aadhaarNumber || '',
        secretCardCode: currentCitizen?.secretCardCode || (currentCitizen?.bcid?.includes('000002') ? '456' : '789'),
        cardPin: currentCitizen?.secretPin || '1234',
        phone: currentCitizen?.mobile || '',
      }
    );
  };

  const updateSecurityForm = (transferId, field, value) => {
    setSecurityFormState((prev) => ({
      ...prev,
      [transferId]: {
        ...getSecurityForm(transferId),
        [field]: value,
      },
    }));
  };

  const autofillSecurityCredentials = (transferId) => {
    setSecurityFormState((prev) => ({
      ...prev,
      [transferId]: {
        bcid: currentCitizen?.bcid || 'BCID-IND-2026-000001',
        aadhaarNumber: currentCitizen?.aadhaarNumber || '5489 3210 1001',
        secretCardCode: currentCitizen?.secretCardCode || (currentCitizen?.bcid?.includes('000002') ? '456' : '789'),
        cardPin: currentCitizen?.secretPin || '1234',
        phone: currentCitizen?.mobile || '9876543210',
      },
    }));
  };

  const getPaymentForm = (transfer) => {
    const existing = paymentFormState[transfer._id];
    return {
      paymentMode: existing?.paymentMode || 'BANK_TRANSFER',
      paymentReference:
        existing?.paymentReference !== undefined
          ? existing.paymentReference
          : `RTGS-BARB-${String(transfer._id || '9821').slice(-6).toUpperCase()}`,
      bankName: existing?.bankName || 'Bank of Baroda',
      amount:
        existing?.amount !== undefined && existing?.amount !== ''
          ? existing.amount
          : (transfer.agreedAmount || ''),
      remarks:
        existing?.remarks !== undefined
          ? existing.remarks
          : 'Direct Bank-to-Bank Escrow settlement for property deed registration',
    };
  };

  const updatePaymentForm = (transfer, field, value) => {
    const current = getPaymentForm(transfer);
    setPaymentFormState((prev) => ({
      ...prev,
      [transfer._id]: {
        ...current,
        [field]: value,
      },
    }));
  };

  const autofillBankPayment = (transfer) => {
    const refNum = `RTGS-BARB-${String(transfer._id || '').slice(-4)}${Math.floor(100000 + Math.random() * 900000)}`;
    setPaymentFormState((prev) => ({
      ...prev,
      [transfer._id]: {
        paymentMode: 'BANK_TRANSFER',
        paymentReference: refNum,
        bankName: 'Bank of Baroda',
        amount: transfer.agreedAmount || '',
        remarks: 'Official Bank-to-Bank Transfer settlement via Sub-Registrar Escrow',
      },
    }));
  };

  // Step 1: Seller Verification
  const handleSellerVerify = async (transferId, decision) => {
    setActionLoadingId(transferId);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const res = await sellerVerifyTransfer(transferId, decision);
      if (res.success) {
        setStatusMessage(
          decision === 'ACCEPT'
            ? '✅ Seller Acceptance Confirmed! The transfer request has now been forwarded to the Buyer.'
            : 'Transfer declined by Seller.'
        );
        await onRefreshTransfers();
      } else {
        setErrorMessage(res.message || 'Verification failed');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Verification request failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Step 2: Buyer Verification
  const handleBuyerVerify = async (transferId, decision) => {
    setActionLoadingId(transferId);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const res = await buyerVerifyTransfer(transferId, decision);
      if (res.success) {
        setStatusMessage(
          decision === 'ACCEPT'
            ? '✅ Buyer Acceptance Confirmed! Both parties must now confirm Digital BhoomiCard security credentials.'
            : 'Transfer declined by Buyer.'
        );
        await onRefreshTransfers();
      } else {
        setErrorMessage(res.message || 'Verification failed');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Verification request failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Step 3: Security Credentials Confirmation
  const handleSecurityConfirm = async (transferId) => {
    setActionLoadingId(transferId);
    setStatusMessage('');
    setErrorMessage('');

    const form = getSecurityForm(transferId);

    try {
      const res = await securityConfirmTransfer(transferId, form);
      if (res.success) {
        setStatusMessage(res.message || 'Security credentials confirmed successfully.');
        await onRefreshTransfers();
      } else {
        setErrorMessage(res.message || 'Security confirmation failed');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Security confirmation error. Please check your credentials.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Step 4: Buyer Payment Submission
  const handlePaymentSubmit = async (transfer) => {
    setActionLoadingId(transfer._id);
    setStatusMessage('');
    setErrorMessage('');

    const form = getPaymentForm(transfer);

    if (form.paymentMode === 'CASH') {
      setErrorMessage('Cash payments are strictly prohibited by Government Land Registry guidelines.');
      setActionLoadingId(null);
      return;
    }

    if (!form.paymentReference || !form.bankName || !form.amount) {
      setErrorMessage('Payment Reference / UTR, Bank Name, and Amount are all required.');
      setActionLoadingId(null);
      return;
    }

    try {
      const res = await submitPaymentProof(transfer._id, {
        paymentMode: form.paymentMode,
        paymentReference: String(form.paymentReference).trim(),
        bankName: String(form.bankName).trim(),
        amount: Number(form.amount || transfer.agreedAmount),
        remarks: form.remarks || 'Settlement completed',
      });

      if (res.success) {
        setStatusMessage('✅ Official Payment Proof recorded! Submitted for Sub-Registrar Review & Ledger Sealing.');
        await onRefreshTransfers();
      } else {
        setErrorMessage(res.message || 'Payment submission failed');
      }
    } catch (err) {
      console.error('Payment submission failed:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Payment submission error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div>
      <div className="page-intro-header">
        <div>
          <h2>Property Ownership Transfer Hub</h2>
          <p>Multi-party digital verification, BhoomiCard security signing & non-cash payment registry</p>
        </div>
        <button onClick={onRefreshTransfers} className="btn-gov-outline" style={{ fontSize: '0.8rem' }}>
          <span>Refresh Requests</span>
        </button>
      </div>

      {statusMessage && (
        <div
          style={{
            background: 'var(--gov-green-50)',
            border: '1px solid var(--gov-green-100)',
            color: 'var(--gov-green-700)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <CheckCircle2 size={20} color="var(--gov-green-700)" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            background: 'var(--gov-red-50)',
            border: '1px solid var(--gov-red-100)',
            color: 'var(--gov-red-600)',
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.88rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <AlertCircle size={20} color="var(--gov-red-600)" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Transfers List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {transfers.length === 0 ? (
          <div className="content-card">
            <div className="card-body" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
              <ArrowRightLeft size={36} color="var(--border-strong)" style={{ margin: '0 auto 12px auto' }} />
              <h4 style={{ fontSize: '1.1rem', color: 'var(--gov-navy-900)' }}>No Active Transfer Requests</h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '420px', margin: '6px auto 0 auto' }}>
                When the Sub-Registrar initiates a land transfer involving your BhoomiCard account, the multi-step request will appear here in real time.
              </p>
            </div>
          </div>
        ) : (
          transfers.map((t) => {
            const currentId = currentCitizen?.id || currentCitizen?._id;
            const sellerId = t.seller?._id || t.seller;
            const buyerId = t.buyer?._id || t.buyer;

            const isSeller = sellerId?.toString() === currentId?.toString();
            const isBuyer = buyerId?.toString() === currentId?.toString();

            const isSellerPending =
              t.status === 'SELLER_ACCEPTANCE_PENDING' || t.status === 'SELLER_VERIFICATION_PENDING';
            const isBuyerPending =
              t.status === 'BUYER_ACCEPTANCE_PENDING' || t.status === 'BUYER_VERIFICATION_PENDING';
            const isSecurityPending = t.status === 'SECURITY_CONFIRMATION_PENDING';
            const isPaymentPending = t.status === 'PAYMENT_PENDING';
            const isGovReview = t.status === 'GOVERNMENT_REVIEW';
            const isCompleted = t.status === 'COMPLETED' || t.status === 'BLOCKCHAIN_RECORDED';

            const mySecurityDone = isSeller ? t.sellerSecurityConfirmed : isBuyer ? t.buyerSecurityConfirmed : false;
            const otherSecurityDone = isSeller ? t.buyerSecurityConfirmed : isBuyer ? t.sellerSecurityConfirmed : false;

            return (
              <div key={t._id} className="content-card" style={{ marginBottom: 0, overflow: 'hidden' }}>
                {/* Header Strip with Dynamic Role Badge */}
                <div
                  className="card-header"
                  style={{
                    background: isSeller ? 'linear-gradient(90deg, #f0f7ff, #ffffff)' : 'linear-gradient(90deg, #fffbeb, #ffffff)',
                    borderBottom: '1px solid var(--border-light)',
                    padding: '14px 20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span className="code-badge" style={{ fontSize: '0.82rem' }}>{t.transferRequestId}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--gov-navy-950)' }}>
                      {t.property?.propertyCode || 'PROPERTY'} &bull; Survey No. {t.property?.surveyNumber}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        background: isSeller ? 'var(--gov-navy-900)' : 'var(--saffron-600)',
                        color: '#ffffff',
                      }}
                    >
                      {isSeller ? 'YOUR ROLE: SELLER' : 'YOUR ROLE: BUYER'}
                    </span>
                  </div>

                  <span
                    className={`status-badge ${
                      isCompleted ? 'status-verified' : isGovReview ? 'status-pending' : 'status-pending'
                    }`}
                    style={{ fontSize: '0.78rem', fontWeight: 700 }}
                  >
                    {t.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Visual Multi-Party Step Progress Tracker */}
                <TransferStepTracker transfer={t} currentCitizen={currentCitizen} />

                <div className="card-body" style={{ padding: '20px' }}>
                  {/* Summary Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px',
                      background: '#f8fafc',
                      padding: '16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-light)',
                      marginBottom: '20px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Seller Information:
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--gov-navy-950)', fontSize: '0.92rem' }}>
                        {t.seller?.fullName || 'Current Owner'}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        BID: {t.seller?.bcid}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Aadhaar: {t.seller?.aadhaarNumber ? `XXXX-XXXX-${t.seller.aadhaarNumber.slice(-4)}` : 'Verified'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Buyer Information:
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--gov-navy-950)', fontSize: '0.92rem' }}>
                        {t.buyer?.fullName || 'Prospective Buyer'}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        BID: {t.buyer?.bcid}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        Aadhaar: {t.buyer?.aadhaarNumber ? `XXXX-XXXX-${t.buyer.aadhaarNumber.slice(-4)}` : 'Verified'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Agreed Purchase Amount:
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-green-700)' }}>
                        ₹{Number(t.agreedAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Transfer Deed Type: {t.transferType || 'SALE'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Parcel Location:
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.85rem' }}>
                        {t.property?.district || 'Palghar'}, Maharashtra
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Area: {t.property?.area} {t.property?.areaUnit || 'sq.ft'}
                      </div>
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────
                      PHASE 1: SELLER ACCEPTANCE VIEW
                     ───────────────────────────────────────────────────────── */}
                  {isSellerPending && isSeller && (
                    <div
                      style={{
                        background: '#eff6ff',
                        borderRadius: '10px',
                        padding: '16px',
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Info size={18} color="#1d4ed8" />
                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1e3a8a' }}>
                          Step 1 of 4: Seller Digital Review & Acceptance
                        </h4>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#1e40af', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                        The Government Sub-Registrar has initiated an ownership transfer deed for your property <strong>Survey No. {t.property?.surveyNumber}</strong> to buyer <strong>{t.buyer?.fullName}</strong> (BID: <code>{t.buyer?.bcid}</code>) for consideration of <strong>₹{Number(t.agreedAmount).toLocaleString('en-IN')}</strong>. Please review and confirm your acceptance to proceed.
                      </p>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleSellerVerify(t._id, 'ACCEPT')}
                          className="btn-gov-success"
                          disabled={actionLoadingId === t._id}
                          style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                        >
                          <CheckCircle2 size={16} />
                          <span>Accept Transfer Request as Seller</span>
                        </button>
                        <button
                          onClick={() => handleSellerVerify(t._id, 'REJECT')}
                          className="btn-gov-danger"
                          disabled={actionLoadingId === t._id}
                          style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                        >
                          <XCircle size={16} />
                          <span>Decline Transfer</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────
                      PHASE 2: BUYER ACCEPTANCE VIEW (ONLY AFTER SELLER ACCEPTS)
                     ───────────────────────────────────────────────────────── */}
                  {isBuyerPending && (
                    <>
                      {isSeller ? (
                        <div
                          style={{
                            background: '#f8fafc',
                            border: '1px solid var(--border-medium)',
                            borderRadius: '10px',
                            padding: '14px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                        >
                          <Clock size={20} color="var(--saffron-600)" />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--gov-navy-950)', fontSize: '0.88rem' }}>
                              Seller Acceptance Recorded &bull; Waiting for Buyer
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              You have confirmed your willingness to transfer. Awaiting Buyer ({t.buyer?.fullName}) to review the deed and accept.
                            </div>
                          </div>
                        </div>
                      ) : isBuyer ? (
                        <div
                          style={{
                            background: '#fefce8',
                            borderRadius: '10px',
                            padding: '16px',
                            border: '1px solid #fef08a',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Info size={18} color="#a16207" />
                            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#854d0e' }}>
                              Step 2 of 4: Buyer Review & Purchase Acceptance
                            </h4>
                          </div>
                          <p style={{ fontSize: '0.82rem', color: '#713f12', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                            Seller <strong>{t.seller?.fullName}</strong> has officially accepted to transfer property <strong>Survey No. {t.property?.surveyNumber}</strong> ({t.property?.district}) to you for the agreed consideration of <strong>₹{Number(t.agreedAmount).toLocaleString('en-IN')}</strong>. Please confirm your acceptance to proceed to BhoomiCard security signing.
                          </p>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              onClick={() => handleBuyerVerify(t._id, 'ACCEPT')}
                              className="btn-gov-success"
                              disabled={actionLoadingId === t._id}
                              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                            >
                              <CheckCircle2 size={16} />
                              <span>Accept Purchase as Buyer</span>
                            </button>
                            <button
                              onClick={() => handleBuyerVerify(t._id, 'REJECT')}
                              className="btn-gov-danger"
                              disabled={actionLoadingId === t._id}
                              style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                            >
                              <XCircle size={16} />
                              <span>Decline Purchase</span>
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}

                  {/* ─────────────────────────────────────────────────────────
                      PHASE 3: DUAL SECURITY CONFIRMATION FORM
                      (Appears when both seller and buyer have accepted)
                     ───────────────────────────────────────────────────────── */}
                  {isSecurityPending && (
                    <div style={{ marginTop: '10px' }}>
                      {!mySecurityDone ? (
                        /* Security Confirmation Form for this party */
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            border: '2px solid var(--gov-navy-700)',
                            padding: '20px',
                            boxShadow: 'var(--shadow-md)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  background: 'var(--gov-navy-900)',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Lock size={18} />
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '0.98rem', color: 'var(--gov-navy-950)' }}>
                                  Step 3: BhoomiCard Security Credentials Confirmation
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Both parties must authenticate digital card credentials to authorize statutory deed signing
                                </p>
                              </div>
                            </div>

                            {/* 1-Click Auto Fill Demo Button */}
                            <button
                              type="button"
                              onClick={() => autofillSecurityCredentials(t._id)}
                              className="btn-gov-outline"
                              style={{ fontSize: '0.75rem', padding: '6px 12px', borderColor: 'var(--saffron-500)', color: 'var(--saffron-600)' }}
                            >
                              <Sparkles size={13} color="var(--saffron-500)" />
                              <span>⚡ 1-Click Fast Card Fill</span>
                            </button>
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                              gap: '12px',
                              marginBottom: '16px',
                            }}
                          >
                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                                1. ID Number (BCID) *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={getSecurityForm(t._id).bcid}
                                onChange={(e) => updateSecurityForm(t._id, 'bcid', e.target.value)}
                                placeholder="e.g. BCID-IND-2026-000001"
                                required
                                style={{ fontSize: '0.82rem' }}
                              />
                            </div>

                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                                2. Aadhaar Card No. *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={getSecurityForm(t._id).aadhaarNumber}
                                onChange={(e) => updateSecurityForm(t._id, 'aadhaarNumber', e.target.value)}
                                placeholder="12-digit Aadhaar"
                                required
                                style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}
                              />
                            </div>

                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                                3. Secret Code on Card (3 Digits) *
                              </label>
                              <input
                                type="text"
                                maxLength={4}
                                className="form-control"
                                value={getSecurityForm(t._id).secretCardCode}
                                onChange={(e) => updateSecurityForm(t._id, 'secretCardCode', e.target.value)}
                                placeholder="e.g. 789"
                                required
                                style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700 }}
                              />
                            </div>

                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                                4. Card PIN (4 Digits) *
                              </label>
                              <input
                                type="password"
                                maxLength={6}
                                className="form-control"
                                value={getSecurityForm(t._id).cardPin}
                                onChange={(e) => updateSecurityForm(t._id, 'cardPin', e.target.value)}
                                placeholder="e.g. 1234"
                                required
                                style={{ fontSize: '0.82rem', letterSpacing: '2px', fontWeight: 700 }}
                              />
                            </div>

                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                                5. Phone No. *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={getSecurityForm(t._id).phone}
                                onChange={(e) => updateSecurityForm(t._id, 'phone', e.target.value)}
                                placeholder="10-digit registered mobile"
                                required
                                style={{ fontSize: '0.82rem' }}
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSecurityConfirm(t._id)}
                            disabled={actionLoadingId === t._id}
                            className="btn-gov-navy"
                            style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                          >
                            <ShieldCheck size={16} />
                            <span>Confirm & Sign Digital Transfer Credentials</span>
                          </button>
                        </div>
                      ) : (
                        /* User already confirmed: waiting for the other party */
                        <div
                          style={{
                            background: '#f8fafc',
                            borderRadius: '10px',
                            padding: '16px 20px',
                            border: '1px solid var(--border-medium)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                          }}
                        >
                          <Clock size={24} color="var(--saffron-600)" />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--gov-navy-950)', fontSize: '0.92rem' }}>
                              Wait for {isSeller ? 'buyer' : 'seller'} to complete this step
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              ✅ Your BhoomiCard security credentials have been verified and signed. The transfer will advance as soon as the {isSeller ? 'Buyer' : 'Seller'} submits their card confirmation.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────
                      PHASE 4: PAYMENT ENTRY (BUYER) vs WAITING FOR PAYMENT (SELLER)
                     ───────────────────────────────────────────────────────── */}
                  {isPaymentPending && (
                    <div style={{ marginTop: '10px' }}>
                      {isSeller ? (
                        /* Seller sees "waiting for buyer to make payment" */
                        <div
                          style={{
                            background: '#f0fdf4',
                            borderRadius: '10px',
                            padding: '18px 20px',
                            border: '1px solid #bbf7d0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                          }}
                        >
                          <Clock size={24} color="#16a34a" />
                          <div>
                            <div style={{ fontWeight: 800, color: '#14532d', fontSize: '0.95rem' }}>
                              Waiting for buyer to make payment
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '2px' }}>
                              Both security authorizations are complete. Awaiting Buyer ({t.buyer?.fullName}) to complete non-cash settlement (Bank Transfer / UPI / Cheque) for ₹{Number(t.agreedAmount).toLocaleString('en-IN')}.
                            </div>
                          </div>
                        </div>
                      ) : isBuyer ? (
                        /* Buyer sees Payment Entry Form (STRICTLY NON-CASH) */
                        <div
                          style={{
                            background: '#ffffff',
                            borderRadius: '12px',
                            border: '2px solid var(--gov-green-700)',
                            padding: '20px',
                            boxShadow: 'var(--shadow-md)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  background: 'var(--gov-green-700)',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <CreditCard size={18} />
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '0.98rem', color: 'var(--gov-navy-950)' }}>
                                  Step 4: Non-Cash Purchase Consideration Payment
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Strict State Regulation: NO CASH. Only Bank-to-Bank, UPI, or Cheque/DD accepted.
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => autofillBankPayment(t)}
                              className="btn-gov-outline"
                              style={{ fontSize: '0.75rem', padding: '6px 12px', borderColor: 'var(--gov-green-700)', color: 'var(--gov-green-700)' }}
                            >
                              <Sparkles size={13} color="var(--gov-green-700)" />
                              <span>⚡ 1-Click Fast Bank Payment Fill</span>
                            </button>
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                              gap: '12px',
                              marginBottom: '16px',
                            }}
                          >
                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                                Payment Method (NO CASH) *
                              </label>
                              <select
                                className="form-control"
                                value={getPaymentForm(t).paymentMode}
                                onChange={(e) => updatePaymentForm(t, 'paymentMode', e.target.value)}
                                style={{ fontSize: '0.85rem' }}
                              >
                                <option value="BANK_TRANSFER">Bank-to-Bank (NEFT / RTGS / IMPS)</option>
                                <option value="UPI">UPI (Unified Payments Interface)</option>
                                <option value="CHEQUE_DD">Cheque / Demand Draft</option>
                              </select>
                            </div>

                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                                Reference / UTR / Cheque Number *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={getPaymentForm(t).paymentReference}
                                onChange={(e) => updatePaymentForm(t, 'paymentReference', e.target.value)}
                                placeholder="e.g. RTGS-SBIN-98129841"
                                required
                                style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}
                              />
                            </div>

                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                                Bank / Gateway Name *
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                value={getPaymentForm(t).bankName}
                                onChange={(e) => updatePaymentForm(t, 'bankName', e.target.value)}
                                placeholder="e.g. State Bank of India"
                                required
                                style={{ fontSize: '0.85rem' }}
                              />
                            </div>

                            <div className="form-group">
                              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                                Consideration Amount (₹) *
                              </label>
                              <input
                                type="number"
                                className="form-control"
                                value={getPaymentForm(t).amount}
                                onChange={(e) => updatePaymentForm(t, 'amount', e.target.value)}
                                required
                                style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gov-green-700)' }}
                              />
                            </div>
                          </div>

                          <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                              Payment Remarks / Reference Notes
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              value={getPaymentForm(t).remarks}
                              onChange={(e) => updatePaymentForm(t, 'remarks', e.target.value)}
                              placeholder="e.g. Full settlement via RTGS account transfer"
                              style={{ fontSize: '0.85rem' }}
                            />
                          </div>

                          {errorMessage && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <AlertCircle size={16} />
                              <span>{errorMessage}</span>
                            </div>
                          )}
                          {statusMessage && (
                            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CheckCircle2 size={16} />
                              <span>{statusMessage}</span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handlePaymentSubmit(t)}
                            disabled={actionLoadingId === t._id}
                            className="btn-gov-success"
                            style={{ padding: '10px 22px', fontSize: '0.9rem', cursor: actionLoadingId === t._id ? 'not-allowed' : 'pointer' }}
                          >
                            <CreditCard size={16} />
                            <span>{actionLoadingId === t._id ? 'Recording Payment...' : 'Submit Non-Cash Payment Details'}</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────
                      PHASE 5: GOVERNMENT REVIEW
                     ───────────────────────────────────────────────────────── */}
                  {isGovReview && (
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '10px',
                        padding: '16px 20px',
                        border: '1px solid var(--border-medium)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                      }}
                    >
                      <Clock size={24} color="var(--gov-gold)" />
                      <div>
                        <div style={{ fontWeight: 800, color: 'var(--gov-navy-950)', fontSize: '0.92rem' }}>
                          Payment Recorded &bull; Pending Government Sub-Registrar Sealing
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Both parties have confirmed credentials and submitted official payment proof. The deed is now undergoing final review and digital blockchain ledger recording at the Sub-Registrar office.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─────────────────────────────────────────────────────────
                      PHASE 6: COMPLETED
                     ───────────────────────────────────────────────────────── */}
                  {isCompleted && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                        borderRadius: '10px',
                        padding: '16px 20px',
                        border: '1px solid #86efac',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                      }}
                    >
                      <ShieldCheck size={28} color="#15803d" />
                      <div>
                        <div style={{ fontWeight: 800, color: '#14532d', fontSize: '0.95rem' }}>
                          Ownership Transfer Successfully Sealed on Blockchain Ledger
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '2px' }}>
                          Property title has been officially re-assigned to <strong>{t.buyer?.fullName}</strong>. Cryptographic transaction recorded in simulated ledger block with immutable SHA-256 state seal.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
