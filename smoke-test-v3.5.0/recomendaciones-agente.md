# Recomendaciones de pricing para el proyecto

## 1. Objetivo del documento

Este documento complementa el contexto técnico y arquitectónico del proyecto para cerrar un presupuesto realista, sin caer en una estimación basada únicamente en el stack. El objetivo es convertir el proyecto en un brief de negocio y producto para poder dimensionar costo, alcance, riesgos y timeline.

El stack elegido (Next.js, Clean Architecture, React Query + Zustand, Tailwind + shadcn/ui, Vitest, SQLite + Prisma, NextAuth, Biome, Vercel + GitHub Actions) es importante, pero no sustituye la definición funcional del producto. Para hacer pricing serio, hace falta responder: qué se va a construir, para quién, con qué reglas de negocio y qué alcance se entrega en cada fase.

---

## 2. Resumen ejecutivo del proyecto

### Hipótesis base
El proyecto se entiende como una aplicación web tipo dashboard con autenticación, con la posibilidad de escalar a una solución SaaS o producto interno más completo. La arquitectura sugiere un sistema con varias capas, reglas de negocio medianamente complejas, estado de UI y datos de servidor bien separados, y un enfoque de calidad con testing y CI.

### Descripción funcional sugerida
Un producto web con:
- Login y acceso autenticado
- Roles o perfiles de usuario
- Panel principal con datos resumidos y métricas
- Gestión de entidades o recursos
- Flujo de aprobación o administración según el negocio
- Reportes o consulta de información
- Posibilidad de crecimiento a más módulos con continuidad

### Definición mínima útil del producto
La formulación más útil para pricing es:

> Proyecto web tipo dashboard con autenticación y roles, orientado a usuarios internos o clientes, con panel principal, gestión de datos, consultas y reportes, desplegado como aplicación moderna con arquitectura escalable y buenas prácticas de calidad.

---

## 3. Qué falta definir para estimar bien

Estas son las preguntas y hallazgos que faltan para cerrar un presupuesto robusto.

### 3.1. Producto y propósito

1. ¿Qué tipo de producto es?
   - Dashboard interno para operación
   - SaaS orientado a clientes
   - Portal de gestión para usuarios finales
   - Plataforma transaccional con gestión de datos

2. ¿Cuál es la principal tarea del usuario?
   - Consultar información
   - Gestionar datos
   - Aprobar decisiones
   - Generar reportes
   - Automatizar procesos

3. ¿Qué problema resuelve?
   - Dar visibilidad operativa
   - Reducir trabajo manual
   - Centralizar información dispersa
   - Mejorar toma de decisiones
   - Permitir seguimiento y control

4. ¿Existe una solución actual?
   - Sí, pero es manual o con Excel
   - Sí, pero es legacy o poco usable
   - No existe todavía

### 3.2. Usuarios y permisos

1. ¿Quiénes usarán la app?
   - Administradores
   - Empleados internos
   - Clientes finales
   - Managers
   - Operadores

2. ¿Hay roles?
   - Admin
   - Editor
   - Viewer
   - Superadmin
   - Cliente

3. ¿Qué permisos tienen?
   - CRUD por entidad
   - Acceso a ciertos módulos
   - Restricción por tenant, empresa o ubicación
   - Revisión y aprobación de acciones

4. ¿Hay login con email/password, OAuth o SSO?
   - Google / GitHub
   - Microsoft / enterprise SSO
   - Autenticación por invitación

5. ¿Se requiere MFA, recuperación de contraseña y seguridad avanzada?

### 3.3. Alcance funcional del MVP

Este es el punto más importante. Debe quedar explícito qué entra en versión 1.0.

#### Se necesita responder:
- ¿Cuál es el MVP exacto?
- ¿Qué funcionalidad es indispensable?
- ¿Qué se deja para post-MVP?
- ¿Qué se entrega en fase 2?
- ¿Qué parte del desarrollo es custom vs configurable?

