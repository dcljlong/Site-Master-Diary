import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function Logo3D({ width = 400, height = 300 }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x4fc3f7, 2, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    const pointLight2 = new THREE.PointLight(0xff7043, 1.5, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Main group
    const mainGroup = new THREE.Group();

    // Create drone body (construction site drone)
    const droneGroup = new THREE.Group();
    
    // Drone body
    const bodyGeom = new THREE.BoxGeometry(1.5, 0.3, 1.5);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 100 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    droneGroup.add(body);

    // Drone arms and propellers
    const armGeom = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
    const armMat = new THREE.MeshPhongMaterial({ color: 0x555555 });
    const propGeom = new THREE.BoxGeometry(0.8, 0.02, 0.1);
    const propMat = new THREE.MeshPhongMaterial({ color: 0x00bcd4 });

    const propellers = [];
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI / 2) + Math.PI / 4;
      const arm = new THREE.Mesh(armGeom, armMat);
      arm.rotation.z = Math.PI / 2;
      arm.rotation.y = angle;
      arm.position.set(Math.cos(angle) * 0.75, 0, Math.sin(angle) * 0.75);
      droneGroup.add(arm);

      const prop = new THREE.Mesh(propGeom, propMat);
      prop.position.set(Math.cos(angle) * 1.2, 0.2, Math.sin(angle) * 1.2);
      propellers.push(prop);
      droneGroup.add(prop);
    }

    // Camera on drone
    const camGeom = new THREE.SphereGeometry(0.15, 16, 16);
    const camMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
    const cam = new THREE.Mesh(camGeom, camMat);
    cam.position.y = -0.25;
    droneGroup.add(cam);

    droneGroup.position.y = 1;
    mainGroup.add(droneGroup);

    // Fishing line (long line)
    const lineGeom = new THREE.BufferGeometry();
    const linePoints = [];
    for (let i = 0; i <= 20; i++) {
      const y = -i * 0.15;
      const wave = Math.sin(i * 0.5) * 0.1;
      linePoints.push(0, y + 1, wave);
    }
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePoints, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x4fc3f7, linewidth: 2 });
    const line = new THREE.Line(lineGeom, lineMat);
    mainGroup.add(line);

    // Guitar pick at bottom of line
    const pickShape = new THREE.Shape();
    pickShape.moveTo(0, 0.4);
    pickShape.quadraticCurveTo(0.3, 0.1, 0.25, -0.3);
    pickShape.quadraticCurveTo(0, -0.5, -0.25, -0.3);
    pickShape.quadraticCurveTo(-0.3, 0.1, 0, 0.4);
    
    const pickGeom = new THREE.ExtrudeGeometry(pickShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02 });
    const pickMat = new THREE.MeshPhongMaterial({ color: 0xff7043, shininess: 100 });
    const pick = new THREE.Mesh(pickGeom, pickMat);
    pick.position.set(0, -2, 0);
    pick.rotation.x = Math.PI / 2;
    mainGroup.add(pick);

    // 7 Stars around the scene
    const starGeom = new THREE.OctahedronGeometry(0.15);
    const starColors = [0xffd700, 0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7, 0xdfe6e9];
    
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const radius = 2.5;
      const starMat = new THREE.MeshPhongMaterial({ color: starColors[i], emissive: starColors[i], emissiveIntensity: 0.3 });
      const star = new THREE.Mesh(starGeom, starMat);
      star.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 2) * 0.5,
        Math.sin(angle) * radius
      );
      star.userData = { angle, radius, speed: 0.5 + Math.random() * 0.5 };
      mainGroup.add(star);
    }

    // Construction hard hat
    const hatGeom = new THREE.SphereGeometry(0.4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const hatMat = new THREE.MeshPhongMaterial({ color: 0xffeb3b });
    const hat = new THREE.Mesh(hatGeom, hatMat);
    hat.position.set(1.8, 0.5, 0);
    mainGroup.add(hat);

    const brimGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32);
    const brim = new THREE.Mesh(brimGeom, hatMat);
    brim.position.set(1.8, 0.1, 0);
    mainGroup.add(brim);

    scene.add(mainGroup);
    camera.position.z = 6;

    // Animation
    let time = 0;
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      time += 0.016;

      // Rotate main group
      mainGroup.rotation.y += 0.005;

      // Drone hover
      droneGroup.position.y = 1 + Math.sin(time * 2) * 0.1;
      
      // Spin propellers
      propellers.forEach((prop, i) => {
        prop.rotation.y += 0.3 + (i * 0.05);
      });

      // Update fishing line wave
      const positions = line.geometry.attributes.position.array;
      for (let i = 0; i <= 20; i++) {
        positions[i * 3 + 2] = Math.sin(i * 0.5 + time * 3) * 0.1;
      }
      line.geometry.attributes.position.needsUpdate = true;

      // Swing pick
      pick.rotation.z = Math.sin(time * 1.5) * 0.2;

      // Orbit stars
      mainGroup.children.forEach(child => {
        if (child.userData && child.userData.angle !== undefined) {
          child.userData.angle += 0.01 * child.userData.speed;
          child.position.x = Math.cos(child.userData.angle) * child.userData.radius;
          child.position.z = Math.sin(child.userData.angle) * child.userData.radius;
          child.rotation.x += 0.02;
          child.rotation.y += 0.03;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [width, height]);

  return (
    <div className="flex flex-col items-center">
      <div ref={containerRef} style={{ width, height }} />
      <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-cyan-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
        SiteMaster Diary
      </h1>
    </div>
  );
}