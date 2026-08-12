### Draft actualizado: estructura reducida de risk-patterns.md

```markdown
# Patrones de Riesgo de Referencia

> Documento VIVO, editable por el equipo entre proyectos.
> La IA lo usa como barrido de completitud al FINAL de la Fase 3, después de leer brief y canvases.
> No es un temario de discusión: los hallazgos se presentan como puntos normales en la Fase 4.
> La IA NO modifica este archivo; si detecta un patrón nuevo, lo propone en el resumen de cierre.
> Seniority del equipo, multi-tenancy operativo, concurrencia y seguridad → los cubre estimate con sus flags.

---

## Eje 1: Sobreingeniería

> ¿El stack excede lo que el producto necesita dado su volumen, usuarios y KPIs reales?

- **K8s / Kubernetes** — INFRA-CANVAS lo menciona sin volumen o criticidad que lo justifique → ¿un PaaS no cubre el mismo caso con menos overhead?
- **Microservicios prematuros** — múltiples servicios independientes en Fase 1, dominio sin estabilizar → ¿un monolito modular no cubriría el MVP?

---

## Eje 2: Decisión de datos incorrecta

> ¿Hay una decisión de almacenamiento que no coincide con el tipo de dato que el brief implica?

- **Blobs en la DB relacional** — brief implica logs, archivos o payloads grandes pero no hay object storage en el canvas → table bloat y costos de almacenamiento se disparan.
- **Métricas históricas on-the-fly** — brief exige dashboards de ventanas de 30+ días pero el canvas no menciona pre-agregación → la query no escala con el historial.

---

## Eje 3: Incompatibilidades estructurales

> ¿Hay decisiones técnicas que se contradicen entre sí y producirían un bug o deploy roto, independientemente del costo?

- **Edge runtime + librerías Node.js nativas** — Prisma, bcrypt, fs, etc. no compilan en edge → el deploy falla o requiere workarounds costosos.
- **JWT stateless + multi-org o cambio de rol** — org o rol en el payload exige re-emisión al cambiar de contexto; sin blocklist, tokens revocados siguen activos.
- **Webhooks o streaming en el brief + sin canal de push en el canvas** — polling no cumple KPIs de latencia si el brief describe tiempo real o alertas inmediatas.

---

## Eje 4: Hipótesis de negocio dudosas

> ¿Los KPIs o supuestos del brief son coherentes con las decisiones del canvas?

- **KPI de activación agresivo sin onboarding** — el canvas no menciona tour ni reducción de fricción → los KPIs de activación dependen de la UX, no solo del stack.
- **Escala proyectada vs. infra que escala a cero** — brief menciona alto volumen pero el INFRA-CANVAS no tiene estrategia de escala horizontal → ¿hay un plan de migración explícito?
```