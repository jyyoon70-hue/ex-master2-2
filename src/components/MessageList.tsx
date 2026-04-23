import { motion, AnimatePresence } from "motion/react";
import { User, Bot } from "lucide-react";

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export default function MessageList({ messages, isTyping }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ backgroundColor: '#d1e7dd' }}>
      <AnimatePresence initial={false}>
        {messages.map((msg, index) => {
          const isNewDay = index === 0; // Simple date divider for first message in this demo
          
          return (
            <div key={msg.id} className="space-y-6">
              {isNewDay && (
                <div className="flex justify-center my-4">
                  <span className="bg-black/10 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-medium">
                    {new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }).format(msg.timestamp)}
                  </span>
                </div>
              )}
              
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"} gap-2`}>
                  {msg.sender === "bot" && (
                    <div className="w-9 h-9 bg-white rounded-xl flex-shrink-0 flex items-center justify-center border border-gray-200 shadow-sm overflow-hidden">
                      <span className="text-sm">🤖</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col">
                    {msg.sender === "bot" && (
                      <span className="text-[11px] text-gray-600 mb-1 ml-1 font-medium">인사팀 안내봇</span>
                    )}
                    <div
                      className={`
                        relative p-3 rounded-2xl text-[14px] leading-relaxed break-words shadow-kakao border border-black/5
                        ${msg.sender === "user" 
                          ? "bg-[#fee500] text-black rounded-tr-none" 
                          : "bg-white text-black rounded-tl-none"
                        }
                      `}
                    >
                      <pre className="whitespace-pre-wrap font-sans font-medium">{msg.text}</pre>
                    </div>
                    <span className={`text-[10px] text-gray-400 mt-1 px-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </AnimatePresence>
      
      {isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-start gap-2"
        >
          <div className="w-9 h-9 bg-white rounded-xl flex-shrink-0 flex items-center justify-center border border-gray-200 shadow-sm">
            <span className="text-sm">🤖</span>
          </div>
          <div className="bg-white/80 px-4 py-2 rounded-2xl rounded-tl-none text-[12px] text-gray-500 font-medium italic border border-black/5">
            회사 내규 기준으로 확인 중...
          </div>
        </motion.div>
      )}
    </div>
  );
}
