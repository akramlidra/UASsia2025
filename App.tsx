import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatState } from './types';
import { sendMessageToGemini } from './services/geminiService';
import Sidebar from './components/Sidebar';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { Content } from '@google/genai';

const App: React.FC = () => {
  const [state, setState] = useState<ChatState>({
    messages: [
      {
        id: '1',
        role: 'model',
        content: 'Halo! Saya Hospital Management Assistant. Saya dapat membantu Anda mengelola jadwal staf, informasi medis, akuntansi, data pasien, dan janji temu. Ada yang bisa saya bantu hari ini?',
        timestamp: new Date()
      }
    ],
    isLoading: false,
    activeTool: null
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, state.activeTool]);

  const handleSendMessage = async (text: string) => {
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newUserMsg],
      isLoading: true
    }));

    // Convert internal message format to Gemini 'Content' format for history
    const history: Content[] = state.messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));
    
    // Add current message to history for the call
    // Note: In real production, sendMessage handles current message separately from history, 
    // but here we just pass the accumulation minus the very last one we just added locally, 
    // or just pass history as context. `sendMessageToGemini` takes history.
    
    try {
      const response = await sendMessageToGemini(
        history, 
        text, 
        (toolName) => setState(prev => ({ ...prev, activeTool: toolName }))
      );

      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text,
        toolName: response.toolUsed,
        toolResult: response.toolResult,
        timestamp: new Date()
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, newAiMsg],
        isLoading: false,
        activeTool: null
      }));

    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Maaf, terjadi kesalahan pada server. Silakan coba lagi.",
        timestamp: new Date()
      };
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMsg],
        isLoading: false,
        activeTool: null
      }));
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full relative">
        {/* Header (Mobile Only) */}
        <div className="md:hidden p-4 bg-slate-900 text-white flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h1 className="font-bold">MediCore AI</h1>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth"
        >
          <div className="max-w-4xl mx-auto">
            {state.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {/* Loading / Tool Active Indicator */}
            {state.isLoading && (
              <div className="flex w-full justify-start mb-6 animate-pulse">
                 <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
                        <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 014.25 2h11.5A2.25 2.25 0 0118 4.25v8.5A2.25 2.25 0 0115.75 15h-3.105a3.501 3.501 0 001.1 1.677A.75.75 0 0113.26 18H6.74a.75.75 0 01-.484-1.323A3.501 3.501 0 007.355 15H4.25A2.25 2.25 0 012 12.75v-8.5zm9.25 4a.75.75 0 000-1.5h-4.5a.75.75 0 000 1.5h4.5z" clipRule="evenodd" />
                      </svg>
                   </div>
                   <div className="flex flex-col gap-2">
                      <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          {state.activeTool ? (
                            <>
                              <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                              </span>
                              <span>Accessing module: <strong>{state.activeTool.replace(/_/g, ' ')}</strong>...</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </>
                          )}
                        </div>
                      </div>
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSendMessage} disabled={state.isLoading} />
      </main>
    </div>
  );
};

export default App;