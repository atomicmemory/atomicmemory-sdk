/**
 * @file V3 Memory Provider Types
 *
 * Core type definitions for the unified MemoryProvider interface.
 * Based on the accepted V3 specification (providers-v3.md).
 *
 * Pure types — no runtime code.
 */

/**
 * Identity and partition context for memory operations.
 * Providers declare which fields they require via capabilities().requiredScope.
 */
export interface Scope {
  user?: string;
  agent?: string;
  namespace?: string;
  thread?: string;
}

/**
 * Reference to a specific memory within a scope.
 */
export interface MemoryRef {
  id: string;
  scope: Scope;
}

/**
 * A single memory unit. Returned by get, list, and as part of SearchResult.
 */
export interface Memory {
  id: string;
  content: string;
  scope: Scope;
  kind?: MemoryKind;
  createdAt: Date;
  updatedAt?: Date;
  provenance?: Provenance;
  metadata?: Record<string, unknown>;
}

export type MemoryKind =
  | 'fact'
  | 'episode'
  | 'summary'
  | 'procedure'
  | 'document';

export interface Provenance {
  source?: string;
  sourceUrl?: string;
  sourceId?: string;
  extractor?: string;
}

// ---------------------------------------------------------------------------
// Ingest
// ---------------------------------------------------------------------------

export type IngestInput = TextIngest | MessageIngest | VerbatimIngest;

export interface IngestBase {
  scope: Scope;
  provenance?: Provenance;
  metadata?: Record<string, unknown>;
}

/** Raw text: conversation transcript, document, note. */
export interface TextIngest extends IngestBase {
  mode: 'text';
  content: string;
}

/** Structured chat messages. */
export interface MessageIngest extends IngestBase {
  mode: 'messages';
  messages: Message[];
}

/**
 * Verbatim storage: bypass LLM extraction and store the content as a
 * single memory record. One input = one memory, deterministic. Use for
 * user-provided context blobs where the fact-extraction pipeline
 * would either over-split the text or, for ambiguous input, produce
 * zero facts and leave the user thinking nothing was saved.
 *
 * Capability-gated: only available when
 * `capabilities().ingestModes` includes 'verbatim'.
 */
export interface VerbatimIngest extends IngestBase {
  mode: 'verbatim';
  content: string;
  kind?: MemoryKind;
  metadata?: Record<string, unknown>;
}

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  name?: string;
}

export interface IngestResult {
  created: string[];
  updated: string[];
  unchanged: string[];
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchRequest {
  query: string;
  scope: Scope;
  limit?: number;
  threshold?: number;
  filter?: FilterExpr;
  reranker?: string;
}

export interface SearchResult {
  memory: Memory;
  /**
   * Raw backend score, passed through without transformation.
   * Semantics depend on the provider:
   * - Mem0 OSS (local): distance-like — lower is better (0 = exact match).
   * - Mem0 hosted: similarity-like — higher is better.
   * Consumers that need a uniform semantic should apply their own normalization.
   */
  score: number;
}

export interface SearchResultPage {
  results: SearchResult[];
  cursor?: string;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export type FilterExpr =
  | { and: FilterExpr[] }
  | { or: FilterExpr[] }
  | { not: FilterExpr }
  | FieldFilter;

export interface FieldFilter {
  field: string;
  op:
    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'contains'
    | 'exists';
  value?: string | number | boolean | Date | Array<string | number>;
}

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export interface ListRequest {
  scope: Scope;
  limit?: number;
  cursor?: string;
  filter?: FilterExpr;
}

export interface ListResultPage {
  memories: Memory[];
  cursor?: string;
}

// ---------------------------------------------------------------------------
// Context Packaging
// ---------------------------------------------------------------------------

export interface PackageRequest extends SearchRequest {
  tokenBudget?: number;
  format?: 'flat' | 'tiered' | 'structured';
}

/**
 * Injection-ready context for an AI assistant.
 * `text` is the formatted string for prompt injection.
 * `results` tracks what contributed (for debugging and attribution).
 */
export interface ContextPackage {
  text: string;
  results: SearchResult[];
  tokens: number;
}

// ---------------------------------------------------------------------------
// Capabilities
// ---------------------------------------------------------------------------

export interface Capabilities {
  ingestModes: Array<IngestInput['mode']>;

  requiredScope: {
    default: Array<keyof Scope>;
    ingest?: Array<keyof Scope>;
    search?: Array<keyof Scope>;
    get?: Array<keyof Scope>;
    delete?: Array<keyof Scope>;
    list?: Array<keyof Scope>;
    update?: Array<keyof Scope>;
    package?: Array<keyof Scope>;
    temporal?: Array<keyof Scope>;
    graph?: Array<keyof Scope>;
    forget?: Array<keyof Scope>;
    profile?: Array<keyof Scope>;
    reflect?: Array<keyof Scope>;
    versioning?: Array<keyof Scope>;
    batch?: Array<keyof Scope>;
  };

  extensions: {
    update: boolean;
    package: boolean;
    temporal: boolean;
    graph: boolean;
    forget: boolean;
    profile: boolean;
    reflect: boolean;
    versioning: boolean;
    batch: boolean;
    health: boolean;
  };

  customExtensions?: Record<
    string,
    { version?: string; description?: string }
  >;

  supportedRerankers?: string[];
  supportedFilterOps?: FieldFilter['op'][];
  maxTokenBudget?: number;
}

// ---------------------------------------------------------------------------
// Extension-specific types
// ---------------------------------------------------------------------------

export interface GraphSearchRequest {
  query: string;
  scope: Scope;
  limit?: number;
  graphScope?: 'nodes' | 'edges' | 'episodes';
  reranker?: string;
}

export interface GraphResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphNode {
  id: string;
  label: string;
  summary?: string;
  score?: number;
}

export interface GraphEdge {
  id: string;
  fact: string;
  from: string;
  to: string;
  validAt?: Date;
  invalidAt?: Date;
  score?: number;
}

export interface Profile {
  summary: string;
  facts?: string[];
  updatedAt?: Date;
}

export interface Insight {
  content: string;
  confidence: number;
  supportingMemoryIds: string[];
}

export interface MemoryVersion {
  id: string;
  content: string;
  createdAt: Date;
  parentId?: string;
  event: 'created' | 'updated' | 'superseded' | 'invalidated';
}

export interface HealthStatus {
  ok: boolean;
  latencyMs?: number;
  version?: string;
}
