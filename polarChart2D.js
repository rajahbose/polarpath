/**
 * PolarChart2D - Clean, Flat, Monochromatic Canvas-based Polar Solar Path Chart (Plan View)
 * with 4x House Model, Smart Auto-Close with Angle Alignment (90°, 30°, 45°),
 * Move/Drag Massings on 2D Plane, Thicker White Selected Stroke,
 * Metric / Customary Unit Support, and Clean Isolated Analemma Loops.
 */

import { SolarCalc } from './solarCalc.js';

export class PolarChart2D {
    constructor(canvasContainerId, onSelectTimeCallback, onPolygonCompletedCallback, onMassingSelectedCallback, onMassingMovedCallback) {
        this.container = document.getElementById(canvasContainerId);
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'polar-canvas';
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.onSelectTimeCallback = onSelectTimeCallback;
        this.onPolygonCompletedCallback = onPolygonCompletedCallback;
        this.onMassingSelectedCallback = onMassingSelectedCallback;
        this.onMassingMovedCallback = onMassingMovedCallback;

        this.state = {
            date: new Date(),
            latitude: 35.6870,
            longitude: -105.9378,
            showAnalemmas: true,
            showAllMonths: true,
            transparentMassings: true,
            showDimensions: false,
            unitSystem: 'customary', // 'metric' (m, m²) | 'customary' (ft, sq ft)
            isDrawMode: false,
            activePolygon: [],
            hoverPoint: null,
            snappedAngle: null,
            isNearStartNode: false,
            autoCloseCandidate: null,
            massings: [],
            selectedMassingId: null,
            isDraggingMassing: false,
            dragStartPos: null
        };

        // Scale: 1 meter in 3D = 10.0 pixels on 2D canvas at 1.0x zoom
        // On mobile mode, default scale is 0.26 so the 25'x45' house takes exactly ~10% of chart width
        const isMobileMode = typeof window !== 'undefined' && window.innerWidth <= 820;
        this.basePixelsPerMeter = 10.0;
        this.zoomScale = isMobileMode ? 0.26 : 1.0;
        this.pixelsPerMeter = this.basePixelsPerMeter * this.zoomScale;

        // House bounding box in 3D: width = 25 ft (7.62m), length = 45 ft (13.716m)
        this.house3DWidth = 7.62;
        this.house3DLength = 13.716;

        this.allowedAngles = [
            0, 30, 45, 60, 90, 120, 135, 150, 180,
            -30, -45, -60, -90, -120, -135, -150, -180
        ];

        this.setupEventListeners();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.width = rect.width || 500;
        this.height = rect.height || 500;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.ctx.resetTransform?.() || this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);

        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 36;

