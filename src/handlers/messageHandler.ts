import { Context } from 'telegraf';
import { Message } from 'telegraf/types';
import { isRateLimited} from '../utils/rateLimit';
import { analyzeImage } from '../services/imageAnalysis';
import logger from '../utils/logger';
import { reply_to } from '../utils/telegram';

interface StatusMessage {
    chatId: number;
    messageId: number;
    userId: number;
    abort: AbortController;
}

const uniqueMessageId = (message: Message) => `${message.chat.id}:${message.message_id}`;

const activeReviews = new Map<string, StatusMessage>();

export const handleMessage = async (ctx: Context, apiKey: string) => {
    const message = ctx.message;
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;

    logger.info(`Received message from user ${userId} in chat ${chatId}`);

    if (!message || !('photo' in ctx.message)) {
        logger.debug('Message does not contain a photo, ignoring');
        return;
    }

    if (!userId) {
        logger.warn('Message received without user ID');
        return;
    }

    if (isRateLimited(userId)) {
        logger.info(`Rate limit reached for user ${userId}`);
        return ctx.reply('You have reached the limit of 4 posts per hour. Please try again later.', reply_to(ctx));
    }


    logger.info(`Processing image from user ${userId}`);
    
    const request_id = uniqueMessageId(ctx.message);

    // Send status message with cancel button
    const statusMessage = await ctx.reply('Generating review...', {
        reply_markup: {
            inline_keyboard: [[{ text: 'Cancel', callback_data: `cancel:${request_id}` }]],
        },
        ...reply_to(ctx)
    });

    if (!statusMessage || !chatId) return;


    // Store status message info
    let abort = new AbortController();
    activeReviews.set(request_id, {
        chatId,
        messageId: statusMessage.message_id,
        userId,
        abort
    });

    try {
        const fileId = (ctx.message.photo[0].file_id);
        const imageUrl = await ctx.telegram.getFileLink(fileId);
        logger.info(`Generated image URL: ${imageUrl}`);
        const review = await analyzeImage(imageUrl, apiKey, abort.signal);
        
        await ctx.replyWithMarkdown(review, reply_to(ctx));
    } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            logger.info('Image analysis was cancelled');
            return;
        }
        logger.error('Error processing image:', error);
        await ctx.reply('Error generating review. Please try again.', reply_to(ctx));
    } finally {
        // Delete status message
        activeReviews.delete(request_id);
        try {
            await ctx.telegram.deleteMessage(chatId, statusMessage.message_id);
        } catch (error) {
            // ignore
        }
    }
};

export const cancelReview = async (ctx: Context, cancelId: string) => {
    try {
        await ctx.telegram.deleteMessage(ctx.chat!.id, ctx.msg.message_id);
    } catch (error) {
        // ignore
    }
    const status = activeReviews.get(cancelId);
    if (status) {
        logger.info(`cancelling review id: ${cancelId}`);
        status.abort.abort();
    } else {
        logger.warn(`did not find review id: ${cancelId}`);
    }
};