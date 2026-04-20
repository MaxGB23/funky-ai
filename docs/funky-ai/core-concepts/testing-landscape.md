# El Paisaje del Testing en Desarrollo de Software

Este documento sirve como guía fundacional para entender los tipos de pruebas (tests) y las herramientas disponibles en el ecosistema moderno de JavaScript/TypeScript.

## 1. La Pirámide del Testing (Tipos de Pruebas)

No todos los tests son iguales. Generalmente los dividimos en una "pirámide" donde la base son muchos tests rápidos, y la punta son pocos tests lentos.

### A. Pruebas Unitarias (Unit Tests)
- **¿Qué son?** Prueban la unidad de código más pequeña posible (una función, un método, un componente) de forma **totalmente aislada**.
- **Características:** Son hiper-rápidas (milisegundos). Si tu función llama a una base de datos o al disco duro, **se falsea (se "mockea")** esa interacción.
- **Ejemplo:** Probar que `sumar(2, 2)` devuelva `4`.

### B. Pruebas de Integración (Integration Tests)
- **¿Qué son?** Prueban cómo dos o más unidades de código trabajan juntas. 
- **Características:** Son más lentas que las unitarias. Acá SÍ podés tocar la base de datos (generalmente una base de datos de prueba) o el disco duro.
- **Ejemplo:** Probar que la función `guardarUsuario()` realmente escriba en la base de datos y la función `leerUsuario()` pueda recuperarlo.

### C. Pruebas End-to-End (E2E)
- **¿Qué son?** Prueban todo el sistema desde la perspectiva del usuario final.
- **Características:** Levantan un navegador real (Chrome, Firefox), hacen clics, llenan formularios y verifican que la UI cambie. Son lentas y frágiles.
- **Ejemplo:** Un script que entra a la página de login, pone usuario y contraseña, hace clic en "Ingresar", y verifica que lo redirija al dashboard.

### D. Análisis Estático (El "Test" invisible)
- **¿Qué son?** Herramientas que prueban tu código **sin ejecutarlo**.
- **Ejemplo:** TypeScript (verifica que no le pases un string a donde va un número) y ESLint (verifica que tu código siga buenas prácticas).

---

## 2. Paradigmas de Escritura (TDD vs otros)

El TDD no es un *tipo de test*, es una **metodología de trabajo**.

- **TDD (Test-Driven Development):** 
  1. Escribís un test que falla porque el código no existe (Red).
  2. Escribís el código mínimo para que pase (Green).
  3. Mejorás el código (Refactor).
  *Ventaja:* El código nace testeable y con buen diseño.
  
- **BDD (Behavior-Driven Development):**
  Es una variante del TDD donde los tests se escriben en un lenguaje muy cercano al humano (inglés plano), enfocado en el comportamiento de negocio en vez de en los detalles técnicos (ej. "Dado un usuario logueado, Cuando hace clic, Entonces ve el panel").

- **Test-After (Desarrollo Tradicional):**
  Escribís el código primero y, cuando terminás o antes de mandar a producción, le escribís tests para asegurarte de que no se rompa en el futuro.
  *Desventaja:* A veces escribís código tan complejo que después es imposible de testear ("spaghetti code").

---

## 3. Herramientas: ¿Qué usamos y cuándo?

El ecosistema cambia, pero hoy en día estas son las herramientas principales:

### Para Unitarios e Integración (Test Runners)

| Herramienta | Caso de Uso Ideal | Descripción |
|-------------|-------------------|-------------|
| **Vitest** | Proyectos modernos (Vite, Vue, React moderno, TS) | Es rapidísimo, soporta TypeScript nativamente, y tiene una API casi idéntica a Jest. Es la evolución lógica. **(Nuestra elección en Funky CLI)**. |
| **Jest** | Proyectos Legacy o Enterprise | Fue el rey durante años (creado por Facebook). Súper completo, pero configurarlo hoy para usar TypeScript puro o ESM (módulos modernos) es doloroso y lento. |
| **node:test** | Scripts rápidos o librerías puras Node | Viene integrado en Node.js (v18+). No tenés que instalar *nada*. Es genial para cosas chicas, pero le faltan utilidades gráficas y de aserción maduras. |
| **Mocha/Chai** | Proyectos muy viejos | Fue el estándar antes de Jest. Hoy en día no se recomienda para proyectos nuevos, pero lo vas a ver en código antiguo. |

### Para E2E (Simuladores de Navegador)

| Herramienta | Caso de Uso Ideal | Descripción |
|-------------|-------------------|-------------|
| **Playwright** | Aplicaciones Web modernas | Creado por Microsoft. Rapidísimo, maneja múltiples pestañas, iframes y simula dispositivos móviles a la perfección. Es el estándar actual. |
| **Cypress** | Equipos que prefieren UI | Fue la revolución del E2E. Tiene una interfaz gráfica hermosa donde ves cómo el robot hace los clics en tiempo real. |
| **Selenium** | Entornos Enterprise legacy | El abuelo de todos. Lento, inestable, pero soporta navegadores viejísimos. Evitar si es posible. |

---
**Conclusión Arquitectónica:** No te cases con una herramienta. Elegí la que menor fricción te dé según tu stack. Si usás Vite/Next moderno, andá por **Vitest + Playwright**. Si hacés una lib tonta en Node, **node:test** sobra. Para Funky AI, Vitest nos da el balance perfecto de velocidad y potencia.
