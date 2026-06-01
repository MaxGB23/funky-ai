### [DISCOVERY][cli-missing-readme] CLI sin README de Instalación/Uso
**What:** `funky-cli/` no tiene `README.md`. Un nuevo colaborador que clone el repo no tiene ninguna guía de cómo instalar el CLI (pnpm link), qué comandos existen ni qué hace cada uno.
**Why:** La v1.4 estuvo enfocada en implementar la funcionalidad. La documentación de superficie del paquete fue omitida.
**Where:** `funky-cli/README.md` — archivo inexistente.
**Learned:** Cada paquete publicable debe tener su README como criterio de Done (DoD). Agregar al checklist de release: "¿Existe README con instalación + comandos + ejemplos?".