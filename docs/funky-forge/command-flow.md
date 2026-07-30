# Command Flow — Resumen ejecutivo

> Cuándo usar cada comando forge, en qué orden y por qué.

---

## Orden recomendado

```
funky init  →  [funky scaffold*]  →  funky assess  →  funky estimate
                                               ↓
                                      funky pipeline (opcional)
```

> **\*** `funky scaffold` es del framework funky-ai, no de forge. Se ejecuta después de init para instalar el ecosistema agéntico.

---

## Tabla de decisión

| Comando | ¿Qué resuelve? | ¿Cuándo usarlo SOLO? | ¿Cuándo usarlo con PIPELINE? | ¿Cuándo NO usarlo? |
|---------|---------------|---------------------|-----------------------------|-------------------|
| `funky init` | Crear canvases del proyecto | **Siempre primero** — no tiene sentido sin esto | Siempre es prerequisito | Si ya existen canvases en `docs/funky-ai/canvas/` |
| `funky assess` | Evaluar stack, detectar riesgos, documentar decisiones arquitectónicas | Proyecto chico, exploración rápida, una sola fase | Como paso intermedio del pipeline (requiere context.json) | Si no hay canvases (no se puede evaluar sin contexto) |
| `funky estimate` | Estimar costos de infraestructura y servicios | Proyecto standalone con decisiones ya tomadas | Como paso final del pipeline (requiere assess completado) | Sin architecture-decisions.md — las decisiones de arquitectura guían el pricing |
| `funky pipeline` | Orquestar assess → estimate con estado compartido | No aplica — `pipeline` no es standalone | — | Proyectos chicos de una sola fase. Usar comandos directos es más rápido |

---

## Flujo por perfil de proyecto

### Proyecto chico / exploración rápida
```
funky init → llenar canvases → funky scaffold → funky assess
```
Sin estimate, sin pipeline. Solo querés explorar el stack.

### Proyecto mediano con costos
```
funky init → llenar canvases → funky scaffold → funky assess → funky estimate
```
Comandos individuales. El estimador lee las decisions de assess directamente.

### Proyecto grande / multi-fase / equipo
```
funky init → llenar canvases → funky scaffold → funky pipeline all
```
Pipeline orquesta todo con estado en context.json. Ideal para sesiones que se retoman.

---

## Regla de oro

Si el proyecto lo puede resolver una sola persona en una tarde → comandos individuales.  
Si involucra equipo, fases, o sesiones múltiples → pipeline.

---

## Anti-patrones

| Anti-patrón | Por qué duele |
|-------------|---------------|
| `funky estimate` sin `assess` previo | No hay decisions de arquitectura → la estimación es genérica y poco útil |
| `funky pipeline` para un proyecto chico | Overkill. context.json agrega ceremonia sin beneficio |
| Editar `context.json` a mano | Se desincroniza con los archivos reales. Siempre se actualiza vía `--context` flag |
| `funky init` si ya hay canvases | El comando falla con error. Es deliberado — no sobreescribe |
