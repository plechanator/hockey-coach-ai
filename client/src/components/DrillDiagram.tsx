import { useLanguage } from "@/hooks/use-language";

export interface DiagramElement {
  type: "player" | "defender" | "goalie" | "puck" | "cone" | "pass" | "shot" | "skating" | "skating-backward" | "skating-puck" | "stop" | "label" | "curve" | "screen" | "cycle" | "pivot" | "coach" | "tight-turn" | "dump";
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  cx?: number;
  cy?: number;
  label?: string;
  color?: string;
  number?: number;
}

export type RinkView = "full" | "half-left" | "half-right" | "zone-left" | "zone-right" | "neutral" | "goal-area" | "empty";

export interface DrillDiagramData {
  id: string;
  title: string;
  titleCz?: string;
  category: string;
  rinkView?: RinkView;
  elements: DiagramElement[];
  description?: string;
  descriptionCz?: string;
  focusTags?: string[];
  ageGroup?: string;
  source?: string;
}

interface ZoneArea {
  x_start: number;
  y_start: number;
  width: number;
  height: number;
}

interface DrillDiagramProps {
  elements: DiagramElement[];
  width?: number;
  height?: number;
  printMode?: boolean;
  showLegend?: boolean;
  rinkView?: RinkView;
  zoneArea?: ZoneArea;
  stationIndex?: number;
  totalStations?: number;
}

function resolveRinkView(rinkView: RinkView | undefined, zoneArea?: ZoneArea, stationIndex?: number, totalStations?: number): RinkView {
  if (zoneArea) {
    const centerX = zoneArea.x_start + zoneArea.width / 2;
    if (zoneArea.width <= 40) {
      if (centerX <= 30) return "zone-left";
      if (centerX >= 70) return "zone-right";
      return "neutral";
    }
    if (zoneArea.width <= 55) {
      if (centerX <= 40) return "half-left";
      if (centerX >= 60) return "half-right";
      return "neutral";
    }
    return "full";
  }
  if (rinkView && rinkView !== "full") return rinkView;
  if (totalStations && totalStations > 1 && stationIndex != null) {
    const fraction = 1 / totalStations;
    const center = (stationIndex + 0.5) * fraction;
    if (center <= 0.33) return "zone-left";
    if (center >= 0.67) return "zone-right";
    return "neutral";
  }
  return rinkView || "full";
}

const BLUE_PLAYER = "#2563EB";
const RED_COLOR = "#DC2626";
const BLACK_COLOR = "#1a1a1a";
const ICE_BG = "#f0f7fc";
const ICE_BG_PRINT = "#fff";
const BOARD_COLOR = "#1a3a5c";
const RED_LINE = "#c0392b";
const BLUE_LINE = "#2471a3";
const CREASE_COLOR = "#dbeafe";
const CONE_FILL = "#F59E0B";
const CONE_STROKE = "#D97706";
const COACH_COLOR = "#059669";

function arrowHead(x1: number, y1: number, x2: number, y2: number, size = 7): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const a1x = x2 - size * Math.cos(angle - Math.PI / 6);
  const a1y = y2 - size * Math.sin(angle - Math.PI / 6);
  const a2x = x2 - size * Math.cos(angle + Math.PI / 6);
  const a2y = y2 - size * Math.sin(angle + Math.PI / 6);
  return `M${a1x},${a1y} L${x2},${y2} L${a2x},${a2y}`;
}

function wavyPath(x1: number, y1: number, x2: number, y2: number, amp = 5, freq = 5): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len;
  const ny = dx / len;
  let d = `M${x1},${y1}`;
  const steps = freq * 2;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const offset = (i % 2 === 1 ? amp : -amp) * (i < steps ? 1 : 0);
    d += ` L${px + nx * offset},${py + ny * offset}`;
  }
  d += ` L${x2},${y2}`;
  return d;
}

function crossoverPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / len;
  const ny = dx / len;
  const amp = 4;
  const steps = 8;
  let d = `M${x1},${y1}`;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    const side = i % 2 === 1 ? amp : -amp;
    d += ` L${px + nx * side},${py + ny * side}`;
    d += ` L${px - nx * side},${py - ny * side}`;
  }
  d += ` L${x2},${y2}`;
  return d;
}

function renderElement(el: DiagramElement, i: number, printMode: boolean) {
  const color = el.color || (el.type === "defender" ? RED_COLOR : el.type === "coach" ? COACH_COLOR : BLUE_PLAYER);
  const sw = printMode ? 1.5 : 2;

  switch (el.type) {
    case "player":
      return (
        <g key={i}>
          <circle cx={el.x} cy={el.y} r={7} fill="none" stroke={printMode ? "#000" : color} strokeWidth={sw} />
          {el.label && (
            <text x={el.x} y={el.y + 3.5} textAnchor="middle" fill={printMode ? "#000" : color} fontSize="8" fontWeight="700" fontFamily="sans-serif">
              {el.label}
            </text>
          )}
        </g>
      );
    case "defender":
      return (
        <g key={i}>
          <polygon
            points={`${el.x},${el.y - 8} ${el.x - 7},${el.y + 5} ${el.x + 7},${el.y + 5}`}
            fill="none"
            stroke={printMode ? "#000" : RED_COLOR}
            strokeWidth={sw}
          />
          {el.label && (
            <text x={el.x} y={el.y + 2} textAnchor="middle" fill={printMode ? "#000" : RED_COLOR} fontSize="7" fontWeight="700" fontFamily="sans-serif">
              {el.label}
            </text>
          )}
        </g>
      );
    case "coach":
      return (
        <g key={i}>
          <polygon
            points={`${el.x},${el.y - 8} ${el.x - 7},${el.y + 5} ${el.x + 7},${el.y + 5}`}
            fill={printMode ? "#ccc" : COACH_COLOR}
            stroke={printMode ? "#000" : COACH_COLOR}
            strokeWidth={1}
            opacity={0.7}
          />
          {el.label && (
            <text x={el.x} y={el.y + 2} textAnchor="middle" fill="#fff" fontSize="7" fontWeight="700" fontFamily="sans-serif">
              {el.label}
            </text>
          )}
        </g>
      );
    case "goalie":
      return (
        <g key={i}>
          <rect x={el.x - 7} y={el.y - 7} width={14} height={14} rx={2} fill="none" stroke={printMode ? "#000" : color} strokeWidth={sw} />
          <text x={el.x} y={el.y + 3.5} textAnchor="middle" fill={printMode ? "#000" : color} fontSize="8" fontWeight="700" fontFamily="sans-serif">G</text>
        </g>
      );
    case "puck":
      return <circle key={i} cx={el.x} cy={el.y} r={3.5} fill={printMode ? "#000" : BLACK_COLOR} />;
    case "cone":
      return (
        <polygon
          key={i}
          points={`${el.x},${el.y - 6} ${el.x - 4.5},${el.y + 3.5} ${el.x + 4.5},${el.y + 3.5}`}
          fill={printMode ? "#999" : CONE_FILL}
          stroke={printMode ? "#555" : CONE_STROKE}
          strokeWidth={1}
        />
      );
    case "pass":
      if (el.x2 == null || el.y2 == null) return null;
      return (
        <g key={i}>
          <line x1={el.x} y1={el.y} x2={el.x2} y2={el.y2} stroke={printMode ? "#000" : color} strokeWidth={sw} strokeDasharray="5 3" />
          <path d={arrowHead(el.x, el.y, el.x2, el.y2)} stroke={printMode ? "#000" : color} strokeWidth={sw} fill="none" />
        </g>
      );
    case "shot":
      if (el.x2 == null || el.y2 == null) return null;
      return (
        <g key={i}>
          <line x1={el.x} y1={el.y} x2={el.x2} y2={el.y2} stroke={printMode ? "#000" : RED_COLOR} strokeWidth={sw + 1} />
          <path d={arrowHead(el.x, el.y, el.x2, el.y2, 9)} stroke={printMode ? "#000" : RED_COLOR} strokeWidth={sw + 1} fill={printMode ? "#000" : RED_COLOR} />
        </g>
      );
    case "skating":
      if (el.x2 == null || el.y2 == null) return null;
      return (
        <g key={i}>
          <line x1={el.x} y1={el.y} x2={el.x2} y2={el.y2} stroke={printMode ? "#000" : color} strokeWidth={sw} />
          <path d={arrowHead(el.x, el.y, el.x2, el.y2)} stroke={printMode ? "#000" : color} strokeWidth={sw} fill="none" />
        </g>
      );
    case "skating-puck":
      if (el.x2 == null || el.y2 == null) return null;
      return (
        <g key={i}>
          <path d={wavyPath(el.x, el.y, el.x2, el.y2)} stroke={printMode ? "#000" : color} strokeWidth={sw} fill="none" />
          <path d={arrowHead(el.x, el.y, el.x2, el.y2)} stroke={printMode ? "#000" : color} strokeWidth={sw} fill="none" />
        </g>
      );
    case "skating-backward":
      if (el.x2 == null || el.y2 == null) return null;
      return (
        <g key={i}>
          <path d={crossoverPath(el.x, el.y, el.x2, el.y2)} stroke={printMode ? "#000" : color} strokeWidth={1.5} fill="none" />
          <path d={arrowHead(el.x, el.y, el.x2, el.y2)} stroke={printMode ? "#000" : color} strokeWidth={sw} fill="none" />
        </g>
      );
    case "curve":
      if (el.x2 == null || el.y2 == null) return null;
      {
        const cxp = el.cx ?? (el.x + el.x2) / 2;
        const cyp = el.cy ?? (el.y + el.y2) / 2 - 30;
        return (
          <g key={i}>
            <path d={`M${el.x},${el.y} Q${cxp},${cyp} ${el.x2},${el.y2}`} stroke={printMode ? "#000" : color} strokeWidth={sw} fill="none" />
            <path d={arrowHead(cxp, cyp, el.x2, el.y2)} stroke={printMode ? "#000" : color} strokeWidth={sw} fill="none" />
          </g>
        );
      }
    case "screen":
      return (
        <g key={i}>
          <line x1={el.x - 6} y1={el.y - 3} x2={el.x + 6} y2={el.y - 3} stroke={printMode ? "#000" : RED_COLOR} strokeWidth={2.5} />
          <line x1={el.x - 6} y1={el.y + 3} x2={el.x + 6} y2={el.y + 3} stroke={printMode ? "#000" : RED_COLOR} strokeWidth={2.5} />
        </g>
      );
    case "cycle":
      if (el.x2 == null || el.y2 == null) return null;
      {
        const mx = (el.x + el.x2) / 2;
        const my = (el.y + el.y2) / 2;
        const rx = Math.abs(el.x2 - el.x) / 2;
        const ry = Math.abs(el.y2 - el.y) / 2;
        return (
          <g key={i}>
            <ellipse cx={mx} cy={my} rx={rx} ry={ry} fill="none" stroke={printMode ? "#000" : color} strokeWidth={sw} strokeDasharray="4 2" />
            <path d={arrowHead(mx - rx, my, mx - rx, my - 5)} stroke={printMode ? "#000" : color} strokeWidth={sw} fill="none" />
          </g>
        );
      }
    case "pivot":
      {
        const pivotR = 8;
        const startAngle = el.cx ?? 0;
        const sweepAngle = el.cy ?? 180;
        const rad1 = (startAngle * Math.PI) / 180;
        const rad2 = ((startAngle + sweepAngle) * Math.PI) / 180;
        const x1 = el.x + pivotR * Math.cos(rad1);
        const y1 = el.y + pivotR * Math.sin(rad1);
        const x2p = el.x + pivotR * Math.cos(rad2);
        const y2p = el.y + pivotR * Math.sin(rad2);
        const largeArc = Math.abs(sweepAngle) > 180 ? 1 : 0;
        const sweepDir = sweepAngle > 0 ? 1 : 0;
        return (
          <g key={i}>
            <path d={`M${x1},${y1} A${pivotR},${pivotR} 0 ${largeArc},${sweepDir} ${x2p},${y2p}`} stroke={printMode ? "#000" : color} strokeWidth={sw} fill="none" />
            <path d={arrowHead(el.x, el.y, x2p, y2p, 5)} stroke={printMode ? "#000" : color} strokeWidth={sw} fill="none" />
          </g>
        );
      }
    case "tight-turn":
      {
        const turnR = 6;
        return (
          <g key={i}>
            <path d={`M${el.x - turnR},${el.y} A${turnR},${turnR} 0 1,1 ${el.x + turnR},${el.y}`} stroke={printMode ? "#000" : color} strokeWidth={sw} fill="none" />
            <path d={arrowHead(el.x, el.y - turnR, el.x + turnR, el.y, 5)} stroke={printMode ? "#000" : color} strokeWidth={sw} fill="none" />
          </g>
        );
      }
    case "dump":
      if (el.x2 == null || el.y2 == null) return null;
      return (
        <g key={i}>
          <path d={`M${el.x},${el.y} Q${(el.x + el.x2) / 2},${Math.min(el.y, el.y2) - 20} ${el.x2},${el.y2}`} stroke={printMode ? "#000" : color} strokeWidth={sw} strokeDasharray="3 3" fill="none" />
          <path d={arrowHead((el.x + el.x2) / 2, Math.min(el.y, el.y2) - 20, el.x2, el.y2)} stroke={printMode ? "#000" : color} strokeWidth={sw} fill="none" />
        </g>
      );
    case "stop":
      return (
        <line key={i} x1={el.x - 5} y1={el.y} x2={el.x + 5} y2={el.y} stroke={printMode ? "#000" : RED_COLOR} strokeWidth={sw + 1} />
      );
    case "label":
      return (
        <text key={i} x={el.x} y={el.y} textAnchor="middle" fill={printMode ? "#333" : "#374151"} fontSize="9" fontWeight="600" fontFamily="sans-serif">
          {el.label}
        </text>
      );
    default:
      return null;
  }
}

