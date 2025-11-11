import axios from 'axios';
import type { Attendee, SessionWithSpeaker, Speaker, RegisterRequest, Stats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const getSessions = async (): Promise<SessionWithSpeaker[]> => {
  const response = await api.get<SessionWithSpeaker[]>('/sessions');
  return Array.isArray(response.data) ? response.data : [];
};

export const getSpeakers = async (): Promise<Speaker[]> => {
  const response = await api.get<Speaker[]>('/speakers');
  return Array.isArray(response.data) ? response.data : [];
};

export const registerAttendee = async (data: RegisterRequest): Promise<void> => {
  await api.post('/register', data);
};

export const getAttendeeCount = async (): Promise<number> => {
  const response = await api.get<{ count: number }>('/attendees/count');
  return response.data.count;
};

export const adminLogin = async (password: string): Promise<string> => {
  const response = await api.post<{ token: string }>('/admin/login', { password });
  return response.data.token;
};

export const getAttendees = async (): Promise<Attendee[]> => {
  const response = await api.get<Attendee[]>('/admin/attendees');
  return response.data;
};

export const getStats = async (): Promise<Stats> => {
  const response = await api.get<Stats>('/admin/stats');
  return response.data;
};

export const addUpdateSpeaker = async (speaker: Partial<Speaker> & { id?: string }): Promise<Speaker> => {
  const response = await api.post<Speaker>('/admin/speakers', speaker);
  return response.data;
};

export const addUpdateSession = async (session: Partial<SessionWithSpeaker> & { id?: string }): Promise<SessionWithSpeaker> => {
  const response = await api.post<SessionWithSpeaker>('/admin/sessions', session);
  return response.data;
};

