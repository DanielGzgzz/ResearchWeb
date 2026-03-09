import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { particleVertexShader, particleFragmentShader } from '../../shaders/particleShaders';

interface ProtonProps {
  radius?: number;
  tubeRadius?: number;
  position?: [number, number, number];
}

class TrefoilCurve extends THREE.Curve<THREE.Vector3> {
  radius: number;
  tubeRadius: number;

  constructor(radius: number, tubeRadius: number) {
    super();
    this.radius = radius;
    this.tubeRadius = tubeRadius;
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const u = t * Math.PI * 2;
    // Standard Trefoil parameterization for smoother visual
    const x = Math.sin(u) + 2 * Math.sin(2 * u);
    const y = Math.cos(u) - 2 * Math.cos(2 * u);
    const z = -Math.sin(3 * u);

    // Scale to requested radius approx
    return optionalTarget.set(x * this.radius * 0.4, y * this.radius * 0.4, z * this.radius * 0.4);
  }
}

export function Proton({ radius = 2, tubeRadius = 0.4, position = [0, 0, 0] }: ProtonProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const trefoilCurve = useMemo(() => new TrefoilCurve(radius, tubeRadius), [radius, tubeRadius]);

  const geometry = useMemo(
    () => new THREE.TubeGeometry(trefoilCurve, 300, tubeRadius, 24, true),
    [trefoilCurve, tubeRadius]
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
        // 3 lobes factor for proton topology
        uTwistFactor: { value: 3.0 },
      },
      side: THREE.DoubleSide,
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      // Rotation to show intrinsic spin
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.1;
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={position} geometry={geometry} material={material} />
  );
}
