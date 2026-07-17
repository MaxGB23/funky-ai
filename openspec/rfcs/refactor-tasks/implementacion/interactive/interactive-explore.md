### Lo que presenta el orquestador

```markdown
🔍 Explore complete — "login-con-google"

📋 **Resumen**: El auth actual usa JWT con email/password vía Prisma.
No hay soporte para OAuth ni providers externos.

📁 **Áreas afectadas**:
- `src/auth/service.ts` — lógica de intercambio de código por token
- `prisma/schema.prisma` — nuevo modelo OAuthAccount
- `src/auth/routes.ts` — nueva ruta de callback OAuth

⚖️ **Enfoques**:
1. **Manual con webfetch** — sin deps externas, más control
   Esfuerzo: Medio
2. **Passport.js** — más rápido, agrega dependencia pesada
   Esfuerzo: Bajo

✅ **Recomendación**: Manual con webfetch

⚠️ **Riesgos**: Refresh token rotation no está cubierta actualmente
```

### Comportamiento por modo

| Modo | Explore SDD | Explore Ligero |
|------|------------|----------------|
| **Interactivo** | Muestra resultado + "¿Quieres ajustar algo o continuamos?" | Route A: Disponible (CLI nativo). Route B: Persiste explore.md + resumen |
| **Auto** | Si `Ready for Proposal: Yes`, arranca propose directo. Si `No`, frena | Route A: Disponible (CLI nativo). Route B: Persiste explore.md, propose lo lee desde disco |
| **Handoff** | Prepara bloque de copy-paste para IDE, espera Return Envelope | Route A: Prepara bloque copy-paste con prompt de Sabueso. Route B: Prepara bloque copy-paste de Sabueso de Lava + template de explore.md |

### Casos especiales

- **`Ready for Proposal: No`** → no ofrece continuar. Explica qué falta.
- **`Status: blocked`** → muestra el bloqueo, no avanza.
- **Sin áreas afectadas** → el explore probablemente no hizo falta. Sugerir saltar a propose.