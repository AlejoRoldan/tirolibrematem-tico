# Historias de Usuario
## Tiro Libre Matemático — 33 HUs en total

**Versión:** 1.0
**Fecha:** Mayo 2026

Las historias marcadas con `(v0.5)` o `(v1.0)` son para versiones posteriores al MVP del 31 de julio.

---

## Épica 1: Setup y configuración del entorno

### HU-001 — Instalación del entorno de desarrollo
**Como** desarrollador,
**quiero** tener Git, Unity Hub, Unity 2022.3 LTS y Visual Studio Community 2022 instalados y configurados correctamente,
**para que** pueda comenzar a desarrollar el juego sin problemas técnicos.

**Criterios de aceptación:**
- `git --version` muestra `git version 2.x.x` en CMD.
- Unity Hub muestra Unity 2022.3 LTS con ícono verde.
- Los módulos Android Build Support, Android SDK & NDK Tools y OpenJDK están instalados.
- Visual Studio se abre correctamente al hacer doble clic en un `.cs` desde Unity.

---

### HU-002 — Repositorio GitHub estructurado
**Como** desarrollador,
**quiero** tener un repositorio GitHub con la estructura de carpetas correcta, `.gitignore` y `README.md`,
**para que** el proyecto esté bien organizado desde el inicio y no se suban archivos innecesarios.

**Criterios de aceptación:**
- El repositorio existe en `https://github.com/AlejoRoldan/tirolibrematem-tico`.
- La rama de trabajo es `develop`.
- El `.gitignore` excluye correctamente `Library/`, `Temp/`, `Build/`, `.vs/` y archivos de OS.
- El `README.md` describe el proyecto, el stack tecnológico y cómo configurar el entorno.

---

### HU-003 — Proyecto Unity base conectado al repo
**Como** desarrollador,
**quiero** crear el proyecto Unity 3D dentro de la carpeta del repositorio clonado,
**para que** todos los archivos del proyecto estén versionados en Git desde el primer día.

**Criterios de aceptación:**
- El proyecto Unity se abre correctamente desde Unity Hub.
- La estructura de carpetas `Assets/_Game/` existe en el proyecto.
- El proyecto corre sin errores en la consola de Unity.
- Se hace un commit inicial: `feat: proyecto Unity base creado`.

---

### HU-004 — GitHub Project y tablero Kanban
**Como** desarrollador,
**quiero** tener un tablero Kanban en GitHub Projects con todas las historias de usuario,
**para que** pueda hacer seguimiento del progreso del desarrollo de forma visual.

**Criterios de aceptación:**
- El tablero tiene columnas: `Backlog`, `En progreso`, `En revisión`, `Completado`.
- Las 33 HUs están creadas como Issues en el repositorio.
- Cada Issue tiene la etiqueta de su épica correspondiente.
- Las HUs del MVP están en el `Backlog` y las de v0.5/v1.0 están marcadas como `Future`.

---

## Épica 2: Fundamentos del juego 3D

### HU-005 — Escena del estadio 3D
**Como** jugador,
**quiero** ver un estadio de fútbol 3D realista como escenario del juego,
**para que** la experiencia visual sea inmersiva y emocionante.

**Criterios de aceptación:**
- La escena `Level_01_Entrenamiento.unity` muestra un estadio 3D.
- La portería está posicionada correctamente en el campo.
- El balón está posicionado a 15 unidades de distancia de la portería.
- La escena corre a más de 30 FPS en el editor de Unity.

---

### HU-006 — Sistema de cámara detrás del jugador
**Como** jugador,
**quiero** ver la portería desde detrás del balón (cámara en tercera persona, estilo FIFA),
**para que** la perspectiva sea similar a la de un tiro libre real.

**Criterios de aceptación:**
- La cámara está posicionada detrás y ligeramente arriba del balón.
- La portería es claramente visible desde la cámara.
- La cámara no atraviesa el suelo ni los objetos del estadio.

---

### HU-007 — Física del balón con efecto de curva
**Como** jugador,
**quiero** que el balón vuele con una trayectoria curva (efecto Bézier) hacia la zona seleccionada,
**para que** el tiro se sienta realista y dinámico.

**Criterios de aceptación:**
- El balón sigue una curva de Bézier cúbica desde su posición hasta la coordenada (x, y) seleccionada.
- A V_max (20 u/s) el balón llega en menos de 1 segundo.
- A V_min (5 u/s) el balón llega en más de 2 segundos.
- El jugador puede deslizar el dedo para aplicar efecto de curva lateral.

---

### HU-008 — Sistema de apuntado con plano cartesiano
**Como** jugador,
**quiero** ver una cuadrícula del plano cartesiano superpuesta en la portería y poder tocar una zona para apuntar,
**para que** pueda seleccionar con precisión dónde quiero que entre el balón.

