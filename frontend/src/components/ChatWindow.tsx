import { useRef, useEffect } from 'react';
import { User, Bot, Clock, AlertCircle, BookOpen } from 'lucide-react';
import { TypingIndicator } from '@/components/ui/Loading';
import { formatTime } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`
        flex items-start gap-3 animate-fade-in
        ${isUser ? 'flex-row-reverse' : ''}
      `}
    >
      <div
        className={`
          w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
          ${isUser ? 'bg-slate-700' : 'bg-amber-500'}
        `}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      <div className={`max-w-[72%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`
            px-4 py-3 rounded-2xl whitespace-pre-wrap break-words border
            ${isUser ? 'bg-slate-800 text-white border-slate-700 rounded-tr-sm' : 'bg-slate-50 text-slate-800 border-slate-200 rounded-tl-sm'}
            ${message.status === 'error' ? 'opacity-70' : ''}
          `}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>

        <div className={`flex items-center gap-2 mt-1 px-1 ${isUser ? 'justify-end' : ''}`}>
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="text-xs text-slate-400">{formatTime(message.timestamp)}</span>
          {message.metadata?.processingTime && (
            <span className="text-xs text-slate-400">· {message.metadata.processingTime}秒</span>
          )}
          {message.status === 'error' && (
            <span className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              发送失败
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ChatWindowProps {
  messages: Message[];
  isTyping?: boolean;
}

export function ChatWindow({ messages, isTyping = false }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-start justify-center h-full px-6 md:px-10">
        <div className="inline-flex items-center gap-2 mb-3 text-slate-500">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span className="text-sm">zhishiku</span>
        </div>
        <h3 className="text-2xl font-semibold text-slate-800 mb-2">Ask questions, continue local work.</h3>
        <p className="text-sm text-slate-500">
          先在左侧“文档输入”完成分析，再在这里发起你的问题。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isTyping && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
}
