import React, { useState, useEffect, useRef } from 'react';
import Terminal from './components/Terminal';
import AgentAvatar from './components/AgentAvatar';
import Onboarding from './components/Onboarding';
import { AgentConfig, AgentMode, ChatMessage, ImageSize } from './types';
import { WELCOME_MESSAGE } from './constants';
import * as GeminiService from './services/geminiService';

const App: React.FC = () => {
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [mode, setMode] = useState<AgentMode>(AgentMode.IDLE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [imageUpload, setImageUpload] = useState<File | null>(null);

  // Initial welcome
  useEffect(() => {
    if (config?.isDeployed) {
       addMessage(WELCOME_MESSAGE, 'system');
       // Fast handshake using Flash Lite
       GeminiService.generateFastResponse("System online. Acknowledge.").then(text => {
           // We don't necessarily show this, just warming up logic
       });
    }
  }, [config?.isDeployed]);

  const addMessage = (text: string, role: 'user' | 'agent' | 'system', type: 'text' | 'image' = 'text', metadata?: any) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role,
      text,
      type,
      metadata,
      timestamp: Date.now()
    }]);
  };

  const handleOnboardingComplete = async (name: string, personalityScore: number) => {
    setDeploying(true);
    // Simulate "Launch" effect
    setTimeout(() => {
        setConfig({
            name,
            personalityScore,
            isDeployed: true,
            avatarColor: 'cyan'
        });
        setMode(AgentMode.INFLUENCER); // Default start mode
        setDeploying(false);
    }, 2000);
  };

  const processCommand = async (input: string) => {
    if (!config) return;

    addMessage(input, 'user');
    setIsTyping(true);

    const lowerInput = input.toLowerCase();

    try {
        // 1. Image Generation Command
        if (lowerInput.startsWith('/imagine') || lowerInput.startsWith('generate image')) {
            const prompt = input.replace(/^\/imagine|generate image/i, '').trim();
            setMode(AgentMode.BUILDER);
            const base64Image = await GeminiService.generateImage(prompt, ImageSize.SIZE_1K);
            if (base64Image) {
                addMessage(`Generated image for: ${prompt}`, 'agent', 'image', { imageUrl: base64Image });
            } else {
                addMessage("Failed to generate image.", 'system');
            }
            setMode(AgentMode.IDLE);
        }
        // 2. Image Editing (if file uploaded or previous context)
        else if (imageUpload && (lowerInput.startsWith('edit') || lowerInput.includes('filter') || lowerInput.includes('remove'))) {
            setMode(AgentMode.BUILDER);
            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(imageUpload);
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                // Strip prefix
                const rawBase64 = base64.split(',')[1];
                const editedImage = await GeminiService.editImage(rawBase64, input);
                if (editedImage) {
                    addMessage("Image edited.", 'agent', 'image', { imageUrl: editedImage });
                    setImageUpload(null); // Clear upload
                } else {
                     addMessage("Could not edit image.", 'system');
                }
                setIsTyping(false);
                setMode(AgentMode.IDLE);
            }
            return; // Exit early due to async callback
        }
        // 3. Search Grounding
        else if (lowerInput.includes('news') || lowerInput.includes('price') || lowerInput.includes('search')) {
            setMode(AgentMode.TRADER);
            const response = await GeminiService.generateSearchResponse(input);
            addMessage(response.text, 'agent', 'text', { groundingChunks: response.groundingChunks });
            // TTS
            GeminiService.speakText(response.text.substring(0, 100)); // Speak first 100 chars
        }
        // 4. Maps Grounding
        else if (lowerInput.includes('where is') || lowerInput.includes('location') || lowerInput.includes('map')) {
            setMode(AgentMode.INFLUENCER);
            // Get location if possible
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const response = await GeminiService.generateMapsResponse(input, { lat: pos.coords.latitude, lng: pos.coords.longitude });
                addMessage(response.text, 'agent', 'text', { groundingChunks: response.groundingChunks });
            }, async () => {
                 // Fallback without location
                 const response = await GeminiService.generateMapsResponse(input);
                 addMessage(response.text, 'agent', 'text', { groundingChunks: response.groundingChunks });
            });
        }
        // 5. General Thinking / Chat
        else {
            setMode(config.personalityScore > 60 ? AgentMode.TRADER : AgentMode.INFLUENCER);
            // Construct context based on personality
            const context = `
                You are ${config.name}. 
                Personality Score: ${config.personalityScore}/100 (0=Chaotic/Social, 100=Analytic/Trader).
                Current Mode: ${config.personalityScore > 60 ? 'TRADER' : 'INFLUENCER'}.
                Keep responses concise and visually formatted.
            `;
            const responseText = await GeminiService.generateThinkingResponse(input, context);
            addMessage(responseText, 'agent');
        }

    } catch (error) {
        addMessage("SYSTEM ERROR: NEURAL LINK SEVERED.", 'system');
        console.error(error);
    } finally {
        setIsTyping(false);
    }
  };

  const handleImageUpload = (file: File) => {
      setImageUpload(file);
      addMessage(`[SYSTEM] Image loaded into buffer: ${file.name}. Type instruction to edit.`, 'system');
  };

  return (
    <div className={`min-h-screen text-slate-200 flex flex-col ${deploying ? 'shake-hard' : ''}`}>
      {/* HUD Header */}
      <header className="fixed top-0 w-full z-50 p-4 flex justify-between items-center bg-gradient-to-b from-black to-transparent pointer-events-none">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
            <h1 className="text-2xl font-bold tracking-[0.2em] font-mono text-cyan-400">AGENTFI</h1>
        </div>
        {config && (
            <div className="text-xs font-mono border border-slate-700 px-3 py-1 rounded bg-black/50 backdrop-blur">
                IDENTITY: {config.name} | INTEGRITY: 100%
            </div>
        )}
      </header>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 pt-20">
        
        {!config ? (
           <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
            <div className="w-full max-w-4xl h-[85vh] flex flex-col gap-4">
                {/* 3D Representation Area */}
                <div className="flex-shrink-0">
                    <AgentAvatar mode={mode} personalityScore={config.personalityScore} />
                </div>

                {/* Tribute Jar Link */}
                <div className="absolute top-20 right-4">
                    <div className="text-[10px] text-slate-500 font-mono text-right hover:text-cyan-400 cursor-pointer transition-colors border-r-2 border-slate-700 pr-2">
                        TRIBUTE JAR<br/>arewa.base.eth
                    </div>
                </div>

                {/* Terminal Area */}
                <div className="flex-1 min-h-0">
                    <Terminal 
                        messages={messages} 
                        isTyping={isTyping} 
                        onSendMessage={processCommand}
                        onUploadImage={handleImageUpload}
                    />
                </div>

                {/* Controls hints */}
                <div className="flex gap-4 justify-center text-[10px] text-slate-500 font-mono uppercase">
                    <span>Try: "Where is the best sushi nearby?" (Maps)</span>
                    <span>"Price of BTC" (Search)</span>
                    <span>"/imagine a cyberpunk city" (Gen)</span>
                </div>
            </div>
        )}
      </main>

      {/* Background Grids */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)',
          backgroundSize: '40px 40px'
      }}></div>
    </div>
  );
};

export default App;