function drawGoalNet(x: number, y: number, w: number, h: number, printMode: boolean) {
  const stroke = printMode ? "#000" : BOARD_COLOR;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={stroke} strokeWidth={1.5} rx={0} />
      {Array.from({ length: 4 }).map((_, i) => (
        <line key={`v${i}`} x1={x + (w / 5) * (i + 1)} y1={y} x2={x + (w / 5) * (i + 1)} y2={y + h} stroke={stroke} strokeWidth={0.3} opacity={0.4} />
      ))}
      {Array.from({ length: 2 }).map((_, i) => (
        <line key={`h${i}`} x1={x} y1={y + (h / 3) * (i + 1)} x2={x + w} y2={y + (h / 3) * (i + 1)} stroke={stroke} strokeWidth={0.3} opacity={0.4} />
      ))}
    </g>
  );
}

function drawCrease(cx: number, cy: number, direction: "down" | "up", printMode: boolean) {
  const creaseW = 28;
  const creaseH = 16;
  const fill = printMode ? "#eee" : CREASE_COLOR;
  const stroke = printMode ? "#555" : RED_LINE;
  if (direction === "down") {
    return (
      <g>
        <path d={`M${cx - creaseW / 2},${cy} A${creaseW / 2},${creaseH} 0 0,1 ${cx + creaseW / 2},${cy}`} fill={fill} stroke={stroke} strokeWidth={1} />
        <line x1={cx - creaseW / 2} y1={cy} x2={cx + creaseW / 2} y2={cy} stroke={stroke} strokeWidth={1} />
      </g>
    );
  }
  return (
    <g>
      <path d={`M${cx - creaseW / 2},${cy} A${creaseW / 2},${creaseH} 0 0,0 ${cx + creaseW / 2},${cy}`} fill={fill} stroke={stroke} strokeWidth={1} />
      <line x1={cx - creaseW / 2} y1={cy} x2={cx + creaseW / 2} y2={cy} stroke={stroke} strokeWidth={1} />
    </g>
  );
}

function drawFaceoffCircle(cx: number, cy: number, printMode: boolean, withDot = true) {
  const stroke = printMode ? "#444" : RED_LINE;
  return (
    <g>
      <circle cx={cx} cy={cy} r={15} fill="none" stroke={stroke} strokeWidth={0.8} />
      {withDot && <circle cx={cx} cy={cy} r={2} fill={stroke} />}
    </g>
  );
}

function drawFaceoffDot(cx: number, cy: number, printMode: boolean) {
  return <circle cx={cx} cy={cy} r={2} fill={printMode ? "#444" : RED_LINE} />;
}

function renderRinkBackground(width: number, height: number, rinkView: RinkView, printMode: boolean) {
  const p = 4;
  const rW = width - p * 2;
  const rH = height - p * 2;
  const cx = width / 2;
  const cy = height / 2;
  const bg = printMode ? ICE_BG_PRINT : ICE_BG;
  const board = printMode ? "#000" : BOARD_COLOR;
  const redL = printMode ? "#555" : RED_LINE;
  const blueL = printMode ? "#777" : BLUE_LINE;
  const cornerR = Math.min(rW, rH) * 0.15;
  const goalW = 16;
  const goalH = 8;

  const fullRink = () => {
    const blueY1 = p + rH * 0.28;
    const blueY2 = p + rH * 0.72;
    const goalLineY1 = p + rH * 0.11;
    const goalLineY2 = p + rH * 0.89;
    return (
      <g>
        <rect x={p} y={p} width={rW} height={rH} rx={cornerR} fill={bg} stroke={board} strokeWidth={2} />
        <line x1={p} y1={cy} x2={p + rW} y2={cy} stroke={redL} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={18} fill="none" stroke={blueL} strokeWidth={1.2} />
        <circle cx={cx} cy={cy} r={2} fill={blueL} />
        <line x1={p} y1={blueY1} x2={p + rW} y2={blueY1} stroke={blueL} strokeWidth={1.5} />
        <line x1={p} y1={blueY2} x2={p + rW} y2={blueY2} stroke={blueL} strokeWidth={1.5} />
        <line x1={p + 8} y1={goalLineY1} x2={p + rW - 8} y2={goalLineY1} stroke={redL} strokeWidth={1} />
        <line x1={p + 8} y1={goalLineY2} x2={p + rW - 8} y2={goalLineY2} stroke={redL} strokeWidth={1} />
        {drawFaceoffCircle(cx - rW * 0.28, blueY1 + rH * 0.08, printMode)}
        {drawFaceoffCircle(cx + rW * 0.28, blueY1 + rH * 0.08, printMode)}
        {drawFaceoffCircle(cx - rW * 0.28, blueY2 - rH * 0.08, printMode)}
        {drawFaceoffCircle(cx + rW * 0.28, blueY2 - rH * 0.08, printMode)}
        {drawFaceoffDot(cx - rW * 0.25, cy, printMode)}
        {drawFaceoffDot(cx + rW * 0.25, cy, printMode)}
        {drawCrease(cx, goalLineY1, "down", printMode)}
        {drawCrease(cx, goalLineY2, "up", printMode)}
        {drawGoalNet(cx - goalW / 2, p + 1, goalW, goalH, printMode)}
        {drawGoalNet(cx - goalW / 2, p + rH - goalH - 1, goalW, goalH, printMode)}
      </g>
    );
  };

  const halfRink = (side: "left" | "right") => {
    const blueY = side === "left" ? p + rH * 0.55 : p + rH * 0.45;
    const goalLineY = side === "left" ? p + rH * 0.18 : p + rH * 0.82;
    const creaseDir = side === "left" ? "down" as const : "up" as const;
    const goalNetY = side === "left" ? p + 1 : p + rH - goalH - 1;
    return (
      <g>
        <rect x={p} y={p} width={rW} height={rH} rx={cornerR} fill={bg} stroke={board} strokeWidth={2} />
        <line x1={p} y1={blueY} x2={p + rW} y2={blueY} stroke={blueL} strokeWidth={1.5} />
        <line x1={p + 8} y1={goalLineY} x2={p + rW - 8} y2={goalLineY} stroke={redL} strokeWidth={1} />
        {drawFaceoffCircle(cx - rW * 0.28, side === "left" ? blueY - rH * 0.12 : blueY + rH * 0.12, printMode)}
        {drawFaceoffCircle(cx + rW * 0.28, side === "left" ? blueY - rH * 0.12 : blueY + rH * 0.12, printMode)}
        {drawCrease(cx, goalLineY, creaseDir, printMode)}
        {drawGoalNet(cx - goalW / 2, goalNetY, goalW, goalH, printMode)}
      </g>
    );
  };

  const zoneRink = (side: "left" | "right") => {
    const goalLineY = side === "left" ? p + rH * 0.22 : p + rH * 0.78;
    const creaseDir = side === "left" ? "down" as const : "up" as const;
    const goalNetY = side === "left" ? p + 1 : p + rH - goalH - 1;
    return (
      <g>
        <rect x={p} y={p} width={rW} height={rH} rx={cornerR} fill={bg} stroke={board} strokeWidth={2} />
        <line x1={p + 8} y1={goalLineY} x2={p + rW - 8} y2={goalLineY} stroke={redL} strokeWidth={1} />
        {drawFaceoffCircle(cx - rW * 0.28, cy, printMode)}
        {drawFaceoffCircle(cx + rW * 0.28, cy, printMode)}
        {drawCrease(cx, goalLineY, creaseDir, printMode)}
        {drawGoalNet(cx - goalW / 2, goalNetY, goalW, goalH, printMode)}
      </g>
    );
  };

  switch (rinkView) {
    case "full": return fullRink();
    case "half-left": return halfRink("left");
    case "half-right": return halfRink("right");
    case "zone-left": return zoneRink("left");
    case "zone-right": return zoneRink("right");
    case "neutral":
      return (
        <g>
          <rect x={p} y={p} width={rW} height={rH} rx={cornerR} fill={bg} stroke={board} strokeWidth={2} />
          <line x1={p} y1={cy} x2={p + rW} y2={cy} stroke={redL} strokeWidth={2} />
          <circle cx={cx} cy={cy} r={18} fill="none" stroke={blueL} strokeWidth={1.2} />
          <circle cx={cx} cy={cy} r={2} fill={blueL} />
          <line x1={p} y1={p + rH * 0.2} x2={p + rW} y2={p + rH * 0.2} stroke={blueL} strokeWidth={1.5} />
          <line x1={p} y1={p + rH * 0.8} x2={p + rW} y2={p + rH * 0.8} stroke={blueL} strokeWidth={1.5} />
          {drawFaceoffDot(cx - rW * 0.25, cy, printMode)}
          {drawFaceoffDot(cx + rW * 0.25, cy, printMode)}
        </g>
      );
    case "goal-area":
      return (
        <g>
          <rect x={p} y={p} width={rW} height={rH} rx={cornerR} fill={bg} stroke={board} strokeWidth={2} />
          <line x1={p + 8} y1={p + rH * 0.35} x2={p + rW - 8} y2={p + rH * 0.35} stroke={redL} strokeWidth={1} />
          {drawCrease(cx, p + rH * 0.35, "down", printMode)}
          {drawGoalNet(cx - goalW / 2, p + 1, goalW, goalH, printMode)}
        </g>
      );
    case "empty":
    default:
      return (
        <g>
          <rect x={p} y={p} width={rW} height={rH} rx={cornerR} fill={bg} stroke={board} strokeWidth={2} />
        </g>
      );
  }
}

