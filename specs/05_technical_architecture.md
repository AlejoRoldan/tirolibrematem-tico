# 05 Technical Architecture

## Arquitectura actual detectada
- Frontend con **React 19**, **Vite** y **TypeScript**.
- Router ligero con **wouter**.
- UI basada en componentes propios y librerías Radix/UI + Tailwind.
- Juego principal implementado en `client/src/pages/Home.tsx` y `client/src/hooks/useGameEngine.ts`.
- Renderizado de campo con un componente canvas (`GameCanvas`).
- Lógica de juego y estados en un hook personalizado (`useGameEngine`).
- Backend mínimo con **Express** para servir la aplicación en producción.
- Está presente un servidor estático para `dist` y no hay base de datos.

## Arquitectura propuesta
- Mantener la separación entre:
  - **Lógica de juego**: `useGameEngine` y funciones puras de reglas.
  - **Render/UI**: componentes de React para pantalla, HUD y canvas.
  - **Datos/constantes**: `LEVELS`, `GOAL_W`, `GOAL_H` y config en módulos compartidos.
- Añadir una capa de utilidades puras para cálculos de gol, evaluación de tiro y generación de retos.
- Seguir usando la arquitectura client-only para MVP; el backend es solo para hosting.

## Separación entre gameplay, UI y datos
- **Gameplay**: el hook `useGameEngine` debería ser el único responsable del flujo de estados.
- **UI**: `Home.tsx` y subcomponentes muestran el estado y llaman a acciones como `selectTarget`, `submitMath`.
- **Datos**: valores de nivel, configuración y constantes compartidas deben vivir en módulos dedicados.
- **Render**: `GameCanvas` renderiza el campo/cancha y no debe contener lógica compleja de juego.

## Riesgos técnicos
- **Raf loops y setState frecuentes**: la animación del portero y del balón usa `requestAnimationFrame`, lo que puede ser costoso si no se controla bien.
- **Sin cobertura de tests**: no hay pruebas automáticas del engine ni de la validación matemática.
- **Audio en móviles**: Web Audio puede bloquearse en navegadores móviles sin interacción previa.
- **Responsive canvas**: el componente canvas debe redimensionarse bien en móviles.
- **Tiempo de respuesta en niveles**: el temporizador actual se basa en intervalos de 100ms y puede necesitar suavizado.
- **Dependencias grandes**: Tailwind + Radix + Framer Motion pueden inflar el bundle si no se optimiza.

## Recomendaciones
- Extraer las reglas de gol / portero / tiro a funciones puras testeables.
- Añadir tests unitarios para `useGameEngine` y módulos de lógica.
- Crear un componente de HUD independiente para reducir la complejidad de `Home.tsx`.
- Evitar escribir en `localStorage` en componentes de renderizado directo; usar efectos controlados.
- Validar el canvas en móviles y asegurar tamaño mínimo de hit area.
- Mantener el backend simple: solo servir archivos y fallback a `index.html`.
