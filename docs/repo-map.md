# Mapa Estructural del Repositorio (v1.15.0)

> Estado actual de la estructura de directorios del proyecto. Generado a partir de la auditoría de la Tarea 010.

## 1. Core Application (`funky-cli/`)
| Directorio | Rol | Propósito | Estado |
|------------|-----|-----------|--------|
| `bin/` | Entrypoint | Contiene el ejecutable principal `funky.js`. | Activo |
| `scripts/` | Utils | Scripts internos de mantenimiento (ej. `sync-templates.js`). | Activo |
| `src/` | Código Fuente | Comandos, utilidades y templates del CLI. | Activo |
| `tests/` | Testing | Batería principal de pruebas. | Activo |
| `test/` | Testing (Ghost) | Contiene pruebas (`assess.test.js`) pero compite con `tests/`. | Ghost / To Be Merged | **ANALISIS HUMANO -> REVISAR QUE TODO ESTÉ CORRECTO ANTES DE MERGEAR, YA QUE  HAY 2 CARPETAS DE TESTING**

## 2. Documentación (`docs/`)
| Directorio | Rol | Propósito | Estado |
|------------|-----|-----------|--------|
| `engram/` | Memoria | Memoria persistente del sistema (Discoveries, Bugfixes). | Activo |
| `funky-ai/` | Core Docs | Documentación central del protocolo y guías. | Activo |
| `issues/` | Tracking | Issue tracker local para el ciclo SDD. | Activo |
| `openspec/` | SDD | Archivos, RFCs y Proposals del flujo SDD. | Activo |
| `prompts/` | IA | Prompts globales del sistema. | Activo |
| `gentle-ai/` | Legacy | Archivos del sistema predecesor. | Ghost / To Be Deleted | **ANALISIS HUMANO -> Esta carpeta contiene informacion valiosa del funcionamiento del framework en el que está inspirado funky-ai, por lo tanto no eliminar, a lo mucho proponer un lugar mejor para guardarlo.**
| `github-logs/` | Legacy | Logs antiguos y reportes de CI caídos. | Ghost / To Be Deleted | ANALISIS HUMANO -> NO BORRAR POR AHORA, YA QUE TIENE SU FUNCION AUNQUE NO HAYA POR AHORA. SE USA EN CASO DE QUE FALLEN LAS GITHUB ACTIONS, ETC.

## 3. Configuración Raíz
| Directorio | Rol | Propósito | Estado |
|------------|-----|-----------|--------|
| `.agents/` | Config IA | Reglas (`rules/`) y Skills (`skills/`) del workspace. | Activo |
