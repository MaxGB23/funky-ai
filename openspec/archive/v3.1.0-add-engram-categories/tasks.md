# Tasks: [Nombre de la Funcionalidad o Cambio]

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/nombre-del-branch`

> **ORCHESTRATOR GATE**: Si eres el Orquestador — STOP. Do NOT execute these instructions inline. Delega al worker o sub-agente.

---

> **[SISTEMA — PARA funky-tasks]** Si detectas que una fase tiene lógica de negocio compleja o decisiones de diseño críticas, limítate a etiquetar su título con `[⚠️ RIESGO ALTO]`.

> **GUARDRAIL DE TAREAS (Budget: ≤ 530 palabras):**
> Cada tarea DEBE cumplir estos criterios:
> | Criteria | ✅ Bien | ❌ Mal |
> |----------|---------|--------|
> | Specific | "Create internal/auth/middleware.go con validación JWT" | "Add auth" |
> | Actionable | "Add ValidateToken() a AuthService" | "Handle tokens" |
> | Verifiable | "Test: POST /login retorna 401 sin token" | "Make sure it works" |
> | Small | Un archivo o una unidad lógica | "Implement the feature" |
> | NFR Tagging | "`[nfr:latency]` Add cache to GET /users" | "Make it fast" |

### FASE 0 — Branch Setup                                                                                                                                                
    - [ ] Crear rama `feature/add-engram-categories`.                                                                                                                        
                                                                                                                                                                             
    ### FASE 1 — Actualización de Reglas y Documentación                                                                                                                     
    - [ ] 1.1 Modificar `engram-protocol.md` para agregar `session` y `release`.                                                                                             
    - [ ] 1.2 Modificar `docs/engram/index.md` para agregar los encabezados `## Session` y `## Release`.                                                                     
                                                                                                                                                                             
    ### FASE 2 — Modificación del CLI                                                                                                                                        
    - [ ] 2.1 Modificar `funky-cli/src/commands/engram.js` (agregar Inquirer choices y helper text).                                                                         
    - [ ] 2.2 Modificar `funky-cli/src/commands/init.js` (asegurar que el scaffold base genere los nuevos directorios y encabezados).                                        
                                                                                                                                                                             
    ### FASE 3 — Pruebas y Validación                                                                                                                                        
    - [ ] 3.1 Actualizar tests en `funky-cli` (`engram.test.js`) con las nuevas aserciones.                                                                                  
    - [ ] 3.2 Correr la suite de tests y verificar todo en verde.                               
---