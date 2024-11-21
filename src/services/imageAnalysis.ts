import OpenAI, { OpenAIError } from 'openai';
import { config } from '../config/config';
import logger from '../utils/logger';

const analyzeMemeContent = async (openai: OpenAI, imageUrl: URL): Promise<string> => {
    logger.info('Initiating Stage 1: Meme analysis');
    const analysisResponse = await openai.chat.completions.create({
        model: config.analysisModelName,
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: "Analyze and write a short description of this meme." },
                    {
                        type: "image_url",
                        image_url: {
                            url: imageUrl.toString(),
                        },
                    },
                ],
            },
        ],
        max_tokens: config.analysisMaxTokens,
    });
    logger.info('Stage 1 completed successfully');
    return analysisResponse.choices[0]?.message?.content || "Failed to analyze the image";
};

const generateMemeReview = async (openai: OpenAI, analysis: string): Promise<string> => {
    logger.info('Initiating Stage 2: Review generation');
    const reviewResponse = await openai.chat.completions.create({
        model: config.reviewModelName,
        messages: [
            {
                role: "system",
                content: "You are a meme reviewer. You are provided with a description of a meme and are asked to write a scathing, dry review based on it.",
            },
            {
                role: "user",
                content: `${config.reviewExample}\n`,
            },
            {
                role: "user",
                content: `Write a review based on the following analysis: ${analysis}\n`,
            },
        ],
        max_tokens: config.reviewMaxTokens,
    });
    logger.info('Stage 2 completed successfully');
    return reviewResponse.choices[0]?.message?.content || "Failed to write the review";
};
export const analyzeImage = async (imageUrl: URL, apiKey: string, signal?: AbortSignal): Promise<string> => {
    const openai = new OpenAI({ apiKey });
    logger.info(`Starting image analysis for URL: ${imageUrl}`);

    try {
        signal?.throwIfAborted();
        const analysis = await analyzeMemeContent(openai, imageUrl);
        
        signal?.throwIfAborted();
        const review = await generateMemeReview(openai, analysis);
        
        signal?.throwIfAborted();
        return review;
    } catch (error) {
        if (error instanceof OpenAIError) {
            logger.error('OpenAI API error:',error.message);
            return "Sorry, I couldn't analyze this masterpiece of mediocrity right now.";
        }
        else {
            throw error;
        }
    }
};