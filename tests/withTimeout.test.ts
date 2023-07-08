import { describe, expect, test, vi } from 'vitest';
import { withTimeout } from '../src/withTimeout';
import { setTimeout } from 'node:timers/promises';

test('Action completes', async () => {
    const promise = withTimeout(25, (signal) => {
        return setTimeout(10, 'hello world', { signal });
    });

    await expect(promise).resolves.toBe('hello world');
});

test('Action is aborted', async () => {
    const promise = withTimeout(10, async (signal) => {
        return setTimeout(100, 'hello world', { signal });
    });

    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
        '"The operation was aborted due to timeout after 10ms"'
    );
});

test('Action accepts a signal parameter', async () => {
    const spy = vi.fn();

    const promise = withTimeout(10, async (signal) => {
        try {
            await setTimeout(100, undefined, { signal });
        } catch (e) {
            spy(e);
        }

        return 'hello world';
    });

    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
        '"The operation was aborted due to timeout after 10ms"'
    );

    expect(spy.mock.lastCall).toMatchInlineSnapshot(`
      [
        [AbortError: The operation was aborted],
      ]
    `);
});

test('Name option is used in abort message', async () => {
    const promise = withTimeout(
        10,
        async (signal) => {
            return setTimeout(100, 'hello world', { signal });
        },
        { name: 'Hello world' }
    );

    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
        '"Hello world was aborted due to timeout after 10ms"'
    );
});

test('Named action is aborted', async () => {
    const promise = withTimeout(10, async function helloWorld() {
        return setTimeout(100, 'hello world');
    });

    await expect(promise).rejects.toThrowErrorMatchingInlineSnapshot(
        '"helloWorld was aborted due to timeout after 10ms"'
    );
});

describe('Invalid inputs', () => {
    const suite = test.each`
        timeout     | message
        ${-100}     | ${'It must be >= 0 && <= 4294967295.'}
        ${Infinity} | ${'It must be an integer.'}
        ${0.5}      | ${'It must be an integer.'}
    `;

    suite('Timeout: $timeout', async ({ timeout, message }) => {
        await expect(withTimeout(timeout, async () => {})).rejects.toThrowError(message);
    });
});
