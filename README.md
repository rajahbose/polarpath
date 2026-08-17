# _polarPath

**_polarPath** is a modern, responsive web application for solar path analysis and site shadow modeling. It features a synchronized split-screen interface with a **2D Polar Sun Chart (Plan View)** on the left and an interactive **3D Shadow Study** on the right, alongside a streamlined **5-Page Mobile Application** for handheld touch devices.

---

## ☀️ Features

### 1. 2D Plan View Polar Sun Chart
- **Equidistant Polar Projection**: Zenith ($90^\circ$) at the center, Horizon ($0^\circ$) at the perimeter edge.
- **$5^\circ$ Graduation Perimeter Ticks**: Minimalist hierarchical lineweights and degree callouts ($N, E, S, W$, azimuth radials, altitude circles).
- **Daylight & Trajectory Curves**: High-accuracy solstice, equinox, and active day solar path arcs.
- **Analemma Hour Curves**: Figure-8 Analemma loops mapped across all daylight hours.
- **Central Reference Footprint**: Center house massing footprint ($25\text{ft} \times 45\text{ft}$).
- **Fixed & Dynamic Telemetry Badges**: Live solar elevation, azimuth, and local time.

### 2. 3D Shadow Study & Celestial Dome Studio
- **Minimalist Celestial Dome Wireframe**: Thin, aesthetic trajectory pipes and sun coordinate markers.
- **Real-Time Shadow Casting**: Three.js soft shadow mapping cast dynamically from the sun onto the site and buildings.
- **Camera View Presets**: Perspective, Top (Plan), Street Eye, South Facing, and North Facing.

### 3. Interactive Massing & 3D Sketching Studio
- **Draw Pen Tool**: Sketch polygonal building footprints directly on the 2D polar chart plan view.
- **Constraint Snapping**: Automatic geometric snapping to orthogonal ($0^\circ, 90^\circ, 180^\circ, 270^\circ$), $45^\circ$, and $30^\circ/60^\circ$ angles.
- **Auto-Close Alignment**: Snaps and aligns the closing node to enforce geometric integrity.
- **2-Inch Ground Lift**: Extrusions float 2" above ground by default for crisp architectural shadow separation.
- **2D Drag-to-Move**: Drag massings on the 2D plane with instant 3D shadow synchronization.
- **Dedicated Mobile Massings Canvas**: Clean full-screen drafting surface with a top-left floating sketch button.

### 4. Interactive World Map Location Modal
- **Interactive SVG World Map**: Panning, zooming, and direct click-to-place pin functionality.
- **Fast City Search**: Instant search dropdown with top world cities and US capitals.
- **Coordinates & Timezone Sync**: Live latitude/longitude badge and automatic timezone detection.

### 5. High-Resolution 300 DPI PNG Exporter
- **Modal Exporter**: Generates crisp, square 300 DPI PNG files ($2400 \times 2400\text{px}$).
- **Customizable Appearance**: Transparent, White, or Dark backgrounds; Black, White, or Custom line colors.
- **Modular Inclusions**: Toggleable Title Badge, Legend, Compass, House Massing, and Dimensions.

### 6. Mobile 5-Tab Architecture (Touch-Optimized)
- **Tab 1: Charts**: Split-screen 2D Polar Chart & 3D Shadow Study with full-width time and day scrubbers.
- **Tab 2: Location**: Searchable world map and location selector.
- **Tab 3: Massings**: Clean blank polar drafting canvas with a top-left floating sketch button.
- **Tab 4: Analysis**: Touch-friendly toggles for transparent buildings, dimensions, month curves, and analemmas.
- **Tab 5: Export**: High-resolution 300 DPI PNG export modal with large touch toggles.
- **iOS Safari & Chrome Compatibility**: Uses `100dvh` and safe-area insets to prevent timeline clipping on iPhone devices.

---

## 🚀 Getting Started

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

## 🛠️ Tech Stack

- **Vanilla HTML5 & CSS3** (Custom flat monochromatic design, Roboto typography, dynamic viewport height)
- **Vanilla JavaScript (ES Modules)**
- **Three.js** (WebGL 3D rendering and soft shadow mapping)
- **Canvas 2D API** (High-precision polar coordinate math and drawing engine)
- **SunCalc** (Astronomical position algorithms)
