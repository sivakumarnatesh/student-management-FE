import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Users,
  Calendar,
  Sparkles,
  RefreshCw,
  Settings,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';

import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  checkServerHealth,
  getApiBaseUrl,
} from './services/studentApi';

import StudentTable from './components/StudentTable';
import StudentModal from './components/StudentModal';
import StudentDetailsModal from './components/StudentDetailsModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';

export default function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [inspectingStudent, setInspectingStudent] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const addToast = useCallback((title, message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 7);
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all students (GET /api/getStudents)
  const loadStudents = useCallback(async (showFeedback = false) => {
    try {
      setLoading(true);
      const data = await fetchStudents();
      setStudents(data);
      setIsOnline(true);
      if (showFeedback) {
        addToast('Synced', `Loaded ${data.length} students from backend`, 'success', 2500);
      }
    } catch (err) {
      setIsOnline(false);
      addToast('Connection Issue', err.message || 'Failed to fetch students', 'error', 5000);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadStudents();

    // Check server health periodically
    const interval = setInterval(async () => {
      const health = await checkServerHealth();
      setIsOnline(health.ok);
    }, 12000);

    return () => clearInterval(interval);
  }, [loadStudents]);

  // Handle Add Student (POST /api/createStudent)
  const handleOpenAdd = () => {
    setEditingStudent(null);
    setIsAddEditOpen(true);
  };

  // Handle Edit Student (open modal)
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setIsAddEditOpen(true);
  };

  // Submit Add or Edit
  const handleSubmitStudentForm = async (payload) => {
    setFormSubmitting(true);
    try {
      if (editingStudent) {
        // UPDATE (PUT /api/updateStudent/:id)
        // Backend searches by { userId: studentId }
        const identifier = editingStudent.userId || editingStudent._id;
        const res = await updateStudent(identifier, payload);
        addToast('Updated Successfully', res.message || `Student ${payload.name} updated`, 'success');
      } else {
        // CREATE (POST /api/createStudent)
        const res = await createStudent(payload);
        addToast('Created Successfully', res.message || `Student ${payload.name} created`, 'success');
      }
      setIsAddEditOpen(false);
      setEditingStudent(null);
      await loadStudents();
    } catch (err) {
      addToast(
        editingStudent ? 'Update Failed' : 'Creation Failed',
        err.message || 'API request failed',
        'error',
        5000
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle View / Inspect Student (GET /api/getStudentById/:id)
  const handleOpenDetails = (student) => {
    setInspectingStudent(student);
    setIsDetailsOpen(true);
  };

  // Handle Delete Confirmation (open modal)
  const handleOpenDelete = (student) => {
    setDeletingStudent(student);
    setIsDeleteOpen(true);
  };

  // Confirm and execute delete (DELETE /api/deleteStudent/:id)
  const handleConfirmDelete = async (student) => {
    setDeleteSubmitting(true);
    try {
      const res = await deleteStudent(student._id);
      addToast('Student Deleted', res.message || `${student.name} was deleted successfully`, 'info');
      setIsDeleteOpen(false);
      setDeletingStudent(null);
      await loadStudents();
    } catch (err) {
      addToast('Delete Failed', err.message || 'Could not delete student', 'error', 5000);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Quick stats calculation
  const totalStudents = students.length;
  const ages = students.map((s) => Number(s.age)).filter((a) => !isNaN(a) && a > 0);
  const avgAge = ages.length > 0 ? (ages.reduce((sum, a) => sum + a, 0) / ages.length).toFixed(1) : '—';
  const minAge = ages.length > 0 ? Math.min(...ages) : '—';
  const maxAge = ages.length > 0 ? Math.max(...ages) : '—';

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onClose={removeToast} />

      {/* Top Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <GraduationCap size={26} />
          </div>
          <div>
            <h1 className="brand-title">EduTrack</h1>
            <p className="brand-subtitle">Student Management &amp; CRUD Portal</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Live Status Badge */}
          <div
            className={`status-badge ${isOnline ? 'online' : 'offline'}`}
            title={`Backend is ${isOnline ? 'connected' : 'offline'}`}
          >
            <span className="status-dot" />
            <span>{isOnline ? 'API Connected' : 'API Offline'}</span>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={() => loadStudents(true)}
            title="Refresh student list from backend"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          </button>

          {/* API Settings Button */}
          <button
            type="button"
            className="btn btn-secondary btn-icon"
            onClick={() => setIsSettingsOpen(true)}
            title="Configure Backend API Base URL"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Quick Metrics / Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper indigo">
            <Users size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Enrolled</span>
            <span className="stat-value">{totalStudents}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper emerald">
            <Award size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Average Age</span>
            <span className="stat-value">{avgAge} {ages.length > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>yrs</span>}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper cyan">
            <Sparkles size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Youngest Student</span>
            <span className="stat-value">{minAge} {ages.length > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>yrs</span>}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper amber">
            <Flame size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Oldest Student</span>
            <span className="stat-value">{maxAge} {ages.length > 0 && <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>yrs</span>}</span>
          </div>
        </div>
      </div>

      {/* Student Data Table Section */}
      <main>
        <StudentTable
          students={students}
          loading={loading}
          onAddStudent={handleOpenAdd}
          onViewStudent={handleOpenDetails}
          onEditStudent={handleOpenEdit}
          onDeleteStudent={handleOpenDelete}
          onRefresh={() => loadStudents(true)}
        />
      </main>

      {/* Add / Edit Student Modal */}
      <StudentModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSubmit={handleSubmitStudentForm}
        student={editingStudent}
        isLoading={formSubmitting}
      />

      {/* View Student Details Modal (GET /getStudentById/:id) */}
      <StudentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        studentId={inspectingStudent?._id}
        initialStudent={inspectingStudent}
        onEdit={(st) => {
          setIsDetailsOpen(false);
          handleOpenEdit(st);
        }}
        onDelete={(st) => {
          setIsDetailsOpen(false);
          handleOpenDelete(st);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        student={deletingStudent}
        isLoading={deleteSubmitting}
      />

      {/* API Configuration Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={() => loadStudents(true)}
      />
    </div>
  );
}
