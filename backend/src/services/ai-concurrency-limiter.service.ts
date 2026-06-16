// src/services/ai-concurrency-limiter.service.ts
export const runWithConcurrencyLimit = async <T>(
  tasks: (() => Promise<T>)[],
  maxConcurrent: number,
): Promise<T[]> => {
  const results: T[] = [];
  let index = 0;

  const workers = new Array(Math.min(maxConcurrent, tasks.length))
    .fill(null)
    .map(async () => {
      while (index < tasks.length) {
        const currentIndex = index++;
        results[currentIndex] = await tasks[currentIndex]();
      }
    });

  await Promise.all(workers);

  return results;
};
