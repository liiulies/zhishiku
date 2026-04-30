import { useMemo, useState } from 'react';
import {
  BookOpen,
  Plus,
  MessageSquare,
  FileText,
  Trash2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useToast, ToastContainer, showToast } from '@/components/ui/Toast';
import { TextInputPanel } from '@/components/TextInputPanel';
import { ChatWindow } from '@/components/ChatWindow';
import { QuestionInput } from '@/components/QuestionInput';
import { queryKnowledge } from '@/api';
import { generateId } from '@/lib/utils';
import type { Message } from '@/types';

type SidebarView = 'chat' | 'docs';

function App() {
  const { toasts, removeToast } = useToast();
  const {
    messages,
    isInputVisible,
    isLoading,
    textContent,
    addMessage,
    updateMessage,
    clearMessages,
    setLoading,
    reset,
  } = useStore();

  const [question, setQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeView, setActiveView] = useState<SidebarView>('chat');

  const recentUserMessages = useMemo(
    () => messages.filter((msg) => msg.role === 'user').slice(-6).reverse(),
    [messages]
  );

  const handleSendQuestion = async () => {
    if (!question.trim()) {
      showToast('warning', '请输入问题');
      return;
    }

    const userMessage: Message = {
      id: generateId('user'),
      role: 'user',
      content: question,
      timestamp: new Date(),
      status: 'sent',
    };

    addMessage(userMessage);
    const currentQuestion = question;
    setQuestion('');
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await queryKnowledge(currentQuestion);
      setIsTyping(false);

      const aiMessage: Message = {
        id: generateId('assistant'),
        role: 'assistant',
        content: response.data.answer,
        timestamp: new Date(),
        status: 'sent',
        metadata: {
          queryId: response.data.queryId,
          processingTime: response.data.processingTime,
          contextLength: response.data.contextLength,
        },
      };

      addMessage(aiMessage);
    } catch (error: any) {
      setIsTyping(false);
      showToast('error', error.message);
      updateMessage(userMessage.id, { status: 'error' });

      addMessage({
        id: generateId('error'),
        role: 'assistant',
        content: `抱歉，查询失败：${error.message}`,
        timestamp: new Date(),
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('确定要清空所有对话记录吗？')) {
      clearMessages();
      setQuestion('');
      showToast('success', '对话已清空');
    }
  };

  const handleNewChat = () => {
    clearMessages();
    setQuestion('');
    setActiveView('chat');
    showToast('success', '已开启新对话');
  };

  const handleReset = () => {
    if (window.confirm('上传新文档将清空当前对话，是否继续？')) {
      reset();
      setQuestion('');
      setActiveView('docs');
      showToast('success', '已重置，请上传新文档');
    }
  };

  return (
    <div className="h-screen bg-slate-100 p-3">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex">
        <aside className="w-72 border-r border-slate-200 bg-slate-50/80 flex flex-col">
          <div className="px-4 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-slate-700">zhishiku</span>
            </div>
          </div>

          <div className="p-3">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建对话
            </button>
          </div>

          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveView('chat')}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                activeView === 'chat'
                  ? 'bg-slate-200 text-slate-900 font-medium'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              对话窗口
            </button>
            <button
              onClick={() => setActiveView('docs')}
              className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                activeView === 'docs'
                  ? 'bg-slate-200 text-slate-900 font-medium'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              <FileText className="w-4 h-4" />
              文档输入
            </button>
          </nav>

          <div className="mt-4 px-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Recent</p>
          </div>
          <div className="flex-1 overflow-auto px-3 py-2 space-y-1">
            {recentUserMessages.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-400">暂无会话记录</p>
            ) : (
              recentUserMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setActiveView('chat');
                    setQuestion(msg.content);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-200/70 transition-colors"
                  title={msg.content}
                >
                  <p className="text-xs text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap">{msg.content}</p>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-slate-200 p-3 grid grid-cols-2 gap-2">
            <button
              onClick={handleClearChat}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 hover:bg-slate-100"
              title="清空对话"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700 hover:bg-slate-100"
              title="重新上传"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              重置
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-white">
          <header className="h-14 border-b border-slate-200 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">智能知识问答</span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {isLoading || isTyping ? '处理中' : '已连接'}
            </span>
          </header>

          {activeView === 'docs' ? (
            <div className="flex-1 p-6 bg-slate-50/50">
              <div className="h-full max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <TextInputPanel />
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col bg-white">
              <div className="flex-1 min-h-0 overflow-auto px-6 py-6">
                <div className="max-w-5xl mx-auto h-full">
                  <ChatWindow messages={messages} isTyping={isTyping} />
                </div>
              </div>

              <div className="px-6 pb-6 bg-gradient-to-t from-white via-white to-white/80">
                <div className="max-w-4xl mx-auto">
                  {isInputVisible ? (
                    <QuestionInput
                      value={question}
                      onChange={setQuestion}
                      onSend={handleSendQuestion}
                      loading={isLoading}
                    />
                  ) : textContent ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      请先在“文档输入”中完成分析，再开始提问。
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      请先前往“文档输入”上传或粘贴文本内容。
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