**Criterios de aceptación:**
- La portería muestra una cuadrícula semitransparente con ejes X e Y visibles.
- Al tocar la pantalla, se muestra la coordenada (x, y) del punto seleccionado.
- El punto seleccionado se resalta visualmente.
- En niveles de 6°, el rango es x[0,10], y[0,5]. En niveles de 7°-8°, x[-5,5], y[0,5].

---

### HU-009 — Replay de gol con cambio de cámara *(v0.5)*
**Como** jugador,
**quiero** ver un replay lateral del gol cuando anoto,
**para que** pueda revivir el momento de celebración desde otro ángulo.

**Criterios de aceptación:**
- Al detectar un gol, la cámara hace un corte a una vista lateral en 2 segundos.
- El replay dura 3 segundos y luego vuelve a la cámara principal.
- El texto "¡GOL!" aparece en pantalla durante el replay.

---

## Épica 3: Motor matemático

### HU-010 — Generador de operaciones por nivel
**Como** jugador,
**quiero** que el juego me muestre una operación matemática diferente en cada turno, ajustada al nivel que estoy jugando,
**para que** el reto matemático sea apropiado para mi grado escolar.

**Criterios de aceptación:**
- `MathEngine.cs` genera operaciones aleatorias según el tipo configurado en `LevelConfigSO`.
- Nivel 2: multiplicaciones con factores del 2 al 5.
- Nivel 3: multiplicaciones con factores del 2 al 9.
- No se repite la misma operación dos veces seguidas.

---

### HU-011 — Sistema de potencia basado en respuesta
**Como** jugador,
**quiero** que mi respuesta matemática determine la potencia del tiro,
**para que** resolver bien la operación tenga una consecuencia directa y emocionante en el juego.

**Criterios de aceptación:**
- `PowerCalculator.cs` retorna V_max = 20 si la respuesta es correcta.
- `PowerCalculator.cs` retorna V_min = 5 si la respuesta es incorrecta o el tiempo se agotó.
- `BallController.cs` usa la velocidad calculada para lanzar el balón.

---

### HU-012 — Temporizador de respuesta
**Como** jugador,
**quiero** ver una barra de tiempo que se agota mientras resuelvo la operación,
**para que** el juego tenga presión de tiempo y sea más emocionante.

**Criterios de aceptación:**
- La barra de tiempo se vacía de verde a rojo en el tiempo configurado por nivel (7s en nivel 2, 5s en nivel 3).
- Al agotarse el tiempo, se dispara automáticamente con V_min.
- El temporizador se detiene cuando el jugador ingresa una respuesta.

---

### HU-013 — Feedback visual de bien/mal
**Como** jugador,
**quiero** recibir una señal visual clara cuando mi respuesta es correcta o incorrecta,
**para que** sepa inmediatamente si lo hice bien o mal.

**Criterios de aceptación:**
- Respuesta correcta: el balón brilla con un efecto de partícula dorada.
- Respuesta incorrecta: el balón se desinfla visualmente.
- El feedback dura 0.5 segundos antes de lanzar el balón.

---

### HU-014 — Plano cartesiano superpuesto en portería
**Como** jugador,
**quiero** ver claramente los ejes X e Y del plano cartesiano sobre la portería,
**para que** pueda aprender a ubicar puntos en el plano mientras juego.

**Criterios de aceptación:**
- `CartesianGrid.cs` renderiza la cuadrícula con los ejes X e Y etiquetados.
- Los números de los ejes son legibles en pantalla de celular.
- La cuadrícula es semitransparente para no ocultar la portería.

---

## Épica 4: IA del portero y la barrera

### HU-015 — Portero con IA y velocidad progresiva
**Como** jugador,
**quiero** que el portero se mueva para intentar atajar el balón, con una velocidad que aumenta en niveles avanzados,
**para que** el juego sea progresivamente más difícil.

**Criterios de aceptación:**
- `GoalkeeperAI.cs` mueve al portero lateralmente sobre la línea de gol.
- Nivel 2: velocidad 2 u/s. Nivel 3: velocidad 3 u/s.
- Si el balón va a V_max y el punto de impacto está a más de 2 unidades del portero → GOL.
- Si el balón va a V_min → el portero siempre llega → ATAJADA.

---

### HU-016 — Barrera de jugadores con hitbox
**Como** jugador,
**quiero** que haya jugadores de la barrera que puedan bloquear mi tiro si no apunto bien,
**para que** tenga que usar el plano cartesiano para esquivarlos.

**Criterios de aceptación:**
- `WallPlayer.cs` posiciona 2 jugadores estáticos entre el balón y la portería.
- Cada jugador tiene un hitbox de 1 unidad de ancho × 2.5 unidades de alto.
- Si la trayectoria del balón intersecta el hitbox → BLOQUEADO.
- El jugador recibe feedback visual de que el tiro fue bloqueado.

