import { once } from 'node:events';

export async function withTimeout<R>(
    action: (signal: AbortSignal) => Promise<R>,
    options: { timeout: number; signal?: AbortSignal; name?: string }
): Promise<R> {
    const name = options?.name || 'The operation';

    if (options.signal?.aborted) {
        throw new Error(`${name} was aborted`, { cause: options.signal.reason });
    }

    const controller = new AbortController();
    const timeoutSignal = AbortSignal.timeout(options.timeout);

    const promises = [
        once(timeoutSignal, 'abort', controller).then(() =>
            Promise.reject(
                new Error(`${name} was aborted due to timeout after ${options.timeout}ms`, {
                    cause: timeoutSignal.reason,
                })
            )
        ),
        action(controller.signal),
    ];

    if (options?.signal) {
        promises.push(
            once(options.signal, 'abort', controller).then(() =>
                Promise.reject(new Error(`${name} was aborted`, { cause: options.signal?.reason }))
            )
        );
    }

    return Promise.race(promises).finally(() => {
        if (!controller.signal.aborted) {
            controller.abort();
        }
    });
}
