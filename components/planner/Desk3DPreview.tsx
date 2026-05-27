"use client";

import { useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Camera, Download, Info, LocateFixed } from "lucide-react";
import type { WebGLRenderer } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { validateFit } from "@/lib/fitValidation";
import { usePlannerStore } from "@/store/plannerStore";
import type { DeskConfig, DeskItem } from "@/types/planner";

const deskThemeColors: Record<DeskConfig["theme"], { top: string; edge: string; leg: string }> = {
  oak: { top: "#d8bd93", edge: "#b68f61", leg: "#7c5230" },
  walnut: { top: "#8a5f3d", edge: "#5b341d", leg: "#342018" },
  white: { top: "#f8fafc", edge: "#cbd5e1", leg: "#94a3b8" },
  graphite: { top: "#34383e", edge: "#15191f", leg: "#111827" }
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const itemPosition = (item: DeskItem, desk: DeskConfig, y = 4) =>
  [item.x - desk.widthCm / 2, y, item.y - desk.depthCm / 2] as [number, number, number];

const safeHeight = (item: DeskItem, fallback = 4) => Math.max(0.8, item.heightCm ?? fallback);

type CameraPreset = "iso" | "top" | "front" | "side";

function SelectionBox({ item }: { item: DeskItem }) {
  return (
    <mesh position={[0, safeHeight(item) / 2 + 0.4, 0]}>
      <boxGeometry args={[item.widthCm + 2, safeHeight(item) + 1, item.depthCm + 2]} />
      <meshBasicMaterial color="#14b8a6" wireframe transparent opacity={0.7} />
    </mesh>
  );
}

function GenericBlock({ item, color = item.color, height = safeHeight(item) }: { item: DeskItem; color?: string; height?: number }) {
  return (
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[item.widthCm, height, item.depthCm]} />
      <meshStandardMaterial color={color} roughness={0.62} metalness={0.08} />
    </mesh>
  );
}

function MonitorModel({ item }: { item: DeskItem }) {
  const screenHeight = Math.max(22, safeHeight(item) * 0.58);

  return (
    <group>
      <mesh position={[0, 1, item.depthCm * 0.2]} castShadow receiveShadow>
        <boxGeometry args={[item.widthCm * 0.35, 2, item.depthCm * 0.48]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
      <mesh position={[0, screenHeight * 0.28, item.depthCm * 0.07]} castShadow>
        <boxGeometry args={[2.2, screenHeight * 0.48, 2.2]} />
        <meshStandardMaterial color="#475569" roughness={0.45} />
      </mesh>
      <mesh position={[0, screenHeight * 0.64, -item.depthCm * 0.18]} castShadow>
        <boxGeometry args={[item.widthCm, screenHeight, 2.6]} />
        <meshStandardMaterial color="#020617" roughness={0.32} metalness={0.18} />
      </mesh>
      <mesh position={[0, screenHeight * 0.64, -item.depthCm * 0.195]}>
        <boxGeometry args={[item.widthCm * 0.88, screenHeight * 0.74, 0.25]} />
        <meshStandardMaterial color="#0f172a" emissive="#172554" emissiveIntensity={0.12} roughness={0.2} />
      </mesh>
      <mesh position={[-item.widthCm * 0.25, screenHeight * 0.76, -item.depthCm * 0.35]}>
        <boxGeometry args={[item.widthCm * 0.25, 1.2, 0.35]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.2} roughness={0.2} />
      </mesh>
      <mesh position={[item.widthCm * 0.18, screenHeight * 0.58, -item.depthCm * 0.35]}>
        <boxGeometry args={[item.widthCm * 0.32, 1, 0.35]} />
        <meshStandardMaterial color="#14b8a6" emissive="#0f766e" emissiveIntensity={0.16} roughness={0.2} />
      </mesh>
    </group>
  );
}

function LaptopModel({ item }: { item: DeskItem }) {
  const keySize = Math.max(1.1, item.widthCm / 16);

  return (
    <group>
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[item.widthCm, 1.6, item.depthCm]} />
        <meshStandardMaterial color={item.color} roughness={0.35} metalness={0.35} />
      </mesh>
      {Array.from({ length: 9 }).map((_, index) => (
        <mesh key={index} position={[-item.widthCm * 0.33 + index * keySize * 1.25, 1.75, -item.depthCm * 0.08]}>
          <boxGeometry args={[keySize, 0.18, 1.4]} />
          <meshStandardMaterial color="#64748b" roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 1.78, item.depthCm * 0.26]}>
        <boxGeometry args={[item.widthCm * 0.22, 0.2, item.depthCm * 0.18]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.55} />
      </mesh>
      <mesh position={[0, 9, -item.depthCm * 0.48]} rotation={[toRadians(-18), 0, 0]} castShadow>
        <boxGeometry args={[item.widthCm, 16, 1.2]} />
        <meshStandardMaterial color="#111827" roughness={0.3} metalness={0.25} />
      </mesh>
      <mesh position={[0, 9, -item.depthCm * 0.53]} rotation={[toRadians(-18), 0, 0]}>
        <boxGeometry args={[item.widthCm * 0.84, 11, 0.2]} />
        <meshStandardMaterial color="#1e293b" emissive="#0f766e" emissiveIntensity={0.08} roughness={0.22} />
      </mesh>
    </group>
  );
}

function KeyboardModel({ item }: { item: DeskItem }) {
  const rows = 3;
  const columns = item.type === "keyboard-65" ? 8 : item.type === "keyboard-tkl" ? 10 : 12;
  const keyWidth = (item.widthCm * 0.78) / columns;
  const keyDepth = (item.depthCm * 0.58) / rows;

  return (
    <group>
      <GenericBlock item={item} height={safeHeight(item)} />
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((__, column) => (
          <mesh
            key={`${row}-${column}`}
            position={[
              -item.widthCm * 0.39 + column * keyWidth + keyWidth / 2,
              safeHeight(item) + 0.28,
              -item.depthCm * 0.29 + row * keyDepth + keyDepth / 2
            ]}
          >
            <boxGeometry args={[keyWidth * 0.72, 0.28, keyDepth * 0.62]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.52} />
          </mesh>
        ))
      )}
      <mesh position={[0, safeHeight(item) + 0.32, item.depthCm * 0.3]}>
        <boxGeometry args={[item.widthCm * 0.34, 0.3, keyDepth * 0.55]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.52} />
      </mesh>
    </group>
  );
}

