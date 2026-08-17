/**
 * SunDome App - Master Controller
 * Handles 2D/3D split-screen synchronization, Unit System toggling (Metric/Customary),
 * Massing sketch manager & concise list, Real-time Drag-to-Move 2D massings,
 * and Astronomical Calculations.
 */

import { SolarCalc } from './solarCalc.js';
import { PolarChart2D } from './polarChart2D.js';
import { SolarDome3D } from './solarDome3D.js';
import { LocationModal } from './locationModal.js';
import { ExportModal } from './exportModal.js';
import { CITIES_DATABASE, getCityDisplayName } from './citiesData.js';

class SunDomeApp {
    constructor() {
        this.currentLocationLabel = 'Santa Fe, NM, USA';

        this.state = {
            date: new Date(),
            latitude: 35.6870,
            longitude: -105.9378,
            showAnalemmas: true,
            showAllMonths: true,
            transparentMassings: true,
            showDimensions: false,
            unitSystem: 'customary', // 'metric' | 'customary' (default: customary Ft In)
            zoomScale: (typeof window !== 'undefined' && window.innerWidth <= 820) ? 0.26 : 1.0,
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

        // Initialize Interactive World Map Location Modal
        this.locationModal = new LocationModal((loc) => this.onLocationSelected(loc));

        // Initialize 300 DPI PNG Export Modal
        this.exportModal = new ExportModal(
            () => ({ ...this.state, currentLocationLabel: this.currentLocationLabel }),
            () => this.polarChart
        );

        // Setup DOM Elements & Event Listeners
        this.initDomElements();
        this.setupEventListeners();
        this.initMobileNavigation();
        this.setupSplitDivider();
        this.setupAnimationLoop();

        // Initial sync
        this.syncState();
    }

    initDomElements() {
        // Unit Toggle Buttons (Desktop & Mobile)
        this.btnMetric = document.getElementById('btnMetric');
        this.btnCustomary = document.getElementById('btnCustomary');
        this.btnMetricMobile = document.getElementById('btnMetricMobile');
        this.btnCustomaryMobile = document.getElementById('btnCustomaryMobile');

        this.timeSlider = document.getElementById('timeSlider');
        this.timeDisplay = document.getElementById('timeDisplay');
        this.dayOfYearSlider = document.getElementById('dayOfYearSlider');
        this.dateDisplay = document.getElementById('dateDisplay');
        this.dayNumBadge = document.getElementById('dayNumBadge');
        this.daylightBadge = document.getElementById('daylightBadge');
        this.dateInput = document.getElementById('dateInput');
        this.latDisplay = document.getElementById('latDisplay');
        this.lonDisplay = document.getElementById('lonDisplay');

        // Location Modal Trigger
        this.btnOpenLocationModal = document.getElementById('btnOpenLocationModal');
        this.currentLocationName = document.getElementById('currentLocationName');

        // Export PNG Button
        this.btnExportPng = document.getElementById('btnExportPng');

        this.btnPlayPause = document.getElementById('btnPlayPause');
        this.playIcon = document.getElementById('playIcon');
        this.pauseIcon = document.getElementById('pauseIcon');
        this.btnPrevDay = document.getElementById('btnPrevDay');
        this.btnNextDay = document.getElementById('btnNextDay');
        this.speedSelect = document.getElementById('speedSelect');

        // Display & Analysis (Desktop)
        this.chkMonths = document.getElementById('chkMonths');
        this.chkAnalemmas = document.getElementById('chkAnalemmas');
        this.chkTransparent = document.getElementById('chkTransparent');
        this.chkDimensions = document.getElementById('chkDimensions');
        this.zoomScaleSlider = document.getElementById('zoomScaleSlider');
        this.zoomScaleReadout = document.getElementById('zoomScaleReadout');

        // Display & Analysis (Mobile Page 3)
        this.chkMonthsMobile = document.getElementById('chkMonthsMobile');
        this.chkAnalemmasMobile = document.getElementById('chkAnalemmasMobile');
        this.chkTransparentMobile = document.getElementById('chkTransparentMobile');
        this.chkDimensionsMobile = document.getElementById('chkDimensionsMobile');
        this.zoomScaleSliderMobile = document.getElementById('zoomScaleSliderMobile');
        this.zoomScaleReadoutMobile = document.getElementById('zoomScaleReadoutMobile');

        // Telemetry HUD (Desktop)
        this.hudElevation = document.getElementById('hudElevation');
        this.hudAzimuth = document.getElementById('hudAzimuth');
        this.hudDeclination = document.getElementById('hudDeclination');
        this.hudShadowRatio = document.getElementById('hudShadowRatio');
        this.hudSunTimes = document.getElementById('hudSunTimes');
        this.hudDayLength = document.getElementById('hudDayLength');

        // Telemetry HUD (Mobile Page 3)
        this.hudElevationMobile = document.getElementById('hudElevationMobile');
        this.hudAzimuthMobile = document.getElementById('hudAzimuthMobile');
        this.hudDeclinationMobile = document.getElementById('hudDeclinationMobile');
        this.hudShadowRatioMobile = document.getElementById('hudShadowRatioMobile');
        this.hudSunTimesMobile = document.getElementById('hudSunTimesMobile');
        this.hudDayLengthMobile = document.getElementById('hudDayLengthMobile');

        this.cameraPresetBtns = document.querySelectorAll('#cameraPresets .view-btn, #cameraPresetsMobile .view-btn');
        this.seasonBtns = document.querySelectorAll('.season-btn');

        // Draw Massing & Manager Elements (Desktop)
        this.btnDrawMode = document.getElementById('btnDrawMode');
        this.massingCountBadge = document.getElementById('massingCountBadge');
        this.selectedMassingControls = document.getElementById('selectedMassingControls');
        this.massingHeightRange = document.getElementById('massingHeightRange');
        this.massingHeightVal = document.getElementById('massingHeightVal');
        this.massingsItems = document.getElementById('massingsItems');
        this.drawModeBanner = document.getElementById('drawModeBanner');
        this.btnFinishPolygon = document.getElementById('btnFinishPolygon');
        this.btnCancelPolygon = document.getElementById('btnCancelPolygon');

        // Draw Massing & Manager Elements (Mobile Page 2)
        this.btnDrawModeMobile = document.getElementById('btnDrawModeMobile');
        this.massingCountBadgeMobile = document.getElementById('massingCountBadgeMobile');
        this.selectedMassingControlsMobile = document.getElementById('selectedMassingControlsMobile');
        this.massingHeightRangeMobile = document.getElementById('massingHeightRangeMobile');
        this.massingHeightValMobile = document.getElementById('massingHeightValMobile');
        this.massingsItemsMobile = document.getElementById('massingsItemsMobile');
        this.drawModeBannerMobile = document.getElementById('drawModeBannerMobile');
        this.btnFinishPolygonMobile = document.getElementById('btnFinishPolygonMobile');
        this.btnCancelPolygonMobile = document.getElementById('btnCancelPolygonMobile');

        // Set initial inputs & unit system
        this.setUnitSystem('customary');
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
            const totalInches = Math.round(meters * 39.3701);
            const feet = Math.floor(totalInches / 12);
            const inches = totalInches % 12;
            return inches > 0 ? `${feet}′ ${inches}″` : `${feet}′`;
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
        // Unit Toggle Buttons (Desktop & Mobile Synchronized)
        const setUnits = (u) => this.setUnitSystem(u);
        if (this.btnMetric) this.btnMetric.addEventListener('click', () => setUnits('metric'));
        if (this.btnCustomary) this.btnCustomary.addEventListener('click', () => setUnits('customary'));
        if (this.btnMetricMobile) this.btnMetricMobile.addEventListener('click', () => setUnits('metric'));
        if (this.btnCustomaryMobile) this.btnCustomaryMobile.addEventListener('click', () => setUnits('customary'));

        // Open World Map Location Modal (Desktop Modal or Mobile Tab Switch)
        if (this.btnOpenLocationModal) {
            this.btnOpenLocationModal.addEventListener('click', () => {
                if (window.innerWidth <= 820) {
                    this.scrollToMobilePage(1);
                } else {
                    this.locationModal.open(this.state.latitude, this.state.longitude, this.currentLocationLabel);
                }
            });
        }

        // Open 300 DPI Export PNG Modal
        if (this.btnExportPng) {
            this.btnExportPng.addEventListener('click', () => {
                if (window.innerWidth <= 820) {
                    this.scrollToMobilePage(4);
                } else {
                    this.exportModal.open();
                }
            });
        }

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

        // Layer & Display Toggles (Synchronized Desktop & Mobile)
        const bindToggle = (desktopEl, key) => {
            const updateVal = (checked) => {
                this.state[key] = checked;
                if (desktopEl) desktopEl.checked = checked;

                // Sync mobile button state
                const mobileBtn = document.querySelector(`.analysis-toggle-btn[data-toggle="${key}"]`);
                if (mobileBtn) {
                    mobileBtn.classList.toggle('active', checked);
                    const ind = mobileBtn.querySelector('.toggle-indicator');
                    if (ind) ind.textContent = checked ? '✓' : '—';
                }

                this.polarChart.updateState({ [key]: checked });
                this.solarDome.updateState({ [key]: checked });
            };

            if (desktopEl) desktopEl.addEventListener('change', (e) => updateVal(e.target.checked));

            const mobileBtn = document.querySelector(`.analysis-toggle-btn[data-toggle="${key}"]`);
            if (mobileBtn) {
                mobileBtn.addEventListener('click', () => updateVal(!this.state[key]));
            }
        };

        bindToggle(this.chkMonths, 'showAllMonths');
        bindToggle(this.chkAnalemmas, 'showAnalemmas');
        bindToggle(this.chkTransparent, 'transparentMassings');
        bindToggle(this.chkDimensions, 'showDimensions');

        // Viewport Zoom / Scale Slider (Synchronized Desktop & Mobile)
        const updateZoom = (zoom) => {
            this.state.zoomScale = zoom;
            if (this.zoomScaleSlider) this.zoomScaleSlider.value = zoom;
            if (this.zoomScaleSliderMobile) this.zoomScaleSliderMobile.value = zoom;
            if (this.zoomScaleReadout) this.zoomScaleReadout.textContent = `${zoom.toFixed(2)}×`;
            if (this.zoomScaleReadoutMobile) this.zoomScaleReadoutMobile.textContent = `${zoom.toFixed(2)}×`;
            this.polarChart.updateState({ zoomScale: zoom });
            this.solarDome.updateState({ zoomScale: zoom });
        };

        if (this.zoomScaleSlider) {
            this.zoomScaleSlider.addEventListener('input', (e) => updateZoom(parseFloat(e.target.value)));
        }
        if (this.zoomScaleSliderMobile) {
            this.zoomScaleSliderMobile.addEventListener('input', (e) => updateZoom(parseFloat(e.target.value)));
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
                const preset = btn.getAttribute('data-preset');
                this.cameraPresetBtns.forEach(b => {
                    if (b.getAttribute('data-preset') === preset) {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
                this.solarDome.setCameraPreset(preset);
            });
        });

        // Draw Pen Tool Button (Desktop & Mobile)
        if (this.btnDrawMode) {
            this.btnDrawMode.addEventListener('click', () => {
                this.toggleDrawMode(!this.state.isDrawMode);
            });
        }
        if (this.btnDrawModeMobile) {
            this.btnDrawModeMobile.addEventListener('click', () => {
                this.toggleDrawMode(!this.state.isDrawMode);
            });
        }

        if (this.btnFinishPolygon) {
            this.btnFinishPolygon.addEventListener('click', () => {
                this.polarChart.finishCurrentDrawing();
            });
        }
        if (this.btnFinishPolygonMobile) {
            this.btnFinishPolygonMobile.addEventListener('click', () => {
                this.polarChart.finishCurrentDrawing();
            });
        }

        if (this.btnCancelPolygon) {
            this.btnCancelPolygon.addEventListener('click', () => {
                this.toggleDrawMode(false);
                this.polarChart.cancelCurrentDrawing();
            });
        }
        if (this.btnCancelPolygonMobile) {
            this.btnCancelPolygonMobile.addEventListener('click', () => {
                this.toggleDrawMode(false);
                this.polarChart.cancelCurrentDrawing();
            });
        }

        // Massing Height Slider (Desktop & Mobile)
        const updateMassingHeight = (rawVal) => {
            let heightM = parseFloat(rawVal);
            if (this.state.unitSystem === 'customary') {
                heightM = heightM / 3.28084;
            }
            const heightFormatted = this.formatHeight(heightM);
            if (this.massingHeightVal) this.massingHeightVal.textContent = heightFormatted;
            if (this.massingHeightValMobile) this.massingHeightValMobile.textContent = heightFormatted;
            if (this.massingHeightRange) this.massingHeightRange.value = rawVal;
            if (this.massingHeightRangeMobile) this.massingHeightRangeMobile.value = rawVal;

            const selected = this.state.massings.find(m => m.id === this.state.selectedMassingId);
            if (selected) {
                selected.height = heightM;
                this.syncMassings();
                this.renderMassingsList();
            }
        };

        if (this.massingHeightRange) {
            this.massingHeightRange.addEventListener('input', (e) => updateMassingHeight(e.target.value));
        }
        if (this.massingHeightRangeMobile) {
            this.massingHeightRangeMobile.addEventListener('input', (e) => updateMassingHeight(e.target.value));
        }
    }

    initMobileNavigation() {
        this.mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
        this.mobilePages = document.querySelectorAll('.mobile-page');

        if (!this.mobileTabBtns.length || !this.mobilePages.length) return;

        // Tab Button Clicks: Instant page change without animation glitches
        this.mobileTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const pageIndex = parseInt(btn.getAttribute('data-page'), 10);
                this.scrollToMobilePage(pageIndex);
            });
        });
    }

    scrollToMobilePage(pageIndex) {
        if (!this.mobileTabBtns || !this.mobilePages) {
            this.mobileTabBtns = document.querySelectorAll('.mobile-tab-btn');
            this.mobilePages = document.querySelectorAll('.mobile-page');
        }

        // 1. Toggle active state on tabs
        this.mobileTabBtns.forEach((btn, idx) => {
            btn.classList.toggle('active', idx === pageIndex);
        });

        // 2. Toggle active visibility on pages (instant display: flex / display: none)
        this.mobilePages.forEach((page, idx) => {
            page.classList.toggle('active', idx === pageIndex);
        });

        // 3. Mount canvases and fire appropriate render callbacks
        this.updateActiveMobileTab(pageIndex);
    }

    updateActiveMobileTab(pageIndex) {
        const p2DContainer = document.getElementById('polarCanvasContainer');
        const pMassingsContainer = document.getElementById('polarCanvasContainerMassings');

        // Page 0: Charts (Full polar chart with solar paths & dome)
        if (pageIndex === 0) {
            if (p2DContainer && this.polarChart.canvas.parentNode !== p2DContainer) {
                p2DContainer.appendChild(this.polarChart.canvas);
            }
            this.polarChart.updateState({ isSketchOnlyMode: false });
            requestAnimationFrame(() => {
                this.polarChart.resize();
                this.solarDome.onResize();
            });
        }
        // Page 1: Location Map (Shifted to 2nd position)
        else if (pageIndex === 1 && this.locationModal) {
            this.locationModal.onMobileTabActive();
        }
        // Page 2: Massings & Sketching (Clean blank drafting canvas without solar curves)
        else if (pageIndex === 2) {
            if (pMassingsContainer && this.polarChart.canvas.parentNode !== pMassingsContainer) {
                pMassingsContainer.appendChild(this.polarChart.canvas);
            }
            this.polarChart.updateState({ isSketchOnlyMode: true });
            requestAnimationFrame(() => {
                this.polarChart.resize();
            });
        }
        // Page 3: Analysis & Units
        else if (pageIndex === 3) {
            // Settings and telemetry view
        }
        // Page 4: PDF / PNG Export
        else if (pageIndex === 4 && this.exportModal) {
            this.exportModal.onMobileTabActive();
        }
    }

    onLocationSelected(loc) {
        this.state.latitude = loc.latitude;
        this.state.longitude = loc.longitude;
        this.currentLocationLabel = loc.displayName;

        this.updateCoordinateDisplays();
        if (this.currentLocationName) this.currentLocationName.textContent = loc.displayName;

        this.syncState();
    }

    updateCoordinateDisplays() {
        const lat = this.state.latitude;
        const lon = this.state.longitude;
        const latStr = `${Math.abs(lat).toFixed(1)}° ${lat >= 0 ? 'N' : 'S'}`;
        const lonStr = `${Math.abs(lon).toFixed(1)}° ${lon >= 0 ? 'E' : 'W'}`;

        if (this.latDisplay) this.latDisplay.textContent = latStr;
        if (this.lonDisplay) this.lonDisplay.textContent = lonStr;
    }

    setUnitSystem(unit) {
        this.state.unitSystem = unit;
        if (unit === 'metric') {
            if (this.btnMetric) this.btnMetric.classList.add('active');
            if (this.btnMetricMobile) this.btnMetricMobile.classList.add('active');
            if (this.btnCustomary) this.btnCustomary.classList.remove('active');
            if (this.btnCustomaryMobile) this.btnCustomaryMobile.classList.remove('active');
            if (this.massingHeightRange) {
                this.massingHeightRange.min = '1';
                this.massingHeightRange.max = '40';
                this.massingHeightRange.step = '0.5';
            }
            if (this.massingHeightRangeMobile) {
                this.massingHeightRangeMobile.min = '1';
                this.massingHeightRangeMobile.max = '40';
                this.massingHeightRangeMobile.step = '0.5';
            }
        } else {
            if (this.btnMetric) this.btnMetric.classList.remove('active');
            if (this.btnMetricMobile) this.btnMetricMobile.classList.remove('active');
            if (this.btnCustomary) this.btnCustomary.classList.add('active');
            if (this.btnCustomaryMobile) this.btnCustomaryMobile.classList.add('active');
            if (this.massingHeightRange) {
                this.massingHeightRange.min = '3';
                this.massingHeightRange.max = '130';
                this.massingHeightRange.step = '1';
            }
            if (this.massingHeightRangeMobile) {
                this.massingHeightRangeMobile.min = '3';
                this.massingHeightRangeMobile.max = '130';
                this.massingHeightRangeMobile.step = '1';
            }
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
            if (this.btnDrawMode) this.btnDrawMode.classList.add('active');
            if (this.btnDrawModeMobile) this.btnDrawModeMobile.classList.add('active');
            if (this.drawModeBanner) this.drawModeBanner.style.display = 'flex';
            if (this.drawModeBannerMobile) this.drawModeBannerMobile.style.display = 'flex';
            this.state.selectedMassingId = null;
            if (this.selectedMassingControls) this.selectedMassingControls.style.display = 'none';
            if (this.selectedMassingControlsMobile) this.selectedMassingControlsMobile.style.display = 'none';
            this.polarChart.updateState({ selectedMassingId: null });
        } else {
            if (this.btnDrawMode) this.btnDrawMode.classList.remove('active');
            if (this.btnDrawModeMobile) this.btnDrawModeMobile.classList.remove('active');
            if (this.drawModeBanner) this.drawModeBanner.style.display = 'none';
            if (this.drawModeBannerMobile) this.drawModeBannerMobile.style.display = 'none';
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
            if (this.selectedMassingControls) this.selectedMassingControls.style.display = 'flex';
            if (this.selectedMassingControlsMobile) this.selectedMassingControlsMobile.style.display = 'flex';
            this.updateHeightControlForSelected(massing);
        } else {
            this.state.selectedMassingId = null;
            if (this.selectedMassingControls) this.selectedMassingControls.style.display = 'none';
            if (this.selectedMassingControlsMobile) this.selectedMassingControlsMobile.style.display = 'none';
        }
        this.polarChart.updateState({ selectedMassingId: this.state.selectedMassingId });
        this.renderMassingsList();
    }

    updateHeightControlForSelected(massing) {
        let displayStr = '';
        let rangeVal = massing.height;
        if (this.state.unitSystem === 'customary') {
            const ft = massing.height * 3.28084;
            rangeVal = Math.round(ft);
            displayStr = this.formatHeight(massing.height);
        } else {
            displayStr = `${massing.height.toFixed(1)} m`;
        }

        if (this.massingHeightRange) this.massingHeightRange.value = rangeVal;
        if (this.massingHeightRangeMobile) this.massingHeightRangeMobile.value = rangeVal;
        if (this.massingHeightVal) this.massingHeightVal.textContent = displayStr;
        if (this.massingHeightValMobile) this.massingHeightValMobile.textContent = displayStr;
    }

    onMassingMoved(massing) {
        massing.points3D = massing.points.map(p => this.polarChart.canvasTo3DWorld(p.x, p.y));
        this.syncMassings();
    }

    deleteMassing(id) {
        this.state.massings = this.state.massings.filter(m => m.id !== id);
        if (this.state.selectedMassingId === id) {
            this.state.selectedMassingId = null;
            if (this.selectedMassingControls) this.selectedMassingControls.style.display = 'none';
            if (this.selectedMassingControlsMobile) this.selectedMassingControlsMobile.style.display = 'none';
        }
        this.syncMassings();
        this.renderMassingsList();
    }

    renderMassingsList() {
        const count = this.state.massings.length;
        if (this.massingCountBadge) this.massingCountBadge.textContent = count;
        if (this.massingCountBadgeMobile) this.massingCountBadgeMobile.textContent = count;

        if (count === 0) {
            const emptyDesktop = `<div class="empty-massings-hint">No massings drawn. Click ✏️ to sketch.</div>`;
            const emptyMobile = `<div class="empty-massings-hint">No massings drawn yet. Tap ✏️ to sketch on the chart below.</div>`;
            if (this.massingsItems) this.massingsItems.innerHTML = emptyDesktop;
            if (this.massingsItemsMobile) this.massingsItemsMobile.innerHTML = emptyMobile;
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

        const bindListEvents = (containerEl) => {
            if (!containerEl) return;
            containerEl.innerHTML = html;
            containerEl.querySelectorAll('.massing-item').forEach(itemEl => {
                itemEl.addEventListener('click', (e) => {
                    if (e.target.closest('.massing-item-delete')) return;
                    const id = parseInt(itemEl.getAttribute('data-id'), 10);
                    const massing = this.state.massings.find(m => m.id === id);
                    if (massing) {
                        this.onMassingSelected(massing);
                    }
                });
            });

            containerEl.querySelectorAll('.massing-item-delete').forEach(delBtn => {
                delBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(delBtn.getAttribute('data-del-id'), 10);
                    this.deleteMassing(id);
                });
            });
        };

        bindListEvents(this.massingsItems);
        bindListEvents(this.massingsItemsMobile);
    }

    onLocationSelected(loc) {
        this.state.latitude = loc.latitude;
        this.state.longitude = loc.longitude;
        this.currentLocationLabel = loc.displayName;

        this.updateCoordinateDisplays();
        if (this.currentLocationName) this.currentLocationName.textContent = loc.displayName;

        this.syncState();
    }

    updateCoordinateDisplays() {
        const lat = this.state.latitude;
        const lon = this.state.longitude;
        const latStr = `${Math.abs(lat).toFixed(1)}° ${lat >= 0 ? 'N' : 'S'}`;
        const lonStr = `${Math.abs(lon).toFixed(1)}° ${lon >= 0 ? 'E' : 'W'}`;

        if (this.latDisplay) this.latDisplay.textContent = latStr;
        if (this.lonDisplay) this.lonDisplay.textContent = lonStr;
    }

    updateLocationLabelFromCoords() {
        const lat = this.state.latitude;
        const lon = this.state.longitude;

        // Check if close to known city
        let matched = null;
        for (const city of CITIES_DATABASE) {
            if (Math.abs(city.lat - lat) < 0.15 && Math.abs(city.lon - lon) < 0.15) {
                matched = getCityDisplayName(city);
                break;
            }
        }

        const latStr = `${Math.abs(lat).toFixed(1)}° ${lat >= 0 ? 'N' : 'S'}`;
        const lonStr = `${Math.abs(lon).toFixed(1)}° ${lon >= 0 ? 'E' : 'W'}`;
        this.currentLocationLabel = matched || `Custom (${latStr}, ${lonStr})`;

        if (this.currentLocationName) {
            this.currentLocationName.textContent = this.currentLocationLabel;
        }
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
            if (this.btnPlayPause) this.btnPlayPause.classList.add('playing');
        } else {
            this.playIcon.style.display = 'block';
            this.pauseIcon.style.display = 'none';
            if (this.btnPlayPause) this.btnPlayPause.classList.remove('playing');
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
        this.updateCoordinateDisplays();
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

        // Telemetry HUD (Desktop & Mobile Synchronized)
        const elevStr = `${pos.elevation >= 0 ? '+' : ''}${pos.elevation.toFixed(1)}°`;
        const azimStr = `${pos.azimuth.toFixed(1)}°`;
        const declStr = `${pos.declination >= 0 ? '+' : ''}${pos.declination.toFixed(1)}°`;
        const shadowStr = pos.elevation > 0 ? `${(1 / Math.tan(pos.elevation * Math.PI / 180)).toFixed(2)}x` : 'No Shadow';

        let sunTimesStr = '';
        let dayLengthStr = '';
        if (times.hasSunrise && times.hasSunset) {
            sunTimesStr = `${this.formatHoursToTime(times.sunrise)} • ${this.formatHoursToTime(times.sunset)}`;
            dayLengthStr = `${times.dayLength.toFixed(1)} hrs`;
        } else if (times.isMidnightSun) {
            sunTimesStr = 'Midnight Sun (24h)';
            dayLengthStr = '24.0 hrs';
        } else {
            sunTimesStr = 'Polar Night (0h)';
            dayLengthStr = '0.0 hrs';
        }

        if (this.hudElevation) this.hudElevation.textContent = elevStr;
        if (this.hudElevationMobile) this.hudElevationMobile.textContent = elevStr;
        if (this.hudAzimuth) this.hudAzimuth.textContent = azimStr;
        if (this.hudAzimuthMobile) this.hudAzimuthMobile.textContent = azimStr;
        if (this.hudDeclination) this.hudDeclination.textContent = declStr;
        if (this.hudDeclinationMobile) this.hudDeclinationMobile.textContent = declStr;
        if (this.hudShadowRatio) this.hudShadowRatio.textContent = shadowStr;
        if (this.hudShadowRatioMobile) this.hudShadowRatioMobile.textContent = shadowStr;
        if (this.hudSunTimes) this.hudSunTimes.textContent = sunTimesStr;
        if (this.hudSunTimesMobile) this.hudSunTimesMobile.textContent = sunTimesStr;
        if (this.hudDayLength) this.hudDayLength.textContent = dayLengthStr;
        if (this.hudDayLengthMobile) this.hudDayLengthMobile.textContent = dayLengthStr;

        // Update Fixed Polar Chart Subbadge on Mobile (Replaces canvas floating badge)
        const subbadgeEl = document.getElementById('polarChartMobileSubbadge');
        if (subbadgeEl) {
            const curHours = this.state.date.getHours() + this.state.date.getMinutes() / 60;
            subbadgeEl.textContent = `${elevStr} | ${azimStr} • ${this.formatHoursToTime(curHours)}`;
        }

        // Separate 2D scale and 3D scale on mobile mode:
        // 2D chart stays at compact 0.26 (house ~10% width), 3D dome is boosted ~300% to 0.85 for clear presence
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 820;
        const polarZoom = isMobile ? 0.26 : this.state.zoomScale;
        const domeZoom = isMobile ? 0.85 : this.state.zoomScale;

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
            zoomScale: polarZoom,
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
            zoomScale: domeZoom,
            massings: this.state.massings
        });
    }
}

// Synchronize accurate viewport height for iOS Safari & Chrome
function updateAppHeight() {
    const doc = document.documentElement;
    const vh = window.innerHeight;
    doc.style.setProperty('--app-height', `${vh}px`);
    if (window.sunDomeApp) {
        window.sunDomeApp.polarChart?.resize();
        window.sunDomeApp.solarDome?.onResize();
    }
}
window.addEventListener('resize', updateAppHeight, { passive: true });
window.addEventListener('orientationchange', updateAppHeight, { passive: true });
window.addEventListener('DOMContentLoaded', updateAppHeight);
updateAppHeight();

// Bootstrap on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
    window.sunDomeApp = new SunDomeApp();
    updateAppHeight();
});
