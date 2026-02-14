import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function HeartWithText() {
  const heartRef = useRef();
  const textRef = useRef();
  const heartMaterialRef = useRef();
  const textMaterialRef = useRef();

  // ❤️ HEART PARTICLES (3D depth)
  const heartParticles = useMemo(() => {
    const count = 12000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const t = Math.random() * Math.PI * 2;
      const r = 0.7 + Math.random() * 0.6;

      const x = r * 16 * Math.pow(Math.sin(t), 3);
      const y =
        r *
        (13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t));

      // głębia 3D
      const depth = (Math.random() - 0.5) * 10;
      const scale3D = 1 - Math.abs(depth) * 0.05;

      positions[i * 3] = x * 0.06 * scale3D;
      positions[i * 3 + 1] = y * 0.06 * scale3D;
      positions[i * 3 + 2] = depth * 0.08;
    }

    return positions;
  }, []);

  // ✨ TEXT PARTICLES (true 3D extrusion effect)
  const textParticles = useMemo(() => {
    const text = "Dla Wiktori";
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = 1200;
    canvas.height = 300;

    context.fillStyle = "white";
    context.font = "bold 180px Arial";
    context.textAlign = "center";
    context.fillText(text, canvas.width / 2, 200);

    const imageData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;

    const positions = [];

    for (let y = 0; y < canvas.height; y += 4) {
      for (let x = 0; x < canvas.width; x += 4) {
        const index = (y * canvas.width + x) * 4;
        if (imageData[index + 3] > 128) {
          // dodajemy głębię w Z żeby napis był 3D
          const layers = 6;
          for (let z = 0; z < layers; z++) {
            positions.push(
              (x - canvas.width / 2) * 0.01,
              (canvas.height / 2 - y) * 0.01 + 2.5,
              (z - layers / 2) * 0.05
            );
          }
        }
      }
    }

    return new Float32Array(positions);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // 🔄 Rotacja całej sceny (serce + tekst)
    heartRef.current.rotation.y = t * 0.4;
    heartRef.current.rotation.x = Math.sin(t * 0.6) * 0.3;

    textRef.current.rotation.y = t * 0.4;
    textRef.current.rotation.x = Math.sin(t * 0.6) * 0.3;

    // 💓 Pulsacja particles SERCA (nie kamera)
    const beat =
      Math.sin(t * 3.0) * 0.08 +
      Math.sin(t * 6.0) * 0.04;

    const heartScale = 1 + beat;
    heartRef.current.scale.set(heartScale, heartScale, heartScale);

    // dynamiczna zmiana wielkości particles
    heartMaterialRef.current.size = 0.035 + beat * 0.06;

    // subtelne świecenie przy pulsie
    const intensity = 0.8 + beat * 2.0;
    heartMaterialRef.current.color.setRGB(
      1,
      0.12 * intensity,
      0.35 * intensity
    );

    textMaterialRef.current.color.setRGB(
      1,
      0.12 * intensity,
      0.35 * intensity
    );
  });

  return (
    <>
      {/* SERCE */}
      <points ref={heartRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={heartParticles.length / 3}
            array={heartParticles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={heartMaterialRef}
          color="#ff1f5a"
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.95}
        />
      </points>

      {/* NAPIS 3D */}
      <points ref={textRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={textParticles.length / 3}
            array={textParticles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={textMaterialRef}
          color="#ff1f5a"
          size={0.03}
          sizeAttenuation
          transparent
          opacity={0.95}
        />
      </points>
    </>
  );
}

export default function App() {
  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />
        <HeartWithText />
        <OrbitControls enableZoom enablePan enableRotate />
      </Canvas>
    </div>
  );
}