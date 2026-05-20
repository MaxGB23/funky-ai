# Spec: 015 Protocolos On-Demand

## 1. Arquitectura de la Solución

El flujo de trabajo quedará establecido de la siguiente manera:
1. El Orquestador redacta el `tasks.md`. Lee `.agents/protocols/index.md` para ver qué protocolos existen. Si detecta una fase arquitectónicamente compleja, le añade el tag `[⚠️ RIESGO ALTO - Sugiero protocolo: devil-advocate]`.
2. El humano revisa el `tasks.md`, nota la advertencia, y le dice al Orquestador en el chat: *"Leé `.agents/protocols/devil-advocate.md` y aplicalo a la Fase X"*.
3. El Orquestador ejecuta el rol temporalmente y devuelve un reporte. NO delega.
4. **Distribución:** El CLI distribuirá un catálogo de protocolos. Un comando interactivo permitirá al usuario seleccionar cuáles importar al proyecto local.

## 2. Componentes a Implementar

### A. Estructura Local de Protocolos
- **`index.md`:** Actúa como registro central. El Orquestador lo leerá para sugerir protocolos.
- **`devil-advocate.md` (PoC):** Instrucciones para actuar como Auditor Estricto.

### B. Modificación a los Templates de Tasks
**Archivos:** `.agents/templates/sdd/tasks.md` y `funky-cli/src/templates/sdd/tasks.md`
**Cambio:** Añadir la instrucción `> **[SISTEMA — PARA EL ORQUESTADOR]**` antes de las Fases. Indicar que evalúe el riesgo y etiquete títulos sugiriendo un protocolo basado en el `index.md`.

### C. CLI Distribution & Selector Interactivo
**Directorios Base:**
- Crear `funky-cli/src/templates/protocols/` para alojar los protocolos distribuibles (separados del scaffolding SDD habitual).
- Incluir un template para generar el `index.md` dinámicamente.

**Lógica CLI (Inquirer):**
- Modificar el flujo de inicialización o crear un sub-comando (ej. `funky init protocols`) que escanee el directorio de templates.
- Mostrar un selector múltiple (`checkbox` en Inquirer) para que el humano elija cuáles inyectar.
- Copiar los elegidos a `.agents/protocols/` del usuario y regenerar el `index.md` local.

## 3. Criterios de Aceptación (DoD)
- [ ] Carpeta local `.agents/protocols/` creada con `index.md` y `devil-advocate.md`.
- [ ] Templates `tasks.md` modificados con el flag de riesgo.
- [ ] Carpeta `funky-cli/src/templates/protocols/` poblada en el CLI.
- [ ] Selector interactivo funcional en el CLI para importación "a-la-carte".
