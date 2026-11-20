const BASE_URL = '/api';

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('cc_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    let errorData = null;
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Non-json response
    }
    throw new ApiError(response.status, errorMessage, errorData);
  }

  if (response.headers.get('content-type')?.includes('text/csv')) {
    return (await response.text()) as unknown as T;
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    resetPassword: (body: any) => request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
    getPublicDepartments: () => request<any[]>('/auth/departments'),
    getMe: () => request<any>('/auth/me'),
    changePassword: (body: any) => request<any>('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
  },

  // Users
  users: {
    list: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any>(`/users${q ? `?${q}` : ''}`);
    },
    create: (body: any) => request<any>('/users', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/users/${id}`, { method: 'DELETE' }),
  },

  // Departments
  departments: {
    list: () => request<any[]>('/departments'),
    create: (body: any) => request<any>('/departments', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/departments/${id}`, { method: 'DELETE' }),
  },

  // Courses
  courses: {
    list: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any[]>(`/courses${q ? `?${q}` : ''}`);
    },
    create: (body: any) => request<any>('/courses', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/courses/${id}`, { method: 'DELETE' }),
  },

  // Students
  students: {
    list: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any>(`/students${q ? `?${q}` : ''}`);
    },
    getById: (id: string) => request<any>(`/students/${id}`),
    create: (body: any) => request<any>('/students', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/students/${id}`, { method: 'DELETE' }),
  },

  // Faculty
  faculty: {
    list: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any[]>(`/faculty${q ? `?${q}` : ''}`);
    },
    create: (body: any) => request<any>('/faculty', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/faculty/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/faculty/${id}`, { method: 'DELETE' }),
  },

  // Attendance
  attendance: {
    list: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any[]>(`/attendance${q ? `?${q}` : ''}`);
    },
    mark: (body: any) => request<any>('/attendance', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/attendance/${id}`, { method: 'DELETE' }),
  },

  // Marks
  marks: {
    list: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any[]>(`/marks${q ? `?${q}` : ''}`);
    },
    create: (body: any) => request<any>('/marks', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/marks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/marks/${id}`, { method: 'DELETE' }),
  },

  // Timetable
  timetable: {
    list: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any[]>(`/timetable${q ? `?${q}` : ''}`);
    },
    create: (body: any) => request<any>('/timetable', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/timetable/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/timetable/${id}`, { method: 'DELETE' }),
  },

  // Announcements
  announcements: {
    list: () => request<any[]>('/announcements'),
    create: (body: any) => request<any>('/announcements', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/announcements/${id}`, { method: 'DELETE' }),
  },

  // Events
  events: {
    list: () => request<any[]>('/events'),
    create: (body: any) => request<any>('/events', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/events/${id}`, { method: 'DELETE' }),
  },

  // Library
  library: {
    books: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any[]>(`/library/books${q ? `?${q}` : ''}`);
    },
    createBook: (body: any) => request<any>('/library/books', { method: 'POST', body: JSON.stringify(body) }),
    updateBook: (id: string, body: any) => request<any>(`/library/books/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteBook: (id: string) => request<any>(`/library/books/${id}`, { method: 'DELETE' }),
    issues: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any[]>(`/library/issues${q ? `?${q}` : ''}`);
    },
    issueBook: (body: any) => request<any>('/library/issues', { method: 'POST', body: JSON.stringify(body) }),
    returnBook: (id: string, body?: any) => request<any>(`/library/issues/${id}/return`, { method: 'POST', body: JSON.stringify(body || {}) }),
  },

  // Fees
  fees: {
    list: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any[]>(`/fees${q ? `?${q}` : ''}`);
    },
    create: (body: any) => request<any>('/fees', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request<any>(`/fees/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    pay: (id: string, body?: any) => request<any>(`/fees/${id}/pay`, { method: 'POST', body: JSON.stringify(body || {}) }),
    delete: (id: string) => request<any>(`/fees/${id}`, { method: 'DELETE' }),
  },

  // Hostel
  hostel: {
    rooms: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any[]>(`/hostel/rooms${q ? `?${q}` : ''}`);
    },
    createRoom: (body: any) => request<any>('/hostel/rooms', { method: 'POST', body: JSON.stringify(body) }),
    updateRoom: (id: string, body: any) => request<any>(`/hostel/rooms/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    assignStudent: (roomId: string, studentId: string) => request<any>(`/hostel/rooms/${roomId}/assign`, { method: 'POST', body: JSON.stringify({ studentId }) }),
    removeStudent: (roomId: string, studentId: string) => request<any>(`/hostel/rooms/${roomId}/remove`, { method: 'POST', body: JSON.stringify({ studentId }) }),
    deleteRoom: (id: string) => request<any>(`/hostel/rooms/${id}`, { method: 'DELETE' }),
  },

  // Leaves
  leaves: {
    list: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any[]>(`/leaves${q ? `?${q}` : ''}`);
    },
    apply: (body: any) => request<any>('/leaves', { method: 'POST', body: JSON.stringify(body) }),
    review: (id: string, body: any) => request<any>(`/leaves/${id}/review`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/leaves/${id}`, { method: 'DELETE' }),
  },

  // Notes
  notes: {
    list: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any[]>(`/notes${q ? `?${q}` : ''}`);
    },
    upload: (body: any) => request<any>('/notes', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id: string) => request<any>(`/notes/${id}`, { method: 'DELETE' }),
  },

  // Dashboard Stats
  dashboard: {
    getStats: () => request<any>('/dashboard/stats'),
  },

  // Audit
  audit: {
    list: (params?: any) => {
      const q = new URLSearchParams(params).toString();
      return request<any>(`/audit${q ? `?${q}` : ''}`);
    },
  },

  // Backup & Import/Export
  backup: {
    exportUrl: (entity: string) => {
      const token = localStorage.getItem('cc_token') || '';
      return `${BASE_URL}/backup/export/${entity}?token=${encodeURIComponent(token)}`;
    },
    downloadCsv: async (entity: string) => {
      const csvText = await request<string>(`/backup/export/${entity}`);
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${entity}_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    importStudents: (rows: any[]) => request<any>('/backup/import/students', { method: 'POST', body: JSON.stringify({ rows }) }),
  },
};
