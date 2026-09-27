import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  firebase: {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'ai-studio-finwisedetermini-52653566-8f26-4d67-bb6c-7e7597858a15',
  },
  isProduction: process.env.NODE_ENV === 'production',
};
