import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { z } from 'zod';

/* ─── Zod response schema ─── */
export const IcebreakerOptionSchema = z.object({
  tone: z.enum(['professional', 'friendly', 'witty']),
  message: z.string().min(10).max(300),
});

export const IcebreakerResponseSchema = z.object({
  greeting: z.string(),
  options: z.array(IcebreakerOptionSchema).length(3),
  sharedInterests: z.array(z.string()),
});

export type IcebreakerResponse = z.infer<typeof IcebreakerResponseSchema>;

/* ─── Minimal profile shape passed to the prompt ─── */
interface ProfileSnapshot {
  firstName: string;
  lastName?: string;
  headline?: string;
  skills?: string[];
  experience?: { title?: string; company?: string }[];
  education?: { college?: string; degree?: string; fieldOfStudy?: string }[];
  location?: string;
}

@Injectable()
export class ConnectionsAiService {
  private readonly logger = new Logger(ConnectionsAiService.name);
  private genAI: GoogleGenerativeAI | null = null;

  private getClient(): GoogleGenerativeAI | null {
    if (this.genAI) return this.genAI;
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      this.logger.warn('GEMINI_API_KEY not set – icebreaker feature disabled');
      return null;
    }
    this.genAI = new GoogleGenerativeAI(key);
    return this.genAI;
  }

  /**
   * Generate three icebreaker messages to help a user start a conversation
   * with a potential connection.
   */
  async generateIcebreaker(
    sender: ProfileSnapshot,
    receiver: ProfileSnapshot,
  ): Promise<IcebreakerResponse> {
    const client = this.getClient();

    // Fallback when Gemini is not configured
    if (!client) {
      return this.buildFallback(sender, receiver);
    }

    const model = client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            greeting: { type: SchemaType.STRING },
            options: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  tone: { type: SchemaType.STRING },
                  message: { type: SchemaType.STRING },
                },
                required: ['tone', 'message'],
              },
            },
            sharedInterests: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
          required: ['greeting', 'options', 'sharedInterests'],
        },
      },
    });

    const prompt = this.buildPrompt(sender, receiver);

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      // Validate with Zod for safety
      return IcebreakerResponseSchema.parse(parsed);
    } catch (err) {
      this.logger.error('Gemini icebreaker generation failed, using fallback', err);
      return this.buildFallback(sender, receiver);
    }
  }

  /* ─── Prompt Construction ─── */
  private buildPrompt(sender: ProfileSnapshot, receiver: ProfileSnapshot): string {
    return `You are a professional networking assistant for a platform called Vibe.

Generate 3 icebreaker messages that ${sender.firstName} can send to ${receiver.firstName} to start a meaningful connection.

SENDER PROFILE:
- Name: ${sender.firstName} ${sender.lastName || ''}
- Headline: ${sender.headline || 'N/A'}
- Skills: ${sender.skills?.join(', ') || 'N/A'}
- Location: ${sender.location || 'N/A'}
- Experience: ${sender.experience?.map((e) => `${e.title} at ${e.company}`).join('; ') || 'N/A'}
- Education: ${sender.education?.map((e) => `${e.degree} in ${e.fieldOfStudy} from ${e.college}`).join('; ') || 'N/A'}

RECEIVER PROFILE:
- Name: ${receiver.firstName} ${receiver.lastName || ''}
- Headline: ${receiver.headline || 'N/A'}
- Skills: ${receiver.skills?.join(', ') || 'N/A'}
- Location: ${receiver.location || 'N/A'}
- Experience: ${receiver.experience?.map((e) => `${e.title} at ${e.company}`).join('; ') || 'N/A'}
- Education: ${receiver.education?.map((e) => `${e.degree} in ${e.fieldOfStudy} from ${e.college}`).join('; ') || 'N/A'}

RULES:
1. Each message must be 1-3 sentences.
2. Provide exactly 3 options with tones: professional, friendly, witty.
3. Identify shared interests between both profiles.
4. Include a one-line greeting that welcomes the user before the options.
5. Keep messages authentic and not overly generic.`;
  }

  /* ─── Deterministic fallback when API is unavailable ─── */
  private buildFallback(sender: ProfileSnapshot, receiver: ProfileSnapshot): IcebreakerResponse {
    const senderSkills = new Set(sender.skills?.map((s) => s.toLowerCase()) || []);
    const receiverSkills = new Set(receiver.skills?.map((s) => s.toLowerCase()) || []);
    const shared = [...senderSkills].filter((s) => receiverSkills.has(s));

    const name = receiver.firstName;
    const sharedText = shared.length > 0 ? `our shared interest in ${shared[0]}` : 'your profile';

    return {
      greeting: `Here are some ways to reach out to ${name}:`,
      options: [
        {
          tone: 'professional',
          message: `Hi ${name}, I came across your profile and was impressed by your background. I'd love to connect and explore potential synergies between our work.`,
        },
        {
          tone: 'friendly',
          message: `Hey ${name}! I noticed ${sharedText} and thought it'd be great to connect. Always nice to meet like-minded professionals!`,
        },
        {
          tone: 'witty',
          message: `Hi ${name}, they say your network is your net worth — so connecting with someone with your profile seems like a pretty solid investment! 😄`,
        },
      ],
      sharedInterests: shared.length > 0 ? shared : ['networking'],
    };
  }
}
