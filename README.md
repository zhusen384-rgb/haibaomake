# 智能海报生成器 - 技术文档

## 1. 项目概述
这是一个专为商超、零售行业设计的智能海报生成工具。它利用 AI 技术简化了海报制作流程，特别针对中老年用户群体优化了交互体验（如语音输入、拍照识别）。

## 2. 技术栈
- **前端框架**: React 18 + Vite
- **样式处理**: Tailwind CSS (原子化 CSS)
- **动画库**: Framer Motion (用于平滑的 UI 交互)
- **AI 模型**: Google Gemini 3 (Flash/Pro) - 处理文案生成与图像识别
- **图标库**: Lucide React
- **海报导出**: html2canvas (将 DOM 节点转换为图片)

## 3. 整体架构
项目采用 **纯客户端架构 (Client-side Only)**。所有的 AI 调用、图片处理和海报渲染均在浏览器端完成，无需后端服务器。

- **UI 层**: 基于 React 的响应式设计，适配手机与电脑。
- **逻辑层**: 处理图片上传、状态管理、语音识别逻辑。
- **服务层**: 封装与 Gemini API 的交互。
- **渲染层**: 动态生成海报 DOM 结构，并支持导出为 PNG。

## 4. 核心文件说明

### 根目录
- **`metadata.json`**: 
  - 定义应用名称、描述。
  - 配置 `requestFramePermissions`: `["camera"]`，用于开启手机摄像头权限。
- **`package.json`**: 
  - 管理项目依赖（如 `@google/genai`, `html2canvas`, `motion` 等）。

### `src/` 目录
- **`App.tsx` (核心)**:
  - **状态管理**: 管理商品列表、海报风格、文案输入等。
  - **组件逻辑**: 包含图片上传 (`handleImageUpload`)、拍照识别 (`handleCameraCapture`)、海报下载 (`downloadPoster`)。
  - **UI 渲染**: 负责海报预览区域和操作面板的布局。
  - **语音输入**: 集成了 `VoiceInputButton` 组件，调用 Web Speech API。
- **`services/geminiService.ts`**:
  - **`generateSlogan`**: 调用 Gemini API 生成吸引人的社群营销文案。
  - **`recognizeProduct`**: 调用 Gemini Vision 能力，识别用户拍摄的商品图片并返回名称。
- **`index.css`**:
  - 引入 Tailwind CSS。
  - 定义全局主题色（如 `orange-500`）和自定义滚动条样式。
- **`main.tsx`**:
  - 应用程序的入口文件，挂载 React 根节点。

## 5. 关键功能实现原理

### 5.1 拍照识别 (AI Vision)
用户通过摄像头拍摄照片后，图片被转换为 Base64 编码发送给 Gemini 模型。模型通过提示词（Prompt）分析图片中的主体，并直接返回简洁的商品名称。

### 5.2 语音输入 (Web Speech API)
利用浏览器原生的 `window.SpeechRecognition` 接口。点击麦克风后，浏览器监听音频并实时转换为文字，自动填充到对应的输入框中。

### 5.3 海报导出
使用 `html2canvas` 库对海报预览区域的 DOM 节点进行截图。通过设置 `scale: 3` 确保导出的图片清晰度足以用于打印或分享。

## 6. 环境配置
本地部署时，需在根目录创建 `.env` 文件并配置：
```env
GEMINI_API_KEY=你的_GEMINI_API_密钥
```

## 7. 部署建议
- **HTTPS**: 由于涉及摄像头和语音 API，生产环境必须使用 HTTPS 协议，否则浏览器会禁用这些功能。
- **浏览器兼容性**: 建议使用最新版的 Chrome、Safari 或微信内置浏览器。
