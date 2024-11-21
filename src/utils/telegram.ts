import { Message } from "@telegraf/types";

export function reply_to(ctx: {message?: {message_id: number} | undefined}){
    if (!ctx.message) return {};
    return {reply_parameters: {message_id: ctx.message.message_id}}
};