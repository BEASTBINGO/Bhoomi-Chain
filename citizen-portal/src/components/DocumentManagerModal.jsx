import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { uploadDocument, getPropertyDocuments, analyzeDocument } from '../services/api';

export default function DocumentManagerModal({ isOpen, onClose, property }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  const [documentType, setDocumentType] = useState('SALE_DEED');
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && property) {
      loadDocuments();
      setAnalysisResult(null);
      setStatusMessage('');
      setErrorMessage('');
    }
  }, [isOpen, property]);

  const loadDocuments = async () => {
    if (!property) return;
    setLoading(true);
    try {
      const res = await getPropertyDocuments(property._id);
      if (res.success) {
        setDocuments(res.documents);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !property) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a PDF or image document to upload.');
      return;
    }

    setUploading(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('propertyId', property._id);
      formData.append('documentType', documentType);
      formData.append('document', selectedFile);

      const res = await uploadDocument(formData);
      if (res.success) {
        setStatusMessage('Document uploaded successfully. Ready for AI extraction & review.');
        setSelectedFile(null);
        await loadDocuments();
      } else {
        setErrorMessage(res.message || 'Upload failed');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Upload failed. Check file type and size.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (docId) => {
    setAnalyzingId(docId);
    setAnalysisResult(null);
    setErrorMessage('');

    try {
      const res = await analyzeDocument(docId);
      if (res.success) {
        setAnalysisResult(res.analysis);
        await loadDocuments();
      } else {
        setErrorMessage(res.message || 'Analysis failed');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Document analysis service error');
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog modal-dialog-wide">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="gov-emblem-badge" style={{ width: '36px', height: '36px' }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0 }}>Document Records & AI Analysis</h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Property: <strong className="code-badge">{property.propertyCode}</strong> (Survey: {property.surveyNumber})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {statusMessage && (
            <div style={{ background: 'var(--gov-green-50)', border: '1px solid var(--gov-green-100)', color: 'var(--gov-green-700)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>{statusMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{ background: 'var(--gov-red-50)', border: '1px solid var(--gov-red-100)', color: 'var(--gov-red-600)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Upload New Document Form */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '18px', marginBottom: '22px' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--gov-navy-900)', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={16} color="var(--gov-navy-800)" />
              <span>Upload New Document</span>
            </h4>

            <form onSubmit={handleUpload}>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="form-group">
                  <label>Document Classification</label>
                  <select
                    className="form-control"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  >
                    <option value="SALE_DEED">Sale Deed</option>
                    <option value="7_12_EXTRACT">7/12 Extract</option>
                    <option value="PROPERTY_CARD">Property Card</option>
                    <option value="REGISTRATION_DOCUMENT">Registration Document</option>
                    <option value="TAX_RECEIPT">Tax Receipt</option>
                    <option value="IDENTITY_PROOF">Identity Proof</option>
                    <option value="ADDRESS_PROOF">Address Proof</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Select File (PDF, JPG, PNG - Max 10MB)</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button type="submit" className="btn-gov-primary" disabled={uploading}>
                  <Upload size={14} />
                  <span>{uploading ? 'Uploading File...' : 'Upload Document'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* AI Analysis Result Showcase */}
          {analysisResult && (
            <div className="trust-score-card">
              <div className="trust-score-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={18} color="var(--gov-navy-800)" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--gov-navy-900)' }}>
                      AI Document Analysis & Forensic Trust Score
                    </h4>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Document: {analysisResult.fileName} &bull; Type: {analysisResult.documentType}
                  </div>
                </div>

                <div className="score-gauge-box">
                  <span
                    className={`score-number ${
                      analysisResult.demoTrustScore >= 75
                        ? 'score-high'
                        : analysisResult.demoTrustScore >= 50
                        ? 'score-medium'
                        : 'score-low'
                    }`}
                  >
                    {analysisResult.demoTrustScore}%
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Trust Score</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span
                  className={`status-badge ${
                    analysisResult.aiStatus === 'ANALYZED' ? 'status-verified' : 'status-rejected'
                  }`}
                >
                  Status: {analysisResult.aiStatus}
                </span>

                <span
                  className={`status-badge ${
                    analysisResult.riskLevel === 'LOW'
                      ? 'status-verified'
                      : analysisResult.riskLevel === 'MEDIUM'
                      ? 'status-pending'
                      : 'status-rejected'
                  }`}
                >
                  Risk Level: {analysisResult.riskLevel}
                </span>

                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Result: <strong>{analysisResult.reviewResult}</strong>
                </span>
              </div>

              {/* Consistency Checks Grid */}
              <div className="checks-grid">
                <div className="check-item">
                  <span>File Readability</span>
                  <strong style={{ color: 'var(--gov-green-700)' }}>{analysisResult.checks.fileReadability}</strong>
                </div>

                <div className="check-item">
                  <span>Survey Number</span>
                  <strong
                    style={{
                      color:
                        analysisResult.checks.surveyNumber === 'MATCH'
                          ? 'var(--gov-green-700)'
                          : 'var(--gov-red-600)',
                    }}
                  >
                    {analysisResult.checks.surveyNumber}
                  </strong>
                </div>

                <div className="check-item">
                  <span>Area Match</span>
                  <strong
                    style={{
                      color:
                        analysisResult.checks.area === 'MATCH'
                          ? 'var(--gov-green-700)'
                          : 'var(--gov-red-600)',
                    }}
                  >
                    {analysisResult.checks.area}
                  </strong>
                </div>

                <div className="check-item">
                  <span>Owner Identity</span>
                  <strong
                    style={{
                      color:
                        analysisResult.checks.ownerName === 'MATCH'
                          ? 'var(--gov-green-700)'
                          : 'var(--gov-red-600)',
                    }}
                  >
                    {analysisResult.checks.ownerName}
                  </strong>
                </div>

                <div className="check-item">
                  <span>Location / District</span>
                  <strong
                    style={{
                      color:
                        analysisResult.checks.location === 'MATCH'
                          ? 'var(--gov-green-700)'
                          : 'var(--gov-red-600)',
                    }}
                  >
                    {analysisResult.checks.location}
                  </strong>
                </div>
              </div>

              <div style={{ marginTop: '14px', fontSize: '0.78rem', color: 'var(--text-secondary)', background: '#fff', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <strong>Audit Note:</strong> {analysisResult.remarks}
              </div>
            </div>
          )}

          {/* Existing Documents Table */}
          <h4 style={{ fontSize: '0.9rem', color: 'var(--gov-navy-900)', fontWeight: 700, margin: '20px 0 10px 0' }}>
            Associated Documents ({documents.length})
          </h4>

          <div className="gov-table-wrapper">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>Filename</th>
                  <th>AI Status</th>
                  <th>Trust Score</th>
                  <th>Government Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No documents currently uploaded for this property parcel.
                    </td>
                  </tr>
                ) : (
                  documents.map((d) => (
                    <tr key={d._id}>
                      <td>
                        <strong>{d.documentType.replace('_', ' ')}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>{d.fileName}</span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            d.aiStatus === 'ANALYZED'
                              ? 'status-verified'
                              : d.aiStatus === 'SUSPICIOUS'
                              ? 'status-rejected'
                              : 'status-pending'
                          }`}
                        >
                          {d.aiStatus}
                        </span>
                      </td>
                      <td>
                        {d.aiConfidence !== undefined && d.aiConfidence !== null ? (
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                d.aiConfidence >= 75
                                  ? 'var(--gov-green-600)'
                                  : d.aiConfidence >= 50
                                  ? 'var(--gov-amber-600)'
                                  : 'var(--gov-red-600)',
                            }}
                          >
                            {d.aiConfidence}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>--</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            d.governmentStatus === 'VERIFIED'
                              ? 'status-verified'
                              : d.governmentStatus === 'REJECTED'
                              ? 'status-rejected'
                              : 'status-pending'
                          }`}
                        >
                          {d.governmentStatus}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleAnalyze(d._id)}
                          className="btn-gov-saffron"
                          style={{ padding: '5px 10px', fontSize: '0.75rem' }}
                          disabled={analyzingId === d._id}
                          title="Run OCR and AI Cross-Check"
                        >
                          <Cpu size={13} />
                          <span>{analyzingId === d._id ? 'Analyzing...' : 'Run AI Analysis'}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-gov-primary">
            Close Document Manager
          </button>
        </div>
      </div>
    </div>
  );
}
