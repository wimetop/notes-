import { pool } from '@/shared/db';
import { workerRedis } from './redis';
import { scheduleTrashPurge, trashQueue, trashWorker } from './queues/trash.queue';

async function shutdown(signal: string): Promise<void> { console.info(`Worker received ${signal}`); await trashWorker.close(); await trashQueue.close(); await workerRedis.quit(); await pool.end(); process.exit(0); }
void scheduleTrashPurge();
process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
