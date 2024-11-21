
// src/utils/rateLimit.ts

import { config } from "../config/config";

interface UserRateLimit {
    lastRequest: number;
    requestCount: number;
}

const rateLimits: Record<number, UserRateLimit> = {};

export function isRateLimited(userId: number): boolean {
    const currentTime = Date.now();
    const userLimit = rateLimits[userId] || { lastRequest: currentTime, requestCount: 0 };

    if (currentTime - userLimit.lastRequest > config.rateLimit.timeWindowMs) {
        userLimit.lastRequest = currentTime;
        userLimit.requestCount = 1;
    } else {
        userLimit.requestCount++;
    }

    rateLimits[userId] = userLimit;

    return userLimit.requestCount > config.rateLimit.maxRequests;
}