# PRD: Nueva tab "Chats" en la navegación principal

## Objetivo

Agregar una nueva pestaña (tab) "Chats" en la barra de navegación inferior de la aplicación, ubicada entre las tabs "Room" y "Profile", para que el usuario pueda acceder al listado de sus conversaciones activas desde cualquier parte de la app.

## Requerimiento

El usuario necesita una vista dedicada que muestre el listado de sus conversaciones activas. Esta vista ya existe en `app/(chat)/chats.tsx` pero no tiene acceso desde la navegación principal (tabs). Se debe:

1. **Crear** `app/(tabs)/chat.tsx` que importe y reutilice la pantalla de listado de chats existente (`app/(chat)/chats.tsx`).
2. **Modificar** `app/(tabs)/_layout.tsx` para agregar una nueva tab "Chats" entre "Room" y "Profile" con un icono representativo.
3. **Reutilizar** toda la lógica y componentes existentes:
   - `app/(chat)/chats.tsx` — pantalla de listado
   - `app/(chat)/useChats.ts` — hook con lógica de negocio (fetch de conversaciones desde Supabase)
   - `@/components/chat-card` — componente de tarjeta de conversación
   - `app/(chat)/chat/[id].tsx` — pantalla de chat individual (ya funcional)
   - `app/(chat)/_layout.tsx` — layout Stack del grupo (chat) (ya funcional)

## Funcionalidad existente (se reutiliza)

- El hook `useChats` obtiene las conversaciones donde el usuario autenticado es participante (`participant1_id` o `participant2_id`), ordenadas por `last_message_at` descendente.
- Cada conversación muestra: nombre del otro usuario (`display_name`), último mensaje (`content`), y timestamp (`last_message_at`).
- Si no hay conversaciones, se muestra un estado vacío con mensaje "No conversations yet" e indicación de tocar a alguien cercano para iniciar.
- Al tocar una conversación, navega a `chat/[id]?otherUserId=...` usando `expo-router`.

## Archivos involucrados

| Archivo | Acción | Descripción |
|---|---|---|
| `app/(tabs)/chat.tsx` | **Crear** | Nueva pantalla de tab que renderiza el listado de chats |
| `app/(tabs)/_layout.tsx` | **Modificar** | Agregar `Tabs.Screen` para "Chats" entre Room y Profile |
| `app/(chat)/chats.tsx` | Reutilizar (sin cambios) | Pantalla de listado existente |
| `app/(chat)/useChats.ts` | Reutilizar (sin cambios) | Hook existente |
| `app/(chat)/chat/[id].tsx` | Reutilizar (sin cambios) | Pantalla de chat individual |
| `app/(chat)/_layout.tsx` | Reutilizar (sin cambios) | Layout Stack del grupo (chat) |

## Criterios de aceptación

1. **CA-01:** La barra de tabs inferior muestra 3 tabs en este orden: Room | Chats | Profile.
2. **CA-02:** La tab "Chats" tiene un icono de burbuja de chat (`chatbubbles-outline` de Ionicons).
3. **CA-03:** Al tocar la tab "Chats" se muestra el listado de conversaciones activas del usuario.
4. **CA-04:** El listado de chats muestra: nombre del otro usuario, último mensaje, y timestamp de la última actividad.
5. **CA-05:** Si no hay conversaciones, se muestra el estado vacío "No conversations yet".
6. **CA-06:** Al tocar una conversación, se navega a la pantalla de chat individual (`chat/[id]`) correctamente.
7. **CA-07:** La tab "Room" y "Profile" siguen funcionando exactamente como antes (sin regresiones).
8. **CA-08:** El header de la tab "Chats" debe mostrar el título "Chats".

## Notas técnicas

- La navegación `(tabs)/chat.tsx` debe redirigir o renderizar el contenido de `(chat)/chats.tsx`. Dado que `expo-router` maneja grupos de rutas, se puede crear una pantalla que reexporte el componente o usar un enfoque de reutilización directa.
- El icono sugerido es `chatbubbles-outline` de `@expo/vector-icons/Ionicons`, manteniendo la consistencia con las tabs existentes.
- Los estilos y colores deben seguir las constantes definidas en `@/constants/theme`.
