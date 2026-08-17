# RFC 014: Mejora de Resolución de Dominio en `spec.template.md` (Tier 2)

**Fecha:** 2026-08-16
**Autor:** Orquestador (sesión interactiva)
**Estado:** Aplicado — 2026-08-16

---

## 🧠 El Problema / La Idea

El `spec.template.md` de Tier 2 tiene dos brechas respecto al flujo equivalente de Tier 3:

### Brecha 1 — Inferencia implícita del dominio
El paso actual dice: *"Lee el `proposal.md` para identificar el/los dominios afectados."*

El problema: el dominio no es un campo explícito en el proposal. El subagente debe inferirlo desde el **path** embebido en la sección `Capabilities`:

```markdown
- Directorio de prueba y ejercicios JS -> Mapea a `openspec/specs/prueba/ejercicios-js.md`
```

Si el path está malformado o tiene un typo, el subagente puede inferir un dominio incorrecto y crear uno nuevo innecesariamente.

### Brecha 2 — Contradicción en el caso FULL Spec (root-sha256 = null)

| Escenario | Template Tier 2 (actual) | Tier 3 (referencia) |
|-----------|--------------------------|---------------------|
| Dominio nuevo, hash = NULL | *"todas las secciones como ADDED"* | Sin headers `ADDED`/`MODIFIED`/`REMOVED` — spec completo directo |

Esta contradicción produce specs mal formadas para dominios nuevos en Tier 2.

---

## 🗑️ Brain Dump

### Flujo de Tier 3 (referencia canónica)

**Paso 1 — Leer Capabilities del Proposal:**
Identifica qué capabilities son nuevas y cuáles modificadas desde la sección `## 2. Capabilities (CONTRATO CON SPECS)`.

**Paso 1.5 — Reality Check de dominios:**
```powershell
Get-ChildItem -Directory "openspec/specs/" -ErrorAction SilentlyContinue | Select-Object Name
```
Mapea capabilities del proposal contra dominios reales. Si hay typo → usar el existente. Solo crear nuevo si el módulo es genuinamente nuevo.

**Paso 2 — Calcular root hash:**
```powershell
if (Test-Path "openspec/specs/{domain}/spec.md") { (Get-FileHash -LiteralPath "openspec/specs/{domain}/spec.md" -Algorithm SHA256).Hash } else { Write-Output "NULL" }
```
- Hash real → `root-sha256: {HASH}` en frontmatter
- `NULL` → `root-sha256: null` + escribir FULL Spec **sin** headers de sección `ADDED`/`MODIFIED`/`REMOVED`

**Paso 3 — Escribir Delta Spec:**
Por cada capability, crear `openspec/changes/{feature}/specs/{domain}/spec.md`.

---

## 🎯 Solución Propuesta

Actualizar el bloque `AGENT INSTRUCTIONS` del `spec.template.md` (tanto el de la feature activa como el template canónico) para que los pasos sean explícitos y consistentes con Tier 3.

### Cambios concretos al bloque AGENT INSTRUCTIONS

1. **Paso 1** — Cambiar de *"Lee el proposal"* a *"Lee la sección `## 2. Capabilities` del proposal y extrae el dominio del path en `openspec/specs/{dominio}/...`"*.

2. **Paso 1.5 (nuevo)** — Agregar Reality Check con `Get-ChildItem` para validar nombres reales de dominio.

3. **Paso 2 (hash)** — Mantener el comando, pero corregir el caso NULL:
   - NULL → `root-sha256: null` + el spec se escribe **sin** headers `ADDED`/`MODIFIED`/`REMOVED` (FULL Spec directo).

4. **Reglas críticas** — Actualizar la regla de FULL Spec para reflejar la corrección del punto 3.

---

## 🎯 Qué NO es esto

- No es un cambio al template del proposal canónico (`.agents/templates/sdd/proposal.md`). No se agrega un campo `domain` explícito — la solución vive en las instrucciones del spec template y en los prompts de Tier 3.
- No afecta Tier 1.
- No es un cambio al `t2-spec.md` (delegation prompt). La lógica vive en el template, no en el prompt de delegación.

---

## Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `funky-cli/src/templates/bootstrap/sdd/spec.template.md` | Actualizar bloque `AGENT INSTRUCTIONS` (pasos 1, 1.5, 2 y reglas críticas) |
| `.agents/templates/sdd/spec.template.md` | Sync del template canónico |
| `docs/funky-ai/prompts/sdd/funky-spec.md` | T3: extracción explícita de dominio, resolver contradicción FULL Spec, agregar ejemplo |
| `docs/funky-ai/prompts/sdd/funky-propose.md` | T3: capabilities con paths, regla explícita de formato |
