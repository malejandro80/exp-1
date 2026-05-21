# Flujo de desarrollo con Superpowers

Este proyecto usa **Superpowers** (obra/superpowers), un plugin de skills para OpenCode que estandariza el ciclo de desarrollo completo.

## Instalación

Superpowers está registrado como plugin en `opencode.json`. OpenCode lo carga automáticamente al iniciar.

## Skills disponibles

Los siguientes skills de Superpowers están disponibles:

| Skill | Propósito |
|-------|-----------|
| `brainstorming` | Refinamiento de ideas y escritura de specs |
| `writing-plans` | Desglose de specs en tareas técnicas atómicas |
| `subagent-driven-development` | Implementación con subagente fresh por tarea |
| `test-driven-development` | Ciclo RED → GREEN → REFACTOR |
| `requesting-code-review` | Solicitar revisión de código |
| `receiving-code-review` | Procesar feedback de revisión |
| `finishing-a-development-branch` | Verificación de tests y apertura de PR |
| `executing-plans` | Ejecución directa de planes (alternativa a SDD) |
| `systematic-debugging` | Depuración estructurada |
| `verification-before-completion` | Verificación final antes de dar tarea por terminada |
| `using-git-worktrees` | Trabajo con git worktrees |
| `using-superpowers` | Meta-skill de ayuda sobre Superpowers |
| `writing-skills` | Creación de nuevos skills |
| `dispatching-parallel-agents` | Ejecución paralela de agentes |

## Flujo de trabajo recomendado

```
Usuario expresa idea
        │
        ▼
┌─────────────────────────────────────┐
│  brainstorming skill                 │
│  - Refinamiento y preguntas          │
│  - Diseño detallado                  │
│  - Guarda spec en docs/superpowers/  │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  writing-plans skill                 │
│  - Desglose en tareas pequeñas       │
│  - Código completo en cada paso      │
│  - Guarda plan en docs/superpowers/  │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  subagent-driven-development         │
│  (o executing-plans)                 │
│  - Subagente fresh por tarea         │
│  - TDD: RED → GREEN → REFACTOR      │
│  - Code review integrado             │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│  finishing-a-development-branch      │
│  - Verifica tests                    │
│  - Abre PR / merge / descarta        │
└─────────────────────────────────────┘
```

## Sistema de aprendizaje

El archivo `.opencode/learning_db.json` almacena lecciones aprendidas durante el desarrollo. Todos los skills/agentes deben:

1. **Leer `learning_db.json`** al comenzar su tarea y aplicar las reglas documentadas.
2. **Agregar entradas** cuando encuentren un problema nuevo o reciban feedback.
3. **Incluir** qué salió mal, quién lo causó, cómo se arregló y la regla para no repetirlo.

## Notas importantes

- Los agentes dedicados anteriores (`@product-agent`, `@architect-agent`, `@developer-agent`, `@qa-agent`, `@devops-agent`) ya no existen. El flujo se maneja con skills de Superpowers.
- Hay dos MCP servers configurados para acceso directo:
  - **Supabase MCP** — acceso completo a DB, API keys, auth, edge functions, storage
  - **GitHub MCP** — acceso completo a issues, PRs, repos, usuarios, búsqueda
- Para cargar un skill de Superpowers, usa el comando `skill` con el nombre del skill (ej: `skill brainstorming`).

<!-- @format -->
