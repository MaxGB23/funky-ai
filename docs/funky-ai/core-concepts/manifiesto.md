# Funky AI: Manifiesto y Reglas Inviolables

## ¿Qué es Funky AI?

Funky AI es un **framework de orquestación de agentes de IA basado en archivos**, diseñado para correr exclusivamente sobre el IDE **Antigravity**. No es un plugin, no es una librería, no es una app. Es un **protocolo de trabajo** que convierte a un desarrollador humano en el Director de una red de modelos de lenguaje especializados.

Su propósito central es uno solo:
> **Eliminar el trabajo de bajo nivel del desarrollador (bugs triviales, scaffolding, documentación) para que este pueda enfocarse en decisiones de arquitectura de alto impacto.**

Funky AI es la respuesta a una pregunta concreta: *"¿Cómo usamos modelos de IA de razonamiento de último nivel (Gemini) de forma gratuita, estructurada y predecible, sin depender de infraestructura de servidores ni bases de datos?"*

La respuesta es: **Con un sistema de archivos Markdown y un Humano como Router.**

---

## Los 4 Componentes del Sistema

| Componente | Rol | Analogía |
|---|---|---|
| **El Router Humano** | Dirige la orquestación. Abre chats, copia Envelopes, toma decisiones críticas | El Gerente de Proyecto |
| **El Orquestador (Tier 1)** | Planifica, diseña, genera especificaciones en disco. NUNCA pica código | El Arquitecto de la Obra |
| **El Worker (Tier 2/3)** | Ejecuta instrucciones cerradas. NUNCA improvisa | El Albañil |
| **El Falso Engram** | `docs/post-mortem.md` + skills. Memoria estructurada del proyecto en disco | La Base de Datos |

---

## 🚨 Las Reglas Inviolables (Hard Rules)

Estas reglas son las "leyes de la física" de Funky AI. Violarlas no genera un error de compilación; genera **caos de contexto, pérdida de memoria y resultados impredecibles**. Son el equivalente de las restricciones que Gentle AI hardcodea en su Orquestador.

### ❌ Regla 1: El Orquestador NO Ejecuta Código de Negocio
El chat del Orquestador solo puede crear archivos de arquitectura (`.md` de propuestas, specs, plans, concepts). Nunca escribe código ejecutable (`.js`, `.ts`, `.go`, `.py`). Si el Orquestador empieza a picar código de dominio, el contexto del chat se ensucia con detalles de implementación y pierde su capacidad de razonar sobre la arquitectura global.

### ❌ Regla 2: Todo Worker Entrega un Return Envelope Físico en Disco
Está terminantemente prohibido que un Worker "devuelva su respuesta en el chat". Todo reporte de tarea terminada debe ser un archivo `.md` físico creado en disco con el formato estricto: `status`, `executive_summary`, `artifacts`, `next_recommended`, `risks`. El chat del Worker es descartable; el archivo en disco es el contrato.

### ❌ Regla 3: El Engram se Consulta ANTES de Modificar, No Después
Antes de cualquier modificación estructural de código, el Worker está obligado a usar `grep_search` sobre `docs/post-mortem.md`. Nunca al revés. Documentar la lección aprendida después de haberla descubierto es la segunda obligación. Saltarse la consulta inicial es condenar al equipo a repetir errores ya resueltos.

### ❌ Regla 4: El Contexto se Protege con Lectura en 2 Pasos
Está prohibido hacer `view_file` sobre archivos desconocidos o masivos sin antes usar `grep_search` para confirmar la relevancia del contenido. La ventana de contexto de un LLM es el recurso más caro del sistema. Un `view_file` ciego sobre un archivo de 500 líneas puede destruir el 40% de la memoria de trabajo disponible.

### ❌ Regla 5: `main` es Sagrado
Ningún Worker genera código directamente sobre la rama `main`. La primera acción obligatoria de todo Worker que toque código es crear y posicionarse en una rama de feature (`git checkout -b feature/[nombre-tarea]`). El humano (Router) es el único que aprueba y mergea de vuelta.

### ❌ Regla 6: Funky AI se Activa por Decisión Consciente
Funky AI no se usa para scripts rápidos, fixes de una línea ni experimentos desechables. El "impuesto" del protocolo (abrir chats, copiar Envelopes, mantener el Engram) solo vale la pena en **proyectos de ingeniería reales** donde la calidad del razonamiento y la trazabilidad de decisiones arquitectónicas importan.
