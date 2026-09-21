import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  Edit3,
  Trash2,
  UserPlus,
  X,
  Users,
  Calendar,
  Sparkles,
} from 'lucide-react';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
];

function getAvatarBackground(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

function getInitials(name = '') {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export default function StudentTable({
  students,
  loading,
  onAddStudent,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onRefresh,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!searchTerm.trim()) return students;

    const term = searchTerm.toLowerCase().trim();
    return students.filter((st) => {
      const nameMatch = st.name?.toLowerCase().includes(term);
      const emailMatch = st.email?.toLowerCase().includes(term);
      const idMatch = st.userId?.toLowerCase().includes(term);
      const mongoIdMatch = st._id?.toLowerCase().includes(term);
      return nameMatch || emailMatch || idMatch || mongoIdMatch;
    });
  }, [students, searchTerm]);

  return (
    <div className="main-card">
      {/* Controls Bar */}
      <div className="table-controls">
        <div className="controls-left">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by student name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredStudents.length}</strong> of{' '}
            <strong>{students?.length || 0}</strong> students
          </span>
        </div>

        <div className="controls-right">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddStudent}
          >
            <UserPlus size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading students from backend...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-circle">
              <Users size={32} />
            </div>
            {searchTerm ? (
              <>
                <h3 className="empty-title">No matching students found</h3>
                <p className="empty-desc">
                  No records match the filter <em>"{searchTerm}"</em>. Try a different search term or clear the filter.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <h3 className="empty-title">No students in database</h3>
                <p className="empty-desc">
                  There are currently no students registered. Click below to add your first student record!
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onAddStudent}
                >
                  <UserPlus size={16} />
                  Add First Student
                </button>
              </>
            )}
          </div>
        ) : (
          <table className="student-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student</th>
                <th>Email Address</th>
                <th>Age</th>
                <th>Added On</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st) => (
                <tr key={st._id || st.userId}>
                  {/* Student ID */}
                  <td>
                    <span className="student-id-badge">{st.userId || '—'}</span>
                  </td>

                  {/* Name + Avatar */}
                  <td>
                    <div className="student-name-cell">
                      <div
                        className="student-avatar"
                        style={{ background: getAvatarBackground(st.name || st.userId) }}
                      >
                        {getInitials(st.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{st.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID: {st._id?.slice(-6) || '—'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td>
                    <span className="student-email">{st.email}</span>
                  </td>

                  {/* Age */}
                  <td>
                    <span className="age-badge">{st.age} yrs</span>
                  </td>

                  {/* Date */}
                  <td>
                    <span className="date-text">
                      <Calendar size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                      {formatDate(st.createdAt)}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="action-btn view"
                        title="View Details (GET /getStudentById/:id)"
                        onClick={() => onViewStudent(st)}
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        className="action-btn edit"
                        title="Edit Student (PUT /updateStudent/:id)"
                        onClick={() => onEditStudent(st)}
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        type="button"
                        className="action-btn delete"
                        title="Delete Student (DELETE /deleteStudent/:id)"
                        onClick={() => onDeleteStudent(st)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
