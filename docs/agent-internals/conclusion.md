# Conclusión — AGY CLI vs el Estándar de Referencia (Gentle AI + OpenCode)

> Este doc no es una repetición del `migration-checklist.md`. Donde el checklist lista **qué** falta técnicamente, este doc explica **por qué importa** y **qué tan lejos está** AGY CLI del estándar real de orquestación — que no es solo OpenCode, sino OpenCode corriendo dentro del framework **Gentle AI**.

---

## El benchmark real: Gentle AI, no OpenCode solo

El error sería comparar AGY CLI contra OpenCode nativo. En Funky AI, OpenCode corre **dentro de Gentle AI**: un framework de orquestación más robusto que le agrega:

- **Protocolo Engram mandatorio** — `mem_save` proactivo con triggers definidos, `mem_session_summary` obligatorio al cerrar, `mem_context` proactivo al arrancar. No es opcional.
- **Contratos de delegación explícitos** — El orquestador inyecta el `SKILL.md` completo como `system_prompt` del sub-agente, define su cancha de forma irreversible antes de invocarlo.
- **Prompt hiper-específico por tarea** — No "hacé el apply", sino: modo de almacenamiento, estrategia de despliegue, lista exacta de tasks, contratos de código que no puede tocar.
- **Separación de responsabilidad estricta** — El Orquestador tiene visión global y decide. El sub-agente tiene visión de túnel y solo ejecuta.

Esto significa que el benchmark no es solo "¿tiene modelo por sub-agente?" — es "¿puede AGY CLI sostener este nivel de disciplina de orquestación de forma confiable?"

---

## Qué tiene AGY CLI que está bien

Antes del gap analysis, hay que ser honesto con lo que sí funciona:

| Capacidad | Estado |
|---|---|
| Protocolo Engram | ✅ Mismo protocolo, mismas tools (`mem_save`, `mem_search`, etc.) |
| Skill injection en sub-agentes | ✅ `define_subagent` con SKILL.md completo como `system_prompt` |
| Workspace isolation | ✅ **Ventaja exclusiva** — `branch`/`share`/`inherit` (OpenCode no tiene) |
| Rollback automático | ✅ `manage_subagents kill` borra el workspace aislado, preserva logs |
| Seguridad por defecto | ✅ Todo comando requiere aprobación explícita |
| Sub-agentes dinámicos | ✅ `define_subagent` en runtime — más flexible que 9 roles fijos |
| Reglas condicionales | ✅ Mission Control soporta inyección selectiva por contexto |

---

## El gap real: 3 capas de madurez

### Capa 1 — Técnica (bloqueante para full migración)

**Modelo por sub-agente** es el gap técnico más grave. Gentle AI + OpenCode puede mandar `sdd-design` a Opus y `sdd-apply` a Sonnet. AGY CLI no puede — todos heredan la sesión.

En un orquestador de producción esto no es cosmético: estás pagando precio de modelo caro para tasks mecánicas, o usando modelo barato para razonamiento arquitectónico profundo. Sin routing fino, perdés dinero o calidad en cada ciclo SDD.

**Truncamiento silencioso de user_rules** es el gap de confiabilidad más peligroso. El orquestador puede estar corriendo con instrucciones mutiladas — sin saberlo. Gentle AI resuelve esto por diseño (el prompt del orquestador está dimensionado para entrar completo en el JSON). AGY CLI depende de que el usuario mida y recorte manualmente.

### Capa 2 — Protocolo (no bloqueante, pero genera fricción)

**Sin delegación síncrona.** Gentle AI puede encadenar `task(sdd-design)` → `task(sdd-spec)` → `task(sdd-apply)` de forma secuencial garantizada. AGY CLI solo tiene async — el orquestador lanza y espera un `send_message` que puede no llegar en el formato esperado.

El workaround actual (usuario como intermediario síncrono) **funciona y es deliberado**, pero tiene un costo: el humano tiene que estar presente en cada handoff. No es autónomo.

**Sin envelope estructurado forzado por runtime.** Los sub-agentes de AGY CLI responden texto libre. Si el LLM no sigue el contrato SDD, el orquestador no puede detectarlo programáticamente. En Gentle AI el contrato está instruido Y el orquestador parsea explícitamente campos conocidos. La diferencia es entre confiar en el LLM y verificar al LLM.

### Capa 3 — Configuración (DX y auditabilidad)

**Sin contrato declarativo.** No hay un archivo que describa qué agentes existen, qué tools tienen, qué modelo usan. En Gentle AI + OpenCode es `opencode.json` — auditable, versionable, diffable. En AGY CLI es conocimiento implícito en varios `.md` dispersos que solo el orquestador ensambla en runtime.

Esto no bloquea la ejecución, pero hace imposible onboarding rápido, revisiones de config en PR, y detección de regresiones de configuración.

---

## Cuándo migrar completamente a AGY CLI

```
Hoy (2026-06-09)
│
├── ✅ Usar AGY CLI como Orquestador (ya está funcionando)
├── ✅ Usar IDE como Worker (accept/reject, notificaciones)
├── ✅ Handoff manual deliberado (human-in-the-loop)
│
▼ Migrar cuando:
│
├── ❌→✅ define_subagent soporta `model` por sub-agente
├── ❌→✅ Runtime no trunca user_rules silenciosamente
│         (o AGY CLI mide y diagnostica el truncamiento)
│
▼ Migración completa (sin IDE Workers):
│
└── Solo cuando el CLI tenga delegación síncrona O
    el volumen de features no justifique el overhead del IDE
```

---

## Veredicto

AGY CLI **es un orquestador viable hoy** para Funky AI porque el SDD Framework y el protocolo Engram ya están implementados, el workspace isolation es superior, y el humano-in-the-loop compensa la falta de delegación síncrona.

Pero en términos de **autonomía de orquestación** — la capacidad de orquestar ciclos SDD completos sin intervención humana en cada handoff — AGY CLI está a **2 features de plataforma** de lograrlo:

1. `model` por `define_subagent`
2. Sin truncamiento silencioso de reglas

Todo lo demás (envelope, config declarativa) es calidad de vida, no bloqueante. Cuando esas 2 features lleguen, la migración completa es trivial — la arquitectura ya está puesta.
