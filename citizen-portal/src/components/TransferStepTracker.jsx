import React from 'react';
import {
  FilePlus,
  UserCheck,
  CheckCircle2,
  Lock,
  CreditCard,
  Building,
  Clock,
  AlertCircle,
} from 'lucide-react';

export default function TransferStepTracker({ transfer, currentCitizen }) {
  if (!transfer) return null;

  const currentId = currentCitizen?.id || currentCitizen?._id;
  const sellerId = transfer.seller?._id || transfer.seller;
  const buyerId = transfer.buyer?._id || transfer.buyer;

  const isSeller = sellerId?.toString() === currentId?.toString();
  const isBuyer = buyerId?.toString() === currentId?.toString();

  const status = transfer.status;

  // Determine stage active states
  // Stages:
  // 1: Gov Initiation (Always done if request exists)
  // 2: Seller Consent
  // 3: Buyer Consent
  // 4: Security Confirmation (Dual BhoomiCard PIN)
  // 5: Non-Cash Escrow Payment
  // 6: Government Blockchain Sealing (Final)

  const steps = [
    {
      id: 1,
      title: 'Initiated',
      subtitle: 'Gov Registrar Desk',
      icon: FilePlus,
      isCompleted: true,
      isActive: false,
    },
    {
      id: 2,
      title: 'Seller Consent',
      subtitle: transfer.sellerVerifiedAt ? 'Approved by Seller' : 'Pending Seller Review',
      icon: UserCheck,
      isCompleted:
        status !== 'SELLER_ACCEPTANCE_PENDING' &&
        status !== 'SELLER_VERIFICATION_PENDING',
      isActive:
        status === 'SELLER_ACCEPTANCE_PENDING' ||
        status === 'SELLER_VERIFICATION_PENDING',
    },
    {
      id: 3,
      title: 'Buyer Consent',
      subtitle: transfer.buyerVerifiedAt ? 'Approved by Buyer' : 'Pending Buyer Review',
      icon: UserCheck,
      isCompleted:
        status !== 'SELLER_ACCEPTANCE_PENDING' &&
        status !== 'SELLER_VERIFICATION_PENDING' &&
        status !== 'BUYER_ACCEPTANCE_PENDING' &&
        status !== 'BUYER_VERIFICATION_PENDING',
      isActive:
        status === 'BUYER_ACCEPTANCE_PENDING' ||
        status === 'BUYER_VERIFICATION_PENDING',
    },
    {
      id: 4,
      title: 'Security Signing',
      subtitle:
        transfer.sellerSecurityConfirmed && transfer.buyerSecurityConfirmed
          ? 'Both Signed'
          : transfer.sellerSecurityConfirmed
          ? 'Seller Signed • Waiting Buyer'
          : transfer.buyerSecurityConfirmed
          ? 'Buyer Signed • Waiting Seller'
          : 'Dual PIN Required',
      icon: Lock,
      isCompleted:
        status === 'PAYMENT_PENDING' ||
        status === 'GOVERNMENT_REVIEW' ||
        status === 'COMPLETED' ||
        status === 'BLOCKCHAIN_RECORDED',
      isActive: status === 'SECURITY_CONFIRMATION_PENDING',
    },
    {
      id: 5,
      title: 'Non-Cash Payment',
      subtitle:
        transfer.paymentSubmittedAt
          ? 'Bank/UPI Submitted'
          : 'Escrow Payment Due',
      icon: CreditCard,
      isCompleted:
        status === 'GOVERNMENT_REVIEW' ||
        status === 'COMPLETED' ||
        status === 'BLOCKCHAIN_RECORDED',
      isActive: status === 'PAYMENT_PENDING',
    },
    {
      id: 6,
      title: 'Blockchain Seal',
      subtitle:
        status === 'COMPLETED' || status === 'BLOCKCHAIN_RECORDED'
          ? 'Deed Sealed'
          : status === 'GOVERNMENT_REVIEW'
          ? 'Registrar Executing'
          : 'Final Statutory Act',
      icon: Building,
      isCompleted:
        status === 'COMPLETED' || status === 'BLOCKCHAIN_RECORDED',
      isActive: status === 'GOVERNMENT_REVIEW',
    },
  ];

  return (
    <div
      style={{
        padding: '16px 20px',
        background: '#f8fafc',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          position: 'relative',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {steps.map((step, idx) => {
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                minWidth: '95px',
                position: 'relative',
                textAlign: 'center',
              }}
            >
              {/* Connecting Line between steps */}
              {idx < steps.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    left: '50%',
                    width: '100%',
                    height: '3px',
                    background: step.isCompleted ? '#10b981' : '#e2e8f0',
                    zIndex: 1,
                    transition: 'all 0.3s ease',
                  }}
                />
              )}

              {/* Node Circle */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: step.isCompleted
                    ? '#10b981'
                    : step.isActive
                    ? 'linear-gradient(135deg, #1e3a8a, #0a192f)'
                    : '#ffffff',
                  border: step.isCompleted
                    ? '2px solid #10b981'
                    : step.isActive
                    ? '2px solid var(--gov-gold)'
                    : '2px solid #cbd5e1',
                  color: step.isCompleted || step.isActive ? '#ffffff' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  boxShadow: step.isActive ? '0 0 0 4px rgba(226, 179, 66, 0.25)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {step.isCompleted ? (
                  <CheckCircle2 size={18} color="#ffffff" />
                ) : (
                  <Icon size={15} />
                )}
              </div>

              {/* Step Title */}
              <div style={{ marginTop: '8px', lineHeight: 1.2 }}>
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: step.isActive ? 800 : step.isCompleted ? 700 : 500,
                    color: step.isActive ? 'var(--gov-navy-950)' : step.isCompleted ? '#065f46' : '#64748b',
                  }}
                >
                  {step.title}
                </div>
                <div
                  style={{
                    fontSize: '0.64rem',
                    color: step.isActive ? 'var(--saffron-600)' : '#94a3b8',
                    marginTop: '2px',
                    fontWeight: step.isActive ? 600 : 400,
                  }}
                >
                  {step.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
