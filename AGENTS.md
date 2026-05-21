# Workflow multi-agente

Este proyecto usa una pipeline de 5 agentes para convertir ideas en PRs funcionales.

## Pipeline

1. **@product-agent** — Entrevista al usuario y genera el PRD
2. **@architect-agent** — Traduce el PRD en un plan técnico
3. **@developer-agent** — Implementa el código y tests
4. **@qa-agent** — Ejecuta la suite de pruebas
5. **@devops-agent** — Abre el Pull Request en GitHub

Cada agente pasa el control al siguiente solo cuando su tarea está completa.

<!-- @format -->
