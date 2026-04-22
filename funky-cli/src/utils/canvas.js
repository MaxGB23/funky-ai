function generateCanvasMarkdown(config) {
  return `# 🚀 PROJECT CANVAS

## 1. Patrón Arquitectónico Base
${config.pattern || 'No definido'}

## 2. Gestión de Estado y Datos
${config.state || 'No definido'}

## 3. Ecosistema y Tooling
${config.tooling || 'No definido'}

## 4. Estrategia de Estilos y UI
${config.styling || 'No definido'}

## 5. Testing y CI/CD
${config.testing || 'No definido'}

## 6. SecOps y Entornos
${config.secops || 'No definido'}
`;
}

export { generateCanvasMarkdown };
