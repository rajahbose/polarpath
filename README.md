# _polarPath

**_polarPath** is a modern, responsive web application for solar path analysis and site shadow modeling. It features a synchronized split-screen interface with a **2D Polar Sun Chart (Plan View)** on the left and an interactive **3D Shadow Study** on the right.

![_polarPath Studio](screenshot.png) *(or live at your hosted domain)*

---

## Features

- **2D Plan View Polar Sun Chart**:
  - Equidistant polar projection (Zenith $90^\circ$ at center, Horizon $0^\circ$ at edge).
  - $5^\circ$ graduation perimeter ticks with subtle hierarchical lineweights and degree callouts.
  - Clean daylight curves for key solstices, equinoxes, and daily sun trajectories.
  - Isolated figure-8 Analemma hour loops across all daylight hours.
  - Central gable house reference anchor ($30\text{ft} \times 60\text{ft}$, $16\text{ft}$ max height).
- **3D Shadow Study & Celestial Dome Studio**:
  - Thin, minimalist solar trajectory pipes and celestial dome wireframe.
  - Real-time Three.js lighting and soft shadow casting from the sun onto the site and house.
  - Camera presets: Perspective, Top (Plan), Street Eye, South Facing, North Facing.
- **Interactive Massing & Shadow Obstruction Studio**:
  - **Draw Pen Tool**: Sketch custom polygonal building massings directly onto the plan view.
  - **Angle Snapping**: Automatic constraint snapping to orthogonal ($0^\circ, 90^\circ, 180^\circ, 270^\circ$), $45^\circ$, and $30^\circ/60^\circ$ angles.
  - **Auto-Close Alignment**: Snaps and aligns the closing node to strictly maintain angle rules.
  - **2-Inch Ground Lift**: Extrusions float 2" above ground by default for crisp architectural shadow gaps.
  - **2D Drag-to-Move**: Click and drag selected massings on the 2D plane with real-time 3D shadow and dimension synchronization.
  - **Massings Manager**: Interactive list with height adjustment and per-item delete buttons.
- **Display & Analysis Tools**:
  - **Synchronous Viewport Zoom / Scale**: Dynamic slider adjusting both 2D and 3D scenes simultaneously (from $0.4\times$ where the house occupies $\le 5\%$ to $2.6\times$ filling $\sim 50\%$ of the screen).
  - **Transparent Buildings**: 50% blue translucent mode for clear sightlines of underlying polar grid geometry.
  - **To-Scale Dimension Strings**: Real-time distance measurement from massing leading edges to the central house.
  - **Floor Area Calculation**: Automatic polygon area calculation in $\text{m}^2$ or $\text{sq ft}$.
- **Dual Timeline Scrubber**:
  - **Time of Day Slider**: Rapid 24-hour scrubbing with live daylight/night telemetry.
  - **Day of Year Slider**: 365-day scrubbing with a precision 12-month grid (`Jan`–`Dec`).
- **Unit System Toggle**:
  - Seamless toggle between **Metric ($m, m^2$)** and **Customary ($ft, sq\ ft$)**.
- **Global Astronomical Accuracy**:
  - NOAA standard solar position algorithms supporting both Northern and Southern Hemispheres.
  - Default preset for Santa Fe, New Mexico ($35.7^\circ\text{ N}, -105.9^\circ\text{ W}$) with global city presets (London, Paris, Tokyo, Sydney, Reykjavik, Singapore, etc.) and custom coordinate inputs.

---

## Getting Started

### Local Development

No build step required! Simply run a local HTTP server:

```bash
# Using Node / npx
npx serve . -l 8080

# Or using Python 3
python -m http.server 8080
```

Open your browser to `http://localhost:8080`.

---

## Tech Stack

- **Vanilla HTML5 & CSS3** (Custom flat monochromatic design with Roboto typography)
- **Vanilla JavaScript (ES Modules)**
- **Three.js** (WebGL 3D rendering and soft shadow mapping)
- **Canvas 2D API** (High-precision polar coordinate math and drawing engine)
