/**
 * AI Assistant Controller for AI-RailLink
 * Supports both Official OpenAI API and Fast Offline Local Mock AI Engine.
 *
 * Priority:
 * 1. If AI_MOCK_MODE=true -> Instant Local Mock AI
 * 2. If AI_MOCK_MODE=false:
 *    a. Try OpenAI API if OPENAI_API_KEY is available
 *    b. Automatically fall back to Local Mock AI if OpenAI fails or key is missing
 */

const OpenAI = require('openai');
const { getMockAIResponse } = require('../services/mockAi');

// In-memory rate limiting map: { ip: [timestamp1, timestamp2, ...] }
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // Max 60 requests per minute

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

const LANGUAGE_MAP = {
  en: 'English',
  hi: 'Hindi',
  kn: 'Kannada',
  te: 'Telugu',
  english: 'English',
  hindi: 'Hindi',
  kannada: 'Kannada',
  telugu: 'Telugu',
};

/**
 * GET /api/ai/status
 * Returns current assistant operating mode (Local AI vs OpenAI)
 */
exports.getStatus = (req, res) => {
  const isMockMode = process.env.AI_MOCK_MODE === 'true';
  const hasKey = !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim());

  return res.status(200).json({
    success: true,
    mockMode: isMockMode || !hasKey,
    isLocal: isMockMode || !hasKey,
    hasOpenAIKey: hasKey,
    model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
    statusText: (isMockMode || !hasKey) ? 'Local AI • Instant Response' : 'OpenAI Active',
  });
};

/**
 * POST /api/ai/chat
 */
