# 02 Gameplay Specs

## Sistema de tiro
- El jugador apunta en una vista frontal de portería.
- La portería se divide en una cuadrícula discreta.
- Cada clic dentro del área válida fija un objetivo.
- El balón se mueve en una parábola hacia ese objetivo.
- En el nivel 1 se dispara inmediatamente; en los siguientes niveles, tras responder el reto matemático.

## Apuntado
- El objetivo se representa con una retícula roja sobre la portería.
- El jugador elige coordenadas X/Y dentro del rectángulo de la portería.
- Se debe evitar apuntar fuera de la portería.
- Debe quedar claro cuando un clic no es válido en el área de disparo.

## Potencia
- La potencia está ligada al resultado matemático.
- Respuesta correcta produce un tiro rápido y potente.
- Respuesta incorrecta o tiempo agotado produce un tiro lento y débil.
- El tiro lento hace al portero más probable de detener el balón.

## Trayectoria
- El balón sigue una curva parabólica hacia la retícula.
- El punto inicial está en la parte inferior central de la pantalla.
- La animación usa easing para dar sensación de arco suave.
- El balón escala ligeramente durante el vuelo para simular profundidad.

## Portero
- El portero patrulla de lado a lado dentro de la portería.
- Su velocidad crece con la dificultad.
- En cada disparo se evalúa si está lo suficientemente cerca del objetivo horizontal.
- Si el portero está dentro de su alcance de bloqueo, el disparo se considera atajado.
- Niveles iniciales pueden omitir portero para enseñar puntería.

## Gol / fallo
- Gol si el objetivo está dentro de los límites de la portería y el portero no lo bloquea.
- Fuera si se apunta fuera de los bordes.
- Atajada si el portero se interpone y el tiro es débil o lento.
- Fallo por tiempo si el jugador no responde antes de que expire el temporizador.
- Se considera fallo leve o fuerte según la causa (falta de puntería, error matemático, tiempo).

## Feedback visual
- Círculo de objetivo con color destacado en la portería.
- Panel de texto con mensajes claros: "GOL", "FUERA", "ATAJADA", "Tiro débil".
- Colores relacionados: verde para acierto, rojo para fallo, naranja para advertencia.
- Animaciones sencillas: brillo en gol, shake de pantalla en fallo, cambio de texto.
- Barra de tiempo visible en niveles con desafío matemático.
- Mensaje contextual que explica el motivo del resultado.
