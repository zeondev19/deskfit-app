"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, LocateFixed, ZoomIn, ZoomOut } from "lucide-react";
import { Circle, Ellipse, Group, Layer, Line, Rect, Stage, Text, Transformer } from "react-konva";
import { getItemCorners, validateFit } from "@/lib/fitValidation";
import { usePlannerStore } from "@/store/plannerStore";
import type { DeskConfig, DeskItem } from "@/types/planner";

const deskThemeStyles: Record<DeskConfig["theme"], { fill: string; stroke: string; grain: string }> = {
  oak: { fill: "#d8bd93", stroke: "#b68f61", grain: "rgba(120, 75, 33, 0.15)" },
  walnut: { fill: "#8a5f3d", stroke: "#694225", grain: "rgba(255, 255, 255, 0.12)" },
  white: { fill: "#f8fafc", stroke: "#cbd5e1", grain: "rgba(15, 23, 42, 0.08)" },
  graphite: { fill: "#34383e", stroke: "#15191f", grain: "rgba(255, 255, 255, 0.10)" }
};

const clampZoom = (value: number) => Math.min(2.4, Math.max(0.55, value));

const useElementSize = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 900, height: 640 });

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const nextWidth = Math.max(320, entry.contentRect.width);
      const nextHeight = Math.max(420, entry.contentRect.height);
      setSize({ width: nextWidth, height: nextHeight });
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
};

const itemLabel = (item: DeskItem, widthPx: number, depthPx: number) => {
  const shortName = item.name
    .replace("Keyboard ", "")
    .replace("Monitor ", "")
    .replace("Mousepad ", "Pad ")
    .replace(" inch", "\"");

  return {
    text: shortName,
    fontSize: Math.max(8, Math.min(13, Math.min(widthPx, depthPx) / 4.6))
  };
};