#### Ejemplo de descomposición recomendada

MVP mínimo:
- Login y recuperación
- Roles básicos
- Dashboard principal
- CRUD de entidades clave
- Búsqueda y filtros
- Reportes o métricas básicas
- Notificaciones simples
- CI/CD + despliegue

Fase 2:
- Reportes avanzados
- Exportación a CSV/PDF
- Integración con terceros
- Automatizaciones
- Historial/auditoría
- Tenancy multi-empresa
- Chat, notificaciones push, etc.

### 3.4. Complejidad del dominio

El marco técnico sugiere un dominio más bien complejo, pero aún hace falta definir qué tan complejo es el negocio que soportará la app.

Se debe aclarar:
- ¿Hay reglas de negocio no triviales?
- ¿Hay flujos de aprobación?
- ¿Hay estados de entidades?
- ¿Hay validaciones cross-entity?
- ¿Hay necesidad de auditoría?
- ¿Hay cálculo de indicadores o reportes complejos?

#### Indicadores de complejidad alta
- Múltiples roles y reglas por perfil
- Entidades dependientes entre sí
- Flujos de trabajo con estados
- Reglas de negocio dinámicas
- Integración con APIs externas
- Reportes complejos y consultas analíticas
- Permisos por tenant o equipo

### 3.5. Integraciones externas

El proyecto no menciona aún si hay integraciones. Esto cambia mucho el costo.

Debe documentarse:
- ¿Hay API propia o de terceros?
- ¿Se consume información de otra app?
- ¿Se envían notificaciones por email o WhatsApp?
- ¿Hay webhook inbound/outbound?
- ¿Se integra con pagos, CRM, ERP, ERP, Google Calendar, Slack, etc.?
- ¿Se necesita sincronización asíncrona o jobs periódicos?

#### Impacto de las integraciones
Cada integración agrega:
- diseño del contrato
- manejo de errores
- validación de payloads
- entorno de pruebas
- documentación
- riesgos de producción

### 3.6. Calidad, testing y despliegue

La decisión técnica ya indica que se prioriza testing y calidad. Eso es positivo, pero debe quedar explícito qué nivel se exige.

Debe definirse:
- Cobertura mínima aceptada
- Qué suites se requieren
- Cuánto testing manual hay previsto
- Si hay QA interno del cliente
- Si se requiere staging y production
- Si hay reviews o políticas de seguridad
- Si se necesita observabilidad y alertas

### 3.7. Datos y volumen

Para pricing también importa qué volumen de información manejará la app.

Se debe responder:
- ¿Cuántos usuarios concurrentes?
- ¿Cuánto volumen de registros?
- ¿Cuántas consultas por día?
- ¿Hay exportación masiva?
- ¿Se maneja historial o logs irrestrictos?

Esto impacta en:
- arquitectura de queries
- índices
- decisiones de almacenamiento
- costos de infraestructura
- tiempo de desarrollo

### 3.8. Timeline y urgencia

El proyecto no dice cuánto tarda ni qué presión de entrega hay.

Debe responderse:
- ¿Hay deadline fijo?
- ¿Se quiere una entrega en semanas o meses?
- ¿Se prioriza “lanzar rápido” o “hacerlo robusto desde el inicio”?
- ¿Se aceptan entregas por hitos?

Impacto directo en precio:
- más velocidad = más presión = más costo
- menos urgencia = mejor planificación y menor riesgo

---

## 4. Resumen funcional recomendado para el proyecto

Para que el equipo pueda cotizar con base real, conviene dejar este resumen como base del brief de pricing:

### Brief de producto sugerido

Proyecto: aplicación web tipo dashboard con autenticación y roles, diseñada para gestión operativa y visualización de datos.

### Usuarios
- Administradores del sistema
- Usuarios internos con permisos específicos
- Usuarios finales o clientes según el modelo de negocio

