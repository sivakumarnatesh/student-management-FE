import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Mail, Hash, Clock, Code2, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchStudentById } from '../services/studentApi';

export default function StudentDetailsModal({
  isOpen,
  onClose,
  studentId,
  initialStudent = null,
  onEdit,
  onDelete,
}) {
  const [student, setStudent] = useState(initialStudent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showJson, setShowJson] = useState(false);

  useEffect(() => {
    if (!isOpen || !studentId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchStudentById(studentId)
      .then((data) => {
        if (isMounted) {
          setStudent(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch student details by ID');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, studentId]);

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <User size={20} color="#06b6d4" />
            <span>Student Inspection (by ID)</span>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state" style={{ padding: '40px 0' }}>
              <div className="spinner" />
              <p>Fetching student details via <code>GET /api/getStudentById/{studentId}</code>...</p>
            </div>
          ) : error ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon-circle" style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e' }}>
                <AlertCircle size={32} />
              </div>
              <h3 className="empty-title">Error Loading Details</h3>
              <p className="empty-desc">{error}</p>
            </div>
          ) : student ? (
            <>
              <div className="details-hero">
                <div className="details-avatar">
                  {getInitials(student.name)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{student.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span className="student-id-badge">{student.userId || 'No User ID'}</span>
                    <span className="age-badge">{student.age} yrs old</span>
                  </div>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-key">
                    <Mail size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                    Email
                  </div>
                  <div className="detail-val">{student.email}</div>
                </div>

                <div className="detail-item">
                  <div className="detail-key">
                    <Hash size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                    Student Roll No
                  </div>
                  <div className="detail-val">{student.userId}</div>
                </div>

                <div className="detail-item full-width">
                  <div className="detail-key">MongoDB Document ID (_id)</div>
                  <div className="detail-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#a5b4fc' }}>
                    {student._id}
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-key">
                    <Calendar size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                    Created At
                  </div>
                  <div className="detail-val" style={{ fontSize: '0.82rem' }}>
                    {formatDate(student.createdAt)}
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-key">
                    <Clock size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                    Updated At
                  </div>
                  <div className="detail-val" style={{ fontSize: '0.82rem' }}>
                    {formatDate(student.updatedAt)}
                  </div>
                </div>
              </div>

              {/* JSON Toggle */}
              <div style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8rem', padding: '8px 12px' }}
                  onClick={() => setShowJson(!showJson)}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Code2 size={16} />
                    {showJson ? 'Hide Raw API JSON' : 'Inspect Raw API Response (JSON)'}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{showJson ? '▲' : '▼'}</span>
                </button>

                {showJson && (
                  <div style={{ marginTop: 10 }}>
                    <div className="json-viewer">
                      {JSON.stringify(student, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div>
            {student && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  onClose();
                  onDelete(student);
                }}
              >
                <Trash2 size={15} />
                Delete
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {student && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  onClose();
                  onEdit(student);
                }}
              >
                <Edit2 size={15} />
                Edit
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
