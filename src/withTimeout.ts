import assert from 'node:assert';
import { once } from 'node:events';
import { setTimeout } from 'node:timers/promises';
import { cloneError } from '@cameronhunter/clone-error';

export type Options = {
    signal?: AbortSignal;
    rejectionError?: Error;
};

export async function withTimeout<R>(
    timeout: number,
    action: (signal: AbortSignal) => Promise<R>,
    options?: Options
): Promise<R> {
    options?.signal?.throwIfAborted();

    assert(
        Number.isSafeInteger(timeout) && Number.isFinite(timeout),
        `Value for "timeout" was invalid. It must be an integer. Received: ${timeout}`
    );

    assert(
        timeout >= 0 && timeout < 2 ** 32,
        `Value for "timeout" was invalid. It must be >= 0 && <= ${2 ** 32 - 1}. Received: ${timeout}`
    );

    const controller = new AbortController();

    const promises = [
        setTimeout(timeout, undefined, controller).then(() => {
            const timeoutError = new Error(`Timeout after ${timeout}ms`);
            return Promise.reject(
                options?.rejectionError ? cloneError(options.rejectionError, { cause: timeoutError }) : timeoutError
            );
        }),
        action(controller.signal),
    ];

    if (options?.signal) {
        promises.push(
            once(options.signal, 'abort', controller).then(() => {
                const abortError = new Error('Aborted by signal', { cause: options.signal?.reason });
                return Promise.reject(
                    options?.rejectionError ? cloneError(options.rejectionError, { cause: abortError }) : abortError
                );
            })
        );
    }

    return Promise.race(promises).finally(() => {
        if (!controller.signal.aborted) {
            controller.abort();
        }
    });
}
