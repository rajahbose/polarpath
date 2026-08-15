/**
 * exportModal.js
 * High-Resolution (300 DPI Square) 2D Polar Sun Chart PNG Exporter Modal
 */

import { SolarCalc } from './solarCalc.js';

export class ExportModal {
    constructor(getAppState, getPolarChart) {
        this.getAppState = getAppState;
        this.getPolarChart = getPolarChart;
        this.isOpen = false;

        this.options = {
            background: 'transparent', // 'transparent' | 'dark' | 'white' | 'custom'
            bgColor: '#0d0f12',
            lineColorMode: 'white',   // 'white' | 'black' | 'custom'
            customLineColor: '#38bdf8', // Default cyan/blue for custom
            includeSunPath: true,
            includeSolstices: true,
            includeAnalemmas: true,
            includeMassings: true,
            includeWatermark: true,
            exportResolution: 3000     // 3000 x 3000 px @ 300 DPI (10 in x 10 in)
        };

        this.initDom();
        this.setupEventListeners();
    }

    initDom() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'export-modal-overlay';
        this.overlay.style.display = 'none';

        this.overlay.innerHTML = `
            <div class="export-modal-card" role="dialog" aria-modal="true" aria-labelledby="exportModalTitle">
                <!-- Header -->
                <div class="export-modal-header">
                    <div class="export-header-title-group">
                        <div class="export-header-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                        </div>
                        <div>
                            <h2 id="exportModalTitle" class="export-modal-title">Export 2D Polar Chart</h2>
                            <div class="export-modal-subtitle">High-Resolution 300 DPI Square Master PNG</div>
                        </div>
                    </div>
                    <button class="export-modal-close" id="btnExportClose" title="Close (Esc)">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <!-- Body: Left Preview, Right Settings -->
                <div class="export-modal-body">
                    <!-- Live Square Preview -->
                    <div class="export-preview-column">
                        <div class="export-preview-box" id="exportPreviewBox">
                            <canvas id="exportPreviewCanvas" width="420" height="420"></canvas>
                        </div>
                        <span class="export-spec-tag">3000 × 3000 px • 300 DPI Square</span>
                    </div>

                    <!-- Export Configuration Controls -->
                    <div class="export-settings-column">
                        <!-- Setting 1: Background -->
                        <div class="export-form-group">
                            <label class="export-group-label">Background</label>
                            <div class="export-chip-group">
                                <button class="export-chip active" data-bg="transparent">
                                    <span class="check-dot"></span> Clear / Transparent
                                </button>
                                <button class="export-chip" data-bg="dark">
                                    <span class="color-swatch-chip" style="background:#0d0f12; border:1px solid #374151;"></span> Dark (#0D0F12)
                                </button>
                                <button class="export-chip" data-bg="white">
                                    <span class="color-swatch-chip" style="background:#ffffff;"></span> White (#FFFFFF)
                                </button>
                            </div>
                        </div>

                        <!-- Setting 2: Chart Lines Color -->
                        <div class="export-form-group">
                            <label class="export-group-label">Chart Lines Color</label>
                            <div class="export-chip-group line-color-group">
                                <button class="export-chip active" data-line="white">
                                    <span class="color-swatch-chip" style="background:#ffffff;"></span> White
                                </button>
                                <button class="export-chip" data-line="black">
                                    <span class="color-swatch-chip" style="background:#000000; border:1px solid #6b7280;"></span> Black
                                </button>
                                <button class="export-chip custom-color-chip" data-line="custom">
                                    <span class="custom-color-circle" id="customColorPreview" style="background:#38bdf8;"></span>
                                    <span>Custom</span>
                                    <input type="color" id="exportCustomColorInput" value="#38bdf8" class="export-color-picker-input">
                                </button>
                            </div>
                        </div>

                        <!-- Setting 3: Inclusions -->
                        <div class="export-form-group">
                            <label class="export-group-label">Inclusions</label>
                            <div class="export-checks-grid">
                                <label class="export-check-item">
                                    <input type="checkbox" id="chkExpSunPath" checked>
                                    <span class="export-chk-custom"></span>
                                    <span>Active Sun & Sun Path</span>
                                </label>
                                <label class="export-check-item">
                                    <input type="checkbox" id="chkExpSolstices" checked>
                                    <span class="export-chk-custom"></span>
                                    <span>Solstices & Equinoxes</span>
                                </label>
                                <label class="export-check-item">
                                    <input type="checkbox" id="chkExpAnalemmas" checked>
                                    <span class="export-chk-custom"></span>
                                    <span>Analemma Curves</span>
                                </label>
                                <label class="export-check-item">
                                    <input type="checkbox" id="chkExpMassings" checked>
                                    <span class="export-chk-custom"></span>
                                    <span>Drawn Massings</span>
                                </label>
                                <label class="export-check-item">
                                    <input type="checkbox" id="chkExpWatermark" checked>
                                    <span class="export-chk-custom"></span>
                                    <span>Location & Date Badge</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Actions -->
                <div class="export-modal-footer">
                    <div class="export-footer-info">
                        <span>Format: PNG-24 with alpha channel (Lossless)</span>
                    </div>
                    <div class="export-footer-buttons">
                        <button class="export-btn secondary" id="btnExportCancel">Cancel</button>
                        <button class="export-btn primary" id="btnExportDownload">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            <span>Download High-Res PNG</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // References
        this.previewCanvas = this.overlay.querySelector('#exportPreviewCanvas');
        this.previewBox = this.overlay.querySelector('#exportPreviewBox');
        this.bgChips = this.overlay.querySelectorAll('[data-bg]');
        this.lineChips = this.overlay.querySelectorAll('[data-line]');
        this.customColorInput = this.overlay.querySelector('#exportCustomColorInput');
        this.customColorPreview = this.overlay.querySelector('#customColorPreview');

        this.chkExpSunPath = this.overlay.querySelector('#chkExpSunPath');
        this.chkExpSolstices = this.overlay.querySelector('#chkExpSolstices');
        this.chkExpAnalemmas = this.overlay.querySelector('#chkExpAnalemmas');
        this.chkExpMassings = this.overlay.querySelector('#chkExpMassings');
        this.chkExpWatermark = this.overlay.querySelector('#chkExpWatermark');

        this.btnClose = this.overlay.querySelector('#btnExportClose');
        this.btnCancel = this.overlay.querySelector('#btnExportCancel');
        this.btnDownload = this.overlay.querySelector('#btnExportDownload');
    }

    setupEventListeners() {
        this.btnClose.addEventListener('click', () => this.close());
        this.btnCancel.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        window.addEventListener('keydown', (e) => {
            if (this.isOpen && e.key === 'Escape') this.close();
        });

        // Background selection
        this.bgChips.forEach(chip => {
            chip.addEventListener('click', () => {
                this.bgChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.options.background = chip.dataset.bg;
                
                // Auto-adjust default line color if contrast requires
                if (this.options.background === 'white' && this.options.lineColorMode === 'white') {
                    this.setLineColorMode('black');
                } else if (this.options.background === 'dark' && this.options.lineColorMode === 'black') {
                    this.setLineColorMode('white');
                }

                this.updatePreviewBoxBg();
                this.renderPreview();
            });
        });

        // Line color selection
        this.lineChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                if (chip.classList.contains('custom-color-chip') && e.target === this.customColorInput) {
                    return; // Color picker will handle input
                }
                const mode = chip.dataset.line;
                this.setLineColorMode(mode);
                this.renderPreview();
            });
        });

        // Custom color input picker
        this.customColorInput.addEventListener('input', (e) => {
            this.options.customLineColor = e.target.value;
            this.customColorPreview.style.background = e.target.value;
            this.setLineColorMode('custom');
            this.renderPreview();
        });

        // Inclusions checkboxes
        [this.chkExpSunPath, this.chkExpSolstices, this.chkExpAnalemmas, this.chkExpMassings, this.chkExpWatermark].forEach(chk => {
            chk.addEventListener('change', () => {
                this.options.includeSunPath = this.chkExpSunPath.checked;
                this.options.includeSolstices = this.chkExpSolstices.checked;
                this.options.includeAnalemmas = this.chkExpAnalemmas.checked;
                this.options.includeMassings = this.chkExpMassings.checked;
                this.options.includeWatermark = this.chkExpWatermark.checked;
                this.renderPreview();
            });
        });

        // Download trigger
        this.btnDownload.addEventListener('click', () => {
            this.triggerHighResDownload();
        });
    }

    setLineColorMode(mode) {
        this.options.lineColorMode = mode;
        this.lineChips.forEach(c => {
            c.classList.toggle('active', c.dataset.line === mode);
        });
    }

    updatePreviewBoxBg() {
        if (this.options.background === 'transparent') {
            this.previewBox.className = 'export-preview-box checkerboard-bg';
        } else if (this.options.background === 'white') {
            this.previewBox.className = 'export-preview-box white-bg';
        } else {
            this.previewBox.className = 'export-preview-box dark-bg';
        }
    }

    open() {
        this.isOpen = true;
        this.overlay.style.display = 'flex';
        this.updatePreviewBoxBg();
        requestAnimationFrame(() => {
            this.renderPreview();
        });
    }

    close() {
        this.isOpen = false;
        this.overlay.style.display = 'none';
    }

    getEffectiveLineColor() {
        if (this.options.lineColorMode === 'black') return '#000000';
        if (this.options.lineColorMode === 'custom') return this.options.customLineColor;
        return '#ffffff';
    }

    /**
     * Renders the complete 2D Polar Chart on any square Canvas at given size
     */
    renderPolarChartToCanvas(canvas, size) {
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, size, size);

        // Background fill
        if (this.options.background === 'dark') {
            ctx.fillStyle = '#0d0f12';
            ctx.fillRect(0, 0, size, size);
        } else if (this.options.background === 'white') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
        }

        const state = this.getAppState();
        const polarChart = this.getPolarChart();
        const baseColor = this.getEffectiveLineColor();
        const isDark = (this.options.background === 'dark' || (this.options.background === 'transparent' && baseColor === '#ffffff'));

        // Center and Radius calculations
        const padding = size * 0.08;
        const centerX = size / 2;
        const centerY = size / 2;
        const maxRadius = (size / 2) - padding;
        const pixelsPerMeter = (maxRadius / 50.0) * state.zoomScale;

        const polarToXY = (elevation, azimuth) => {
            const r = maxRadius * (1 - elevation / 90.0);
            const rad = (azimuth - 90) * (Math.PI / 180);
            return {
                x: centerX + r * Math.cos(rad),
                y: centerY + r * Math.sin(rad)
            };
        };

        const canvasTo3DWorld = (px, py) => {
            return {
                x: (px - centerX) / pixelsPerMeter,
                z: (py - centerY) / pixelsPerMeter
            };
        };

        const world3DToXY = (x3D, z3D) => {
            return {
                x: centerX + x3D * pixelsPerMeter,
                y: centerY + z3D * pixelsPerMeter
            };
        };

        // 1. Concentric Altitude Rings (10° to 80° and Horizon 0°)
        ctx.lineWidth = Math.max(1, size / 1500);
        for (let el = 10; el <= 80; el += 10) {
            const r = maxRadius * (1 - el / 90.0);
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.strokeStyle = this.hexToRgba(baseColor, el % 30 === 0 ? 0.35 : 0.18);
            ctx.stroke();

            // Elevation label (North spoke)
            ctx.fillStyle = this.hexToRgba(baseColor, 0.6);
            ctx.font = `${Math.round(size * 0.016)}px "Roboto Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`${el}°`, centerX, centerY - r - 2);
        }

        // Horizon Ring (0° Elevation)
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
        ctx.strokeStyle = this.hexToRgba(baseColor, 0.85);
        ctx.lineWidth = Math.max(1.5, size / 1000);
        ctx.stroke();

        // 2. Azimuth Radial Spokes every 15°
        for (let az = 0; az < 360; az += 15) {
            const rad = (az - 90) * (Math.PI / 180);
            const x = centerX + maxRadius * Math.cos(rad);
            const y = centerY + maxRadius * Math.sin(rad);

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = this.hexToRgba(baseColor, az % 90 === 0 ? 0.45 : (az % 45 === 0 ? 0.25 : 0.12));
            ctx.lineWidth = Math.max(1, size / 2000);
            ctx.stroke();

            // Azimuth Degree Labels around perimeter
            if (az % 30 === 0 && az % 90 !== 0) {
                const labelDist = maxRadius + size * 0.024;
                const lx = centerX + labelDist * Math.cos(rad);
                const ly = centerY + labelDist * Math.sin(rad);
                ctx.fillStyle = this.hexToRgba(baseColor, 0.5);
                ctx.font = `${Math.round(size * 0.015)}px "Roboto Mono", monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${az}°`, lx, ly);
            }
        }

        // 3. Cardinal Direction Labels (N, S, E, W)
        const cardinalOffset = maxRadius + size * 0.038;
        const cardinals = [
            { text: 'N', x: centerX, y: centerY - cardinalOffset, align: 'center', baseline: 'middle' },
            { text: 'S', x: centerX, y: centerY + cardinalOffset, align: 'center', baseline: 'middle' },
            { text: 'E', x: centerX + cardinalOffset, y: centerY, align: 'center', baseline: 'middle' },
            { text: 'W', x: centerX - cardinalOffset, y: centerY, align: 'center', baseline: 'middle' }
        ];

        cardinals.forEach(c => {
            ctx.fillStyle = baseColor;
            ctx.font = `700 ${Math.round(size * 0.028)}px "Roboto", sans-serif`;
            ctx.textAlign = c.align;
            ctx.textBaseline = c.baseline;
            ctx.fillText(c.text, c.x, c.y);
        });

        // 4. Month & Solstice / Equinox Curves
        if (this.options.includeSolstices) {
            const year = state.date.getFullYear();
            // Dates: Summer Solstice (Jun 21), Winter Solstice (Dec 21), Equinox (Mar 21)
            const keyDates = [
                { date: new Date(year, 5, 21), color: this.hexToRgba(baseColor, 0.75), width: Math.max(1.5, size / 1200), name: 'Jun 21 Solstice' },
                { date: new Date(year, 11, 21), color: this.hexToRgba(baseColor, 0.75), width: Math.max(1.5, size / 1200), name: 'Dec 21 Solstice' },
                { date: new Date(year, 2, 21), color: this.hexToRgba(baseColor, 0.6), width: Math.max(1.2, size / 1400), name: 'Equinox (Mar/Sep)' }
            ];

            keyDates.forEach(kd => {
                const path = SolarCalc.getDailyPath(kd.date, state.latitude, state.longitude, 2);
                this.drawPathSegments(ctx, path, polarToXY, kd.color, kd.width);
            });
        }

        // 5. Analemma Hour Curves
        if (this.options.includeAnalemmas) {
            const year = state.date.getFullYear();
            const hourCurves = SolarCalc.getHourCurves(year, state.latitude, state.longitude);
            ctx.lineWidth = Math.max(1, size / 1800);
            ctx.setLineDash([Math.round(size * 0.004), Math.round(size * 0.004)]);
            ctx.strokeStyle = this.hexToRgba(baseColor, 0.4);

            hourCurves.forEach(curve => {
                const segments = [];
                let cur = [];
                for (let i = 0; i < curve.points.length; i++) {
                    const p = curve.points[i];
                    if (cur.length > 0) {
                        const prev = cur[cur.length - 1];
                        if (p.dayOfYear - prev.dayOfYear > 4) {
                            segments.push(cur);
                            cur = [];
                        }
                    }
                    cur.push(p);
                }
                if (cur.length > 0) segments.push(cur);

                segments.forEach(seg => {
                    if (seg.length < 2) return;
                    ctx.beginPath();
                    for (let i = 0; i < seg.length; i++) {
                        const pt = polarToXY(seg[i].elevation, seg[i].azimuth);
                        if (i === 0) ctx.moveTo(pt.x, pt.y);
                        else ctx.lineTo(pt.x, pt.y);
                    }
                    if (curve.isClosedLoop && seg.length === curve.points.length) {
                        const firstPt = polarToXY(seg[0].elevation, seg[0].azimuth);
                        ctx.lineTo(firstPt.x, firstPt.y);
                    }
                    ctx.stroke();
                });
            });
            ctx.setLineDash([]);
        }

        // 6. Massings (User-Drawn Massing Polygons)
        if (this.options.includeMassings && state.massings && state.massings.length > 0) {
            state.massings.forEach(m => {
                if (!m.points || m.points.length < 3) return;
                const screenPts = m.points.map(p => world3DToXY(p.x, p.z));

                ctx.beginPath();
                screenPts.forEach((pt, i) => {
                    if (i === 0) ctx.moveTo(pt.x, pt.y);
                    else ctx.lineTo(pt.x, pt.y);
                });
                ctx.closePath();
                ctx.fillStyle = state.transparentMassings ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.7)';
                ctx.fill();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = Math.max(1.5, size / 1200);
                ctx.stroke();
            });
        }

        // 7. Active Sun & Active Daily Sun Path
        if (this.options.includeSunPath) {
            const activePath = SolarCalc.getDailyPath(state.date, state.latitude, state.longitude, 2);
            this.drawPathSegments(ctx, activePath, polarToXY, '#f59e0b', Math.max(2, size / 800));

            const curSun = SolarCalc.getSolarPosition(state.date, state.latitude, state.longitude);
            if (curSun.elevation >= 0) {
                const sunPt = polarToXY(curSun.elevation, curSun.azimuth);

                // Ray from center
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(sunPt.x, sunPt.y);
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = Math.max(1.2, size / 1200);
                ctx.setLineDash([size * 0.005, size * 0.005]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Sun Halo Ring (150% larger)
                const haloR = Math.max(12, size * 0.02);
                ctx.beginPath();
                ctx.arc(sunPt.x, sunPt.y, haloR, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
                ctx.lineWidth = Math.max(1.5, size / 1000);
                ctx.stroke();

                // Sun Core
                const coreR = Math.max(6, size * 0.01);
                ctx.beginPath();
                ctx.arc(sunPt.x, sunPt.y, coreR, 0, Math.PI * 2);
                ctx.fillStyle = '#f59e0b';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(sunPt.x, sunPt.y, coreR * 0.55, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }
        }

        // 8. Location & Date Watermark / Architectural Metadata Block
        if (this.options.includeWatermark) {
            const locName = state.currentLocationLabel || `Lat ${state.latitude.toFixed(2)}°, Lon ${state.longitude.toFixed(2)}°`;
            const d = state.date;
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            const blockX = size * 0.05;
            const blockY = size * 0.93;

            ctx.save();
            ctx.fillStyle = baseColor;
            ctx.font = `700 ${Math.round(size * 0.022)}px "Roboto", sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(locName, blockX, blockY);

            ctx.fillStyle = this.hexToRgba(baseColor, 0.65);
            ctx.font = `500 ${Math.round(size * 0.015)}px "Roboto Mono", monospace`;
            ctx.fillText(`${dateStr} • ${timeStr} • 300 DPI Export`, blockX, blockY + size * 0.028);
            ctx.restore();
        }
    }

    drawPathSegments(ctx, path, polarToXY, strokeColor, lineWidth) {
        const daylight = path.filter(p => p.elevation >= 0);
        if (daylight.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;

        daylight.forEach((p, idx) => {
            const pt = polarToXY(p.elevation, p.azimuth);
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
    }

    hexToRgba(hex, alpha = 1) {
        let c = hex.replace('#', '');
        if (c.length === 3) c = c.split('').map(x => x + x).join('');
        const num = parseInt(c, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    renderPreview() {
        if (!this.previewCanvas) return;
        this.renderPolarChartToCanvas(this.previewCanvas, 420);
    }

    triggerHighResDownload() {
        const offscreen = document.createElement('canvas');
        const exportSize = this.options.exportResolution; // 3000 x 3000
        this.renderPolarChartToCanvas(offscreen, exportSize);

        const state = this.getAppState();
        const d = state.date;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const cityClean = (state.currentLocationLabel || 'polar-chart').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const filename = `polarpath-${cityClean}-${yyyy}${mm}${dd}-300dpi.png`;

        offscreen.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 3000);
            this.close();
        }, 'image/png');
    }
}
