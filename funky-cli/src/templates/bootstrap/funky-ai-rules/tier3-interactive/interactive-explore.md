---
trigger: manual
---

### Lo que presenta el orquestador

```markdown
🔍 Explore complete — "[feature-name]"

📋 **Resumen**: [Descripción del estado actual y necesidad de cambio]

📁 **Áreas afectadas**:
- `[ruta/al/archivo]` — [motivo de afectación]
- `[ruta/al/archivo]` — [motivo de afectación]

⚖️ **Enfoques**:
1. **[Opción A]** — [pros/contras]
   Esfuerzo: [Alto/Medio/Bajo]
2. **[Opción B]** — [pros/contras]
   Esfuerzo: [Alto/Medio/Bajo]

✅ **Recomendación**: [Opción recomendada]
⚠️ **Riesgos**: [Posibles problemas o dependencias]
🛡️ **NFR Candidates**: [Si el agente detectó riesgos de performance/seguridad, o se omite si es "Ninguno"]
```

### Casos especiales
- **`Ready for Proposal: No`** → no ofrece continuar. Explica qué falta.
- **`Status: blocked`** → muestra el bloqueo, no avanza.
- **Sin áreas afectadas** → el explore probablemente no hizo falta. Sugerir saltar a propose.