### [DISCOVERY][release-template-ssot] Release Templates SSOT
**What:** Los release artifacts construidos "mirando el anterior" generan drift y pérdida de formato.
**Why:** La ausencia de una única fuente de verdad (SSOT) permite la divergencia estructural.
**Where:** Archivos de release generados manualmente.
**Learned:** Fix en v1.10.0: Crear template canónico `release.md` + comando `funky release <version>` con interpolación de `{{version}}` y `{{date}}`.