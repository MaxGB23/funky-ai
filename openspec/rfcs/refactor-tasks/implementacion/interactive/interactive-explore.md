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