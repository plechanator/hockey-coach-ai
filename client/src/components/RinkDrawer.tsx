import { useLanguage } from "@/hooks/use-language";

const ZONE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
const PRINT_COLOR = "#333333";

interface ZoneArea {
  x_start: number;
  y_start: number;
  width: number;
  height: number;
}

interface StationZone {
  station_id: number;
  zone_area?: ZoneArea;
  zone_label?: string;
  zone_color?: string;
  title?: string;
  focus_tags?: string[];
  type?: string;
}

interface LayoutZone {
  station_id: number;
  zone_area: ZoneArea;
  zone_label?: string;
}

interface RinkDrawerProps {
  iceConfig: string;
  stations?: number;
  stationData?: StationZone[];
  layoutType?: string;
  layoutZones?: LayoutZone[];
  width?: number;
  height?: number;
  printMode?: boolean;
}

export const LAYOUT_TEMPLATES: Record<string, { name: string; description: string; stations: number; iceConfig: string; zones: LayoutZone[] }> = {
  "2-1-2": {
    name: "2-1-2 Zone Model",
    description: "2 offensive + 1 neutral + 2 defensive",
    stations: 5,
    iceConfig: "Full Ice",
    zones: [
      { station_id: 1, zone_area: { x_start: 0, y_start: 0, width: 25, height: 50 }, zone_label: "Off. 1" },
      { station_id: 2, zone_area: { x_start: 0, y_start: 50, width: 25, height: 50 }, zone_label: "Off. 2" },
      { station_id: 3, zone_area: { x_start: 25, y_start: 0, width: 50, height: 100 }, zone_label: "Neutral" },
      { station_id: 4, zone_area: { x_start: 75, y_start: 0, width: 25, height: 50 }, zone_label: "Def. 1" },
      { station_id: 5, zone_area: { x_start: 75, y_start: 50, width: 25, height: 50 }, zone_label: "Def. 2" },
    ],
  },
  "4-lanes": {
    name: "4 Vertical Lanes",
    description: "4 parallel lanes",
    stations: 4,
    iceConfig: "Full Ice",
    zones: [
      { station_id: 1, zone_area: { x_start: 0, y_start: 0, width: 25, height: 100 }, zone_label: "Lane 1" },
      { station_id: 2, zone_area: { x_start: 25, y_start: 0, width: 25, height: 100 }, zone_label: "Lane 2" },
      { station_id: 3, zone_area: { x_start: 50, y_start: 0, width: 25, height: 100 }, zone_label: "Lane 3" },
      { station_id: 4, zone_area: { x_start: 75, y_start: 0, width: 25, height: 100 }, zone_label: "Lane 4" },
    ],
  },
  "3-zones": {
    name: "3 Horizontal Zones",
    description: "Defensive + Neutral + Offensive",
    stations: 3,
    iceConfig: "Full Ice",
    zones: [
      { station_id: 1, zone_area: { x_start: 0, y_start: 0, width: 33, height: 100 }, zone_label: "Defense" },
      { station_id: 2, zone_area: { x_start: 33, y_start: 0, width: 34, height: 100 }, zone_label: "Neutral" },
      { station_id: 3, zone_area: { x_start: 67, y_start: 0, width: 33, height: 100 }, zone_label: "Offense" },
    ],
  },
  "half-ice-4": {
    name: "Half-Ice Segments",
    description: "4 segments in half ice",
    stations: 4,
    iceConfig: "Half Ice",
    zones: [
      { station_id: 1, zone_area: { x_start: 0, y_start: 0, width: 25, height: 50 }, zone_label: "Seg. 1" },
      { station_id: 2, zone_area: { x_start: 25, y_start: 0, width: 25, height: 50 }, zone_label: "Seg. 2" },
      { station_id: 3, zone_area: { x_start: 0, y_start: 50, width: 25, height: 50 }, zone_label: "Seg. 3" },
      { station_id: 4, zone_area: { x_start: 25, y_start: 50, width: 25, height: 50 }, zone_label: "Seg. 4" },
    ],
  },
};

