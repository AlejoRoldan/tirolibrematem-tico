# 01 MVP Scope

## Qué entra en el MVP
- Pantalla principal de juego con portería, portero y balón.
- Mecánica de apuntado por clic/tap en una cuadrícula de la portería.
- Nivel inicial sin matemáticas para enseñar el gesto de tirar.
- Niveles con multiplicaciones sencillas integradas antes del tiro.
- Portero móvil con comportamiento de patrulla lateral.
- Evaluación de gol / fallo con feedback visual y sonido.
- Puntuación básica, vidas y streaks.
- Progresión de niveles simples con aumento de dificultad.
- Uso de React + Vite + TypeScript + canvas para renderizado del campo.

## Qué queda fuera
- Modo carrera / historia extensa.
- Personalización avanzada de personajes, skins o estadios.
- Multijugador, redes o sincronización en la nube.
- Sistema de cuentas / usuario.
- Física realista completa; se usa una simulación de trayectoria simple.
- Animaciones complejas en 3D o gráficos muy detallados.
- IA de portero avanzada más allá de un patrón lateral.
- Puesta en producción con backend más allá de servidor estático simple.

## Mecánicas mínimas jugables
- Aim: seleccionar el objetivo en la portería.
- Shoot: transformar la elección en un disparo con trayectoria.
- Math: preguntar y validar multiplicaciones en niveles con desafío.
- Goal/Miss: calcular gol según posición y alcance del portero.
- Feedback: mostrar mensajes y colores para aciertos o errores.
- Progresión: avanzar de nivel tras marcar el número necesario de goles.

## Criterios de éxito
- El juego es jugable end-to-end desde el inicio hasta el primer nivel.
- Un niño entiende dónde tocar y por qué ganó o perdió.
- La solución matemática impacta claramente en la potencia/resultado del tiro.
- No hay bloqueos visibles en la animación y la interfaz responde rápido.
- El MVP puede probarse en navegador con un solo comando (`pnpm dev`).
