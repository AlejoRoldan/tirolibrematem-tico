# Game Design Document (GDD)
## Tiro Libre Matemático

**Versión:** 1.0
**Fecha:** Mayo 2026
**Autor:** Alejo Roldán — iatechdev

---

## 1. Concepto del Juego

**Nombre:** Tiro Libre Matemático
**Género:** Videojuego educativo de deportes (fútbol)
**Plataforma:** Android (APK instalable)
**Motor:** Unity 2022.3 LTS
**Lenguaje:** C#
**Presupuesto:** $0 — 100% herramientas gratuitas

**Descripción:** Un videojuego 3D de tiros libres de fútbol donde el jugador debe resolver operaciones matemáticas para definir la potencia y dirección de cada tiro. Diseñado para enseñar matemáticas de grados 6°, 7° y 8° de bachillerato en Colombia de forma divertida.

**Inspiración visual:** Free Kick Classic, Top Eleven.

---

## 2. Jugador Objetivo

| Perfil | Descripción |
| :--- | :--- |
| **Principal** | Martín, 12-15 años, grado 6° bachillerato, fanático del fútbol. Equipos favoritos: Barcelona FC y Atlético Nacional. Jugadores favoritos: Messi y Lamine Yamal. |
| **Secundario** | Estudiantes de grados 6°, 7° y 8° de bachillerato en Colombia. |

---

## 3. Mecánica Principal

El jugador ve la portería desde detrás del balón (cámara en tercera persona, estilo FIFA).

**Flujo de un turno:**
1. El jugador toca la pantalla para seleccionar una zona de la portería (que tiene una cuadrícula del plano cartesiano superpuesta).
2. Aparece un panel con una operación matemática que debe resolver (ej: `6 × 7 = ?`).
3. Una barra de tiempo se agota progresivamente.
4. Si responde correctamente → el balón vuela rápido y fuerte → difícil de atajar.
5. Si responde mal o se acaba el tiempo → el balón va lento → el portero lo ataja fácilmente.
6. El jugador puede deslizar el dedo para aplicar efecto de curva al tiro.

---

## 4. Sistema de Potencia

| Condición | Velocidad del balón | Resultado esperado |
| :--- | :--- | :--- |
| Respuesta correcta + tiempo restante | V_max = 20 unidades/segundo | Difícil de atajar → GOL |
| Respuesta incorrecta o tiempo agotado | V_min = 5 unidades/segundo | El portero siempre llega → ATAJADA |

---

## 5. El Plano Cartesiano

La portería tiene una cuadrícula con ejes X e Y visible. El punto donde el jugador toca muestra sus coordenadas en pantalla.

| Nivel | Configuración del plano |
| :--- | :--- |
| Niveles iniciales (6°) | Origen (0,0) en esquina inferior izquierda. Rango: x[0,10], y[0,5] |
| Niveles avanzados (7°-8°) | Origen (0,0) en el centro. Rango: x[-5,5], y[0,5] |

**Tamaño lógico de la portería:** 10 unidades de ancho × 5 unidades de alto.

---

## 6. Vidas y Puntuación

- 3 vidas por sesión (representadas como 3 balones en el HUD).
- Se pierde una vida por cada tiro fallado o bloqueado.
- +100 puntos por cada gol.
- El progreso se guarda en el dispositivo (PlayerPrefs).

---

## 7. Estructura de Niveles

### MVP v0.1 (31 de julio de 2026)

| Nivel | Nombre | Grado | Operación matemática | Obstáculos | Tiempo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Entrenamiento | 6° | Ninguna (solo apuntar) | Ninguno | Infinito |
| 2 | El Portero | 6° | Multiplicación ×2 al ×5 | Portero lento | 7s |
| 3 | La Barrera | 6° | Multiplicación ×2 al ×9 | Portero + barrera (2 jug.) | 5s |

### v0.5 (Octubre 2026)

| Nivel | Nombre | Grado | Operación matemática | Obstáculos | Tiempo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 4 | Fracciones | 6° | Fracciones simples | Portero + barrera | 5s |
| 5 | Proporciones | 7° | Razones y porcentajes | Barrera que salta | 4s |
| 6 | Álgebra | 7° | Ecuación simple (despeja x) | Portero rápido | 4s |

