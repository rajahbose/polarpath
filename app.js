/**
 * SunDome App - Master Controller
 * Handles 2D/3D split-screen synchronization, Unit System toggling (Metric/Customary),
 * Massing sketch manager & concise list, Real-time Drag-to-Move 2D massings,
 * and Astronomical Calculations.
 */

import { SolarCalc } from './solarCalc.js';
import { PolarChart2D } from './polarChart2D.js';
import { SolarDome3D } from './solarDome3D.js';

class SunDomeApp {
    constructor() {
        this.state = {
            date: new Date(),
            latitude: 35.6870,
            longitude: -105.9378,
            showAnalemmas: true,
            showAllMonths: true,
            transparentMassings: true,
            showDimensions: false,
            unitSystem: 'metric', // 'metric' | 'customary'
            zoomScale: 1.0,
            isPlaying: false,
            playbackSpeed: 30,
            isDrawMode: false,
            massings: [],
            selectedMassingId: null
        };

        // Initialize 2D Polar Chart
        this.polarChart = new PolarChart2D(
            'polarCanvasContainer',
            (minutes) => this.setTimeMinutes(minutes),
            (points2D) => this.onPolygonCompleted(points2D),
            (massing) => this.onMassingSelected(massing),
            (massing) => this.onMassingMoved(massing)
        );

        // Initialize 3D Solar Dome
        this.solarDome = new SolarDome3D('dome3DContainer');

        // Setup DOM Elements & Event Listeners
        this.initDomElements();
        this.setupEventListeners();
        this.setupSplitDivider();
        this.setupAnimationLoop();

        // Initial sync
        this.syncState();
    }

    initDomElements() {
        // Unit Toggle Buttons
        this.btnMetric = document.getElementById('btnMetric');
        this.btnCustomary = document.getElementById('btnCustomary');

        this.timeSlider = document.getElementById('timeSlider');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.dayOfYearSlider = document.getElementById('dayOfYearSlider');
        this.dateDisplay = document.getElementById('dateDisplay');
        this.dayNumBadge = document.getElementById('dayNumBadge');
        this.daylightBadge = document.getElementById('daylightBadge');
        this.dateInput = document.getElementById('dateInput');
        this.latInput = document.getElementById('latInput');
        this.lonInput = document.getElementById('lonInput');
        this.cityPreset = document.getElementById('cityPreset');

        this.btnPlayPause = document.getElementById('btnPlayPause');
        this.playIcon = document.getElementById('playIcon');
        this.pauseIcon = document.getElementById('pauseIcon');
        this.btnPrevDay = document.getElementById('btnPrevDay');
        this.btnNextDay = document.getElementById('btnNextDay');
        this.speedSelect = document.getElementById('speedSelect');

        this.chkMonths = document.getElementById('chkMonths');
        this.chkAnalemmas = document.getElementById('chkAnalemmas');
        this.chkTransparent = document.getElementById('chkTransparent');
        this.chkDimensions = document.getElementById('chkDimensions');
        this.zoomScaleSlider = document.getElementById('zoomScaleSlider');
        this.zoomScaleReadout = document.getElementById('zoomScaleReadout');

        this.hudElevation = document.getElementById('hudElevation');
        this.hudAzimuth = document.getElementById('hudAzimuth');
        this.hudDeclination = document.getElementById('hudDeclination');
        this.hudShadowRatio = document.getElementById('hudShadowRatio');
        this.hudSunTimes = document.getElementById('hudSunTimes');
        this.hudDayLength = document.getElementById('hudDayLength');

        this.cameraPresetBtns = document.querySelectorAll('#cameraPresets .view-btn');
        this.seasonBtns = document.querySelectorAll('.season-btn');

        // Draw Massing & Manager Elements
        this.btnDrawMode = document.getElementById('btnDrawMode');
        this.massingCountBadge = document.getElementById('massingCountBadge');
        this.selectedMassingControls = document.getElementById('selectedMassingControls');
        this.massingHeightRange = document.getElementById('massingHeightRange');
        this.massingHeightVal = document.getElementById('massingHeightVal');
        this.massingsItems = document.getElementById('massingsItems');
        this.drawModeBanner = document.getElementById('drawModeBanner');
        this.btnFinishPolygon = document.getElementById('btnFinishPolygon');
        this.btnCancelPolygon = document.getElementById('btnCancelPolygon');

        // Set initial inputs
        this.updateDateInputs();
        this.renderMassingsList();
    }