### Funcionalidades principales
- Login y acceso seguro
- Dashboard principal con métricas y vistas resumidas
- Gestión de entidades de negocio
- Búsqueda, filtros y paginación
- Perfil de usuario y configuración básica
- Reportes o consultas clave
- Seguridad por roles

### Funcionalidades opcionales / fase 2
- Integraciones con terceros
- Notificaciones automáticas
- Exportación de reportes
- Auditoría de acciones
- Multi-tenant / multi-empresa
- APIs para consumo externo
- Automatizaciones avanzadas

### Objetivo
- Reducir trabajo manual
- Centralizar información
- Mejorar visibilidad y trazabilidad
- Preparar una base escalable para crecimiento

---

## 5. Riesgos que deben considerarse al cotizar

### Riesgos de producto
- Alcance no definido
- MVP ambiguo
- Usuarios y roles incompletos
- Funcionalidades ocultas que aparecen después del inicio

### Riesgos de negocio
- Requerimientos que cambian en curso del proyecto
- Stakeholders con opiniones divergentes
- Falta de disponibilidad para revisar y validar
- Prioridades cambiantes durante sprint

### Riesgos de arquitectura
- Requerimientos de seguridad mayores a lo esperado
- Integraciones no bien especificadas
- Complejidad de query o reportes
- Necesidad de despliegue, backups y observabilidad más robustos

### Riesgos de implementación
- Testing insuficiente para flujos críticos
- Dependencia de librerías o servicios no definidos
- Diseño de UX no validado con usuarios reales

---

## 6. Supuestos recomendados para la sesión de pricing

Antes de cerrar un presupuesto, conviene acordar estos supuestos explícitos:

1. El proyecto se entrega como MVP, no como producto completo con todas las funcionalidades futuras.
2. La plataforma se construye sobre la base técnica ya elegida.
3. El alcance funcional se definirá por fases.
4. La autenticación básica y roles simples son parte del alcance inicial.
5. Las integraciones externas son opcionales salvo que se definan expresamente.
6. El producto se entrega con despliegue y CI/CD básicos.
7. La calidad se prioriza con tests, lint y revisión de cambios.
8. El MVP puede evolucionar en una segunda etapa de mejoras y expansión.

---

## 7. Cómo cerrar el pricing con base real

El pricing debe basarse en estas 5 dimensiones:

### 7.1. Alcance funcional
- Nro de módulos
- Nro de roles
- Nro de flujos clave
- Nro de pantallas y complejidad

### 7.2. Complejidad técnica
- Autenticación
- Integraciones
- Reportes
- Seguridad
- Datos masivos
- Workflow de negocio

### 7.3. Tiempo de entrega
- MVP con fecha ajustada
- Fases por entregable
- Pressión de tiempo

### 7.4. Equipo y estructura
- Cantidad de reuniones
- Disponibilidad del cliente
- Frecuencia de feedback
- Dedicación del product owner

### 7.5. Mantenimiento y soporte
- Soporte post-lanzamiento
- Ajustes luego de prueba de uso
- Backlog de mejora

---

## 8. Recomendación de enfoque de pricing

### Opción recomendada: pricing por alcance + fases
En vez de desarrollar un único presupuesto enorme sin contexto, conviene fijar:

- Fase 1: MVP (base funcional)
- Fase 2: mejoras funcionales y validación
- Fase 3: escalabilidad, integraciones y optimización

Esto permite:
- controlar riesgo
- priorizar entregas reales
- evitar sobrecotización por requisitos no definidos
- facilitar negociación con el cliente

### Regla de oro
Si el proyecto aún no tiene un brief funcional claro, no se debe citar un precio definitivo. Lo correcto es:
- cotizar por MVP con rango de alcance
- definir hitos
- dejar un backlog para fase 2

---

## 9. Documento mínimo de decisión para la sesión

### Preguntas que deben responderse antes de cerrar presupuesto

