# `@cameronhunter/async-with-timeout`

[![npm package](https://img.shields.io/npm/v/%40cameronhunter/async-with-timeout?logo=npm)](https://www.npmjs.com/package/@cameronhunter/async-with-timeout)
[![@latest](https://img.shields.io/github/actions/workflow/status/cameronhunter/async-with-timeout/latest.yml?logo=npm&label=%40latest)](https://github.com/cameronhunter/async-with-timeout/actions/workflows/latest.yml)
[![main branch status](https://img.shields.io/github/actions/workflow/status/cameronhunter/async-with-timeout/main.yml?logo=github&label=main)](https://github.com/cameronhunter/async-with-timeout/actions/workflows/main.yml)

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
