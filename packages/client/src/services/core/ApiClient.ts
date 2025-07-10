import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { NetworkError, TimeoutError, ServiceError } from '../base/ServiceError';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface RequestInterceptor {
  onRequest?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;
  onRequestError?: (error: any) => any;
}

export interface ResponseInterceptor {
  onResponse?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;
  onResponseError?: (error: any) => any;
}

export class ApiClient {
  private axios: AxiosInstance;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: ApiClientConfig) {
    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axios.interceptors.request.use(
      async (config) => {
        // Apply custom interceptors
        for (const interceptor of this.requestInterceptors) {
          if (interceptor.onRequest) {
            config = await interceptor.onRequest(config);
          }
        }
        return config;
      },
      async (error) => {
        // Apply custom error interceptors
        for (const interceptor of this.requestInterceptors) {
          if (interceptor.onRequestError) {
            error = await interceptor.onRequestError(error);
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      async (response) => {
        // Apply custom interceptors
        for (const interceptor of this.responseInterceptors) {
          if (interceptor.onResponse) {
            response = await interceptor.onResponse(response);
          }
        }
        return response;
      },
      async (error) => {
        // Apply custom error interceptors
        for (const interceptor of this.responseInterceptors) {
          if (interceptor.onResponseError) {
            error = await interceptor.onResponseError(error);
          }
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new TimeoutError('Request timed out');
    }

    if (error.code === 'ERR_NETWORK' || !error.response) {
      return new NetworkError('Network error occurred', error.message);
    }

    if (error.response) {
      const { status, data } = error.response;
      const message = (data as any)?.message || error.message;

      return new ServiceError(message, 'API_ERROR', {
        statusCode: status,
        details: data,
        retryable: status >= 500
      });
    }

    return new ServiceError(error.message);
  }

  public addRequestInterceptor(
    onRequest?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
    onRequestError?: (error: any) => any
  ): void {
    this.requestInterceptors.push({ onRequest, onRequestError });
  }

  public addResponseInterceptor(
    onResponse?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
    onResponseError?: (error: any) => any
  ): void {
    this.responseInterceptors.push({ onResponse, onResponseError });
  }

  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axios.get<T>(url, config);
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axios.post<T>(url, data, config);
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axios.put<T>(url, data, config);
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axios.patch<T>(url, data, config);
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axios.delete<T>(url, config);
  }

  public async retry(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.axios.request(config);
  }

  public getAxiosInstance(): AxiosInstance {
    return this.axios;
  }
}