        this.render();
    }

    updateState(newState) {
        if (newState.zoomScale !== undefined) {
            this.zoomScale = newState.zoomScale;
            this.pixelsPerMeter = this.basePixelsPerMeter * this.zoomScale;
            const massingsList = newState.massings || this.state.massings;
            if (massingsList) {
                massingsList.forEach(m => {
                    if (m.points3D && m.points3D.length > 0) {
                        m.points = m.points3D.map(p => this.world3DToCanvas(p.x, p.z));
                    }
                });
            }
        }
        this.state = { ...this.state, ...newState };
        this.render();
    }

    setDrawMode(enabled) {
        this.state.isDrawMode = enabled;
        this.state.activePolygon = [];
        this.state.snappedAngle = null;
        this.state.isNearStartNode = false;
        this.state.autoCloseCandidate = null;
        this.canvas.style.cursor = enabled ? 'crosshair' : 'default';
        this.render();
    }

    cancelCurrentDrawing() {
        this.state.activePolygon = [];
        this.state.snappedAngle = null;
        this.state.isNearStartNode = false;
        this.state.autoCloseCandidate = null;
        this.render();
    }

    /**
     * Finish polygon with automatic shift/alignment of previous node
     * to strictly maintain 90°, 30°, or 45° angle rules on the closing edge.
     */
    finishCurrentDrawing() {
        const pts = [...this.state.activePolygon];
        if (pts.length < 3) return;

        const alignedPts = this.enforceStrictClosingAngles(pts);

        this.state.activePolygon = [];
        this.state.snappedAngle = null;
        this.state.isNearStartNode = false;
        this.state.autoCloseCandidate = null;

        if (this.onPolygonCompletedCallback) {
            this.onPolygonCompletedCallback(alignedPts);
        }
        this.render();
    }

    /**
     * Enforce strict 90°, 30°, 45° angles on closing edge.
     * Shifts the last node along its approach ray to align with the starting node.
     */
    enforceStrictClosingAngles(pts) {
        if (pts.length < 3) return pts;

        const n = pts.length;
        const p0 = pts[0];
        const pLast = pts[n - 1];
        const pPrev = pts[n - 2];

        // Angle from pLast to p0
        const dxClosing = p0.x - pLast.x;
        const dyClosing = p0.y - pLast.y;
        const rawClosingAngle = Math.atan2(dyClosing, dxClosing) * 180 / Math.PI;

        const closestClosingAngle = this.findClosestAllowedAngle(rawClosingAngle);
        const closingDiff = Math.abs(this.normalizeAngleDiff(rawClosingAngle, closestClosingAngle));

        // If closing angle is already within 1.5 degrees of an allowed angle, snap directly
        if (closingDiff <= 1.5) {
            return pts;
        }

        // Otherwise: Shift pLast along the ray from pPrev so that pLast -> p0 forms an allowed angle
        const angle1 = Math.atan2(pLast.y - pPrev.y, pLast.x - pPrev.x);

        let bestIntersection = null;
        let minDistanceToLast = Infinity;

        this.allowedAngles.forEach(angDeg => {
            const angle2 = angDeg * Math.PI / 180;
            const intPt = this.calculateLineIntersection(pPrev, angle1, p0, angle2);
            if (intPt) {
                const dist = Math.hypot(intPt.x - pLast.x, intPt.y - pLast.y);
                const dotProduct = (intPt.x - pPrev.x) * Math.cos(angle1) + (intPt.y - pPrev.y) * Math.sin(angle1);
                if (dotProduct > 0 && dist < minDistanceToLast) {
                    minDistanceToLast = dist;
                    bestIntersection = intPt;
                }
            }
        });

        if (bestIntersection && minDistanceToLast < 120) {
            pts[n - 1] = { x: bestIntersection.x, y: bestIntersection.y };
        }

        return pts;
    }

    findClosestAllowedAngle(rawAngle) {
        let closest = this.allowedAngles[0];
        let minDiff = 360;
        this.allowedAngles.forEach(ang => {
            let diff = Math.abs(this.normalizeAngleDiff(rawAngle, ang));
            if (diff < minDiff) {
                minDiff = diff;
                closest = ang;
            }
        });
        return closest;
    }

    normalizeAngleDiff(a1, a2) {
        let diff = (a1 - a2 + 180) % 360;
        if (diff < 0) diff += 360;
        return diff - 180;
    }

    calculateLineIntersection(p1, angle1, p2, angle2) {
        const cos1 = Math.cos(angle1), sin1 = Math.sin(angle1);
        const cos2 = Math.cos(angle2), sin2 = Math.sin(angle2);

        const det = cos1 * sin2 - sin1 * cos2;
        if (Math.abs(det) < 1e-4) return null;

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        const t1 = (dx * sin2 - dy * cos2) / det;
        return {
            x: p1.x + t1 * cos1,
            y: p1.y + t1 * sin1
        };
    }

    polarToCanvas(elevation, azimuth) {
        const clampedElevation = Math.max(0, elevation);
        const r = this.radius * (1 - clampedElevation / 90);
        const azRad = azimuth * Math.PI / 180;
        const x = this.centerX + r * Math.sin(azRad);
        const y = this.centerY - r * Math.cos(azRad);
        return { x, y, r };
    }

    canvasToPolar(x, y) {
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const elevation = Math.max(0, 90 * (1 - dist / this.radius));
        let azimuth = Math.atan2(dx, -dy) * 180 / Math.PI;
        if (azimuth < 0) azimuth += 360;

        return { elevation, azimuth, dist };
    }

    canvasTo3DWorld(x, y) {
        const dx = (x - this.centerX) / this.pixelsPerMeter;
        const dz = (y - this.centerY) / this.pixelsPerMeter;
        return { x: dx, z: dz };
    }

    world3DToCanvas(x3D, z3D) {
        return {
            x: this.centerX + x3D * this.pixelsPerMeter,
            y: this.centerY + z3D * this.pixelsPerMeter
        };
    }

    formatLength(meters) {
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
        let isScrubbing = false;

        const getPos = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        this.canvas.addEventListener('mousemove', (e) => {
            const pos = getPos(e);

            // If dragging an existing selected massing
            if (this.state.isDraggingMassing && this.state.selectedMassingId) {
                const dx = pos.x - this.state.dragStartPos.x;
                const dy = pos.y - this.state.dragStartPos.y;
                this.state.dragStartPos = pos;

                const selected = this.state.massings.find(m => m.id === this.state.selectedMassingId);
                if (selected) {
                    selected.points.forEach(p => {
                        p.x += dx;
                        p.y += dy;
                    });
                    if (this.onMassingMovedCallback) {
                        this.onMassingMovedCallback(selected);
                    }
                }
                this.render();
                return;
            }

            if (this.state.isDrawMode) {
                let targetX = pos.x;
                let targetY = pos.y;
                this.state.snappedAngle = null;
                this.state.isNearStartNode = false;
                this.state.autoCloseCandidate = null;

                const pts = this.state.activePolygon;
                if (pts.length > 0) {
                    const startPt = pts[0];
                    const distToStart = Math.hypot(targetX - startPt.x, targetY - startPt.y);

                    if (pts.length >= 3 && distToStart < 22) {
                        this.state.isNearStartNode = true;
                        targetX = startPt.x;
                        targetY = startPt.y;

                        const tempPts = [...pts];
                        const aligned = this.enforceStrictClosingAngles(tempPts);
                        if (aligned.length >= 3) {
                            this.state.autoCloseCandidate = aligned[aligned.length - 1];
                        }
                    } else {
                        const lastPt = pts[pts.length - 1];
                        const dx = targetX - lastPt.x;
                        const dy = targetY - lastPt.y;
                        const dist = Math.hypot(dx, dy);

                        if (dist > 4) {
                            const rawAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                            const closestAngle = this.findClosestAllowedAngle(rawAngle);
                            const diff = Math.abs(this.normalizeAngleDiff(rawAngle, closestAngle));

                            if (diff <= 8.0) {
                                const rad = closestAngle * Math.PI / 180;
                                targetX = lastPt.x + dist * Math.cos(rad);
                                targetY = lastPt.y + dist * Math.sin(rad);
                                this.state.snappedAngle = (closestAngle + 360) % 360;
                            }
                        }
                    }
                }

                this.state.hoverPoint = { x: targetX, y: targetY };
                this.render();
                return;
            }

            // Normal mode
            const hoveredMassing = this.getMassingAtPoint(pos.x, pos.y);
            if (hoveredMassing) {
                this.canvas.style.cursor = 'move';
            } else {
                this.canvas.style.cursor = 'default';
            }

            const polar = this.canvasToPolar(pos.x, pos.y);
            if (polar.dist <= this.radius + 10) {
                this.state.hoverPoint = pos;
                if (isScrubbing && this.onSelectTimeCallback) {
                    this.findClosestTimeToPoint(polar);
                }
            } else {
                this.state.hoverPoint = null;
            }
            this.render();
        });

        this.canvas.addEventListener('mousedown', (e) => {
            const pos = getPos(e);

            if (this.state.isDrawMode) {
                if (this.state.isNearStartNode && this.state.activePolygon.length >= 3) {
                    this.finishCurrentDrawing();
                    return;
                }

                const targetPoint = this.state.hoverPoint || pos;
                this.state.activePolygon.push({ x: targetPoint.x, y: targetPoint.y });
                this.render();
                return;
            }

            // Check if user clicked an existing massing
            const clickedMassing = this.getMassingAtPoint(pos.x, pos.y);
            if (clickedMassing) {
                this.state.selectedMassingId = clickedMassing.id;
                this.state.isDraggingMassing = true;
                this.state.dragStartPos = pos;

                if (this.onMassingSelectedCallback) {
                    this.onMassingSelectedCallback(clickedMassing);
                }
                this.render();
                return;
            } else {
                this.state.selectedMassingId = null;
                if (this.onMassingSelectedCallback) {
                    this.onMassingSelectedCallback(null);
                }
            }

            // Otherwise time scrubbing
            isScrubbing = true;
            const polar = this.canvasToPolar(pos.x, pos.y);
            if (polar.dist <= this.radius + 10 && this.onSelectTimeCallback) {
                this.findClosestTimeToPoint(polar);
            }
        });

        this.canvas.addEventListener('dblclick', () => {
            if (this.state.isDrawMode && this.state.activePolygon.length >= 3) {
                this.finishCurrentDrawing();
            }
        });

        window.addEventListener('mouseup', () => {
            isScrubbing = false;
            this.state.isDraggingMassing = false;
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isDrawMode) {
                this.cancelCurrentDrawing();
            } else if (e.key === 'Enter' && this.state.isDrawMode && this.state.activePolygon.length >= 3) {
                this.finishCurrentDrawing();
            }
        });
    }

    getMassingAtPoint(px, py) {
        for (let i = this.state.massings.length - 1; i >= 0; i--) {
            const m = this.state.massings[i];
            if (this.isPointInsidePolygon({ x: px, y: py }, m.points)) {
                return m;
            }
        }
        return null;
    }

    isPointInsidePolygon(point, vs) {
        let x = point.x, y = point.y;
        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            let xi = vs[i].x, yi = vs[i].y;
            let xj = vs[j].x, yj = vs[j].y;
            let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    calculatePolygonAreaM2(points2D) {
        if (points2D.length < 3) return 0;
        let area = 0;
        for (let i = 0; i < points2D.length; i++) {
            const j = (i + 1) % points2D.length;
            const p1 = this.canvasTo3DWorld(points2D[i].x, points2D[i].y);
            const p2 = this.canvasTo3DWorld(points2D[j].x, points2D[j].y);
            area += p1.x * p2.z - p2.x * p1.z;
        }
        return Math.abs(area) / 2.0;
    }

    findClosestTimeToPoint(polar) {
        const year = this.state.date.getFullYear();
        const month = this.state.date.getMonth();
        const day = this.state.date.getDate();

        let bestMinutes = 12 * 60;
        let minDiff = Infinity;

        for (let m = 0; m <= 24 * 60; m += 2) {
            const h = Math.floor(m / 60);
            const min = m % 60;
            const d = new Date(year, month, day, h, min, 0);
            const pos = SolarCalc.getSolarPosition(d, this.state.latitude, this.state.longitude);
            if (pos.elevation >= 0) {
                const dAz = Math.abs(pos.azimuth - polar.azimuth);
                const azDiff = Math.min(dAz, 360 - dAz);
                const elDiff = Math.abs(pos.elevation - polar.elevation);
                const totalDiff = elDiff * 1.5 + azDiff * 0.8;
                if (totalDiff < minDiff) {
                    minDiff = totalDiff;
                    bestMinutes = m;
                }
            }
        }

        if (minDiff < 30) {
            this.onSelectTimeCallback(bestMinutes);
        }
    }

    render() {
        const { ctx, width, height, centerX, centerY, radius } = this;
        if (!ctx || radius <= 10) return;

        ctx.clearRect(0, 0, width, height);

        // 1. Flat Clean Background
        ctx.fillStyle = '#0d0f12';
        ctx.fillRect(0, 0, width, height);

        // 2. Inner Polar Disk
        ctx.fillStyle = '#12151b';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // 3. Grid
        this.drawGrid();

        // 4. Drawn Polygon Massings & To-Scale Dimensions
        this.drawMassings();

        // 5. Monthly Paths
        if (this.state.showAllMonths && !this.state.isSketchOnlyMode) {
            this.drawMonthlyPaths();
        }

        // 6. Analemmas (clean isolated loops without horizontal chords)
        if (this.state.showAnalemmas && !this.state.isSketchOnlyMode) {
            this.drawAnalemmas();
        }

        // 7. Active Day Path
        if (!this.state.isSketchOnlyMode) {
            this.drawActiveDayPath();
        }

        // 8. Current Sun & Ray
        if (!this.state.isSketchOnlyMode) {
            this.drawCurrentSun();
        }

        // 9. 4x Scaled House Footprint at Center
        this.drawCenterHouse4x();

        // 10. Active Drawing
        if (this.state.isDrawMode) {
            this.drawActiveDrawing();
        }
    }

    drawGrid() {
        const { ctx, centerX, centerY, radius } = this;

        // Concentric elevation circles (0° to 80°)
        const elevations = [0, 10, 20, 30, 40, 50, 60, 70, 80];
        
        elevations.forEach(el => {
            const { r } = this.polarToCanvas(el, 0);
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            
            if (el === 0) {
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = '#475063';
            } else {
                ctx.lineWidth = el % 30 === 0 ? 1.0 : 0.5;
                ctx.strokeStyle = el % 30 === 0 ? '#2a303d' : '#1c212b';
            }
            ctx.stroke();

            if (el > 0 && el < 90) {
                ctx.font = '9px "Roboto Mono", monospace';
                ctx.fillStyle = '#6b7280';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${el}°`, centerX, centerY - r + 8);
            }
        });

        // Azimuth Radial Rays (Every 15°, Cardinal 90° thicker)
        for (let az = 0; az < 360; az += 15) {
            const isMajor = az % 30 === 0;
            const isCardinal = az % 90 === 0;
            const rad = az * Math.PI / 180;

            const xOuter = centerX + radius * Math.sin(rad);
            const yOuter = centerY - radius * Math.cos(rad);

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(xOuter, yOuter);

            if (isCardinal) {
                ctx.lineWidth = 1.0;
                ctx.strokeStyle = '#374151';
            } else if (isMajor) {
                ctx.lineWidth = 0.75;
                ctx.strokeStyle = '#262b36';
            } else {
                ctx.lineWidth = 0.5;
                ctx.strokeStyle = '#181c24';
            }
            ctx.stroke();
        }

        // Perimeter Graduation Ticks in 5° Increments around the outer perimeter
        for (let az = 0; az < 360; az += 5) {
            const is30 = az % 30 === 0;
            const is10 = az % 10 === 0;
            const isCardinal = az % 90 === 0;
            const rad = az * Math.PI / 180;

            // Tick length: 30° = 6px, 10° = 4px, 5° = 2.5px
            const tickLen = is30 ? 6 : (is10 ? 4 : 2.5);

            const xTickStart = centerX + radius * Math.sin(rad);
            const yTickStart = centerY - radius * Math.cos(rad);
            const xTickEnd = centerX + (radius + tickLen) * Math.sin(rad);
            const yTickEnd = centerY - (radius + tickLen) * Math.cos(rad);

            ctx.beginPath();
            ctx.moveTo(xTickStart, yTickStart);
            ctx.lineTo(xTickEnd, yTickEnd);
            
            // Subtle color and lineweight hierarchy
            if (is30) {
                ctx.strokeStyle = '#4b5563';
                ctx.lineWidth = 1.0;
            } else if (is10) {
                ctx.strokeStyle = '#374151';
                ctx.lineWidth = 0.75;
            } else {
                ctx.strokeStyle = '#262b36';
                ctx.lineWidth = 0.5;
            }
            ctx.stroke();

            // Degree Angle Labels at 30° intervals (excluding cardinals N/E/S/W)
            if (is30 && !isCardinal) {
                const xText = centerX + (radius + 15) * Math.sin(rad);
                const yText = centerY - (radius + 15) * Math.cos(rad);
                ctx.font = '8px "Roboto Mono", monospace';
                ctx.fillStyle = '#6b7280';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${az}°`, xText, yText);
            }
        }

        // Cardinal Labels
        const cardinals = [
            { label: 'N', deg: 0, color: '#f3f4f6' },
            { label: 'E', deg: 90, color: '#9ca3af' },
            { label: 'S', deg: 180, color: '#9ca3af' },
            { label: 'W', deg: 270, color: '#9ca3af' }
        ];

        cardinals.forEach(item => {
            const rad = item.deg * Math.PI / 180;
            const x = centerX + (radius + 20) * Math.sin(rad);
            const y = centerY - (radius + 20) * Math.cos(rad);

            ctx.font = 'bold 11px "Roboto", sans-serif';
            ctx.fillStyle = item.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.label, x, y);
        });
    }

    drawContiguousDaylightSegments(points, strokeStyle, lineWidth, isDashed = false) {
        const { ctx } = this;
        const segments = [];
        let currentSegment = [];

        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            if (p.elevation >= 0) {
                if (currentSegment.length > 0) {
                    const prev = currentSegment[currentSegment.length - 1];
                    if (p.timeMinutes !== undefined && prev.timeMinutes !== undefined) {
                        if (Math.abs(p.timeMinutes - prev.timeMinutes) > 15) {
                            segments.push(currentSegment);
                            currentSegment = [];
                        }
                    } else if (p.dayOfYear !== undefined && prev.dayOfYear !== undefined) {
                        if (Math.abs(p.dayOfYear - prev.dayOfYear) > 4) {
                            segments.push(currentSegment);
                            currentSegment = [];
                        }
                    }
                }
                currentSegment.push(p);
            } else {
                if (currentSegment.length > 0) {
                    segments.push(currentSegment);
                    currentSegment = [];
                }
            }
        }
        if (currentSegment.length > 0) segments.push(currentSegment);

        segments.forEach(seg => {
            if (seg.length < 2) return;
            ctx.beginPath();
            if (isDashed) ctx.setLineDash([3, 3]);
            else ctx.setLineDash([]);

            for (let i = 0; i < seg.length; i++) {
                const pt = this.polarToCanvas(seg[i].elevation, seg[i].azimuth);
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            }

            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
            ctx.setLineDash([]);
        });

        return segments;
    }

    drawMonthlyPaths() {
        const { ctx } = this;
        const year = this.state.date.getFullYear();
        const paths = SolarCalc.getKeySolarPaths(year, this.state.latitude, this.state.longitude);

        paths.forEach(path => {
            let strokeColor = path.isEquinox ? '#9ca3af' : (path.isSolstice ? '#6b7280' : '#4b5563');
            let lineW = path.isEquinox ? 1.4 : (path.isSolstice ? 1.2 : 0.9);

            const segments = this.drawContiguousDaylightSegments(path.points, strokeColor, lineW);

            // Solstice & Equinox labels (Only shown on wider desktop screens; omitted on mobile for clean spacing)
            const isMobile = this.width < 520 || (typeof window !== 'undefined' && window.innerWidth <= 820);
            if (!isMobile && segments.length > 0 && segments[0].length > 0) {
                const peak = segments[0].reduce((max, p) => p.elevation > max.elevation ? p : max, segments[0][0]);
                if (peak && peak.elevation > 4) {
                    const pt = this.polarToCanvas(peak.elevation, peak.azimuth);
                    ctx.font = '8px "Roboto", sans-serif';
                    ctx.fillStyle = '#9ca3af';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';
                    
                    let label = '';
                    if (path.name.includes('Jun 21')) label = 'Jun 21 (Solstice)';
                    else if (path.name.includes('Dec 21')) label = 'Dec 21 (Solstice)';
                    else if (path.name.includes('Equinox')) label = 'Mar/Sep 21 (Equinox)';
                    
                    if (label) {
                        ctx.fillText(label, pt.x, pt.y - 3);
                    }
                }
            }
        });
    }

    /**
     * Draw Clean Isolated Analemma Loops (No horizontal connection lines)
     */
    drawAnalemmas() {
        const { ctx } = this;
        const year = this.state.date.getFullYear();
        const hourCurves = SolarCalc.getHourCurves(year, this.state.latitude, this.state.longitude);

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
                ctx.setLineDash([3, 3]);

                for (let i = 0; i < seg.length; i++) {
                    const pt = this.polarToCanvas(seg[i].elevation, seg[i].azimuth);
                    if (i === 0) ctx.moveTo(pt.x, pt.y);
                    else ctx.lineTo(pt.x, pt.y);
                }

                // If this is a closed all-year analemma loop, close it cleanly back to the first point
                if (curve.isClosedLoop && seg.length === curve.points.length) {
                    const firstPt = this.polarToCanvas(seg[0].elevation, seg[0].azimuth);
                    ctx.lineTo(firstPt.x, firstPt.y);
                }

                ctx.strokeStyle = '#374151';
                ctx.lineWidth = 0.8;
                ctx.stroke();
                ctx.setLineDash([]);
            });

            // Hour Label
            if (segments.length > 0 && segments[0].length > 4) {
                const midPt = segments[0][Math.floor(segments[0].length / 2)];
                if (midPt && midPt.elevation > 8) {
                    const pt = this.polarToCanvas(midPt.elevation, midPt.azimuth);
                    ctx.font = '8px "Roboto Mono", monospace';
                    ctx.fillStyle = '#6b7280';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(curve.label, pt.x, pt.y);
                }
            }
        });
    }

    drawActiveDayPath() {
        const activePath = SolarCalc.getDailyPath(this.state.date, this.state.latitude, this.state.longitude, 2);
        this.drawContiguousDaylightSegments(activePath, '#f59e0b', 2.0);
    }

    drawCurrentSun() {
        const { ctx, centerX, centerY } = this;
        const pos = SolarCalc.getSolarPosition(this.state.date, this.state.latitude, this.state.longitude);

        if (pos.elevation < 0) return;

        const sunPt = this.polarToCanvas(pos.elevation, pos.azimuth);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(sunPt.x, sunPt.y);
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Sun Halo Glow Ring (150% larger with aura)
        ctx.save();
        ctx.beginPath();
        ctx.arc(sunPt.x, sunPt.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Outer Sun Core (150% larger: r = 8)
        ctx.beginPath();
        ctx.arc(sunPt.x, sunPt.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.fill();

        // Inner Bright Core (150% larger: r = 4.5)
        ctx.beginPath();
        ctx.arc(sunPt.x, sunPt.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.restore();

        // 2-Line Floating Sun Info Badge: Centered Underneath the Sun Dot/Ring
        const hours = this.state.date.getHours();
        const mins = this.state.date.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayH = hours % 12 === 0 ? 12 : hours % 12;
        const displayM = mins.toString().padStart(2, '0');
        const timeStr = `${displayH}:${displayM} ${period}`;

        const line1 = `${pos.elevation.toFixed(1)}° el | ${pos.azimuth.toFixed(1)}° az`;
        const line2 = timeStr;

        ctx.font = '500 9px "Roboto Mono", monospace';
        const m1 = ctx.measureText(line1);
        ctx.font = '700 9px "Roboto Mono", monospace';
        const m2 = ctx.measureText(line2);
        const tagW = Math.max(m1.width, m2.width) + 16;
        const tagH = 26;
        
        // Center the label horizontally underneath the sun dot
        let tagX = sunPt.x - tagW / 2;
        let tagY = sunPt.y + 18; // Neatly centered below larger sun dot & ring

        // Boundary checks so label stays cleanly within polar viewport
        if (tagX < 8) tagX = 8;
        if (tagX + tagW > this.width - 8) tagX = this.width - tagW - 8;
        if (tagY + tagH > this.height - 8) tagY = sunPt.y - tagH - 18; // Flip above if near bottom edge
        if (tagY < 8) tagY = 8;

        ctx.fillStyle = 'rgba(24, 28, 36, 0.94)';
        ctx.strokeStyle = '#2d3545';
        ctx.lineWidth = 1;
        ctx.fillRect(tagX, tagY, tagW, tagH);
        ctx.strokeRect(tagX, tagY, tagW, tagH);

        // Center aligned text inside badge
        ctx.textAlign = 'center';
        const textCenterX = tagX + tagW / 2;

        // Line 1: Solar angles
        ctx.fillStyle = '#f3f4f6';
        ctx.font = '500 8.5px "Roboto Mono", monospace';
        ctx.textBaseline = 'top';
        ctx.fillText(line1, textCenterX, tagY + 3.5);

        // Line 2: Time of day
        ctx.fillStyle = '#f59e0b';
        ctx.font = '700 8.5px "Roboto Mono", monospace';
        ctx.fillText(line2, textCenterX, tagY + 14.5);
    }

    drawCenterHouse4x() {
        const { ctx, centerX, centerY } = this;
        const w = this.house3DWidth * this.pixelsPerMeter;
        const l = this.house3DLength * this.pixelsPerMeter;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(centerX - w / 2, centerY - l / 2, w, l);

        ctx.strokeStyle = '#0d0f12';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(centerX - w / 2, centerY - l / 2, w, l);

        ctx.strokeStyle = '#262b36';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - l / 2);
        ctx.lineTo(centerX, centerY + l / 2);
        ctx.stroke();
    }

    /**
     * Draw Massings with Thicker White Outline for Selection, Move Cursor,
     * Transparent Mode, and Unit Conversions.
     */
    drawMassings() {
        const { ctx } = this;

        this.state.massings.forEach(m => {
            const isSelected = m.id === this.state.selectedMassingId;
            if (m.points.length < 3) return;

            ctx.beginPath();
            ctx.moveTo(m.points[0].x, m.points[0].y);
            for (let i = 1; i < m.points.length; i++) {
                ctx.lineTo(m.points[i].x, m.points[i].y);
            }
            ctx.closePath();

            // Fill
            if (this.state.transparentMassings) {
                ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.65)' : 'rgba(56, 189, 248, 0.35)';
            } else {
                ctx.fillStyle = isSelected ? 'rgba(245, 158, 11, 0.3)' : 'rgba(226, 232, 240, 0.15)';
            }
            ctx.fill();

            // Stroke: Thicker White Stroke if selected!
            if (isSelected) {
                ctx.lineWidth = 3.0;
                ctx.strokeStyle = '#ffffff';
                ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
                ctx.shadowBlur = 6;
                ctx.stroke();
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
            } else {
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = this.state.transparentMassings ? '#38bdf8' : '#94a3b8';
                ctx.stroke();
            }

            // Centroid
            let cx = 0, cy = 0;
            m.points.forEach(p => { cx += p.x; cy += p.y; });
            cx /= m.points.length;
            cy /= m.points.length;

            const areaM2 = this.calculatePolygonAreaM2(m.points);

            if (this.state.showDimensions) {
                // Centered Area & Height Label
                ctx.font = 'bold 9px "Roboto Mono", monospace';
                ctx.fillStyle = isSelected ? '#ffffff' : (this.state.transparentMassings ? '#38bdf8' : '#f3f4f6');
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`Area: ${this.formatArea(areaM2)}`, cx, cy - 6);
                ctx.fillText(`H: ${this.formatLength(m.height)}`, cx, cy + 6);

                // Draw to-scale dimensions to building leading edge
                this.drawDimensionToHouse(m);
            } else {
                ctx.font = 'bold 9px "Roboto Mono", monospace';
                ctx.fillStyle = isSelected ? '#ffffff' : '#f3f4f6';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`H: ${this.formatLength(m.height)}`, cx, cy);
            }
        });
    }

    /**
     * Draw dimension line between the massing leading edge and the central house
     */
    drawDimensionToHouse(massing) {
        const { ctx, centerX, centerY } = this;

        let bestMassingPt = massing.points[0];
        let bestHousePt = { x: centerX, y: centerY };
        let minDistanceM = Infinity;

        const hHalfW = this.house3DWidth / 2; // 1.8m
        const hHalfL = this.house3DLength / 2; // 2.4m

        massing.points.forEach(p => {
            const w3D = this.canvasTo3DWorld(p.x, p.y);
            const clampedX = Math.max(-hHalfW, Math.min(hHalfW, w3D.x));
            const clampedZ = Math.max(-hHalfL, Math.min(hHalfL, w3D.z));
            const distM = Math.hypot(w3D.x - clampedX, w3D.z - clampedZ);

            if (distM < minDistanceM) {
                minDistanceM = distM;
                bestMassingPt = p;
                bestHousePt = this.world3DToCanvas(clampedX, clampedZ);
            }
        });

        if (minDistanceM > 0.5) {
            ctx.beginPath();
            ctx.moveTo(bestHousePt.x, bestHousePt.y);
            ctx.lineTo(bestMassingPt.x, bestMassingPt.y);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.2;
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]);

            const angle = Math.atan2(bestMassingPt.y - bestHousePt.y, bestMassingPt.x - bestHousePt.x);
            const perpAngle = angle + Math.PI / 2;
            const tickSize = 4;

            [bestHousePt, bestMassingPt].forEach(pt => {
                ctx.beginPath();
                ctx.moveTo(pt.x - tickSize * Math.cos(perpAngle), pt.y - tickSize * Math.sin(perpAngle));
                ctx.lineTo(pt.x + tickSize * Math.cos(perpAngle), pt.y + tickSize * Math.sin(perpAngle));
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            });

            const midX = (bestHousePt.x + bestMassingPt.x) / 2;
            const midY = (bestHousePt.y + bestMassingPt.y) / 2;
            const dimText = this.formatLength(minDistanceM);

            ctx.font = 'bold 8px "Roboto Mono", monospace';
            const textMetrics = ctx.measureText(dimText);
            const bgW = textMetrics.width + 6;
            const bgH = 12;

            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 0.8;
            ctx.fillRect(midX - bgW / 2, midY - bgH / 2, bgW, bgH);
            ctx.strokeRect(midX - bgW / 2, midY - bgH / 2, bgW, bgH);

            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(dimText, midX, midY);
        }
    }

    drawActiveDrawing() {
        const { ctx } = this;
        const pts = this.state.activePolygon;
        const hover = this.state.hoverPoint;

        if (pts.length > 0 && hover) {
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
                ctx.lineTo(pts[i].x, pts[i].y);
            }
            ctx.lineTo(hover.x, hover.y);

            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.8;
            ctx.setLineDash([4, 3]);
            ctx.stroke();
            ctx.setLineDash([]);

            pts.forEach((p, idx) => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, idx === 0 ? 5 : 3.5, 0, Math.PI * 2);
                ctx.fillStyle = idx === 0 ? '#ffffff' : '#f59e0b';
                ctx.strokeStyle = '#0d0f12';
                ctx.lineWidth = 1.5;
                ctx.fill();
                ctx.stroke();
            });

            if (this.state.snappedAngle !== null) {
                ctx.font = '500 9px "Roboto Mono", monospace';
                const angleText = `∠ ${this.state.snappedAngle}° (Snapped)`;
                ctx.fillStyle = '#f59e0b';
                ctx.textAlign = 'left';
                ctx.fillText(angleText, hover.x + 10, hover.y - 10);
            }

            if (this.state.isNearStartNode) {
                ctx.beginPath();
                ctx.arc(pts[0].x, pts[0].y, 9, 0, Math.PI * 2);
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 2.0;
                ctx.stroke();

                if (this.state.autoCloseCandidate) {
                    const c = this.state.autoCloseCandidate;
                    ctx.beginPath();
                    ctx.moveTo(c.x, c.y);
                    ctx.lineTo(pts[0].x, pts[0].y);
                    ctx.strokeStyle = '#22c55e';
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([2, 2]);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    ctx.beginPath();
                    ctx.arc(c.x, c.y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#22c55e';
                    ctx.fill();
                }

                ctx.font = 'bold 10px "Roboto", sans-serif';
                ctx.fillStyle = '#22c55e';
                ctx.textAlign = 'center';
                ctx.fillText('Auto-Close (90°/45°/30° Aligned)', pts[0].x, pts[0].y - 14);
            }
        } else if (hover) {
            ctx.beginPath();
            ctx.arc(hover.x, hover.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fill();
        }
    }
}