---

### HU-017 — Barrera que salta en niveles avanzados *(v0.5)*
**Como** jugador,
**quiero** que la barrera salte en los niveles avanzados para bloquear tiros rasos,
**para que** el reto de usar coordenadas negativas sea más difícil.

**Criterios de aceptación:**
- En niveles 5+, los jugadores de la barrera saltan en el eje Y al momento del disparo.
- La altura del salto es de 1.5 unidades.
- El jugador debe elegir una coordenada Y baja (raso) o alta (por encima) para esquivarlos.

---

### HU-018 — Detección de gol, atajada y bloqueado
**Como** jugador,
**quiero** que el juego detecte correctamente si mi tiro fue gol, atajada o bloqueado,
**para que** el resultado de cada turno sea justo y preciso.

**Criterios de aceptación:**
- `GoalDetector.cs` detecta cuando el balón cruza la línea de gol → emite evento `OnGoal`.
- `GoalkeeperAI.cs` detecta cuando el portero intercepta el balón → emite evento `OnSave`.
- `WallPlayer.cs` detecta cuando el balón golpea el hitbox → emite evento `OnBlocked`.
- `GameManager.cs` escucha estos eventos y actualiza el estado del juego.

---

## Épica 5: Progresión y sistema de niveles

### HU-019 — Sistema de vidas y reintentos
**Como** jugador,
**quiero** tener 3 vidas por sesión y poder reintentar cuando las pierdo todas,
**para que** el juego tenga consecuencias por los errores pero no sea frustrante.

**Criterios de aceptación:**
- El HUD muestra 3 iconos de balón como vidas.
- Se pierde una vida por cada tiro fallado o bloqueado.
- Al perder las 3 vidas, aparece la pantalla de GameOver.
- El botón "Reintentar" reinicia el nivel actual con 3 vidas.

---

### HU-020 — Desbloqueo de niveles por progreso
**Como** jugador,
**quiero** que los niveles se desbloqueen progresivamente al completar el anterior,
**para que** la dificultad aumente de forma gradual y ordenada.

**Criterios de aceptación:**
- El nivel 1 está desbloqueado por defecto.
- Completar el nivel N desbloquea el nivel N+1.
- Los niveles bloqueados aparecen con un candado en la pantalla de selección.
- El progreso se guarda en PlayerPrefs.

---

### HU-021 — Configuración de niveles por ScriptableObject
**Como** desarrollador,
**quiero** configurar cada nivel a través de un ScriptableObject en el editor de Unity,
**para que** pueda ajustar la dificultad sin modificar el código.

**Criterios de aceptación:**
- `LevelConfigSO.cs` tiene campos para: nombre del nivel, tipo de operación, rango de factores, velocidad del portero, número de jugadores en barrera, tiempo de respuesta.
- Cada nivel tiene su propio asset `.asset` en `Assets/_Game/Data/`.
- `LevelManager.cs` carga la configuración del nivel correspondiente al iniciar la escena.

---

### HU-022 — Guardado de progreso en el dispositivo *(v0.5)*
**Como** jugador,
**quiero** que mi progreso (niveles desbloqueados, puntaje máximo) se guarde en mi celular,
**para que** pueda continuar donde lo dejé en la próxima sesión.

**Criterios de aceptación:**
- Al completar un nivel, el progreso se guarda en PlayerPrefs.
- Al abrir el juego nuevamente, los niveles desbloqueados y puntajes máximos se restauran.
- Existe un botón "Borrar progreso" en la pantalla de opciones.

---

## Épica 6: UI/UX, avatar y experiencia visual

### HU-023 — Avatar personalizado con nombre del jugador
**Como** jugador,
**quiero** escribir mi nombre al inicio y verlo en la camiseta de mi personaje,
**para que** el juego se sienta personalizado y especial para mí.

**Criterios de aceptación:**
- En el MainMenu hay un campo de texto para ingresar el nombre del jugador.
- El nombre aparece en la camiseta del personaje durante el juego.
- El nombre se guarda en PlayerPrefs para futuras sesiones.

---

### HU-024 — Selección de equipo favorito
**Como** jugador,
**quiero** elegir entre la camiseta del Barcelona FC o del Atlético Nacional,
**para que** pueda jugar con los colores de mi equipo favorito.

**Criterios de aceptación:**
- En el MainMenu hay dos opciones de camiseta: Barcelona FC y Atlético Nacional.
- Al seleccionar un equipo, la paleta de colores del juego cambia al del equipo.
- La selección se guarda en PlayerPrefs.

---