export function DrillDiagram({ elements, width = 200, height = 260, printMode = false, showLegend = false, rinkView = "full", zoneArea, stationIndex, totalStations }: DrillDiagramProps) {
  const { language } = useLanguage();
  const legendH = showLegend ? 65 : 0;
  const totalH = height + legendH;
  const effectiveRinkView = resolveRinkView(rinkView as RinkView, zoneArea, stationIndex, totalStations);

  return (
    <svg viewBox={`0 0 ${width} ${totalH}`} className="w-full" style={{ maxWidth: width }} data-testid="drill-diagram">
      {renderRinkBackground(width, height, effectiveRinkView, printMode)}
      {elements.map((el, i) => renderElement(el, i, printMode))}
      {showLegend && (
        <g>
          <line x1={4} y1={height + 4} x2={width - 4} y2={height + 4} stroke="#e5e7eb" strokeWidth={0.5} />
          {LEGEND_ITEMS.map((item, idx) => {
            const col = idx % 6;
            const row = Math.floor(idx / 6);
            const lx = 16 + col * ((width - 20) / 6);
            const ly = height + 18 + row * 16;
            return <g key={item.type}>{renderLegendItem(item, lx, ly, language)}</g>;
          })}
        </g>
      )}
    </svg>
  );
}

const LEGEND_ITEMS = [
  { type: "player" as const, labelEn: "Player", labelCz: "Hráč" },
  { type: "defender" as const, labelEn: "Defender", labelCz: "Obránce" },
  { type: "goalie" as const, labelEn: "Goalie", labelCz: "Brankář" },
  { type: "coach" as const, labelEn: "Coach", labelCz: "Trenér" },
  { type: "pass" as const, labelEn: "Pass", labelCz: "Přihrávka" },
  { type: "shot" as const, labelEn: "Shot", labelCz: "Střela" },
  { type: "skating" as const, labelEn: "Skating", labelCz: "Bruslení" },
  { type: "skating-puck" as const, labelEn: "With puck", labelCz: "S pukem" },
  { type: "skating-backward" as const, labelEn: "Backward", labelCz: "Pozadu" },
  { type: "pivot" as const, labelEn: "Pivot", labelCz: "Pivot" },
  { type: "cone" as const, labelEn: "Cone", labelCz: "Kužel" },
  { type: "puck" as const, labelEn: "Puck", labelCz: "Puk" },
];

function renderLegendItem(item: typeof LEGEND_ITEMS[number], x: number, y: number, lang: string) {
  const label = lang === "cz" ? item.labelCz : item.labelEn;
  switch (item.type) {
    case "player":
      return (<g><circle cx={x} cy={y} r={5} fill="none" stroke={BLUE_PLAYER} strokeWidth={1.5} /><text x={x + 10} y={y + 3} fontSize="7" fill="#555">{label}</text></g>);
    case "defender":
      return (<g><polygon points={`${x},${y - 5} ${x - 4},${y + 3} ${x + 4},${y + 3}`} fill="none" stroke={RED_COLOR} strokeWidth={1.5} /><text x={x + 10} y={y + 3} fontSize="7" fill="#555">{label}</text></g>);
    case "goalie":
      return (<g><rect x={x - 5} y={y - 5} width={10} height={10} rx={2} fill="none" stroke={BLUE_PLAYER} strokeWidth={1.5} /><text x={x} y={y + 3} textAnchor="middle" fontSize="6" fill={BLUE_PLAYER} fontWeight="700">G</text><text x={x + 10} y={y + 3} fontSize="7" fill="#555">{label}</text></g>);
    case "coach":
      return (<g><polygon points={`${x},${y - 5} ${x - 4},${y + 3} ${x + 4},${y + 3}`} fill={COACH_COLOR} stroke={COACH_COLOR} strokeWidth={1} opacity={0.7} /><text x={x + 10} y={y + 3} fontSize="7" fill="#555">{label}</text></g>);
    case "pass":
      return (<g><line x1={x - 7} y1={y} x2={x + 5} y2={y} stroke={BLUE_PLAYER} strokeWidth={1.5} strokeDasharray="3 2" /><text x={x + 10} y={y + 3} fontSize="7" fill="#555">{label}</text></g>);
    case "shot":
      return (<g><line x1={x - 7} y1={y} x2={x + 5} y2={y} stroke={RED_COLOR} strokeWidth={2.5} /><text x={x + 10} y={y + 3} fontSize="7" fill="#555">{label}</text></g>);
    case "skating":
      return (<g><line x1={x - 7} y1={y} x2={x + 5} y2={y} stroke={BLUE_PLAYER} strokeWidth={1.5} /><text x={x + 10} y={y + 3} fontSize="7" fill="#555">{label}</text></g>);
    case "skating-puck":
      return (<g><path d={`M${x - 7},${y} L${x - 3},${y - 3} L${x + 1},${y + 3} L${x + 5},${y}`} stroke={BLUE_PLAYER} strokeWidth={1.5} fill="none" /><text x={x + 10} y={y + 3} fontSize="7" fill="#555">{label}</text></g>);
    case "skating-backward":
      return (<g><path d={`M${x - 7},${y} L${x - 3},${y - 3} L${x - 1},${y + 3} L${x + 1},${y - 3} L${x + 3},${y + 3} L${x + 5},${y}`} stroke={BLUE_PLAYER} strokeWidth={1.2} fill="none" /><text x={x + 10} y={y + 3} fontSize="7" fill="#555">{label}</text></g>);
    case "pivot":
      return (<g><path d={`M${x - 5},${y + 3} A5,5 0 1,1 ${x + 5},${y + 3}`} stroke={BLUE_PLAYER} strokeWidth={1.5} fill="none" /><text x={x + 10} y={y + 3} fontSize="7" fill="#555">{label}</text></g>);
    case "cone":
      return (<g><polygon points={`${x},${y - 4} ${x - 3.5},${y + 3} ${x + 3.5},${y + 3}`} fill={CONE_FILL} stroke={CONE_STROKE} strokeWidth={1} /><text x={x + 10} y={y + 3} fontSize="7" fill="#555">{label}</text></g>);
    case "puck":
      return (<g><circle cx={x} cy={y} r={3} fill="#000" /><text x={x + 10} y={y + 3} fontSize="7" fill="#555">{label}</text></g>);
    default:
      return null;
  }
}

export const RINK_VIEW_OPTIONS: { id: RinkView; labelEn: string; labelCz: string }[] = [
  { id: "full", labelEn: "Full Ice", labelCz: "Celé kluziště" },
  { id: "half-left", labelEn: "Half Ice (top)", labelCz: "Půlka (horní)" },
  { id: "half-right", labelEn: "Half Ice (bottom)", labelCz: "Půlka (dolní)" },
  { id: "zone-left", labelEn: "Offensive Zone", labelCz: "Útočné pásmo" },
  { id: "zone-right", labelEn: "Defensive Zone", labelCz: "Obranné pásmo" },
  { id: "neutral", labelEn: "Neutral Zone", labelCz: "Střední pásmo" },
  { id: "goal-area", labelEn: "Goal Area", labelCz: "Prostor branky" },
  { id: "empty", labelEn: "Empty Rink", labelCz: "Prázdné kluziště" },
];

