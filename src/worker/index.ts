import { pool } from '@/shared/db';
import { closeWorkerResources, startWorker } from './bootstrap';
import { workerRedis } from './redis';
import { scheduleTrashPurge, trashQueue, trashWorker } from './queues/trash.queue';

const resources = {
  closeWorker: () => trashWorker.close(),
  closeQueue: () => trashQueue.close(),
  quitRedis: () => workerRedis.quit(),
  endPool: () => pool.end(),
};

async function shutdown(signal: string): Promise<void> {
  console.info(`Worker received ${signal}`);
  await closeWorkerResources(resources);
  process.exit(0);
}

void startWorker({ schedule: scheduleTrashPurge, ...resources, error: console.error }).then((started) => {
  if (!started) process.exitCode = 1;
});
process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
