# RFC 012 — Orchestrator Self-Tiering Protocol

- **Status:** 📝 DRAFT (En discusión)
- **Autor:** Funky AI Orchestrator
- **Fecha:** 2026-05-05
- **Referencia:** [Tarea 012 en ORCHESTRATOR-STATE.md](../../../ORCHESTRATOR-STATE.md)

---

## 1. El Problema: Inconsistencia en el Rigor
Actualmente, el Orquestador (yo) opera bajo un nivel de rigor "ad-hoc". Si el usuario no especifica un Tier, suelo caer en un **Tier 2 por defecto**, lo cual genera:
1. **Sobrecarga (Over-engineering):** Generar specs y proposals para tareas triviales (T1).
2. **Sub-estimación (Under-engineering):** Ser demasiado laxo en tareas que afectan el core, aumentando el riesgo de bugs arquitectónicos.
3. **Fatiga del Humano:** Obligar al usuario a decidir siempre el nivel de burocracia.

## 2. Propuesta: Fase de "Razonamiento Pre-Vuelo"
Implementar un paso obligatorio de **Self-Assessment** al inicio de cada sesión de orquestación. Antes de tocar el disco, el Orquestador debe analizar el prompt y declarar su Tier de operación.

### 2.1 Matriz de Decisión (Algoritmo Mental)
El Orquestador evaluará los siguientes vectores para asignar el Tier:

| Factor | Peso | Disparador de Tier Alto |
| :--- | :--- | :--- |
| **Volumen de Archivos** | Alto | Si afecta > 3 archivos -> **T2** |
| **Dominio del Core** | Crítico | Si toca `funky-cli/src/core` -> **T3** |
| **NFRs (Req. No Funcionales)** | Medio | Si hay implicancias de Seguridad o Performance -> **T3** |
| **Incertidumbre** | Alto | Si no hay un punto de entrada claro -> **T1 (Exploración)** |
| **Legacy** | Medio | Si toca código marcado como `deprecated` -> **T3 (Audit)** |

### 2.2 El "Contrato de Sesión"
Al recibir el objetivo, la primera respuesta del Orquestador DEBE seguir este formato:
> *"Entendido. Analizando la tarea... Veo que afecta el motor de reglas (Core). **Operaré en Tier 2 (Standard)**. Pasos: 1. Explore, 2. Propose, 3. Tasks."*

## 3. Detalles de Implementación (Lo que no se ve)

### 3.1 Escalación Dinámica (Dynamic Tiering)
Si durante la fase de `/sdd-explore` (Tier 1 o 2) el Orquestador descubre una complejidad oculta (ej: una dependencia circular), tiene la **obligación** de informar al humano y escalar el Tier de la sesión.
> *"🔴 Alerta: La exploración reveló que este cambio rompe los tests de integración del CLI. Escalo la sesión de **Tier 2** a **Tier 3**. Requeriré auditoría de Engram."*

### 3.2 Token Diet (Optimización de Tiers Bajos)
En tareas identificadas como **Tier 1**, el Orquestador podrá usar un template de `sdd-tasks.md` ultra-comprimido, salteándose las fases de `explore` y `proposal` para ir directo a la ejecución, ahorrando tokens y tiempo de espera del usuario.

## 4. Riesgos y Trade-offs
- **Latencia inicial:** La primera respuesta tardará unos segundos más por el análisis de riesgo.
- **Falsos Positivos:** El Orquestador podría ponerse "demasiado burocrático" por precaución. Se debe permitir que el humano haga un *override*: *"Bajalo a Tier 1, no es para tanto"*.

## 5. Próximos Pasos
- [ ] Actualizar `.agents/rules/sdd-orchestrator.md` con la sección "Self-Tiering Logic".
- [ ] Probar el flujo en una tarea real de refactor.
