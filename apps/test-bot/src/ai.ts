import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { configureAI } from '@commandkit/ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const model = google.languageModel('gemini-2.0-flash');

configureAI({
  selectAiModel: async () => {
    return {
      model,
    };
  },
});