function MousepadModel({ item }: { item: DeskItem }) {
  return (
    <group>
      <GenericBlock item={item} height={safeHeight(item)} color={item.color} />
      <mesh position={[0, safeHeight(item) + 0.08, 0]}>
        <boxGeometry args={[item.widthCm * 0.92, 0.08, item.depthCm * 0.82]} />
        <meshStandardMaterial color="#ccfbf1" transparent opacity={0.32} roughness={0.7} />
      </mesh>
    </group>
  );
}

function MouseModel({ item }: { item: DeskItem }) {
  return (
    <mesh position={[0, safeHeight(item) / 2, 0]} scale={[item.widthCm / 2, safeHeight(item) / 2, item.depthCm / 2]} castShadow receiveShadow>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color={item.color} roughness={0.4} metalness={0.12} />
    </mesh>
  );
}

function PcCaseModel({ item }: { item: DeskItem }) {
  return (
    <group>
      <GenericBlock item={item} height={safeHeight(item)} />
      <mesh position={[0, safeHeight(item) * 0.54, -item.depthCm / 2 - 0.2]}>
        <boxGeometry args={[item.widthCm * 0.72, safeHeight(item) * 0.72, 0.35]} />
        <meshStandardMaterial color="#27272a" roughness={0.38} metalness={0.2} />
      </mesh>
      {[0.34, 0.56].map((heightRatio) => (
        <mesh key={heightRatio} position={[0, safeHeight(item) * heightRatio, -item.depthCm / 2 - 0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[item.widthCm * 0.2, item.widthCm * 0.2, 0.5, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.32} />
        </mesh>
      ))}
      <mesh position={[item.widthCm * 0.22, safeHeight(item) * 0.82, -item.depthCm / 2 - 0.5]}>
        <boxGeometry args={[item.widthCm * 0.22, 1.2, 0.5]} />
        <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.28} roughness={0.25} />
      </mesh>
    </group>
  );
}

function SpeakerPairModel({ item }: { item: DeskItem }) {
  const speakerWidth = Math.max(8, item.widthCm * 0.36);
  const gap = item.widthCm * 0.28;

  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * gap, 0, 0]}>
          <mesh position={[0, safeHeight(item) / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[speakerWidth, safeHeight(item), item.depthCm]} />
            <meshStandardMaterial color={item.color} roughness={0.55} />
          </mesh>
          <mesh position={[0, safeHeight(item) * 0.56, -item.depthCm / 2 - 0.15]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[speakerWidth * 0.22, speakerWidth * 0.22, 0.4, 24]} />
            <meshStandardMaterial color="#111827" roughness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function LampModel({ item }: { item: DeskItem }) {
  return (
    <group>
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[item.widthCm * 0.34, item.widthCm * 0.42, 1.6, 32]} />
        <meshStandardMaterial color="#713f12" roughness={0.45} />
      </mesh>
      <mesh position={[0, safeHeight(item) * 0.42, 0]} castShadow>
        <cylinderGeometry args={[1.1, 1.1, safeHeight(item) * 0.75, 16]} />
        <meshStandardMaterial color="#854d0e" roughness={0.4} />
      </mesh>
      <mesh position={[0, safeHeight(item) * 0.86, 0]} castShadow>
        <coneGeometry args={[item.widthCm * 0.38, safeHeight(item) * 0.22, 32]} />
        <meshStandardMaterial color={item.color} emissive="#fef08a" emissiveIntensity={0.35} roughness={0.38} />
      </mesh>
      <pointLight position={[0, safeHeight(item) * 0.76, 0]} intensity={0.55} distance={90} color="#fef3c7" />
    </group>
  );
}

