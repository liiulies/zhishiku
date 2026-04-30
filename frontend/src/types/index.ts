// 消息类型
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'error' | 'typing';
  metadata?: {
    queryId?: string;
    processingTime?: number;
    contextLength?: number;
  };
}

// 上传状态
export type UploadStatus =
  | 'empty'
  | 'inputting'
  | 'ready'
  | 'uploading'
  | 'analyzing'
  | 'analyzed'
  | 'error';

// 上传响应
export interface UploadResponse {
  documentId: string;
  fileName: string;
  fileSize: number;
  contentPreview: string;
  processingTime: number;
  uploadedAt: string;
}

// 查询响应
export interface QueryResponse {
  queryId: string;
  answer: string;
  contextLength: number;
  processingTime: number;
  timestamp: string;
}

// API 响应包装
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 错误码映射
export const ERROR_MESSAGES: Record<number, string> = {
  1001: '不支持的文件类型，仅支持 .txt 格式',
  1002: '文件大小超出限制（最大 10MB）',
  1003: '文本内容不能为空',
  2001: '问题不能为空',
  2002: '问题长度超出限制（最多 2000 字符）',
  2005: '知识库为空，请先上传文档',
  2006: '查询处理失败，请重试',
  2007: 'AI 服务暂时不可用，请稍后重试',
  9999: '服务器内部错误，请联系管理员',
};
