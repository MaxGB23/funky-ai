# Proposal: Project Cost & Pricing Estimator

**Estado:** 🟡 DRAFT (En definición)
**Autor:** Orquestador / Humano
**Fecha:** 2026-05-02

---

## 1. Contexto y Problema
Muchos desarrolladores juniors o agencias pequeñas tienen problemas al cotizar proyectos de software. A menudo cobran por hora sin tener en cuenta el valor real aportado al cliente, el riesgo del proyecto, o los costos ocultos (como la infraestructura).

El riesgo de no estandarizar esto es:
- Cobrar de menos y perder dinero (o abandonar el proyecto por falta de motivación financiera).
- Ignorar los NFRs que dictan el costo de infraestructura.
- Perder clientes por no saber justificar el precio basado en el valor (Value-Based Pricing).

## 2. Propuesta de Solución
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

## 3. Impacto y Visión a Futuro
- **Fase de impacto:** Pre-desarrollo (Ventas / Discovery).
- **Visión:** Eventualmente, esta matriz matemática podrá exportarse a un frontend (SaaS o Web Tool comunitaria) con un formulario interactivo para que los desarrolladores aprendan a cobrar como profesionales Senior y Arquitectos, entendiendo los trade-offs de negocio.

## 4. Tareas Iniciales para Implementación
1. Diseñar el markdown estructurado `project-cost-estimator.md`.
2. Validar las fórmulas de ajuste (pesos por país, multiplicadores por valor).
3. Integrarlo como un documento opcional o fase de descubrimiento en `funky phase discovery`.
