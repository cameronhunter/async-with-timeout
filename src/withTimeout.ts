import assert from 'node:assert';
import { once } from 'node:events';
import { setTimeout } from 'node:timers/promises';

export async function withTimeout<R>(
    timeout: number,
    action: (signal: AbortSignal) => Promise<R>,
    options?: { signal?: AbortSignal; name?: string }
): Promise<R> {
    assert(
        Number.isSafeInteger(timeout) && Number.isFinite(timeout),
        `Value for "timeout" was invalid. It must be an integer. Received: ${timeout}`
    );

    assert(
        timeout >= 0 && timeout < 2 ** 32,
        `Value for "timeout" was invalid. It must be >= 0 && <= ${2 ** 32 - 1}. Received: ${timeout}`
    );

    const name = options?.name || action.name || 'The operation';

    if (options?.signal?.aborted) {
        throw new Error(`${name} was aborted`, { cause: options?.signal.reason });
    }

    const controller = new AbortController();

    const promises = [
        setTimeout(timeout, undefined, controller).then(() =>
            Promise.reject(new Error(`${name} was aborted due to timeout after ${timeout}ms`))
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