### HU-025 — Pantallas completas del juego
**Como** jugador,
**quiero** tener pantallas de menú principal, selección de nivel y game over bien diseñadas,
**para que** la experiencia de navegación del juego sea fluida y profesional.

**Criterios de aceptación:**
- `MainMenu.unity`: Logo del juego, botón Jugar, botón Opciones, selección de equipo/avatar.
- `LevelSelect.unity`: Mapa de niveles con candados, puntaje máximo por nivel.
- GameOver: Puntaje final, vidas usadas, botón Reintentar y botón Menú.
- Las transiciones entre pantallas son suaves (fade in/out).

---

### HU-026 — HUD con marcador, vidas y timer
**Como** jugador,
**quiero** ver en pantalla mis vidas, el puntaje y el tiempo restante durante el juego,
**para que** siempre sepa cuál es mi estado en la partida.

**Criterios de aceptación:**
- Esquina superior izquierda: 3 iconos de balón (vidas).
- Esquina superior derecha: Contador de puntos.
- Centro inferior: Panel de operación matemática con barra de tiempo.
- El HUD se actualiza en tiempo real.

---

### HU-027 — Efectos visuales de gol y error *(v0.5)*
**Como** jugador,
**quiero** ver efectos visuales espectaculares cuando anoto un gol o fallo un tiro,
**para que** cada resultado sea emocionalmente impactante.

**Criterios de aceptación:**
- GOL: Sistema de partículas de confeti + texto "¡GOL!" animado.
- ATAJADA: Animación de derrota del jugador + texto "¡Atajada!".
- BLOQUEADO: Efecto de chispa en el jugador de la barrera + texto "¡Bloqueado!".

---

## Épica 7: Audio y efectos de sonido

### HU-028 — Música de fondo por nivel *(v0.5)*
**Como** jugador,
**quiero** escuchar música de fondo que cambie según el nivel que estoy jugando,
**para que** la atmósfera sonora acompañe la progresión del juego.

**Criterios de aceptación:**
- Cada nivel tiene una pista de música diferente.
- La música hace un fade out al cambiar de nivel.
- `AudioManager.cs` gestiona la reproducción de la música.

---

### HU-029 — Efectos de sonido del juego
**Como** jugador,
**quiero** escuchar efectos de sonido para el pateo del balón, el gol y la celebración del público,
**para que** la experiencia auditiva sea inmersiva.

**Criterios de aceptación:**
- Sonido de patada al disparar el balón.
- Sonido de red al anotar un gol.
- Sonido de celebración del público al anotar un gol.
- Sonido de error al fallar la operación matemática.
- `AudioManager.cs` gestiona todos los SFX.

---

### HU-030 — Control de volumen en opciones *(v1.0)*
**Como** jugador,
**quiero** poder ajustar el volumen de la música y los efectos de sonido por separado,
**para que** pueda personalizar la experiencia auditiva a mi gusto.

**Criterios de aceptación:**
- La pantalla de Opciones tiene dos sliders: Música y SFX.
- Los valores se guardan en PlayerPrefs.
- Los cambios se aplican en tiempo real.

---

## Épica 8: Build Android y publicación

### HU-031 — Compilar APK para Android
**Como** desarrollador,
**quiero** compilar el juego como un archivo APK instalable en Android,
**para que** pueda instalarlo directamente en el celular de Martín.

**Criterios de aceptación:**
- El proyecto compila sin errores con el target Android.
- El APK se genera en la carpeta `Builds/`.
- El APK tiene el nombre `TiroLibreMatematico_v0.1.apk`.
- La configuración de Android está correcta: API 26 mínimo, API 33 target, IL2CPP, ARM64.

---

### HU-032 — Instalación y pruebas en dispositivo real
**Como** desarrollador,
**quiero** instalar el APK en un dispositivo Android real y probar que el juego funciona correctamente,
**para que** pueda confirmar que el regalo está listo antes del 31 de julio.

**Criterios de aceptación:**
- El APK se instala correctamente en un dispositivo Android con API 26+.
- Los 3 niveles del MVP son jugables de inicio a fin sin crashes.
- El rendimiento es de al menos 30 FPS en el dispositivo de prueba.
- El juego se muestra correctamente en orientación Landscape.

---

### HU-033 — Optimización de rendimiento móvil *(v0.5)*
**Como** jugador,
**quiero** que el juego corra fluidamente en mi celular sin calentarse ni consumir mucha batería,
**para que** pueda jugar por sesiones largas sin problemas.

**Criterios de aceptación:**
- El juego corre a 60 FPS estables en dispositivos de gama media (Android 10+).
- El tamaño del APK es menor a 100 MB.
- No hay memory leaks detectables en sesiones de 30 minutos.
- Las texturas están comprimidas con ETC2 para Android.
