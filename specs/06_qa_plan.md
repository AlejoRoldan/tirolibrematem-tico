# 06 QA Plan

## Casos de prueba
- Iniciar el juego y verificar que comienza en el nivel 1/0.
- Apuntar dentro de la portería y disparar correctamente en nivel 1.
- Generar un reto matemático en niveles 2+ y verificar la carga del problema.
- Responder correcto y comprobar tiro potente / gol posible.
- Responder incorrecto o dejar vencer el tiempo y comprobar tiro débil / fallos.
- Verificar comportamiento del portero en distintos niveles.
- Comprobar que el puntaje y las vidas se actualizan correctamente.
- Verificar la progresión de nivel cuando se cumple la condición de goles.
- Comprobar la pantalla de "game over" al perder todas las vidas.

## Pruebas unitarias
- Validar cálculo de `answer` en desafíos de multiplicación.
- Probar lógica de decisión de gol/fallo/atajadas en función de coordenadas y portero.
- Verificar que el temporizador de matemáticas expira y dispara el estado de tiro.
- Asegurar que `selectTarget` solo funciona durante la fase de apuntado.
- Comprobar la transición correcta de fases (`aiming` → `math` → `shooting` → `result`).

## Pruebas de gameplay
- Sesiones de juego completas de 5 a 10 disparos.
- Probar en distintos navegadores (Chrome, Edge, Firefox) y en móvil.
- Evaluar el comportamiento de retícula y la respuesta táctil/clic.
- Comprobar tiempos y sensación de dificultad.
- Medir si un niño puede distinguir entre fallo por puntería y fallo matemático.

## Pruebas UX con niños
- Observación de jugadores de 6-10 años durante 1 sesión corta.
- Revisar si entienden el objetivo: "toca y responde".
- Verificar que los botones son lo suficientemente grandes.
- Evaluar claridad de mensajes de feedback.
- Recoger comentarios sobre la motivación: ¿quieren volver a jugar?

## Checklist antes de cada release
- [ ] `pnpm install` sin errores.
- [ ] `pnpm dev` arranca y la app carga.
- [ ] No hay errores en consola del navegador ni del servidor.
- [ ] Funciones de juego básicas funcionan en nivel 1.
- [ ] Retos matemáticos aparecen y se pueden enviar.
- [ ] Puntuación y vidas se actualizan.
- [ ] Se verificó en al menos un móvil/tablet.
- [ ] Los mensajes de feedback son claros y accesibles.
- [ ] No hay regressiones en el flujo principal de juego.
