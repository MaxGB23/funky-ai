# Documentation Checklist: [Nombre de la Funcionalidad o Cambio]

> Checklist de documentación core para el Orquestador. Completar al finalizar la feature o antes de archivar.

---

## 📋 Checklist de Documentación

### ADRs (Architecture Decision Records)
- [ ] **ADR nuevo:** ¿Se tomó una decisión de arquitectura que requiere ADR?
  - Si sí → Crear `docs/adrs/NNNN-<slug>.md` con: Contexto, Decisión, Consecuencias
  - Si no → OMITIDO

### Documentación de Arquitectura
- [ ] **Diagramas:** ¿Cambió la estructura de componentes/módulos?
  - Si sí → Actualizar diagramas en `docs/` o README
  - Si no → OMITIDO
- **Archivos a revisar:**
  - `docs/architecture-assessment.md`
  - `PROJECT-CANVAS.md` / `INFRA-CANVAS.md` (si aplica)

### API Docs
- [ ] **Endpoints nuevos/modificados:** ¿Se agregaron o cambiaron endpoints públicos?
  - Si sí → Actualizar documentación de API
  - Si no → OMITIDO
- [ ] **DTOs / Schemas:** ¿Cambiaron contratos de request/response?
  - Si sí → Actualizar schemas
  - Si no → OMITIDO

### User-Facing Changes
- [ ] **CHANGELOG.md:** ¿El usuario final nota el cambio?
  - Si sí → Agregar entrada al CHANGELOG
  - Si no → OMITIDO
- [ ] **README.md:** ¿Hay instrucciones nuevas o cambiadas?
  - Si sí → Actualizar README
  - Si no → OMITIDO
- [ ] **Migración:** ¿El usuario necesita hacer algo para actualizar?
  - Si sí → Documentar guía de migración
  - Si no → OMITIDO

---

## 📝 Notas

[Notas adicionales sobre documentación pendiente o decisiones tomadas durante la feature.]
