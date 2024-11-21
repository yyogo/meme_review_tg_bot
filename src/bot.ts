import { Telegraf, Context, Types } from 'telegraf';
import { handleMessage, cancelReview } from './handlers/messageHandler';
import { KeyStorage } from './services/storage';
import logger from './utils/logger';
import { Message, ParseMode } from '@telegraf/types';
import { reply_to } from './utils/telegram';
import { handleRegister, handleAuthorize } from './handlers/authHandlers';

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
    throw new Error('BOT_TOKEN is not defined');
}

const bot = new Telegraf(botToken);
const storage = new KeyStorage();

// Initialize storage before starting the bot
const init = async () => {
    await storage.init();
    
    // Command to register API key for a user
    bot.command('register', async (ctx) => {
        try {
        await handleRegister(ctx, storage);
        ctx.reply('API key registered successfully!', reply_to(ctx));
        }
        catch (error) {
            return ctx.reply('Please provide an API key: /register YOUR_API_KEY', reply_to(ctx));
        }
    });

    // Command to test bot functionality
    bot.command('test', (ctx) => {
        logger.info(`Received test command from user ${ctx.from.id}`);
        ctx.replyWithMarkdown('*This is a test message.*\n\n_If you see this, the bot is working correctly._', reply_to(ctx));
    });

    // Command to authorize a group chat
    bot.command('authorize', async (ctx) => {
        await handleAuthorize(ctx, storage);
    });

    // Handle image messages
    bot.on('message',async (ctx) => {
        const chatId = ctx.chat.id;
        const userId = ctx.from.id;
        logger.debug(`Received message from user ${userId} in chat ${chatId}`);
        
        const apiKey = await storage.get(chatId);
        if (!apiKey) {
            logger.warn(`Unauthorized message in chat ${chatId} from user ${userId}`);
            return ctx.reply('This chat is not authorized. An admin needs to register their API key and authorize this chat.');
        }

        handleMessage(ctx, apiKey);
    });

    // Handle cancel button clicks
    bot.on('callback_query', async (ctx) => {
        if (!('data' in ctx.callbackQuery)) return;
        if (ctx.callbackQuery.data.startsWith('cancel:')) {
            const cancelId = ctx.callbackQuery.data.split('cancel:')[1];
            logger.info(`Review cancellation requested by user ${ctx.from.id}: ${cancelId}`);
            await cancelReview(ctx, cancelId);
            await ctx.answerCbQuery();
        }
    });

    bot.launch()
        .then(() => logger.info('Bot started successfully'))
        .catch(error => logger.error(`Bot launch failed: ${error.message}`));
};

init().catch(error => {
    logger.error('Failed to initialize bot:', error);
    process.exit(1);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
