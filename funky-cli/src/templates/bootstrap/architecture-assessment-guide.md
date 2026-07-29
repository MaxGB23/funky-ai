# 🏛️ Guía de Llenado: Architecture Assessment

> **Propósito:** Usa esta guía para entender qué significa cada campo del `architecture-assessment.md`. El objetivo es evitar números mágicos y obligarte a pensar en los Trade-offs reales del proyecto.

---

## 1. El Frontmatter (NFRs)

Esta sección es el corazón financiero y técnico de tu proyecto. 

### `budget` (Presupuesto Mensual en USD)
¿Cuánto hay para gastar por mes en infraestructura?
- **$0 - $20:** VPS chico (DigitalOcean, Hetzner, Linode) o capas gratuitas (Vercel Hobby, Render). Arquitecturas monolíticas o serverless simple.
- **$50 - $200:** PaaS Profesional (Vercel Pro, Heroku, Railway). Ideal para startups o PyMEs.
- **$500+:** Clusters (Kubernetes, AWS ECS) o bases de datos administradas pesadas.
> **⚠️ Importante:** Los clientes pequeños muchas veces tienen un "techo duro" (ej. "no pago más de $50 al mes bajo ningún concepto"). Esto **dicta** la tecnología. Si el límite es bajo, olvídate de K8s.

### `rps` (Requests per Second)
La carga máxima concurrente en el peor escenario.
> **⚠️ Cuidado con la fantasía:** Si esperas 10,000 usuarios al mes, el promedio es ~0.003 RPS. Aún concentrado en ciertas horas, rara vez pasa de 5 RPS. **No pongas 1000 RPS** a menos que estés construyendo Ticketek, un exchange de cripto o un sistema de votación masiva. Un RPS inflado te obligará a pagar infraestructura redundante que nunca vas a usar.

### `sla` (Service Level Agreement)
La expectativa de uptime prometida al cliente. La "Regla de los Nueve":
- **99.0%** = ~3.6 días de caída permitida al año. (Básico)
- **99.9%** = ~8.7 horas de caída al año. (Estándar comercial)
- **99.99%** = ~52 minutos al año. (Alta disponibilidad real)
> **⚠️ Importante:** Más nueves significan exponencialmente más dólares y más complejidad. No exijas 99.99% si el `budget` es $20.

### `redundancy` (Redundancia)
Estrategia de failover:
- **Single Node:** Un solo servidor. Si se cae o hay que actualizar el SO, hay downtime.
- **Multi-AZ:** Múltiples zonas de disponibilidad. Si se cae un datacenter, la app sigue viva.
- **Multi-Region:** Múltiples continentes. Solo para casos extremos.

### `compliance` (Normativas y Residencia)
Reglas legales que aplican a los datos que manejás:
- **HIPAA:** Datos médicos (USA).
- **PCI DSS:** Tarjetas de crédito.
- **GDPR:** Privacidad europea. Requiere que los datos residan en la UE.
- **Gobierno / Fintech Local:** Suele requerir residencia nacional de datos.
> **⚠️ Tip Arquitectónico:** En aplicaciones críticas o gubernamentales, utilizar un **PaaS** provee una capa extra de seguridad perimetral administrada. Ante vulnerabilidades zero-day, el PaaS actualiza el parche a nivel infraestructura, dándote tiempo vital para parchear tu código sin estar directamente expuesto a nivel SO.

### `team_seniority` (Capacidad del Equipo)
El nivel de experiencia de quienes van a mantener esto.
- **Junior / Sin DevOps:** Obligatorio usar PaaS (Vercel, Render) o Serverless. 
- **Senior / Con DevOps:** Pueden mantener IaaS puro (AWS EC2, Terraform) o K8s.
> **⚠️ Importante:** Sé honesto. Si elegís infraestructura compleja para un equipo junior, el proyecto va a fracasar operativamente a los 3 meses.

---

## 2. Secciones de Texto Libre

### Descripción General
No copies el README. Explicá **qué problema resuelve** la arquitectura en 3 líneas. (Ej. "Un sistema de reservas para clínicas que necesita alta disponibilidad en horario comercial").

### Componentes Clave
Detallá los bloques pesados:
- Frontend (Ej. Next.js App Router).
- Backend (Ej. NestJS monolito).
- Base de Datos (Ej. PostgreSQL en RDS).
- Componentes Extra (Redis, SQS, S3).

### Restricciones y Supuestos
**Esta es la parte más importante del documento.** Acá te cubrís las espaldas:
- *"Se asume que la base de datos existente no puede ser modificada."*
- *"Restricción: El cliente requiere usar Azure porque tiene créditos, descartando AWS."*
- *"Se asume que el tráfico no crecerá más de un 10% anual."*

---
*Fin de la guía. Usa estos conceptos para llenar tu `architecture-assessment.md` y debatir con propiedad.*