### v1.0 (Noviembre 2026)

| Nivel | Nombre | Grado | Operación matemática | Obstáculos | Tiempo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 7 | Ángulos | 8° | Ángulos complementarios | Curva obligatoria | 4s |
| 8 | Pitágoras | 8° | Distancia con Pitágoras | Nivel final sin red | 3s |

---

## 8. Comportamiento de la IA

### Portero

El portero se mueve lateralmente sobre la línea de gol (eje X).

| Nivel | Velocidad |
| :--- | :--- |
| Nivel 2 | 2 unidades/segundo |
| Nivel 3 | 3 unidades/segundo |
| Nivel 4 en adelante | 5 unidades/segundo |

**Lógica:** cuando el jugador dispara, el portero calcula el punto de impacto (x, y). Si el balón va a V_max y está a más de 2 unidades → GOL. Si el balón va a V_min → el portero siempre llega → ATAJADA.

### Barrera

Jugadores estáticos colocados entre el balón y la portería. Cada jugador tiene un hitbox de 1 unidad de ancho × 2.5 unidades de alto. En niveles avanzados, saltan en el eje Y para bloquear tiros rasos. Si la trayectoria del balón intersecta el hitbox → BLOQUEADO.

---

## 9. Diseño Visual y Temático

**Estilo:** 3D con cámara dinámica (detrás del jugador, cambios en el gol como replay).

**Paleta de colores por equipo:**

| Equipo | Color 1 | Color 2 | Color 3 |
| :--- | :--- | :--- | :--- |
| Barcelona FC | Azul `#004D98` | Rojo `#A50044` | Oro `#EDBB00` |
| Atlético Nacional | Verde `#006633` | Blanco `#FFFFFF` | Dorado `#FFD700` |

**Avatar del jugador:** El jugador escribe su nombre al inicio. El nombre aparece en la camiseta del personaje. Puede elegir entre camiseta de Barcelona o de Atlético Nacional.

---

## 10. Interfaz de Usuario (HUD)

**Durante el juego:**
- Esquina superior izquierda: 3 iconos de balón (vidas restantes).
- Esquina superior derecha: Contador de puntos.
- Centro de la portería: Cuadrícula cartesiana semitransparente con ejes X e Y.
- Centro inferior: Panel de operación matemática con campo de texto y barra de tiempo.
- Barra de tiempo: Se vacía de verde a rojo según el tiempo restante.

**Feedback visual:**
- Respuesta correcta: Balón brilla (efecto de partícula dorada), sonido positivo.
- Respuesta incorrecta: Balón se desinfla visualmente, sonido de error.
- GOL: Animación de celebración, cambio de cámara (replay lateral), texto "¡GOL!" en pantalla.
- ATAJADA: Animación del portero, texto "¡Atajada!" en pantalla.

**Pantallas del juego:**

| Pantalla | Descripción |
| :--- | :--- |
| MainMenu | Logo del juego, botón Jugar, botón Opciones, selección de equipo/avatar. |
| LevelSelect | Mapa de niveles con candados (bloqueados/desbloqueados), puntaje máximo por nivel. |
| Gameplay | La pantalla principal del juego. |
| GameOver | Puntaje final, vidas usadas, botón Reintentar y botón Menú. |

---

## 11. Assets Gratuitos Recomendados

| Tipo | Fuente | Notas |
| :--- | :--- | :--- |
| Personajes animados | [Mixamo](https://www.mixamo.com) | Gratis, descarga en .fbx |
| Estadio | Unity Asset Store | Buscar "Free Soccer Stadium" |
| Balón | Unity Asset Store | Buscar "Free Soccer Ball" |
| Sonidos | [freesound.org](https://freesound.org) | "crowd cheering", "football kick", "goal celebration" |
| Fuentes | [Google Fonts](https://fonts.google.com) | Oswald o Bebas Neue (estilo deportivo) |

---

## 12. Configuración Técnica de Android

| Parámetro | Valor |
| :--- | :--- |
| Company Name | iatechdev |
| Product Name | Tiro Libre Matemático |
| Default Orientation | Landscape Left |
| Minimum API Level | Android 8.0 (API 26) |
| Target API Level | Android 13 (API 33) |
| Scripting Backend | IL2CPP |
| Target Architectures | ARM64 |
