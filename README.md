# _polarPath

**_polarPath** is a high-precision, responsive web application for solar path analysis, architectural massing design, and site shadow modeling. It delivers a synchronized split-screen studio combining a **2D Polar Sun Chart (Plan View)** with a real-time **3D Shadow Study**, alongside a dedicated touch-optimized **Mobile Application**.

---

## ☀️ Key Features

### 1. 2D Plan View Polar Sun Chart
- **Equidistant Polar Projection**: Zenith ($90^\circ$) at the center, Horizon ($0^\circ$) at the perimeter.
- **Direct Sun Drag Gesture**: Tap and drag the sun dot directly on the 2D chart:
  - **Horizontal Drag (Left/Right)**: Continuously scrubs the **Time of Day**.
  - **Vertical Drag (Up/Down)**: Continuously scrubs the **Day of Year** (dragging upward moves toward summer).
- **Hierarchical Draw Order**: Concentric elevation rings and radial azimuth rays render behind the center building footprint, while active solar paths, rays, and current sun positions render cleanly on top.
- **Degree Markers**: Elevation degree markers ($10^\circ, 20^\circ, \dots, 80^\circ$) displayed along both North and South radial segments.
- **Season & Analemma Paths**: Solstice and equinox arcs with centered pill-badge callouts, and isolated figure-8 analemma loops.
- **Mobile Label Density**: Automatically suppresses busy hour labels on small mobile screens to preserve chart clarity.

### 2. 3D Shadow Study & Celestial Dome Studio
- **Minimalist Celestial Dome**: Crisp trajectory arcs, sun position spheres, and direction rays.
- **Dynamic Soft Shadow Mapping**: Real-time directional sun shadows cast from customizable massings onto the site.
- **Camera View Presets**: Perspective, Top (Plan), Street Eye, South Facing, and North Facing.
- **Synchronized Building Footprint**: Dynamic central reference building with real-time color updating.

### 3. Interactive Massing & 2D/3D Sketching Studio
- **Polygon Draw Pen Tool**: Draw custom building footprints directly on the 2D chart.
- **Constraint Snapping**: Automatic angular snapping to orthogonal ($0^\circ, 90^\circ, 180^\circ, 270^\circ$), $45^\circ$, and $30^\circ/60^\circ$ increments.
- **Smart Auto-Close**: Aligns and closes polygons to enforce geometric accuracy.
- **2-Inch Ground Lift**: Extruded massings sit 2" above ground by default for crisp architectural shadow line separation.
- **2D Drag-to-Move**: Drag massings on the plan view with real-time 3D shadow updates.
- **Dedicated Mobile Massings Tab**: Auto-centering drafting canvas with a top-left floating sketch pen and left-justified massing list buttons.

### 4. Floating Settings Modal (Desktop & Mobile)
- **Building Footprint Color**: Interactive HTML5 color wheel picker and 7 curated architectural palette swatches.
- **Labels & Annotations**: Toggle hour labels, solstice/equinox badges, and dimension callouts on or off.
- **Measurement Units**: Seamless switching between **Metric** ($\text{m}, \text{m}^2$) and **Customary** ($\text{ft}$, $\text{in}$, $\text{sq ft}$).
- **Solar Geometry Options**: Toggle month curves, analemmas, transparent building massings, and viewport zoom scale.

### 5. Interactive World Map Location Modal
- **Flat Projected Equirectangular Map**: Pan, zoom, and click anywhere on Earth to set coordinates.
- **City Database Search**: Filterable database of 350+ global cities and US state capitals.
- **Astronomical Precision**: Solar declination, equation of time, sunrise/sunset, shadow multipliers, and day length calculated via Meeus/Spencer algorithms.

### 6. High-Resolution 300 DPI PNG Exporter
- **Production-Ready Output**: Exports square 300 DPI PNG images ($3000 \times 3000\text{px}$).
- **Customization**: Transparent, White, or Dark backgrounds with selectable line color modes.
- **Modular Overlays**: Toggle title cards, legends, massings, dimensions, and solar curves before export.

### 7. Mobile 4-Tab Architecture (Touch-Optimized)
- **Tab 1: Charts**: Split-screen 2D Polar Chart & 3D Shadow Study with full-width scrubbers and top-right solar angle telemetry (`+XX.X° el • XXX.X° az`).
- **Tab 2: Location**: Searchable world map and location selector.
- **Tab 3: Massings**: Dedicated drafting canvas with auto-fit layout and floating pen control.
- **Tab 4: Settings**: Complete touch-friendly settings panel.
- **iOS Safari & Chrome Compatibility**: Uses `100dvh` and safe-area insets to prevent UI clipping.

---

## 🚀 Getting Started

### Local Development

No build step or bundler is required. Simply run any local static file server:

```bash
# Using Python 3
python -m http.server 8080

# Or using Node / npx
npx serve . -l 8080
```

Open your browser to `http://localhost:8080`.

---

## 🛠️ Architecture & Tech Stack

- **Zero-Latency Local Modules**: Three.js and OrbitControls are vendored locally in `/lib/` for instant offline and 0ms CDN startup.
- **Vanilla HTML5 & CSS3**: Custom monochromatic dark design system with modern glassmorphism blur and typography.
- **Vanilla JavaScript (ES Modules)**: Modular architecture without framework overhead (`app.js`, `polarChart2D.js`, `solarDome3D.js`, `settingsModal.js`, `locationModal.js`, `exportModal.js`, `solarCalc.js`).
- **Canvas 2D API & WebGL**: High-precision trigonometric polar projection and GPU-accelerated 3D shadow mapping.
