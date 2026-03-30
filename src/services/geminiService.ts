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
    : `你是一个顶尖的社区营销专家，非常擅长教导店员如何用最亲切、自然的方式向中老年顾客【口头推荐】商品。
请为商品 "${itemName}" 创作一段极具吸引力的【日常口述】推荐词。
要求：
1. 语言绝对口语化，像平常聊天一样自然，不要有书面语。
2. 重点突出“今天刚到”、“我特意给您留的”、“家里孩子爱吃”等情感连接点。
3. 字数控制在20-40字左右，简洁有力，不要让顾客觉得在背台词。
4. 不要包含任何表情符号（Emoji），因为这是用来口头表达的。
5. 直接返回推荐词内容，不要有任何多余的解释。`;

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
