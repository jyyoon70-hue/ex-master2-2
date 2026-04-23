import { useState, useRef, useEffect } from 'react';
import ChatHeader from './components/ChatHeader';
import MessageList, { Message } from './components/MessageList';
import ChatInput from './components/ChatInput';
import QuickTalk from './components/QuickTalk';
import { getChatBotResponse } from './services/geminiService';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: "안녕하세요. 근로기준법 안내봇입니다.\n회사 취업규칙을 우선 기준으로 답변드리고, 내규에 없는 내용은 최신 법령 기준으로 안내해드립니다.\n궁금하신 내용을 입력해주세요!",
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Get bot response
    const botResponseText = await getChatBotResponse(text);
    
    setIsTyping(false);
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: "bot",
      text: botResponseText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, botMsg]);
  };

  return (
    <div className="w-full h-screen overflow-hidden flex justify-center" style={{ backgroundColor: '#d1e7dd' }}>
      <div className="flex flex-col h-full w-full max-w-2xl shadow-lg border-x border-black/5" style={{ backgroundColor: '#d1e7dd' }}>
        <ChatHeader />
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto flex flex-col">
          <MessageList messages={messages} isTyping={isTyping} />
          <QuickTalk onSelect={handleSendMessage} disabled={isTyping} />
        </div>

        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
