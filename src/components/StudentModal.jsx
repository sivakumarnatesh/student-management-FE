import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, Sparkles, Loader2 } from 'lucide-react';

export default function StudentModal({ isOpen, onClose, onSubmit, student = null, isLoading = false }) {
  const isEdit = Boolean(student);

  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    age: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        userId: student.userId || '',
        name: student.name || '',
        email: student.email || '',
        age: student.age !== undefined && student.age !== null ? String(student.age) : '',
      });
    } else {
      // New student default
      setFormData({
        userId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        email: '',
        age: '',
      });
    }
    setErrors({});
  }, [student, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.userId.trim()) {
      newErrors.userId = 'Student ID / User ID is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    const parsedAge = Number(formData.age);
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (isNaN(parsedAge) || parsedAge < 3 || parsedAge > 120) {
      newErrors.age = 'Please enter a valid age between 3 and 120';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      userId: formData.userId.trim(),
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      age: Number(formData.age),
    });
  };

  const handleGenerateId = () => {
    const randomId = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData((prev) => ({ ...prev, userId: randomId }));
    if (errors.userId) {
      setErrors((prev) => ({ ...prev, userId: undefined }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {isEdit ? <UserCheck size={20} color="#6366f1" /> : <UserPlus size={20} color="#6366f1" />}
            {isEdit ? 'Update Student Record' : 'Add New Student'}
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Student ID */}
            <div className="form-group">
              <label className="form-label" htmlFor="student-userId">
                Student ID / Roll No <span className="req">*</span>
              </label>
              <div className="input-with-action">
                <input
                  id="student-userId"
                  type="text"
                  className={`form-input ${errors.userId ? 'has-error' : ''}`}
                  placeholder="e.g. STU-1001"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  disabled={isLoading}
                />
                {!isEdit && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-icon"
                    title="Auto-generate Random ID"
                    onClick={handleGenerateId}
                  >
                    <Sparkles size={16} />
                  </button>
                )}
              </div>
              {errors.userId && <p className="form-error">{errors.userId}</p>}
            </div>

            {/* Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="student-name">
                Full Name <span className="req">*</span>
              </label>
              <input
                id="student-name"
                type="text"
                className={`form-input ${errors.name ? 'has-error' : ''}`}
                placeholder="e.g. Alex Johnson"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="student-email">
                Email Address <span className="req">*</span>
              </label>
              <input
                id="student-email"
                type="email"
                className={`form-input ${errors.email ? 'has-error' : ''}`}
                placeholder="e.g. alex.johnson@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isLoading}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* Age */}
            <div className="form-group">
              <label className="form-label" htmlFor="student-age">
                Age <span className="req">*</span>
              </label>
              <input
                id="student-age"
                type="number"
                min="1"
                max="120"
                className={`form-input ${errors.age ? 'has-error' : ''}`}
                placeholder="e.g. 21"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                disabled={isLoading}
              />
              {errors.age && <p className="form-error">{errors.age}</p>}
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
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  {isEdit ? 'Updating...' : 'Saving...'}
                </>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Create Student'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
