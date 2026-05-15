# Tiro Libre Matemático 🎮⚽

Videojuego educativo 3D para Android donde el jugador resuelve operaciones matemáticas para definir la potencia y dirección de tiros libres de fútbol. Diseñado para enseñar matemáticas de grados 6°, 7° y 8° de bachillerato en Colombia de forma divertida.

**Regalo de cumpleaños para Martín Roldán — 31 de julio de 2026.**

---

## Descripción

El jugador ve la portería desde detrás del balón (cámara en tercera persona, estilo FIFA). Para cobrar el tiro libre, debe:

1. Seleccionar una zona de la portería usando el plano cartesiano superpuesto.
2. Resolver una operación matemática dentro del tiempo límite.
3. Si la respuesta es correcta → el balón vuela rápido y fuerte (V_max = 20 u/s).
4. Si la respuesta es incorrecta o se agota el tiempo → el balón va lento (V_min = 5 u/s) y el portero lo ataja.

---

## Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| Motor de juego | Unity 2022.3 LTS |
| Lenguaje | C# |
| Plataforma objetivo | Android (APK) |
| Control de versiones | Git + GitHub |
| IDE | Visual Studio Community 2022 |

---

## Estructura del Proyecto

```
TiroLibreMatematico/
├── Assets/
│   └── _Game/
│       ├── Scripts/
│       │   ├── Core/        → GameManager, LevelManager, AudioManager, EventBus
│       │   ├── Math/        → MathEngine, MathValidator, PowerCalculator
│       │   ├── Gameplay/    → BallController, GoalkeeperAI, WallPlayer, GoalDetector, CartesianGrid
│       │   ├── UI/          → HUDController, MathPanelUI, FeedbackUI, MainMenuUI
│       │   └── Data/        → LevelConfigSO.cs
│       ├── Scenes/          → MainMenu, LevelSelect, Level_01 a Level_04
│       ├── Prefabs/         → UI y Gameplay
│       ├── Models/          → Characters, Stadium, Ball
│       ├── Materials/
│       ├── Animations/      → Player, Goalkeeper
│       └── Audio/           → Music, SFX
├── Docs/
│   ├── GDD/                 → Game Design Document
│   ├── Architecture/        → Diagramas de arquitectura
│   └── UserStories/         → Historias de usuario
├── .gitignore
└── README.md
```

---

## Niveles (MVP v0.1)

| Nivel | Nombre | Operación | Obstáculos | Tiempo |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Entrenamiento | Ninguna | Ninguno | Infinito |
| 2 | El Portero | Multiplicación ×2 al ×5 | Portero lento | 7s |
| 3 | La Barrera | Multiplicación ×2 al ×9 | Portero + barrera | 5s |

---

## Configuración del Entorno de Desarrollo

### Prerrequisitos

- [Git](https://git-scm.com/download/win) 2.x o superior
- [Unity Hub](https://unity.com/download) con Unity **2022.3 LTS** instalado
  - Módulos requeridos: Android Build Support, Android SDK & NDK Tools, OpenJDK
- [Visual Studio Community 2022](https://visualstudio.microsoft.com/vs/community/) con el módulo "Desarrollo de juegos con Unity"

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/AlejoRoldan/tirolibrematem-tico.git
cd tirolibrematem-tico

# 2. Cambiar a la rama de desarrollo
git checkout develop

# 3. Abrir el proyecto en Unity Hub
#    Unity Hub → Projects → Add → Open → seleccionar esta carpeta
```

---

## Flujo de Trabajo con Git

La rama principal de desarrollo es `develop`. **Nunca se trabaja directamente en `main`.**

```bash
# Crear una rama para una nueva historia de usuario
git checkout -b feature/HU-005-escena-estadio

# Hacer commit de cambios
git add .
git commit -m "feat(HU-005): escena base del estadio 3D creada"

# Subir la rama
git push origin feature/HU-005-escena-estadio
```

Los merges a `main` se realizan únicamente cuando una fase completa está probada y funcionando en el dispositivo Android.

---

## Roadmap

| Fase | Fechas | Objetivo |
| :--- | :--- | :--- |
| Fase 0 | May 13 – May 25 | Setup y configuración |
| Fase 1 | May 26 – Jun 8 | Prototipo 3D jugable |
| Fase 2 | Jun 9 – Jun 22 | Motor matemático |
| Fase 3 | Jun 23 – Jul 6 | IA del portero y barrera |
| Fase 4 | Jul 7 – Jul 20 | UI, Avatar y Audio |
| Fase 5 | Jul 21 – Jul 27 | Build Android y testing |
| **Regalo** | **Jul 31** | **Entrega a Martín** |

---

## Equipo

Desarrollado por **Alejo Roldán** — [iatechdev](https://iatechdev.com)

---

*Hecho con ❤️ para Martín, fanático del Barcelona FC y Atlético Nacional.*
