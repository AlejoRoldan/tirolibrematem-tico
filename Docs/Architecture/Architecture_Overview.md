# Arquitectura del Sistema
## Tiro Libre Matemático

**Versión:** 1.0
**Fecha:** Mayo 2026

---

## Visión General

El juego se divide en tres capas, análogas a las de una aplicación web moderna:

> **Presentation Layer** = Frontend (lo que el jugador ve)
> **Game Logic Layer** = Backend (las reglas del juego)
> **Data Layer** = Base de datos (la configuración de cada nivel)

---

## Capas de la Arquitectura

### 1. Presentation Layer (Frontend)

Contiene todo lo que el jugador ve e interactúa directamente.

| Componente | Descripción | Analogía Web |
| :--- | :--- | :--- |
| Escenas de Unity | Las "páginas" del juego (MainMenu, LevelSelect, Gameplay, GameOver) | Rutas de una SPA |
| Scripts de UI | Menús, HUD, paneles de matemáticas, feedback visual | Componentes React |
| Modelos 3D | Personajes, estadio, balón | Assets de frontend |
| Animaciones | Ciclos de animación del jugador y portero | CSS Animations |
| Audio | Música y efectos de sonido | Web Audio API |

### 2. Game Logic Layer (Backend)

Contiene toda la lógica del juego. Cada script tiene una responsabilidad única (principio de responsabilidad única — SRP).

| Script | Responsabilidad | Analogía Web |
| :--- | :--- | :--- |
| `GameManager.cs` | Orquesta todo el juego. Singleton. | Router principal de la app |
| `LevelManager.cs` | Gestiona la carga y transición entre niveles | Route handler / Controller |
| `AudioManager.cs` | Controla toda la música y efectos de sonido | Servicio de audio centralizado |
| `EventBus.cs` | Sistema de eventos internos desacoplados | EventEmitter de Node.js |
| `MathEngine.cs` | Genera los problemas matemáticos según el nivel | Servicio de generación de datos |
| `MathValidator.cs` | Valida las respuestas del jugador | Middleware de validación |
| `PowerCalculator.cs` | Convierte la respuesta matemática en potencia del tiro | Función de transformación de datos |
| `BallController.cs` | Física y trayectoria del balón con efecto de curva | Motor de física / simulación |
| `GoalkeeperAI.cs` | Inteligencia artificial del portero | Agente de decisión |
| `WallPlayer.cs` | Comportamiento de los jugadores de la barrera | Agente estático con hitbox |
| `GoalDetector.cs` | Detecta si el balón entró a la portería | Trigger / Sensor de colisión |
| `CartesianGrid.cs` | Lógica del plano cartesiano sobre la portería | Sistema de coordenadas |

### 3. Data Layer (Base de datos)

Almacena y persiste la configuración y el progreso del juego.

| Componente | Descripción | Analogía Web |
| :--- | :--- | :--- |
| `LevelConfigSO.cs` | ScriptableObject con la configuración de cada nivel (operaciones, velocidades, obstáculos) | Archivo JSON / tabla de base de datos |
| `PlayerPrefs` | Guarda el progreso del jugador en el dispositivo (niveles desbloqueados, puntaje máximo) | `localStorage` del navegador |

---

## Diagrama de Flujo de un Turno

```
[Jugador toca pantalla]
        │
        ▼
[CartesianGrid] → Calcula coordenadas (x, y) del toque
        │
        ▼
[MathEngine] → Genera operación matemática para el nivel actual
        │
        ▼
[MathPanelUI] → Muestra la operación + barra de tiempo al jugador
        │
        ▼
[Jugador ingresa respuesta]
        │
        ├─ Correcta ──→ [PowerCalculator] → V_max = 20 u/s
        └─ Incorrecta/Timeout → [PowerCalculator] → V_min = 5 u/s
                │
                ▼
        [BallController] → Lanza el balón con la velocidad calculada
                │
                ▼
        [GoalkeeperAI] → Calcula si puede llegar al punto de impacto
                │
                ├─ GOL ──────→ [GoalDetector] → EventBus.Emit("OnGoal")
                ├─ ATAJADA ──→ EventBus.Emit("OnSave")
                └─ BLOQUEADO → [WallPlayer] → EventBus.Emit("OnBlocked")
                                    │
                                    ▼
                            [GameManager] → Actualiza vidas, puntos y estado del juego
```

---

## Ciclo de Vida de los Scripts (Analogía con desarrollo web)

| Método Unity | Equivalente Web | Cuándo se ejecuta |
| :--- | :--- | :--- |
| `Awake()` | Constructor de clase | Al instanciar el objeto (antes de Start) |
| `Start()` | `componentDidMount()` de React | Al inicio, una sola vez |
| `Update()` | `requestAnimationFrame()` | 60 veces por segundo |
| `OnDestroy()` | `componentWillUnmount()` | Al destruir el objeto |
| `OnTriggerEnter()` | Event listener de colisión | Al detectar superposición con otro collider |
| Coroutine | `async/await` | Permite pausar y reanudar ejecución |

---

## Patrones de Diseño Utilizados

| Patrón | Dónde se aplica | Por qué |
| :--- | :--- | :--- |
| **Singleton** | `GameManager`, `AudioManager` | Una sola instancia global accesible desde cualquier script |
| **Observer / EventBus** | `EventBus.cs` | Desacopla los sistemas (el balón no necesita conocer al HUD) |
| **ScriptableObject (Data Container)** | `LevelConfigSO` | Separa los datos de la lógica, fácil de editar sin tocar código |
| **Strategy** | `MathEngine` (selección de operación por nivel) | Permite cambiar el tipo de operación sin modificar el motor |

---

## Estructura de Escenas

| Escena | Descripción |
| :--- | :--- |
| `MainMenu.unity` | Pantalla de inicio, selección de equipo y avatar |
| `LevelSelect.unity` | Mapa de niveles con candados |
| `Level_01_Entrenamiento.unity` | Nivel 1: solo apuntar, sin matemáticas |
| `Level_02_Portero.unity` | Nivel 2: multiplicaciones básicas + portero |
| `Level_03_Barrera.unity` | Nivel 3: multiplicaciones + portero + barrera |
| `Level_04_PartidoFinal.unity` | Nivel 4 (v0.5): fracciones |
