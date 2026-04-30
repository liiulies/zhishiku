import axios from 'axios';
import type { ApiResponse, UploadResponse, QueryResponse } from '@/types';

// API 基础路径（开发环境使用代理，生产环境替换为实际地址）
const API_BASE = '/api/v1';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const message = error.response.data?.message || '请求失败';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error('网络错误'));
  }
);

/**
 * 健康检查
 */
export const healthCheck = async (): Promise<ApiResponse> => {
  const response = await api.get<any, ApiResponse>('/health');
  return response;
};

/**
 * 上传文本内容
 */
export const uploadText = async (
  text: string
): Promise<ApiResponse<UploadResponse>> => {
  const formData = new URLSearchParams();
  formData.append('text', text);

  const response = await api.post<any, ApiResponse<UploadResponse>>(
    '/upload-text',
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response;
};

/**
 * 上传文件
 */
export const uploadFile = async (
  file: File
): Promise<ApiResponse<UploadResponse>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<any, ApiResponse<UploadResponse>>(
    '/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response;
};

/**
 * 知识查询
 */
export const queryKnowledge = async (
  question: string
): Promise<ApiResponse<QueryResponse>> => {
  const response = await api.post<any, ApiResponse<QueryResponse>>(
    '/query',
    { question }
  );

  return response;
};

export default api;
