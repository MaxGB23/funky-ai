# Spec: Contratos y Templates (Workflows)

## 1. Contrato de Parámetros de Delegación (El E1)

El Orquestador debe manejar un vocabulario estándar de parámetros de lanzamiento que aplique **exclusivamente al delegar Workflows** (Tier 3 y Tier 4). En Tiers bajos (1 y 2) la operación es secuencial y más sencilla con chalanes regulares, por lo que **estos parámetros no aplican ni se esperan**.

**Deprecación de `artifact_state`:**
Inicialmente se usaba el parámetro `artifact_state` para indicar si se creaba desde cero o si había un WIP. Esto era ineficiente y causaba consumo innecesario de tokens. Dado que los workflows se usan en Tier 3/4 (donde **no hay templates** base de diseño), el comportamiento por defecto de un workflow es **crear el archivo y su contenido desde cero**. 
Si en el raro caso (10%) ya existe un borrador o un WIP que necesita ser continuado, el Orquestador **no usará un parámetro**, sino que inyectará una regla en lenguaje natural al delegar: *"este artefacto necesita mejoras, analízalo y compleméntalo"*.

### 1.1 El Contrato Base
```yaml
has_design: true | false
feature_name: string
tag: string | null
```

### 1.2 Resolución por Tier y Frontmatter
- **Cero Acoplamiento:** El Orquestador **no debe** conocer la firma interna de cada workflow. Simplemente deriva los valores del contrato según el **Tier** en curso (ej. T3/T4 → `has_design: true`).
- **Inyección Limpia:** Los parámetros se pasan estrictamente como **Frontmatter en el prompt de delegación** hacia el workflow.
- **Instrucción de WIP:** Si existe un avance, el Orquestador añade la instrucción explícita de *"analizar y complementar"* directo en el prompt.

### 1.3 Ciclo de Transición (Progressive Enhancement)
- **Fase 1 (Actual - Puente Manual):** El Orquestador determina los parámetros y le devuelve al humano el comando del workflow listo para *copy-paste*. El humano audita y lanza el workflow manualmente.
- **Fase 2 (Futuro - Automatización):** El Orquestador empuja exactamente el mismo payload de forma programática al subagente.

---

## 2. El Template Siempre Manda (E2 - Caso Especial `tasks.md`)

Aunque en Tier 3/4 no se inyectan plantillas para el diseño, hay una excepción: el `tasks.md`.
Un template físico (ej. el `tasks.md` inyectado por el CLI con su `Phase 0: Branch Setup`) es solo la "hoja membretada". Que la hoja tenga estructura no significa que el trabajo esté avanzado.

### 2.1 Preservación de la Estructura sin Hackear Parámetros
En versiones previas se sugería hackear parámetros para evitar que un workflow destruyera los cimientos de un template (como la Fase 0). 

**Ley Absoluta:**
Para proteger plantillas críticas (como `tasks.md`), el CLI inyecta el template a huevo. La preservación es **responsabilidad exclusiva del prompt interno del workflow** (ej. `/funky-tasks`), el cual debe incluir la directiva innegociable: *"Respeta la estructura base que encuentres, solo rellena, NUNCA sobreescribas desde cero"*.
Esto garantiza que el workflow rellene las tareas sin necesidad de parámetros de estado, y sin borrar la estructura base.

---

## 3. Contexto de Workflows vs Rigidez de Templates (E3)

El Orquestador confía en la especialización.
La flexibilidad la dictan los workflows de los Tiers superiores (Tier 3/Tier 4) por sobre la rigidez de los templates. El Orquestador no desgasta sus tokens enviando un prompt restrictivo explicando cómo estructurar la fase; le delega el trabajo pasando el contrato de parámetros (E1) y asume que el workflow ya tiene la inteligencia interna para resolverlo.

---

## 4. Custom Workflows y Exclusión de Templates (§5)

### 4.1 Uso Exclusivo en Tiers Altos
Los Custom Workflows (agentes libres operando bajo sus propios prompts y no bajo la estructura de los templates base SDD) están reservados **estrictamente para Tier 3 y Tier 4**.

En Tier 1 y Tier 2 (Standard Features) **nunca se delegan workflows de fases completas**; la operación debe seguir obligatoriamente la inyección mecánica de los templates estándar y la ejecución *inline* o con chalanes regulares. Esto previene el *cowboy coding*.

### 4.2 Lógica de Exclusión en Tiers Altos
Cuando el Orquestador o el humano deciden activar un Custom Workflow en T3/T4:
- **Se omite por completo** la inyección mecánica de plantillas base del SDD (nada de inyectar `explore.md` o `proposal.md` vacíos). Esto evita confundir al agente libre con archivos *dummy*.
- Al no haber templates, el workflow asume por defecto que debe crear el análisis o diseño **libremente y desde cero**.
- Si el humano o un agente previo ya dejó un avance de contenido, el Orquestador simplemente le instruye en el prompt: *"este artefacto ya tiene un avance, analízalo y compleméntalo"*.