1. ¿Qué producto se va a desarrollar exactamente?
2. ¿Qué usuario lo usa y con qué objetivo?
3. ¿Qué es MVP y qué es fase 2?
4. ¿Cuántos roles y permisos hay?
5. ¿Qué módulos y pantallas se requieren?
6. ¿Cuáles son los flujos críticos?
7. ¿Qué integraciones existen?
8. ¿Cuánto volumen de datos se espera?
9. ¿Qué nivel de testing y QA se exige?
10. ¿Cuál es el plazo y presión de entrega?
11. ¿Qué soporte post-lanzamiento se necesita?
12. ¿Qué tan claro está el backlog y la prioridad de negocio?

---

## 10. Conclusión

Con el stack y las decisiones técnicas ya definidas, el siguiente paso no es “cotizar el stack”, sino documentar el producto y su alcance funcional. Un dashboard con login no es un requisito suficiente para estimar un proyecto: hace falta saber quién lo usa, qué hace, cómo se administra, qué integra, qué complejidad tiene y qué se entrega en el MVP.

Sin ese conjunto, cualquier precio puede ser útil para una conversación inicial, pero no para una propuesta seria.

---

## 11. Versión corta para usar en la reunión

> El proyecto requiere definir de manera explícita el producto, los usuarios, los roles, las reglas de negocio y el MVP. El stack ya está elegido, pero sin una descripción funcional clara no es posible cerrar un presupuesto realista. Recomendamos estructurar el alcance en fases: MVP, mejoras funcionales y expansión posterior. El pricing debe basarse en alcance, complejidad, integraciones, timeline y nivel de calidad requerido.

---

## 12. Siguiente paso recomendado

Para cerrar bien esta sesión, conviene convertir este documento en un “brief de proyecto” con estas secciones:

- Nombre del producto
- Objetivo y problema
- Usuarios y roles
- Funcionalidades MVP
- Funcionalidades extras
- Integraciones
- Reglas de negocio
- Entregables
- Timeline
- Criterios de aceptación
- riesgos y supuestos

Con eso ya se puede trabajar sobre una propuesta de presupuesto realista y defendible.

---

## 13. Paso inicial obligatorio: brief funcional antes del Project Canvas

Antes de llenar el Project Canvas, el equipo necesita un documento de producto que responda: qué se quiere construir, para quién, con qué objetivo y qué funcionalidad es esencial.

> El primer paso no debería ser “definir stack” ni “llenar el canvas técnico”. El primer paso debería ser definir el problema y el producto.

### ¿Qué debe incluir este brief inicial?

- Nombre del producto o idea
- Objetivo del sistema
- Tipo de usuario
- Caso de uso principal
- Funcionalidades principales
- Funcionalidades secundaria / futura
- Roles y permisos básicos
- Requisitos de seguridad mínimos
- Integraciones esperadas
- Entregables por fase
- MVP vs fase 2
- KPI o éxito del producto

### Ejemplo de redacción útil

> Dashboard interno para gestión operativa de equipos, con login seguro, roles básicos, visualización de métricas, gestión de datos principales y reportes simples. MVP orientado a reducir trabajo manual y centralizar información. No incluye multi-tenant ni automatizaciones complejas en la fase inicial.

### ¿Por qué este paso es obligatorio?

Porque sin un brief funcional claro:
- el stack puede elegirse mal
- el MVP puede quedar indefinido
- el pricing puede salir a ciegas
- la IA puede inventar escenarios que el proyecto no necesita
- se corre el riesgo de sobreingenierizar desde el principio

### Recomendación formal de secuencia

1. Brief funcional del producto
2. Product Canvas o brief de negocio
3. Project Canvas (stack, arquitectura, UI, testing)
4. Infra Canvas
5. Pricing guide
6. Plantillas condicionales si aplica

Es decir: primero “qué”, luego “cómo”.

---

## 14. Principio clave: no documentar todo, documentar solo lo que aplica

La principal lección para evitar análisis inflados por IA es esta:

> Un documento de proyecto no debe intentar cubrir todos los riesgos posibles del universo. Debe dejar claro cuáles riesgos son relevantes para este proyecto y cuáles no lo son.

Esto es importante porque cuando un AI o un equipo de arquitectura lee un canvas excesivamente amplio, puede empezar a asumir escenarios hipotéticos que no existen: multi-tenancy, transacciones complejas, alta concurrencia, rate limiting agresivo, auditoría de seguridad, tareas pesadas, webhooks, colas, cachés distribuidos, etc. Todo eso puede ser válido para algunos sistemas, pero no para la mayoría de los MVPs.

### Regla de oro
Cada documento debe responder este criterio:
- ¿Esto aplica a este proyecto?
- ¿Es un requisito de negocio o un riesgo real?
- ¿Es necesario para la fase actual?
- ¿Se va a implementar ahora o se deja para fase futura?

Si la respuesta es “no aplica” o “se posterga”, debe quedar explícito.

### Ejemplos de escenarios que no deben inventarse por defecto

- Multi-tenant no aplica si el producto es un dashboard interno de una sola empresa.
- Transacciones complejas no aplican si el sistema no tiene flujo financiero ni movimientos de saldo.
- Race condition no es un riesgo crítico si las operaciones son simples y no hay concurrencia real intensa.
- Protección contra ataques de fuerza bruta o abuso de API no es prioridad si no hay exposición pública o si el sistema tiene poca demanda.
- Colas de trabajo y jobs distribuidos no deberían aparecer si no hay tareas asíncronas reales y no se requiere procesamiento pesado.

### Recomendación para la documentación
Cada documento debe tener una sección de “No aplica / no requerido en esta fase” para evitar suposiciones.

Ejemplo:

- Multi-tenant: no aplica en esta fase, no se implementa con aislamiento por empresa.
- Riesgos de seguridad avanzada: no aplican porque la app es interna y usa auth centralizada.
- Operación a escala masiva: no aplica en MVP; se revisa cuando el volumen lo justifique.

Esto limita la imaginación del análisis y hace que los documentos sigan siendo útiles y creíbles.

---

## 14. Plantillas condicionales recomendadas

La solución más limpia no es un único documento gigante, sino varias plantillas que se usan solo cuando aplican.

### 14.1. Template base: proyecto estándar

Se usa para la mayoría de los MVPs y dashboards simples.

#### Incluye
- Login con roles básicos
- Dashboard principal
- CRUD de entidades clave
- Búsqueda y filtros
- Permisos sencillos
- Configuración básica
- Despliegue simple
- Testing de flujos críticos

#### Excluye por defecto
- Multi-tenant
- Operación con gran concurrencia
- Múltiples regiones
- Integración avanzada con terceros
- Protección anti-abuso compleja
- Finanzas con transacciones complejas
- Jobs distribuidos

### 14.2. Template de roles y permisos

Se activa solo si hay más de un tipo de usuario o si el acceso depende de roles, departamentos o permisos por entidad.

#### Debe responder
- ¿Cuántos roles existen?
- ¿Qué puede hacer cada uno?
- ¿Hay permisos por módulo?
- ¿Hay permisos por tenant, sucursal, equipo o empresa?
- ¿Es necesario auditoría de acciones?

#### Importante
Si la app tiene un solo admin y usuarios con acceso similar, no hace falta un sistema de permisos sofisticado.

### 14.3. Template de multi-tenant

Se activa solo si la plataforma sirve a varias organizaciones, equipos o clientes dentro de la misma instancia.

#### Debe responder
- ¿Qué datos están aislados por tenant?
- ¿Hay un superadmin y varios clientes?
- ¿Hay límites de storage o consumo por tenant?
- ¿Hay un plan de pago por tenant?
- ¿Hay configuraciones distintas por org?
- ¿Se requiere aislamiento de datos a nivel DB, app o ambos?

