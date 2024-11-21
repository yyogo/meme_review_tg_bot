import { Context } from 'telegraf';
import { KeyStorage } from '../services/storage';
import logger from '../utils/logger';

export const handleRegister = async (ctx: Context, storage: KeyStorage) => {
    const userId = ctx.from!.id;
    logger.info(`Received register command from user ${userId}`);
    const message = ctx.message!;
    const text = 'text' in message ? message.text : '';
    const apiKey = text.split(' ')[1];
    if (!apiKey) {
        logger.warn(`Invalid register attempt from user ${userId}: no API key provided`);
        throw new Error('No API key provided');
    }
    
    await storage.set(userId, apiKey);
    logger.info(`Successfully registered API key for user ${userId}`);
};

export const handleAuthorize = async (ctx: Context, storage: KeyStorage) => {
    const userId = ctx.from!.id;
    const chatId = ctx.chat!.id;
    logger.info(`Received authorize command from user ${userId} in chat ${chatId}`);
    
    if (ctx.chat!.type === 'private') {
        logger.warn(`Invalid authorize attempt in private chat from user ${userId}`);
        return ctx.reply('This command can only be used in group chats');
    }
    
    const userApiKey = await storage.get(userId);
    
    if (!userApiKey) {
        return ctx.reply('Please register your API key first using /register in a private chat');
    }
    
    await storage.set(chatId, userApiKey);
    logger.info(`Successfully authorized group chat ${chatId} by user ${userId}`);
    ctx.reply('This group chat has been authorized!');
};