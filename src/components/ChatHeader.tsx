import { ArrowLeft, Search, Menu } from "lucide-react";

export default function ChatHeader() {
  return (
    <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-black/5 shrink-0 shadow-sm sticky top-0 z-10 transition-all">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#fee500] rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-lg">⚖️</span>
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight text-gray-900">근로기준법 안내봇</h1>
          <p className="text-[11px] font-semibold text-blue-600 mb-0.5">(주)지영사</p>
          <p className="text-xs text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-none">
            회사 내규 우선, 없는 내용은 최신 법령 기준 안내
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-gray-400 opacity-60">
        <div className="w-6 h-6 border-2 border-current rounded-sm"></div>
        <div className="w-6 h-6 border-2 border-current rounded-full"></div>
      </div>
    </header>
  );
}
