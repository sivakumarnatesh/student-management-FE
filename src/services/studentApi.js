/**
 * API Service for Student Management
 * Connects to the Express + MongoDB backend
 *
 * Endpoints:
 * - GET    /api/getStudents
 * - GET    /api/getStudentById/:id
 * - POST   /api/createStudent
 * - PUT    /api/updateStudent/:id
 * - DELETE /api/deleteStudent/:id
 */

const STORAGE_KEY = 'edu_student_api_base_url';
export const DEFAULT_API_BASE = 'http://localhost:5173/api';

export const getApiBaseUrl = () => {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_BASE;
};

export const setApiBaseUrl = (url) => {
  if (!url) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, url.trim().replace(/\/+$/, ''));
  }
};

/**
 * Helper to handle fetch responses and throw standard errors
 */
async function request(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = result?.message || `Request failed with status ${response.status} (${response.statusText})`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.details = result;
      throw error;
    }

    return result;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      const connError = new Error(`Cannot connect to backend server at ${baseUrl}. Ensure backend is running.`);
      connError.isNetworkError = true;
      throw connError;
    }
    throw error;
  }
}

/**
 * 1. GET ALL STUDENTS
 * GET /api/getStudents
 */
export async function fetchStudents() {
  const response = await request('/getStudents', { method: 'GET' });
  return response.data || [];
}

/**
 * 2. GET STUDENT BY ID
 * GET /api/getStudentById/:id (uses MongoDB _id)
 */
export async function fetchStudentById(id) {
  if (!id) throw new Error('Student ID is required');
  const response = await request(`/getStudentById/${encodeURIComponent(id)}`, { method: 'GET' });
  return response.data;
}

/**
 * 3. CREATE STUDENT
 * POST /api/createStudent
 * Body: { userId, name, email, age }
 */
export async function createStudent({ userId, name, email, age }) {
  const payload = {
    userId: String(userId || '').trim(),
    name: String(name || '').trim(),
    email: String(email || '').trim().toLowerCase(),
    age: Number(age),
  };

  const response = await request('/createStudent', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response;
}

/**
 * 4. UPDATE STUDENT BY ID
 * PUT /api/updateStudent/:id
 * Note: backend searches { userId: studentId }
 */
export async function updateStudent(identifier, { userId, name, email, age }) {
  if (!identifier) throw new Error('Student identifier is required for update');

  const payload = {
    userId: String(userId || identifier).trim(),
    name: String(name || '').trim(),
    email: String(email || '').trim().toLowerCase(),
    age: Number(age),
  };

  const response = await request(`/updateStudent/${encodeURIComponent(identifier)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return response;
}

/**
 * 5. DELETE STUDENT BY ID
 * DELETE /api/deleteStudent/:id (uses MongoDB _id)
 */
export async function deleteStudent(id) {
  if (!id) throw new Error('Student ID is required for deletion');

  const response = await request(`/deleteStudent/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  return response;
}

/**
 * Live health check to verify backend connectivity
 */
export async function checkServerHealth() {
  try {
    const res = await request('/getStudents', { method: 'GET' });
    return { ok: true, studentCount: res.data?.length ?? 0 };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
