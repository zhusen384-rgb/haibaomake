import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSlogan(itemName: string, scenario: 'group' | 'oral' = 'group'): Promise<string> {
  const prompt = scenario === 'group' 
    ? `你是一个顶尖的社区营销专家，非常擅长为中老年群体创作亲切、实惠且易懂的微信群宣传语。
请为商品 "${itemName}" 创作一段极具吸引力的【社群推送】文案。
要求：
1. 语气亲切、接地气，像邻居在打招呼一样，突出“新鲜”、“实惠”、“健康”或“方便”。
2. 适当加入一些温馨的表情符号（Emoji），增加视觉亲和力。
3. 字数控制在30-50字左右，适合发在社区微信群。
4. 直接返回文案内容，不要有任何多余的解释。`
    : `你是一个资深的生活百科专家和美食顾问。
请为商品 "${itemName}" 提供专业的【产品特点】和【推荐做法】。
要求：
1. 挖掘该商品的营养价值、产地优势或口感特色。
2. 提供 1-2 种简单实用的家常做法或使用窍门。
3. 语言专业且亲切，像是在为顾客提供增值咨询服务。
4. 字数控制在 80-120 字左右，内容要有干货。
5. 不要包含任何表情符号（Emoji），直接返回内容，不要有任何多余的解释。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "生成失败，请稍后重试。";
  } catch (error) {
    console.error("Error generating slogan:", error);
    return "文案生成出错，请检查网络或配置。";
  }
}
