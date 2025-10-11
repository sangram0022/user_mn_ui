import { apiClient } from '../apiClient';

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  user_id?: string;
  timestamp: string;
  properties: Record<string, unknown>;
  session_id?: string;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  timestamp: string;
  dimensions?: Record<string, string>;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description?: string;
  type: 'user_activity' | 'system_performance' | 'business_metrics';
  date_range: {
    start: string;
    end: string;
  };
  data: {
    metrics: AnalyticsMetric[];
    events: AnalyticsEvent[];
    summary: Record<string, unknown>;
  };
}

export interface CreateEventData {
  event_type: string;
  properties?: Record<string, unknown>;
  user_id?: string;
  session_id?: string;
}

export const analyticsApiService = {
  async trackEvent(data: CreateEventData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/analytics/events', data);
    return response.data;
  },

  async getEvents(params?: {
    event_type?: string;
    user_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<AnalyticsEvent[]> {
    const response = await apiClient.get<AnalyticsEvent[]>('/analytics/events', { params });
    return response.data;
  },

  async getMetrics(params?: {
    metric_names?: string[];
    start_date?: string;
    end_date?: string;
    groupBy?: string;
  }): Promise<AnalyticsMetric[]> {
    const response = await apiClient.get<AnalyticsMetric[]>('/analytics/metrics', { params });
    return response.data;
  },

  async getReports(params?: {
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<AnalyticsReport[]> {
    const response = await apiClient.get<AnalyticsReport[]>('/analytics/reports', { params });
    return response.data;
  },

  async getReport(reportId: string): Promise<AnalyticsReport> {
    const response = await apiClient.get<AnalyticsReport>(`/analytics/reports/${reportId}`);
    return response.data;
  },

  async createReport(data: {
    name: string;
    description?: string;
    type: string;
    date_range: {
      start: string;
      end: string;
    };
    filters?: Record<string, unknown>;
  }): Promise<{ report_id: string; message: string }> {
    const response = await apiClient.post<{ report_id: string; message: string }>(
      '/analytics/reports',
      data
    );
    return response.data;
  },

  async getUserAnalytics(
    userId: string,
    params?: {
      start_date?: string;
      end_date?: string;
    }
  ): Promise<{
    user_id: string;
    total_events: number;
    total_sessions: number;
    last_activity: string;
    activity_summary: Record<string, unknown>;
  }> {
    const response = await apiClient.get<{
      user_id: string;
      total_events: number;
      total_sessions: number;
      last_activity: string;
      activity_summary: Record<string, unknown>;
    }>(`/analytics/users/${userId}`, { params });
    return response.data;
  },

  async getSystemAnalytics(params?: { start_date?: string; end_date?: string }): Promise<{
    total_users: number;
    active_users: number;
    total_events: number;
    performance_metrics: Record<string, number>;
    error_rate: number;
  }> {
    const response = await apiClient.get<{
      total_users: number;
      active_users: number;
      total_events: number;
      performance_metrics: Record<string, number>;
      error_rate: number;
    }>('/analytics/system', { params });
    return response.data;
  },
};