export const DRILL_LIBRARY: DrillDiagramData[] = [
  // ===== KONDIČNÍ BRUSLENÍ (ČSLH Trenérské listy - Juříček) =====
  {
    id: "kb-sprint-stops",
    title: "Sprint & Stop Conditioning",
    titleCz: "Kondiční bruslení: sprinty a zastavení",
    category: "conditioning",
    rinkView: "full",
    focusTags: ["conditioning", "stops", "acceleration"],
    source: "ČSLH",
    description: "Players sprint full-length, perform hockey stops at each line, then sprint again. Builds explosive starts and stopping technique.",
    descriptionCz: "Hráči sprintují celé kluziště, provádí hokejové zastavení na každé čáře, poté znovu sprintují. Buduje výbušné starty a techniku zastavení.",
    elements: [
      { type: "player", x: 100, y: 250, label: "1" },
      { type: "skating", x: 100, y: 242, x2: 100, y2: 195 },
      { type: "stop", x: 100, y: 192 },
      { type: "skating", x: 100, y: 189, x2: 100, y2: 140 },
      { type: "stop", x: 100, y: 137 },
      { type: "skating", x: 100, y: 134, x2: 100, y2: 85 },
      { type: "stop", x: 100, y: 82 },
      { type: "skating", x: 100, y: 79, x2: 100, y2: 30 },
    ],
  },
  {
    id: "kb-circle-power",
    title: "Circle Power Skating",
    titleCz: "Silové bruslení v kruzích",
    category: "conditioning",
    rinkView: "full",
    focusTags: ["conditioning", "crossovers", "edges", "power"],
    source: "ČSLH",
    description: "Players perform power crossovers around all faceoff circles. 2 laps CW, 2 laps CCW per circle. Focus on deep knee bend and full extension.",
    descriptionCz: "Hráči provádí silové přešlapy okolo všech vhazovacích kruhů. 2 kola po směru, 2 kola proti směru na kruh. Důraz na hluboký podřep a plné natažení.",
    elements: [
      { type: "player", x: 46, y: 93, label: "1" },
      { type: "cycle", x: 22, y: 70, x2: 70, y2: 120, color: BLUE_PLAYER },
      { type: "cycle", x: 130, y: 70, x2: 178, y2: 120, color: BLUE_PLAYER },
      { type: "cycle", x: 22, y: 150, x2: 70, y2: 200, color: BLUE_PLAYER },
      { type: "cycle", x: 130, y: 150, x2: 178, y2: 200, color: BLUE_PLAYER },
      { type: "skating", x: 70, y: 95, x2: 130, y2: 95 },
      { type: "skating", x: 178, y: 120, x2: 178, y2: 150 },
      { type: "skating", x: 130, y: 175, x2: 70, y2: 175 },
    ],
  },
  {
    id: "kb-transition-drill",
    title: "Forward-Backward Transitions",
    titleCz: "Přechody vpřed-vzad (transition)",
    category: "conditioning",
    rinkView: "full",
    focusTags: ["conditioning", "transitions", "agility", "pivots"],
    source: "Bukač",
    description: "Players skate forward to cone, pivot to backward, skate backward to next cone, pivot forward again. Based on Bukač transition methodology - wide 'bogna' pivots.",
    descriptionCz: "Hráči bruslí vpřed ke kuželu, pivotují do bruslení vzad, bruslí vzad k dalšímu kuželu, znovu pivotují vpřed. Podle metodiky Bukače - široké pivoty 'bogna'.",
    elements: [
      { type: "player", x: 100, y: 245, label: "1" },
      { type: "cone", x: 100, y: 190 },
      { type: "cone", x: 100, y: 130 },
      { type: "cone", x: 100, y: 70 },
      { type: "skating", x: 100, y: 237, x2: 100, y2: 198 },
      { type: "pivot", x: 100, y: 190, cx: 90, cy: 180 },
      { type: "skating-backward", x: 100, y: 183, x2: 100, y2: 138 },
      { type: "pivot", x: 100, y: 130, cx: 270, cy: 180 },
      { type: "skating", x: 100, y: 123, x2: 100, y2: 78 },
      { type: "pivot", x: 100, y: 70, cx: 90, cy: 180 },
      { type: "skating-backward", x: 100, y: 63, x2: 100, y2: 25 },
      { type: "label", x: 65, y: 215, label: "FWD" },
      { type: "label", x: 65, y: 155, label: "BWD" },
      { type: "label", x: 65, y: 100, label: "FWD" },
    ],
  },
  // ===== PŘIHRÁVKY (Passing) =====
  {
    id: "pass-triangle",
    title: "Basic Passing Triangle",
    titleCz: "Základní přihrávkový trojúhelník",
    category: "passing",
    rinkView: "half-left",
    focusTags: ["passing", "receiving"],
    source: "ČSLH",
    description: "Players form a triangle and pass the puck around. Focus on tape-to-tape passes and proper stick positioning. Standard ČSLH drill from Trenérské listy.",
    descriptionCz: "Hráči vytvoří trojúhelník a přihrávají si puk dokola. Důraz na čisté přihrávky a správné postavení hole. Standardní cvičení z Trenérských listů ČSLH.",
    elements: [
      { type: "player", x: 40, y: 80, label: "A" },
      { type: "player", x: 160, y: 80, label: "B" },
      { type: "player", x: 100, y: 200, label: "C" },
      { type: "pass", x: 47, y: 80, x2: 153, y2: 80 },
      { type: "pass", x: 160, y: 87, x2: 107, y2: 193 },
      { type: "pass", x: 93, y: 193, x2: 40, y2: 87 },
      { type: "puck", x: 44, y: 72 },
    ],
  },
  {
    id: "pass-cross-ice",
    title: "Cross-Ice Pass & Shoot",
    titleCz: "Křížná přihrávka a střela",
    category: "passing",
    rinkView: "zone-left",
    focusTags: ["passing", "shooting", "one-timer"],
    description: "Player A passes cross-ice to Player B who receives and immediately shoots on goal. Focus on timing and one-touch shooting.",
    descriptionCz: "Hráč A přihrává napříč na hráče B, který přijme a okamžitě střílí na branku. Důraz na načasování a střelu z první.",
    elements: [
      { type: "player", x: 40, y: 140, label: "A" },
      { type: "player", x: 155, y: 140, label: "B" },
      { type: "goalie", x: 100, y: 48 },
      { type: "pass", x: 47, y: 140, x2: 148, y2: 140 },
      { type: "shot", x: 155, y: 133, x2: 103, y2: 55 },
      { type: "puck", x: 35, y: 132 },
    ],
  },
  {
    id: "pass-give-go",
    title: "Give & Go (Wall Pass)",
    titleCz: "Nahrávka a jdi (od mantinelu)",
    category: "passing",
    rinkView: "half-left",
    focusTags: ["passing", "movement", "support"],
    source: "ČSLH",
    description: "Player passes to partner near the boards, then skates into open ice to receive a return pass. Standard Czech hockey give-and-go pattern.",
    descriptionCz: "Hráč přihraje partnerovi u mantinelu, poté bruslí do volného prostoru pro zpětnou přihrávku. Standardní český hokejový vzor nahrávka-a-jdi.",
    elements: [
      { type: "player", x: 50, y: 180, label: "1" },
      { type: "player", x: 30, y: 100, label: "2" },
      { type: "goalie", x: 100, y: 48 },
      { type: "pass", x: 46, y: 173, x2: 33, y2: 107 },
      { type: "skating", x: 57, y: 175, x2: 120, y2: 130 },
      { type: "pass", x: 37, y: 100, x2: 115, y2: 130 },
      { type: "shot", x: 125, y: 128, x2: 103, y2: 55 },
      { type: "puck", x: 55, y: 187 },
    ],
  },
  {
    id: "pass-5-sequence",
    title: "5-Pass Breakout Sequence",
    titleCz: "5 přihrávek - rozehrávka",
    category: "passing",
    rinkView: "full",
    focusTags: ["passing", "breakout", "transition", "teamplay"],
    source: "ČSLH",
    description: "Full 5-pass breakout sequence: D-to-D, up to winger, center support, attack pass. Must complete all 5 passes before crossing blue line. From ČSLH Trenérské listy methodology.",
    descriptionCz: "Kompletní sekvence 5 přihrávek při rozehrávce: O-O, nahoru na křídlo, podpora centra, útočná přihrávka. Musí se dokončit všech 5 přihrávek před modrou čárou. Metodika ČSLH.",
    elements: [
      { type: "defender", x: 50, y: 220, label: "D1" },
      { type: "defender", x: 150, y: 220, label: "D2" },
      { type: "player", x: 25, y: 160, label: "LW" },
      { type: "player", x: 100, y: 180, label: "C" },
      { type: "player", x: 175, y: 160, label: "RW" },
      { type: "puck", x: 30, y: 240 },
      { type: "pass", x: 55, y: 215, x2: 145, y2: 215, label: "1" },
      { type: "pass", x: 150, y: 213, x2: 30, y2: 167, label: "2" },
      { type: "skating", x: 30, y: 155, x2: 40, y2: 90 },
      { type: "pass", x: 42, y: 88, x2: 95, y2: 78, label: "3" },
      { type: "skating", x: 100, y: 173, x2: 100, y2: 75 },
      { type: "pass", x: 105, y: 75, x2: 168, y2: 65, label: "4" },
      { type: "skating", x: 172, y: 155, x2: 170, y2: 62 },
      { type: "label", x: 100, y: 55, label: "5 -> Attack" },
    ],
  },
  // ===== 1-0 NÁJEZDY (Solo attacks - ČSLH) =====
  {
    id: "1-0-breakaway",
    title: "1-0 Breakaway from Center",
    titleCz: "1-0 nájezd ze středu",
    category: "1v0",
    rinkView: "full",
    focusTags: ["breakaway", "deking", "finishing"],
    source: "ČSLH",
    description: "Solo breakaway attack from center ice. Player picks up puck at center, attacks goal with speed. Practice dekes, fakes, and finishing. From ČSLH drill collection.",
    descriptionCz: "Sólový nájezd ze středového kruhu. Hráč sbírá puk na středu, útočí na branku s rychlostí. Trénink kliček, fintování a zakončení. Ze zásobníku cvičení ČSLH.",
    elements: [
      { type: "player", x: 100, y: 200, label: "1" },
      { type: "puck", x: 100, y: 140 },
      { type: "goalie", x: 100, y: 30 },
      { type: "skating", x: 100, y: 192, x2: 100, y2: 148 },
      { type: "skating-puck", x: 100, y: 135, x2: 90, y2: 80 },
      { type: "skating-puck", x: 90, y: 78, x2: 110, y2: 55 },
      { type: "shot", x: 110, y: 52, x2: 103, y2: 37 },
    ],
  },
  {
    id: "1-0-wall-pickup",
    title: "1-0 Wall Pickup Breakaway",
    titleCz: "1-0 nájezd po sběru od mantinelu",
    category: "1v0",
    rinkView: "full",
    focusTags: ["breakaway", "puck pickup", "speed"],
    source: "ČSLH",
    description: "Player starts from corner, picks up puck along the boards, skates wide then cuts to center for shot. Builds wall pickup skill and attack angles.",
    descriptionCz: "Hráč startuje z rohu, sbírá puk u mantinelu, bruslí široce a poté stáčí ke středu na střelu. Buduje dovednost sběru puku a útočné úhly.",
    elements: [
      { type: "player", x: 30, y: 240, label: "1" },
      { type: "puck", x: 25, y: 180 },
      { type: "goalie", x: 100, y: 30 },
      { type: "skating", x: 30, y: 232, x2: 27, y2: 188 },
      { type: "skating-puck", x: 28, y: 175, x2: 35, y2: 120 },
      { type: "skating-puck", x: 38, y: 115, x2: 80, y2: 65 },
      { type: "shot", x: 83, y: 62, x2: 100, y2: 37 },
    ],
  },
  {
    id: "1-0-mohawk-deke",
    title: "1-0 Mohawk Turn & Deke",
    titleCz: "1-0 Mohawk obrat a klička",
    category: "1v0",
    rinkView: "half-left",
    focusTags: ["breakaway", "mohawk", "deking"],
    source: "Bukač",
    description: "Bukač-style drill: player approaches goal, performs Mohawk turn (open hip pivot) to create space, then dekes the goalie. Focus on edge work and hip opening.",
    descriptionCz: "Cvičení ve stylu Bukače: hráč přijíždí k bráně, provede Mohawk obrat (pivot s otevřením boků) pro vytvoření prostoru, pak obehraje brankáře. Důraz na hrany a otevírání boků.",
    elements: [
      { type: "player", x: 60, y: 220, label: "1" },
      { type: "goalie", x: 100, y: 48 },
      { type: "puck", x: 55, y: 228 },
      { type: "skating-puck", x: 62, y: 215, x2: 80, y2: 150 },
      { type: "pivot", x: 82, y: 145, cx: 0, cy: 270 },
      { type: "skating-puck", x: 85, y: 140, x2: 115, y2: 100 },
      { type: "skating-puck", x: 115, y: 97, x2: 95, y2: 70 },
      { type: "shot", x: 95, y: 67, x2: 100, y2: 55 },
      { type: "label", x: 55, y: 145, label: "Mohawk" },
    ],
  },
  // ===== 2-0 ÚTOKY (ČSLH) =====
  {
    id: "2-0-cross",
    title: "2-0 Cross Pattern",
    titleCz: "2-0 křížení drah",
    category: "2v0",
    rinkView: "full",
    focusTags: ["2v0", "crossing", "passing", "timing"],
    source: "ČSLH",
    description: "Two forwards attack 2-0 with crossing paths. F1 carries puck, crosses with F2 who receives for the shot. Classic ČSLH 2-0 crossing drill from Trenérské listy.",
    descriptionCz: "Dva útočníci útočí 2-0 s křížením drah. F1 vede puk, kříží se s F2, který přijímá pro střelu. Klasické cvičení křížení 2-0 z Trenérských listů ČSLH.",
    elements: [
      { type: "player", x: 60, y: 230, label: "F1" },
      { type: "player", x: 140, y: 230, label: "F2" },
      { type: "goalie", x: 100, y: 30 },
      { type: "puck", x: 55, y: 238 },
      { type: "skating-puck", x: 63, y: 222, x2: 130, y2: 120 },
      { type: "skating", x: 137, y: 222, x2: 70, y2: 120 },
      { type: "pass", x: 127, y: 123, x2: 75, y2: 118 },
      { type: "shot", x: 73, y: 115, x2: 98, y2: 37 },
      { type: "label", x: 100, y: 160, label: "CROSS" },
    ],
  },
  {
    id: "2-0-give-go-attack",
    title: "2-0 Give & Go Attack",
    titleCz: "2-0 nahrávka a jdi - útok",
    category: "2v0",
    rinkView: "full",
    focusTags: ["2v0", "passing", "timing", "give-go"],
    source: "ČSLH",
    description: "Two forwards practice quick give-and-go in neutral zone, then attack goal. Emphasis on quick passes and accelerating after passing.",
    descriptionCz: "Dva útočníci trénují rychlou výměnu přihrávek ve středním pásmu, poté útočí na branku. Důraz na rychlé přihrávky a zrychlení po přihrávce.",
    elements: [
      { type: "player", x: 60, y: 220, label: "1" },
      { type: "player", x: 140, y: 200, label: "2" },
      { type: "goalie", x: 100, y: 30 },
      { type: "puck", x: 55, y: 228 },
      { type: "skating-puck", x: 63, y: 215, x2: 70, y2: 170 },
      { type: "pass", x: 73, y: 168, x2: 135, y2: 145 },
      { type: "skating", x: 75, y: 165, x2: 85, y2: 100 },
      { type: "pass", x: 133, y: 140, x2: 88, y2: 98 },
      { type: "shot", x: 88, y: 95, x2: 100, y2: 37 },
    ],
  },
  {
    id: "2-0-rotation-corner",
    title: "2-0 Corner Rotation",
    titleCz: "2-0 rotace v rohu",
    category: "2v0",
    rinkView: "zone-left",
    focusTags: ["2v0", "rotation", "corner", "support"],
    source: "Bukač",
    description: "Bukač-style corner rotation: two players practice cycling in the corner with support positioning. Player 1 controls behind net, Player 2 provides net-front option.",
    descriptionCz: "Rotace v rohu ve stylu Bukače: dva hráči trénují cyklení v rohu s podpůrným postavením. Hráč 1 kontroluje za brankou, hráč 2 poskytuje opci před brankou.",
    elements: [
      { type: "player", x: 40, y: 120, label: "1" },
      { type: "player", x: 140, y: 180, label: "2" },
      { type: "goalie", x: 100, y: 48 },
      { type: "puck", x: 35, y: 128 },
      { type: "skating-puck", x: 43, y: 115, x2: 60, y2: 70 },
      { type: "curve", x: 65, y: 68, x2: 130, y2: 68, cx: 100, cy: 30 },
      { type: "skating", x: 137, y: 173, x2: 110, y2: 90 },
      { type: "pass", x: 128, y: 70, x2: 113, y2: 88 },
      { type: "shot", x: 112, y: 85, x2: 103, y2: 55 },
      { type: "label", x: 35, y: 90, label: "Behind net" },
    ],
  },
  // ===== 3-0 ÚTOKY (ČSLH) =====
  {
    id: "3-0-line-rush",
    title: "3-0 Full Line Rush",
    titleCz: "3-0 útok celé formace",
    category: "3v0",
    rinkView: "full",
    focusTags: ["3v0", "line rush", "passing", "width"],
    source: "ČSLH",
    description: "Three forwards attack 3-0 using full ice width. Center carries, distributes to wings. Practice maintaining lane discipline and timing. ČSLH standard 3-0 drill.",
    descriptionCz: "Tři útočníci útočí 3-0 s využitím celé šířky kluziště. Centr vede, rozehrává na křídla. Trénink udržení drah a načasování. Standardní cvičení ČSLH.",
    elements: [
      { type: "player", x: 30, y: 220, label: "LW" },
      { type: "player", x: 100, y: 230, label: "C" },
      { type: "player", x: 170, y: 220, label: "RW" },
      { type: "goalie", x: 100, y: 30 },
      { type: "puck", x: 95, y: 238 },
      { type: "skating", x: 30, y: 212, x2: 35, y2: 80 },
      { type: "skating-puck", x: 100, y: 222, x2: 100, y2: 120 },
      { type: "skating", x: 170, y: 212, x2: 165, y2: 80 },
      { type: "pass", x: 97, y: 115, x2: 40, y2: 85 },
      { type: "pass", x: 42, y: 82, x2: 95, y2: 55 },
      { type: "shot", x: 98, y: 52, x2: 100, y2: 37 },
    ],
  },
  {
    id: "3-0-trailer",
    title: "3-0 With Trailing Center",
    titleCz: "3-0 s dojíždějícím centrem",
    category: "3v0",
    rinkView: "full",
    focusTags: ["3v0", "trailer", "delay", "timing"],
    source: "ČSLH",
    description: "Wing carries wide, center trails as delayed option. Wing passes back to trailer for shot. Standard ČSLH pattern for utilizing trailing support.",
    descriptionCz: "Křídlo vede široce, centr dojíždí jako zpožděná opce. Křídlo přihrává zpět na dojíždějícího pro střelu. Standardní vzor ČSLH pro využití dojíždějící podpory.",
    elements: [
      { type: "player", x: 40, y: 220, label: "LW" },
      { type: "player", x: 100, y: 240, label: "C" },
      { type: "player", x: 160, y: 220, label: "RW" },
      { type: "goalie", x: 100, y: 30 },
      { type: "puck", x: 35, y: 228 },
      { type: "skating-puck", x: 43, y: 215, x2: 50, y2: 80 },
      { type: "skating", x: 100, y: 232, x2: 100, y2: 105 },
      { type: "skating", x: 158, y: 215, x2: 155, y2: 80 },
      { type: "pass", x: 53, y: 78, x2: 97, y2: 100 },
      { type: "shot", x: 100, y: 97, x2: 100, y2: 37 },
      { type: "label", x: 130, y: 165, label: "Trailer" },
    ],
  },
  // ===== STŘELBA (Shooting) =====
  {
    id: "shooting-one-timer",
    title: "One-Timer from Circle",
    titleCz: "Střela z první z kruhu",
    category: "shooting",
    rinkView: "zone-left",
    focusTags: ["shooting", "one-timer", "passing"],
    source: "ČSLH",
    description: "Player at the half-wall passes to shooter positioned at the faceoff circle for a one-timer. Classic ČSLH shooting drill.",
    descriptionCz: "Hráč u mantinelu přihrává střelci v pozici u kruhu pro střelu z první. Klasické střelecké cvičení ČSLH.",
    elements: [
      { type: "player", x: 30, y: 120, label: "P" },
      { type: "player", x: 130, y: 150, label: "S" },
      { type: "goalie", x: 100, y: 48 },
      { type: "pass", x: 37, y: 118, x2: 123, y2: 148 },
      { type: "shot", x: 130, y: 143, x2: 103, y2: 55 },
      { type: "puck", x: 25, y: 112 },
      { type: "cone", x: 100, y: 120 },
    ],
  },
  {
    id: "shooting-wrist-angles",
    title: "Wrist Shot from Angles",
    titleCz: "Zápěstní střely z různých úhlů",
    category: "shooting",
    rinkView: "zone-left",
    focusTags: ["shooting", "wrist shot", "angles"],
    source: "ČSLH",
    description: "Player skates through slot taking wrist shots from different angles. Focus on quick release and accuracy. Based on ČSLH shooting methodology.",
    descriptionCz: "Hráč bruslí přes prostor před brankou a střílí zápěstní střely z různých úhlů. Důraz na rychlé uvolnění a přesnost. Metodika střelby ČSLH.",
    elements: [
      { type: "player", x: 40, y: 220, label: "1" },
      { type: "goalie", x: 100, y: 48 },
      { type: "puck", x: 35, y: 228 },
      { type: "skating-puck", x: 45, y: 215, x2: 70, y2: 150 },
      { type: "shot", x: 72, y: 145, x2: 98, y2: 55 },
      { type: "skating-puck", x: 75, y: 155, x2: 140, y2: 130 },
      { type: "shot", x: 138, y: 127, x2: 105, y2: 55 },
      { type: "cone", x: 80, y: 170 },
      { type: "cone", x: 120, y: 145 },
    ],
  },
  {
    id: "shooting-slot-rebound",
    title: "Slot Shot & Rebound",
    titleCz: "Střela z prostoru a doražení",
    category: "shooting",
    rinkView: "zone-left",
    focusTags: ["shooting", "rebound", "net-front"],
    description: "First shot from the slot, second player crashes the net for the rebound. Practice net-front presence and anticipation.",
    descriptionCz: "První střela z prostoru, druhý hráč najíždí na branku pro doražení. Trénink přítomnosti před brankou a anticipace.",
    elements: [
      { type: "player", x: 100, y: 180, label: "1" },
      { type: "player", x: 160, y: 140, label: "2" },
      { type: "goalie", x: 100, y: 48 },
      { type: "shot", x: 100, y: 173, x2: 100, y2: 55 },
      { type: "skating", x: 157, y: 135, x2: 115, y2: 70 },
      { type: "label", x: 145, y: 100, label: "Rebound" },
      { type: "puck", x: 95, y: 188 },
    ],
  },
  {
    id: "shooting-spinorama",
    title: "Shot from Spinorama Turn",
    titleCz: "Střela po otočce (spinorama)",
    category: "shooting",
    rinkView: "zone-left",
    focusTags: ["shooting", "spinorama", "deking"],
    source: "Bukač",
    description: "Bukač-style: player skates into the slot, performs a full 360 spinorama turn, then shoots. Trains coordination, balance, and shooting from creative positions.",
    descriptionCz: "Ve stylu Bukače: hráč bruslí do prostoru, provede celou otočku spinorama (360°), poté střílí. Trénuje koordinaci, rovnováhu a střelbu z kreativních pozic.",
    elements: [
      { type: "player", x: 40, y: 200, label: "1" },
      { type: "goalie", x: 100, y: 48 },
      { type: "puck", x: 35, y: 208 },
      { type: "skating-puck", x: 45, y: 195, x2: 90, y2: 130 },
      { type: "tight-turn", x: 95, y: 125 },
      { type: "shot", x: 100, y: 120, x2: 102, y2: 55 },
      { type: "label", x: 60, y: 120, label: "360" },
    ],
  },
  // ===== BRUSLENÍ (Skating) =====
  {
    id: "skating-agility-cones",
    title: "Agility Cone Slalom",
    titleCz: "Obratnostní slalom mezi kužely",
    category: "skating",
    rinkView: "full",
    focusTags: ["skating", "agility", "edges"],
    description: "Skate through cones in a zigzag pattern. Focus on tight turns, crossovers, and edge control.",
    descriptionCz: "Bruslení mezi kužely cik-cak. Důraz na ostré zatáčky, přešlapy a práci s hranami.",
    elements: [
      { type: "cone", x: 100, y: 60 },
      { type: "cone", x: 100, y: 100 },
      { type: "cone", x: 100, y: 140 },
      { type: "cone", x: 100, y: 180 },
      { type: "cone", x: 100, y: 220 },
      { type: "player", x: 100, y: 248, label: "1" },
      { type: "skating", x: 100, y: 240, x2: 75, y2: 225 },
      { type: "skating", x: 75, y: 225, x2: 125, y2: 195 },
      { type: "skating", x: 125, y: 195, x2: 75, y2: 155 },
      { type: "skating", x: 75, y: 155, x2: 125, y2: 115 },
      { type: "skating", x: 125, y: 115, x2: 75, y2: 75 },
      { type: "skating", x: 75, y: 75, x2: 100, y2: 40 },
    ],
  },
  {
    id: "skating-lateral-escape",
    title: "Lateral Escape Skating",
    titleCz: "Laterální únikové bruslení",
    category: "skating",
    rinkView: "half-left",
    focusTags: ["skating", "lateral", "escape", "edges"],
    source: "Bukač",
    description: "Bukač lateral escape drill: player skates forward, performs lateral moves (side steps) to evade imaginary pressure, then accelerates. Builds 'escape' capability.",
    descriptionCz: "Laterální únikové cvičení Bukače: hráč bruslí vpřed, provádí boční pohyby (úkroky) k úniku od imaginárního tlaku, poté zrychluje. Buduje schopnost 'escape'.",
    elements: [
      { type: "player", x: 100, y: 220, label: "1" },
      { type: "cone", x: 60, y: 170 },
      { type: "cone", x: 140, y: 120 },
      { type: "cone", x: 60, y: 70 },
      { type: "skating", x: 100, y: 212, x2: 100, y2: 185 },
      { type: "skating", x: 100, y: 183, x2: 65, y2: 178 },
      { type: "skating", x: 65, y: 175, x2: 100, y2: 150 },
      { type: "skating", x: 100, y: 148, x2: 135, y2: 128 },
      { type: "skating", x: 135, y: 125, x2: 100, y2: 100 },
      { type: "skating", x: 100, y: 98, x2: 65, y2: 78 },
      { type: "skating", x: 65, y: 75, x2: 100, y2: 45 },
      { type: "label", x: 45, y: 195, label: "Escape L" },
      { type: "label", x: 155, y: 140, label: "Escape R" },
    ],
  },
  {
    id: "skating-edge-weave",
    title: "Edge Weave & Mohawk",
    titleCz: "Vlnky na hranách a Mohawk obraty",
    category: "skating",
    rinkView: "half-left",
    focusTags: ["skating", "edges", "mohawk", "turns"],
    source: "Bukač",
    description: "Bukač-style: players weave through cones using outside edges, perform Mohawk (open hip) turn at end cone. Builds edge work and flexible hip opening.",
    descriptionCz: "Ve stylu Bukače: hráči vlní mezi kužely na vnějších hranách, provádí Mohawk obrat (otevření boků) u posledního kužele. Buduje práci s hranami a flexibilní otevírání boků.",
    elements: [
      { type: "player", x: 30, y: 220, label: "1" },
      { type: "cone", x: 60, y: 180 },
      { type: "cone", x: 100, y: 140 },
      { type: "cone", x: 140, y: 100 },
      { type: "cone", x: 170, y: 60 },
      { type: "skating", x: 35, y: 215, x2: 55, y2: 188 },
      { type: "skating", x: 65, y: 175, x2: 95, y2: 148 },
      { type: "skating", x: 105, y: 135, x2: 135, y2: 108 },
      { type: "skating", x: 145, y: 95, x2: 165, y2: 68 },
      { type: "pivot", x: 170, y: 60, cx: 0, cy: 270 },
      { type: "skating-backward", x: 170, y: 55, x2: 130, y2: 45 },
      { type: "label", x: 155, y: 40, label: "Mohawk" },
    ],
  },
  // ===== HERNÍ SITUACE (Game situations) =====
  {
    id: "1v1-off-wall",
    title: "1v1 Off the Wall",
    titleCz: "1v1 od mantinelu",
    category: "game",
    rinkView: "zone-left",
    focusTags: ["1v1", "puck protection", "defense"],
    description: "Forward picks up puck off the wall, defender closes gap. Live 1v1 to the net.",
    descriptionCz: "Útočník sbírá puk od mantinelu, obránce zavírá prostor. Živé 1v1 na branku.",
    elements: [
      { type: "puck", x: 25, y: 200 },
      { type: "player", x: 50, y: 220, label: "F" },
      { type: "defender", x: 100, y: 130, label: "D" },
      { type: "goalie", x: 100, y: 48 },
      { type: "skating-puck", x: 48, y: 212, x2: 30, y2: 205 },
      { type: "skating-puck", x: 55, y: 215, x2: 90, y2: 120 },
      { type: "skating-backward", x: 100, y: 123, x2: 100, y2: 65 },
    ],
  },
  {
    id: "1v1-angle-defense",
    title: "1v1 Defensive Angling",
    titleCz: "1v1 vyúhlování útočníka",
    category: "game",
    rinkView: "full",
    focusTags: ["1v1", "angling", "defense", "gap control"],
    source: "ČSLH",
    description: "ČSLH defensive drill: defender practices angling attacker towards the boards. Focus on gap control, stick positioning, and steering to the outside. From Činnosti obránce section.",
    descriptionCz: "Obranné cvičení ČSLH: obránce trénuje vyúhlování útočníka k mantinelu. Důraz na kontrolu mezery, pozici hole a navedení ven. Ze sekce Činnosti obránce.",
    elements: [
      { type: "player", x: 80, y: 200, label: "F" },
      { type: "defender", x: 120, y: 140, label: "D" },
      { type: "goalie", x: 100, y: 30 },
      { type: "puck", x: 75, y: 208 },
      { type: "skating-puck", x: 82, y: 193, x2: 75, y2: 120 },
      { type: "skating-backward", x: 118, y: 133, x2: 50, y2: 75 },
      { type: "curve", x: 120, y: 133, x2: 50, y2: 80, cx: 65, cy: 95 },
      { type: "label", x: 55, y: 55, label: "Boards" },
      { type: "label", x: 135, y: 110, label: "Angle" },
    ],
  },
  {
    id: "2v1-rush",
    title: "2v1 Rush Attack",
    titleCz: "2v1 rychlý útok",
    category: "game",
    rinkView: "full",
    focusTags: ["2v1", "passing", "offense"],
    source: "ČSLH",
    description: "Two forwards attack against one defender. Focus on wide entry, passing options, and timing. Standard ČSLH 2v1 drill.",
    descriptionCz: "Dva útočníci útočí proti jednomu obránci. Důraz na široký nájezd, přihrávky a načasování. Standardní cvičení ČSLH.",
    elements: [
      { type: "player", x: 60, y: 230, label: "F1" },
      { type: "player", x: 140, y: 230, label: "F2" },
      { type: "defender", x: 100, y: 100, label: "D" },
      { type: "goalie", x: 100, y: 30 },
      { type: "skating-puck", x: 62, y: 222, x2: 70, y2: 120 },
      { type: "skating", x: 138, y: 222, x2: 130, y2: 120 },
      { type: "pass", x: 73, y: 115, x2: 125, y2: 115 },
      { type: "shot", x: 128, y: 112, x2: 103, y2: 37 },
      { type: "skating-backward", x: 100, y: 95, x2: 100, y2: 55 },
    ],
  },
  {
    id: "3v2-breakout",
    title: "3v2 Breakout Play",
    titleCz: "3v2 rozehrávka",
    category: "game",
    rinkView: "full",
    focusTags: ["breakout", "passing", "teamplay"],
    source: "ČSLH",
    description: "Three forwards practice breakout play against two defenders. D retrieves and starts breakout. Standard ČSLH 5-0 breakout pattern.",
    descriptionCz: "Tři útočníci trénují rozehrávku proti dvěma obráncům. Obránce sbírá puk a zahajuje rozehrávku. Standardní rozehrávkový vzor ČSLH.",
    elements: [
      { type: "defender", x: 50, y: 210, label: "D1" },
      { type: "defender", x: 150, y: 210, label: "D2" },
      { type: "player", x: 30, y: 170, label: "LW" },
      { type: "player", x: 100, y: 170, label: "C" },
      { type: "player", x: 170, y: 170, label: "RW" },
      { type: "puck", x: 30, y: 240 },
      { type: "skating-puck", x: 45, y: 215, x2: 35, y2: 235 },
      { type: "pass", x: 45, y: 205, x2: 33, y2: 177 },
      { type: "skating", x: 35, y: 165, x2: 40, y2: 80 },
      { type: "pass", x: 105, y: 168, x2: 110, y2: 80 },
      { type: "skating", x: 168, y: 165, x2: 160, y2: 80 },
    ],
  },
  // ===== OBRANA (Defense - ČSLH Činnosti obránce) =====
  {
    id: "defense-gap-control",
    title: "Gap Control Drill",
    titleCz: "Cvičení kontroly mezery",
    category: "defense",
    rinkView: "full",
    focusTags: ["defense", "gap", "skating", "positioning"],
    source: "ČSLH",
    description: "Defender practices maintaining proper gap as forward approaches with puck. From ČSLH 'Činnosti obránce' section.",
    descriptionCz: "Obránce trénuje udržování správné mezery při nájezdu útočníka s pukem. Ze sekce 'Činnosti obránce' ČSLH.",
    elements: [
      { type: "player", x: 100, y: 230, label: "F" },
      { type: "defender", x: 100, y: 130, label: "D" },
      { type: "goalie", x: 100, y: 30 },
      { type: "puck", x: 95, y: 238 },
      { type: "skating-puck", x: 100, y: 222, x2: 100, y2: 150 },
      { type: "skating-backward", x: 100, y: 125, x2: 100, y2: 55 },
      { type: "label", x: 60, y: 180, label: "GAP" },
      { type: "stop", x: 100, y: 148 },
    ],
  },
  {
    id: "defense-box-out",
    title: "Net-Front Box Out",
    titleCz: "Boxování před brankou",
    category: "defense",
    rinkView: "goal-area",
    focusTags: ["defense", "net-front", "body position"],
    source: "ČSLH",
    description: "Defender practices boxing out the attacker from the net-front area. Keep stick on puck, body on body. From ČSLH defensive methodology.",
    descriptionCz: "Obránce trénuje vytlačování útočníka z prostoru před brankou. Hůl na puk, tělo na tělo. Z metodiky obrany ČSLH.",
    elements: [
      { type: "defender", x: 100, y: 130, label: "D" },
      { type: "player", x: 120, y: 160, label: "F" },
      { type: "goalie", x: 100, y: 65 },
      { type: "screen", x: 100, y: 110 },
      { type: "skating", x: 118, y: 153, x2: 105, y2: 120 },
      { type: "skating-backward", x: 100, y: 125, x2: 100, y2: 100 },
      { type: "puck", x: 50, y: 120 },
      { type: "shot", x: 55, y: 120, x2: 95, y2: 70 },
    ],
  },
  {
    id: "defense-shot-block",
    title: "Shot Blocking Lanes",
    titleCz: "Blokování střeleckých drah",
    category: "defense",
    rinkView: "zone-right",
    focusTags: ["defense", "shot blocking", "positioning"],
    source: "ČSLH",
    description: "Defenders practice positioning to block shooting lanes. Two D's maintain triangle with goalie. From ČSLH herní činnosti pro obranu section.",
    descriptionCz: "Obránci trénují postavení pro blokování střeleckých drah. Dva obránci udržují trojúhelník s brankářem. Ze sekce herní činnosti pro obranu ČSLH.",
    elements: [
      { type: "defender", x: 70, y: 130, label: "D1" },
      { type: "defender", x: 130, y: 130, label: "D2" },
      { type: "goalie", x: 100, y: 210 },
      { type: "player", x: 50, y: 80, label: "F1" },
      { type: "player", x: 150, y: 80, label: "F2" },
      { type: "puck", x: 45, y: 88 },
      { type: "pass", x: 55, y: 78, x2: 73, y2: 123 },
      { type: "pass", x: 145, y: 78, x2: 127, y2: 123 },
      { type: "label", x: 100, y: 170, label: "Block lanes" },
    ],
  },
  // ===== ZAPRACOVÁNÍ (Warm-up) =====
  {
    id: "warmup-flow",
    title: "Full-Ice Flow Warmup",
    titleCz: "Rozbruslení - průtočné celé kluziště",
    category: "warmup",
    rinkView: "full",
    focusTags: ["warmup", "skating", "puck handling"],
    source: "ČSLH",
    description: "Low-intensity full-ice laps with movement variety. Activate edges, hands, and heads up. Based on ČSLH zapracování methodology for training start.",
    descriptionCz: "Rozbruslení na celém kluzišti s variací pohybu. Aktivace hran, rukou a hlavy nahoře. Metodika zapracování ČSLH pro začátek tréninku.",
    elements: [
      { type: "player", x: 50, y: 240, label: "1" },
      { type: "player", x: 80, y: 240, label: "2" },
      { type: "player", x: 110, y: 240, label: "3" },
      { type: "cone", x: 40, y: 180 },
      { type: "cone", x: 100, y: 130 },
      { type: "cone", x: 160, y: 80 },
      { type: "cone", x: 100, y: 40 },
      { type: "skating-puck", x: 48, y: 232, x2: 42, y2: 188 },
      { type: "skating-puck", x: 45, y: 175, x2: 95, y2: 138 },
      { type: "skating-puck", x: 105, y: 125, x2: 155, y2: 88 },
      { type: "skating-puck", x: 155, y: 75, x2: 105, y2: 48 },
    ],
  },
  {
    id: "warmup-stations",
    title: "4-Station Warm-up Circuit",
    titleCz: "Rozbruslení - 4 stanoviště",
    category: "warmup",
    rinkView: "full",
    focusTags: ["warmup", "stations", "multi-skill"],
    source: "ČSLH",
    ageGroup: "U8-U10",
    description: "Multi-station warmup for youngest players: puck handling, skating edges, passing, shooting. Each station 3 minutes with rotation signal from coach.",
    descriptionCz: "Stanovištní rozbruslení pro nejmladší: vedení puku, hrany, přihrávky, střelba. Každé stanoviště 3 minuty s rotačním signálem od trenéra.",
    elements: [
      { type: "cone", x: 50, y: 65 },
      { type: "cone", x: 150, y: 65 },
      { type: "cone", x: 50, y: 195 },
      { type: "cone", x: 150, y: 195 },
      { type: "player", x: 50, y: 50, label: "1" },
      { type: "player", x: 150, y: 50, label: "2" },
      { type: "player", x: 50, y: 210, label: "3" },
      { type: "player", x: 150, y: 210, label: "4" },
      { type: "skating-puck", x: 55, y: 58, x2: 55, y2: 128 },
      { type: "skating", x: 148, y: 58, x2: 148, y2: 128 },
      { type: "pass", x: 55, y: 205, x2: 145, y2: 205 },
      { type: "goalie", x: 100, y: 30 },
      { type: "shot", x: 150, y: 203, x2: 103, y2: 37 },
      { type: "coach", x: 100, y: 130, label: "T" },
      { type: "label", x: 50, y: 100, label: "Puck" },
      { type: "label", x: 150, y: 100, label: "Edges" },
      { type: "label", x: 100, y: 225, label: "Pass + Shot" },
    ],
  },
  // ===== SPECIÁLNÍ FORMACE (Special Teams) =====
  {
    id: "pp-umbrella",
    title: "Power Play Umbrella (5v4)",
    titleCz: "Přesilová hra - deštník (5v4)",
    category: "specialteams",
    rinkView: "zone-left",
    focusTags: ["power play", "passing", "shooting", "5v4"],
    description: "Classic umbrella formation for 5v4 power play. Point man distributes to half-walls, look for one-timer or cross-ice pass.",
    descriptionCz: "Klasická formace deštníku pro přesilovku 5v4. Hráč na modré rozehrává na postraní, hledá střelu z první nebo křížnou přihrávku.",
    elements: [
      { type: "player", x: 100, y: 200, label: "P" },
      { type: "player", x: 30, y: 140, label: "LW" },
      { type: "player", x: 170, y: 140, label: "RW" },
      { type: "player", x: 70, y: 90, label: "N" },
      { type: "player", x: 130, y: 90, label: "B" },
      { type: "goalie", x: 100, y: 48 },
      { type: "defender", x: 80, y: 120, label: "D" },
      { type: "defender", x: 120, y: 120, label: "D" },
      { type: "pass", x: 95, y: 193, x2: 35, y2: 147 },
      { type: "pass", x: 105, y: 193, x2: 165, y2: 147 },
      { type: "pass", x: 167, y: 135, x2: 135, y2: 95 },
      { type: "shot", x: 132, y: 85, x2: 103, y2: 55 },
    ],
  },
  {
    id: "pk-diamond",
    title: "Penalty Kill Diamond (4v5)",
    titleCz: "Oslabení diamant (4v5)",
    category: "specialteams",
    rinkView: "zone-right",
    focusTags: ["penalty kill", "defense", "positioning", "4v5"],
    description: "Diamond formation for penalty kill. Focus on stick positioning, passing lane denial, and quick pressure shifts.",
    descriptionCz: "Diamantová formace pro oslabení. Důraz na pozici hole, zavírání přihrávkových cest a rychlé přesuny.",
    elements: [
      { type: "defender", x: 100, y: 100, label: "1" },
      { type: "defender", x: 60, y: 150, label: "2" },
      { type: "defender", x: 140, y: 150, label: "3" },
      { type: "defender", x: 100, y: 200, label: "4" },
      { type: "goalie", x: 100, y: 220 },
      { type: "skating-backward", x: 100, y: 107, x2: 100, y2: 130 },
      { type: "skating-backward", x: 57, y: 145, x2: 50, y2: 170 },
      { type: "skating-backward", x: 143, y: 145, x2: 150, y2: 170 },
      { type: "label", x: 100, y: 85, label: "Pressure" },
    ],
  },
  {
    id: "pp-1-3-1",
    title: "Power Play 1-3-1 Set",
    titleCz: "Přesilová hra 1-3-1",
    category: "specialteams",
    rinkView: "zone-left",
    focusTags: ["power play", "1-3-1", "passing", "net-front"],
    description: "1-3-1 power play formation with bumper player in the slot. High man distributes, bumper redirects or screens.",
    descriptionCz: "Formace přesilovky 1-3-1 s hráčem 'bumper' v prostoru. Hráč nahoře rozehrává, bumper tečuje nebo clonuje.",
    elements: [
      { type: "player", x: 100, y: 220, label: "H" },
      { type: "player", x: 30, y: 140, label: "LW" },
      { type: "player", x: 100, y: 120, label: "B" },
      { type: "player", x: 170, y: 140, label: "RW" },
      { type: "player", x: 100, y: 70, label: "NF" },
      { type: "goalie", x: 100, y: 48 },
      { type: "pass", x: 97, y: 213, x2: 35, y2: 147 },
      { type: "pass", x: 35, y: 137, x2: 95, y2: 123 },
      { type: "pass", x: 105, y: 117, x2: 165, y2: 137 },
      { type: "shot", x: 168, y: 135, x2: 105, y2: 55 },
      { type: "screen", x: 100, y: 72 },
      { type: "label", x: 100, y: 140, label: "Bumper" },
    ],
  },
  // ===== VĚKOVÉ KATEGORIE (Age-specific) =====
  {
    id: "u8-fun-relay",
    title: "U8 Fun Relay Race",
    titleCz: "U8 zábavná štafeta",
    category: "warmup",
    rinkView: "full",
    ageGroup: "U8",
    focusTags: ["kids", "fun", "relay", "skating"],
    source: "ČSLH",
    description: "Fun relay race for U8: teams line up, players skate to cone and back, tag next player. Keep it simple and fun. From ČSLH přípravka methodology.",
    descriptionCz: "Zábavná štafeta pro U8: týmy se seřadí, hráči bruslí ke kuželu a zpět, plácnou dalšího. Jednoduché a zábavné. Z metodiky přípravky ČSLH.",
    elements: [
      { type: "player", x: 40, y: 230, label: "A1" },
      { type: "player", x: 40, y: 215, label: "A2" },
      { type: "player", x: 40, y: 200, label: "A3" },
      { type: "player", x: 160, y: 230, label: "B1" },
      { type: "player", x: 160, y: 215, label: "B2" },
      { type: "player", x: 160, y: 200, label: "B3" },
      { type: "cone", x: 40, y: 60 },
      { type: "cone", x: 160, y: 60 },
      { type: "skating", x: 40, y: 222, x2: 40, y2: 68 },
      { type: "skating", x: 40, y: 55, x2: 40, y2: 195 },
      { type: "skating", x: 160, y: 222, x2: 160, y2: 68 },
      { type: "skating", x: 160, y: 55, x2: 160, y2: 195 },
      { type: "coach", x: 100, y: 130, label: "T" },
      { type: "label", x: 40, y: 248, label: "Team A" },
      { type: "label", x: 160, y: 248, label: "Team B" },
    ],
  },
  {
    id: "u12-skill-circuit",
    title: "U12 5-Station Skill Circuit",
    titleCz: "U12 dovednostní okruh 5 stanovišť",
    category: "game",
    rinkView: "full",
    ageGroup: "U10-U12",
    focusTags: ["stations", "multi-skill", "rotation"],
    source: "ČSLH",
    description: "5-station circuit for U12: skating agility, puck handling, passing, shooting, 1v1 battle. 4 minutes per station with coach-signaled rotation. ČSLH recommended format.",
    descriptionCz: "5 stanovišť pro U12: obratnost bruslení, vedení puku, přihrávky, střelba, 1v1 souboj. 4 minuty na stanoviště s rotací na signál trenéra. Doporučený formát ČSLH.",
    elements: [
      { type: "player", x: 40, y: 60, label: "A" },
      { type: "player", x: 160, y: 60, label: "B" },
      { type: "defender", x: 40, y: 200, label: "C" },
      { type: "player", x: 160, y: 200, label: "D" },
      { type: "player", x: 100, y: 130, label: "E" },
      { type: "goalie", x: 100, y: 30 },
      { type: "goalie", x: 100, y: 240 },
      { type: "skating-puck", x: 45, y: 68, x2: 80, y2: 100 },
      { type: "shot", x: 83, y: 103, x2: 100, y2: 37 },
      { type: "skating", x: 158, y: 68, x2: 130, y2: 100 },
      { type: "pass", x: 45, y: 195, x2: 90, y2: 180 },
      { type: "skating-puck", x: 158, y: 195, x2: 120, y2: 180 },
      { type: "shot", x: 118, y: 177, x2: 102, y2: 235 },
      { type: "cone", x: 80, y: 120 },
      { type: "cone", x: 120, y: 140 },
      { type: "cone", x: 100, y: 155 },
      { type: "coach", x: 100, y: 170, label: "T" },
    ],
  },
  // ===== DOPLŇKOVÉ CVIČENÍ (Additional drills) =====
  {
    id: "puck-protection",
    title: "Puck Protection in Tight Space",
    titleCz: "Ochrana puku v těsném prostoru",
    category: "game",
    rinkView: "zone-left",
    focusTags: ["puck protection", "body position", "stickhandling"],
    source: "Bukač",
    description: "Bukač drill: player practices puck protection against pressure in a small zone. Emphasis on keeping body between defender and puck, strong base, and quick hands.",
    descriptionCz: "Cvičení Bukače: hráč trénuje ochranu puku pod tlakem v malém prostoru. Důraz na tělo mezi obráncem a pukem, pevný postoj a rychlé ruce.",
    elements: [
      { type: "player", x: 100, y: 150, label: "F" },
      { type: "defender", x: 130, y: 160, label: "D" },
      { type: "puck", x: 90, y: 145 },
      { type: "cone", x: 70, y: 120 },
      { type: "cone", x: 130, y: 120 },
      { type: "cone", x: 70, y: 180 },
      { type: "cone", x: 130, y: 180 },
      { type: "skating-puck", x: 95, y: 148, x2: 75, y2: 128 },
      { type: "skating-puck", x: 78, y: 125, x2: 125, y2: 125 },
      { type: "skating-puck", x: 125, y: 128, x2: 125, y2: 172 },
      { type: "skating-puck", x: 122, y: 175, x2: 78, y2: 175 },
      { type: "label", x: 100, y: 100, label: "Protect zone" },
    ],
  },
  {
    id: "neutral-zone-regroup",
    title: "Neutral Zone Regroup",
    titleCz: "Přeskupení ve středním pásmu",
    category: "game",
    rinkView: "full",
    focusTags: ["regroup", "transition", "passing", "support"],
    source: "ČSLH",
    description: "After failed zone entry, forwards regroup in neutral zone with D support. Practice controlled re-entry with passing options. Key ČSLH transitional drill.",
    descriptionCz: "Po neúspěšném vstupu do pásma se útočníci přeskupí ve středním pásmu s podporou obránce. Trénink kontrolovaného opětovného vstupu s přihrávkovými opcemi.",
    elements: [
      { type: "player", x: 50, y: 90, label: "LW" },
      { type: "player", x: 100, y: 100, label: "C" },
      { type: "player", x: 150, y: 90, label: "RW" },
      { type: "defender", x: 80, y: 160, label: "D1" },
      { type: "defender", x: 120, y: 160, label: "D2" },
      { type: "puck", x: 45, y: 82 },
      { type: "dump", x: 50, y: 85, x2: 50, y2: 30 },
      { type: "skating", x: 52, y: 93, x2: 60, y2: 140 },
      { type: "skating", x: 100, y: 107, x2: 100, y2: 140 },
      { type: "skating", x: 148, y: 93, x2: 140, y2: 140 },
      { type: "pass", x: 83, y: 155, x2: 63, y2: 143 },
      { type: "skating-puck", x: 65, y: 140, x2: 65, y2: 90 },
      { type: "label", x: 100, y: 75, label: "Regroup" },
    ],
  },
  {
    id: "5-0-full-breakout",
    title: "5-0 Full Team Breakout",
    titleCz: "5-0 rozehrávka celé pětky",
    category: "game",
    rinkView: "full",
    focusTags: ["5v0", "breakout", "teamplay", "full-line"],
    source: "ČSLH",
    description: "Full 5-player breakout without opposition. D1 retrieves in corner, passes to D2, D2 up to wing, center supports middle. Standard ČSLH 5-0 from Trenérské listy.",
    descriptionCz: "Rozehrávka celé pětky bez soupeře. O1 sbírá v rohu, přihrává O2, O2 nahoru na křídlo, centr podporuje středem. Standardní 5-0 z Trenérských listů ČSLH.",
    elements: [
      { type: "defender", x: 40, y: 220, label: "D1" },
      { type: "defender", x: 160, y: 220, label: "D2" },
      { type: "player", x: 20, y: 170, label: "LW" },
      { type: "player", x: 100, y: 190, label: "C" },
      { type: "player", x: 180, y: 170, label: "RW" },
      { type: "puck", x: 20, y: 245 },
      { type: "skating-puck", x: 38, y: 225, x2: 25, y2: 240 },
      { type: "pass", x: 35, y: 218, x2: 155, y2: 218 },
      { type: "pass", x: 157, y: 213, x2: 25, y2: 168 },
      { type: "skating", x: 25, y: 165, x2: 30, y2: 70 },
      { type: "skating", x: 100, y: 183, x2: 100, y2: 70 },
      { type: "skating", x: 178, y: 165, x2: 170, y2: 70 },
      { type: "label", x: 100, y: 55, label: "Attack!" },
    ],
  },
];

export const DRILL_CATEGORIES = [
  { id: "all", labelEn: "All Drills", labelCz: "Všechna cvičení" },
  { id: "conditioning", labelEn: "Conditioning", labelCz: "Kondiční bruslení" },
  { id: "skating", labelEn: "Skating", labelCz: "Bruslení" },
  { id: "passing", labelEn: "Passing", labelCz: "Přihrávky" },
  { id: "shooting", labelEn: "Shooting", labelCz: "Střelba" },
  { id: "1v0", labelEn: "1-0 Breakaways", labelCz: "1-0 Nájezdy" },
  { id: "2v0", labelEn: "2-0 Attacks", labelCz: "2-0 Útoky" },
  { id: "3v0", labelEn: "3-0 Attacks", labelCz: "3-0 Útoky" },
  { id: "game", labelEn: "Game Situations", labelCz: "Herní situace" },
  { id: "defense", labelEn: "Defense", labelCz: "Obrana" },
  { id: "warmup", labelEn: "Warm-up", labelCz: "Zapracování" },
  { id: "specialteams", labelEn: "Special Teams", labelCz: "Speciální formace" },
];
