# Explore: Semántica de RFCs vs Proposals

## The Problem
Human users often create RFC files in `docs/openspec/rfcs/` to dump unrefined ideas, copy-paste AI chats, or list vague requirements. When a fresh SDD Orchestrator session reads an RFC, it often mistakes it for a formal technical proposal (`proposal.md`). This leads to the AI bypassing the architectural planning phase, blindly executing unrefined ideas, and causing significant structural degradation (Architectural Drift). 

## Context & Roots
- **Orchestrator Rules:** Currently, `.agents/rules/sdd-orchestrator.md` lacks explicit definitions distinguishing an RFC from a Proposal.
- **Documentation:** `docs/repo-map.md` currently lists `docs/openspec/rfcs/` as "RFCs y Proposals del flujo SDD" blurring the lines.

## Potential Solutions
1. **Enforce File Name/Location Semantics**: Formalize that anything in `rfcs/` is a "Brain Dump" strictly for human ideation, and the AI must never act upon it directly without creating a `proposal.md` in `changes/`.
2. **AI Guardrails**: Add an explicit rule in `sdd-orchestrator.md` instructing the Orchestrator to treat RFCs as raw input and to generate a formal `proposal.md` during the SDD planning phase.
3. **Template Introduction**: Introduce a `000-TEMPLATE.md` in `rfcs/` with a blocking AI warning, and distribute it via the `funky-cli` init process so new projects get it by default.
