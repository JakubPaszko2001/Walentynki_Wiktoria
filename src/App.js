import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function HeartWithEffects() {
  const heartRef = useRef();
  const textRef = useRef();
  const heartMaterialRef = useRef();
  const textMaterialRef = useRef();
  const explosionRef = useRef();

  const heartParticles = useMemo(() => {
    const count = 15000;
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

      const depth = (Math.random() - 0.5) * 10;
      const scale3D = 1 - Math.abs(depth) * 0.05;

      positions[i * 3] = x * 0.06 * scale3D;
      positions[i * 3 + 1] = y * 0.06 * scale3D;
      positions[i * 3 + 2] = depth * 0.08;
    }

    return positions;
  }, []);

  const textParticles = useMemo(() => {
    const text = "Dla Wiktori";
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 1200;
    canvas.height = 300;

    ctx.fillStyle = "white";
    ctx.font = "bold 180px Arial";
    ctx.textAlign = "center";
    ctx.fillText(text, canvas.width / 2, 200);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const positions = [];

    for (let y = 0; y < canvas.height; y += 4) {
      for (let x = 0; x < canvas.width; x += 4) {
        const index = (y * canvas.width + x) * 4;
        if (data[index + 3] > 128) {
          const layers = 8;
          for (let z = 0; z < layers; z++) {
            positions.push(
              (x - canvas.width / 2) * 0.01,
              (canvas.height / 2 - y) * 0.01 + 2.5,
              (z - layers / 2) * 0.06
            );
          }
        }
      }
    }

    return new Float32Array(positions);
  }, []);

  const explosionParticles = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    return positions;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    heartRef.current.rotation.y = t * 0.4;
    heartRef.current.rotation.x = Math.sin(t * 0.6) * 0.3;
    textRef.current.rotation.copy(heartRef.current.rotation);

    const beat = Math.sin(t * 3.0) * 0.1 + Math.sin(t * 6.0) * 0.05;
    const scale = 1 + beat;
    heartRef.current.scale.set(scale, scale, scale);

    heartMaterialRef.current.size = 0.04 + beat * 0.08;
    textMaterialRef.current.size = 0.035 + beat * 0.05;

    const intensity = 1 + beat * 3;
    heartMaterialRef.current.color.setRGB(1, 0.1 * intensity, 0.4 * intensity);
    textMaterialRef.current.color.setRGB(1, 0.1 * intensity, 0.4 * intensity);

    if (explosionRef.current && beat > 0.12) {
      explosionRef.current.scale.setScalar(1 + beat * 8);
    }
  });

  return (
    <>
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
          size={0.04}
          sizeAttenuation
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
        />
      </points>

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
          size={0.035}
          sizeAttenuation
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <points ref={explosionRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={explosionParticles.length / 3}
            array={explosionParticles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ff1f5a"
          size={0.02}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
}

export default function App() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={2} />
        <HeartWithEffects />
        <OrbitControls enableZoom enablePan enableRotate />

        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} intensity={2} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}