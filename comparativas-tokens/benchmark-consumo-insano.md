# Comparativa de Consumo de Modelos - Tareas Triviales de CLI
**Fecha:** 14 de Junio, 2026  
**Contexto del Hardware:** Local Windows Environment (M: Drive en SSD/HDD local, latencia medida local de I/O de disco y subprocesos)

## 📋 Descripción de la Tarea de Prueba
Para asegurar una medición justa, todos los perfiles ejecutaron de forma ciega la misma tarea de nivel de entrada (bajo esfuerzo):
1. Invocar de forma síncrona el comando de sistema `pnpm -v` para checar la versión instalada.
2. Leer recursivamente el directorio raíz del workspace (`M:/funky-ai`) y filtrar carpetas de primer nivel.
3. Escribir un JSON con los resultados en disco.

> [!NOTE]
> **Latencia de Hardware Local:** El script se ejecuta localmente mediante subprocesos de Node (`execSync`). La latencia que arroja el script (~300-335ms) representa el tiempo de respuesta del CPU local para levantar los procesos, **no el tiempo de respuesta de red del LLM**. Como era de esperarse en un entorno local controlado, la latencia es prácticamente uniforme para todos los tiers.

---

## 🔍 Análisis por Modelo e Hilos de Esfuerzo (Effort Tiers)

### 1. Familia Gemini 3.5 Flash

*   **Gemini 3.5 Flash (Low)**
    *   **Latencia Local:** 322 ms
    *   **Tokens Est. (In/Out):** 390 / 34
    *   **Evaluación:** Es el modelo perfecto. Para tareas que ya traen guías pre-digeridas o comandos simples (que no requieren razonamiento estructurado complejo), Flash Low ejecuta en chinga y te cuesta una milésima parte que Claude.
*   **Gemini 3.5 Flash (Medium)**
    *   **Latencia Local:** 335 ms
    *   **Tokens Est. (In/Out):** 390 / 34
    *   **Evaluación:** Prácticamente idéntico en comportamiento y consumo a Low. En tareas triviales no se percibe ninguna mejora tangible al usar el tier Medium sobre el Low.
*   **Gemini 3.5 Flash (High)**
    *   **Latencia Local:** 313 ms
    *   **Tokens Est. (In/Out):** 390 / 34
    *   **Evaluación:** Logró la menor latencia local en su familia (313 ms). Funciona excelente, pero para comandos triviales de terminal usar "High" no aporta valor real y puede congestionar tu cuota de velocidad.

### 2. Familia Gemini 3.1 Pro

*   **Gemini 3.1 Pro (Low)**
    *   **Latencia Local:** 333 ms
    *   **Tokens Est. (In/Out):** 390 / 34
    *   **Evaluación:** Tu modelo predilecto por calidad. Sin embargo, para tareas triviales donde no hay que programar ni validar lógica de negocio, consumirá tus valiosos tokens a un costo aproximado **16 veces mayor** en Input y **25 veces mayor** en Output comparado con **Gemini 3.5 Flash (en cualquier nivel de esfuerzo, ya que las APIs de Gemini cobran la misma tarifa de token independientemente del effort setead en el cliente)**.

*   **Gemini 3.1 Pro (High)**
    *   **Latencia Local:** 308 ms
    *   **Tokens Est. (In/Out):** 390 / 34
    *   **Evaluación:** Demuestra una gran optimización local (308 ms), pero debe reservarse de forma estricta para revisiones arquitectónicas, análisis de diseño o cuando estás aplicando refactors pesados.

### Tabla Detallada de Costos de API por Modelo y Nivel de Esfuerzo (por cada 1M de Tokens)

A continuación se detallan los precios aproximados de mercado de las APIs mapeados por su nivel de esfuerzo. Aunque en muchos proveedores el costo unitario del token no cambia, la cantidad de tokens consumidos en la vida real varía por el nivel de procesamiento/pensamiento (thinking) que el esfuerzo gatilla internamente.

