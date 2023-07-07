import { expect, test } from 'vitest';
import { withTimeout } from '../src/withTimeout';
import { setTimeout } from 'node:timers/promises';

test('Action completes', async () => {
    const promise = withTimeout(
        async () => {
            await setTimeout(100);
            return 'hello world';
        },
        { timeout: 1000 }
    );

    await expect(promise).resolves.toBe('hello world');
});

test('Action times out', async () => {
    const promise = withTimeout(
        async () => {
            await setTimeout(100);
            return 'hello world';
        },
        { timeout: 25 }
    );

    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot('"Timeout after 25."');
});

test('Action is cancelled', async () => {
    const promise = withTimeout(
        async () => {
            await setTimeout(100);
            return 'hello world';
        },
        { timeout: 1000, signal: AbortSignal.timeout(25) }
    );

    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot('"Action aborted by external signal."');
});
