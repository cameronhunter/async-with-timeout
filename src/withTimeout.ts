import assert from 'node:assert';
import { once } from 'node:events';

export async function withTimeout<R>(
    action: (signal: AbortSignal) => Promise<R>,
    options: { timeout: number; signal?: AbortSignal; name?: string }
): Promise<R> {
    assert(
        Number.isSafeInteger(options.timeout) && Number.isFinite(options.timeout),
        `Value for "timeout" was invalid. It must be an integer. Received: ${options.timeout}`
    );

    assert(
        options.timeout >= 0 && options.timeout < 2 ** 32,
        `Value for "timeout" was invalid. It must be >= 0 && <= ${2 ** 32 - 1}. Received: ${options.timeout}`
    );

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
