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
        scale: 3, // Increased scale for higher quality
        backgroundColor: null,
      });
      const link = document.createElement('a');
      link.download = `poster-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const getGridCols = (total: number) => {
    if (total <= 1) return 1;
    if (total === 2 || total === 4) return 2;
    return 3;
  };

  const renderItems = () => {
    if (items.length === 0) {
      return (
        <div className="col-span-full flex flex-col items-center justify-center text-stone-300 py-20">
          <ImageIcon size={48} className="animate-pulse" />
          <p className="mt-2 text-sm font-bold">请添加商品</p>
        </div>
      );
    }

    return items.map((item) => {
      return (
        <div 
          key={item.id} 
          className="w-full"
        >
          {/* Style-specific Item Content */}
          {posterStyle === 'supermarket' && (
            <div className="bg-white rounded-xl overflow-hidden flex flex-col shadow-sm border-2 border-red-500 group relative">
              <div className="aspect-square relative overflow-hidden">
                <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
              </div>
              <div className="p-2 flex flex-col items-center gap-1 bg-[#FFFBEB]">
                <p className="text-[11px] font-black text-red-700 leading-tight line-clamp-1 text-center">
                  {item.name || '精选优选'}
                </p>
                <div className="bg-yellow-400 text-red-700 px-3 py-0.5 rounded-full font-black flex items-baseline gap-0.5">
                  <span className="text-[10px]">¥</span>
                  <span className="text-lg leading-none">{item.price || '0'}</span>
                </div>
              </div>
            </div>
          )}

          {posterStyle === 'classic' && (
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-100 group relative">
              <div className="aspect-square relative overflow-hidden bg-white">
                <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              </div>
              <div className="p-2 text-center flex flex-col gap-1 bg-blue-50/50">
                <h4 className="text-[11px] font-bold text-blue-900 truncate">{item.name || '生活美学'}</h4>
                <div className="text-blue-700 font-black flex items-baseline justify-center gap-0.5">
                  <span className="text-[10px]">¥</span>
                  <span className="text-lg leading-none">{item.price || '0'}</span>
                </div>
              </div>
            </div>
          )}

          {posterStyle === 'festive' && (
            <div className="bg-[#8B0000] rounded-xl overflow-hidden border-2 border-yellow-500 flex flex-col items-center text-center shadow-md group relative">
              <div className="w-full aspect-square relative overflow-hidden">
                <img src={item.url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
              </div>
              <div className="w-full p-2 flex flex-col items-center gap-1 bg-yellow-500/5">
                <p className="text-[10px] font-bold text-yellow-100 truncate">{item.name || '福礼'}</p>
                <div className="bg-yellow-400 text-red-900 px-3 py-0.5 rounded-full font-black flex items-baseline gap-0.5">
                  <span className="text-[10px]">¥</span>
                  <span className="text-xl leading-none">{item.price || '0'}</span>
                </div>
              </div>
            </div>
          )}

          {posterStyle === 'fresh' && (
            <div className="flex flex-col group relative rounded-2xl overflow-hidden border-2 border-green-500 bg-white">
              <div className="aspect-square relative overflow-hidden bg-white">
                <img src={item.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              </div>
              <div className="p-2 flex flex-col items-center gap-1">
                <p className="text-[11px] font-bold text-green-800 truncate text-center">{item.name || '生鲜'}</p>
                <div className="text-green-600 font-black flex items-baseline gap-0.5">
                  <span className="text-[10px]">¥</span>
                  <span className="text-lg leading-none">{item.price || '0'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
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
                
                <div className="bg-stone-300 p-6 sm:p-10 rounded-[3rem] shadow-2xl flex justify-center overflow-hidden relative">
                  {/* Decorative background elements */}
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl" />
                  </div>

                  <div 
                    ref={posterRef}
                    className={cn(
                      "w-[340px] min-h-[480px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative flex flex-col transition-all duration-500",
                      posterStyle === 'classic' && "bg-white",
                      posterStyle === 'festive' && "bg-[#991B1B]",
                      posterStyle === 'fresh' && "bg-[#F0FDF4]",
                      posterStyle === 'supermarket' && "bg-[#FEF9C3]"
                    )}
                  >
                    {/* Common Texture Overlay */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] z-50" />
                    
                    {/* Supermarket Style (Elderly Friendly) */}
                    {posterStyle === 'supermarket' && (
                      <div className="h-full flex flex-col bg-[#FEF9C3]">
                        <div className="bg-red-600 text-white p-5 text-center border-b-[6px] border-yellow-400 shadow-lg relative overflow-hidden">
                          <h2 className="text-4xl font-black tracking-tighter mb-1 drop-shadow-md">今日特价</h2>
                          <div className="flex items-center justify-center gap-2">
                            <div className="h-[2px] w-8 bg-yellow-400" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-200">Fresh & Quality</p>
                            <div className="h-[2px] w-8 bg-yellow-400" />
                          </div>
                        </div>
                        
                        <div className={cn(
                          "flex-1 p-4 grid gap-3 content-start overflow-y-auto custom-scrollbar relative",
                          getGridCols(items.length) === 1 ? "grid-cols-1" : 
                          getGridCols(items.length) === 2 ? "grid-cols-2" : "grid-cols-3"
                        )}>
                          {renderItems()}
                        </div>
                        
                        <div className="bg-red-600 text-white py-3 px-5 flex justify-between items-center border-t-2 border-yellow-400/30">
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black tracking-wider">早市直供 · 产地直发</span>
                            <span className="text-[8px] opacity-70">新鲜品质 每天为您留好货</span>
                          </div>
                          <div className="flex gap-1.5">
                            <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-inner" />
                            <div className="w-4 h-4 bg-orange-100 rounded-full shadow-inner" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Classic Style (Compact Grid) */}
                    {posterStyle === 'classic' && (
                      <div className="h-full flex flex-col bg-white">
                        <div className="p-6 pb-4 bg-blue-600 text-white relative overflow-hidden">
                          {/* Decorative elements */}
                          <div className="absolute top-0 right-0 w-32 h-full bg-blue-700 skew-x-12 translate-x-16" />
                          
                          <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-4 h-[1px] bg-blue-200" />
                              <span className="text-[9px] font-black tracking-[0.3em] uppercase text-blue-200">Premium Selection</span>
                            </div>
                            <h2 className="text-3xl font-black tracking-tight">今日特惠清单</h2>
                            <p className="text-[10px] font-medium opacity-80 mt-1 italic">Quality you can trust, prices you'll love</p>
                          </div>
                        </div>

                        <div className={cn(
                          "flex-1 p-4 grid gap-3 content-start overflow-y-auto custom-scrollbar relative",
                          getGridCols(items.length) === 1 ? "grid-cols-1" : 
                          getGridCols(items.length) === 2 ? "grid-cols-2" : "grid-cols-3"
                        )}>
                          {renderItems()}
                          {/* Subtle texture */}
                          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                        </div>

                        <div className="p-4 py-3 bg-blue-50 flex items-center justify-between border-t border-blue-100">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest tracking-[0.2em]">Authentic Quality</p>
                          </div>
                          <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 bg-blue-300 rounded-full" />
                            <div className="w-1.5 h-1.5 bg-blue-200 rounded-full" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Festive Style (Traditional Joy) */}
                    {posterStyle === 'festive' && (
                      <div className="h-full flex flex-col relative">
                        <div className="bg-[#B22222] text-yellow-400 p-6 text-center relative overflow-hidden shadow-lg border-b border-yellow-600/30">
                          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/exclusive-paper.png')]" />
                          <h2 className="text-4xl font-black tracking-[0.15em] relative z-10">惠民大集</h2>
                          <p className="text-[10px] font-bold mt-2 relative z-10 bg-yellow-400 text-[#B22222] inline-block px-4 py-0.5 rounded-full uppercase tracking-widest">Joy & Prosperity</p>
                        </div>
                        
                        <div className={cn(
                          "flex-1 p-4 grid gap-3 content-start overflow-y-auto custom-scrollbar relative",
                          getGridCols(items.length) === 1 ? "grid-cols-1" : 
                          getGridCols(items.length) === 2 ? "grid-cols-2" : "grid-cols-3"
                        )}>
                          {renderItems()}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[100px] font-black text-yellow-400/5 pointer-events-none select-none">
                            福
                          </div>
                        </div>
                        
                        <div className="bg-[#B22222] py-3 px-6 flex justify-between items-center border-t border-yellow-600/30">
                          <p className="text-[10px] font-black text-yellow-500/80 uppercase tracking-widest">Quality Selection</p>
                          <div className="flex gap-1.5">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="w-1.5 h-1.5 bg-yellow-500/40 rounded-full" />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fresh Style (Organic Nature) */}
                    {posterStyle === 'fresh' && (
                      <div className="h-full flex flex-col relative">
                        <div className="bg-green-600 text-white p-6 flex justify-between items-center shadow-md relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                          <div className="relative z-10">
                            <h2 className="text-3xl font-black leading-none tracking-tight">新鲜到家</h2>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="h-[1px] w-4 bg-white/40" />
                              <p className="text-[9px] font-bold opacity-80 uppercase tracking-[0.2em]">Natural & Healthy</p>
                            </div>
                          </div>
                          <div className="relative z-10 w-12 h-12 rounded-full border border-white/30 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm">
                            <span className="text-[8px] font-black leading-none opacity-60">优选</span>
                            <span className="text-[12px] font-black leading-none mt-0.5">100%</span>
                          </div>
                        </div>
                        
                        <div className={cn(
                          "flex-1 p-4 grid gap-3 content-start overflow-y-auto custom-scrollbar relative",
                          getGridCols(items.length) === 1 ? "grid-cols-1" : 
                          getGridCols(items.length) === 2 ? "grid-cols-2" : "grid-cols-3"
                        )}>
                          {renderItems()}
                        </div>
                        
                        <div className="p-4 bg-green-50/80 backdrop-blur-md border-t border-green-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span className="text-[10px] font-bold text-green-800/40 uppercase tracking-widest">Freshness Guaranteed</span>
                          </div>
                          <Sparkles size={16} className="text-green-400" />
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
                    : "输入商品名称，AI 为您提供该商品的营养价值、特点及推荐做法。"}
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
                    <Sparkles size={18} />
                    产品百科 (特点/做法)
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
