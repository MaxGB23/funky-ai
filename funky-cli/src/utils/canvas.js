export function generateProjectCanvasMarkdown(config = {}) {
  const f = (val) => val || 'No definido / Pendiente';
  return `# 🚀 PROJECT CANVAS

## 1. Framework Base
${f(config.framework)}

## 2. Patrón Arquitectónico
${f(config.pattern)}

## 3. Gestión de Estado
${f(config.state)}

## 4. Estrategia UI
${f(config.styling)}

## 5. Estrategia de Testing
${f(config.testing)}
`;
}

export function generateInfraCanvasMarkdown(config = {}) {
  const f = (val) => val || 'No definido / Pendiente';
  return `# 🏗️ INFRA CANVAS

## 1. Base de Datos / ORM
${f(config.database)}

## 2. Autenticación
${f(config.auth)}

## 3. Linter / Formatter
${f(config.linter)}

## 4. Deployment & CI/CD
${f(config.deployment)}
`;
}