#### Riesgos típicos
- fuga de datos entre clientes
- filtros incompletos
- configuraciones cruzadas
- permisos ambigüos

### 14.4. Template de transacciones y consistencia

Se activa solo si hay operaciones con estado financiero, inventario, pagos, reservas, movimientos de saldo o actualización de varios registros a la vez.

#### Debe responder
- ¿Hay movimientos financieros?
- ¿Se actualizan varios registros en una operación?
- ¿Se necesita rollback?
- ¿Hay riesgo de doble procesamiento?
- ¿Hay concurrencia real entre usuarios?
- ¿Se requiere idempotencia?

#### Importante
Si el sistema no tiene movimiento financiero ni operaciones críticas, no hace falta modelar una arquitectura “con transacciones complejas” desde el inicio.

### 14.5. Template de seguridad y abuso

Se activa solo si el sistema está expuesto, tiene usuarios externos o tiene riesgo relevante de abuso, scraping, spam o abuso de API.

#### Debe responder
- ¿La app es pública o interna?
- ¿Hay usuarios externos autenticados?
- ¿Hay APIs públicas?
- ¿Hay riesgo de brute force, scraping, abuso de endpoints?
- ¿Hay rate limiting?
- ¿Hay OTP, MFA, reCAPTCHA o validación avanzada?
- ¿Se necesita auditoría de seguridad?

#### Importante
No todo proyecto necesita WAF, rate limiting avanzado o protección sofisticada. Muchas apps internas no tienen ese riesgo.

### 14.6. Template de concurrencia y escalabilidad

Se activa cuando los usuarios o procesos son suficientes para crear carga real, picos de uso o necesidades de coordinación.

#### Debe responder
- ¿Cuántos usuarios concurrentes hay?
- ¿Hay picos repetitivos?
- ¿Se espera crecimiento rápido?
- ¿Hay tareas largas o jobs asíncronos?
- ¿Se necesita cache distribuido?
- ¿Hay cola de procesos?

#### Importante
Una app pequeña no necesita “arquitectura de escala” hasta que la demanda lo justifique.

### 14.7. Template de integraciones complejas

Se activa si hay varias APIs, eventos, sincronizaciones, webhooks o dependencias externas.

#### Debe responder
- ¿Cuántas integraciones hay?
- ¿Cuáles son los contratos?
- ¿Hay retries o webhook processing?
- ¿Hay datos en tiempo real?
- ¿Qué pasa si una integración falla?

#### Importante
No todas las apps necesitan un bus de eventos ni una capa de integración sofisticada.

---

## 15. Recomendación de diseño para docs y analisis con IA

### Modelo recomendado
- Un documento base general y breve
- Plantillas condicionales que se activan solo cuando aplica
- Secciones de “No aplica en esta fase”
- Secciones de “Riesgos relevantes” y “No relevantes”

Esto hace que un AI no “invente” complejidad innecesaria.

### Ejemplo de patrón

#### Proyecto base
- Tipo: Dashboard interno
- Usuarios: 20 empleados
- Auth: sí
- Roles: 2
- Multi-tenant: no aplica
- Transacciones: no aplica
- API pública: no aplica
- Seguridad avanzada: no aplica
- Escalabilidad masiva: no aplica

Esto es mucho más útil que un documento que menciona todos los riesgos posibles sin distinguir qué es real.

---

## 16. Recomendación de estructura de archivo

Para que el repositorio sea ordenado y claro, conviene tener una estructura así:

- project-canvas.md
- infra-canvas.md
- pricing-guide.md
- pricing-decisions.md
- pricing-conditional-templates.md
- product-brief.md
- security-brief.md
- multi-tenant-brief.md
- transactions-brief.md

Esto permite que cada tema viva por separado y que el análisis no se vuelva un documento inmenso y ambivalente.

