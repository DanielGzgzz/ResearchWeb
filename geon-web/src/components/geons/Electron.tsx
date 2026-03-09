import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { particleVertexShader, particleFragmentShader } from '../../shaders/particleShaders';

interface ElectronProps {
  radius?: number;
  tubeRadius?: number;
  position?: [number, number, number];
}

class MobiusCurve extends THREE.Curve<THREE.Vector3> {
  radius: number;
  tubeRadius: number;

  constructor(radius: number, tubeRadius: number) {
    super();
    this.radius = radius;
    this.tubeRadius = tubeRadius;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const u = t * Math.PI * 2;
    // Basic circular track
    const x = Math.cos(u) * this.radius;
    const y = Math.sin(u) * this.radius;
    // Adding a slight z-displacement for depth to show the 4pi twist
    const z = Math.sin(u * 2) * this.tubeRadius * 1.5;

    return optionalTarget.set(x, y, z);
  }
}

export function Electron({ radius = 2, tubeRadius = 0.3, position = [0, 0, 0] }: ElectronProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const mobiusCurve = useMemo(() => new MobiusCurve(radius, tubeRadius), [radius, tubeRadius]);

  const geometry = useMemo(
    () => new THREE.TubeGeometry(mobiusCurve, 200, tubeRadius, 16, true),
    [mobiusCurve, tubeRadius]
  );

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        // Colors mapping: Green(+E), Purple(+B), Red(-E), Yellow(-B)
        colorEPlus: { value: new THREE.Color('#00ff00') },   // Green
        colorEMinus: { value: new THREE.Color('#ff0000') },  // Red
        colorBPlus: { value: new THREE.Color('#800080') },   // Purple
        colorBMinus: { value: new THREE.Color('#ffff00') },  // Yellow
        // 4pi twist factor for electron topology
        uTwistFactor: { value: 2.0 }, // 2 full twists (4pi)
      },
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Rotation to show intrinsic spin
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={position} geometry={geometry} material={material} />
  );
}
