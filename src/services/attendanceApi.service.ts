/**
 * Attendance API Service
 */

import { apiClient } from './api.client';

export interface AttendanceRecord {
  id: string;
  user_id: string;
  outlet_id: string;
  checkin_time: string;
  checkout_time?: string;
  duration_minutes?: number;
  status: 'Present' | 'Absent' | 'On Leave' | 'Half Day';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CheckinData {
  user_id: string;
  outlet_id: string;
  location?: { latitude: number; longitude: number };
  notes?: string;
}

export interface CheckoutData {
  attendance_id: string;
  location?: { latitude: number; longitude: number };
  notes?: string;
}

export interface AttendanceAnalytics {
  total_days: number;
  present_days: number;
  absent_days: number;
  on_leave_days: number;
  half_days: number;
  attendance_percentage: number;
  average_hours: number;
}

export interface AttendanceQuery {
  outlet_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export const attendanceApi = {
  /**
   * Check in staff
   */
  checkin: async (data: CheckinData): Promise<AttendanceRecord> => {
    return apiClient.post<AttendanceRecord>('/attendance/checkin', data);
  },

  /**
   * Check out staff
   */
  checkout: async (data: CheckoutData): Promise<AttendanceRecord> => {
    return apiClient.post<AttendanceRecord>('/attendance/checkout', data);
  },

  /**
   * Get attendance records
   */
  getAll: async (query?: AttendanceQuery): Promise<AttendanceRecord[]> => {
    const params = new URLSearchParams();
    if (query?.outlet_id) params.append('outlet_id', query.outlet_id);
    if (query?.user_id) params.append('user_id', query.user_id);
    if (query?.start_date) params.append('start_date', query.start_date);
    if (query?.end_date) params.append('end_date', query.end_date);
    if (query?.status) params.append('status', query.status);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    return apiClient.get<AttendanceRecord[]>(`/attendance?${params.toString()}`);
  },

  /**
   * Get attendance record by ID
   */
  getById: async (id: string): Promise<AttendanceRecord> => {
    return apiClient.get<AttendanceRecord>(`/attendance/${id}`);
  },

  /**
   * Get today's attendance for a user
   */
  getTodayAttendance: async (userId: string): Promise<AttendanceRecord | null> => {
    try {
      return await apiClient.get<AttendanceRecord>(`/attendance/today/${userId}`);
    } catch (error) {
      return null;
    }
  },

  /**
   * Get attendance analytics for a user
   */
  getAnalytics: async (userId: string, days?: number): Promise<AttendanceAnalytics> => {
    return apiClient.get<AttendanceAnalytics>(
      `/attendance/${userId}/analytics${days ? `?days=${days}` : ''}`
    );
  },

  /**
   * Update attendance record
   */
  update: async (id: string, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
    return apiClient.patch<AttendanceRecord>(`/attendance/${id}`, data);
  },
};

export default attendanceApi;
