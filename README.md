# @atomicmemory/atomicmemory-sdk

Backend-agnostic memory-layer SDK — pluggable providers, local embeddings, storage adapters, semantic search.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## What this package provides

- **`MemoryClient`** — a pure memory API: `ingest`, `search`, `package`, `get`, `list`, `delete`.
- **Provider interface + registry** — implement `MemoryProvider` to plug in any backend.
- **`AtomicMemoryProvider`** — HTTP adapter for [atomicmemory-core](https://github.com/atomicmemory/atomicmemory-core).
- **`Mem0Provider`** — HTTP adapter for [Mem0](https://github.com/mem0ai/mem0) (OSS or hosted).
- **`StorageManager`** — storage adapters (IndexedDB, in-memory) with resilience and validation.
- **`EmbeddingGenerator`** — local embedding generation via [`transformers.js`](https://github.com/huggingface/transformers.js).
- **`SemanticSearch`** — cosine-similarity search primitives.
- Error types (`AtomicMemoryError`, `StorageError`, `SearchError`) and a minimal event emitter.

## Installation

```bash
pnpm add @atomicmemory/atomicmemory-sdk
```

Also works with `npm install` / `yarn add`.

## Quick start

```ts
import { MemoryClient } from '@atomicmemory/atomicmemory-sdk';

const memory = new MemoryClient({
  providers: {
    atomicmemory: { apiUrl: 'http://localhost:3050' },
  },
});
await memory.initialize();

await memory.ingest({
  mode: 'messages',
  messages: [
    { role: 'user', content: 'I prefer aisle seats.' },
  ],
  scope: { user: 'demo-user' },
});

const results = await memory.search({
  query: 'seat preference',
  scope: { user: 'demo-user' },
});
```

## Providers

### AtomicMemory (recommended for self-hosted)

```ts
const memory = new MemoryClient({
  providers: {
    atomicmemory: {
      apiUrl: 'http://localhost:3050',
      apiKey: process.env.ATOMICMEMORY_API_KEY,
      timeout: 30_000,
    },
  },
});
```

### Mem0

```ts
const memory = new MemoryClient({
  providers: {
    mem0: {
      apiUrl: 'http://localhost:8888',
      apiStyle: 'oss',
    },
  },
});
```

## Subpath exports

- `@atomicmemory/atomicmemory-sdk/browser` — browser-safe entry: `MemoryClient` + memory types/adapters, without the root bundle's storage/embedding/search surface
- `@atomicmemory/atomicmemory-sdk/storage` — storage adapters
- `@atomicmemory/atomicmemory-sdk/embedding` — embedding generator
- `@atomicmemory/atomicmemory-sdk/search` — semantic search primitives
- `@atomicmemory/atomicmemory-sdk/utils` — shared utilities
- `@atomicmemory/atomicmemory-sdk/core` — error types + events
- `@atomicmemory/atomicmemory-sdk/memory` — memory types, provider interface, provider adapters

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
```

### Refreshing mapper test fixtures

The `AtomicMemoryProvider` mappers are guarded by a record/replay
test suite that runs against captured `atomicmemory-core` HTTP
responses. When core's wire shape changes, refresh the fixtures:

```bash
# In sibling atomicmemory-core checkout: ensure .env has a real
# OPENAI_API_KEY (or LLM_PROVIDER=ollama), then:
docker compose up -d --build

# Back in this repo:
pnpm fixtures:capture
```

See [`src/memory/atomicmemory-provider/__tests__/fixtures/README.md`](./src/memory/atomicmemory-provider/__tests__/fixtures/README.md) for the full procedure and what gets normalized at capture time.

## Contributing

Issues and PRs welcome.

## License

Apache-2.0 © AtomicMemory
