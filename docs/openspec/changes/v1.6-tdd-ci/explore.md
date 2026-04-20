# Exploración: TDD y CI/CD para Funky CLI

## Contexto y Problema
Funky CLI ha crecido. Ya tenemos comandos como `init` y `phase` que manipulan el file system y copian templates. Pero, ¿qué pasa si en la próxima feature rompemos algo? Actualmente dependemos de probar a mano. Eso no escala, hermano. Si queremos que Funky AI sea robusto, necesitamos una red de seguridad. 

Además, si vamos a subir esto a GitHub o trabajar en equipo, necesitamos que cada Pull Request se valide automáticamente.

## Opciones y Trade-offs
### Testing Frameworks
1. **Jest:** El estándar de la industria. Completo, pero un poco pesado y requiere configuración extra para ESM.
2. **Vitest:** Moderno, rapidísimo, excelente DX (Developer Experience). Mi elección personal para proyectos nuevos.
3. **Node.js nativo (`node:test`):** Viene out-of-the-box. Cero dependencias. Excelente, pero con reportes más rústicos y menos utilidades de aserción maduras que Vitest.

**Decisión:** Vamos a usar **Vitest**. Nos da la velocidad que queremos y una API compatible con Jest.

### CI/CD
1. **GitHub Actions:** Integrado nativamente en GitHub, ecosistema masivo de acciones, YAML simple.
2. **GitLab CI:** Excelente, pero si el repo va a GitHub, no tiene sentido.

**Decisión:** **GitHub Actions**. Es el estándar de facto.

## Impacto
Esto va a cambiar la forma en que programamos en Funky AI. A partir de la v1.6, **escribimos el test primero** (TDD), lo vemos fallar, escribimos el código para que pase, y luego refactorizamos. La CI se asegurará de que nunca subamos código roto.