function HeadphoneStandModel({ item }: { item: DeskItem }) {
  return (
    <group>
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[item.widthCm * 0.34, item.widthCm * 0.44, 1.6, 28]} />
        <meshStandardMaterial color={item.color} roughness={0.45} />
      </mesh>
      <mesh position={[0, safeHeight(item) * 0.45, 0]} castShadow>
        <cylinderGeometry args={[1.4, 1.4, safeHeight(item) * 0.85, 18]} />
        <meshStandardMaterial color="#6b21a8" roughness={0.42} />
      </mesh>
      <mesh position={[0, safeHeight(item) * 0.9, 0]} castShadow>
        <boxGeometry args={[item.widthCm * 0.8, 2, 4]} />
        <meshStandardMaterial color={item.color} roughness={0.42} />
      </mesh>
    </group>
  );
}

function DeskShelfModel({ item }: { item: DeskItem }) {
  return (
    <group>
      <mesh position={[0, safeHeight(item), 0]} castShadow receiveShadow>
        <boxGeometry args={[item.widthCm, 3, item.depthCm]} />
        <meshStandardMaterial color={item.color} roughness={0.55} />
      </mesh>
      {[-1, 1].map((xSide) =>
        [-1, 1].map((zSide) => (
          <mesh key={`${xSide}-${zSide}`} position={[xSide * item.widthCm * 0.42, safeHeight(item) / 2, zSide * item.depthCm * 0.34]} castShadow>
            <boxGeometry args={[2.5, safeHeight(item), 2.5]} />
            <meshStandardMaterial color="#78350f" roughness={0.5} />
          </mesh>
        ))
      )}
    </group>
  );
}

function DeskItemModel({
  item,
  desk,
  selected,
  warning,
  onSelect
}: {
  item: DeskItem;
  desk: DeskConfig;
  selected: boolean;
  warning: boolean;
  onSelect: () => void;
}) {
  const rotationY = -toRadians(item.rotation);

  return (
    <group
      position={itemPosition(item, desk)}
      rotation={[0, rotationY, 0]}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      {item.type.startsWith("monitor") ? <MonitorModel item={item} /> : null}
      {item.type.startsWith("laptop") ? <LaptopModel item={item} /> : null}
      {item.type.startsWith("keyboard") ? <KeyboardModel item={item} /> : null}
      {item.type === "mouse" ? <MouseModel item={item} /> : null}
      {item.type.startsWith("mousepad") ? <MousepadModel item={item} /> : null}
      {item.type === "speaker-pair" ? <SpeakerPairModel item={item} /> : null}
      {item.type === "desk-lamp" ? <LampModel item={item} /> : null}
      {item.type === "pc-case" ? <PcCaseModel item={item} /> : null}
      {item.type === "headphone-stand" ? <HeadphoneStandModel item={item} /> : null}
      {item.type === "desk-shelf" ? <DeskShelfModel item={item} /> : null}
      {selected || warning ? <SelectionBox item={item} /> : null}
    </group>
  );
}