    updateDateInputs() {
        const d = this.state.date;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        this.dateInput.value = `${yyyy}-${mm}-${dd}`;

        const minutes = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
        this.timeSlider.value = Math.floor(minutes);

        const dayOfYear = SolarCalc.getDayOfYear(d);
        if (this.dayOfYearSlider) {
            this.dayOfYearSlider.value = dayOfYear;
        }
        if (this.dayNumBadge) {
            this.dayNumBadge.textContent = `Day ${dayOfYear} / 365`;
        }
    }

    formatHeight(meters) {
        if (this.state.unitSystem === 'customary') {
            const ft = meters * 3.28084;
            return `${ft.toFixed(1)} ft`;
        }
        return `${meters.toFixed(1)} m`;
    }

    formatArea(m2) {
        if (this.state.unitSystem === 'customary') {
            const sqft = m2 * 10.7639;
            return `${Math.round(sqft).toLocaleString()} sq ft`;
        }
        return `${m2.toFixed(1)} m²`;
    }

    setupEventListeners() {
        // Unit Toggle Buttons
        this.btnMetric.addEventListener('click', () => {
            this.setUnitSystem('metric');
        });

        this.btnCustomary.addEventListener('click', () => {
            this.setUnitSystem('customary');
        });

        // Time of Day Slider
        this.timeSlider.addEventListener('input', (e) => {
            const minutes = parseFloat(e.target.value);
            this.setTimeMinutes(minutes);
        });

        // Day of Year Scrubber Slider
        this.dayOfYearSlider.addEventListener('input', (e) => {
            const dayOfYear = parseInt(e.target.value, 10);
            this.setDayOfYear(dayOfYear);
        });

        // Date Picker
        this.dateInput.addEventListener('change', (e) => {
            if (!e.target.value) return;
            const [y, m, d] = e.target.value.split('-').map(Number);
            const curH = this.state.date.getHours();
            const curMin = this.state.date.getMinutes();
            const curSec = this.state.date.getSeconds();
            this.state.date = new Date(y, m - 1, d, curH, curMin, curSec);
            this.syncState();
        });

        // Coordinates
        this.latInput.addEventListener('change', (e) => {
            const lat = Math.max(-90, Math.min(90, parseFloat(e.target.value) || 0));
            this.state.latitude = lat;
            this.cityPreset.value = 'custom';
            this.syncState();
        });

        this.lonInput.addEventListener('change', (e) => {
            const lon = Math.max(-180, Math.min(180, parseFloat(e.target.value) || 0));
            this.state.longitude = lon;
            this.cityPreset.value = 'custom';
            this.syncState();
        });

        // City Preset
        this.cityPreset.addEventListener('change', (e) => {
            if (e.target.value === 'custom') return;
            const [lat, lon] = e.target.value.split(',').map(Number);
            this.state.latitude = lat;
            this.state.longitude = lon;
            this.latInput.value = lat.toFixed(1);
            this.lonInput.value = lon.toFixed(1);
            this.syncState();
        });

        // Play / Pause
        this.btnPlayPause.addEventListener('click', () => {
            this.togglePlay();
        });

        // Next / Prev Day
        this.btnPrevDay.addEventListener('click', () => {
            this.state.date = new Date(this.state.date.getTime() - 24 * 60 * 60 * 1000);
            this.updateDateInputs();
            this.syncState();
        });

        this.btnNextDay.addEventListener('click', () => {
            this.state.date = new Date(this.state.date.getTime() + 24 * 60 * 60 * 1000);
            this.updateDateInputs();
            this.syncState();
        });

        // Speed Select
        this.speedSelect.addEventListener('change', (e) => {
            this.state.playbackSpeed = parseFloat(e.target.value);
        });

        // Layer & Display Toggles
        this.chkMonths.addEventListener('change', (e) => {
            this.state.showAllMonths = e.target.checked;
            this.polarChart.updateState({ showAllMonths: this.state.showAllMonths });
            this.solarDome.updateState({ showAllMonths: this.state.showAllMonths });
        });

        this.chkAnalemmas.addEventListener('change', (e) => {
            this.state.showAnalemmas = e.target.checked;
            this.polarChart.updateState({ showAnalemmas: this.state.showAnalemmas });
            this.solarDome.updateState({ showAnalemmas: this.state.showAnalemmas });
        });

        this.chkTransparent.addEventListener('change', (e) => {
            this.state.transparentMassings = e.target.checked;
            this.polarChart.updateState({ transparentMassings: this.state.transparentMassings });
            this.solarDome.updateState({ transparentMassings: this.state.transparentMassings });
        });

        this.chkDimensions.addEventListener('change', (e) => {
            this.state.showDimensions = e.target.checked;
            this.polarChart.updateState({ showDimensions: this.state.showDimensions });
            this.solarDome.updateState({ showDimensions: this.state.showDimensions });
        });

        // Viewport Zoom / Scale Slider
        if (this.zoomScaleSlider) {
            this.zoomScaleSlider.addEventListener('input', (e) => {
                const zoom = parseFloat(e.target.value);
                this.state.zoomScale = zoom;
                if (this.zoomScaleReadout) {
                    this.zoomScaleReadout.textContent = `${zoom.toFixed(2)}×`;
                }
                this.polarChart.updateState({ zoomScale: zoom });
                this.solarDome.updateState({ zoomScale: zoom });
            });
        }

        // Season Quick Presets
        this.seasonBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const season = btn.getAttribute('data-date');
                const y = this.state.date.getFullYear();
                const curH = this.state.date.getHours();
                const curMin = this.state.date.getMinutes();

                if (season === 'summer') {
                    this.state.date = new Date(y, 5, 21, curH, curMin, 0);
                } else if (season === 'winter') {
                    this.state.date = new Date(y, 11, 21, curH, curMin, 0);
                } else if (season === 'equinox') {
                    this.state.date = new Date(y, 2, 21, curH, curMin, 0);
                } else if (season === 'today') {
                    const now = new Date();
                    this.state.date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), curH, curMin, 0);
                }
                this.updateDateInputs();
                this.syncState();
            });
        });

        // Camera Presets
        this.cameraPresetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.cameraPresetBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const preset = btn.getAttribute('data-preset');
                this.solarDome.setCameraPreset(preset);
            });
        });

        // Draw Pen Tool Button (Toggle Draw Mode)
        this.btnDrawMode.addEventListener('click', () => {
            this.toggleDrawMode(!this.state.isDrawMode);
        });

        this.btnFinishPolygon.addEventListener('click', () => {
            this.polarChart.finishCurrentDrawing();
        });

        this.btnCancelPolygon.addEventListener('click', () => {
            this.toggleDrawMode(false);
            this.polarChart.cancelCurrentDrawing();
        });

        // Massing Height Slider
        this.massingHeightRange.addEventListener('input', (e) => {
            let heightM = parseFloat(e.target.value);
            if (this.state.unitSystem === 'customary') {
                heightM = heightM / 3.28084;
            }
            this.massingHeightVal.textContent = this.formatHeight(heightM);

            const selected = this.state.massings.find(m => m.id === this.state.selectedMassingId);
            if (selected) {
                selected.height = heightM;
                this.syncMassings();
                this.renderMassingsList();
            }
        });
    }

    setUnitSystem(unit) {
        this.state.unitSystem = unit;
        if (unit === 'metric') {
            this.btnMetric.classList.add('active');
            this.btnCustomary.classList.remove('active');
            this.massingHeightRange.min = '1';
            this.massingHeightRange.max = '40';
            this.massingHeightRange.step = '0.5';
        } else {
            this.btnMetric.classList.remove('active');
            this.btnCustomary.classList.add('active');
            this.massingHeightRange.min = '3';
            this.massingHeightRange.max = '130';
            this.massingHeightRange.step = '1';
        }

        const selected = this.state.massings.find(m => m.id === this.state.selectedMassingId);
        if (selected) {
            this.updateHeightControlForSelected(selected);
        }

        this.polarChart.updateState({ unitSystem: unit });
        this.solarDome.updateState({ unitSystem: unit });
        this.renderMassingsList();
    }

    toggleDrawMode(enabled) {
        this.state.isDrawMode = enabled;
        this.polarChart.setDrawMode(enabled);

        if (enabled) {
            this.btnDrawMode.classList.add('active');
            this.drawModeBanner.style.display = 'flex';
            this.state.selectedMassingId = null;
            this.selectedMassingControls.style.display = 'none';
            this.polarChart.updateState({ selectedMassingId: null });
        } else {
            this.btnDrawMode.classList.remove('active');
            this.drawModeBanner.style.display = 'none';
        }
        this.renderMassingsList();
    }

    onPolygonCompleted(points2D) {
        const points3D = points2D.map(p => this.polarChart.canvasTo3DWorld(p.x, p.y));
        const newMassing = {
            id: Date.now(),
            points: points2D,
            points3D: points3D,
            height: 6.0
        };

        this.state.massings.push(newMassing);
        this.state.selectedMassingId = newMassing.id;

        this.toggleDrawMode(false);
        this.onMassingSelected(newMassing);
        this.syncMassings();
        this.renderMassingsList();
    }

    onMassingSelected(massing) {
        if (massing) {
            this.state.selectedMassingId = massing.id;
            this.selectedMassingControls.style.display = 'flex';
            this.updateHeightControlForSelected(massing);
        } else {
            this.state.selectedMassingId = null;
            this.selectedMassingControls.style.display = 'none';
        }
        this.polarChart.updateState({ selectedMassingId: this.state.selectedMassingId });
        this.renderMassingsList();
    }

    updateHeightControlForSelected(massing) {
        if (this.state.unitSystem === 'customary') {
            const ft = massing.height * 3.28084;
            this.massingHeightRange.value = Math.round(ft);
            this.massingHeightVal.textContent = `${ft.toFixed(1)} ft`;
        } else {
            this.massingHeightRange.value = massing.height;
            this.massingHeightVal.textContent = `${massing.height.toFixed(1)} m`;
        }
    }

    onMassingMoved(massing) {
        massing.points3D = massing.points.map(p => this.polarChart.canvasTo3DWorld(p.x, p.y));
        this.syncMassings();
    }

    deleteMassing(id) {
        this.state.massings = this.state.massings.filter(m => m.id !== id);
        if (this.state.selectedMassingId === id) {
            this.state.selectedMassingId = null;
            this.selectedMassingControls.style.display = 'none';
        }
        this.syncMassings();
        this.renderMassingsList();
    }

    renderMassingsList() {
        this.massingCountBadge.textContent = this.state.massings.length;

        if (this.state.massings.length === 0) {
            this.massingsItems.innerHTML = `<div class="empty-massings-hint">No massings drawn. Click ✏️ to sketch.</div>`;
            return;
        }

        let html = '';
        this.state.massings.forEach((m, idx) => {
            const isSelected = m.id === this.state.selectedMassingId;
            const areaM2 = this.polarChart.calculatePolygonAreaM2(m.points);
            const areaStr = this.formatArea(areaM2);
            const heightStr = this.formatHeight(m.height);

            html += `
                <div class="massing-item ${isSelected ? 'selected' : ''}" data-id="${m.id}">
                    <div class="massing-item-info">
                        <span class="massing-item-name">Massing #${idx + 1}</span>
                        <span class="massing-item-meta">H: ${heightStr} • Area: ${areaStr}</span>
                    </div>
                    <button class="massing-item-delete" data-del-id="${m.id}" title="Delete this massing">
                        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `;
        });

        this.massingsItems.innerHTML = html;

        // Attach click listeners to massing items and delete buttons
        this.massingsItems.querySelectorAll('.massing-item').forEach(itemEl => {
            itemEl.addEventListener('click', (e) => {
                if (e.target.closest('.massing-item-delete')) return;
                const id = parseInt(itemEl.getAttribute('data-id'), 10);
                const massing = this.state.massings.find(m => m.id === id);
                if (massing) {
                    this.onMassingSelected(massing);
                }
            });
        });

        this.massingsItems.querySelectorAll('.massing-item-delete').forEach(delBtn => {
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(delBtn.getAttribute('data-del-id'), 10);
                this.deleteMassing(id);
            });
        });
    }

    syncMassings() {
        this.polarChart.updateState({
            massings: this.state.massings,
            selectedMassingId: this.state.selectedMassingId,
            transparentMassings: this.state.transparentMassings,
            showDimensions: this.state.showDimensions,
            unitSystem: this.state.unitSystem
        });
        this.solarDome.updateState({
            massings: this.state.massings,
            transparentMassings: this.state.transparentMassings,
            showDimensions: this.state.showDimensions,
            unitSystem: this.state.unitSystem
        });
    }

    setupSplitDivider() {
        const divider = document.getElementById('splitDivider');
        const container = document.getElementById('splitContainer');
        const panel2D = document.getElementById('panel2D');
        const panel3D = document.getElementById('panel3D');

        let isDragging = false;

        divider.addEventListener('mousedown', (e) => {
            isDragging = true;
            document.body.style.cursor = 'col-resize';
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const containerRect = container.getBoundingClientRect();
            const offset = e.clientX - containerRect.left;
            const percentage = Math.max(20, Math.min(80, (offset / containerRect.width) * 100));

            panel2D.style.flex = `0 0 ${percentage}%`;
            panel3D.style.flex = `0 0 ${100 - percentage}%`;

            this.polarChart.resize();
            this.solarDome.onResize();
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.cursor = '';
            }
        });
    }

    setTimeMinutes(minutes) {
        const h = Math.floor(minutes / 60) % 24;
        const min = Math.floor(minutes % 60);
        const sec = Math.floor((minutes * 60) % 60);

        this.state.date.setHours(h, min, sec);
        this.timeSlider.value = minutes;
        this.syncState();
    }

    setDayOfYear(dayOfYear) {
        const y = this.state.date.getFullYear();
        const curH = this.state.date.getHours();
        const curMin = this.state.date.getMinutes();
        const curSec = this.state.date.getSeconds();

        const newDate = new Date(y, 0, dayOfYear, curH, curMin, curSec);
        this.state.date = newDate;

        const yyyy = newDate.getFullYear();
        const mm = String(newDate.getMonth() + 1).padStart(2, '0');
        const dd = String(newDate.getDate()).padStart(2, '0');
        this.dateInput.value = `${yyyy}-${mm}-${dd}`;

        this.syncState();
    }

    togglePlay() {
        this.state.isPlaying = !this.state.isPlaying;
        if (this.state.isPlaying) {
            this.playIcon.style.display = 'none';
            this.pauseIcon.style.display = 'block';
        } else {
            this.playIcon.style.display = 'block';
            this.pauseIcon.style.display = 'none';
        }
    }

    setupAnimationLoop() {
        let lastTime = performance.now();

        const loop = (now) => {
            const deltaMs = now - lastTime;
            lastTime = now;

            if (this.state.isPlaying) {
                const addMinutes = (deltaMs / 1000) * this.state.playbackSpeed;
                const curMinutes = this.state.date.getHours() * 60 + this.state.date.getMinutes() + this.state.date.getSeconds() / 60;
                let newMinutes = (curMinutes + addMinutes) % (24 * 60);
                
                this.setTimeMinutes(newMinutes);
            }

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    formatHoursToTime(hours) {
        if (hours === null || isNaN(hours)) return '--';
        const wrapped = (hours % 24 + 24) % 24;
        let h = Math.floor(wrapped);
        let m = Math.floor((wrapped * 60) % 60);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 === 0 ? 12 : h % 12;
        const displayM = String(m).padStart(2, '0');
        return `${displayH}:${displayM} ${ampm}`;
    }

    syncState() {
        const pos = SolarCalc.getSolarPosition(this.state.date, this.state.latitude, this.state.longitude);
        const times = SolarCalc.getSolarTimes(this.state.date, this.state.latitude, this.state.longitude);

        const curHours = this.state.date.getHours() + this.state.date.getMinutes() / 60 + this.state.date.getSeconds() / 3600;
        this.timeDisplay.textContent = this.formatHoursToTime(curHours);
        
        const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        this.dateDisplay.textContent = this.state.date.toLocaleDateString('en-US', dateOptions);

        const dayOfYear = SolarCalc.getDayOfYear(this.state.date);
        if (this.dayOfYearSlider && document.activeElement !== this.dayOfYearSlider) {
            this.dayOfYearSlider.value = dayOfYear;
        }
        if (this.dayNumBadge) {
            this.dayNumBadge.textContent = `Day ${dayOfYear} / 365`;
        }

        if (pos.isDaylight) {
            this.daylightBadge.textContent = '☀️ Daylight';
            this.daylightBadge.className = 'sun-state-badge active-sun';
        } else {
            this.daylightBadge.textContent = '🌙 Night';
            this.daylightBadge.className = 'sun-state-badge';
        }

        // Telemetry HUD
        this.hudElevation.textContent = `${pos.elevation >= 0 ? '+' : ''}${pos.elevation.toFixed(1)}°`;
        this.hudAzimuth.textContent = `${pos.azimuth.toFixed(1)}°`;
        this.hudDeclination.textContent = `${pos.declination >= 0 ? '+' : ''}${pos.declination.toFixed(1)}°`;

        if (pos.elevation > 0) {
            const ratio = 1 / Math.tan(pos.elevation * Math.PI / 180);
            this.hudShadowRatio.textContent = `${ratio.toFixed(2)}x`;
        } else {
            this.hudShadowRatio.textContent = 'No Shadow';
        }

        if (times.hasSunrise && times.hasSunset) {
            this.hudSunTimes.textContent = `${this.formatHoursToTime(times.sunrise)} • ${this.formatHoursToTime(times.sunset)}`;
            this.hudDayLength.textContent = `${times.dayLength.toFixed(1)} hrs`;
        } else if (times.isMidnightSun) {
            this.hudSunTimes.textContent = 'Midnight Sun (24h)';
            this.hudDayLength.textContent = '24.0 hrs';
        } else {
            this.hudSunTimes.textContent = 'Polar Night (0h)';
            this.hudDayLength.textContent = '0.0 hrs';
        }

        // Update 2D Polar Chart
        this.polarChart.updateState({
            date: this.state.date,
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            showAnalemmas: this.state.showAnalemmas,
            showAllMonths: this.state.showAllMonths,
            transparentMassings: this.state.transparentMassings,
            showDimensions: this.state.showDimensions,
            unitSystem: this.state.unitSystem,
            zoomScale: this.state.zoomScale,
            massings: this.state.massings,
            selectedMassingId: this.state.selectedMassingId
        });

        // Update 3D Solar Dome
        this.solarDome.updateState({
            date: this.state.date,
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            showAnalemmas: this.state.showAnalemmas,
            showAllMonths: this.state.showAllMonths,
            transparentMassings: this.state.transparentMassings,
            showDimensions: this.state.showDimensions,
            unitSystem: this.state.unitSystem,
            zoomScale: this.state.zoomScale,
            massings: this.state.massings
        });
    }
}

// Bootstrap on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
    window.sunDomeApp = new SunDomeApp();
});
