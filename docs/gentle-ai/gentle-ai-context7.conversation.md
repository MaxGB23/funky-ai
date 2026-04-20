explicame, cómo es que usas context7? cuándo decides usarlo, etc
Thinking: El usuario me está preguntando sobre cómo y cuándo uso context7. Déjame revisar mi configuración y ver si realmente lo usé en esta sesión.
Revisando mi actividad en esta sesión:
1. No hice llamadas a context7_resolve-library-id ni context7_query-docs
2. Solo usé los skills de SDD que estaban precargados
No usé context7 en esta sesión. Pero el usuario quiere saber mi lógica/patrón de cuándo lo uso.
Debo explicarle honestamente que NO lo usé en esta sesión, y luego explicar cuándo y cómo lo uso normalmente.
Buena pregunta. Revisando la sesión: no usé context7 en este workflow.
Pero te explico cuándo y cómo lo uso:
Cuándo uso context7
Trigger	Ejemplo
Error de librería/version nuevo	"Next.js 16 requiere Suspense" → busco docs
No tengo el código	Necesito verificar una API que no vi antes
Duda de patrón	"¿Cómo se usa useSearchParams en Next.js 13+?"
Librería desconocida	El usuario menciona algo que no reconozco
Cómo lo uso (2-step process)
// Step 1: Resolver la librería
context7_resolve-library-id(
  query: "Next.js 16 useSearchParams Suspense",
  libraryName: "Next.js"
)
// Returns: /vercel/next.js
// Step 2: Query específica
context7_query-docs(
  libraryId: "/vercel/next.js",
  query: "how to use useSearchParams with Suspense boundary"
)
Por qué no lo usé aquí
Porque el error del router.push durante render es un Known React Pattern — no necesitaba buscar documentación. Además, ya tenía el código del proyecto y sabía exactamente qué hacer.
¿Querés que busque algo específico en docs? Por ejemplo, si hay algún behavior de Next.js que no estés seguro.
PD: Tengo la skill de Next.js cargada que ya tiene información de best practices. 🏃‍♂️