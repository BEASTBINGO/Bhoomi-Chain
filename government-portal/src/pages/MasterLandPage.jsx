import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Building2,
  MapPin,
  FileText,
  DollarSign,
  ShieldCheck,
  Eye,
  X,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { getMasterRecords } from '../services/api';

export default function MasterLandPage() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [totalUnregistered, setTotalUnregistered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'REGISTERED' | 'UNREGISTERED'
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    loadRecords();
  }, [statusFilter]);

  const loadRecords = async (searchTerm = search) => {
    setLoading(true);
    try {
      const res = await getMasterRecords({
        search: searchTerm,
        status: statusFilter,
        limit: 100,
      });

      if (res.success) {
        setRecords(res.records || []);
        setTotal(res.total || 0);
        setTotalRegistered(res.totalRegistered || 0);
        setTotalUnregistered(res.totalUnregistered || 0);
      }
    } catch (err) {
      console.error('Failed to load master records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadRecords(search);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
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
              <Database size={22} color="var(--gov-gold)" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--gov-navy-950)' }}>
                Official State Land Records Master Database
              </h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Maharashtra Land Revenue Code, 1966 &bull; Official Digital Cadastral Registry (100 Reference Parcels)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => loadRecords(search)}
          className="btn-gov-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div className="gov-stat-card" style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Total State Land Records
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gov-navy-950)', marginTop: '4px' }}>
            {total}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Surveyed cadastre across 8 Maharashtra districts
          </div>
        </div>

        <div className="gov-stat-card" style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>
            Registered on BhoomiChain
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#15803d', marginTop: '4px' }}>
            {totalRegistered}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#166534', marginTop: '2px' }}>
            Cryptographically sealed on blockchain ledger
          </div>
        </div>

        <div className="gov-stat-card" style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
          <div style={{ fontSize: '0.75rem', color: '#9a3412', fontWeight: 600, textTransform: 'uppercase' }}>
            Unregistered State Records
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c2410c', marginTop: '4px' }}>
            {totalUnregistered}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#9a3412', marginTop: '2px' }}>
            Legacy 7/12 records pending citizen onboarding
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid var(--border-light)',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1', minWidth: '300px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              className="gov-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Survey #, Owner Name, Gat #, District, Village..."
              style={{ width: '100%', paddingLeft: '36px', fontSize: '0.85rem' }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          <button type="submit" className="btn-gov-navy" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                loadRecords('');
              }}
              className="btn-gov-outline"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              Clear
            </button>
          )}
        </form>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: statusFilter === 'ALL' ? '#ffffff' : 'transparent',
              color: statusFilter === 'ALL' ? 'var(--gov-navy-950)' : 'var(--text-muted)',
              boxShadow: statusFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            All Records ({total})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('REGISTERED')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: statusFilter === 'REGISTERED' ? '#ffffff' : 'transparent',
              color: statusFilter === 'REGISTERED' ? '#166534' : 'var(--text-muted)',
              boxShadow: statusFilter === 'REGISTERED' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            BhoomiChain Active ({totalRegistered})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('UNREGISTERED')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: statusFilter === 'UNREGISTERED' ? '#ffffff' : 'transparent',
              color: statusFilter === 'UNREGISTERED' ? '#c2410c' : 'var(--text-muted)',
              boxShadow: statusFilter === 'UNREGISTERED' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Unregistered Revenue ({totalUnregistered})
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="gov-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--gov-navy-950)' }}>Survey & Gat No.</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--gov-navy-950)' }}>Owner Name (Legal Title)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--gov-navy-950)' }}>Location (Dist / Taluka)</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--gov-navy-950)' }}>Type & Area</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--gov-navy-950)' }}>Market Value</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--gov-navy-950)' }}>BhoomiChain Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--gov-navy-950)', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto 10px auto' }} />
                    <span>Loading official government records…</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No land records found matching your query.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r._id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    onClick={() => setSelectedRecord(r)}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, color: 'var(--gov-navy-950)', fontFamily: 'monospace' }}>
                        {r.surveyNumber}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Gat #{r.gatNumber || 'N/A'}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--gov-navy-900)' }}>{r.ownerName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Aadhaar: {r.ownerAadhaar || 'Verified in Mahabhulekh'}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{r.district}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {r.taluka}, {r.village}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>
                        {r.area?.toLocaleString('en-IN')} {r.areaUnit || 'sq.ft'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {r.propertyType?.replace(/_/g, ' ')}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--gov-green-700)' }}>
                      ₹{Number(r.marketValue || 0).toLocaleString('en-IN')}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      {r.isRegisteredOnBhoomiChain ? (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          <CheckCircle2 size={12} />
                          <span>REGISTERED</span>
                        </span>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: '#f1f5f9',
                            color: '#64748b',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          <Clock size={12} />
                          <span>GOV REVENUE ONLY</span>
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                        className="btn-gov-outline"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      >
                        <Eye size={13} />
                        <span>Owner Info</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Owner & Official Land Details Modal */}
      {selectedRecord && (
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
          onClick={() => setSelectedRecord(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '650px',
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-light)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                background: 'linear-gradient(135deg, var(--gov-navy-950), var(--gov-navy-900))',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '2px solid var(--gov-gold)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={24} color="var(--gov-gold)" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                    Official Revenue Land Record (7/12 Extract)
                  </h3>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Government of Maharashtra &bull; Record No. {selectedRecord.recordId}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '6px',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Registration Banner */}
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: selectedRecord.isRegisteredOnBhoomiChain ? '#f0fdf4' : '#f8fafc',
                  border: selectedRecord.isRegisteredOnBhoomiChain ? '1px solid #86efac' : '1px solid #e2e8f0',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: selectedRecord.isRegisteredOnBhoomiChain ? '#166534' : 'var(--gov-navy-900)' }}>
                    {selectedRecord.isRegisteredOnBhoomiChain ? '✅ Enrolled on BhoomiChain Portal' : 'ℹ️ Government Revenue Database Record (Unenrolled)'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedRecord.isRegisteredOnBhoomiChain
                      ? `Property Code: ${selectedRecord.propertyCode || 'Active Asset'}`
                      : 'This parcel exists officially in state cadastre and is eligible for 1-click citizen registration.'}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: selectedRecord.isRegisteredOnBhoomiChain ? '#16a34a' : '#64748b',
                    color: '#ffffff',
                  }}
                >
                  {selectedRecord.titleClear ? 'CLEAR TITLE' : 'TITLE INQUIRY'}
                </span>
              </div>

              {/* Owner Profile Grid */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: '10px',
                  padding: '16px',
                  border: '1px solid var(--border-light)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--gov-navy-900)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} />
                  <span>Official Legal Landowner:</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Owner Full Name:</div>
                    <div style={{ fontWeight: 700, color: 'var(--gov-navy-950)', fontSize: '0.95rem' }}>
                      {selectedRecord.ownerName}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Aadhaar Number:</div>
                    <div style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-main)' }}>
                      {selectedRecord.ownerAadhaar || 'Not Linked (Offline Record)'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Contact Phone:</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {selectedRecord.ownerPhone || 'Gram Panchayat Record'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Registered Market Valuation:</div>
                    <div style={{ fontWeight: 800, color: 'var(--gov-green-700)', fontSize: '1rem' }}>
                      ₹{Number(selectedRecord.marketValue || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Land Parcel Technical Specs */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '10px',
                  padding: '16px',
                  border: '1px solid var(--border-light)',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--gov-navy-900)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={14} />
                  <span>Cadastral Survey Specifications:</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Survey Number:</span>
                    <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>{selectedRecord.surveyNumber}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Gat / Hissa Number:</span>
                    <strong>{selectedRecord.gatNumber || 'N/A'}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Total Area:</span>
                    <strong>{selectedRecord.area?.toLocaleString('en-IN')} {selectedRecord.areaUnit}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Zoning Classification:</span>
                    <strong>{selectedRecord.propertyType?.replace(/_/g, ' ')}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Taluka & Village:</span>
                    <strong>{selectedRecord.taluka}, {selectedRecord.village}</strong>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>District:</span>
                    <strong>{selectedRecord.district}</strong>
                  </div>
                </div>
              </div>

              {/* Encumbrance & Legal Status */}
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                ⚖️ <strong>Statutory Certificate:</strong> Extracted directly from Maharashtra Revenue Computerized Land Registry (Mahabhulekh System). This record serves as primary ground truth for BhoomiChain title verification and AI fraud detection.
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 24px',
                background: '#f8fafc',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button onClick={() => setSelectedRecord(null)} className="btn-gov-navy" style={{ padding: '8px 20px', fontSize: '0.82rem' }}>
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
