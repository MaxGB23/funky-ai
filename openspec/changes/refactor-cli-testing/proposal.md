# Proposal: Refactor CLI Testing (Purga y Desacople)

## Intent
Resolver la fragilidad de los tests del CLI (`funky-cli/tests/`) eliminando las aserciones basadas en texto literal (prosa humana/IA) que rompen la suite ante cambios estéticos en los templates. Adicionalmente, mejorar el diseño de `funky-cli/src` (código espagueti) aislando las interacciones con el FileSystem (I/O) de la lógica de presentación y ruteo, para facilitar pruebas unitarias robustas sin dependencias físicas excesivas.

## Scope
### In Scope
- Purgar aserciones literales (`toContain(...)`) en todos los archivos bajo `funky-cli/tests/`.
- Refactorizar `funky-cli/src/commands/` (especialmente `init.js` y `feature.js`) extrayendo operaciones I/O hacia utilidades/servicios aislables.
- Implementar aserciones estructurales: verificar creación de archivos (`fs.existsSync`) y contratos máquina obligatorios (etiquetas/regex esenciales).
- Asegurar idempotencia y manejo de flujos (flags dinámicos) con tests estructurales/mockeados.

### Out of Scope
- Migración de frameworks de testing.
- Refactorización de comandos ajenos a los tests frágiles detectados si ya cumplen un buen nivel de abstracción.
- Re-escritura total de los contenidos de los templates de IA.

## Capabilities
### New Capabilities
- `<Mockable-CLI-IO>`: Capacidad de ejecutar flujos de comandos CLI interceptando/mockeando lecturas y escrituras al sistema de archivos para validación lógica pura.

### Modified Capabilities
- `<Resilient-Test-Suite>`: Suite de tests modificada para ser agnóstica a la prosa y estética de los templates.
- `<Command-Injection>`: Refactor de los comandos para separar la decisión de qué archivos crear de la acción de crearlos físicamente.

## Approach
El refactor tomará un enfoque "Outside-In":
1. **Desacople en src**: Aislar las operaciones de copiado/generación de archivos de los comandos core (`init`, `feature`) mediante funciones puras que retornen el estado deseado (qué crear, dónde) e invocar adaptadores I/O para efectuar los cambios.
2. **Purgado en tests**: Borrar las líneas `expect(...).toContain('texto literal')`.
3. **Tests Estructurales**: Reemplazar aserciones por validaciones de paths correctos y existencia de etiquetas orquestadoras estructurales `<COMO_ESTA>`. 
4. Utilizar `memfs` u herramientas de mocking de `fs` (o funciones utilitarias) para tests sin I/O, comprobando puramente las intenciones de escritura.

## Affected Areas
| Area | Impact | Description |
|---|---|---|
| `funky-cli/tests/` | Alto | Reescritura/purga masiva de aserciones. |
| `funky-cli/src/commands/init.js` | Medio | Extracción de `fs.copyFileSync`, `fs.mkdirSync`, etc. a funciones inyectables o abstracciones. |
| `funky-cli/src/commands/feature.js` | Bajo | Ajustes menores de abstracción si corresponde, ya que actualmente define lógica pura `resolveFiles` separada. |
| `funky-cli/src/utils/` | Medio | Nuevos adaptadores I/O u objetos que encapsulen las escrituras. |

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Regresiones silenciosas en comandos core | Alta | Mantener y reforzar los "Golden path tests" que verifican el output en disco o en mocks asegurando que los archivos existen y están completos. |
| Falsos positivos por falta de validación de contenido | Media | Validar presencia de metadatos o tags máquina críticos, y tamaño mínimo de archivo (para detectar archivos vacíos). |

## Rollback Plan
- Revertir los commits del refactor (`git revert`).
- Restaurar los snapshots o el estado anterior de `funky-cli/tests/` y `funky-cli/src/` usando el control de versiones local.

## Dependencies
- Ninguna dependencia externa crítica nueva.

## Success Criteria
- [ ] Todos los tests de la suite CLI pasan exitosamente.
- [ ] Alterar palabras arbitrarias en un template (ej. cambiar `# 🚀 PROJECT CANVAS` por `# PROJECT CANVAS`) no rompe ningún test.
- [ ] La cobertura de código (coverage) para los comandos principales se mantiene igual o superior.