function DeskItemNode({
  item,
  scale,
  isSelected,
  isOutside,
  isOverlapping,
  setNodeRef,
  onSelect,
  onMove,
  onTransform
}: {
  item: DeskItem;
  scale: number;
  isSelected: boolean;
  isOutside: boolean;
  isOverlapping: boolean;
  setNodeRef: (node: Konva.Group | null) => void;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onTransform: (updates: Partial<DeskItem>) => void;
}) {
  const widthPx = item.widthCm * scale;
  const depthPx = item.depthCm * scale;
  const label = itemLabel(item, widthPx, depthPx);
  const warningStroke = isOutside ? "#e11d48" : isOverlapping ? "#d97706" : isSelected ? "#0f766e" : "rgba(15,23,42,0.24)";
  const baseOpacity = item.locked ? 0.72 : 1;

  const handleTransformEnd = (event: Konva.KonvaEventObject<Event>) => {
    const node = event.target as Konva.Group;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    onTransform({
      x: node.x() / scale,
      y: node.y() / scale,
      rotation: node.rotation(),
      widthCm: item.resizable ? Math.max(4, item.widthCm * scaleX) : item.widthCm,
      depthCm: item.resizable ? Math.max(4, item.depthCm * scaleY) : item.depthCm
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  return (
    <Group
      ref={setNodeRef}
      x={item.x * scale}
      y={item.y * scale}
      rotation={item.rotation}
      draggable={!item.locked}
      opacity={baseOpacity}
      onMouseDown={onSelect}
      onTap={onSelect}
      onDragEnd={(event) => onMove(event.target.x() / scale, event.target.y() / scale)}
      onTransformEnd={handleTransformEnd}
    >
      <Rect
        x={-widthPx / 2}
        y={-depthPx / 2}
        width={widthPx}
        height={depthPx}
        cornerRadius={Math.min(8, Math.max(2, scale * 1.5))}
        fill={item.color}
        stroke={warningStroke}
        strokeWidth={isSelected || isOutside || isOverlapping ? 2.4 : 1.2}
        shadowColor="rgba(15,23,42,0.22)"
        shadowBlur={item.type.startsWith("mousepad") ? 0 : 8}
        shadowOpacity={item.type.startsWith("mousepad") ? 0 : 0.18}
        shadowOffsetY={3}
      />

      {item.type.startsWith("monitor") ? (
        <>
          <Rect
            x={-widthPx * 0.42}
            y={-depthPx * 0.35}
            width={widthPx * 0.84}
            height={depthPx * 0.42}
            cornerRadius={3}
            fill="#020617"
          />
          <Rect x={-widthPx * 0.06} y={depthPx * 0.04} width={widthPx * 0.12} height={depthPx * 0.25} fill="#475569" />
          <Rect x={-widthPx * 0.18} y={depthPx * 0.24} width={widthPx * 0.36} height={depthPx * 0.08} cornerRadius={2} fill="#334155" />
        </>
      ) : null}

      {item.type.startsWith("keyboard") ? (
        Array.from({ length: 8 }).map((_, index) => (
          <Line
            key={index}
            points={[-widthPx * 0.38 + index * widthPx * 0.11, -depthPx * 0.2, -widthPx * 0.38 + index * widthPx * 0.11, depthPx * 0.22]}
            stroke="rgba(255,255,255,0.24)"
            strokeWidth={1}
          />
        ))
      ) : null}

      {item.type === "mouse" ? <Ellipse radiusX={widthPx * 0.38} radiusY={depthPx * 0.38} fill="#ecfeff" opacity={0.55} /> : null}

      {item.type === "speaker-pair" ? (
        <>
          <Circle x={-widthPx * 0.28} radius={Math.min(widthPx, depthPx) * 0.18} fill="#111827" opacity={0.75} />
          <Circle x={widthPx * 0.28} radius={Math.min(widthPx, depthPx) * 0.18} fill="#111827" opacity={0.75} />
        </>
      ) : null}

      {item.type === "desk-lamp" ? (
        <>
          <Circle radius={Math.min(widthPx, depthPx) * 0.26} fill="#fef9c3" opacity={0.9} />
          <Line points={[0, 0, widthPx * 0.24, -depthPx * 0.24]} stroke="#713f12" strokeWidth={2} />
        </>
      ) : null}

      {item.locked ? (
        <Text
          x={-widthPx / 2}
          y={-depthPx / 2 + 3}
          width={widthPx}
          text="LOCKED"
          align="center"
          fill="rgba(255,255,255,0.7)"
          fontSize={Math.max(7, label.fontSize - 2)}
          fontStyle="bold"
        />
      ) : null}

      <Text
        x={-widthPx / 2}
        y={-label.fontSize / 2}
        width={widthPx}
        text={label.text}
        align="center"
        fill={item.type === "laptop-14" || item.type === "laptop-16" || item.type.startsWith("mousepad") ? "#0f172a" : "#ffffff"}
        fontSize={label.fontSize}
        fontStyle="bold"
        listening={false}
        ellipsis
      />
    </Group>
  );
}

export default function DeskCanvas() {
  const { ref: containerRef, size } = useElementSize();
  const stageRef = useRef<Konva.Stage | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const itemRefs = useRef<Record<string, Konva.Group | null>>({});
  const [view, setView] = useState({ zoom: 1, panX: 0, panY: 0 });

  const desk = usePlannerStore((state) => state.desk);
  const items = usePlannerStore((state) => state.items);
  const selectedItemId = usePlannerStore((state) => state.selectedItemId);
  const selectItem = usePlannerStore((state) => state.selectItem);
  const updateItem = usePlannerStore((state) => state.updateItem);
  const undo = usePlannerStore((state) => state.undo);
  const redo = usePlannerStore((state) => state.redo);
  const registerCanvasExporter = usePlannerStore((state) => state.registerCanvasExporter);

  const selectedItem = items.find((item) => item.id === selectedItemId) ?? null;
  const validation = useMemo(() => validateFit(desk, items), [desk, items]);
  const padding = size.width < 720 ? 38 : 58;
  const scale = Math.max(2, Math.min((size.width - padding * 2) / desk.widthCm, (size.height - padding * 2) / desk.depthCm));
  const deskWidthPx = desk.widthCm * scale;
  const deskDepthPx = desk.depthCm * scale;
  const offsetX = (size.width - deskWidthPx) / 2;
  const offsetY = (size.height - deskDepthPx) / 2;
  const viewX = offsetX + view.panX;
  const viewY = offsetY + view.panY;
  const theme = deskThemeStyles[desk.theme];

  const gridLines = useMemo(() => {
    const lines: Array<{ key: string; points: number[]; strong: boolean }> = [];

    for (let x = 0; x <= desk.widthCm; x += desk.gridSizeCm) {
      lines.push({
        key: `x-${x}`,
        points: [x * scale, 0, x * scale, deskDepthPx],
        strong: x % 20 === 0
      });
    }

    for (let y = 0; y <= desk.depthCm; y += desk.gridSizeCm) {
      lines.push({
        key: `y-${y}`,
        points: [0, y * scale, deskWidthPx, y * scale],
        strong: y % 20 === 0
      });
    }

    return lines;
  }, [desk.depthCm, desk.gridSizeCm, desk.widthCm, deskDepthPx, deskWidthPx, scale]);

  const exportCanvas = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const dataUrl = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
    const link = document.createElement("a");
    link.download = "deskfit-setup.png";
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }, []);

  const updateZoom = useCallback(
    (nextZoom: number, anchor?: { x: number; y: number }) => {
      setView((current) => {
        const zoom = clampZoom(nextZoom);
        if (!anchor) return { ...current, zoom };

        const worldX = (anchor.x - offsetX - current.panX) / current.zoom;
        const worldY = (anchor.y - offsetY - current.panY) / current.zoom;

        return {
          zoom,
          panX: anchor.x - offsetX - worldX * zoom,
          panY: anchor.y - offsetY - worldY * zoom
        };
      });
    },
    [offsetX, offsetY]
  );

  const panBy = useCallback((x: number, y: number) => {
    setView((current) => ({ ...current, panX: current.panX + x, panY: current.panY + y }));
  }, []);

  const resetView = useCallback(() => {
    setView({ zoom: 1, panX: 0, panY: 0 });
  }, []);

  useEffect(() => {
    registerCanvasExporter(exportCanvas);
    return () => registerCanvasExporter(null);
  }, [exportCanvas, registerCanvasExporter]);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    const node = selectedItemId ? itemRefs.current[selectedItemId] : null;
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedItemId, items]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      const key = event.key.toLowerCase();
      const hasCommandKey = event.ctrlKey || event.metaKey;

      if (hasCommandKey && key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      if (hasCommandKey && (key === "y" || (key === "z" && event.shiftKey))) {
        event.preventDefault();
        redo();
        return;
      }

      if (event.key === "Escape") {
        selectItem(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [redo, selectItem, undo]);

  return (
    <div ref={containerRef} className="relative h-full min-h-[520px] w-full overflow-hidden bg-[#f6f5f1]">
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        className="h-full w-full"
        onWheel={(event) => {
          event.evt.preventDefault();

          if (event.evt.shiftKey) {
            panBy(-event.evt.deltaY, 0);
            return;
          }

          const pointer = stageRef.current?.getPointerPosition();
          const zoomFactor = event.evt.deltaY > 0 ? 0.92 : 1.08;
          updateZoom(view.zoom * zoomFactor, pointer ?? undefined);
        }}
      >
        <Layer>
          <Rect x={0} y={0} width={size.width} height={size.height} fill="#f6f5f1" onMouseDown={() => selectItem(null)} onTap={() => selectItem(null)} />

          <Group x={viewX} y={viewY} scaleX={view.zoom} scaleY={view.zoom}>
            <Rect
              width={deskWidthPx}
              height={deskDepthPx}
              cornerRadius={8}
              fill={theme.fill}
              stroke={theme.stroke}
              strokeWidth={2}
              shadowColor="rgba(15,23,42,0.24)"
              shadowBlur={18}
              shadowOpacity={0.2}
              shadowOffsetY={8}
              onMouseDown={() => selectItem(null)}
              onTap={() => selectItem(null)}
            />

            {Array.from({ length: 8 }).map((_, index) => (
              <Line
                key={`grain-${index}`}
                points={[0, ((index + 1) / 9) * deskDepthPx, deskWidthPx, ((index + 1) / 9) * deskDepthPx]}
                stroke={theme.grain}
                strokeWidth={1}
                listening={false}
              />
            ))}

            {desk.showGrid
              ? gridLines.map((line) => (
                  <Line
                    key={line.key}
                    points={line.points}
                    stroke={desk.theme === "graphite" || desk.theme === "walnut" ? "rgba(255,255,255,0.22)" : "rgba(15,23,42,0.14)"}
                    strokeWidth={line.strong ? 1.1 : 0.65}
                    listening={false}
                  />
                ))
              : null}

            <Text
              x={0}
              y={-28}
              width={deskWidthPx}
              text={`${desk.widthCm} cm`}
              align="center"
              fill="#334155"
              fontSize={13}
              fontStyle="bold"
              listening={false}
            />
            <Text
              x={-48}
              y={deskDepthPx / 2 - 8}
              text={`${desk.depthCm} cm`}
              fill="#334155"
              fontSize={13}
              fontStyle="bold"
              rotation={-90}
              listening={false}
            />

            {items.map((item) => {
              const isOutside = validation.outsideItemIds.includes(item.id);
              const isOverlapping = validation.overlappingItemIds.includes(item.id);

              return (
                <DeskItemNode
                  key={item.id}
                  item={item}
                  scale={scale}
                  isSelected={selectedItemId === item.id}
                  isOutside={isOutside}
                  isOverlapping={isOverlapping}
                  setNodeRef={(node) => {
                    itemRefs.current[item.id] = node;
                  }}
                  onSelect={() => selectItem(item.id)}
                  onMove={(x, y) => updateItem(item.id, { x, y })}
                  onTransform={(updates) => updateItem(item.id, updates)}
                />
              );
            })}

            {selectedItem ? (
              <Group listening={false}>
                {getItemCorners(selectedItem).map((corner, index, corners) => {
                  const next = corners[(index + 1) % corners.length];
                  return (
                    <Line
                      key={`${selectedItem.id}-outline-${index}`}
                      points={[corner.x * scale, corner.y * scale, next.x * scale, next.y * scale]}
                      stroke="#0f766e"
                      strokeWidth={1}
                      dash={[5, 5]}
                    />
                  );
                })}
                <Text
                  x={selectedItem.x * scale - 65}
                  y={selectedItem.y * scale + (selectedItem.depthCm * scale) / 2 + 10}
                  width={130}
                  align="center"
                  text={`${selectedItem.widthCm} x ${selectedItem.depthCm} cm`}
                  fill="#0f766e"
                  fontSize={12}
                  fontStyle="bold"
                />
              </Group>
            ) : null}

            <Transformer
              ref={transformerRef}
              rotateEnabled={Boolean(selectedItem && !selectedItem.locked)}
              enabledAnchors={
                selectedItem?.resizable && !selectedItem.locked
                  ? ["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right", "top-center", "bottom-center"]
                  : []
              }
              borderStroke="#0f766e"
              anchorFill="#ffffff"
              anchorStroke="#0f766e"
              anchorSize={8}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 12 || newBox.height < 12) return oldBox;
                return newBox;
              }}
            />
          </Group>
        </Layer>
      </Stage>
      <div className="pointer-events-auto absolute bottom-4 left-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white/90 p-2 shadow-soft backdrop-blur">
        <button
          type="button"
          onClick={() => updateZoom(view.zoom * 0.88)}
          title="Zoom out"
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
        >
          <ZoomOut size={16} aria-hidden />
        </button>
        <span className="min-w-12 text-center text-xs font-black text-slate-700">{Math.round(view.zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => updateZoom(view.zoom * 1.12)}
          title="Zoom in"
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
        >
          <ZoomIn size={16} aria-hidden />
        </button>
        <div className="mx-1 h-7 w-px bg-slate-200" />
        <button
          type="button"
          onClick={() => panBy(0, 32)}
          title="Pan up"
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
        >
          <ArrowUp size={16} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => panBy(32, 0)}
          title="Pan left"
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
        >
          <ArrowLeft size={16} aria-hidden />
        </button>
        <button
          type="button"
          onClick={resetView}
          title="Reset view"
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
        >
          <LocateFixed size={16} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => panBy(-32, 0)}
          title="Pan right"
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
        >
          <ArrowRight size={16} aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => panBy(0, -32)}
          title="Pan down"
          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
        >
          <ArrowDown size={16} aria-hidden />
        </button>
      </div>
    </div>
  );
}
