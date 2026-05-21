# Workflow multi-agente

Este proyecto usa una pipeline de 5 agentes para convertir ideas en PRs funcionales.

## Pipeline

1. **@product-agent** — Entrevista al usuario y genera el PRD
2. **@architect-agent** — Traduce el PRD en un plan técnico
3. **@developer-agent** — Implementa el código y tests
4. **@qa-agent** — Ejecuta la suite de pruebas
5. **@devops-agent** — Abre el Pull Request en GitHub

Cada agente pasa el control al siguiente solo cuando su tarea está completa.

## Sistema de aprendizaje

Para evitar que los errores se repitan, todos los agentes deben:

1. **Leer `.opencode/learning_db.json`** al comenzar su tarea y aplicar las reglas documentadas.
2. **Agregar entradas** al learning_db cuando encuentren un problema nuevo o reciban feedback del usuario.
3. **Incluir en la entrada**: qué salió mal, quién lo causó, cómo se arregló, y la regla para no repetirlo.

El `@devops-agent` también guarda feedback de PRs rechazados en el learning_db y redirige al agente correspondiente.

<!-- @format -->