function DeskModel({ desk }: { desk: DeskConfig }) {
  const colors = deskThemeColors[desk.theme];
  const legX = desk.widthCm / 2 - 8;
  const legZ = desk.depthCm / 2 - 8;

  return (
    <group>
      <mesh position={[0, 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[desk.widthCm, 4, desk.depthCm]} />
        <meshStandardMaterial color={colors.top} roughness={0.58} />
      </mesh>
      <mesh position={[0, 4.2, 0]}>
        <boxGeometry args={[desk.widthCm + 1, 0.5, desk.depthCm + 1]} />
        <meshStandardMaterial color={colors.edge} roughness={0.5} />
      </mesh>
      {[-1, 1].map((xSide) =>
        [-1, 1].map((zSide) => (
          <mesh key={`${xSide}-${zSide}`} position={[xSide * legX, -18, zSide * legZ]} castShadow>
            <boxGeometry args={[4, 40, 4]} />
            <meshStandardMaterial color={colors.leg} roughness={0.5} />
          </mesh>
        ))
      )}
    </group>
  );
}

function SceneContent() {
  const desk = usePlannerStore((state) => state.desk);
  const items = usePlannerStore((state) => state.items);
  const selectedItemId = usePlannerStore((state) => state.selectedItemId);
  const selectItem = usePlannerStore((state) => state.selectItem);
  const validation = useMemo(() => validateFit(desk, items), [desk, items]);
  const warningIds = useMemo(
    () => new Set([...validation.outsideItemIds, ...validation.overlappingItemIds]),
    [validation.outsideItemIds, validation.overlappingItemIds]
  );

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 120, Math.max(150, desk.depthCm * 1.65)]} fov={45} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[80, 120, 90]} intensity={1.15} castShadow shadow-mapSize-width={1536} shadow-mapSize-height={1536} />
      <group onPointerDown={() => selectItem(null)}>
        <DeskModel desk={desk} />
        {items.map((item) => (
          <DeskItemModel
            key={item.id}
            item={item}
            desk={desk}
            selected={selectedItemId === item.id}
            warning={warningIds.has(item.id)}
            onSelect={() => selectItem(item.id)}
          />
        ))}
      </group>
      <Grid
        position={[0, -38, 0]}
        args={[Math.max(desk.widthCm, desk.depthCm) * 2.2, Math.max(desk.widthCm, desk.depthCm) * 2.2]}
        cellSize={10}
        cellThickness={0.45}
        sectionSize={50}
        sectionThickness={0.9}
        fadeDistance={260}
        fadeStrength={1}
        infiniteGrid={false}
      />
      <mesh position={[0, -40, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[Math.max(320, desk.widthCm * 2.4), Math.max(240, desk.depthCm * 2.6)]} />
        <shadowMaterial transparent opacity={0.16} />
      </mesh>
    </>
  );
}

export default function Desk3DPreview() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const desk = usePlannerStore((state) => state.desk);
  const items = usePlannerStore((state) => state.items);
  const selectedItem = usePlannerStore((state) => state.items.find((item) => item.id === state.selectedItemId));
  const sceneSpan = Math.max(desk.widthCm, desk.depthCm);

  const setCameraPreset = (preset: CameraPreset) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const distance = Math.max(150, sceneSpan * 1.35);
    const height = Math.max(78, sceneSpan * 0.55);
    const camera = controls.object;

    if (preset === "top") {
      camera.position.set(0, distance * 1.08, 0.01);
    }

    if (preset === "front") {
      camera.position.set(0, height, distance);
    }

    if (preset === "side") {
      camera.position.set(distance, height, 0);
    }

    if (preset === "iso") {
      camera.position.set(distance * 0.72, height * 1.08, distance * 0.82);
    }

    controls.target.set(0, 8, 0);
    camera.lookAt(controls.target);
    controls.update();
  };

  const exportScreenshot = () => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    requestAnimationFrame(() => {
      const dataUrl = renderer.domElement.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "deskfit-3d-preview.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  };

  return (
    <div className="relative h-full min-h-[520px] w-full overflow-hidden bg-[#eef2f0]">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          rendererRef.current = gl;
          gl.setClearColor("#eef2f0");
        }}
      >
        <SceneContent />
        <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.08} minDistance={55} maxDistance={360} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>

      <div className="absolute left-4 top-4 max-w-[280px] rounded-lg border border-slate-200 bg-white/90 px-3 py-2 shadow-soft backdrop-blur">
        <div className="flex items-center gap-2">
          <Info size={15} className="text-teal-700" aria-hidden />
          <p className="text-xs font-black uppercase tracking-wide text-teal-700">3D Preview Beta</p>
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-700">
          {desk.widthCm} x {desk.depthCm} cm desk
        </p>
        <p className="text-xs text-slate-500">
          {items.length} item{items.length === 1 ? "" : "s"}
          {selectedItem ? `, ${selectedItem.name} selected` : ""}
        </p>
        <p className="mt-2 border-t border-slate-200 pt-2 text-xs leading-5 text-slate-500">
          3D is preview-only. Edit layout in 2D, then preview here.
        </p>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/90 p-2 shadow-soft backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 px-2 text-xs font-black uppercase tracking-wide text-slate-500">
            <Camera size={15} aria-hidden />
            Camera
          </span>
          {[
            { id: "iso", label: "Iso" },
            { id: "top", label: "Top" },
            { id: "front", label: "Front" },
            { id: "side", label: "Side" }
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setCameraPreset(preset.id as CameraPreset)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCameraPreset("iso")}
            title="Reset camera"
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
          >
            <LocateFixed size={15} aria-hidden />
            Reset
          </button>
        </div>

        <button
          type="button"
          onClick={exportScreenshot}
          title="Export 3D PNG"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-teal-700 px-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
        >
          <Download size={16} aria-hidden />
          Export 3D PNG
        </button>
      </div>
    </div>
  );
}
