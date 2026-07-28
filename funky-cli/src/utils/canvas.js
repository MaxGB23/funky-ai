const projectCanvasPlaceholders = {
  framework: `<!-- ¿Qué framework elegiste y por qué? ¿Qué necesidades resuelve (SSR, SPA, SSG)?
     Ej: Next.js (App Router) — Necesitamos SSR para SEO + performance en dashboard -->
[Responde aquí]`,
  pattern: `<!-- ¿Qué patrón organiza tu código? ¿Por qué este y no otro?
     Ej: Clean Architecture — El dominio es complejo y necesitamos separar capas -->
[Responde aquí]`,
  state: `<!-- ¿Cómo fluyen los datos en tu app? ¿Estado remoto, global, o local?
     Ej: React Query + Zustand — Datos de servidor con React Query, UI global con Zustand -->
[Responde aquí]`,
  styling: `> 💡 *Si aplica* — Solo si tu proyecto tiene una librería de UI o design system definido.
<!-- ¿Qué herramienta de estilos usas? ¿Por qué esta y no otra?
     Ej: Tailwind + shadcn/ui — Componentes headless con utility-first para desarrollo rápido -->
[Responde aquí]`,
  testing: `<!-- ¿Qué metodología y runner elegiste? ¿Qué nivel de cobertura esperas?
     Ej: Integration First con Vitest — Priorizamos flujos completos, cobertura >80% en crítico -->
[Responde aquí]`
};

const infraCanvasPlaceholders = {
  database: `<!-- ¿Qué base de datos y ORM elegiste? ¿Cómo impacta en latencia, escalabilidad y costo?
     Ej: PostgreSQL + Prisma — Necesitamos transacciones ACID y migrations con type safety -->
[Responde aquí]`,
  auth: `<!-- ¿Qué solución de auth elegiste? ¿Por qué esta y no otra?
     Ej: NextAuth.js — Necesitamos OAuth con Google y GitHub, sin gestión de contraseñas -->
[Responde aquí]`,
  linter: `<!-- ¿Qué herramientas de calidad de código usas? ¿Configuración estricta o flexible?
     Ej: Biome — Todo en una herramienta, config estricta para consistencia -->
[Responde aquí]`,
  deployment: `> 💡 *Si aplica* — Completa esta sección solo si tienes un deployment activo o pipeline de CI configurado.
<!-- ¿Dónde y cómo deployas? ¿Qué pipeline de CI usas?
     Ej: Vercel + GitHub Actions — Frontend en Vercel, CI con tests y lint en cada PR -->
[Responde aquí]`
};

export function generateProjectCanvasMarkdown(config = {}) {
  const f = (val, placeholder) => val || placeholder;
  return `# 🚀 PROJECT CANVAS

## 1. Framework Base
${f(config.framework, projectCanvasPlaceholders.framework)}

## 2. Patrón Arquitectónico
${f(config.pattern, projectCanvasPlaceholders.pattern)}

## 3. Gestión de Estado
${f(config.state, projectCanvasPlaceholders.state)}

## 4. Estrategia UI
${f(config.styling, projectCanvasPlaceholders.styling)}

## 5. Estrategia de Testing
${f(config.testing, projectCanvasPlaceholders.testing)}
`;
}

export function generateInfraCanvasMarkdown(config = {}) {
  const f = (val, placeholder) => val || placeholder;
  return `# 🏗️ INFRA CANVAS

## 1. Base de Datos / ORM
${f(config.database, infraCanvasPlaceholders.database)}

## 2. Autenticación
${f(config.auth, infraCanvasPlaceholders.auth)}

## 3. Linter / Formatter
${f(config.linter, infraCanvasPlaceholders.linter)}

## 4. Deployment & CI/CD
${f(config.deployment, infraCanvasPlaceholders.deployment)}
`;
}