### Regla de uso
- Si el proyecto es simple, usar solo base + pricing guide.
- Si hay roles complejos, agregar roles template.
- Si hay multi-tenant, agregar multi-tenant template.
- Si hay transacciones, agregar transactions template.
- Si hay seguridad fuerte, agregar security template.

---

## 17. Conclusión práctica

La principal diferencia entre un doc útil y un doc que hace ruido es esta:

> Un buen documento no dice todo lo que puede llegar a existir. Dice exactamente lo que aplica, lo que no aplica y lo que se deja para más adelante.

Por eso, en lugar de forzar a todos los proyectos a responder escenarios complejos, conviene crear plantillas condicionales y dejar explícito el alcance real.

Esto ayuda a:
- evitar sobreingeniería
- reducir ruido de IA
- hacer pricing más preciso
- priorizar el MVP correcto
- evitar que los análisis creen riesgos inexistentes

---

## 18. Recomendación final para el equipo

El repositorio debería tener un eje simple:

1. Project Canvas: define el proyecto base.
2. Infra Canvas: define la operación y stack.
3. Pricing Guide: facilita la discusión de costos.
4. Conditional Templates: activan únicamente los temas relevantes.
5. Product Brief: define el MVP y el negocio.

De esa forma, la planeación es clara, el análisis con IA es más preciso y el equipo no se obliga a planear problemas que el proyecto no tiene.

---

## 19. Sección obligatoria: estructura del equipo y costos de ejecución

Esta sección es crítica y debería formar parte del pricing guide. La mayoría de los proyectos no se cotizan bien porque se norma solo por la tecnología, pero no por el equipo que realmente lo ejecuta.

### 19.1. Cuándo aplica

Aplica siempre que el proyecto se hará con un equipo de 1 o más personas, ya sea freelance, boutique, agencia o colectivo.

No aplica solo si el cliente quiere un “precio fijo sin estructura de ejecución” y acepta dejar las decisiones de equipo abiertas.

### 19.2. Información mínima que debe completarse

Se debe responder lo siguiente:

- ¿Trabaja 1 dev o más de 1?
- ¿Qué roles participan?
- ¿Cuál es el seniority de cada rol?
- ¿Cuánto tiempo dedica cada persona?
- ¿Qué porcentaje del proyecto pertenece a cada rol?
- ¿Cuánto cuesta ese perfil en la ciudad o mercado del cliente?
- ¿Qué tiempo total dura el proyecto?
- ¿Qué tareas adicionales hay fuera de programación?

### 19.3. Roles básicos a considerar

- Product Owner / PM
- UX / UI Designer
- Frontend Developer
- Backend Developer
- Fullstack Developer
- QA / Test Engineer
- Tech Lead / Architect
- DevOps / Infra
- Data / Analytics (si aplica)

### 19.4. Seniority a considerar

- Junior
- Mid
- Senior
- Lead
- Especialista

### 19.5. Dedicación del equipo

- 10h/semana
- 20h/semana
- 30h/semana
- 40h/semana
- Full-time
- Por sprint

### 19.6. Ajuste por ciudad o mercado

Debe dejarse explícito que el costo del talento cambia por ciudad, país y mercado local. Por ejemplo:

- ciudad más cara: mayor costo de talento
- ciudad más barata: menor costo base
- mercado con más disponibilidad: más competencia y potencialmente mejor precio
- mercado con alta demanda: mayor costo y menos disponibilidad

El precio no debería ser el mismo solo porque el proyecto es “igual” si el cliente está ubicado en un mercado con costos laborales muy distintos.

### 19.7. Costo estimado por persona

Se recomienda incluir una fila de referencia por perfil, por ejemplo:

- Frontend Mid: $X / mes
- Frontend Senior: $Y / mes
- Backend Mid: $X / mes
- Fullstack Senior: $Y / mes
- UX/UI: $X / mes
- QA: $X / mes
- PM: $X / mes

Esto puede expresarse como valor bruto o valor de mercado local. La clave es que el proyecto tenga un marco claro.