exports.chat = async (req, res) => {
  try {
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';

    // 1. Rate Limit Check
    if (isRateLimited(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please wait a moment before sending another message.',
      });
    }

    const { message, language = 'English', context = {} } = req.body;

    // 2. Validate Request
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'A valid message string is required.',
      });
    }

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        error: 'Message is too long. Maximum allowed length is 2000 characters.',
      });
    }

    const isMockModeActive = process.env.AI_MOCK_MODE === 'true';
    const apiKey = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.trim() : null;

    // CASE 1: AI_MOCK_MODE=true -> Instant Local Mock AI
    if (isMockModeActive) {
      const mockReply = getMockAIResponse(message, language, context);
      return res.status(200).json({
        success: true,
        reply: mockReply,
        response: mockReply,
        mode: 'local',
        isLocal: true,
      });
    }

    // CASE 2: No OpenAI API key -> Instant Local Mock AI fallback
    if (!apiKey) {
      const mockReply = getMockAIResponse(message, language, context);
      return res.status(200).json({
        success: true,
        reply: mockReply,
        response: mockReply,
        mode: 'local',
        isLocal: true,
      });
    }

    // CASE 3: AI_MOCK_MODE=false and key is present -> Try OpenAI with automatic Local AI fallback
    try {
      const normalizedLang = String(language).toLowerCase().trim();
      const targetLanguage = LANGUAGE_MAP[normalizedLang] || language || 'English';

      const trainSpeed = context.trainSpeed !== undefined ? context.trainSpeed : context.speed;
      const snr = context.snr;
      const doppler = context.doppler;
      const modulation = context.modulation || 'QPSK';
      const pilotSpacing = context.pilotSpacing;
      const ber = context.ber !== undefined ? context.ber : (context.cnnBer !== undefined ? context.cnnBer : context.lsBer);
      const lsBer = context.lsBer;
      const cnnBer = context.cnnBer;
      const nmse = context.nmse;
      const cnnStatus = context.cnnStatus || 'Not Trained';

      const systemPrompt = `You are AI-RailLink Assistant, an expert technical assistant for high-speed railway wireless communication.

Explain:
- OFDM, 64-subcarrier OFDM, Doppler shift, High-speed railway channels
- Multipath fading, Rician and Rayleigh channels, Pilot symbols
- LS channel estimation, 1D CNN channel estimation, ZF equalization
- SNR, BER, NMSE, CNN training, Channel frequency response, Simulation results

When simulation context is provided, explain the actual values supplied by the application.
Never invent simulation results.
Never claim that the CNN is trained unless the application reports that it is trained.
If data is unavailable, clearly say that the data is unavailable.

CRITICAL INSTRUCTIONS:
1. You MUST answer entirely in ${targetLanguage}.
2. When answering in Indian languages (Hindi, Kannada, Telugu), technical engineering terms such as OFDM, CNN, BER, NMSE, SNR, QPSK, I/Q, and dB can remain in standard English or transliterated as standard in technical engineering literature.
3. Use clear markdown formatting with headings, bullet points, and code blocks with formulas where helpful.`;

      let contextDescription = '';
      const hasAnyData = trainSpeed !== undefined || snr !== undefined || doppler !== undefined || ber !== undefined || nmse !== undefined;

      if (hasAnyData) {
        contextDescription = `Current Application Simulation Context:
- Train Speed: ${trainSpeed !== undefined ? `${trainSpeed} km/h` : 'Unavailable (run simulation to generate)'}
- Channel SNR: ${snr !== undefined ? `${snr} dB` : 'Unavailable (run simulation to generate)'}
- Doppler Frequency: ${doppler !== undefined ? `${doppler} Hz` : 'Unavailable (run simulation to generate)'}
- Modulation: ${modulation}
- Pilot Spacing: ${pilotSpacing !== undefined ? pilotSpacing : '4 subcarriers'}
- 1D CNN Model Status: ${cnnStatus}
- Bit Error Rate (BER): ${ber !== undefined ? ber : 'Unavailable (run simulation to generate)'}
${lsBer !== undefined ? `- LS Estimator BER: ${lsBer}` : ''}
${cnnBer !== undefined ? `- 1D CNN Estimator BER: ${cnnBer}` : ''}
- Channel NMSE: ${nmse !== undefined ? `${nmse} dB` : 'Unavailable (run simulation to generate)'}
`;
      } else {
        contextDescription = 'Current Application Simulation Context: No simulation has been executed yet. All simulation metrics (Speed, SNR, Doppler, BER, NMSE) are currently unavailable until the user clicks "Quick Test" or runs the Simulator.';
      }

      const fullUserPrompt = `${contextDescription}

User Question:
${message.trim()}

Respond in ${targetLanguage}.`;

      const clientConfig = {
        apiKey: apiKey,
        timeout: 10000, // 10 second timeout for responsiveness
      };
      if (process.env.OPENAI_BASE_URL) {
        clientConfig.baseURL = process.env.OPENAI_BASE_URL.trim();
      }
      const openai = new OpenAI(clientConfig);

      const primaryModel = process.env.OPENAI_MODEL || 'gpt-5.6-luna';

      let completion;
      try {
        completion = await openai.chat.completions.create({
          model: primaryModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: fullUserPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1200,
        });
      } catch (apiErr) {
        if (apiErr.status === 404 || apiErr.code === 'model_not_found') {
          console.warn(`Model ${primaryModel} not available, trying gpt-4o-mini`);
          completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: fullUserPrompt },
            ],
            temperature: 0.7,
            max_tokens: 1200,
          });
        } else {
          throw apiErr;
        }
      }

      const replyText = completion.choices?.[0]?.message?.content || '';

      if (!replyText) {
        throw new Error('OpenAI returned an empty response.');
      }

      return res.status(200).json({
        success: true,
        reply: replyText,
        response: replyText,
        mode: 'openai',
        isLocal: false,
      });
    } catch (openaiErr) {
      console.warn('OpenAI API call failed; automatically using Local Mock AI fallback:', openaiErr.message || openaiErr);
      const fallbackReply = getMockAIResponse(message, language, context);

      return res.status(200).json({
        success: true,
        reply: fallbackReply,
        response: fallbackReply,
        mode: 'local',
        isLocal: true,
        fallbackFromOpenAI: true,
      });
    }
  } catch (error) {
    console.error('AI Controller Unexpected Error:', error.message || error);
    // Bulletproof: never return an error to user if mock AI can answer
    const fallbackReply = getMockAIResponse(req.body?.message || '', req.body?.language || 'English', req.body?.context || {});
    return res.status(200).json({
      success: true,
      reply: fallbackReply,
      response: fallbackReply,
      mode: 'local',
      isLocal: true,
    });
  }
};
