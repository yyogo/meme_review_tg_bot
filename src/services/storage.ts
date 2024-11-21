
import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'apiKeys.json');

export class KeyStorage {
    private keys: Map<number, string>;

    constructor() {
        this.keys = new Map();
    }

    async init(): Promise<void> {
        try {
            await fs.mkdir(path.dirname(STORAGE_FILE), { recursive: true });
            
            try {
                const data = await fs.readFile(STORAGE_FILE, 'utf-8');
                const parsed = JSON.parse(data);
                this.keys = new Map(Object.entries(parsed).map(([k, v]) => [parseInt(k), v as string]));
                logger.info('API keys loaded from storage');
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                    throw error;
                }
                logger.info('No existing API keys storage found, starting fresh');
            }
        } catch (error) {
            logger.error('Failed to initialize storage:', error);
            throw error;
        }
    }

    private async save(): Promise<void> {
        try {
            const data = Object.fromEntries(this.keys);
            await fs.writeFile(STORAGE_FILE, JSON.stringify(data, null, 2));
            logger.debug('API keys saved to storage');
        } catch (error) {
            logger.error('Failed to save API keys:', error);
            throw error;
        }
    }

    async set(id: number, apiKey: string): Promise<void> {
        this.keys.set(id, apiKey);
        await this.save();
    }

    async get(id: number): Promise<string | undefined> {
        return this.keys.get(id);
    }

    async delete(id: number): Promise<boolean> {
        const deleted = this.keys.delete(id);
        if (deleted) {
            await this.save();
        }
        return deleted;
    }
}