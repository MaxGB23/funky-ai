# 2026-05-23: Decisión Estratégica sobre el Ecosistema de Herramientas IA

> **Propósito:** Documentar el pivot estratégico respecto al uso de las distintas interfaces (CLI, IDE, Desktop) y la cancelación/pausa de la v3.0 (Funky AI Engine Automático).

---

## 🛑 Contexto
Estábamos evaluando desarrollar la versión 3.0 (un motor asíncrono y automático complejo) para llevar el CLI al nivel de alternativas masivas como OpenCode o Claude Code. Sin embargo, este enfoque iba en contra de nuestra premisa de **Context Economy**, requiriendo un potencial consumo excesivo de tokens y complejizando la operativa.

## 💡 Resolución y Enfoque

Se decide pivotar hacia una estrategia pragmática, especializando cada herramienta del ecosistema para su mejor caso de uso:

1. **`antigravity-ide` + Funky AI (La herramienta de combate diario):**
   - Será la plataforma principal para aplicar nuestra propia metodología de trabajo.
   - **Por qué:** Al ser una integración más sencilla, consume sustancialmente menos tokens (perfecto para proyectos sencillos y para aprovechar el *free tier* de los modelos de Gemini). Mantiene al desarrollador 100% en control.

2. **`antigravity-cli` + Gentle AI (El pilar estructural y de alta calidad):**
   - El CLI sigue siendo el **pilar a nivel personal y arquitectónico**. Su potencial es enorme.
   - Se emparejará su uso con **Gentle AI**. Esta combinación es altamente eficiente y **extremadamente robusta en cuanto a desarrollo**.
   - **Por qué:** Cuenta con un proceso SDD completo (*Full SDD*) y *features* muy interesantes a nivel de arquitectura. Esto es resultado directo de que su creador tiene más de 15 años de experiencia, siendo GDE y MVP.
   - **Consideración de cuota:** Este proceso arquitectónico tan profundo hace que una sola *feature* pueda llegar a consumir la cuota de los modelos del *free tier*. Es vital entender que esto **no es porque esté mal optimizado**, sino por el nivel de exhaustividad y la **excelente calidad de trabajo** que puede entregar. Por ello, se destinará a **casos específicos** de alto impacto.

3. **`antigravity-desktop` (Soporte implícito):**
   - Aunque no hay un interés activo en utilizar la versión Desktop en nuestro flujo, dado que funciona bajo los mismos estándares y directorios, el soporte técnico a nivel de base de código se mantiene de forma colateral sin requerir esfuerzo extra.

## 🔄 El Flujo Híbrido Maestro (Human-in-the-Loop)

Para maximizar la eficiencia y el control, se establece el siguiente pipeline de trabajo para proyectos complejos:

1. **Diseño y Arquitectura (CLI + Gentle AI):** El CLI se encarga de las fases de análisis, exploración y redacción de los artefactos críticos (`spec.md`, planes de prueba, diagramas). Es el **Arquitecto**.
2. **Handoff (Pausa Estratégica):** El desarrollador interviene en el CLI con la directiva: *"La fase de ejecución la hago yo y regreso para continuar con el verify"*.
3. **Ejecución (IDE + Funky AI):** Se utiliza el IDE (ágil, de bajo consumo de tokens y aislado de skills globales) para escribir el código línea por línea basándose en los planos generados en el paso 1. Es el **Obrero**.
4. **Verificación (Regreso al CLI):** Una vez ejecutado el código, el humano retoma la sesión en el CLI para que Gentle AI realice el `verify` final, auditando la calidad y el cumplimiento del diseño.

Este patrón consolida la premisa de que **la IA es una herramienta y el humano siempre lidera**, optimizando tanto la cuota de modelos como la calidad del código.

## 🔨 Impacto en el Roadmap (ORCHESTRATOR-STATE)
- **Se cancela/pausa indefinidamente la Feature 3.0** (Funky AI Engine Automático). 
- La arquitectura v2.3.0 queda consolidada como la versión estable de referencia.
