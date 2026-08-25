export type WorkerBootstrapDependencies = {
  schedule: () => Promise<void>;
  closeWorker: () => Promise<void>;
  closeQueue: () => Promise<void>;
  quitRedis: () => Promise<unknown>;
  endPool: () => Promise<void>;
  error: (message: string, error: unknown) => void;
};

export async function closeWorkerResources({
  closeWorker,
  closeQueue,
  quitRedis,
  endPool,
}: Omit<WorkerBootstrapDependencies, 'schedule' | 'error'>): Promise<void> {
  await closeWorker();
  await closeQueue();
  await quitRedis();
  await endPool();
}

export async function startWorker(dependencies: WorkerBootstrapDependencies): Promise<boolean> {
  try {
    await dependencies.schedule();
    return true;
  } catch (error) {
    dependencies.error('Unable to schedule trash purge', error);
    await closeWorkerResources(dependencies);
    return false;
  }
}
