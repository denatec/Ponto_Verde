"use client";

import { Canvas, ThreeEvent } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
} from "react";
import * as THREE from "three";

type Props = {
  selectedRegions: string[];
  onSelectRegion: (id: string) => void;
};

function HumanModel({
  selectedRegions,
  onSelectRegion,
}: Props) {
  const { scene } = useGLTF("/models/human-body.glb");

  // Clone também os materiais para não alterar
  // o modelo partilhado pela cache do carregador.
  const model = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.material = Array.isArray(object.material)
        ? object.material.map((material) => material.clone())
        : object.material.clone();

      object.userData.originalColor = Array.isArray(object.material)
        ? undefined
        : object.material.color?.clone();
    });

    return clone;
  }, [scene]);

  useEffect(() => {
    const selected = new Set(selectedRegions);

    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      // No Blender, exportar regionId como propriedade
      // personalizada da malha, ou usar nomes consistentes.
      const regionId = String(
        object.userData.regionId ?? object.name
      );

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) {
          return;
        }

        if (!material.userData.baseColor) {
          material.userData.baseColor = material.color.clone();
        }

        material.color.copy(material.userData.baseColor);

        if (selected.has(regionId)) {
          material.color.set("#ef4444");
          material.emissive.set("#7f1d1d");
          material.emissiveIntensity = 0.35;
        } else {
          material.emissive.set("#000000");
          material.emissiveIntensity = 0;
        }
      });
    });
  }, [model, selectedRegions]);

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();

    // Procurar o identificador anatómico na malha
    // tocada ou num dos seus grupos ancestrais.
    let object: THREE.Object3D | null = event.object;

    while (object && object !== model) {
      const id = object.userData.regionId;

      if (typeof id === "string" && id.length > 0) {
        onSelectRegion(id);
        return;
      }

      object = object.parent;
    }

    // Não selecionar uma região desconhecida:
    // a geometria tem de estar corretamente identificada.
  }

  return (
    <primitive
      object={model}
      onPointerDown={handlePointerDown}
    />
  );
}

export default function BodyViewer(props: Props) {
  const controls = useRef<any>(null);

  return (
    <div className="relative h-[65vh] min-h-[420px] w-full overflow-hidden rounded-2xl bg-slate-100">
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 35 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor("#f1f5f9");
        }}
      >
        <ambientLight intensity={1.4} />
        <directionalLight
          position={[3, 5, 5]}
          intensity={2}
        />

        <Suspense fallback={null}>
          <HumanModel {...props} />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          ref={controls}
          makeDefault
          enableRotate
          enableZoom
          enablePan={false}
          minDistance={1.3}
          maxDistance={7}
          minPolarAngle={0.05}
          maxPolarAngle={Math.PI - 0.05}
          rotateSpeed={0.8}
          zoomSpeed={0.8}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/human-body.glb");