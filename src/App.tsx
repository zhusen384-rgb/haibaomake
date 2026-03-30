/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, 
  Type, 
  Tag, 
  Download, 
  Check,
  Sparkles, 
  Upload, 
  X,
  RefreshCw,
  Layout,
  MessageSquareQuote
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { generateSlogan } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'poster' | 'slogan';

interface PosterItem {
  id: string;
  url: string;
  name: string;
  price: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('poster');
  const [items, setItems] = useState<PosterItem[]>([]);
  const [sloganInput, setSloganInput] = useState('');
  const [slogan, setSlogan] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Poster Generator State
  const [posterStyle, setPosterStyle] = useState<'supermarket' | 'classic' | 'festive' | 'fresh'>('supermarket');
  const [sloganScenario, setSloganScenario] = useState<'group' | 'oral'>('group');
  const [copied, setCopied] = useState(false);

  const handleCopySlogan = () => {
    if (slogan) {
      navigator.clipboard.writeText(slogan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileList = Array.from(files) as File[];
      
      fileList.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setItems(prev => {
            if (prev.length >= 20) return prev;
            return [...prev, {
              id: Math.random().toString(36).substr(2, 9),
              url: reader.result as string,
              name: '',
              price: ''
            }];
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const updateItem = (id: string, field: 'name' | 'price', value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const downloadPoster = async () => {
    if (posterRef.current) {
      const canvas = await html2canvas(posterRef.current, {
        useCORS: true,
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `poster-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleGenerateSlogan = async () => {
    if (!sloganInput) return;
    setIsGenerating(true);
    const result = await generateSlogan(sloganInput, sloganScenario);
    setSlogan(result);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#1C1917] font-sans selection:bg-orange-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">智能海报助手</h1>
          </div>
          <nav className="flex gap-1 bg-stone-100 p-1 rounded-full">
            <button
              onClick={() => setActiveTab('poster')}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeTab === 'poster' ? "bg-white text-orange-600 shadow-sm" : "text-stone-500 hover:text-stone-800"
              )}
            >
              海报生成
            </button>
            <button
              onClick={() => setActiveTab('slogan')}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                activeTab === 'slogan' ? "bg-white text-orange-600 shadow-sm" : "text-stone-500 hover:text-stone-800"
              )}
            >
              文案助手
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'poster' ? (
            <motion.div
              key="poster"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-12 items-start"
            >
              {/* Controls */}
              <div className="space-y-8">
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Layout className="text-orange-500" />
                    海报配置
                  </h2>
                  <p className="text-stone-500">上传图片并填写信息，我们将为您生成精美的商超海报。</p>
                </section>

                <div className="space-y-6">
                  {/* Image Upload & Item List */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-stone-700">商品列表 (最多20个)</label>
                      <span className="text-xs text-stone-400">{items.length}/20</span>
                    </div>
                    
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      <AnimatePresence>
                        {items.map((item, idx) => (
                          <motion.div 
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-4 relative group"
                          >
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <X size={14} />
                            </button>
                            
                            <div className="flex gap-4">
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                <img src={item.url} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 grid grid-cols-1 gap-3">
                                <div className="relative">
                                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                    placeholder="商品名称"
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                                  />
                                </div>
                                <div className="relative">
                                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                                  <input
                                    type="text"
                                    value={item.price}
                                    onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                    placeholder="价格"
                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      
                      {items.length < 20 && (
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-8 rounded-2xl border-2 border-dashed border-stone-300 bg-white flex flex-col items-center justify-center hover:border-orange-400 hover:bg-orange-50 transition-all group"
                        >
                          <Upload className="text-stone-400 group-hover:text-orange-500 transition-colors" size={24} />
                          <span className="text-sm font-bold text-stone-400 group-hover:text-orange-500 mt-2">批量添加商品图片</span>
                        </button>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      accept="image/*" 
                      multiple
                    />
                  </div>

                  {/* Style Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-stone-700">海报风格 (专为长辈设计)</label>
                    <div className="flex flex-wrap gap-3">
                      {(['supermarket', 'classic', 'festive', 'fresh'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => setPosterStyle(style)}
                          className={cn(
                            "flex-1 min-w-[80px] py-2 px-4 rounded-xl border text-sm font-medium transition-all capitalize",
                            posterStyle === style 
                              ? "bg-orange-50 border-orange-200 text-orange-600 ring-1 ring-orange-200" 
                              : "bg-white border-stone-200 text-stone-500 hover:border-stone-300"
                          )}
                        >
                          {style === 'supermarket' ? '超市风' : style === 'classic' ? '清晰大字' : style === 'festive' ? '喜庆红' : '清新绿'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={downloadPoster}
                    disabled={items.length === 0}
                    className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98]"
                  >
                    <Download size={20} />
                    下载海报
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="sticky top-28 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400">实时预览</h3>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                </div>
                
                <div className="bg-stone-200 p-8 rounded-[2rem] shadow-inner flex justify-center">
                  <div 
                    ref={posterRef}
                    className={cn(
                      "w-[320px] min-h-[450px] bg-white shadow-2xl overflow-hidden relative flex flex-col",
                      posterStyle === 'classic' && "p-4 bg-white",
                      posterStyle === 'festive' && "p-0 bg-red-700",
                      posterStyle === 'fresh' && "p-0 bg-green-50",
                      posterStyle === 'supermarket' && "p-0 bg-yellow-50"
                    )}
                  >
                    {/* Supermarket Style (Elderly Friendly) */}
                    {posterStyle === 'supermarket' && (
                      <div className="h-full flex flex-col">
                        <div className="bg-red-600 text-white p-4 text-center border-b-4 border-yellow-400 shadow-md">
                          <h2 className="text-3xl font-black tracking-widest mb-1">今日特价</h2>
                          <p className="text-xs font-bold opacity-90 tracking-widest">新鲜 · 便宜 · 实惠</p>
                        </div>
                        
                        <div className={cn(
                          "flex-1 p-2 flex flex-wrap gap-2 justify-center content-start",
                        )}>
                          {items.length > 0 ? (
                            items.map((item) => (
                              <div key={item.id} className={cn(
                                "bg-white border-2 border-red-100 rounded-lg overflow-hidden flex flex-col shadow-sm",
                                items.length <= 1 ? "w-full" : 
                                items.length <= 4 ? "w-[calc(50%-4px)]" : 
                                items.length <= 9 ? "w-[calc(33.33%-6px)]" : 
                                "w-[calc(25%-6px)]"
                              )}>
                                <div className="aspect-square bg-stone-50 relative">
                                  <img src={item.url} className="w-full h-full object-cover" />
                                  {item.price && (
                                    <div className="absolute top-0 right-0 bg-red-600 text-white px-1.5 py-0.5 text-[10px] font-black rounded-bl-lg">
                                      特价
                                    </div>
                                  )}
                                </div>
                                <div className="p-1.5 flex flex-col justify-between flex-1">
                                  <p className="text-[11px] font-bold text-stone-800 leading-tight line-clamp-2 mb-1">
                                    {item.name || '特惠商品'}
                                  </p>
                                  <div className="flex items-baseline gap-0.5">
                                    <span className="text-[10px] font-black text-red-600">¥</span>
                                    <span className="text-lg font-black text-red-600 leading-none">
                                      {item.price || '0'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full flex flex-col items-center justify-center text-stone-300 py-20">
                              <ImageIcon size={48} />
                              <p className="mt-2 text-sm font-bold">请添加商品</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-red-600 text-white py-2 px-4 flex justify-between items-center">
                          <span className="text-[10px] font-bold">早市直供 · 产地直发</span>
                          <div className="flex gap-1">
                            <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                            <div className="w-3 h-3 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Classic Style (Clear & Large Font) */}
                    {posterStyle === 'classic' && (
                      <div className="h-full flex flex-col border-4 border-stone-800 p-2">
                        <div className="text-center py-4 border-b-2 border-stone-800 mb-4">
                          <h2 className="text-4xl font-black text-stone-900">商品价目表</h2>
                          <p className="text-sm font-bold text-stone-500 mt-1 tracking-[0.2em]">品质生活 · 放心选购</p>
                        </div>
                        <div className={cn(
                          "flex-1 flex flex-wrap gap-4 justify-center content-start",
                        )}>
                          {items.map((item) => (
                            <div key={item.id} className={cn(
                              "flex gap-3 items-center p-2 border-b border-stone-100",
                              items.length <= 2 ? "w-full" : "w-[calc(50%-8px)]"
                            )}>
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-50 flex-shrink-0 border border-stone-200">
                                <img src={item.url} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-black text-stone-900 leading-tight">{item.name || '商品名称'}</p>
                                <p className="text-xl font-black text-red-600 mt-1">¥{item.price || '0'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-2 border-t-2 border-stone-800 text-center">
                          <p className="text-[10px] font-bold text-stone-400">价格以店内实际为准</p>
                        </div>
                      </div>
                    )}

                    {/* Festive Style (Traditional Red) */}
                    {posterStyle === 'festive' && (
                      <div className="h-full flex flex-col">
                        <div className="bg-yellow-400 text-red-700 p-4 text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="grid grid-cols-4 gap-4 p-2">
                              {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} className="w-4 h-4 border-2 border-red-700 rounded-full" />
                              ))}
                            </div>
                          </div>
                          <h2 className="text-3xl font-black tracking-widest relative z-10">大红大紫 · 惠民</h2>
                          <p className="text-xs font-bold mt-1 relative z-10">全场惊喜价 · 错过等一年</p>
                        </div>
                        <div className={cn(
                          "flex-1 p-3 flex flex-wrap gap-3 justify-center content-start",
                        )}>
                          {items.map((item) => (
                            <div key={item.id} className={cn(
                              "bg-red-800 rounded-xl p-1 border-2 border-yellow-400 flex flex-col items-center text-center",
                              items.length <= 4 ? "w-[calc(50%-6px)]" : "w-[calc(33.33%-8px)]"
                            )}>
                              <div className="w-full aspect-square rounded-lg overflow-hidden mb-1 border border-yellow-400/30">
                                <img src={item.url} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[10px] font-bold text-yellow-100 truncate w-full px-1">{item.name || '商品'}</p>
                              <p className="text-base font-black text-yellow-400 leading-none mt-1">¥{item.price || '0'}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-yellow-400 py-1 text-center">
                          <p className="text-[10px] font-black text-red-700">老百姓自己的放心超市</p>
                        </div>
                      </div>
                    )}

                    {/* Fresh Style (Healthy Green) */}
                    {posterStyle === 'fresh' && (
                      <div className="h-full flex flex-col">
                        <div className="bg-green-600 text-white p-5 flex justify-between items-end">
                          <div>
                            <h2 className="text-2xl font-black leading-none">新鲜到家</h2>
                            <p className="text-[10px] font-bold mt-1 opacity-80 uppercase tracking-widest">Fresh & Healthy</p>
                          </div>
                          <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black">
                            100%
                          </div>
                        </div>
                        <div className={cn(
                          "flex-1 p-4 flex flex-wrap gap-4 justify-center content-start",
                        )}>
                          {items.map((item) => (
                            <div key={item.id} className={cn(
                              "flex flex-col",
                              items.length <= 4 ? "w-[calc(50%-8px)]" : "w-[calc(33.33%-11px)]"
                            )}>
                              <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-md mb-2 border-2 border-green-100">
                                <img src={item.url} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[11px] font-bold text-green-900 truncate">{item.name || '生鲜'}</p>
                              <p className="text-lg font-black text-green-600 leading-none mt-1">¥{item.price || '0'}</p>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 bg-white border-t border-green-50">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-[10px] font-bold text-stone-400">每日清晨采摘 · 部分区域送货上门</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="slogan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-12"
            >
              <section className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquareQuote size={32} />
                </div>
                <h2 className="text-4xl font-bold tracking-tight">文案助手</h2>
                <p className="text-stone-500 text-lg">
                  {sloganScenario === 'group' 
                    ? "输入商品名称，AI 为您生成亲切、实惠且带表情的社群推送文案。" 
                    : "输入商品名称，AI 为您生成自然、口语化且易于沟通的日常口述词。"}
                </p>
              </section>

              <div className="space-y-6">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setSloganScenario('group')}
                    className={cn(
                      "px-8 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2",
                      sloganScenario === 'group' 
                        ? "bg-orange-500 text-white shadow-xl shadow-orange-200 scale-105" 
                        : "bg-white border border-stone-200 text-stone-500 hover:border-stone-300"
                    )}
                  >
                    <Layout size={18} />
                    社群推送 (带表情)
                  </button>
                  <button
                    onClick={() => setSloganScenario('oral')}
                    className={cn(
                      "px-8 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2",
                      sloganScenario === 'oral' 
                        ? "bg-orange-500 text-white shadow-xl shadow-orange-200 scale-105" 
                        : "bg-white border border-stone-200 text-stone-500 hover:border-stone-300"
                    )}
                  >
                    <MessageSquareQuote size={18} />
                    日常口述 (纯文字)
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={sloganInput}
                    onChange={(e) => setSloganInput(e.target.value)}
                    placeholder="输入商品，如：新鲜草莓、洁净肥皂..."
                    className="w-full px-6 py-5 bg-white border border-stone-200 rounded-[2rem] text-lg focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all shadow-sm"
                  />
                  <button
                    onClick={handleGenerateSlogan}
                    disabled={!sloganInput || isGenerating}
                    className="absolute right-2 top-2 bottom-2 px-8 bg-stone-900 text-white rounded-[1.5rem] font-bold hover:bg-stone-800 disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    生成
                  </button>
                </div>

                <AnimatePresence>
                  {slogan && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/50 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 w-2 h-full bg-orange-500" />
                      <div className="relative z-10">
                        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mb-4">AI 生成的宣传词</p>
                        <p className="text-3xl font-bold leading-tight text-stone-800 italic">
                          "{slogan}"
                        </p>
                        <div className="mt-8 flex justify-end">
                          <button 
                            onClick={handleCopySlogan}
                            className={cn(
                              "transition-colors flex items-center gap-1 text-sm font-medium",
                              copied ? "text-green-500" : "text-stone-400 hover:text-orange-500"
                            )}
                          >
                            {copied ? <Check size={16} /> : <Download size={16} />}
                            {copied ? "复制成功" : "复制文案"}
                          </button>
                        </div>
                      </div>
                      
                      {/* Decorative elements */}
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <MessageSquareQuote size={120} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-stone-100 rounded-3xl">
                    <h4 className="font-bold mb-2 flex items-center gap-2 text-stone-700">
                      <Sparkles size={16} className="text-orange-500" />
                      创意无限
                    </h4>
                    <p className="text-sm text-stone-500">基于 Gemini 3.1 Pro 强大的语义理解能力，生成更懂消费者的文案。</p>
                  </div>
                  <div className="p-6 bg-stone-100 rounded-3xl">
                    <h4 className="font-bold mb-2 flex items-center gap-2 text-stone-700">
                      <RefreshCw size={16} className="text-orange-500" />
                      即时生成
                    </h4>
                    <p className="text-sm text-stone-500">毫秒级响应，为您提供源源不断的创作灵感。</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-stone-200 text-center">
        <p className="text-stone-400 text-sm">© 2026 智能海报助手 · 由 Google AI Studio 提供技术支持</p>
      </footer>
    </div>
  );
}
