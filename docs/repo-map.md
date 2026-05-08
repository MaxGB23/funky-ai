# Mapa Estructural del Repositorio (v1.16.0)

> Estado actual de la estructura de directorios del proyecto. Generado a partir de la auditoría de la Tarea 010.

## 1. Core Application (`funky-cli/`)
| Directorio | Rol | Propósito | Estado |
|------------|-----|-----------|--------|
| `bin/` | Entrypoint | Contiene el ejecutable principal `funky.js`. | Activo |
| `scripts/` | Utils | Scripts internos de mantenimiento (ej. `sync-templates.js`). | Activo |
| `src/` | Código Fuente | Comandos, utilidades y templates del CLI. | Activo |
| `tests/` | Testing | Batería principal de pruebas (incluye tests unificados). | Activo |

## 2. Documentación (`docs/`)
| Directorio | Rol | Propósito | Estado |
|------------|-----|-----------|--------|
| `engram/` | Memoria | Memoria persistente del sistema (Discoveries, Bugfixes). | Activo |
| `funky-ai/` | Core Docs | Documentación central del protocolo y guías. | Activo |
| `issues/` | Tracking | Issue tracker local para el ciclo SDD. | Activo |
| `openspec/` | SDD | Archivos, RFCs y Proposals del flujo SDD. Ver §2.2 para semántica interna. | Activo |
| `prompts/` | IA | Prompts globales del sistema. | Activo |
| `archive/gentle-ai/` | Legacy (Archivado) | Archivos del sistema predecesor, preservados por valor histórico. | Archivado | 
| `github-logs/` | CI Logs | Logs y reportes de CI. Se usa como fallback para depurar Github Actions. | Activo (Standby) |

### 2.1. Funky AI Docs (`docs/funky-ai/`)
| Directorio | Rol | Propósito | Estado |
|------------|-----|-----------|--------|
| `conceptos/` | Docs | Conceptos fundamentales del protocolo Funky AI. | Activo |
| `drafts/` | Drafts | Notas temporales y pendientes a organizar. | Activo |
| `guias/` | Docs | Guías de usuario y developer. | Activo |
| `historico/` | Histórico | Historial del proyecto (journey, releases, retrospectivas). | Activo |
| `operaciones/` | Docs | Definición de flujos de trabajo (SDD, CI/CD). | Activo |

### 2.2. OpenSpec (`docs/openspec/`) — Semántica de Directorios

> ⚠️ **REGLA CRÍTICA PARA LA IA:** Estos dos directorios tienen roles DISTINTOS e incompatibles. No confundirlos.

| Directorio | Autor | Rol Semántico | ¿Es ejecutable por la IA? |
|------------|-------|---------------|--------------------------|
| `rfcs/` | **Humano** | **Brain Dump** — Ideas crudas, lluvia de pensamientos, notas sin filtrar escritas por el humano. El Orquestador las lee para entender la intención, NUNCA para ejecutarlas directamente. | 🔴 **NO** |
| `changes/` | **Orquestador** | **Proposals formales** — Specs técnicas validadas (`proposal.md`, `spec.md`, `tasks.md`) generadas por el Orquestador a partir de un RFC. Base real del ciclo SDD. | ✅ **SÍ** |
| `archive/` | Sistema | Features completadas archivadas post-release. | 📦 Referencia |

## 3. Configuración Raíz
| Directorio | Rol | Propósito | Estado |
|------------|-----|-----------|--------|
| `.agents/` | Config IA | Reglas (`rules/`) y Skills (`skills/`) del workspace. | Activo |
