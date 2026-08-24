import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for API key
apiClient.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem('api_key');
    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types
export interface PredictionRequest {
  customer_age_days: number;
  account_age_days: number;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  days_since_last_order: number;
  order_frequency: number;
  website_visits_30d: number;
  email_open_rate: number;
  cart_abandonment_rate: number;
  product_views_30d: number;
  support_tickets_total: number;
  support_tickets_open: number;
  returns_count: number;
  refunds_count: number;
  favorite_category: string;
  discount_usage_rate: number;
  premium_product_rate: number;
  payment_method: string;
  shipping_method: string;
  failed_payment_count: number;
}

export interface PredictionResponse {
  request_id: string;
  predictions: number[];
  model_version: string;
  strategy: string;
  latency_ms: number;
  churn_probability: number;
  risk_score: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  models: Record<string, boolean>;
}

export interface RouterMetrics {
  total_requests: number;
  v1_requests: number;
  v2_requests: number;
  shadow_comparisons: number;
  canary_weight: number;
  strategy: string;
}

export interface ShadowAnalysis {
  total_comparisons: number;
  agreement_rate: number;
  avg_difference: number;
  v1_better: number;
  v2_better: number;
  correlation: number;
}

// API methods
export const healthCheck = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
};

export const makePrediction = async (
  data: PredictionRequest
): Promise<PredictionResponse> => {
  const response = await apiClient.post<PredictionResponse>('/predict', data);
  return response.data;
};

export const explainPrediction = async (
  data: PredictionRequest
): Promise<any> => {
  const response = await apiClient.post('/explain', data);
  return response.data;
};

export const getRouterMetrics = async (): Promise<RouterMetrics> => {
  const response = await apiClient.get<RouterMetrics>('/router/metrics');
  return response.data;
};

export const getShadowAnalysis = async (): Promise<ShadowAnalysis> => {
  const response = await apiClient.get<ShadowAnalysis>('/router/shadow-analysis');
  return response.data;
};

export const promoteV2 = async (): Promise<{ message: string }> => {
  const response = await apiClient.post('/router/promote-v2');
  return response.data;
};

export const rollbackToV1 = async (): Promise<{ message: string }> => {
  const response = await apiClient.post('/router/rollback');
  return response.data;
};

export const getPrometheusMetrics = async (): Promise<string> => {
  const response = await apiClient.get('/metrics', {
    headers: { Accept: 'text/plain' },
  });
  return response.data;
};

export default apiClient;
