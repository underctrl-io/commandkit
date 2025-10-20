import { configureAI } from '@commandkit/ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateImageTool } from './tools/generate-image';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const model = google.languageModel('gemini-2.0-flash');

configureAI({
  async selectAiModel() {
    return {
      model,
      tools: {
        generateImage: generateImageTool,
      },
    };
  },
  messageFilter: async (commandkit, message) => {
    return (
      !message.author.bot &&
      message.inGuild() &&
      message.mentions.users.has(message.client.user.id)
    );
  },
});
