/**
 * settingsModal.js
 * Comprehensive Settings Modal & Mobile Tab Controller:
 * - Theme Engine (Light / Dark Mode)
 * - Building Color Picker (Color wheel + Swatches)
 * - Annotations & Labels (Hour & Solstice/Equinox labels toggle, Dimensions & Area)
 * - Measurement Units (Metric vs Customary)
 * - Display Options (Month curves, Analemmas, Transparent buildings, Viewport scale)
 */

export class SettingsModal {
    constructor(getAppState, onSettingChange) {
        this.getAppState = typeof getAppState === 'function' ? getAppState : () => ({});
        this.onSettingChange = typeof onSettingChange === 'function' ? onSettingChange : () => {};
        this.isOpen = false;

        this.presetColors = [
            { name: 'Pure White', hex: '#ffffff' },
            { name: 'Studio Off-White', hex: '#f1f5f9' },
            { name: 'Warm Sand', hex: '#fde68a' },
            { name: 'Terracotta', hex: '#f87171' },
            { name: 'Sage Green', hex: '#86efac' },
            { name: 'Slate Blue', hex: '#93c5fd' },
            { name: 'Charcoal', hex: '#334155' }
        ];

        this.initDom();
        this.setupEventListeners();
    }

    initDom() {
        // Desktop Floating Blur Modal Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'settings-modal-overlay';
        this.overlay.style.display = 'none';

        this.overlay.innerHTML = `
            <div class="settings-modal-card" role="dialog" aria-modal="true" aria-labelledby="settingsModalTitle">
                <!-- Modal Header -->
                <div class="settings-modal-header">
                    <div class="settings-header-title-group">
                        <div class="settings-header-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                        </div>
                        <div>
                            <h2 id="settingsModalTitle" class="settings-modal-title">Settings</h2>
                            <div class="settings-modal-subtitle">Appearance, building colors, annotation labels, and display options</div>
                        </div>
                    </div>
                    <button class="settings-modal-close" id="btnSettingsClose" title="Close Settings (Esc)">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <!-- Modal Body -->
                <div class="settings-modal-body">
                    <!-- SECTION 1: Building Color -->
                    <div class="settings-section">
                        <h3 class="settings-section-title">
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                            </svg>
                            Building Footprint Color
                        </h3>
                        <div class="color-picker-container">
                            <div class="color-picker-wheel-row">
                                <label class="color-picker-label" title="Click to open color picker wheel">
                                    <input type="color" id="inputHouseColor" class="house-color-input" value="#ffffff">
                                    <span class="color-preview-swatch" id="colorPreviewSwatch" style="background-color: #ffffff;"></span>
                                </label>
                                <div class="color-meta-info">
                                    <span class="color-hex-val" id="colorHexReadout">#FFFFFF</span>
                                    <span class="color-hint">Color wheel & presets</span>
                                </div>
                            </div>
                            <div class="color-presets-row" id="colorPresetsRow">
                                ${this.presetColors.map(c => `
                                    <button type="button" class="color-preset-btn ${c.hex === '#ffffff' ? 'active' : ''}" data-hex="${c.hex}" title="${c.name}" style="background-color: ${c.hex};">
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- SECTION 3: Measurement Units -->
                    <div class="settings-section">
                        <h3 class="settings-section-title">
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            </svg>
                            Measurement Units
                        </h3>
                        <div class="unit-toggle-chips">
                            <button type="button" class="unit-chip" data-unit="metric" id="btnSettingsMetric">
                                <span class="unit-chip-title">Meters (M)</span>
                                <span class="unit-chip-sub">Metric • m, m²</span>
                            </button>
                            <button type="button" class="unit-chip active" data-unit="customary" id="btnSettingsCustomary">
                                <span class="unit-chip-title">Feet & Inches (Ft In)</span>
                                <span class="unit-chip-sub">Imperial / US • ft, sq ft</span>
                            </button>
                        </div>
                    </div>

                    <!-- SECTION 4: Labels & Annotations -->
                    <div class="settings-section">
                        <h3 class="settings-section-title">
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
                            </svg>
                            Labels & Annotations
                        </h3>
                        <div class="settings-toggles-list">
                            <label class="settings-toggle-row">
                                <input type="checkbox" id="chkSettingHourLabels" checked>
                                <span class="settings-switch"></span>
                                <div class="toggle-text-wrap">
                                    <span class="toggle-main-label">Hour & Solstice/Equinox Labels</span>
                                    <span class="toggle-sub-label">Show time tags on analemmas and season badges</span>
                                </div>
                            </label>
                            <label class="settings-toggle-row">
                                <input type="checkbox" id="chkSettingDimensions">
                                <span class="settings-switch"></span>
                                <div class="toggle-text-wrap">
                                    <span class="toggle-main-label">Massing Dimensions & Area</span>
                                    <span class="toggle-sub-label">Display edge measurements and square footage</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- SECTION 5: Solar Geometry & Display -->
                    <div class="settings-section">
                        <h3 class="settings-section-title">
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 12l7-7"/>
                            </svg>
                            Solar Geometry & Viewport
                        </h3>
                        <div class="settings-toggles-list">
                            <label class="settings-toggle-row">
                                <input type="checkbox" id="chkSettingMonths" checked>
                                <span class="settings-switch"></span>
                                <div class="toggle-text-wrap">
                                    <span class="toggle-main-label">Annual Month Curves</span>
                                    <span class="toggle-sub-label">Render 12 monthly solar trajectories</span>
                                </div>
                            </label>
                            <label class="settings-toggle-row">
                                <input type="checkbox" id="chkSettingAnalemmas" checked>
                                <span class="settings-switch"></span>
                                <div class="toggle-text-wrap">
                                    <span class="toggle-main-label">Analemma Hour Curves</span>
                                    <span class="toggle-sub-label">Display figure-8 sun position paths</span>
                                </div>
                            </label>
                            <label class="settings-toggle-row">
                                <input type="checkbox" id="chkSettingTransparent" checked>
                                <span class="settings-switch"></span>
                                <div class="toggle-text-wrap">
                                    <span class="toggle-main-label">Transparent Massings</span>
                                    <span class="toggle-sub-label">Allow solar curves to show through buildings</span>
                                </div>
                            </label>
                        </div>

                        <!-- Scale Slider -->
                        <div class="settings-slider-box">
                            <div class="settings-slider-header">
                                <span class="settings-slider-title">Viewport Zoom Scale</span>
                                <span class="settings-slider-val" id="settingsZoomVal">1.0×</span>
                            </div>
                            <input type="range" id="settingsZoomSlider" min="0.1" max="2.6" step="0.02" value="1.0" class="custom-range">
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);
    }

    setupEventListeners() {
        // Close Buttons & Backdrop
        const btnClose = this.overlay.querySelector('#btnSettingsClose');
        if (btnClose) {
            btnClose.addEventListener('click', () => this.close());
        }

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Building Color Picker Input
        const houseColorInput = document.getElementById('inputHouseColor');
        const houseColorInputMobile = document.getElementById('inputHouseColorMobile');
        
        const handleColorInput = (color) => {
            this.onSettingChange('houseColor', color);
        };

        if (houseColorInput) {
            houseColorInput.addEventListener('input', (e) => handleColorInput(e.target.value));
        }
        if (houseColorInputMobile) {
            houseColorInputMobile.addEventListener('input', (e) => handleColorInput(e.target.value));
        }

        // Color Presets
        document.querySelectorAll('.color-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const hex = btn.getAttribute('data-hex');
                this.onSettingChange('houseColor', hex);
            });
        });

        // Units Chips (Desktop Modal & Mobile Tab)
        document.querySelectorAll('.unit-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const unit = chip.getAttribute('data-unit');
                this.onSettingChange('unitSystem', unit);
            });
        });

        // Toggles (Desktop & Mobile)
        const bindToggle = (idDesktop, idMobile, key) => {
            const elD = document.getElementById(idDesktop);
            const elM = document.getElementById(idMobile);
            if (elD) {
                elD.addEventListener('change', (e) => {
                    this.onSettingChange(key, e.target.checked);
                });
            }
            if (elM) {
                elM.addEventListener('change', (e) => {
                    this.onSettingChange(key, e.target.checked);
                });
            }
        };

        bindToggle('chkSettingHourLabels', 'chkSettingHourLabelsMobile', 'showHourAndEventLabels');
        bindToggle('chkSettingDimensions', 'chkSettingDimensionsMobile', 'showDimensions');
        bindToggle('chkSettingMonths', 'chkSettingMonthsMobile', 'showAllMonths');
        bindToggle('chkSettingAnalemmas', 'chkSettingAnalemmasMobile', 'showAnalemmas');
        bindToggle('chkSettingTransparent', 'chkSettingTransparentMobile', 'transparentMassings');

        // Zoom Slider (Desktop & Mobile)
        const zoomSlider = document.getElementById('settingsZoomSlider');
        const zoomSliderMobile = document.getElementById('settingsZoomSliderMobile');
        if (zoomSlider) {
            zoomSlider.addEventListener('input', (e) => {
                this.onSettingChange('zoomScale', parseFloat(e.target.value));
            });
        }
        if (zoomSliderMobile) {
            zoomSliderMobile.addEventListener('input', (e) => {
                this.onSettingChange('zoomScale', parseFloat(e.target.value));
            });
        }
    }

    open() {
        this.isOpen = true;
        this.overlay.style.display = 'flex';
        requestAnimationFrame(() => {
            this.overlay.classList.add('active');
            this.syncUiWithState();
        });
    }

    close() {
        this.isOpen = false;
        this.overlay.classList.remove('active');
        setTimeout(() => {
            if (!this.isOpen) {
                this.overlay.style.display = 'none';
            }
        }, 200);
    }

    syncUiWithState(externalState) {
        const state = externalState || (typeof this.getAppState === 'function' ? this.getAppState() : null);
        if (!state) return;

        // House Color
        const houseColor = state.houseColor || '#ffffff';
        const colorInput = document.getElementById('inputHouseColor');
        const colorInputMobile = document.getElementById('inputHouseColorMobile');
        const previewSwatch = document.getElementById('colorPreviewSwatch');
        const previewSwatchMobile = document.getElementById('colorPreviewSwatchMobile');
        const hexReadout = document.getElementById('colorHexReadout');
        const hexReadoutMobile = document.getElementById('colorHexReadoutMobile');

        if (colorInput) colorInput.value = houseColor;
        if (colorInputMobile) colorInputMobile.value = houseColor;
        if (previewSwatch) previewSwatch.style.backgroundColor = houseColor;
        if (previewSwatchMobile) previewSwatchMobile.style.backgroundColor = houseColor;
        if (hexReadout) hexReadout.textContent = houseColor.toUpperCase();
        if (hexReadoutMobile) hexReadoutMobile.textContent = houseColor.toUpperCase();

        document.querySelectorAll('.color-preset-btn').forEach(btn => {
            const h = btn.getAttribute('data-hex');
            btn.classList.toggle('active', h.toLowerCase() === houseColor.toLowerCase());
        });

        // Units Chips
        document.querySelectorAll('.unit-chip').forEach(chip => {
            const u = chip.getAttribute('data-unit');
            chip.classList.toggle('active', u === (state.unitSystem || 'customary'));
        });

        // Checkbox Toggles
        const syncChk = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.checked = !!val;
        };

        syncChk('chkSettingHourLabels', state.showHourAndEventLabels !== false);
        syncChk('chkSettingHourLabelsMobile', state.showHourAndEventLabels !== false);
        syncChk('chkSettingDimensions', state.showDimensions);
        syncChk('chkSettingDimensionsMobile', state.showDimensions);
        syncChk('chkSettingMonths', state.showAllMonths);
        syncChk('chkSettingMonthsMobile', state.showAllMonths);
        syncChk('chkSettingAnalemmas', state.showAnalemmas);
        syncChk('chkSettingAnalemmasMobile', state.showAnalemmas);
        syncChk('chkSettingTransparent', state.transparentMassings);
        syncChk('chkSettingTransparentMobile', state.transparentMassings);

        // Zoom Slider
        const zoomSlider = document.getElementById('settingsZoomSlider');
        const zoomVal = document.getElementById('settingsZoomVal');
        const zoomSliderMobile = document.getElementById('settingsZoomSliderMobile');
        const zoomValMobile = document.getElementById('settingsZoomValMobile');
        const valStr = `${(state.zoomScale || 1.0).toFixed(2)}×`;

        if (zoomSlider) zoomSlider.value = state.zoomScale || 1.0;
        if (zoomVal) zoomVal.textContent = valStr;
        if (zoomSliderMobile) zoomSliderMobile.value = state.zoomScale || 1.0;
        if (zoomValMobile) zoomValMobile.textContent = valStr;
    }
}
