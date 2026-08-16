/**
 * locationModal.js
 * Interactive Floating Flat Projected World Map & Filterable City Selector
 */

import { CITIES_DATABASE, getCityDisplayName } from './citiesData.js';
import { WORLD_CONTINENTS_COORDS } from './worldMapData.js';

export class LocationModal {
    constructor(onLocationSelected) {
        this.onLocationSelected = onLocationSelected;
        this.isOpen = false;
        this.currentLat = 35.6870;
        this.currentLon = -105.9378;
        this.selectedCityName = 'Santa Fe, NM, USA';
        this.filterText = '';
        this.activeFilterCategory = 'all'; // 'all' | 'world' | 'us'

        this.initDom();
        this.initMobileDom();
        this.setupMap();
        this.setupEventListeners();
    }

    initDom() {
        // Modal Overlay Container (Desktop Modal)
        this.overlay = document.createElement('div');
        this.overlay.className = 'location-modal-overlay';
        this.overlay.style.display = 'none';

        this.overlay.innerHTML = `
            <div class="location-modal-card" role="dialog" aria-modal="true" aria-labelledby="locModalTitle">
                <!-- Modal Header -->
                <div class="loc-modal-header">
                    <div class="loc-header-title-group">
                        <div class="loc-header-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                            </svg>
                        </div>
                        <div>
                            <h2 id="locModalTitle" class="loc-modal-title">Global Location Selector</h2>
                            <div class="loc-modal-subtitle">Flat projected equirectangular world map • Search 350+ cities or click anywhere on Earth</div>
                        </div>
                    </div>
                    <button class="loc-modal-close" id="btnLocClose" title="Close Modal (Esc)">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <!-- Modal Body: Search & Interactive Map -->
                <div class="loc-modal-body">
                    <!-- Search & Filter Bar -->
                    <div class="loc-search-row">
                        <div class="loc-search-input-wrap">
                            <svg class="loc-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input type="text" id="locCitySearch" class="loc-search-input" placeholder="Type city, state, or country (e.g., Tokyo, London, Chicago, Denver)..." autocomplete="off" spellcheck="false">
                            <button class="loc-search-clear" id="btnLocClear" style="display:none;" title="Clear search">✕</button>
                            <!-- Autocomplete Dropdown List -->
                            <div class="loc-dropdown-list" id="locDropdownList" style="display:none;"></div>
                        </div>

                        <!-- Category Filter Chips -->
                        <div class="loc-filter-chips">
                            <button class="loc-chip active" data-filter="all">All (${CITIES_DATABASE.length})</button>
                            <button class="loc-chip" data-filter="world">World Top 100</button>
                            <button class="loc-chip" data-filter="us">US 50 States (Top 5)</button>
                        </div>
                    </div>

                    <!-- Map Container with SVG World Map & Canvas Overlay -->
                    <div class="loc-map-wrapper">
                        <div class="loc-map-container" id="locMapContainer">
                            <canvas id="locMapCanvas" class="loc-map-canvas"></canvas>
                            <div class="loc-map-crosshair" id="locCrosshair">
                                <div class="loc-pin-pulse"></div>
                                <div class="loc-pin-point"></div>
                                <div class="loc-pin-label" id="locPinLabel">Santa Fe (35.7° N, 105.9° W)</div>
                            </div>
                            <div class="loc-map-tooltip" id="locMapTooltip" style="display: none;"></div>
                        </div>

                        <!-- Map Graticule Legend Overlay -->
                        <div class="loc-map-legend">
                            <span>Equirectangular Projection (Plate Carrée)</span>
                            <div class="loc-legend-badges">
                                <span class="badge-line cancer">23.5°N Tropic of Cancer</span>
                                <span class="badge-line equator">0° Equator</span>
                                <span class="badge-line capricorn">23.5°S Tropic of Capricorn</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer Status & Confirmation Bar -->
                <div class="loc-modal-footer">
                    <div class="loc-status-readout">
                        <span class="loc-status-label">Active Coordinates:</span>
                        <span class="loc-status-coords" id="locStatusCoords">35.69° N, 105.94° W</span>
                        <span class="loc-status-name" id="locStatusName">Santa Fe, NM, USA</span>
                    </div>
                    <div class="loc-footer-actions">
                        <button class="loc-btn secondary" id="btnLocCancel">Cancel</button>
                        <button class="loc-btn primary" id="btnLocApply">Set Location</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // References for Desktop Modal
        this.searchInput = this.overlay.querySelector('#locCitySearch');
        this.btnClear = this.overlay.querySelector('#btnLocClear');
        this.dropdownList = this.overlay.querySelector('#locDropdownList');
        this.chipButtons = this.overlay.querySelectorAll('.loc-chip');
        this.mapContainer = this.overlay.querySelector('#locMapContainer');
        this.mapCanvas = this.overlay.querySelector('#locMapCanvas');
        this.crosshair = this.overlay.querySelector('#locCrosshair');
        this.pinLabel = this.overlay.querySelector('#locPinLabel');
        this.mapTooltip = this.overlay.querySelector('#locMapTooltip');
        this.statusCoords = this.overlay.querySelector('#locStatusCoords');
        this.statusName = this.overlay.querySelector('#locStatusName');
        this.btnApply = this.overlay.querySelector('#btnLocApply');
        this.btnCancel = this.overlay.querySelector('#btnLocCancel');
        this.btnClose = this.overlay.querySelector('#btnLocClose');
    }

    initMobileDom() {
        const mobileContainer = document.getElementById('mobileLocationContainer');
        if (!mobileContainer) return;

        mobileContainer.innerHTML = `
                <!-- Search Row (Clean Search Bar without chips on mobile) -->
                <div class="loc-search-row">
                    <div class="loc-search-input-wrap">
                        <svg class="loc-search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" id="locCitySearchMobile" class="loc-search-input" placeholder="Search 350+ cities..." autocomplete="off" spellcheck="false">
                        <button class="loc-search-clear" id="btnLocClearMobile" style="display:none;" title="Clear search">✕</button>
                        <div class="loc-dropdown-list" id="locDropdownListMobile" style="display:none;"></div>
                    </div>
                </div>

                <!-- World Map Container -->
                <div class="mobile-loc-map-wrapper" id="locMapContainerMobile">
                    <canvas id="locMapCanvasMobile" class="loc-map-canvas"></canvas>
                    <div class="loc-map-crosshair" id="locCrosshairMobile">
                        <div class="loc-pin-pulse"></div>
                        <div class="loc-pin-point"></div>
                        <div class="loc-pin-label" id="locPinLabelMobile">Santa Fe (35.7° N, 105.9° W)</div>
                    </div>
                </div>

                <!-- Active Coordinates Status -->
                <div class="mobile-loc-status">
                    <div class="mobile-loc-status-coords" id="locStatusCoordsMobile">35.69° N, 105.94° W</div>
                    <div class="mobile-loc-status-name" id="locStatusNameMobile">Santa Fe, NM, USA</div>
                </div>
            </div>

            <!-- Quick Season Presets on Mobile Location Page -->
            <div class="mobile-card-section">
                <div class="mobile-section-header">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--accent-sun)" stroke-width="2">
                        <circle cx="12" cy="12" r="5"/>
                        <line x1="12" y1="1" x2="12" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="1" y1="12" x2="3" y2="12"/>
                        <line x1="21" y1="12" x2="23" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                    <h2 class="mobile-section-title">Quick Season Presets</h2>
                </div>
                <div class="mobile-season-grid">
                    <button class="season-btn" data-date="summer">☀️ Summer Solstice</button>
                    <button class="season-btn" data-date="winter">❄️ Winter Solstice</button>
                    <button class="season-btn" data-date="equinox">🌱 Equinox</button>
                    <button class="season-btn" data-date="today">📅 Today</button>
                </div>
            </div>
        `;

        // References for Mobile View
        this.mobileSearchInput = mobileContainer.querySelector('#locCitySearchMobile');
        this.mobileBtnClear = mobileContainer.querySelector('#btnLocClearMobile');
        this.mobileDropdownList = mobileContainer.querySelector('#locDropdownListMobile');
        this.mobileMapContainer = mobileContainer.querySelector('#locMapContainerMobile');
        this.mobileMapCanvas = mobileContainer.querySelector('#locMapCanvasMobile');
        this.mobileCrosshair = mobileContainer.querySelector('#locCrosshairMobile');
        this.mobilePinLabel = mobileContainer.querySelector('#locPinLabelMobile');
        this.mobileStatusCoords = mobileContainer.querySelector('#locStatusCoordsMobile');
        this.mobileStatusName = mobileContainer.querySelector('#locStatusNameMobile');
    }

    setupMap() {
        this.ctx = this.mapCanvas.getContext('2d');
        if (this.mobileMapCanvas) {
            this.mobileCtx = this.mobileMapCanvas.getContext('2d');
        }
    }

    setupEventListeners() {
        // Close modal handlers
        this.btnClose.addEventListener('click', () => this.close());
        this.btnCancel.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // Keydown Esc to close, Arrow keys in search dropdown
        window.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;
            if (e.key === 'Escape') {
                this.close();
            }
        });

        // Search Input live typing
        this.searchInput.addEventListener('input', (e) => {
            this.filterText = e.target.value.trim().toLowerCase();
            this.btnClear.style.display = this.filterText.length > 0 ? 'block' : 'none';
            this.renderDropdown();
            this.renderMap();
        });

        // Search Input focus
        this.searchInput.addEventListener('focus', () => {
            this.renderDropdown();
        });

        // Clear button
        this.btnClear.addEventListener('click', () => {
            this.searchInput.value = '';
            this.filterText = '';
            this.btnClear.style.display = 'none';
            this.renderDropdown();
            this.renderMap();
            this.searchInput.focus();
        });

        // Filter chips (All / World / US)
        this.chipButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.chipButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilterCategory = btn.dataset.filter;
                this.renderDropdown();
                this.renderMap();
            });
        });

        // Map Click to pick coordinates or nearest city
        this.mapContainer.addEventListener('click', (e) => {
            if (e.target.closest('.loc-dropdown-list') || e.target.closest('.loc-search-row')) return;
            const rect = this.mapCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

            // Check if clicked near a city pin (within 8px radius)
            const clickedCity = this.findCityAtScreenPos(x, y, rect.width, rect.height, 9);
            if (clickedCity) {
                this.selectCity(clickedCity);
            } else {
                // Pick exact lat/long
                const { lat, lon } = this.screenToGeo(x, y, rect.width, rect.height);
                this.selectCoordinates(lat, lon, `Custom Coordinates (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`);
            }
        });

        // Map Mousemove for hover tooltip
        this.mapContainer.addEventListener('mousemove', (e) => {
            const rect = this.mapCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
                this.mapTooltip.style.display = 'none';
                return;
            }

            const hoveredCity = this.findCityAtScreenPos(x, y, rect.width, rect.height, 9);
            if (hoveredCity) {
                const displayName = getCityDisplayName(hoveredCity);
                const latStr = `${Math.abs(hoveredCity.lat).toFixed(1)}° ${hoveredCity.lat >= 0 ? 'N' : 'S'}`;
                const lonStr = `${Math.abs(hoveredCity.lon).toFixed(1)}° ${hoveredCity.lon >= 0 ? 'E' : 'W'}`;
                this.mapTooltip.innerHTML = `<strong>${displayName}</strong><br><span style="color: var(--accent-sun);">${latStr}, ${lonStr}</span>`;
                this.mapTooltip.style.left = `${x + 12}px`;
                this.mapTooltip.style.top = `${y - 28}px`;
                this.mapTooltip.style.display = 'block';
                this.mapCanvas.style.cursor = 'pointer';
            } else {
                this.mapTooltip.style.display = 'none';
                this.mapCanvas.style.cursor = 'crosshair';
            }
        });

        this.mapContainer.addEventListener('mouseleave', () => {
            this.mapTooltip.style.display = 'none';
        });

        // Apply Button (Desktop modal)
        this.btnApply.addEventListener('click', () => {
            this.confirmSelection();
        });

        // Resize observer for desktop canvas
        const resizeObserver = new ResizeObserver(() => {
            if (this.isOpen) {
                this.resizeCanvas();
                this.renderMap();
                this.updatePinPosition();
            }
        });
        resizeObserver.observe(this.mapContainer);

        // =========================================================
        // MOBILE EVENT LISTENERS & TOUCH SUPPORT
        // =========================================================
        if (this.mobileSearchInput) {
            this.mobileSearchInput.addEventListener('input', (e) => {
                this.filterText = e.target.value.trim().toLowerCase();
                this.mobileBtnClear.style.display = this.filterText.length > 0 ? 'block' : 'none';
                this.renderDropdown();
                this.renderMap();
            });

            this.mobileSearchInput.addEventListener('focus', () => {
                this.renderDropdown();
            });

            this.mobileBtnClear.addEventListener('click', () => {
                this.mobileSearchInput.value = '';
                this.filterText = '';
                this.mobileBtnClear.style.display = 'none';
                this.renderDropdown();
                this.renderMap();
                this.mobileSearchInput.focus();
            });
        }

        if (this.mobileChipButtons) {
            this.mobileChipButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.mobileChipButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.activeFilterCategory = btn.dataset.filter;
                    this.renderDropdown();
                    this.renderMap();
                });
            });
        }

        if (this.mobileMapContainer && this.mobileMapCanvas) {
            const handleMobileMapTouch = (clientX, clientY) => {
                const rect = this.mobileMapCanvas.getBoundingClientRect();
                const x = clientX - rect.left;
                const y = clientY - rect.top;
                if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

                const clickedCity = this.findCityAtScreenPos(x, y, rect.width, rect.height, 12);
                if (clickedCity) {
                    this.selectCity(clickedCity);
                } else {
                    const { lat, lon } = this.screenToGeo(x, y, rect.width, rect.height);
                    this.selectCoordinates(lat, lon, `Custom (${lat.toFixed(1)}°, ${lon.toFixed(1)}°)`);
                }
                // On mobile, immediately broadcast location selection
                if (this.onLocationSelected) {
                    this.onLocationSelected({
                        latitude: this.currentLat,
                        longitude: this.currentLon,
                        displayName: this.selectedCityName
                    });
                }
            };

            this.mobileMapContainer.addEventListener('click', (e) => {
                if (e.target.closest('.loc-dropdown-list') || e.target.closest('.loc-search-row')) return;
                handleMobileMapTouch(e.clientX, e.clientY);
            });

            this.mobileMapContainer.addEventListener('touchstart', (e) => {
                if (e.touches && e.touches.length > 0) {
                    const t = e.touches[0];
                    handleMobileMapTouch(t.clientX, t.clientY);
                }
            }, { passive: true });

            // Mobile Resize Observer
            const mobileResizeObserver = new ResizeObserver(() => {
                this.resizeMobileCanvas();
                this.renderMap();
                this.updatePinPosition();
            });
            mobileResizeObserver.observe(this.mobileMapContainer);
        }
    }

    onMobileTabActive() {
        // Called when user swipes to or clicks the Location Tab on mobile
        requestAnimationFrame(() => {
            this.resizeMobileCanvas();
            this.renderMap();
            this.updatePinPosition();
            this.updateStatusReadout();
            this.renderDropdown();
        });
    }

    open(currentLat, currentLon, currentLabel = '') {
        this.currentLat = currentLat;
        this.currentLon = currentLon;
        this.selectedCityName = currentLabel || this.findClosestCityName(currentLat, currentLon);
        this.isOpen = true;
        this.overlay.style.display = 'flex';
        this.filterText = '';
        this.searchInput.value = '';
        this.btnClear.style.display = 'none';

        // Render updates
        requestAnimationFrame(() => {
            this.resizeCanvas();
            this.renderMap();
            this.updatePinPosition();
            this.updateStatusReadout();
            this.renderDropdown();
            this.searchInput.focus();
        });
    }

    close() {
        this.isOpen = false;
        this.overlay.style.display = 'none';
        this.dropdownList.style.display = 'none';
        if (this.mobileDropdownList) this.mobileDropdownList.style.display = 'none';
    }

    confirmSelection() {
        if (this.onLocationSelected) {
            this.onLocationSelected({
                latitude: this.currentLat,
                longitude: this.currentLon,
                displayName: this.selectedCityName
            });
        }
        this.close();
    }

    selectCity(city) {
        this.currentLat = city.lat;
        this.currentLon = city.lon;
        this.selectedCityName = getCityDisplayName(city);
        if (this.searchInput) this.searchInput.value = this.selectedCityName;
        if (this.mobileSearchInput) this.mobileSearchInput.value = this.selectedCityName;
        if (this.dropdownList) this.dropdownList.style.display = 'none';
        if (this.mobileDropdownList) this.mobileDropdownList.style.display = 'none';
        this.renderMap();
        this.updatePinPosition();
        this.updateStatusReadout();

        // Broadcast if mobile mode
        if (!this.isOpen && this.onLocationSelected) {
            this.onLocationSelected({
                latitude: this.currentLat,
                longitude: this.currentLon,
                displayName: this.selectedCityName
            });
        }
    }

    selectCoordinates(lat, lon, label) {
        this.currentLat = parseFloat(lat.toFixed(4));
        this.currentLon = parseFloat(lon.toFixed(4));
        this.selectedCityName = label || `${this.formatCoord(this.currentLat, true)}, ${this.formatCoord(this.currentLon, false)}`;
        if (this.dropdownList) this.dropdownList.style.display = 'none';
        if (this.mobileDropdownList) this.mobileDropdownList.style.display = 'none';
        this.renderMap();
        this.updatePinPosition();
        this.updateStatusReadout();

        // Broadcast if mobile mode
        if (!this.isOpen && this.onLocationSelected) {
            this.onLocationSelected({
                latitude: this.currentLat,
                longitude: this.currentLon,
                displayName: this.selectedCityName
            });
        }
    }

    formatCoord(val, isLat) {
        const abs = Math.abs(val).toFixed(2);
        if (isLat) {
            return `${abs}° ${val >= 0 ? 'N' : 'S'}`;
        }
        return `${abs}° ${val >= 0 ? 'E' : 'W'}`;
    }

    updateStatusReadout() {
        const coordStr = `${this.formatCoord(this.currentLat, true)}, ${this.formatCoord(this.currentLon, false)}`;
        if (this.statusCoords) this.statusCoords.textContent = coordStr;
        if (this.statusName) this.statusName.textContent = this.selectedCityName;
        if (this.pinLabel) this.pinLabel.textContent = `${this.selectedCityName} (${coordStr})`;

        if (this.mobileStatusCoords) this.mobileStatusCoords.textContent = coordStr;
        if (this.mobileStatusName) this.mobileStatusName.textContent = this.selectedCityName;
        if (this.mobilePinLabel) this.mobilePinLabel.textContent = `${this.selectedCityName} (${coordStr})`;
    }

    updatePinPosition() {
        // Desktop Pin
        if (this.mapCanvas && this.crosshair) {
            const rect = this.mapCanvas.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                const { x, y } = this.geoToScreen(this.currentLat, this.currentLon, rect.width, rect.height);
                this.crosshair.style.left = `${x}px`;
                this.crosshair.style.top = `${y}px`;
            }
        }

        // Mobile Pin
        if (this.mobileMapCanvas && this.mobileCrosshair) {
            const rect = this.mobileMapCanvas.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                const { x, y } = this.geoToScreen(this.currentLat, this.currentLon, rect.width, rect.height);
                this.mobileCrosshair.style.left = `${x}px`;
                this.mobileCrosshair.style.top = `${y}px`;
            }
        }
    }

    resizeMobileCanvas() {
        if (!this.mobileMapCanvas || !this.mobileMapContainer) return;
        const rect = this.mobileMapContainer.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);

        if (width <= 0 || height <= 0) return;

        this.mobileMapCanvas.width = width * dpr;
        this.mobileMapCanvas.height = height * dpr;
        this.mobileMapCanvas.style.width = `${width}px`;
        this.mobileMapCanvas.style.height = `${height}px`;

        if (this.mobileCtx) {
            this.mobileCtx.setTransform(1, 0, 0, 1, 0, 0);
            this.mobileCtx.scale(dpr, dpr);
        }
    }

    geoToScreen(lat, lon, width, height) {
        // Equirectangular projection
        const x = ((lon + 180) / 360) * width;
        const y = ((90 - lat) / 180) * height;
        return { x, y };
    }

    screenToGeo(x, y, width, height) {
        const lon = (x / width) * 360 - 180;
        const lat = 90 - (y / height) * 180;
        return { lat, lon };
    }

    findCityAtScreenPos(screenX, screenY, width, height, thresholdRadius = 8) {
        const filtered = this.getFilteredCities();
        for (const city of filtered) {
            const { x, y } = this.geoToScreen(city.lat, city.lon, width, height);
            const dist = Math.hypot(screenX - x, screenY - y);
            if (dist <= thresholdRadius) {
                return city;
            }
        }
        return null;
    }

    findClosestCityName(lat, lon) {
        let closest = null;
        let minDist = Infinity;
        for (const city of CITIES_DATABASE) {
            const d = Math.hypot(city.lat - lat, city.lon - lon);
            if (d < minDist) {
                minDist = d;
                closest = city;
            }
        }
        if (closest && minDist < 0.8) {
            return getCityDisplayName(closest);
        }
        return `${this.formatCoord(lat, true)}, ${this.formatCoord(lon, false)}`;
    }

    getFilteredCities() {
        return CITIES_DATABASE.filter(city => {
            // Category filter
            if (this.activeFilterCategory === 'world' && city.category !== 'world') return false;
            if (this.activeFilterCategory === 'us' && city.category !== 'us') return false;

            // Search query filter
            if (!this.filterText) return true;
            const fullStr = `${city.name} ${city.state || ''} ${city.country}`.toLowerCase();
            return fullStr.includes(this.filterText);
        });
    }

    renderDropdown() {
        // Dropdown only appears once the search bar is being actively typed into
        if (!this.filterText || this.filterText.trim().length === 0) {
            if (this.dropdownList) this.dropdownList.style.display = 'none';
            if (this.mobileDropdownList) this.mobileDropdownList.style.display = 'none';
            return;
        }

        const filtered = this.getFilteredCities();
        const maxItems = 12;
        const itemsToDisplay = filtered.slice(0, maxItems);

        let html = '';
        if (filtered.length === 0) {
            html = `<div class="loc-dropdown-empty">No cities matching "${this.filterText}". Click map to pick custom coordinates.</div>`;
        } else {
            itemsToDisplay.forEach((city, index) => {
                const displayName = getCityDisplayName(city);
                const isMatch = displayName.toLowerCase() === this.selectedCityName.toLowerCase();
                const badgeType = city.category === 'us' ? (city.state || 'US') : 'Global';
                const latStr = `${Math.abs(city.lat).toFixed(1)}°${city.lat >= 0 ? 'N' : 'S'}`;
                const lonStr = `${Math.abs(city.lon).toFixed(1)}°${city.lon >= 0 ? 'E' : 'W'}`;

                html += `
                    <div class="loc-dropdown-item ${isMatch ? 'active' : ''}" data-index="${index}">
                        <div class="loc-item-left">
                            <span class="loc-item-tag ${city.category === 'us' ? 'us' : 'world'}">${badgeType}</span>
                            <span class="loc-item-name">${displayName}</span>
                        </div>
                        <span class="loc-item-coords">${latStr}, ${lonStr}</span>
                    </div>
                `;
            });

            if (filtered.length > maxItems) {
                html += `<div class="loc-dropdown-footer">Showing top ${maxItems} of ${filtered.length} matching cities...</div>`;
            }
        }

        // Render Desktop Dropdown
        if (this.dropdownList) {
            this.dropdownList.innerHTML = html;
            this.dropdownList.style.display = 'block';
            this.dropdownList.querySelectorAll('.loc-dropdown-item').forEach(el => {
                el.addEventListener('click', () => {
                    const idx = parseInt(el.dataset.index, 10);
                    if (itemsToDisplay[idx]) this.selectCity(itemsToDisplay[idx]);
                });
            });
        }

        // Render Mobile Dropdown
        if (this.mobileDropdownList) {
            this.mobileDropdownList.innerHTML = html;
            this.mobileDropdownList.style.display = 'block';
            this.mobileDropdownList.querySelectorAll('.loc-dropdown-item').forEach(el => {
                el.addEventListener('click', () => {
                    const idx = parseInt(el.dataset.index, 10);
                    if (itemsToDisplay[idx]) this.selectCity(itemsToDisplay[idx]);
                });
            });
        }
    }

    resizeCanvas() {
        const rect = this.mapContainer.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const dpr = window.devicePixelRatio || 1;
        this.mapCanvas.width = rect.width * dpr;
        this.mapCanvas.height = rect.height * dpr;
        this.ctx.resetTransform();
        this.ctx.scale(dpr, dpr);
    }

    renderMap() {
        // 1. Render Desktop Canvas
        if (this.mapCanvas && this.ctx) {
            const rect = this.mapCanvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            if (width > 0 && height > 0) {
                const ctx = this.ctx;
                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = '#0f131a';
                ctx.fillRect(0, 0, width, height);
                this.drawGraticule(ctx, width, height);
                this.drawWorldContinents(ctx, width, height);
                this.drawCityNodes(ctx, width, height);
            }
        }

        // 2. Render Mobile Canvas
        if (this.mobileMapCanvas && this.mobileCtx) {
            const rect = this.mobileMapCanvas.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            if (width > 0 && height > 0) {
                const ctx = this.mobileCtx;
                ctx.clearRect(0, 0, width, height);
                ctx.fillStyle = '#0f131a';
                ctx.fillRect(0, 0, width, height);
                this.drawGraticule(ctx, width, height);
                this.drawWorldContinents(ctx, width, height);
                this.drawCityNodes(ctx, width, height);
            }
        }
    }

    drawGraticule(ctx, width, height) {
        ctx.save();
        ctx.lineWidth = 1;

        // Longitude Meridians every 30°
        ctx.strokeStyle = '#1a202c';
        for (let lon = -180; lon <= 180; lon += 30) {
            const x = ((lon + 180) / 360) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Prime Meridian (0°)
        const primeX = (180 / 360) * width;
        ctx.strokeStyle = '#2d3748';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(primeX, 0);
        ctx.lineTo(primeX, height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Latitude Parallels every 30°
        ctx.strokeStyle = '#1a202c';
        for (let lat = -60; lat <= 60; lat += 30) {
            const y = ((90 - lat) / 180) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Equator (0°) - Highlighted Amber
        const equatorY = (90 / 180) * height;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(0, equatorY);
        ctx.lineTo(width, equatorY);
        ctx.stroke();

        // Tropic of Cancer (23.5° N) & Capricorn (23.5° S) - Dashed Cyan / Orange
        ctx.setLineDash([3, 4]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)'; // Cancer
        const cancerY = ((90 - 23.5) / 180) * height;
        ctx.beginPath();
        ctx.moveTo(0, cancerY);
        ctx.lineTo(width, cancerY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(251, 146, 60, 0.35)'; // Capricorn
        const capricornY = ((90 - (-23.5)) / 180) * height;
        ctx.beginPath();
        ctx.moveTo(0, capricornY);
        ctx.lineTo(width, capricornY);
        ctx.stroke();

        // Arctic & Antarctic Circles (66.5° N & S)
        ctx.strokeStyle = 'rgba(156, 163, 175, 0.2)';
        const arcticY = ((90 - 66.5) / 180) * height;
        const antarcticY = ((90 - (-66.5)) / 180) * height;
        ctx.beginPath();
        ctx.moveTo(0, arcticY); ctx.lineTo(width, arcticY);
        ctx.moveTo(0, antarcticY); ctx.lineTo(width, antarcticY);
        ctx.stroke();

        ctx.restore();
    }

    drawWorldContinents(ctx, width, height) {
        ctx.save();
        ctx.fillStyle = '#1c2330';
        ctx.strokeStyle = '#384457';
        ctx.lineWidth = 1.0;

        WORLD_CONTINENTS_COORDS.forEach(poly => {
            if (poly.length < 3) return;

            // Convert to screen points
            const pts = poly.map(pt => this.geoToScreen(pt[1], pt[0], width, height));

            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 0; i < pts.length - 1; i++) {
                const xc = (pts[i].x + pts[i + 1].x) / 2;
                const yc = (pts[i].y + pts[i + 1].y) / 2;
                ctx.quadraticCurveTo(pts[i].x, pts[i].y, xc, yc);
            }
            const last = pts[pts.length - 1];
            const first = pts[0];
            ctx.quadraticCurveTo(last.x, last.y, (last.x + first.x) / 2, (last.y + first.y) / 2);
            ctx.quadraticCurveTo(first.x, first.y, pts[0].x, pts[0].y);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();
        });

        ctx.restore();
    }

    drawCityNodes(ctx, width, height) {
        ctx.save();
        const filtered = this.getFilteredCities();

        filtered.forEach(city => {
            const { x, y } = this.geoToScreen(city.lat, city.lon, width, height);
            const isSelected = Math.abs(city.lat - this.currentLat) < 0.05 && Math.abs(city.lon - this.currentLon) < 0.05;

            ctx.beginPath();
            ctx.arc(x, y, isSelected ? 4.5 : 2.2, 0, Math.PI * 2);

            if (isSelected) {
                ctx.fillStyle = '#f59e0b';
                ctx.shadowColor = '#f59e0b';
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
            } else if (city.category === 'world') {
                ctx.fillStyle = '#60a5fa'; // Bright blue for world megacities
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.fill();
            } else {
                ctx.fillStyle = '#9ca3af'; // Muted silver for US state cities
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.fill();
            }
        });

        ctx.restore();
    }
}

