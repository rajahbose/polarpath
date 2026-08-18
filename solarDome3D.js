/**
 * SolarDome3D - Clean, Flat, Monochromatic 3D Celestial Half-Dome, Gable House,
 * Subtle Thinner Solar Pipes, Dynamic 3D Massings with 50% Blue Transparency Mode,
 * Metric / Customary 3D Dimension References, and Isolated Analemma Tubes.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SolarCalc } from './solarCalc.js';

export class SolarDome3D {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.domeRadius = 40;

        this.state = {
            date: new Date(),
            latitude: 35.6870,
            longitude: -105.9378,
            showAnalemmas: true,
            showAllMonths: true,
            showDomeWireframe: true,
            showSunRays: true,
            transparentMassings: true,
            showDimensions: false,
            unitSystem: 'customary',
            theme: 'dark',
            houseColor: '#ffffff',
            massings: []
        };

        this.trajectoryCurvesGroup = new THREE.Group();
        this.analemmaCurvesGroup = new THREE.Group();
        this.activeDayPathGroup = new THREE.Group();
        this.massingsGroup = new THREE.Group();
        this.dimensions3DGroup = new THREE.Group();

        this.house3DWidth = 9.144; // 30 ft
        this.house3DLength = 18.288; // 60 ft

        this.initScene();
        this.buildPolarBase();
        this.buildSimpleGableHouse();
        this.buildCelestialDome();
        this.buildSunObject();
        this.buildCompassIndicators();

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        window.addEventListener('resize', () => this.onResize());
    }

    initScene() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width || 600;
        this.height = rect.height || 600;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0d0f12);

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.5, 1000);
        this.camera.position.set(50, 40, 60);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 + 0.02;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 180;
        this.controls.target.set(0, 1.5, 0);

        // Lighting
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
        this.scene.add(this.ambientLight);

        // Directional Sun Light
        this.sunLight = new THREE.DirectionalLight(0xfff8ee, 2.3);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 160;
        const d = 30;
        this.sunLight.shadow.camera.left = -d;
        this.sunLight.shadow.camera.right = d;
        this.sunLight.shadow.camera.top = d;
        this.sunLight.shadow.camera.bottom = -d;
        this.sunLight.shadow.bias = -0.0005;
        this.scene.add(this.sunLight);
        this.scene.add(this.sunLight.target);

        // Groups
        this.scene.add(this.trajectoryCurvesGroup);
        this.scene.add(this.analemmaCurvesGroup);
        this.scene.add(this.activeDayPathGroup);
        this.scene.add(this.massingsGroup);
        this.scene.add(this.dimensions3DGroup);
    }

    polarToVector3(elevation, azimuth, radius = this.domeRadius) {
        const elRad = elevation * Math.PI / 180;
        const azRad = azimuth * Math.PI / 180;

        const y = radius * Math.sin(elRad);
        const rGround = radius * Math.cos(elRad);
        const x = rGround * Math.sin(azRad);
        const z = -rGround * Math.cos(azRad);

        return new THREE.Vector3(x, y, z);
    }

    buildPolarBase() {
        const groundRadius = 38;
        const isLight = this.state.theme === 'light';

        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        const cx = 512;
        const cy = 512;
        const r = 470;

        ctx.fillStyle = isLight ? '#ffffff' : '#101318';
        ctx.beginPath();
        ctx.arc(cx, cy, 510, 0, Math.PI * 2);
        ctx.fill();

        for (let el = 0; el <= 80; el += 10) {
            const circleR = r * (1 - el / 90);
            ctx.beginPath();
            ctx.arc(cx, cy, circleR, 0, Math.PI * 2);
            if (el === 0) {
                ctx.lineWidth = 3;
                ctx.strokeStyle = isLight ? '#94a3b8' : '#475063';
            } else {
                ctx.lineWidth = el % 30 === 0 ? 1.8 : 1.0;
                ctx.strokeStyle = isLight ? (el % 30 === 0 ? '#cbd5e1' : '#e2e8f0') : (el % 30 === 0 ? '#262b36' : '#181c24');
            }
            ctx.stroke();

            if (el > 0) {
                ctx.font = 'bold 12px "Roboto Mono", monospace';
                ctx.fillStyle = isLight ? '#64748b' : '#6b7280';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                // North segment
                ctx.fillText(`${el}°`, cx, cy - circleR + 14);
                // South segment
                ctx.fillText(`${el}°`, cx, cy + circleR - 14);
            }
        }

        for (let az = 0; az < 360; az += 15) {
            const isMajor = az % 30 === 0;
            const isCardinal = az % 90 === 0;
            const rad = az * Math.PI / 180;
            const xOuter = cx + r * Math.sin(rad);
            const yOuter = cy - r * Math.cos(rad);

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(xOuter, yOuter);

            if (isCardinal) {
                ctx.lineWidth = 2.0;
                ctx.strokeStyle = isLight ? '#94a3b8' : '#374151';
            } else if (isMajor) {
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = isLight ? '#cbd5e1' : '#262b36';
            } else {
                ctx.lineWidth = 0.8;
                ctx.strokeStyle = isLight ? '#e2e8f0' : '#181c24';
            }
            ctx.stroke();

            if (isMajor && !isCardinal) {
                const xT = cx + (r + 20) * Math.sin(rad);
                const yT = cy - (r + 20) * Math.cos(rad);
                ctx.font = '11px "Roboto Mono", monospace';
                ctx.fillStyle = isLight ? '#64748b' : '#6b7280';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${az}°`, xT, yT);
            }
        }

        const cardinals = [
            { label: 'NORTH', deg: 0, color: isLight ? '#0f172a' : '#f3f4f6' },
            { label: 'EAST', deg: 90, color: isLight ? '#475569' : '#9ca3af' },
            { label: 'SOUTH', deg: 180, color: isLight ? '#475569' : '#9ca3af' },
            { label: 'WEST', deg: 270, color: isLight ? '#475569' : '#9ca3af' }
        ];

        cardinals.forEach(c => {
            const rad = c.deg * Math.PI / 180;
            const xT = cx + (r - 34) * Math.sin(rad);
            const yT = cy - (r - 34) * Math.cos(rad);
            ctx.font = 'bold 16px "Roboto", sans-serif';
            ctx.fillStyle = c.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(c.label, xT, yT);
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 4;

        if (this.groundMesh) {
            this.groundMesh.material.map?.dispose();
            this.groundMesh.material.map = texture;
            this.groundMesh.material.needsUpdate = true;
            return;
        }

        const groundGeo = new THREE.CircleGeometry(groundRadius, 64);
        const groundMat = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.9,
            metalness: 0.05,
            side: THREE.DoubleSide
        });

        this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
        this.groundMesh.rotation.x = -Math.PI / 2;
        this.groundMesh.position.y = 0;
        this.groundMesh.receiveShadow = true;
        this.scene.add(this.groundMesh);

        const ringGeo = new THREE.RingGeometry(groundRadius - 0.1, groundRadius + 0.3, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: isLight ? 0x94a3b8 : 0x475063,
            side: THREE.DoubleSide
        });
        const baseRing = new THREE.Mesh(ringGeo, ringMat);
        baseRing.rotation.x = -Math.PI / 2;
        baseRing.position.y = 0.01;
        this.scene.add(baseRing);
    }

    buildSimpleGableHouse() {
        const width = 7.62; // 25 ft
        const wallHeight = 3.048; // 10 ft
        const roofPeakHeight = 1.8288; // 6 ft (total height = 4.8768 m = 16 ft)
        const length = 13.716; // 45 ft
        this.houseTotalHeight = wallHeight + roofPeakHeight;

        const shape = new THREE.Shape();
        shape.moveTo(-width / 2, 0);
        shape.lineTo(width / 2, 0);
        shape.lineTo(width / 2, wallHeight);
        shape.lineTo(0, wallHeight + roofPeakHeight);
        shape.lineTo(-width / 2, wallHeight);
        shape.closePath();

        const extrudeSettings = {
            steps: 1,
            depth: length,
            bevelEnabled: false
        };

        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.center();

        const mat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.25,
            metalness: 0.05
        });

        this.houseMesh = new THREE.Mesh(geo, mat);
        const s = this.state.zoomScale || 1.0;
        this.houseMesh.scale.set(s, s, s);
        this.houseMesh.position.set(0, (this.houseTotalHeight * s) / 2, 0);
        this.houseMesh.castShadow = true;
        this.houseMesh.receiveShadow = true;

        this.scene.add(this.houseMesh);
    }

    buildCelestialDome() {
        const radius = this.domeRadius;
        this.wireframeDomeGroup = new THREE.Group();

        for (let el = 10; el <= 80; el += 10) {
            const pts = [];
            for (let az = 0; az <= 360; az += 4) {
                pts.push(this.polarToVector3(el, az, radius));
            }
            const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const lineMat = new THREE.LineBasicMaterial({
                color: el % 30 === 0 ? 0x475063 : 0x262b36,
                transparent: true,
                opacity: el % 30 === 0 ? 0.35 : 0.15
            });
            const line = new THREE.Line(lineGeo, lineMat);
            this.wireframeDomeGroup.add(line);
        }

        for (let az = 0; az < 360; az += 30) {
            const pts = [];
            for (let el = 0; el <= 90; el += 2) {
                pts.push(this.polarToVector3(el, az, radius));
            }
            const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
            const lineMat = new THREE.LineBasicMaterial({
                color: az % 90 === 0 ? 0x475063 : 0x262b36,
                transparent: true,
                opacity: az % 90 === 0 ? 0.4 : 0.15
            });
            const line = new THREE.Line(lineGeo, lineMat);
            this.wireframeDomeGroup.add(line);
        }

        const zenithPoint = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0x9ca3af })
        );
        zenithPoint.position.set(0, radius, 0);
        this.wireframeDomeGroup.add(zenithPoint);

        this.scene.add(this.wireframeDomeGroup);
    }

    buildSunObject() {
        this.sunGroup = new THREE.Group();

        const sunGeo = new THREE.SphereGeometry(1.2, 24, 24);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
        this.sunGroup.add(this.sunMesh);

        const haloGeo = new THREE.RingGeometry(1.4, 1.8, 32);
        const haloMat = new THREE.MeshBasicMaterial({
            color: 0xf59e0b,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        this.haloMesh = new THREE.Mesh(haloGeo, haloMat);
        this.sunGroup.add(this.haloMesh);

        // Floating Sun Info Badge: ONLY Time of Day, 100% larger in viewport
        this.sunLabelCanvas = document.createElement('canvas');
        this.sunLabelCanvas.width = 512;
        this.sunLabelCanvas.height = 180;
        this.sunLabelCtx = this.sunLabelCanvas.getContext('2d');
        this.sunLabelTexture = new THREE.CanvasTexture(this.sunLabelCanvas);
        this.sunLabelTexture.minFilter = THREE.LinearFilter;
        this.sunLabelTexture.magFilter = THREE.LinearFilter;

        const labelMat = new THREE.SpriteMaterial({
            map: this.sunLabelTexture,
            depthTest: false,
            depthWrite: false,
            transparent: true
        });
        this.sunLabelSprite = new THREE.Sprite(labelMat);
        this.sunLabelSprite.scale.set(6.4, 2.25, 1);
        this.sunLabelSprite.position.set(0, -3.2, 0);
        this.sunLabelSprite.renderOrder = 999;
        this.sunGroup.add(this.sunLabelSprite);
        this.updateSunLabel();

        const rayGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0)
        ]);
        const rayMat = new THREE.LineDashedMaterial({
            color: 0xf59e0b,
            dashSize: 1.0,
            gapSize: 0.8,
            linewidth: 1
        });
        this.sunRayLine = new THREE.Line(rayGeo, rayMat);
        this.sunRayLine.computeLineDistances();
        this.scene.add(this.sunRayLine);

        this.scene.add(this.sunGroup);
    }

    buildCompassIndicators() {
        const cardinals = [
            { text: 'N', az: 0, color: '#f3f4f6' },
            { text: 'E', az: 90, color: '#9ca3af' },
            { text: 'S', az: 180, color: '#9ca3af' },
            { text: 'W', az: 270, color: '#9ca3af' }
        ];

        cardinals.forEach(c => {
            const pos = this.polarToVector3(0, c.az, this.domeRadius + 2.0);
            const sprite = this.createTextSprite(c.text, c.color);
            sprite.position.copy(pos);
            sprite.position.y = 0.8;
            sprite.scale.set(3.5, 3.5, 1);
            this.scene.add(sprite);
        });
    }

    createTextSprite(text, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.font = 'bold 64px "Roboto", sans-serif';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: texture });
        return new THREE.Sprite(mat);
    }

    createDimensionSprite(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.fillRect(8, 8, 240, 64);
        ctx.strokeRect(8, 8, 240, 64);

        ctx.font = 'bold 36px "Roboto Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 40);

        const texture = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(3.6, 1.1, 1);
        return sprite;
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

    updateState(newState) {
        const oldLat = this.state.latitude;
        const oldLon = this.state.longitude;
        const oldDate = this.state.date;
        const oldZoom = this.state.zoomScale;
        const oldTheme = this.state.theme;

        this.state = { ...this.state, ...newState };

        if (newState.houseColor !== undefined && this.houseMesh) {
            this.houseMesh.material.color.set(this.state.houseColor);
        }

        if (newState.theme !== undefined && newState.theme !== oldTheme) {
            const isLight = this.state.theme === 'light';
            this.renderer.setClearColor(isLight ? 0xf8fafc : 0x0a0c10, 1);
            this.scene.background = new THREE.Color(isLight ? 0xf8fafc : 0x0a0c10);
            this.buildPolarBase();
        }

        if (newState.zoomScale !== undefined && newState.zoomScale !== oldZoom) {
            const s = newState.zoomScale;
            if (this.houseMesh) {
                this.houseMesh.scale.set(s, s, s);
                this.houseMesh.position.set(0, ((this.houseTotalHeight || 4.8768) * s) / 2, 0);
            }
            this.rebuildMassings(this.state.massings);
        } else if (newState.massings !== undefined || newState.transparentMassings !== undefined || newState.showDimensions !== undefined || newState.unitSystem !== undefined) {
            this.rebuildMassings(this.state.massings);
        }

        if (oldLat !== this.state.latitude || oldLon !== this.state.longitude || oldDate.getFullYear() !== this.state.date.getFullYear()) {
            this.rebuildSolarPaths();
        }

        this.updateActiveDayPath();
        this.updateSunPosition();
    }

    rebuildMassings(massingsList) {
        while (this.massingsGroup.children.length > 0) {
            const obj = this.massingsGroup.children[0];
            this.massingsGroup.remove(obj);
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) {
                obj.material.forEach(m => m.dispose());
            } else {
                obj.material?.dispose();
            }
        }

        while (this.dimensions3DGroup.children.length > 0) {
            const obj = this.dimensions3DGroup.children[0];
            this.dimensions3DGroup.remove(obj);
            obj.geometry?.dispose();
            obj.material?.dispose();
        }

        const massingMat = this.state.transparentMassings
            ? new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.5,
                roughness: 0.25,
                metalness: 0.1,
                side: THREE.DoubleSide
            })
            : new THREE.MeshStandardMaterial({
                color: 0xe2e8f0,
                roughness: 0.35,
                metalness: 0.05
            });

        const s = this.state.zoomScale || 1.0;
        const hHalfW = (this.house3DWidth * s) / 2;
        const hHalfL = (this.house3DLength * s) / 2;

        massingsList.forEach(m => {
            if (!m.points3D || m.points3D.length < 3) return;

            const shape = new THREE.Shape();
            shape.moveTo(m.points3D[0].x * s, m.points3D[0].z * s);
            for (let i = 1; i < m.points3D.length; i++) {
                shape.lineTo(m.points3D[i].x * s, m.points3D[i].z * s);
            }
            shape.closePath();

            const height = (m.height || 6.0) * s;
            const liftOffGround = 0.0508; // 2 inches in meters
            const extrudeSettings = {
                steps: 1,
                depth: height,
                bevelEnabled: false
            };

            const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            geo.rotateX(Math.PI / 2);
            geo.translate(0, height + liftOffGround, 0);

            const mesh = new THREE.Mesh(geo, massingMat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            const edgesGeo = new THREE.EdgesGeometry(geo);
            const edgesMat = new THREE.LineBasicMaterial({
                color: this.state.transparentMassings ? 0x0284c7 : 0x475569
            });
            const wireframe = new THREE.LineSegments(edgesGeo, edgesMat);
            mesh.add(wireframe);

            this.massingsGroup.add(mesh);

            // 3D Dimension Line & Label to House
            if (this.state.showDimensions) {
                let bestPt = { x: m.points3D[0].x * s, z: m.points3D[0].z * s };
                let bestHouseX = 0, bestHouseZ = 0;
                let minDist = Infinity;

                m.points3D.forEach(p => {
                    const scaledX = p.x * s;
                    const scaledZ = p.z * s;
                    const clampedX = Math.max(-hHalfW, Math.min(hHalfW, scaledX));
                    const clampedZ = Math.max(-hHalfL, Math.min(hHalfL, scaledZ));
                    const dist = Math.hypot(scaledX - clampedX, scaledZ - clampedZ);
                    if (dist < minDist) {
                        minDist = dist;
                        bestPt = { x: scaledX, z: scaledZ };
                        bestHouseX = clampedX;
                        bestHouseZ = clampedZ;
                    }
                });

                if (minDist > 0.5) {
                    const lineY = 0.08;
                    const pStart = new THREE.Vector3(bestHouseX, lineY, bestHouseZ);
                    const pEnd = new THREE.Vector3(bestPt.x, lineY, bestPt.z);

                    const lineGeo = new THREE.BufferGeometry().setFromPoints([pStart, pEnd]);
                    const lineMat = new THREE.LineDashedMaterial({
                        color: 0x38bdf8,
                        dashSize: 0.6,
                        gapSize: 0.4
                    });
                    const dimLine = new THREE.Line(lineGeo, lineMat);
                    dimLine.computeLineDistances();
                    this.dimensions3DGroup.add(dimLine);

                    const dir = new THREE.Vector3().subVectors(pEnd, pStart).normalize();
                    const perp = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(0.4);

                    [pStart, pEnd].forEach(p => {
                        const tGeo = new THREE.BufferGeometry().setFromPoints([
                            new THREE.Vector3(p.x - perp.x, lineY, p.z - perp.z),
                            new THREE.Vector3(p.x + perp.x, lineY, p.z + perp.z)
                        ]);
                        const tLine = new THREE.Line(tGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8 }));
                        this.dimensions3DGroup.add(tLine);
                    });

                    const mid = new THREE.Vector3().addVectors(pStart, pEnd).multiplyScalar(0.5);
                    mid.y = 1.0;
                    const sprite = this.createDimensionSprite(this.formatLength(minDist));
                    sprite.position.copy(mid);
                    this.dimensions3DGroup.add(sprite);
                }
            }
        });
    }

    rebuildSolarPaths() {
        while (this.trajectoryCurvesGroup.children.length > 0) {
            const obj = this.trajectoryCurvesGroup.children[0];
            this.trajectoryCurvesGroup.remove(obj);
            obj.geometry?.dispose();
            obj.material?.dispose();
        }

        while (this.analemmaCurvesGroup.children.length > 0) {
            const obj = this.analemmaCurvesGroup.children[0];
            this.analemmaCurvesGroup.remove(obj);
            obj.geometry?.dispose();
            obj.material?.dispose();
        }

        const year = this.state.date.getFullYear();
        const paths = SolarCalc.getKeySolarPaths(year, this.state.latitude, this.state.longitude);

        paths.forEach(p => {
            const segments = this.splitIntoDaylightSegments(p.points, 15);
            let colorHex = p.isEquinox ? 0x9ca3af : (p.isSolstice ? 0x6b7280 : 0x374151);
            let radius = p.isSolstice || p.isEquinox ? 0.06 : 0.04;

            segments.forEach(seg => {
                if (seg.length < 2) return;
                const vectors = seg.map(pt => this.polarToVector3(pt.elevation, pt.azimuth, this.domeRadius));
                const curve = new THREE.CatmullRomCurve3(vectors);
                const tubeGeo = new THREE.TubeGeometry(curve, 48, radius, 6, false);
                const tubeMat = new THREE.MeshStandardMaterial({
                    color: colorHex,
                    roughness: 0.5
                });
                const mesh = new THREE.Mesh(tubeGeo, tubeMat);
                this.trajectoryCurvesGroup.add(mesh);
            });
        });

        // Isolated Analemma Tubes (Strictly no horizontal lines)
        const hourCurves = SolarCalc.getHourCurves(year, this.state.latitude, this.state.longitude);
        hourCurves.forEach(h => {
            const segments = this.splitIntoDaylightSegments(h.points, 4);
            segments.forEach(seg => {
                if (seg.length < 3) return;
                const vectors = seg.map(pt => this.polarToVector3(pt.elevation, pt.azimuth, this.domeRadius));
                if (h.isClosedLoop && seg.length === h.points.length) {
                    vectors.push(vectors[0].clone());
                }
                const curve = new THREE.CatmullRomCurve3(vectors, false);
                const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.035, 5, false);
                const tubeMat = new THREE.MeshStandardMaterial({
                    color: 0x374151,
                    roughness: 0.6
                });
                const mesh = new THREE.Mesh(tubeGeo, tubeMat);
                this.analemmaCurvesGroup.add(mesh);
            });
        });

        this.trajectoryCurvesGroup.visible = !!this.state.showAllMonths;
        this.analemmaCurvesGroup.visible = !!this.state.showAnalemmas;
    }

    splitIntoDaylightSegments(points, maxDelta) {
        const segments = [];
        let cur = [];
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            if (p.elevation >= 0) {
                if (cur.length > 0) {
                    const prev = cur[cur.length - 1];
                    if (p.timeMinutes !== undefined && prev.timeMinutes !== undefined) {
                        if (Math.abs(p.timeMinutes - prev.timeMinutes) > maxDelta) {
                            segments.push(cur);
                            cur = [];
                        }
                    } else if (p.dayOfYear !== undefined && prev.dayOfYear !== undefined) {
                        if (Math.abs(p.dayOfYear - prev.dayOfYear) > maxDelta) {
                            segments.push(cur);
                            cur = [];
                        }
                    }
                }
                cur.push(p);
            } else {
                if (cur.length > 0) {
                    segments.push(cur);
                    cur = [];
                }
            }
        }
        if (cur.length > 0) segments.push(cur);
        return segments;
    }

    updateActiveDayPath() {
        while (this.activeDayPathGroup.children.length > 0) {
            const obj = this.activeDayPathGroup.children[0];
            this.activeDayPathGroup.remove(obj);
            obj.geometry?.dispose();
            obj.material?.dispose();
        }

        const activePath = SolarCalc.getDailyPath(this.state.date, this.state.latitude, this.state.longitude, 2);
        const segments = this.splitIntoDaylightSegments(activePath, 15);

        segments.forEach(seg => {
            if (seg.length < 2) return;
            const vectors = seg.map(pt => this.polarToVector3(pt.elevation, pt.azimuth, this.domeRadius));
            const curve = new THREE.CatmullRomCurve3(vectors);
            const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.12, 8, false);
            const tubeMat = new THREE.MeshStandardMaterial({
                color: 0xf59e0b,
                roughness: 0.3
            });
            const mesh = new THREE.Mesh(tubeGeo, tubeMat);
            this.activeDayPathGroup.add(mesh);
        });
    }

    updateSunPosition() {
        const pos = SolarCalc.getSolarPosition(this.state.date, this.state.latitude, this.state.longitude);
        const isAboveHorizon = pos.elevation >= 0;

        const sunVec = this.polarToVector3(pos.elevation, pos.azimuth, this.domeRadius);
        this.sunGroup.position.copy(sunVec);

        if (this.haloMesh) {
            this.haloMesh.quaternion.copy(this.camera.quaternion);
        }

        if (isAboveHorizon && this.state.showSunRays) {
            this.sunRayLine.visible = true;
            const positions = this.sunRayLine.geometry.attributes.position;
            positions.setXYZ(0, 0, 1.7, 0);
            positions.setXYZ(1, sunVec.x, sunVec.y, sunVec.z);
            positions.needsUpdate = true;
            this.sunRayLine.computeLineDistances();
        } else {
            this.sunRayLine.visible = false;
        }

        if (isAboveHorizon) {
            this.sunLight.position.copy(sunVec);
            this.sunLight.target.position.set(0, 0, 0);
            this.sunLight.intensity = 2.4;
            this.sunGroup.visible = true;
            this.updateSunLabel(pos);
        } else {
            this.sunLight.intensity = 0.05;
            this.sunGroup.visible = false;
        }

        this.trajectoryCurvesGroup.visible = !!this.state.showAllMonths;
        this.analemmaCurvesGroup.visible = !!this.state.showAnalemmas;
    }

    updateSunLabel() {
        if (!this.sunLabelCtx || !this.sunLabelTexture) return;

        const ctx = this.sunLabelCtx;
        const d = this.state.date;

        const hours = d.getHours();
        const mins = d.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayH = hours % 12 === 0 ? 12 : hours % 12;
        const displayM = mins.toString().padStart(2, '0');
        const timeStr = `${displayH}:${displayM} ${period}`;

        ctx.clearRect(0, 0, 512, 180);

        // Rectangular Info Badge Matching 2D Polar Chart style (100% larger)
        const tagW = 390;
        const tagH = 110;
        const tagX = (512 - tagW) / 2;
        const tagY = (180 - tagH) / 2;
        const textCenterX = 256;

        ctx.fillStyle = 'rgba(24, 28, 36, 0.94)';
        ctx.strokeStyle = '#2d3545';
        ctx.lineWidth = 3;
        ctx.fillRect(tagX, tagY, tagW, tagH);
        ctx.strokeRect(tagX, tagY, tagW, tagH);

        // Time of day (Large, bold, crisp 64px #f59e0b monospace)
        ctx.textAlign = 'center';
        ctx.fillStyle = '#f59e0b';
        ctx.font = '700 64px "Roboto Mono", monospace';
        ctx.textBaseline = 'middle';
        ctx.fillText(timeStr, textCenterX, 90);

        this.sunLabelTexture.needsUpdate = true;
    }

    setCameraPreset(presetName) {
        switch (presetName) {
            case 'iso':
                this.animateCamera(new THREE.Vector3(50, 40, 60), new THREE.Vector3(0, 2.5, 0));
                break;
            case 'top':
                this.animateCamera(new THREE.Vector3(0, 80, 0.1), new THREE.Vector3(0, 0, 0));
                break;
            case 'street':
                this.animateCamera(new THREE.Vector3(18, 4.5, 22), new THREE.Vector3(0, 2.5, 0));
                break;
            case 'south':
                this.animateCamera(new THREE.Vector3(0, 16, 55), new THREE.Vector3(0, 2.5, 0));
                break;
            case 'north':
                this.animateCamera(new THREE.Vector3(0, 16, -55), new THREE.Vector3(0, 2.5, 0));
                break;
        }
    }

    animateCamera(targetPos, targetLookAt) {
        const startPos = this.camera.position.clone();
        const startTarget = this.controls.target.clone();
        const startTime = performance.now();
        const duration = 600;

        const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);
            const ease = 1 - Math.pow(1 - progress, 3);

            this.camera.position.lerpVectors(startPos, targetPos, ease);
            this.controls.target.lerpVectors(startTarget, targetLookAt, ease);
            this.controls.update();

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }

    onResize() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width || 600;
        this.height = rect.height || 600;

        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.controls.update();
        if (this.haloMesh && this.sunGroup.visible) {
            this.haloMesh.quaternion.copy(this.camera.quaternion);
        }
        this.renderer.render(this.scene, this.camera);
    }
}
