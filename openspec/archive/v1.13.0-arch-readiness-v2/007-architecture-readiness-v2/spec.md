# Specification: Architecture Readiness Gate v2 (007)

## 1. Arquitectura de la Solución
El objetivo de esta fase es expandir el contexto que Funky AI tiene sobre el proyecto antes de empezar a escribir código, asegurando que los requerimientos no funcionales (NFRs) críticos queden explícitamente definidos. Además, cambiamos el paradigma del motor de evaluación: la revisión arquitectónica de la IA pasa de ser un "fallback en caso de error" a un paso **obligatorio** en el flujo SDD.

## 2. Modificaciones al Modelo de Datos (Template)
**Archivo objetivo:** `funky-cli/src/templates/sdd/architecture-assessment.md`

Se agregarán las siguientes secciones estructuradas para obligar al usuario a definir restricciones duras del proyecto. Esto servirá de base futura para el *Cost Estimator*:

- **Compliance & Data Residency:** ¿Hay normativas estrictas? (Ej: GDPR, HIPAA, "Solo servidores en México").
- **Expected Peak Concurrency:** Carga máxima esperada (Ej: 1000 req/sec, "Uso interno de 5 personas").
- **Team Seniority / Capabilities:** (Ej: Equipo Junior, DevOps Dedicado, Solo Frontend).
- **Hosting Budget:** Límite financiero mensual (Ej: $20/mes, Serverless gratuito, Ilimitado).
- **SLA & Redundancy:** Nivel de disponibilidad esperado (Ej: 99.9%, Multi-AZ, Tolerante a caídas).

*Nota de diseño:* Se mantendrá el parseo liviano existente en la herramienta. Los datos deben ser fácilmente extraíbles mediante expresiones regulares o parsing simple en `assess.js`.

## 3. Refactor de la Lógica de Evaluación
**Archivos objetivo:** `funky-cli/src/commands/assess.js` y el generador de prompts asociado.

### Flujo Actual (v1.12.0)
1. Parsea `architecture-assessment.md`.
2. Corre reglas estáticas.
3. **Branching:** Solo si hay errores -> Crea `.agents/prompts/architecture-review.md`.

### Nuevo Flujo (v1.13.0)
1. Parsea `architecture-assessment.md` extrayendo los datos básicos + los nuevos NFRs.
2. Corre reglas estáticas.
3. **Branching Unificado:** **SIEMPRE** se genera el `.agents/prompts/architecture-review.md`:
   - **Caso con errores:** Se inyectan los "Challenges" del CLI y los nuevos NFRs. Se le pide a la IA que destruya la propuesta.
   - **Caso sin errores:** Se inyectan los nuevos NFRs. Se le instruye a la IA que actúe como *Devil's Advocate*, buscando inconsistencias invisibles (Ej: "Tenés un SLA de 99.99% pero tu budget es de $5. Esto es irrealizable").

## 4. Evolución del Template de Prompt
**Archivo objetivo:** `funky-cli/src/templates/sdd/architecture-review-template.md` (o su equivalente interno).

El template que se usa para generar el prompt final debe ser actualizado para incluir los nuevos NFRs. Debe instruir al agente LLM a correlacionar estos valores.

## 5. Estrategia de Testing (Test Plan)
1. **Unit Tests:** Modificar/añadir tests en `assess.test.js` para asegurar que la función que escribe el archivo `.agents/prompts/architecture-review.md` es invocada `100%` de las veces, independientemente del resultado de las reglas.
2. **Parsing Validation:** Testear la extracción correcta de los campos *Budget*, *SLA*, etc.
3. **Integration / Smoke Test:** Ejecutar el binario en un directorio de prueba, verificar que se copien los nuevos templates de assessment y que, al correr `funky assess`, se escupa un prompt denso y rico en contexto.