### 19.8. Costo total del equipo

Se recomienda este cálculo base:

Costo total del equipo = suma de cada rol × tiempo de dedicación × duración del proyecto

Con ajustes por:
- seniority
- urgencia
- complejidad del producto
- necesidad de coordinación
- revisión y QA
- soporte post-lanzamiento

### 19.9. Caso de 1 dev

Cuando el proyecto lo ejecuta 1 dev, la guía debe dejar claro que hay un modelo distinto:

#### Modelo de 1 dev
- El desarrollador puede cubrir frontend, backend, integración, pruebas y despliegue si el scope es simple.
- Coste depende del seniority y la carga horaria
- El proyecto suele ser más barato por menos coordinación, pero menos paralelo y más dependiente del tiempo individual
- El riesgo aumenta si hay urgencia, demasiadas integraciones o alcance insuficientemente definido

#### Datos mínimos del modelo individual
- Nombre / perfil
- Seniority
- Horas por semana
- Plazo estimado
- Precio por hora / por mes / por proyecto
- Alcance máximo asumible sin riesgo

### 19.10. Caso de equipo 2+ devs

Cuando hay más de 1 desarrollador, la guía debe atender la distribución del trabajo:

- rol de cada persona
- dedicación por sprint
- coordinación entre roles
- QA y revisión cruzada
- infraestructura y despliegue
- comunicación con cliente

#### La pregunta importante
¿Se cobra por persona, por sprint, por entregable, o por proyecto total?

El modelo debe dejarlo explícito.

### 19.11. Recomendación de estructura de tabla

Se sugiere usar una tabla simple como esta:

- Rol
- Seniority
- Dedicación
- Ciudad/mercado
- Costo mensual estimado
- % del proyecto
- Costo total proyectado

Esto hace que la estimación sea visible y auditable.

---

## 20. Plantilla recomendada para costos del equipo

### 20.1. Plantilla para 1 dev

- Perfil: [Frontend / Backend / Fullstack]
- Seniority: [Junior / Mid / Senior / Lead]
- Horas por semana: [ ]
- Dedicación: [20h / 30h / 40h]
- Ciudad / mercado: [ ]
- Precio por hora: [ ]
- Precio por mes: [ ]
- Plazo estimado: [ ]
- Alcance asumido: [ ]
- Riesgos: [ ]

### 20.2. Plantilla para equipo multidisciplinario

- Rol: [ ]
- Seniority: [ ]
- Dedicación: [ ]
- Ciudad / mercado: [ ]
- Costo mensual: [ ]
- % participación en proyecto: [ ]
- Costo proyectado: [ ]

### 20.3. Plantilla de distribución por fase

- Fase 1: Discovery / análisis
- Fase 2: MVP
- Fase 3: QA / refinamientos
- Fase 4: Despliegue / soporte inicial

Cada fase debe indicar:
- roles involucrados
- tiempo estimado
- costo asignado
- responsables

---

## 21. Recomendación importante para pricing realista

El costo del equipo no debería ser un detalle opcional. Debe ser un bloque explícito dentro del pricing.

### Si no se incluye, se pierden tres cosas:

- costo real de ejecución
- calidad del cálculo por seniority
- diferencia entre trabajo individual y equipo

Y esto lleva a una cotización que parece técnica, pero en realidad está “adivinando” el costo real del trabajo.

---

## 22. Cierre

La guía de pricing debe distinguir claramente entre:

- arquitectura del proyecto
- ejecución del proyecto
- costo del equipo
- costo del mercado / ciudad
- tiempo del proyecto
- riesgo del alcance

Y debe evitar la trampa de asumir que “mismo stack = mismo precio”. No es así. El mismo stack puede ser barato o caro dependiendo del equipo, el mercado, el timeline y el nivel de complejidad real.

Esto es exactamente lo que hace falta documentar para que el cliente, el equipo y la IA trabajen con la misma lógica.
