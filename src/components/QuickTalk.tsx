interface QuickTalkProps {
  onSelect: (text: string) => void;
  disabled?: boolean;
}

const QUESTIONS = [
  "연차는 몇 일인가요?",
  "수습기간에도 동일한 권리가 있나요?",
  "연장근로는 몇 시간까지 가능한가요?",
  "해고 예고는 어떻게 되나요?",
  "퇴직금은 어떻게 계산되나요?",
  "직장 내 괴롭힘 신고는 어떻게 하나요?",
];

export default function QuickTalk({ onSelect, disabled }: QuickTalkProps) {
  return (
    <div className="px-6 py-4 flex flex-wrap gap-2" style={{ backgroundColor: '#d1e7dd' }}>
      {QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => !disabled && onSelect(q)}
          disabled={disabled}
          className={`
            bg-white border border-[#fee500] text-[12px] px-4 py-2 rounded-full 
            shadow-sm transition-all hover:bg-[#fee500] active:scale-95
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {q}
        </button>
      ))}
    </div>
  );
}
