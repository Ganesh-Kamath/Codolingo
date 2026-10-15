/**
 * Codolingo Secure OpenAI Server-Side Curriculum Authoring Service
 * 
 * SECURITY RULES:
 * 1. Strictly server-side (Node.js runtime only). NEVER imported by browser or Vite client.
 * 2. Loads OPENAI_API_KEY from root .env. Never log or leak keys.
 * 3. Supports configurable OPENAI_MODEL (defaults to 'gpt-4o-mini').
 * 4. Input validation, timeouts, request size limits, and schema validation.
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// Load environment variables from root .env safely
function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const DEFAULT_MODEL = 'gpt-4o-mini';
const MAX_INPUT_CHARS = 50000;
const TIMEOUT_MS = 30000;

class OpenAIAuthoringService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
    if (this.model === 'YOUR_SUPPORTED_MODEL' || !this.model.trim()) {
      this.model = DEFAULT_MODEL;
    }
    this.client = null;
  }

  isConfigured() {
    return Boolean(
      this.apiKey &&
      this.apiKey.trim() !== '' &&
      !this.apiKey.includes('YOUR_NEW_ROTATED_API_KEY_HERE') &&
      !this.apiKey.includes('placeholder')
    );
  }

  getClient() {
    if (!this.isConfigured()) {
      throw new Error(
        'OpenAI API key is not configured. Please set a valid OPENAI_API_KEY in your local .env file. ' +
        'Ensure the key has been newly rotated and never committed to git.'
      );
    }
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
        timeout: TIMEOUT_MS
      });
    }
    return this.client;
  }

  /**
   * Generates a pedagogical overhaul for a lesson or exercise
   * Returns structured improvements: learning objectives, mental model, progressive hints, refined explanation.
   */
  async improveExercise(exerciseData) {
    if (!exerciseData || typeof exerciseData !== 'object') {
      throw new Error('Invalid exerciseData: must be an object.');
    }

    const payloadStr = JSON.stringify(exerciseData);
    if (payloadStr.length > MAX_INPUT_CHARS) {
      throw new Error(`Exercise payload exceeds maximum permitted size of ${MAX_INPUT_CHARS} characters.`);
    }

    if (!this.isConfigured()) {
      return {
        success: false,
        isConfigured: false,
        message: 'OpenAI API key is placeholder or unconfigured in .env.',
        instructions: 'Add your rotated OPENAI_API_KEY to .env to enable live AI-assisted curriculum authoring.'
      };
    }

    const client = this.getClient();

    const systemPrompt = `You are a Senior Python Educator, Learning Scientist, and Curriculum Architect for Codolingo.
Your role is to overhaul lesson content to maximize genuine understanding and mental models.

CORE RULES:
1. Mental Models: Explain what Python actually does in memory/execution. Use accurate physical or computational models.
2. Progressive Hints Ladder:
   - Hint 1: Concept Recall (remind the learner of the rule or concept).
   - Hint 2: Narrow the Next Step (guide where to start or look).
   - Hint 3: Structural Clue (pattern or syntax clue WITHOUT completing the entire task).
   NEVER write the complete solution code in any hint.
3. Reject generic filler: Do NOT write "Mastering these rules prevents runtime errors..." or interchangeable phrases.
4. Accurate execution order: Show cause and effect.
5. Misconception handling: Explain *why* incorrect answers happen and how Python actually interprets them.

Output MUST be valid JSON adhering to this schema:
{
  "learning_objective": string,
  "mental_model": string,
  "improved_explanation": string,
  "progressive_hints": [string, string, string],
  "common_mistake_explanation": string,
  "worked_example_trace": string | null
}`;

    const userPrompt = `Review and improve the following Python curriculum exercise:
${JSON.stringify({
  id: exerciseData.id,
  type: exerciseData.type || exerciseData.question_type,
  concept: exerciseData.concept,
  prompt: exerciseData.prompt,
  current_explanation: exerciseData.explanation,
  current_hint: exerciseData.hint,
  options: exerciseData.options,
  correct_answer: exerciseData.correct_answer,
  starter_code: exerciseData.starter_code,
  solution_code: exerciseData.solution_code,
  misconception_tag: exerciseData.misconception_tag || exerciseData.misconceptionTag
}, null, 2)}`;

    try {
      const response = await client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Received empty response from OpenAI model.');
      }

      const parsed = JSON.parse(content);
      return {
        success: true,
        isConfigured: true,
        modelUsed: this.model,
        data: parsed
      };
    } catch (err) {
      // Do not log authorization headers or private key
      const safeErrorMsg = err.message ? err.message.replace(/sk-[a-zA-Z0-9_-]+/g, '[REDACTED]') : 'Unknown error';
      return {
        success: false,
        isConfigured: true,
        error: safeErrorMsg
      };
    }
  }
}

module.exports = {
  OpenAIAuthoringService,
  loadEnv
};
