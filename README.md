# `@cameronhunter/async-with-timeout`

[![npm package](https://img.shields.io/npm/v/%40cameronhunter/async-with-timeout?logo=npm)](https://www.npmjs.com/package/@cameronhunter/async-with-timeout)
[![main branch status](https://img.shields.io/github/actions/workflow/status/cameronhunter/async-with-timeout/post-merge.yml?logo=github&label=main)](https://github.com/cameronhunter/async-with-timeout/actions/workflows/post-merge.yml)

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
