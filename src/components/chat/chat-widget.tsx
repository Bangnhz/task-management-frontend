import React, { useState, useRef, useEffect } from 'react';
import ChatService from '../../services/chat.service';

interface Message {
  sender: 'bot' | 'user' | string;
  text: string;
  time?: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Chào bạn! Mình có thể hỗ trợ tạo task, phân bổ công việc hoặc theo dõi tiến độ.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    'Tạo task giữ ghế vào To Do',
    'Thêm task test VNPay ưu tiên HIGH',
    'Tạo task làm Seat Map'
  ];

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text: textToSend, time: currentTime }]);
    setInput('');
    setLoading(true);

    try {
      const response = await ChatService.sendMessage(textToSend);

      window.dispatchEvent(new Event('tasks-updated'));

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: response.data.reply || 'Hệ thống đã ghi nhận yêu cầu.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Khung cửa sổ chat */}
      {isOpen && (
        <div className="flex flex-col w-[380px] h-[550px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-4 duration-200">

          {/* Header - Nổi bật với Gradient Indigo -> Purple sang trọng */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-5 py-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center text-sm font-semibold border border-white/20">
                🤖
              </div>
              <div>
                <div className="text-sm font-semibold tracking-wide">Task Copilot</div>
                <div className="text-[11px] text-indigo-100 flex items-center gap-1.5 opacity-90">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Sẵn sàng xử lý
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              title="Đóng chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Vùng danh sách tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-slate-50/70">
            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}
                >
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 text-[13.5px] leading-relaxed rounded-2xl break-words whitespace-pre-wrap ${isUser
                      ? 'bg-indigo-600 text-white rounded-br-xs shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/70 rounded-bl-xs shadow-sm'
                      }`}
                  >
                    {msg.text}
                  </div>
                  {msg.time && (
                    <span className="text-[10px] text-slate-400 px-1 font-medium">
                      {msg.time}
                    </span>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl w-fit shadow-xs">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions (Gợi ý lệnh nhanh) */}
          <div className="px-3.5 py-2 bg-slate-50/90 border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 text-[11px] font-medium hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Ô nhập tin nhắn */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập yêu cầu..."
                className="flex-1 bg-transparent text-[13px] text-slate-900 placeholder-slate-400 outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className={`ml-1.5 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${input.trim() && !loading
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nút bấm tròn mở Widget (Chỉ hiện khi khung chat đóng) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/25 flex items-center justify-center text-xl transition-all duration-200 hover:scale-105 active:scale-95 border border-white/20 cursor-pointer"
          title="Mở Task Copilot"
        >
          🤖
        </button>
      )}
    </div>
  );
}