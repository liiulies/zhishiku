import { useState, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function QuestionInput({
  value,
  onChange,
  onSend,
  loading = false,
  disabled = false,
}: QuestionInputProps) {
  const [isComposing, setIsComposing] = useState(false);

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = value.trim().length > 0 && !loading && !disabled;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="mb-3 text-sm text-slate-500">What's on your mind?</div>

      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="输入问题...（Enter 发送，Shift+Enter 换行）"
            maxLength={2000}
            disabled={disabled || loading}
            rows={3}
            className={cn(
              'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white resize-none',
              'focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-300 transition-all pr-16',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />

          {value.length > 0 && (
            <div className="absolute right-3 bottom-3 text-xs text-slate-400">{value.length}/2000</div>
          )}
        </div>

        <button
          onClick={onSend}
          disabled={!canSend}
          className={cn(
            'w-10 h-10 rounded-full transition-all flex items-center justify-center border',
            canSend
              ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              : 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
          )}
          aria-label="发送问题"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      <div className="mt-3 text-xs text-slate-400">Enter 发送 · Shift+Enter 换行</div>
    </div>
  );
}
