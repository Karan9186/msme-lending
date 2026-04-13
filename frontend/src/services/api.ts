import axios, { AxiosError, AxiosResponse } from 'axios';
import { LoanApplicationForm, DecisionResult, ApiError } from '../types';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data;
      const message = errorData?.details || errorData?.error || 'An error occurred';
      throw new ApiException(
        message,
        error.response.status,
        errorData?.field
      );
    } else if (error.request) {
      // Request was made but no response
      throw new ApiException(
        'Unable to connect to the server. Please check your internet connection.',
        0
      );
    } else {
      // Something else happened
      throw new ApiException(
        error.message || 'An unexpected error occurred',
        0
      );
    }
  }
);

// Custom API Exception
export class ApiException extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public field?: string
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

// API Functions
export const evaluateDecision = async (
  data: LoanApplicationForm
): Promise<DecisionResult> => {
  const response = await api.post<DecisionResult>('/decision', data);
  return response.data;
};

export const getHealthStatus = async (): Promise<{ status: string }> => {
  const response = await axios.get('/health');
  return response.data;
};
