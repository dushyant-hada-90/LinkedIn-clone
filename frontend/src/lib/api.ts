import axios from 'axios';
import type { FeedResponse, User, Post, Notification, Conversation, Message, ConnectionRequest } from '../types';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
});

// Auth
export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  signup: (data: { firstName: string; lastName: string; email: string; password: string }) =>
    api.post('/auth/signup', data),
  googleLogin: (googleToken: string) => api.post('/auth/google', { googleToken }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
};

// Users
export const usersApi = {
  me: () => api.get<User>('/users/me'),
  getProfile: (id: string) => api.get<User>(`/users/${id}`),
  updateProfile: (data: FormData) => api.patch<User>('/users/me', data),
  search: (query: string) => api.get<User[]>(`/users/search?q=${encodeURIComponent(query)}`),
};

// Posts
export const postsApi = {
  feed: (cursor?: string) => {
    const params = new URLSearchParams({ limit: '10' });
    if (cursor) params.set('cursor', cursor);
    return api.get<FeedResponse>(`/posts?${params}`);
  },
  create: (data: FormData) => api.post<Post>('/posts', data),
  delete: (id: string) => api.delete(`/posts/${id}`),
  toggleLike: (id: string) => api.post<Post>(`/posts/${id}/like`),
  addComment: (postId: string, content: string) => api.post<Post>(`/posts/${postId}/comments`, { content }),
  deleteComment: (postId: string, commentId: string) =>
    api.delete<Post>(`/posts/${postId}/comments/${commentId}`),
  editComment: (postId: string, commentId: string, newContent: string) =>
    api.patch<Post>(`/posts/${postId}/comments/${commentId}`, { newContent }),
};

// Connections
export const connectionsApi = {
  send: (userId: string) => api.post(`/connections/${userId}`),
  accept: (connectionId: string) => api.put(`/connections/${connectionId}/accept`),
  reject: (connectionId: string) => api.put(`/connections/${connectionId}/reject`),
  remove: (userId: string) => api.delete(`/connections/${userId}`),
  getStatus: (userId: string) => api.get<{ status: string }>(`/connections/${userId}/status`),
  pendingRequests: () => api.get<ConnectionRequest[]>('/connections/me/requests'),
  myConnections: () => api.get('/connections/me'),
};

// Messages
export const messagesApi = {
  getConversations: () => api.get<Conversation[]>('/messages/conversations'),
  sendMessage: (receiverId: string, content: string) =>
    api.post(`/messages/send/${receiverId}`, { content }),
  getMessages: (conversationId: string, before?: string) => {
    const params = before ? `?before=${before}` : '';
    return api.get<Message[]>(`/messages/${conversationId}${params}`);
  },
  markRead: (conversationId: string) => api.put(`/messages/${conversationId}/read`),
  getUnreadCount: () => api.get<{ count: number }>('/messages/unread-count'),
};

// Notifications
export const notificationsApi = {
  getAll: () => api.get<Notification[]>('/notifications'),
  markAllRead: () => api.put('/notifications/read-all'),
  markOneRead: (id: string) => api.put(`/notifications/${id}/read`),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
};
