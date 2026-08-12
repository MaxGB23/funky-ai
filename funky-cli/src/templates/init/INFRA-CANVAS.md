# 🏗️ INFRA CANVAS

> Documento de decisiones operativas del proyecto: define cómo se ejecuta y despliega el producto.
> Completa cada campo con la decisión tomada y su justificación, después de leer `canvas-planning-guide.md`.

> 💡 *Si aplica* — Completa las secciones solo si aplica al proyecto, si no, responde "No aplica".

## 1. Base de Datos / ORM
<!-- Qué registrar: base de datos y ORM elegidos, y su impacto en latencia, escalabilidad y costo.
     Ej: PostgreSQL + Prisma — Se necesitan transacciones ACID y migrations con type safety. -->
[Responde aquí]

## 2. Autenticación
<!-- Qué registrar: solución de autenticación elegida y el motivo.
     Ej: NextAuth.js — Se necesita OAuth con Google y GitHub, sin gestionar contraseñas. -->
[Responde aquí]

## 3. Linter / Formatter
<!-- Qué registrar: herramientas de calidad de código y si la configuración es estricta o flexible.
     Ej: Biome — Todo en una herramienta, configuración estricta para consistencia. -->
[Responde aquí]

## 4. Deployment & CI/CD
> 💡 *Si aplica* — Completa esta sección solo si hay un deployment activo o un pipeline de CI configurado.
<!-- Qué registrar: dónde y cómo se despliega, y qué pipeline de CI se usa.
     Ej: Vercel + GitHub Actions — Frontend en Vercel, CI con tests y lint en cada PR. -->
[Responde aquí]
