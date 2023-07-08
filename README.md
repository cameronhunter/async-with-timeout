# `@cameronhunter/async-with-timeout`

[![npm package](https://img.shields.io/npm/v/%40cameronhunter/async-with-timeout)](https://www.npmjs.com/package/@cameronhunter/async-with-timeout)
[![CI Status](https://github.com/cameronhunter/async-with-timeout/actions/workflows/CI.yml/badge.svg)](https://github.com/cameronhunter/async-with-timeout/actions/workflows/CI.yml)

A node utility function that implements timeout and `AbortSignal` support for async functions.

## Usage

```ts
import { withTimeout } from '@cameronhunter/async-with-timeout';

await withTimeout(5000, async () => {
    const a: number = await longProcess();
    const b: number = await anotherLongProcess();

    return a + b;
});
```
