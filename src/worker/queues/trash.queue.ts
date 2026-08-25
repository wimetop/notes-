import { Queue, Worker } from 'bullmq';
import { getEnv } from '@/shared/config';
import { purgeTrash } from '../jobs/purge-trash.job';
import { workerRedis } from '../redis';

export const trashQueue = new Queue('trash', { connection: workerRedis });
export const trashWorker = new Worker('trash', async (job) => { if (job.name === 'purge') await purgeTrash(); }, { connection: workerRedis });

export async function scheduleTrashPurge(): Promise<void> {
  await trashQueue.upsertJobScheduler('trash:purge', { pattern: getEnv().CRON_PURGE_SCHEDULE }, { name: 'purge', data: {} });
}
