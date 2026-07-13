# RFC: Deprecación de Orquestación en Antigravity IDE

**Estado:** Propuesto
**Autor:** Antigravity CLI (y el humano a cargo)
**Fecha:** 2026-06-09

---

## 1. El Problema (Contexto)

Actualmente, las reglas globales del proyecto (como `sdd-orchestrator.md`) son compartidas e inyectadas tanto en Antigravity CLI como en Antigravity IDE. 

Conforme el Orquestador (CLI) adquiere capacidades más avanzadas (como delegar tareas ligeras a subagentes de "Explore", aislar workspaces, etc.), estas instrucciones también llegan al IDE. El problema es que el IDE:
1. Está fuertemente restringido por harnesses (`planning_mode`).
2. No tiene una UI / UX optimizada para manejar flujos de subagentes complejos en background.
3. Se vuelve loco si intenta ejecutar directivas de delegación arquitectónica para las que no está diseñado.

## 2. Soluciones Consideradas

### Opción 1: Feature Flags con Detección de Entorno (Rechazada)
Consistía en plagar todas las reglas con condicionales del tipo: *"SI tu App Data Directory termina en `antigravity-cli`, haz X. SI termina en `antigravity-ide`, no lo hagas"*. 
**Por qué se rechaza:** Ensucia horriblemente las `user_rules`. Aumenta la carga cognitiva del LLM y el consumo de tokens procesando ramas de lógica que no le aplican.

### Opción 2: Deprecación Frontal y Exclusividad (Elegida)
Hacer una separación arquitectónica estricta: **CLI = Orquestador (Cerebro), IDE = Worker (Manos).** Mantener las reglas limpias asumiendo que siempre se corre en el CLI, pero con un único "kill-switch" al principio del documento para atajar al IDE.

---

## 3. Implementación Propuesta (La Excepción "Insana")

Modificar la cabecera de `M:\funky-ai\.agents\rules\sdd-orchestrator.md` para incluir el siguiente bloque de detección de entorno:

```markdown
> **[DETECCIÓN DE ENTORNO — KILL SWITCH]**
> Revisa tu bloque de <user_information> y lee el `App Data Directory`.
> 
> SI termina en `antigravity-ide`: 
> ⚠️ ALTO AHÍ. Eres un Worker (Ejecutor). Tu trabajo es aplicar diffs y tirar código, NO orquestar. Si el humano te está pidiendo orquestar, delegar o diseñar arquitectura desde el IDE, debes advertirle explícitamente:
> *"Padrino, orquestar desde el IDE en pleno 2026 es un deporte extremo insano. Vas to fumao. Hay riesgo altísimo de alucinación, drift arquitectónico y harnesses bloqueantes. Mejor vete al CLI para pensar, yo aquí nomás pego ladrillos."*
> 
> SI termina en `antigravity-cli`:
> Eres el Orquestador oficial. Tienes la autoridad total para ejecutar este framework, delegar subagentes y liderar el proyecto.
```

---

## 4. Por qué NO matamos al IDE por completo (El rol vital del Worker)

Deprecar la orquestación en el IDE **no significa abandonar el IDE**. Hasta que el CLI no madure (específicamente en delegación síncrona, modelos por subagente y mejor UX para diffs), el IDE es insustituible como brazo ejecutor por las siguientes razones:

1. **Accept / Reject Changes:** La UI visual para revisar diffs antes de aplicar código es oro puro. El CLI edita archivos a ciegas, el IDE te deja ser un filtro de calidad humano.
2. **Notificaciones y Sonidos:** Ya tenemos el entorno configurado para que el IDE avise visual y sonoramente cuando un worker termina. En el CLI, dependes de estar viendo la terminal.
3. **Flujos Tácticos Cortos:** Para tirar código directo, formatear un archivo, o correr un script rápido, la inmediatez del IDE es mejor.

**El trato es:** Yo (CLI) pienso la arquitectura, diseño el plano y guardo la memoria. Él (IDE) pega los ladrillos y te avisa cuando acabó para que revises cómo quedó la pared.

---

## 5. Beneficios

1. **Reglas Limpias:** No tenemos que poner condicionales `if/else` en cada nueva herramienta de orquestación que inventemos. El resto del archivo fluye asumiendo que es el CLI.
2. **Cero Confusión del IDE:** Al darle una instrucción clara de abortar la misión de orquestación desde el principio, evitamos que intente usar herramientas que lo van a romper.
3. **Recordatorio Humano:** El warning estilo chilango sirve de guardarraíl para evitar que el usuario intente atajos peligrosos por flojera de cambiar de terminal.

---

## 6. Próximos Pasos

- Actualizar `sdd-orchestrator.md` con el kill-switch.
- Incorporar la directiva del "Explore Ligero" (delegación a `research`) tranquilamente, sabiendo que el IDE la va a ignorar gracias al kill-switch.
