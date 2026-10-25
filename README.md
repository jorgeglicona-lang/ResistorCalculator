# ⚡ Calculadora de Resistencias Comerciales (Serie / Paralelo / Mixto)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

Aplicación web interactiva de **ingeniería inversa** para síntesis de circuitos resistivos. A partir de cualquier valor de resistencia objetivo, el algoritmo explora y determina la combinación comercial óptima utilizando **1, 2 o 3 componentes** en configuraciones serie, paralelo y mixtas, respetando las series internacionales **E12 (10%)** y **E96 (1%)** de la norma EIA.

---

## 🚀 Características Principales

- **Algoritmo Exhaustivo de Optimización:**
  - Evalúa topologías con 1 componente (valor comercial más próximo).
  - Combinaciones de 2 componentes: Serie ($R_1 + R_2$) y Paralelo ($R_1 \parallel R_2$).
  - Combinaciones de 3 componentes: Serie pura, Paralelo puro, Mixto Serie-Paralelo ($$R_a + (R_b \parallel R_c)$$) y Mixto Paralelo-Serie ($$R_a \parallel (R_b + R_c)$$).
- **Catálogos Comerciales Estándar:**
  - **E12 (Tolerancia 10%):** 12 valores nominales por década (carbón/propósito general).
  - **E96 (Tolerancia 1%):** 96 valores nominales por década (película metálica/precisión).
- **Esquemático Vectorial Dinámico:** Genera en tiempo real el diagrama esquemático con los bloques y conexiones exactas del arreglo ganador.
- **Análisis de Potencia & Seguridad Térmica:** Entrada opcional de voltaje ($V$) para computar disipación en vatios ($W$), alertar sobre calentamiento y recomendar potencia de encapsulado ($1/4\text{ W}$, $1/2\text{ W}$, $1\text{ W}$ o cerámica).
- **Decodificador Interactivo de Código de Colores:** Modal interactivo al hacer clic sobre cualquier tarjeta de solución que grafica físicamente los resistores y sus bandas normalizadas con tooltips descriptivos.
- **Reporte Automático de Laboratorio:** Botón para copiar directamente un resumen formateado de la síntesis al portapapeles.
- **Interfaz Responsiva:** Soporte nativo para modo claro y modo oscuro, animación de precarga temática (*resistor loader*) y panel colapsable en acordeón con alternativas de repuesto.

---

## 🛠️ Tecnologías Utilizadas

- **HTML5 Semántico:** Estructura accesible y modular.
- **CSS3 Moderno:** Variables CSS (`custom properties`), diseño en CSS Grid / Flexbox, transiciones y animaciones (`@keyframes`).
- **JavaScript (ES6+):** Algoritmo combinatorio optimizado en cliente, manipulación del DOM, decodificación por bandas y cálculo eléctrico.

---

## 📂 Estructura del Repositorio

El proyecto puede desplegarse usando la versión modular o la versión monolítica (ideal para ejecución local en móviles):

```text
├── index.html       # Estructura principal de la aplicación
├── style.css        # Estilos visuales, variables de tema y animaciones
├── calculo.js       # Motor matemático, lógica combinatoria y eventos DOM
└── README.md        # Documentación técnica del proyecto
```

---

## ⚡ Instalación y Uso Local

No requiere dependencias, servidores locales ni empaquetadores como Node.js o Webpack.

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/jorgeglicona-lang/ResistorCalculator.git
   ```
2. **Entrar al directorio:**
   ```bash
   cd ResistorCalculator
   ```
3. **Ejecutar:**
   Abre `index.html` con cualquier navegador web moderno (Google Chrome, Firefox, Microsoft Edge, Safari).

---

## 📊 Ejemplo de Ejecución

- **Entrada:**
  - Resistencia deseada: `1550 Ω`
  - Tolerancia: `10% (Serie E12)`
  - Voltaje: `12 V`
- **Salida:**
  - **1 Resistor:** $1.50\text{ k}\Omega$ (Error: $3.22\%$)
  - **2 Resistores:** $47\ \Omega + 1.50\text{ k}\Omega$ en Serie (Error: $0.19\%$)
  - **3 Resistores (Óptima):** $1.50\text{ k}\Omega + (100\ \Omega \parallel 100\ \Omega)$ (Error: **$0.000\%$ - Exacto**)
  - **Potencia disipada:** $\approx 0.093\text{ W}$ $\rightarrow$ Recomendación: *Resistencias de $1/4\text{ W}$ estándar*.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para más información.
