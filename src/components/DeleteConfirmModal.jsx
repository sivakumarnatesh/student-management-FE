import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  student,
  isLoading = false,
}) {
  if (!isOpen || !student) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ color: '#fb7185' }}>
            <Trash2 size={20} />
            <span>Confirm Deletion</span>
          </div>
          <button type="button" className="modal-close" onClick={onClose} disabled={isLoading}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-dialog">
            <div className="delete-warn-icon">
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>
              Delete Student Record?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
              Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{student.name}</strong> ({student.userId})?
              This action triggers <code>DELETE /api/deleteStudent/{student._id}</code> and cannot be undone.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(student)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Confirm Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
