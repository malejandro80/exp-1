# PRD: Migración de pipeline de 5 agentes al flujo de Superpowers

**Fecha:** 2026-05-21
**Product Agent:** @product-agent
**Estado:** Listo para arquitectura

---

## 1. Objetivo

Reemplazar la pipeline actual de 5 agentes secuenciales (product-agent → architect-agent → developer-agent → qa-agent → devops-agent) por el flujo basado en skills que provee **Superpowers** (obra/superpowers), un framework de metodología de desarrollo para agentes de código.

## 2. Motivación

La pipeline actual es lineal y artesanal: cada agente fue definido a mano con instrucciones en markdown. Superpowers ofrece un flujo más maduro, probado por la comunidad (~200k stars) y mantenido activamente, con skills especializados que cubren el ciclo completo de desarrollo:

| Etapa | Pipeline actual | Superpowers |
|-------|----------------|-------------|
| Refinamiento de ideas | product-agent (custom) | brainstorming skill |
| Plan técnico | architect-agent (custom) | writing-plans skill |
| Implementación | developer-agent (custom) | subagent-driven-development + TDD |
| Code review | (manual / no formalizado) | requesting-code-review + receiving-code-review |
| QA / tests | qa-agent (custom) | test-driven-development |
| Entrega / PR | devops-agent (custom) | finishing-a-development-branch |

## 3. Cambios concretos

### 3.1. Instalar plugin de Superpowers

Agregar en `opencode.json` dentro del arreglo `plugins`:

```json
"superpowers@git+https://github.com/obra/superpowers.git"
```

Esto registrará todos los skills de Superpowers y habilitará el bootstrap automático.

### 3.2. Eliminar agentes personalizados antiguos

Eliminar los siguientes archivos:

- `.opencode/agents/product-agent.md`
- `.opencode/agents/architect-agent.md`
- `.opencode/agents/developer-agent.md`
- `.opencode/agents/qa-agent.md`
- `.opencode/agents/devops-agent.md`

La carpeta `.opencode/agents/` puede eliminarse si queda vacía.

### 3.3. Reescribir `AGENTS.md`

El archivo `AGENTS.md` actual describe la pipeline de 5 agentes. Debe reescribirse para reflejar el nuevo flujo de Superpowers:

- Documentar la instalación del plugin
- Explicar el nuevo flujo basado en skills: brainstorming → writing-plans → subagent-driven-development (con TDD + code review) → finishing-a-development-branch
- Incluir referencia al `learning_db.json` como sistema de aprendizaje transversal
- Especificar que `@architect-agent`, `@developer-agent`, `@qa-agent`, `@devops-agent` ya no existen como agentes dedicados; el flujo lo manejan los skills de Superpowers

### 3.4. Mantener lo existente (sin cambios)

- `.opencode/learning_db.json` — se conserva como referencia histórica y para aprendizaje continuo
- `.opencode/skills/git-flow/` — se mantiene (compatible con Superpowers)
- `.opencode/skills/supabase/` — se mantiene (no hay equivalente en Superpowers)
- `.opencode/skills/SKILLS.md` — se mantiene
- `skills-lock.json` — se mantiene
- Plugin `opencode-pixel-agents` — se mantiene

## 4. Flujo de trabajo post-migración

```
Usuario expresa idea
        │
        ▼
┌─────────────────────────────────────────────┐
│  brainstorming skill                         │
│  - Preguntas de refinamiento                 │
│  - Propuesta de approaches (2-3)            │
│  - Diseño detallado                         │
│  - Guarda spec en docs/superpowers/specs/   │
└─────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────┐
│  writing-plans skill                         │
│  - Desglose en tareas pequeñas (2-5 min)    │
│  - Código completo en cada paso             │
│  - Guarda plan en docs/superpowers/plans/   │
└─────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────┐
│  subagent-driven-development skill          │
│  (o executing-plans según preferencia)       │
│  - Subagente fresh por tarea                │
│  - TDD: RED → GREEN → REFACTOR             │
│  - Code review (spec compliance + calidad)  │
└─────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────┐
│  finishing-a-development-branch skill       │
│  - Verifica tests                           │
│  - Opciones: merge / PR / mantener / descartar│
│  - Abre PR si corresponde                   │
└─────────────────────────────────────────────┘
```

El `learning_db.json` se conserva como sistema de aprendizaje transversal: cualquier agente/skill puede registrar lecciones aprendidas durante cualquiera de las etapas.

## 5. Criterios de aceptación

1. **Plugin instalado correctamente**: `opencode.json` contiene `"superpowers@git+https://github.com/obra/superpowers.git"` en su arreglo `plugins` y OpenCode lo carga sin errores.
2. **Skills disponibles**: Al ejecutar OpenCode, el comando `skill` lista los skills de Superpowers (brainstorming, writing-plans, subagent-driven-development, test-driven-development, requesting-code-review, receiving-code-review, finishing-a-development-branch, systematic-debugging, verification-before-completion, using-git-worktrees, using-superpowers, writing-skills, dispatching-parallel-agents, executing-plans).
3. **Archivos de agentes viejos eliminados**: No existe ningún archivo `.opencode/agents/*.md`.
4. **AGENTS.md reescrito**: Describe el nuevo flujo de Superpowers, no la vieja pipeline de 5 agentes.
5. **learning_db.json intacto**: El archivo se conserva con todas sus entradas históricas.
6. **Skills existentes preservados**: `git-flow` y `supabase` siguen funcionando.
7. **`opencode-pixel-agents` preservado**: El plugin sigue en `opencode.json`.
8. **Verificación de humo**: Al iniciar OpenCode y pedir "Tell me about your superpowers", responde confirmando que Superpowers está activo.

## 6. Exclusiones (fuera de alcance)

- No se modifica el código de la app Expo ni sus dependencias.
- No se migran features existentes al nuevo flujo.
- No se elimina el directorio `.opencode/skills/` ni skills locales.
- No se toca `skills-lock.json`.

## 7. Riesgos

| Riesgo | Mitigación |
|--------|-----------|
| Superpowers plugin no compatible con versión actual de OpenCode | Verificar compatibilidad antes de mergear; si falla, evaluar pin de versión en `#tag` |
| Skills de Superpowers solapan con skills locales (git-flow) | Se mantienen ambos; git-flow tiene prioridad local |
| Pérdida de contexto de sesiones previas (learning_db) | Se conserva learning_db y se documenta su uso en AGENTS.md |
| Usuarios del equipo confundidos por el cambio de flujo | AGENTS.md actualizado sirve como documentación de referencia |
