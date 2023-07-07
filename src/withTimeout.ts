import { once } from 'node:events';

export async function withTimeout<R>(
    action: (signal: AbortSignal) => Promise<R>,
    options: { timeout: number; signal?: AbortSignal }
) {
    return new Promise<R>((resolve, reject) => {
        const controller = new AbortController();

        function cleanup() {
            if (!controller.signal.aborted) {
                controller.abort();
            }
        }

        if (options?.signal) {
            once(options.signal, 'abort', controller)
                .then(() => reject(new Error('Action aborted by external signal.')))
                .catch(() => {
                    // Signal abort listener was removed by the abort controller.
                })
                .finally(cleanup);
        }

        once(AbortSignal.timeout(options.timeout), 'abort', controller)
            .then(() => reject(new Error(`Timeout after ${options.timeout}.`)))
            .catch(() => {
                // Timer was stopped by the abort controller.
            })
            .finally(cleanup);

        action(controller.signal).then(resolve).catch(reject).finally(cleanup);
    });
}
