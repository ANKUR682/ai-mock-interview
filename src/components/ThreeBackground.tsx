import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL initialization failed:', e);
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const isHeadless =
      typeof navigator !== 'undefined' &&
      (navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent));

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // fully transparent background

    container.appendChild(renderer.domElement);

    // Group for objects that tilt with cursor
    const interactiveGroup = new THREE.Group();
    scene.add(interactiveGroup);

    // 1. Ambient & Point Lighting with refined studio contrast
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 2.5, 60); // Indigo
    pointLight1.position.set(15, 12, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 2.0, 50); // Cyan
    pointLight2.position.set(-15, -10, 8);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xa855f7, 1.8, 50); // Violet
    pointLight3.position.set(0, 15, -5);
    scene.add(pointLight3);

    // 2. Geometric Shapes: Modern floating wireframe tech prisms
    const shapes: { mesh: THREE.Mesh | THREE.LineSegments; rotSpeedX: number; rotSpeedY: number; floatSpeed: number; baseY: number }[] = [];

    // Icosahedron (Main Wireframe Prism)
    const icoGeo = new THREE.IcosahedronGeometry(4.5, 1);
    const icoWireMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8,
      transparent: true,
      opacity: 0.35,
    });
    const icoMesh = new THREE.Mesh(icoGeo, icoWireMat);
    icoMesh.position.set(12, 4, -4);
    interactiveGroup.add(icoMesh);
    shapes.push({ mesh: icoMesh, rotSpeedX: 0.003, rotSpeedY: 0.004, floatSpeed: 0.001, baseY: 4 });

    // Inner glowing core inside icosahedron
    const coreGeo = new THREE.OctahedronGeometry(2, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      wireframe: false,
      roughness: 0.4,
      metalness: 0.6,
      transparent: true,
      opacity: 0.2,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(12, 4, -4);
    interactiveGroup.add(coreMesh);
    shapes.push({ mesh: coreMesh, rotSpeedX: -0.005, rotSpeedY: -0.003, floatSpeed: 0.001, baseY: 4 });

    // Torus Ring (Left Side floating motif)
    const torusGeo = new THREE.TorusGeometry(3.5, 0.4, 16, 50);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      wireframe: true,
      roughness: 0.3,
      metalness: 0.7,
      transparent: true,
      opacity: 0.25,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(-14, -4, -6);
    torusMesh.rotation.x = Math.PI / 3;
    interactiveGroup.add(torusMesh);
    shapes.push({ mesh: torusMesh, rotSpeedX: 0.004, rotSpeedY: 0.002, floatSpeed: 0.0015, baseY: -4 });

    // Dodecahedron (Subtle upper-left accent)
    const dodecaGeo = new THREE.DodecahedronGeometry(2.5, 0);
    const dodecaMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0.3,
    });
    const dodecaMesh = new THREE.Mesh(dodecaGeo, dodecaMat);
    dodecaMesh.position.set(-10, 8, -8);
    interactiveGroup.add(dodecaMesh);
    shapes.push({ mesh: dodecaMesh, rotSpeedX: 0.002, rotSpeedY: 0.005, floatSpeed: 0.0008, baseY: 8 });

    // 3. Particle Starfield / Matrix constellation
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 55;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
      scales[i] = Math.random() * 2 + 1;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create subtle circular texture for particles procedurally
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      const gradient = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255,255,255,0.9)');
      gradient.addColorStop(0.3, 'rgba(165,180,252,0.6)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      pCtx.fillStyle = gradient;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);
    particleTexture.colorSpace = THREE.SRGBColorSpace;

    const particleMat = new THREE.PointsMaterial({
      size: 0.6,
      map: particleTexture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Mouse movement tracking with silky damping
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 5. Responsive Resize
    const handleResize = () => {
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Exponential damping on mouse coordinates
      currentMouseX = THREE.MathUtils.damp(currentMouseX, targetMouseX, 2.5, delta);
      currentMouseY = THREE.MathUtils.damp(currentMouseY, targetMouseY, 2.5, delta);

      // Subtle tilt of 3D scene
      interactiveGroup.rotation.y = currentMouseX * 0.25;
      interactiveGroup.rotation.x = -currentMouseY * 0.18;

      // Rotate geometric shapes and gently float
      shapes.forEach((s, idx) => {
        s.mesh.rotation.x += s.rotSpeedX;
        s.mesh.rotation.y += s.rotSpeedY;
        s.mesh.position.y = s.baseY + Math.sin(time * 0.8 + idx) * 0.6;
      });

      // Drifting particles
      particles.rotation.y = time * 0.015 + currentMouseX * 0.05;
      particles.rotation.x = currentMouseY * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose Three.js objects to avoid memory leaks
      icoGeo.dispose();
      icoWireMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      torusGeo.dispose();
      torusMat.dispose();
      dodecaGeo.dispose();
      dodecaMat.dispose();
      particleGeo.dispose();
      particleTexture.dispose();
      particleMat.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity: 0.85 }}
      aria-hidden="true"
    />
  );
};