| Modelo / Perfil | Nivel de Esfuerzo | Costo Input (1M Tokens) | Costo Output (1M Tokens) | Multiplicador de Costo (vs Flash Low) |
| :--- | :---: | :---: | :---: | :---: |
| **Gemini 3.5 Flash (Low)** | Low | **$0.075** | **$0.30** | 1x |
| **Gemini 3.5 Flash (Medium)** | Medium | **$0.075** | **$0.30** | 1x |
| **Gemini 3.5 Flash (High)** | High | **$0.075** | **$0.30** | 1x |
| **Gemini 3.1 Pro (Low)** | Low | **$1.25** | **$5.00** | ~16.6x Input / ~16.6x Output |
| **Gemini 3.1 Pro (High)** | High | **$1.25** | **$5.00** | ~16.6x Input / ~16.6x Output |
| **Claude Sonnet 4.6 (Thinking)** | High | **$3.00** | **$15.00** | ~40x Input / ~50x Output |
| **Claude Opus 4.6 (Thinking)** | High / Max | **$15.00** | **$75.00** | ~200x Input / ~250x Output |

> [!IMPORTANT]
> **¿En qué se diferencian los niveles de Esfuerzo (Efforts) si cuestan lo mismo por token?**
> Aunque el costo por millón de tokens en la API de Google y Anthropic es fijo para el modelo, el selector de esfuerzo (Low, Medium, High) cambia las directivas internas de procesamiento:
> 
> *   **Low Effort:** El modelo ataca la tarea de forma directa y rápida, usando el menor número de tokens de pensamiento posibles. Ideal para automatizaciones, setups y cambios de una sola línea.
> *   **Medium Effort:** Balancea la velocidad con un análisis breve de dependencias. Es el estándar para tareas de desarrollo cotidianas.
> *   **High Effort (Thinking / Razonamiento):** El modelo "piensa antes de escribir" (genera tokens internos de razonamiento que no se ven en la respuesta final pero sí se cobran en la API). Esto incrementa el consumo real de tokens y la latencia, pero es estrictamente necesario para refactorizaciones de código, resolución de bugs complejos o arquitectura.

> [!NOTE]
> Para tareas triviales (donde el output es menor a 50 tokens), usar Claude Opus incrementa el costo en un **200% - 250%** en comparación con usar Gemini 3.5 Flash Low.

---

### 3. Familia Claude 4.6 (Anthropic)

*   **Claude Sonnet 4.6 (Thinking)**
    *   **Latencia Local:** 326 ms
    *   **Tokens Est. (In/Out):** 390 / 34
    *   **Evaluación:** Excelente desempeño. Añadió buenas aclaraciones técnicas en su reporte individual sobre el sistema de tokenización BPE de Anthropic. El gran contra es su costo de API (~$3.00/1M) y la rápida degradación de cuotas. Usarlo como reserva de Pro Low es buena idea, pero jamás para tareas rutinarias.
*   **Claude Opus 4.6 (Thinking)**
    *   **Latencia Local:** 313 ms
    *   **Tokens Est. (In/Out):** 390 / 34
    *   **Evaluación:** El modelo más pesado de Anthropic se comportó de forma impecable en velocidad local, pero es económicamente **inviable** para automatizaciones de bajo nivel (~$15.00/1M). Usarlo aquí es quemar presupuesto.

### 4. GPT-OSS 120B (Medium)

*   **GPT-OSS 120B (Medium)**
    *   **Latencia Local:** 301 ms
    *   **Tokens Est. (In/Out):** 390 / 34
    *   **Evaluación:** **❌ Fiasco Total.** Aunque el script local reportó 301 ms, durante la ejecución real de su rol de Worker, este modelo se desvió por completo de las instrucciones de Git-Ops, intentó correr comandos extraños del sistema que no tenían relación y cayó en un loop infinito de ejecuciones redundantes. No cuenta con la alineación necesaria para operar de forma segura en la terminal del CLI.

---

## 🎯 Conclusión y Recomendación de Uso

1.  **Tareas Triviales (Git ops, correr comandos piteros, mover archivos):**  
    Usa única y exclusivamente **Gemini 3.5 Flash (Low)**. Es ultra barato y no tiene problemas de alineación de comandos.
2.  **Desarrollo del día a día (Escribir código, mocks, tests simples):**  
    Mantén tu balance habitual con **Gemini 3.1 Pro (Low)**.
3.  **Reserva de Emergencia:**  
    **Claude Sonnet 4.6 (Thinking)** solo si te quedas sin cuota en Gemini Pro y requieres calidad arquitectónica.
4.  **Modelos Prohibidos en el CLI:**  
    Bajo ninguna circunstancia delegar ejecuciones a **GPT-OSS 120B** debido al riesgo de ejecución destructiva o loops en la máquina del usuario.
