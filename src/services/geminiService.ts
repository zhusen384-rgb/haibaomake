import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSlogan(itemName: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你是一个顶尖的社区营销专家，非常擅长为中老年群体创作亲切、实惠且易懂的宣传语。
请为商品 "${itemName}" 创作一段极具吸引力的宣传文案。
要求：
1. 语气亲切、接地气，像邻居在打招呼一样，突出“新鲜”、“实惠”、“健康”或“方便”。
2. 适当加入一些温馨的表情符号（Emoji），增加亲和力。
3. 字数控制在30-50字左右，比短句稍微丰富一点，但要通俗易懂。
4. 适合发在社区微信群或印在超市海报上。
5. 直接返回文案内容，不要有任何多余的解释。`,
    });
    return response.text || "生成失败，请稍后重试。";
  } catch (error) {
    console.error("Error generating slogan:", error);
    return "文案生成出错，请检查网络或配置。";
  }
}
