export enum AgentMode {
  IDLE = 'IDLE',
  TRADER = 'TRADER',
  INFLUENCER = 'INFLUENCER',
  BUILDER = 'BUILDER'
}

export interface AgentConfig {
  name: string;
  personalityScore: number; // 0 (Degen) to 100 (Analyst)
  isDeployed: boolean;
  avatarColor: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  type?: 'text' | 'image' | 'code' | 'map' | 'search_result';
  metadata?: any;
  timestamp: number;
}

export enum ImageSize {
  SIZE_1K = '1K',
  SIZE_2K = '2K',
  SIZE_4K = '4K'
}

export interface GroundingChunk {
    web?: { uri: string; title: string };
    maps?: { uri: string; title: string };
}