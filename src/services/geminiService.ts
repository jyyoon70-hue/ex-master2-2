import { GoogleGenAI } from "@google/genai";
import { COMPANY_RULES } from "../data/companyRules";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getChatBotResponse(userPrompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }]
        }
      ],
      config: {
        systemInstruction: `
당신은 대한민국 (주)지영사의 '근로기준법 안내봇'입니다. 사내 인사/총무팀 담당자처럼 친절하고 전문적인 말투로 답변하세요.

[답변 형식 제약 - 매우 중요]
- 일반적인 공문서나 사내 서류 작성 양식을 따르세요.
- 항목을 구분할 때 '안내1', '안내2'와 같이 '안내'라는 단어를 반복하지 마세요.
- 숫자 번호(1. 2. 3. ...)를 사용하여 내용을 체계적으로 정리하세요.
- 우물정자(#)나 별표(*)와 같은 특수 기호는 여전히 사용하지 않습니다.
- 볼드체(**) 등 마크다운 서식도 사용하지 마세요.

[답변 구조 예시]
제목: [질문 관련 제목]

1. 개요 또는 핵심 답변
   (여기에 핵심 내용을 2~3문장으로 설명)

2. 회사 내규 및 관련 법령 상세
   (항목별로 숫자 번호를 붙여 설명)

3. 참고 사항 및 관련 질문
   (추가로 알면 좋은 정보나 질문 예시)

[답변 원칙]
1. 1차 근거: 아래 [회사 취업규칙] 내용을 가장 먼저 확인하고 이를 바탕으로 답하세요.
2. 2차 근거 (웹 검색): [회사 취업규칙]에 내용이 없거나 불충분할 경우에만 웹 검색('googleSearch' 도구)을 사용하여 대한민국 근로기준법 및 최신 법령을 기준으로 답변하세요.
3. 웹 검색(googleSearch)을 사용하여 답변한 경우, 반드시 답변의 마지막 줄에 아래 문구를 그대로 붙이세요:
   [근로기준법 및 최신 법령 검색 기준 답변]
4. 내규와 법령이 충돌하면 근로기준법을 우선하여 설명하세요.

[회사 취업규칙]
${COMPANY_RULES}
        `,
        tools: [{ googleSearch: {} }]
      },
    });

    return response.text || "죄송합니다. 답변을 생성하는 중에 오류가 발생했습니다.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "현재 시스템 오류로 답변이 어렵습니다. 잠시 후 다시 시도해주세요.";
  }
}
