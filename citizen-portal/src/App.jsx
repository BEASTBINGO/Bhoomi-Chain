import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CitizenAuthPage from './components/CitizenAuthPage';
import LoginModal from './components/LoginModal';
import Dashboard from './components/Dashboard';
import MyLand from './components/MyLand';
import TransfersHub from './components/TransfersHub';
import RegisterLandModal from './components/RegisterLandModal';
import DocumentManagerModal from './components/DocumentManagerModal';
import OwnershipHistoryModal from './components/OwnershipHistoryModal';
import TitleDeedModal from './components/TitleDeedModal';

import {
  getMyProperties,
  getMyTransfers,
  getCitizenProfile,
} from './services/api';

import {
  LayoutDashboard,
  Landmark,
  ArrowRightLeft,
  FileCheck,
  ShieldCheck,
  Bell,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function App() {
  const [citizen, setCitizen] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [selectedPropertyForDocs, setSelectedPropertyForDocs] = useState(null);
  const [selectedPropertyForDeed, setSelectedPropertyForDeed] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(null);
  const [historyTarget, setHistoryTarget] = useState({ id: null, code: '' });

  // On mount: check localStorage for saved token & citizen
  useEffect(() => {
    const savedToken = localStorage.getItem('bhoomichain_citizen_token');
    const savedCitizen = localStorage.getItem('bhoomichain_citizen_data');

    if (savedToken && savedCitizen) {
      try {
        setCitizen(JSON.parse(savedCitizen));
      } catch (e) {
        setIsLoginModalOpen(true);
      }
    } else {
      setIsLoginModalOpen(true);
    }
  }, []);

  // When citizen changes, load their properties & transfers, and set up auto-refresh polling
  useEffect(() => {
    if (citizen) {
      loadCitizenData();

      // Auto-refresh interval (polling every 4 seconds for real-time transfer updates)
      const interval = setInterval(() => {
        loadCitizenData(true);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [citizen]);

  const loadCitizenData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [propsRes, transfersRes] = await Promise.all([
        getMyProperties().catch(() => ({ success: false, properties: [] })),
        getMyTransfers().catch(() => ({ success: false, transfers: [] })),
      ]);

      if (propsRes.success) {
        setProperties(propsRes.properties || []);
      }
      if (transfersRes.success) {
        const newTransfers = transfersRes.transfers || [];
        if (isSilent && transfers.length > 0) {
          for (const nt of newTransfers) {
            const old = transfers.find((ot) => ot._id === nt._id);
            if (old && old.status !== nt.status) {
              setToast({
                id: Date.now(),
                title: '⚡ Real-Time Transfer Update',
                message: `Deed #${nt.transferRequestId} updated to ${nt.status.replace(/_/g, ' ')}`,
              });
              setTimeout(() => setToast(null), 5000);
              break;
            } else if (!old) {
              setToast({
                id: Date.now(),
                title: '⚡ New Transfer Request',
                message: `New transfer request #${nt.transferRequestId} arrived on your dashboard!`,
              });
              setTimeout(() => setToast(null), 5000);
              break;
            }
          }
        }
        setTransfers(newTransfers);
      }
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const handleOpenTitleDeed = (property) => {
    setSelectedPropertyForDeed(property);
  };

  const handleLoginSuccess = (citizenData) => {
    setCitizen(citizenData);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('bhoomichain_citizen_token');
    localStorage.removeItem('bhoomichain_citizen_data');
    setCitizen(null);
    setProperties([]);
    setTransfers([]);
    setIsLoginModalOpen(true);
  };

  const handleOpenUpload = (property) => {
    setSelectedPropertyForDocs(property);
    setIsDocModalOpen(true);
  };

  const handleOpenHistory = (propertyId, propertyCode) => {
    setHistoryTarget({ id: propertyId, code: propertyCode });
    setIsHistoryModalOpen(true);
  };

  const handlePropertyCreated = (newProp) => {
    setProperties([newProp, ...properties]);
    setActiveTab('myland');
  };

  // Pending transfers count for tab badge
  const pendingTransfersBadge = transfers.filter(
    (t) =>
      t.status === 'SELLER_VERIFICATION_PENDING' ||
      t.status === 'BUYER_VERIFICATION_PENDING' ||
      t.status === 'PAYMENT_PENDING'
  ).length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Official Header */}
      <Header citizen={citizen} onLogout={handleLogout} />

      {/* Navigation Tabs Bar */}
      {citizen && (
        <nav className="portal-nav-bar">
          <div className="portal-nav-inner">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={16} />
              <span>Portal Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('myland')}
              className={`nav-tab-btn ${activeTab === 'myland' ? 'active' : ''}`}
            >
              <Landmark size={16} />
              <span>My Land & Properties</span>
              {properties.length > 0 && <span className="tab-badge">{properties.length}</span>}
            </button>

            <button
              onClick={() => setActiveTab('transfers')}
              className={`nav-tab-btn ${activeTab === 'transfers' ? 'active' : ''}`}
            >
              <ArrowRightLeft size={16} />
              <span>Transfer Requests</span>
              {pendingTransfersBadge > 0 && (
                <span className="tab-badge" style={{ background: 'var(--saffron-500)' }}>
                  {pendingTransfersBadge}
                </span>
              )}
            </button>
          </div>
        </nav>
      )}

      {/* Main Portal View */}
      <main className="portal-main-content" style={{ flex: 1 }}>
        {!citizen ? (
          <CitizenAuthPage onLoginSuccess={handleLoginSuccess} />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                properties={properties}
                transfers={transfers}
                onOpenRegister={() => setIsRegisterModalOpen(true)}
                onOpenUpload={handleOpenUpload}
                onOpenHistory={handleOpenHistory}
                onOpenTitleDeed={handleOpenTitleDeed}
                onSwitchTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'myland' && (
              <MyLand
                properties={properties}
                onOpenRegister={() => setIsRegisterModalOpen(true)}
                onOpenUpload={handleOpenUpload}
                onOpenHistory={handleOpenHistory}
                onOpenTitleDeed={handleOpenTitleDeed}
              />
            )}

            {activeTab === 'transfers' && (
              <TransfersHub
                transfers={transfers}
                currentCitizen={citizen}
                onRefreshTransfers={loadCitizenData}
              />
            )}
          </>
        )}
      </main>

      {/* Real-Time Live Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 999999,
            background: 'linear-gradient(135deg, #0a192f, #1e3a8a)',
            color: '#ffffff',
            border: '1px solid var(--gov-gold)',
            borderRadius: '12px',
            padding: '12px 18px',
            boxShadow: '0 15px 35px rgba(10, 25, 47, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '380px',
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <div style={{ background: 'var(--gov-gold)', borderRadius: '50%', padding: '6px', color: '#0a192f', display: 'flex' }}>
            <Bell size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>{toast.title}</div>
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: '2px' }}>{toast.message}</div>
          </div>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '2px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Official Government Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid var(--border-light)', padding: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong>BhoomiChain Land Governance Simulation</strong> &bull; Third-Year Engineering Capstone Project
          </div>
          <div>
            Demo prototype only &bull; Built with React, Vite, Node.js & Simulated Blockchain Ledger
          </div>
        </div>
      </footer>

      {/* Modals */}

      {/* Register Land Modal */}
      <RegisterLandModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onPropertyCreated={handlePropertyCreated}
      />

      {/* Document Manager & AI Analysis Modal */}
      <DocumentManagerModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        property={selectedPropertyForDocs}
      />

      {/* Ownership History Graph Modal */}
      <OwnershipHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        propertyId={historyTarget.id}
        propertyCode={historyTarget.code}
      />

      {/* Statutory Title Deed Certificate Modal */}
      <TitleDeedModal
        isOpen={!!selectedPropertyForDeed}
        onClose={() => setSelectedPropertyForDeed(null)}
        property={selectedPropertyForDeed}
        citizen={citizen}
      />
    </div>
  );
}