function calculateStationZones(iceConfig: string, stationCount: number, layoutType?: string, layoutZones?: LayoutZone[]): ZoneArea[] {
  if (layoutZones && layoutZones.length > 0) {
    return layoutZones.map(z => z.zone_area);
  }

  if (layoutType && layoutType !== "auto" && layoutType !== "custom" && LAYOUT_TEMPLATES[layoutType]) {
    return LAYOUT_TEMPLATES[layoutType].zones.map(z => z.zone_area);
  }

  const zones: ZoneArea[] = [];
  if (stationCount <= 1) {
    zones.push({ x_start: 0, y_start: 0, width: 100, height: 100 });
    return zones;
  }

  const effectiveWidth = iceConfig === "Half Ice" ? 50 : 100;
  for (let i = 0; i < stationCount; i++) {
    const w = effectiveWidth / stationCount;
    zones.push({ x_start: i * w, y_start: 0, width: w, height: 100 });
  }
  return zones;
}

export function RinkDrawer({ iceConfig, stations = 1, stationData, layoutType, layoutZones, width = 600, height = 300, printMode = false }: RinkDrawerProps) {
  const { t } = useLanguage();
  
  const pad = 10;
  const rinkW = width - pad * 2;
  const rinkH = height - pad * 2;

  const lineColor = printMode ? "#000" : "#1a5276";
  const redLine = printMode ? "#444" : "#D62828";
  const blueLine = printMode ? "#666" : "#2471a3";
  const bgFill = printMode ? "#fff" : "url(#iceTexture)";

  const renderIceBase = () => (
    <g>
      {!printMode && (
        <defs>
          <pattern id="iceTexture" patternUnits="userSpaceOnUse" width="40" height="40">
            <rect width="40" height="40" fill="#e8f4fd" />
            <circle cx="20" cy="20" r="18" fill="#edf7ff" fillOpacity="0.4" />
            <line x1="0" y1="20" x2="40" y2="20" stroke="#d4ecf7" strokeWidth="0.3" />
            <line x1="20" y1="0" x2="20" y2="40" stroke="#d4ecf7" strokeWidth="0.3" />
          </pattern>
        </defs>
      )}
      <rect x={pad} y={pad} width={rinkW} height={rinkH} rx="60" fill={bgFill} stroke={lineColor} strokeWidth={printMode ? 1.5 : 2.5} />
    </g>
  );

  const renderFullIceMarkings = () => (
    <g>
      <line x1={width / 2} y1={pad} x2={width / 2} y2={height - pad} stroke={redLine} strokeWidth={printMode ? 1.5 : 2.5} />
      <circle cx={width / 2} cy={height / 2} r="30" fill="none" stroke={blueLine} strokeWidth={printMode ? 1 : 2} />
      <circle cx={width / 2} cy={height / 2} r="3" fill={blueLine} />
      <line x1={width * 0.25} y1={pad} x2={width * 0.25} y2={height - pad} stroke={blueLine} strokeWidth={printMode ? 1 : 2} strokeDasharray="8 4" />
      <line x1={width * 0.75} y1={pad} x2={width * 0.75} y2={height - pad} stroke={blueLine} strokeWidth={printMode ? 1 : 2} strokeDasharray="8 4" />
      <circle cx={width * 0.2} cy={height * 0.3} r="25" fill="none" stroke={redLine} strokeWidth={printMode ? 0.8 : 1.5} />
      <circle cx={width * 0.2} cy={height * 0.7} r="25" fill="none" stroke={redLine} strokeWidth={printMode ? 0.8 : 1.5} />
      <circle cx={width * 0.8} cy={height * 0.3} r="25" fill="none" stroke={redLine} strokeWidth={printMode ? 0.8 : 1.5} />
      <circle cx={width * 0.8} cy={height * 0.7} r="25" fill="none" stroke={redLine} strokeWidth={printMode ? 0.8 : 1.5} />
      <circle cx={width * 0.2} cy={height * 0.3} r="3" fill={redLine} />
      <circle cx={width * 0.2} cy={height * 0.7} r="3" fill={redLine} />
      <circle cx={width * 0.8} cy={height * 0.3} r="3" fill={redLine} />
      <circle cx={width * 0.8} cy={height * 0.7} r="3" fill={redLine} />
      <rect x={pad + 5} y={height * 0.35} width="8" height={height * 0.3} fill="none" stroke={lineColor} strokeWidth={printMode ? 1 : 2} rx="2" />
      <rect x={width - pad - 13} y={height * 0.35} width="8" height={height * 0.3} fill="none" stroke={lineColor} strokeWidth={printMode ? 1 : 2} rx="2" />
      <line x1={width * 0.12} y1={pad} x2={width * 0.12} y2={height - pad} stroke={redLine} strokeWidth={printMode ? 1 : 2} />
      <line x1={width * 0.88} y1={pad} x2={width * 0.88} y2={height - pad} stroke={redLine} strokeWidth={printMode ? 1 : 2} />
    </g>
  );

  const renderHalfIceMarkings = () => (
    <g>
      {renderFullIceMarkings()}
      <rect x={width / 2} y={pad} width={width / 2 - pad} height={rinkH} fill={printMode ? "#eee" : "#c9d6df"} fillOpacity="0.4" rx="60" />
      <text x={width * 0.75} y={height / 2} textAnchor="middle" fill={printMode ? "#999" : "#8899a6"} fontSize="11" fontWeight="600">UNUSED</text>
    </g>
  );

  const renderZoneMarkings = (label: string) => (
    <g>
      <rect x={pad} y={pad} width={rinkW} height={rinkH} rx="40" fill={bgFill} stroke={lineColor} strokeWidth={printMode ? 1.5 : 2.5} />
      <line x1={width * 0.3} y1={pad} x2={width * 0.3} y2={height - pad} stroke={blueLine} strokeWidth={printMode ? 0.8 : 1.5} strokeDasharray="8 4" />
      <circle cx={width * 0.6} cy={height * 0.3} r="25" fill="none" stroke={redLine} strokeWidth={printMode ? 0.8 : 1.5} />
      <circle cx={width * 0.6} cy={height * 0.7} r="25" fill="none" stroke={redLine} strokeWidth={printMode ? 0.8 : 1.5} />
      <rect x={width - pad - 13} y={height * 0.35} width="8" height={height * 0.3} fill="none" stroke={lineColor} strokeWidth={printMode ? 1 : 2} rx="2" />
      <text x={width / 2} y={height - 18} textAnchor="middle" fill={lineColor} fontSize="10" fontWeight="700" letterSpacing="1">{label}</text>
    </g>
  );

  const renderStationZones = () => {
    const count = stationData?.length || stations;
    if (count <= 1 && !layoutType) return null;

    const calculatedZones = calculateStationZones(iceConfig, count, layoutType, layoutZones);

    return (
      <g>
        {calculatedZones.map((zone, i) => {
          const station = stationData?.[i];
          const color = printMode ? PRINT_COLOR : (station?.zone_color || ZONE_COLORS[i % ZONE_COLORS.length]);
          const layoutZone = layoutZones?.[i] || (layoutType && LAYOUT_TEMPLATES[layoutType]?.zones?.[i]);
          const label = station?.zone_label || (layoutZone as any)?.zone_label || `Station ${i + 1}`;
          
          const zoneArea = station?.zone_area || zone;
          const x = pad + (zoneArea.x_start / 100) * rinkW;
          const y = pad + (zoneArea.y_start / 100) * rinkH;
          const w = (zoneArea.width / 100) * rinkW;
          const h = (zoneArea.height / 100) * rinkH;
          const jerseyNum = i + 1;

          return (
            <g key={`zone-${i}`}>
              <rect
                x={x + 2}
                y={y + 2}
                width={w - 4}
                height={h - 4}
                rx="8"
                fill={printMode ? "none" : color}
                fillOpacity={printMode ? 0 : 0.12}
                stroke={color}
                strokeWidth={printMode ? 1.5 : 2}
                strokeDasharray={printMode ? "4 2" : "6 3"}
              />
              <circle
                cx={x + w / 2}
                cy={y + 28}
                r={printMode ? 14 : 16}
                fill={printMode ? "none" : color}
                fillOpacity={printMode ? 0 : 0.85}
                stroke={printMode ? PRINT_COLOR : "none"}
                strokeWidth={printMode ? 1.5 : 0}
              />
              <text
                x={x + w / 2}
                y={y + 33}
                textAnchor="middle"
                fill={printMode ? PRINT_COLOR : "white"}
                fontSize={printMode ? 16 : 14}
                fontWeight="800"
                fontFamily="'Chakra Petch', sans-serif"
              >
                {jerseyNum}
              </text>
              <text
                x={x + w / 2}
                y={y + 54}
                textAnchor="middle"
                fill={printMode ? "#555" : color}
                fontSize="9"
                fontWeight="700"
                letterSpacing="0.5"
              >
                {label.length > 12 ? label.substring(0, 10) + ".." : label}
              </text>
              {!printMode && station?.title && (
                <text
                  x={x + w / 2}
                  y={y + h - 16}
                  textAnchor="middle"
                  fill="#1a5276"
                  fontSize="8"
                  fontWeight="500"
                  opacity="0.7"
                >
                  {station.title.length > 20 ? station.title.substring(0, 18) + ".." : station.title}
                </text>
              )}
              {!printMode && station?.type && (
                <rect
                  x={x + w / 2 - 18}
                  y={y + h - 34}
                  width="36"
                  height="14"
                  rx="3"
                  fill={station.type === "Game" ? "#D62828" : "#0B1C2D"}
                  fillOpacity="0.8"
                />
              )}
              {!printMode && station?.type && (
                <text
                  x={x + w / 2}
                  y={y + h - 24}
                  textAnchor="middle"
                  fill="white"
                  fontSize="7"
                  fontWeight="600"
                >
                  {station.type.toUpperCase()}
                </text>
              )}
            </g>
          );
        })}
      </g>
    );
  };

  const renderRink = () => {
    switch (iceConfig) {
      case "Half Ice":
        return <>{renderIceBase()}{renderHalfIceMarkings()}</>;
      case "Offensive Zone":
        return renderZoneMarkings("OFFENSIVE ZONE");
      case "Neutral Zone":
        return (
          <g>
            <rect x={pad} y={pad} width={rinkW} height={rinkH} rx="20" fill={bgFill} stroke={lineColor} strokeWidth={printMode ? 1.5 : 2.5} />
            <line x1={width * 0.15} y1={pad} x2={width * 0.15} y2={height - pad} stroke={blueLine} strokeWidth={printMode ? 0.8 : 1.5} strokeDasharray="8 4" />
            <line x1={width * 0.85} y1={pad} x2={width * 0.85} y2={height - pad} stroke={blueLine} strokeWidth={printMode ? 0.8 : 1.5} strokeDasharray="8 4" />
            <circle cx={width / 2} cy={height / 2} r="30" fill="none" stroke={blueLine} strokeWidth={printMode ? 1 : 2} />
            <circle cx={width / 2} cy={height / 2} r="3" fill={blueLine} />
            <line x1={width / 2} y1={pad} x2={width / 2} y2={height - pad} stroke={redLine} strokeWidth={printMode ? 1.5 : 2.5} />
            <text x={width / 2} y={height - 18} textAnchor="middle" fill={lineColor} fontSize="10" fontWeight="700" letterSpacing="1">NEUTRAL ZONE</text>
          </g>
        );
      case "Defensive Zone":
        return renderZoneMarkings("DEFENSIVE ZONE");
      default:
        return <>{renderIceBase()}{renderFullIceMarkings()}</>;
    }
  };

  return (
    <div className="w-full overflow-x-auto" data-testid="rink-drawer">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={printMode ? "w-full" : "w-full max-w-[640px] mx-auto"}
        style={{ minWidth: printMode ? undefined : 320 }}
      >
        {renderRink()}
        {renderStationZones()}
      </svg>
    </div>
  );
}
