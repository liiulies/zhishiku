import { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { showToast } from '@/components/ui/Toast';
import { useStore } from '@/store/useStore';
import { uploadText } from '@/api';
import { formatNumber } from '@/lib/utils';
import type { UploadStatus } from '@/types';

const MAX_CHARS = 50000;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const statusConfig: Record<UploadStatus, { text: string; color: string; icon: string }> = {
  empty: { text: '未上传文本', color: 'text-muted-foreground', icon: '⚪' },
  inputting: { text: '正在输入...', color: 'text-yellow-600', icon: '🟡' },
  ready: { text: '已就绪，可以分析', color: 'text-green-600', icon: '🟢' },
  uploading: { text: '正在提交...', color: 'text-blue-600', icon: '🔵' },
  analyzing: { text: 'AI 正在分析文档...', color: 'text-blue-600', icon: '🔵' },
  analyzed: { text: '分析完成，可以提问', color: 'text-green-600', icon: '🟢' },
  error: { text: '上传失败，请重试', color: 'text-red-600', icon: '🔴' },
};

export function TextInputPanel() {
  const { textContent, uploadStatus, setTextInput, setUploadStatus, setLoading, setInputVisible, addMessage } = useStore();
  const [isDragOver, setIsDragOver] = useState(false);

  const charCount = textContent.length;
  const canAnalyze = uploadStatus === 'ready';
  const isProcessing = ['uploading', 'analyzing'].includes(uploadStatus);
  const config = statusConfig[uploadStatus];

  const handleAnalyze = async () => {
    if (!textContent.trim()) {
      showToast('error', '请先输入文本内容');
      return;
    }

    setLoading(true);
    setUploadStatus('uploading');

    try {
      await uploadText(textContent);
      setUploadStatus('analyzed');
      setInputVisible(true);
      
      addMessage({
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: '文档已分析完成！你可以开始提问了。',
        timestamp: new Date(),
        status: 'sent',
      });

      showToast('success', '文档上传成功');
    } catch (error: any) {
      setUploadStatus('error');
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.txt')) {
      showToast('error', '仅支持 .txt 格式文件');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast('error', '文件大小不能超过 10MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        setTextInput(content);
        showToast('success', '文件读取成功');
      };
      reader.readAsText(file, 'UTF-8');
    } catch {
      showToast('error', '文件读取失败');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextInput(value);
    
    if (value.trim()) {
      setUploadStatus('ready');
    } else {
      setUploadStatus('empty');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 标题 */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">文本输入</h2>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-6 space-y-4">
        {/* 文本输入框 */}
        <div>
          <textarea
            value={textContent}
            onChange={handleInputChange}
            placeholder="在此粘贴或输入文本内容..."
            maxLength={MAX_CHARS}
            disabled={isProcessing}
            className="w-full h-64 px-4 py-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {/* 字符计数 */}
          <div className="mt-2 text-right">
            <span className={`text-xs ${charCount > MAX_CHARS * 0.9 ? 'text-red-600' : 'text-muted-foreground'}`}>
              {formatNumber(charCount)} / {formatNumber(MAX_CHARS)}
              {charCount > MAX_CHARS * 0.9 && ' ⚠️ 接近上限'}
            </span>
          </div>
        </div>

        {/* 文件上传区域 */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer
            ${isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
          `}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.txt';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) handleFileUpload(file);
            };
            input.click();
          }}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            点击或拖拽 .txt 文件到此处
          </p>
        </div>

        {/* 状态指示器 */}
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-muted/50">
          <span>{config.icon}</span>
          <span className={`text-sm font-medium ${config.color}`}>
            {config.text}
          </span>
          {isProcessing && <LoadingSpinner size="sm" />}
        </div>

        {/* 错误提示 */}
        {uploadStatus === 'error' && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">上传失败，请检查内容后重试</p>
          </div>
        )}

        {/* 分析按钮 */}
        <div className="pt-2">
          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            loading={isProcessing}
            className="w-full"
          >
            {isProcessing ? '分析中...' : '开始分析'}
          </Button>
        </div>
      </div>
    </div>
  );
}
