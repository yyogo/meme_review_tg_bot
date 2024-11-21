import * as dotenv from 'dotenv';
dotenv.config();

export const config = {
    analysisModelName:  "gpt-4o",
    reviewModelName:  "gpt-4o-mini",
    telegramToken: process.env.TELEGRAM_BOT_TOKEN!,
    logLevel: process.env.LOG_LEVEL || 'info',
    rateLimit: {
        maxRequests: 4,
        timeWindowMs: 60 * 60 * 1000 // 1 hour
    },
    analysisMaxTokens: parseInt(process.env.ANALYSIS_MAX_TOKENS!) || 300,
    reviewMaxTokens: parseInt(process.env.REVIEW_MAX_TOKENS!) || 300,
    reviewExample: `
Example review:

*Description*:
A meme combining a bilingual pun on “лук” (onion in Russian) and “LOOK!” in English, layered over the overused Wojak pointing format.

*Critique*:
The pun is clever, but the visual execution is lazy and uninspired. Wojak pointing adds nothing except a tired sigh from anyone familiar with meme culture. A joke this sharp deserved better than being stapled to such a cliché.

*Rating*:
4/10 - Strong pun, weak delivery.

*Commentary*:
It's like putting a gourmet dish on a paper plate—yes, the pun is clever, but the format is so overplayed it feels more like a chore than a laugh. At least the onions are fresh.
`
};