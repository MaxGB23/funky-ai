# Mapa Estructural del Repositorio (v1.15.0)

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
| `openspec/` | SDD | Archivos, RFCs y Proposals del flujo SDD. | Activo |
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

## 3. Configuración Raíz
| Directorio | Rol | Propósito | Estado |
|------------|-----|-----------|--------|
| `.agents/` | Config IA | Reglas (`rules/`) y Skills (`skills/`) del workspace. | Activo |
