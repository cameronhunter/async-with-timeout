import { describe, expect, test, vi } from 'vitest';
import { withTimeout } from '../src/withTimeout';
import { setTimeout } from 'node:timers/promises';

test('Action completes', async () => {
    const promise = withTimeout(
        async () => {
            await setTimeout(10);
            return 'hello world';
        },
        { timeout: 25 }
    );

    await expect(promise).resolves.toBe('hello world');
});

test('Action times out', async () => {
    const promise = withTimeout(
        async () => {
            await setTimeout(100);
            return 'hello world';
        },
        { timeout: 10 }
    );

    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
        '"The operation was aborted due to timeout after 10ms"'
    );
});

test('Action is cancelled', async () => {
    const promise = withTimeout(
        async () => {
            await setTimeout(100);
            return 'hello world';
        },
        { timeout: 1000, signal: AbortSignal.timeout(10) }
    );

    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot('"The operation was aborted"');
});

test('Action accepts a signal', async () => {
    const spy = vi.fn();

    const promise = withTimeout(
        async (signal) => {
            try {
                await setTimeout(100, undefined, { signal });
            } catch (e) {
                spy(e);
            }

            return 'hello world';
        },
        { timeout: 10 }
    );

    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
        '"The operation was aborted due to timeout after 10ms"'
    );

    expect(spy.mock.lastCall).toMatchInlineSnapshot(`
      [
        [AbortError: The operation was aborted],
      ]
    `);
});

describe('Invalid inputs', () => {
    const suite = test.each`
        timeout     | message
        ${-100}     | ${'It must be >= 0 && <= 4294967295.'}
        ${Infinity} | ${'It must be an integer.'}
        ${0.5}      | ${'It must be an integer.'}
    `;

    suite('Timeout: $timeout', async ({ timeout, message }) => {
        await expect(withTimeout(async () => {}, { timeout })).rejects.toThrowError(message);
    });
});
