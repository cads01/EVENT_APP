import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Html } from "@react-three/drei";
import * as THREE from "three";

const GLOBE_RADIUS = 2;
const MARKER_COLOR = "#f59e0b";
const GLOW_COLOR = "#fbbf24";

function latLonToPos(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function GlowSphere() {
  const meshRef = useRef(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });
  return (
    <group ref={meshRef}>
      <Sphere args={[GLOBE_RADIUS, 64, 64]}>
        <meshPhongMaterial
          color="#1a1a2e"
          emissive="#0f0f23"
          emissiveIntensity={0.3}
          wireframe={false}
          transparent
          opacity={0.95}
        />
      </Sphere>
      <Sphere args={[GLOBE_RADIUS * 1.002, 48, 48]}>
        <meshBasicMaterial
          color="#f59e0b"
          wireframe
          transparent
          opacity={0.08}
        />
      </Sphere>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#fbbf24" />
      <pointLight position={[-3, -2, 4]} intensity={0.6} color="#f59e0b" />
    </group>
  );
}

function PulseRing({ lat, lon }) {
  const ringRef = useRef(null);
  const pos = latLonToPos(lat, lon, GLOBE_RADIUS * 1.01);
  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.getElapsedTime();
      ringRef.current.scale.setScalar(1 + Math.sin(t * 3) * 0.15);
      ringRef.current.material.opacity = 0.6 + Math.sin(t * 3) * 0.3;
    }
  });
  return (
    <mesh ref={ringRef} position={pos}>
      <ringGeometry args={[0.05, 0.12, 16]} />
      <meshBasicMaterial color={MARKER_COLOR} transparent opacity={0.7} />
    </mesh>
  );
}

function EventMarker({ lat, lon, count }) {
  const pos = latLonToPos(lat, lon, GLOBE_RADIUS * 1.01);
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.06 + count * 0.015, 12, 12]} />
        <meshBasicMaterial color={MARKER_COLOR} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.1 + count * 0.02, 8, 8]} />
        <meshBasicMaterial color={GLOW_COLOR} transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

function ArcLine({ from, to, color, progress }) {
  const fromPos = latLonToPos(from.lat, from.lon, GLOBE_RADIUS);
  const toPos = latLonToPos(to.lat, to.lon, GLOBE_RADIUS);
  const mid = new THREE.Vector3().addVectors(fromPos, toPos).multiplyScalar(0.5);
  const dist = fromPos.distanceTo(toPos);
  mid.normalize().multiplyScalar(GLOBE_RADIUS + dist * 0.4);
  const curve = new THREE.QuadraticBezierCurve3(fromPos, mid, toPos);
  const points = curve.getPoints(32);
  const visibleCount = Math.floor(points.length * (progress || 1));

  return (
    <Line
      points={points.slice(0, visibleCount + 1)}
      color={color || "rgba(251, 191, 36, 0.3)"}
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
}

function Atmosphere() {
  return (
    <Sphere args={[GLOBE_RADIUS * 1.06, 32, 32]}>
      <meshBasicMaterial
        color="#f59e0b"
        transparent
        opacity={0.03}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

export default function InteractiveGlobe({ events }) {
  const [eventLocations, setEventLocations] = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!events || events.length === 0) return;
    const locations = {};
    events.forEach(ev => {
      if (ev.location && ev.latitude && ev.longitude) {
        const key = `${ev.latitude.toFixed(1)},${ev.longitude.toFixed(1)}`;
        if (!locations[key]) {
          locations[key] = { lat: ev.latitude, lon: ev.longitude, count: 0, events: [] };
        }
        locations[key].count++;
        locations[key].events.push(ev);
      }
    });
    setEventLocations(Object.values(locations));
  }, [events]);

  if (!visible) return null;

  return (
    <div className="relative w-full h-[500px] md:h-[600px] my-8">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-transparent pointer-events-none z-10" />
      <Canvas
        camera={{ position: [0, 0.5, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0) }}
      >
        <GlowSphere />
        <Atmosphere />
        {eventLocations.map((loc, i) => (
          <g key={i}>
            <EventMarker lat={loc.lat} lon={loc.lon} count={loc.count} />
            <PulseRing lat={loc.lat} lon={loc.lon} />
          </g>
        ))}
        {eventLocations.length >= 2 && eventLocations.slice(0, 6).map((loc, i) => {
          const next = eventLocations[(i + 1) % eventLocations.length];
          return (
            <ArcLine
              key={`arc-${i}`}
              from={loc}
              to={next}
              progress={1}
              color={i % 2 === 0 ? "#f59e0b" : "#fbbf24"}
            />
          );
        })}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          rotateSpeed={0.5}
          autoRotate
          autoRotateSpeed={0.8}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>
      {eventLocations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <p className="text-zinc-600 text-sm tracking-widest uppercase">Event locations appear here</p>
        </div>
      )}
      {visible && (
        <button
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-zinc-800/80 border border-zinc-700 text-zinc-500 hover:text-white hover:bg-zinc-700 transition-all flex items-center justify-center text-xs"
        >✕</button>
      )}
    </div>
  );
}
