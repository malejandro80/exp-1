# Plan Técnico: Migración de pipeline de 5 agentes al flujo de Superpowers

**Fecha:** 2026-05-21
**Architect Agent:** @architect-agent
**PRD Referencia:** `.opencode/current_prd.md`

---

## Resumen

Migrar la pipeline artesanal de 5 agentes (product → architect → developer → qa → devops) al flujo estandarizado de Superpowers (obra/superpowers), un plugin de skills para OpenCode.

---

## Cambios

### 1. `opencode.json` — Modificar

**Archivo:** `/Users/miguel/Desktop/programacion/opencode/exp-1/opencode.json`

**Cambio A — Agregar plugin Superpowers:**
```jsonc
// En el arreglo "plugins", agregar:
"superpowers@git+https://github.com/obra/superpowers.git"
```
- Posición: después de `"opencode-pty"` (al final del arreglo).
- No remover plugins existentes.

**Cambio B — Cambiar `default_agent`:**
- Actual: `"product-agent"` → va a ser eliminado.
- Nuevo valor: `null` (OpenCode usará su default cuando no hay agentes personalizados).
- Alternativa: Si OpenCode requiere un valor no-null, usar `"superpowers"` o `""`. Evaluar al implementar.

**Estructura final esperada:**
```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4.5",
  "default_agent": null,
  "instructions": ["AGENTS.md"],
  "plugins": [
    "opencode-daytona",
    "opencode-pty",
    "superpowers@git+https://github.com/obra/superpowers.git"
  ],
  "permission": {
    "bash": {
      "allow": ["npm test", "pytest", "git status"]
    },
    "skill": {
      "*": "allow"
    }
  }
}
```

---

### 2. Eliminar 5 archivos de agentes

| Archivo | Ruta |
|---------|------|
| product-agent | `.opencode/agents/product-agent.md` |
| architect-agent | `.opencode/agents/architect-agent.md` |
| developer-agent | `.opencode/agents/developer-agent.md` |
| qa-agent | `.opencode/agents/qa-agent.md` |
| devops-agent | `.opencode/agents/devops-agent.md` |

**Post-eliminación:** Si el directorio `.opencode/agents/` queda vacío, eliminarlo.

---

### 3. Reescribir `AGENTS.md`

**Archivo:** `/Users/miguel/Desktop/programacion/opencode/exp-1/AGENTS.md`

Contenido nuevo (ver sección 5 abajo).

---

### 4. Archivos que NO se modifican

| Archivo | Estado |
|---------|--------|
| `.opencode/learning_db.json` | Conservar intacto |
| `.opencode/skills/git-flow/SKILL.md` | Conservar |
| `.opencode/skills/supabase/SKILL.md` | Conservar |
| `.opencode/skills/SKILLS.md` | Conservar (vacío, no tocar) |
| `skills-lock.json` | No tocar |
| `opencode-pixel-agents` | Conservar (plugin existente) |

---

### 5. Contenido del nuevo `AGENTS.md`

```markdown
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
- Los skills locales `git-flow` y `supabase` se mantienen y son compatibles con Superpowers.
- Para cargar un skill de Superpowers, usa el comando `skill` con el nombre del skill (ej: `skill brainstorming`).

<!-- @format -->
```

---

## 6. Orden de implementación

1. **`opencode.json`** — Agregar plugin Superpowers y cambiar `default_agent`.
2. **Eliminar agentes viejos** — Borrar los 5 archivos `.md` en `.opencode/agents/`.
3. **`AGENTS.md`** — Reescribir con el contenido definido en la sección 5.
4. **Verificación de humo** — Iniciar OpenCode y confirmar que Superpowers se carga sin errores.
5. **Limpiar directorio** — Si `.opencode/agents/` quedó vacío, eliminarlo.

---

## 7. Lecciones aplicadas del learning_db

| Regla | Aplicación |
|-------|-----------|
| L-003 (gh auth scopes) | No relevante — no creamos PRs en esta migración |
| L-004 (no incluir artefactos de pipeline en commits) | **Al hacer commit, incluir solo:** `opencode.json`, `AGENTS.md`. **NO incluir:** `current_prd.md`, `technical_plan.md`, archivos de `.opencode/agents/` ya eliminados |
| L-005 (revertir archivos no relacionados) | Si hay cambios accidentales en otros archivos, usar `git checkout main -- <file>` |
| L-007 (tests obligatorios en PRs) | No aplica — esta migración no agrega features de app |

---

## 8. Riegos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Superpowers incompatible con versión de OpenCode | Probar con `opencode --version` antes; si falla, pin versión con `#tag` |
| `default_agent: null` no es válido | Usar `""` o eliminar la propiedad si OpenCode lo soporta |
| Skills de Superpowers solapan con git-flow | Ambos coexisten; git-flow tiene prioridad local |

---

*Fin del plan técnico. Pasar a @developer-agent para implementación.*
