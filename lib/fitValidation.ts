import type { DeskConfig, DeskItem, FitValidationResult, ValidationWarning } from "@/types/planner";

type Point = {
  x: number;
  y: number;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const getItemCorners = (item: DeskItem): Point[] => {
  const radians = toRadians(item.rotation);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const halfWidth = item.widthCm / 2;
  const halfDepth = item.depthCm / 2;
  const localCorners = [
    { x: -halfWidth, y: -halfDepth },
    { x: halfWidth, y: -halfDepth },
    { x: halfWidth, y: halfDepth },
    { x: -halfWidth, y: halfDepth }
  ];

  return localCorners.map((corner) => ({
    x: item.x + corner.x * cos - corner.y * sin,
    y: item.y + corner.x * sin + corner.y * cos
  }));
};

const projectPolygon = (points: Point[], axis: Point) => {
  let min = Infinity;
  let max = -Infinity;

  points.forEach((point) => {
    const projection = point.x * axis.x + point.y * axis.y;
    min = Math.min(min, projection);
    max = Math.max(max, projection);
  });

  return { min, max };
};

const getAxes = (points: Point[]) => {
  const axes: Point[] = [];

  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    const edge = { x: next.x - point.x, y: next.y - point.y };
    const normal = { x: -edge.y, y: edge.x };
    const length = Math.hypot(normal.x, normal.y) || 1;
    axes.push({ x: normal.x / length, y: normal.y / length });
  });

  return axes;
};

const polygonsOverlap = (a: Point[], b: Point[]) => {
  const axes = [...getAxes(a), ...getAxes(b)];

  return axes.every((axis) => {
    const projectionA = projectPolygon(a, axis);
    const projectionB = projectPolygon(b, axis);
    return projectionA.max > projectionB.min && projectionB.max > projectionA.min;
  });
};

const isOutsideDesk = (item: DeskItem, desk: DeskConfig) =>
  getItemCorners(item).some((corner) => corner.x < 0 || corner.y < 0 || corner.x > desk.widthCm || corner.y > desk.depthCm);

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

export const validateFit = (desk: DeskConfig, items: DeskItem[]): FitValidationResult => {
  const warnings: ValidationWarning[] = [];
  const outsideItemIds = items.filter((item) => isOutsideDesk(item, desk)).map((item) => item.id);
  const overlappingItemIds = new Set<string>();
  let overlapCount = 0;

  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      if (polygonsOverlap(getItemCorners(items[i]), getItemCorners(items[j]))) {
        overlapCount += 1;
        overlappingItemIds.add(items[i].id);
        overlappingItemIds.add(items[j].id);
      }
    }
  }

  if (outsideItemIds.length > 0) {
    warnings.push({
      id: "outside",
      itemIds: outsideItemIds,
      severity: "danger",
      message: `${outsideItemIds.length} item${outsideItemIds.length === 1 ? " is" : "s are"} outside the desk boundary.`
    });
  }

  if (overlapCount > 0) {
    warnings.push({
      id: "overlap",
      itemIds: [...overlappingItemIds],
      severity: "warning",
      message: `${overlapCount} item overlap${overlapCount === 1 ? "" : "s"} detected.`
    });
  }

  const deskArea = desk.widthCm * desk.depthCm;
  const usedArea = items.reduce((sum, item) => sum + item.widthCm * item.depthCm, 0);
  const usedAreaPct = deskArea > 0 ? Math.round((usedArea / deskArea) * 100) : 0;
  const remainingAreaCm2 = Math.max(0, Math.round(deskArea - usedArea));
  const monitors = items.filter((item) => item.type.startsWith("monitor"));
  const mouse = items.find((item) => item.type === "mouse");
  const mousepad = items.find((item) => item.type.startsWith("mousepad"));
  const keyboard = items.find((item) => item.type.startsWith("keyboard"));
  const mouseAreaLimited =
    Boolean(mouse && mouse.x > desk.widthCm - 22) ||
    Boolean(mousepad && mousepad.widthCm < 30) ||
    Boolean(mouse && keyboard && Math.abs(mouse.x - keyboard.x) < (keyboard.widthCm + mouse.widthCm) / 2 + 5);

  if (usedAreaPct >= 75) {
    warnings.push({
      id: "high-density",
      itemIds: items.map((item) => item.id),
      severity: "warning",
      message: "Your desk may be too small for this setup."
    });
  }

  if (mouseAreaLimited) {
    warnings.push({
      id: "mouse-area",
      itemIds: [mouse?.id, mousepad?.id, keyboard?.id].filter(Boolean) as string[],
      severity: "warning",
      message: "Mouse area looks limited."
    });
  }

  if (monitors.length >= 2 && desk.widthCm < 150) {
    warnings.push({
      id: "dual-monitor-width",
      itemIds: monitors.map((item) => item.id),
      severity: "info",
      message: "Dual monitor setup may need a wider desk."
    });
  }

  let score = 100;
  score -= outsideItemIds.length * 14;
  score -= overlapCount * 8;

  if (usedAreaPct > 70) {
    score -= Math.min(18, (usedAreaPct - 70) * 0.75);
  }

  if (mouseAreaLimited) {
    score -= 10;
  }

  const feedback = [];

  if (outsideItemIds.length > 0) {
    feedback.push("Some items are outside the desk.");
  }

  if (overlapCount > 0) {
    feedback.push("Move overlapping items apart for a more realistic layout.");
  }

  if (usedAreaPct >= 75) {
    feedback.push("Your desk may be too small for this setup.");
  }

  if (mouseAreaLimited) {
    feedback.push("Mouse area looks limited. Consider using a smaller keyboard or bigger desk.");
  }

  if (monitors.length >= 2 && desk.widthCm < 150) {
    feedback.push("Dual monitor setup may need a wider desk.");
  }

  if (feedback.length === 0) {
    feedback.push("Your setup fits well.");
  }

  return {
    fitScore: clampScore(score),
    usedAreaPct,
    remainingAreaCm2,
    outsideItemIds,
    overlappingItemIds: [...overlappingItemIds],
    overlapCount,
    warnings,
    feedback
  };
};
