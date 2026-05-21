# Plan Técnico: Nueva tab "Chats" en la navegación principal

## Resumen

Agregar una nueva pestaña "Chats" en la barra de tabs inferior entre "Room" y "Profile", reutilizando la pantalla de listado de conversaciones existente en `app/(chat)/chats.tsx`.

---

## 1. Archivos a crear

### 1.1 `app/(tabs)/chat.tsx`

**Acción:** CREAR

**Propósito:** Pantalla del tab "Chats" que reutiliza el componente `ChatsScreen` de `app/(chat)/chats.tsx`.

**Contenido exacto:**

```tsx
import ChatsScreen from '../(chat)/chats'

export default function ChatsTab() {
  return <ChatsScreen />
}
```

**Explicación técnica:**
- Importa el componente default export de `app/(chat)/chats.tsx` (que es `function ChatsScreen()`) mediante ruta relativa.
- Lo renderiza directamente sin wrapper adicional.
- `ChatsScreen` internamente usa `useChats` que obtiene datos vía `supabase`, maneja estados loading/error/empty y utiliza `FlatList` con `ChatCard`.
- La navegación a `chat/[id]` funciona porque `useChats.navigateToChat` hace `router.push('/chat/${id}?otherUserId=...')`, que resuelve a `app/(chat)/chat/[id].tsx` en el root Stack (cubriendo los tabs), patrón idéntico al usado en `useNearby.ts`.
- Al estar dentro de un Tab Navigator con `headerShown: true`, el título del header lo define el `Tabs.Screen` en `_layout.tsx` (ver sección 2.1).
- `useFocusEffect` en `useChats` se dispara al enfocar el tab, refrescando la lista.

---

## 2. Archivos a modificar

### 2.1 `app/(tabs)/_layout.tsx`

**Acción:** MODIFICAR

**Cambio exacto:** Agregar un nuevo `Tabs.Screen` para "Chats" entre el de `nearby` y `profile`.

**Fragmento actual (líneas 24-43):**

```tsx
      <Tabs.Screen
        name='nearby'
        options={{
          title: 'Room',
          tabBarLabel: 'Room',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='people-outline' color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='person-outline' color={color} size={size} />
          )
        }}
      />
```

**Fragmento modificado:**

```tsx
      <Tabs.Screen
        name='nearby'
        options={{
          title: 'Room',
          tabBarLabel: 'Room',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='people-outline' color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name='chat'
        options={{
          title: 'Chats',
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='chatbubbles-outline' color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name='person-outline' color={color} size={size} />
          )
        }}
      />
```

**Detalles:**
- `name: 'chat'` debe coincidir exactamente con el nombre del archivo creado (`chat.tsx`).
- `title: 'Chats'` define el texto en el header de la tab (CA-08).
- `tabBarLabel: 'Chats'` define el texto en la barra de tabs inferior.
- `tabBarIcon` usa `chatbubbles-outline` de Ionicons, manteniendo consistencia con las otras tabs.

---

## 3. Archivos que NO se tocan

| Archivo | Razón |
|---|---|
| `app/(chat)/chats.tsx` | Ya funciona. Se reutiliza vía import. |
| `app/(chat)/useChats.ts` | Hook funcional. Se usa internamente por `ChatsScreen`. |
| `app/(chat)/chat/[id].tsx` | Pantalla de chat individual funcional. Navegación vía `router.push`. |
| `app/(chat)/chat/useChat.ts` | Hook del chat individual, no se modifica. |
| `app/(chat)/_layout.tsx` | Stack layout del grupo (chat). No necesita cambios. |
| `app/(chat)/chats.styles.ts` | Estilos del listado, no se modifican. |
| `app/(chat)/chat/[id].styles.ts` | Estilos del chat individual, no se modifican. |
| `app/(tabs)/nearby.tsx` | Tab Room, sin cambios. |
| `app/(tabs)/profile.tsx` | Tab Profile, sin cambios. |
| `app/(tabs)/_layout.styles.ts` | Estilos compartidos del tab bar, no se modifican. |
| `app/(tabs)/useNearby.ts` | Hook de Nearby, sin cambios. |
| `app/(tabs)/useProfile.ts` | Hook de Profile, sin cambios. |
| `app/_layout.tsx` | Root layout, sin cambios. |
| `constants/theme.ts` | Constantes de tema, sin cambios. |
| Cualquier componente en `@/components/` | Se reutilizan, no se modifican. |

---

## 4. Árbol de navegación resultante

```
Root Stack (app/_layout.tsx)
├── index → redirect a onboarding o (tabs)/nearby
├── onboarding
├── (tabs) — Tab Navigator
│   ├── nearby  → "Room" (people-outline)
│   ├── chat    → "Chats" (chatbubbles-outline)  ← NUEVO
│   └── profile → "Profile" (person-outline)
└── (chat) — Stack Navigator
    ├── chats       → listado de conversaciones (no se usa directamente desde tabs)
    └── chat/[id]   → pantalla de chat individual (navegación vía router.push)
```

La navegación al tocar una conversación desde la tab "Chats" hace `router.push('/chat/{id}?otherUserId=...')`, que resuelve a `(chat)/chat/[id].tsx` en el root Stack, mostrando el chat individual sobre los tabs.

---

## 5. Criterios de aceptación (mapeo)

| CA | Verificación | Se cumple en |
|---|---|---|
| CA-01 | Barra: Room \| Chats \| Profile | `_layout.tsx` orden de screens |
| CA-02 | Icono `chatbubbles-outline` | `_layout.tsx` tabBarIcon |
| CA-03 | Muestra listado de conversaciones | `chat.tsx` → `ChatsScreen` usa `useChats` |
| CA-04 | Muestra nombre, último msg, timestamp | `ChatCard` componente existente |
| CA-05 | Empty state "No conversations yet" | `ChatsScreen` → `ListEmptyComponent` |
| CA-06 | Tap navega a `chat/[id]` | `useChats.navigateToChat` con `router.push` |
| CA-07 | Room y Profile sin regresiones | No se modifican sus archivos |
| CA-08 | Header title "Chats" | `_layout.tsx` → `title: 'Chats'` + `headerShown: true` |

---

## 6. Orden de implementación

1. **Crear** `app/(tabs)/chat.tsx` — archivo nuevo, contenido exacto descrito arriba.
2. **Modificar** `app/(tabs)/_layout.tsx` — agregar `Tabs.Screen` para "Chats".
3. **Verificar** que la app compila y las tabs se renderizan correctamente.
4. **Verificar** que la navegación a `chat/[id]` funciona desde la tab "Chats".
5. **Verificar** que no hay regresiones en Room ni Profile.
