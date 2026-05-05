# RFC 002: Project Cost & Pricing Estimator

> ⚠️ **DRAFT CRUDO — No es un Proposal SDD formal.**
> Este documento es un RFC (Request for Comments): una idea con suficiente detalle para iniciar un ciclo SDD completo (`explore` → `proposal` → `spec` → `tasks`). **No asumir que las fases previas ya ocurrieron.** El Orquestador DEBE arrancar desde `explore` cuando retome esta feature.

**Estado:** 🔵 RFC / Draft Inicial
**Autor:** Orquestador / Humano
**Fecha:** 2026-05-02

---

## 1. Contexto y Problema
Muchos desarrolladores juniors o agencias pequeñas tienen problemas al cotizar proyectos de software. A menudo cobran por hora sin tener en cuenta el valor real aportado al cliente, el riesgo del proyecto, o los costos ocultos (como la infraestructura).

El riesgo de no estandarizar esto es:
- Cobrar de menos y perder dinero (o abandonar el proyecto por falta de motivación financiera).
- Ignorar los NFRs que dictan el costo de infraestructura.
- Perder clientes por no saber justificar el precio basado en el valor (Value-Based Pricing).

## 2. Idea de Solución (Sin Validar)
Crear un template o script interactivo (`project-cost-estimator.md`) dentro de la CLI de Funky AI. Este estimador recogerá variables clave del entorno, el cliente y el proyecto, y calculará (o ayudará a calcular) un rango de precio justo y profesional.

El estimador deberá cruzar los siguientes factores:

### A. Factores Técnicos (El Costo Real)
- **Funcionalidades:** Alcance y features requeridas.
- **Complejidad:** Integraciones de terceros, IA, procesamiento asíncrono.
- **Presupuesto de Infraestructura (Hosting):** ¿Cuánto aporta el cliente para mantenerlo vivo?
- **Stack Recomendado:** Tecnologías de nicho vs tecnologías de mercado (influye en el rate).
- **Seniority Requerido:** Nivel de experiencia necesario para garantizar el éxito.

### B. Factores Contextuales (Ajuste Regional y de Mercado)
- **País y Ciudad del Cliente:** Ajuste por poder adquisitivo (no es lo mismo cotizar para un comercio barrial en un pueblo chico que para una startup en San Francisco).
- **Tiempo de Entrega (Urgencia):** El costo de la prisa (Premium pricing).

### C. Factores de Valor (Value-Based Pricing)
- **Tamaño e Ingresos de la Empresa:** Capacidad de pago real del cliente.
- **Magnitud de la Solución:** ¿Cuánto dinero les va a ahorrar (o hacer ganar) esta pieza de software? (Ej: Si un bot les ahorra $10,000 al mes en sueldos, cobrar $500 por el bot es absurdo).

## 3. Impacto y Visión a Futuro (Sin Validar)
- **Fase de impacto:** Pre-desarrollo (Ventas / Discovery).
- **Visión:** Eventualmente, esta matriz matemática podrá exportarse a un frontend (SaaS o Web Tool comunitaria) con un formulario interactivo para que los desarrolladores aprendan a cobrar como profesionales Senior y Arquitectos, entendiendo los trade-offs de negocio.

## 4. Preguntas Abiertas (Para el Explore)
1. ¿Esto vive dentro de `funky-cli` o es un artefacto Markdown standalone?
2. ¿Las fórmulas de ajuste regional son viables de manera estática, o requieren datos externos (API)?
3. ¿Cuál es el MVP mínimo que aporta valor real sin convertirse en un Excel glorificado?
