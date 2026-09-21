import React, { useState } from 'react';
import { X, Server, RotateCcw, Check } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, DEFAULT_API_BASE } from '../services/studentApi';

export default function SettingsModal({ isOpen, onClose, onSave }) {
  const [url, setUrl] = useState(getApiBaseUrl());

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setApiBaseUrl(url.trim());
    onSave();
    onClose();
  };

  const handleReset = () => {
    setUrl(DEFAULT_API_BASE);
    setApiBaseUrl(DEFAULT_API_BASE);
    onSave();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Server size={20} color="#6366f1" />
            <span>Backend API Configuration</span>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
              Configure the base URL pointing to your backend Express server. The endpoints
              (<code>/getStudents</code>, <code>/createStudent</code>, etc.) will be requested relative to this URL.
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="api-base-url">
                API Base URL
              </label>
              <input
                id="api-base-url"
                type="text"
                className="form-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:5173/api"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '6px 10px' }}
                onClick={handleReset}
              >
                <RotateCcw size={13} />
                Reset to Default ({DEFAULT_API_BASE})
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
