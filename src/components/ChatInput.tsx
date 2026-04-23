import React, { useState } from "react";
import { Plus, Smile, Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text);
      setText("");
    }
  };

  return (
    <footer className="bg-white border-t border-gray-200 p-4 shrink-0">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 flex items-center justify-between shadow-inner focus-within:ring-1 focus-within:ring-black/5 transition-all">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled}
            placeholder="메시지를 입력하세요..."
            className="flex-1 bg-transparent border-none outline-none text-sm py-1 placeholder:text-gray-400 font-medium"
          />
          <div className="flex items-center gap-3 text-gray-400">
            <button type="button" className="hover:text-gray-600 transition-colors">
              <Smile size={20} />
            </button>
            <button type="button" className="hover:text-gray-600 transition-colors">
              <Plus size={20} />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className={`
            w-12 h-11 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm transition-all
            ${text.trim() && !disabled ? "bg-kakao-yellow text-black active:scale-95" : "bg-gray-100 text-gray-300"}
          `}
        >
          {disabled ? "..." : "전송"}
        </button>
      </form>
    </footer>
  );
}
