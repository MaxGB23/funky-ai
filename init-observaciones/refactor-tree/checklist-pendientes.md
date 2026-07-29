# Checklist de Pendientes — Refactor de Templates

> Referencia: `cosas-rotas.md`

---

## ✅ Punto 1 — `--bootstrap` injection

Arreglado. `funky init --bootstrap` ahora inyecta correctamente:
- `funky-ai-rules/` → `.agents/rules/` (24 archivos)
- `bootstrap/sdd/` → `.agents/templates/sdd/` (8 archivos)
- `000-rfc-template.md` → `openspec/rfcs/` (excepción)
- 3 root files + `docs-live-index.md` generado
- `docs-index/` directorio vacío creado

---

## ✅ Punto 2 — `docs-live-index.md` + `docs-index/`

- `docs-live-index.md` se genera con el header de la tabla
- `docs-index/` directorio vacío se crea
- Nada de init, nada de lógica extra — solo estructura
- No contiene templates, el CLI lo genera directo con:
action: 'create',
content: '# 📚 Índice de Docs Vivos (SSOT)\n\n| # | Doc | ...',
---

## 🔲 Punto 3 — Decisión sobre canvases

`funky init` (sin flags) genera PROJECT-CANVAS.md e INFRA-CANVAS.md por CLI al igual que el punto 2.

- [ ] ¿Seguimos con generación por CLI (código en `canvas.js`)? ¿Los movemos a templates estáticos que init copia como el resto de archivos?

---

## 🔲 Punto 4 — `funky-pipeline/` destino

`funky-cli/src/templates/funky-pipeline/` tiene 6 archivos:
- `architecture-assessment.md`
- `architecture-decisions-template.md`
- `architecture-review-template.md`
- `canvas-planning-guide.md`
- `pricing-decisions-template.md`
- `pricing-guide-template.md`

- [ ] ¿Destino final debería ser `docs/funky-pipeline/`?
- [ ] ¿Qué comando los inyecta? Tienen su comando individual (init,assess,estimate) pero existe un flujo de funky pipeline. Analizar cómo funcionan ya que menciona algo de un json. Entenderlo primero es la clave antes de continuar.
- [ ] Decidir si necesitan refactorizarse o no. Ya que funky-cli/src/templates/funky-pipeline/ podría causar confusion por combinar files de 3 comandos diferentes, aunque a la vez se relacionan entre si.

---

## 🎯 Meta final

- [ ] Migrar `--bootstrap` a un comando independiente de funky-ai (separado de `funky init`)

## Al finalizar

- [ ] Verificar que todos los comandos salteen archivos existentes (no sobreescribir). `executeIntentions()` ya lo hace con `fs.existsSync(dest)`, pero revisar comando por comando que no haya `writeFileSync` directos sin check.
- [ ] Eliminar todo el argentinismo del repo, debe hacerse una busqueda exhaustiva. Se deben eliminar palabras como "ejecutá" por "ejecuta". Esto es mas amigable para cualquier tipo de usuario. Un framework mas amigable para cualquier tipo de público.
