import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface TerminalProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onUploadImage: (file: File) => void;
}

const Terminal: React.FC<TerminalProps> = ({ messages, isTyping, onSendMessage, onUploadImage }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-lg overflow-hidden font-mono shadow-2xl relative">
       {/* Scanline Overlay */}
      <div className="scanlines absolute inset-0 pointer-events-none z-10 opacity-30"></div>

      {/* Header */}
      <div className="bg-slate-950 p-2 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400">
        <span>TERMINAL_OUTPUT</span>
        <span className="animate-pulse text-green-500">● ONLINE</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-0">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-md text-sm ${
              msg.role === 'user' 
                ? 'bg-cyan-900/30 text-cyan-200 border border-cyan-800' 
                : 'bg-slate-800/80 text-emerald-200 border border-emerald-900'
            }`}>
              <div className="text-[10px] uppercase opacity-50 mb-1 font-bold">
                {msg.role === 'user' ? 'COMMAND' : 'RESPONSE'} :: {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
              
              {/* Text Content */}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Image Content */}
              {msg.type === 'image' && msg.metadata?.imageUrl && (
                <div className="mt-2 rounded overflow-hidden border border-slate-600">
                  <img src={msg.metadata.imageUrl} alt="Generated" className="max-w-full h-auto" />
                </div>
              )}

              {/* Grounding Data */}
              {msg.metadata?.groundingChunks && (
                <div className="mt-2 text-xs border-t border-slate-700 pt-2 text-slate-400">
                   <div className="font-bold mb-1">DATA SOURCES:</div>
                   <ul className="list-disc pl-4 space-y-1">
                     {msg.metadata.groundingChunks.map((chunk: any, i: number) => {
                         if (chunk.web) return <li key={i}><a href={chunk.web.uri} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate block max-w-xs">{chunk.web.title || chunk.web.uri}</a></li>;
                         if (chunk.maps) return <li key={i}><a href={chunk.maps.googleMapsUri || chunk.maps.uri} target="_blank" rel="noreferrer" className="text-red-400 hover:underline">{chunk.maps.title}</a> (Map)</li>;
                         return null;
                     })}
                   </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex items-start">
             <div className="bg-slate-800/80 text-emerald-200 border border-emerald-900 p-3 rounded-md text-sm animate-pulse">
               ANALYZING...
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 z-20">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
           {/* Image Upload Trigger */}
           <button 
             type="button" 
             onClick={() => fileInputRef.current?.click()}
             className="text-cyan-500 hover:text-cyan-400 transition-colors"
             title="Upload Image for Editing"
           >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
             </svg>
           </button>
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
             className="hidden" 
             accept="image/png, image/jpeg" 
           />

          <span className="text-cyan-500 font-bold">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-slate-600"
            placeholder="ENTER COMMAND OR CHAT..."
            autoFocus
          />
          <button type="submit" className="text-cyan-500 hover:text-cyan-300 font-bold px-2">
            [EXEC]
          </button>
        </form>
      </div>
    </div>
  );
};

export default Terminal;