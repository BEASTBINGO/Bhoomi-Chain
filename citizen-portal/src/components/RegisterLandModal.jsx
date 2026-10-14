import React, { useState } from 'react';
import { X, Landmark, PlusCircle, AlertCircle } from 'lucide-react';
import { registerProperty } from '../services/api';

export default function RegisterLandModal({ isOpen, onClose, onPropertyCreated }) {
  const [formData, setFormData] = useState({
    surveyNumber: 'SUR-1025',
    propertyType: 'RESIDENTIAL_LAND',
    address: 'Bolinj, Virar West',
    village: 'Virar',
    taluka: 'Vasai',
    district: 'Palghar',
    state: 'Maharashtra',
    pincode: '401303',
    area: '1500',
    areaUnit: 'sq.ft',
    description: 'Residential NA plot for family house',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await registerProperty({
        ...formData,
        area: Number(formData.area),
      });

      if (res.success) {
        onPropertyCreated(res.property);
        onClose();
      } else {
        setError(res.message || 'Failed to register property');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Property registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fillSunitaRaneLand = () => {
    setFormData({
      surveyNumber: 'SUR-1042',
      propertyType: 'RESIDENTIAL_LAND',
      address: 'Survey No. 1042, Village Ogalewadi, Taluka Karad, District Satara, Maharashtra',
      village: 'Ogalewadi',
      taluka: 'Karad',
      district: 'Satara',
      state: 'Maharashtra',
      pincode: '415105',
      area: '1961',
      areaUnit: 'sq.ft',
      description: 'Residential NA plot under GAT-183/B. Clean title with revenue assessment clearance (Gov Seal: REV-MH-SAT-001042).',
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-dialog-wide">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="gov-emblem-badge" style={{ width: '36px', height: '36px' }}>
              <Landmark size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Register New Land Parcel</h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Application for Civil Land Title Record Creation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={fillSunitaRaneLand}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, #0a192f, #1e3a8a)',
                  color: '#ffffff',
                  border: '1px solid var(--gov-gold)',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(10, 25, 47, 0.2)',
                }}
                title="1-Click Fill: Sunita Rane Land (SUR-1042 / Satara)"
              >
                <PlusCircle size={14} color="var(--gov-gold)" />
                <span>⚡ 1-Click Fill: Sunita Rane Land (SUR-1042)</span>
              </button>
            </div>
            {error && (
              <div
                style={{
                  background: 'var(--gov-red-50)',
                  border: '1px solid var(--gov-red-100)',
                  color: 'var(--gov-red-600)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '18px',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label>Survey Number / Gat No. *</label>
                <input
                  type="text"
                  name="surveyNumber"
                  className="form-control"
                  value={formData.surveyNumber}
                  onChange={handleChange}
                  placeholder="e.g. SUR-1025"
                  required
                />
              </div>

              <div className="form-group">
                <label>Property Classification *</label>
                <select
                  name="propertyType"
                  className="form-control"
                  value={formData.propertyType}
                  onChange={handleChange}
                  required
                >
                  <option value="RESIDENTIAL_LAND">Residential Land</option>
                  <option value="AGRICULTURAL_LAND">Agricultural Land</option>
                  <option value="COMMERCIAL_PROPERTY">Commercial Property</option>
                  <option value="RESIDENTIAL_PROPERTY">Residential Property</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Total Plot Area *</label>
                <input
                  type="number"
                  name="area"
                  className="form-control"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                  required
                />
              </div>

              <div className="form-group">
                <label>Area Unit *</label>
                <select
                  name="areaUnit"
                  className="form-control"
                  value={formData.areaUnit}
                  onChange={handleChange}
                >
                  <option value="sq.ft">Square Feet (sq.ft)</option>
                  <option value="sq.m">Square Meters (sq.m)</option>
                  <option value="acres">Acres</option>
                  <option value="guntha">Guntha</option>
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Address / Plot Details *</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street / locality / plot number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Village / Town</label>
                <input
                  type="text"
                  name="village"
                  className="form-control"
                  value={formData.village}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Taluka</label>
                <input
                  type="text"
                  name="taluka"
                  className="form-control"
                  value={formData.taluka}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>District *</label>
                <input
                  type="text"
                  name="district"
                  className="form-control"
                  value={formData.district}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  className="form-control"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Postal PIN Code</label>
                <input
                  type="text"
                  name="pincode"
                  className="form-control"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Description / Boundary Remarks</label>
                <input
                  type="text"
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional boundary or landmark details"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-gov-outline">
              Cancel
            </button>
            <button type="submit" className="btn-gov-saffron" disabled={loading}>
              <PlusCircle size={16} />
              <span>{loading ? 'Submitting Application...' : 'Submit Registration Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
