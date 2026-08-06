---
name: codebase-memory
description: Long-term codebase memory and knowledge graph indexer. Helps understand codebase layout, imports, export chains, and project structures efficiently.
---

# Codebase Memory Skill

Helps the AI build a persistent mental model of the codebase layout, imports, and exports.

## Core Directives

1. **Map Project Structure**: Learn the layout of `src/`, `components/`, `screens/`, `hooks/`, and configuration files at the start of work.
2. **Track Dependencies**: Trace function call chains, imports, and exports to prevent breaks or redundant code.
3. **Reuse Existing Utilities**: Before writing a helper or utility function, search the codebase to see if a similar function is already defined.
4. **Maintain Knowledge Graph**: Document and remember module boundaries, APIs, and overall system design.
