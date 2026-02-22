export interface SeedDrill {
  title: string;
  content: string;
  category: string;
  drillType: "Drill" | "Game";
  tags: string[];
  methodology: string[];
  ageGroups: string[];
  iceConfig: string[];
}

export interface MethodologyPrinciples {
  name: string;
  key: string;
  corePrinciples: string;
  trainingPhilosophy: string;
  ageSpecificGuidelines: string;
  drillDesignRules: string;
}

export const methodologies: MethodologyPrinciples[] = [
  {
    name: "Kanadská škola (Canadian)",
    key: "Canadian",
    corePrinciples: `Kanadská hokejová škola klade důraz na individuální dovednosti, kreativitu a soubojové dovednosti.
- Základní pilíře: skating, shooting, puck control, checking, hockey sense
- Důraz na "skill development through repetition" - opakování klíčových dovedností
- Systém ABC: A = technické dovednosti, B = taktické dovednosti, C = herní situace
- Progresivní model: izolovaný cvik → cvik pod tlakem → herní situace
- Hockey Canada Long-Term Development Model (LTDM): Active Start → FUNdamentals → Learn to Train → Train to Train → Train to Compete → Train to Win
- Důraz na "compete" element - soutěživost v každém cvičení
- Small-area games jako primární nástroj rozvoje herního myšlení
- Battle drills - rozvoj soubojových dovedností a tvrdosti
- 4 fáze hry: offensive zone play, neutral zone play, defensive zone play, transition`,
    trainingPhilosophy: `Trénink by měl obsahovat:
- 70% herních situací a soutěží, 30% izolovaných dovedností (starší hráči)
- Vysoká intenzita, krátké intervaly, maximální zapojení všech hráčů
- "Game-like conditions" - cvičení musí simulovat herní tempo a tlak
- Transition drills - rychlý přechod obrana-útok je klíčový
- Compete drills - každé cvičení by mělo mít soutěžní prvek
- Puck possession - důraz na držení kotouče a kreativitu s ním`,
    ageSpecificGuidelines: `Věkové doporučení:
- U7-U9: FUNdamentals - 80% hry, radost z pohybu, základy bruslení a vedení kotouče
- U10-U12: Learn to Train - rozvoj všech dovedností, úvod do taktiky, cross-ice formáty
- U13-U15: Train to Train - specializace, pozice, systémy hry, fyzická příprava
- U16+: Train to Compete - herní systémy, speciální formace, mentální příprava`,
    drillDesignRules: `Pravidla pro návrh cvičení:
- Maximální doba stání = 0, neustálý pohyb
- Každé cvičení musí mít jasný cíl a měřitelný výstup
- Využívat celou šířku ledu, minimalizovat fronty
- Poměr učitel:žák ideálně 1:6
- Vždy zahrnout brankáře do cvičení kde je to možné
- Progrese: Walk-through → Half-speed → Full speed → Game speed`,
  },
  {
    name: "Švédská škola (Swedish)",
    key: "Swedish",
    corePrinciples: `Švédská hokejová škola (Tre Kronor modell) staví na technické dokonalosti a kolektivní hře.
- Základní pilíře: skating excellence, puck support, passing accuracy, team play
- "Swedish Skating" - světově uznávaná bruslařská škola s důrazem na hrany, přechody, obratnost
- Puck support triangle - hráči vždy tvoří trojúhelník podpory kolem kotouče
- 5-lane concept - led rozdělen do 5 vertikálních pruhů pro strukturovaný pohyb
- Gap control - řízení vzdálenosti mezi útočníkem a obráncem
- Regroup as offensive weapon - kontrolovaná rozehrávka zpět jako nástroj útoku
- Systematic forechecking patterns (1-2-2, 2-1-2)
- "Kompakt spel" - kompaktní hra, krátké vzdálenosti mezi hráči`,
    trainingPhilosophy: `Trénink by měl obsahovat:
- Důraz na technickou dokonalost před rychlostí
- Structured passing patterns - přihrávkové vzorce v pohybu
- Skating-centric approach - bruslení jako základ každého tréninku (min 15 min)
- Team tactical drills - cvičení ve skupinách 3-5 hráčů
- "Swedish flow" drills - plynulé přechody mezi cvičeními bez zastavení
- Overload situations (3v2, 4v3) - přečíslení jako hlavní taktický nástroj
- Controlled breakout patterns - nacvičené rozehrávky z obranného pásma`,
    ageSpecificGuidelines: `Věkové doporučení:
- U7-U9: Lek och lär (Hra a učení) - hravá forma, základy bruslení, mini-hry
- U10-U12: Utveckla (Rozvoj) - technické dovednosti, úvod do spolupráce
- U13-U15: Träna (Trénink) - taktické koncepty, systémová hra, fyzická příprava
- U16+: Prestera (Výkon) - herní systémy, speciální situace, individuální role`,
    drillDesignRules: `Pravidla pro návrh cvičení:
- Vždy začít bruslařským blokem (Swedish skating)
- Přihrávková cvičení v pohybu - nikdy stát a přihrávat
- Využívat celou plochu systematicky (5-lane concept)
- Transition drills - vždy zahrnout přechod obrana-útok
- Support play - hráč bez kotouče musí mít jasný úkol
- Postupná progrese od jednoduché spolupráce ke komplexní taktice`,
  },
  {
    name: "Finská škola (Finnish)",
    key: "Finnish",
    corePrinciples: `Finská hokejová škola staví na individuální zodpovědnosti, inteligenci a adaptabilitě.
- Základní pilíře: individual responsibility, game intelligence, adaptability, work ethic
- "Sisu" mentalita - vytrvalost, houževnatost, nikdy se nevzdat
- Active stick - aktivní práce hokejkou v obraně i útoku
- Net-front presence - dominance v předbrankovém prostoru
- Systematic defensive zone coverage - strukturovaná obrana
- Quick counter-attack - rychlý protiútok po zisku kotouče
- 1-on-1 battle winning - důraz na vítězství v osobních soubojích
- Smysl pro hru (game sense) - čtení hry a anticipace`,
    trainingPhilosophy: `Trénink by měl obsahovat:
- Vysoký podíl soubojových cvičení (1v1, 2v2)
- Defensive zone drills - strukturovaná obranná cvičení
- Forechecking patterns s důrazem na aktivní hokejku
- Quick transition drills - bleskový přechod obrana→útok
- Net-front battle drills - souboje v předbrankovém prostoru
- "Compete level" - vysoká intenzita soupeření v každém cvičení
- Individuální zodpovědnost - každý hráč zodpovídá za svůj prostor`,
    ageSpecificGuidelines: `Věkové doporučení:
- U7-U9: Leikkivaihe (Hra) - radost z hokeje, základní dovednosti formou hry
- U10-U12: Taitovaihe (Dovednosti) - rozvoj individuálních dovedností, úvod do soubojů
- U13-U15: Pelin oppimisvaihe (Učení se hře) - herní porozumění, zodpovědnost
- U16+: Kilpailuvaihe (Soutěž) - herní systémy, mentální odolnost, specifické role`,
    drillDesignRules: `Pravidla pro návrh cvičení:
- Vždy zahrnout soubojový element (battle, compete)
- Obranná cvičení minimálně 30% tréninkového času
- Quick transition po každém obraném cvičení
- Aktivní hokejka v každém defenzivním cvičení
- Net-front drills - pravidelné zařazování soubojů před bránou
- Individuální zodpovědnost - jasné role v každém cvičení`,
  },
  {
    name: "Česká škola (Czech)",
    key: "Czech",
    corePrinciples: `Česká hokejová škola (ČSLH metodika) kombinuje technickou vyspělost s kreativitou a herní inteligencí.
- Základní pilíře: technika, kreativita, herní myšlení, kombinační hra
- Důraz na individuální techniku v mládežnických kategoriích
- "Tvořivost" - kreativní řešení herních situací
- Kombinační hra - nacvičené kombinace s prostorem pro improvizaci
- Metodický postup: nácvik → opakování → zdokonalení → aplikace v hře
- Periodizace tréninku podle ČSLH: přípravné, soutěžní a přechodné období
- Silová příprava od U13 (s důrazem na vlastní váhu těla)
- Koordinační schopnosti jako základ pohybového rozvoje`,
    trainingPhilosophy: `Trénink by měl obsahovat:
- Metodický postup od jednoduchého ke složitému
- Důraz na koordinaci a obratnost v mladších kategoriích
- Průpravná cvičení → herní cvičení → průpravné hry → utkání
- Stanovištní trénink (kruhový trénink) pro efektivní využití času
- Střelecký trénink s důrazem na různé typy zakončení
- Přihrávkové vzorce v pohybu - česká kombinační hra
- Hra na malém prostoru pro rozvoj herního myšlení
- Bruslení s důrazem na české specifikum: přechody a obraty`,
    ageSpecificGuidelines: `Věkové doporučení dle ČSLH:
- U7-U9 (přípravka): Základy bruslení, her a zábavy, cross-ice formát
- U10-U12 (elév/mladší žáci): Rozvoj dovedností, úvod do taktiky, soutěže
- U13-U15 (starší žáci): Taktická příprava, herní systémy, kondiční příprava
- U16+ (dorost/junioři): Specializace, systémy hry, individuální rozvoj
ČSLH doporučuje poměr tréninků: 4× led + 2× mimo led (U13+)`,
    drillDesignRules: `Pravidla pro návrh cvičení dle ČSLH metodiky:
- Využívat celou plochu nebo efektivně dělit na sektory (2x, 3x, 4x sektor)
- Průpravná cvičení jako základ - od izolovaných cviků k herním situacím
- Stanovištní trénink pro maximální využití ledové plochy
- Kombinační cvičení ve 2-3-4 hráčích
- Střelecká cvičení minimálně 20% tréninkového času
- Závěrečná hra (minihokej, průpravná hra) v každém tréninku
- Rozcvičení s kotoučem (ne bez kotouče)`,
  },
  {
    name: "Hybridní přístup (Hybrid)",
    key: "Hybrid",
    corePrinciples: `Hybridní přístup kombinuje nejlepší prvky všech hlavních hokejových škol.
- Bruslařská excelence ze švédské školy
- Soubojovost a tvrdost z kanadské a finské školy
- Technická kreativita z české školy
- Herní inteligence ze všech škol
- Adaptabilní přístup podle věkové kategorie a úrovně hráčů
- Moderní trendy: data-driven training, video analýza, individualizace`,
    trainingPhilosophy: `Trénink by měl obsahovat:
- Vyvážený mix všech složek hokejového tréninku
- Individualizace podle silných a slabých stránek týmu
- Periodizace: mikro/mezo/makrocykly
- Flexibilní přístup - přizpůsobení aktuálním potřebám
- Využití moderních technologií (video, senzory, blazepody)
- Komplexní rozvoj hráče - fyzický, technický, taktický, mentální`,
    ageSpecificGuidelines: `Univerzální věkové doporučení:
- U7-U9: 90% hra a zábava, základní dovednosti
- U10-U12: 60% dovednosti, 40% hra, úvod do taktiky
- U13-U15: 40% dovednosti, 30% taktika, 30% hra, kondiční příprava
- U16+: 20% dovednosti, 40% taktika, 30% hra, 10% speciální příprava`,
    drillDesignRules: `Pravidla pro hybridní přístup:
- Kombinovat prvky různých škol podle potřeby
- Důraz na game-like conditions
- Progresivní obtížnost v každém tréninku
- Maximální zapojení všech hráčů
- Měřitelné cíle pro každé cvičení
- Flexibilita v přizpůsobení cvičení aktuální situaci`,
  },
];

export function getMethodologyContext(methodology: string): string {
  const meth = methodologies.find(
    (m) => m.key.toLowerCase() === methodology.toLowerCase() || m.name.toLowerCase().includes(methodology.toLowerCase())
  ) || methodologies.find((m) => m.key === "Hybrid")!;

  return `
HOCKEY METHODOLOGY KNOWLEDGE BASE - ${meth.name}:
${meth.corePrinciples}

TRAINING PHILOSOPHY (${meth.name}):
${meth.trainingPhilosophy}

AGE-SPECIFIC GUIDELINES:
${meth.ageSpecificGuidelines}

DRILL DESIGN RULES:
${meth.drillDesignRules}
`;
}

function parseAgeCategory(category: string): string[] {
  if (!category) return [];
  const match = category.match(/U(\d+)/i);
  if (match) return [match[0].toUpperCase()];
  const ageCat = category.toLowerCase();
  if (ageCat.includes("přípravka") || ageCat.includes("mini")) return ["U7", "U8", "U9"];
  if (ageCat.includes("mladší žáci") || ageCat.includes("elév")) return ["U10", "U11", "U12"];
  if (ageCat.includes("starší žáci")) return ["U13", "U14", "U15"];
  if (ageCat.includes("dorost") || ageCat.includes("junior")) return ["U16", "U17", "U18"];
  return [];
}

export function getRelevantDrills(
  methodology: string,
  focusAreas: string[],
  iceConfig: string,
  ageCategory: string,
): SeedDrill[] {
  const methKey = methodology.toLowerCase();
  const ageGroups = parseAgeCategory(ageCategory);

  const scored = seedDrills.map((drill) => {
    let score = 0;

    const matchesMethodology =
      drill.methodology.length === 0 ||
      drill.methodology.some((m) => m.toLowerCase() === methKey) ||
      drill.methodology.some((m) => m.toLowerCase() === "all");
    if (!matchesMethodology) return { drill, score: -1 };

    if (drill.methodology.some((m) => m.toLowerCase() === methKey)) score += 3;
    else if (drill.methodology.some((m) => m.toLowerCase() === "all")) score += 1;

    const matchesFocus =
      focusAreas.length === 0 ||
      focusAreas.some((f) => drill.category.toLowerCase() === f.toLowerCase()) ||
      focusAreas.some((f) => drill.tags.some((t) => t.toLowerCase().includes(f.toLowerCase())));
    if (matchesFocus && focusAreas.length > 0) score += 5;

    const matchesIce =
      drill.iceConfig.length === 0 ||
      drill.iceConfig.some((ic) => ic.toLowerCase().includes(iceConfig.toLowerCase())) ||
      drill.iceConfig.includes("any");
    if (matchesIce) score += 2;

    const matchesAge =
      ageGroups.length === 0 ||
      drill.ageGroups.length === 0 ||
      ageGroups.some((ag) => drill.ageGroups.includes(ag));
    if (matchesAge && ageGroups.length > 0) score += 4;
    if (!matchesAge) score -= 3;

    return { drill, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.drill);
}

export function formatDrillsForPrompt(drills: SeedDrill[], maxDrills: number = 20): string {
  const selected = drills.slice(0, maxDrills);
  if (selected.length === 0) return "";

  return `
INTERNAL DRILL DATABASE (${selected.length} relevant drills for this session):
${selected
  .map(
    (d, i) => `[${i + 1}] "${d.title}" (${d.category}, ${d.drillType})
  ${d.content}
  Ice: ${d.iceConfig.join(", ")} | Tags: ${d.tags.join(", ")}`,
  )
  .join("\n")}

INSTRUCTION: Use these drills as primary source material. Adapt drill names, descriptions and parameters to match the session requirements. You may modify, combine or extend drills from this database. Reference drill concepts in station titles where appropriate.
`;
}

const ZONE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const CANNED_DIAGRAMS: Record<string, { type: string; x: number; y: number; x2?: number; y2?: number; label?: string }[]> = {
  warmup: [
    { type: "player", x: 40, y: 220, label: "A" },
    { type: "player", x: 100, y: 220, label: "B" },
    { type: "player", x: 160, y: 220, label: "C" },
    { type: "skating", x: 40, y: 220, x2: 40, y2: 80 },
    { type: "skating", x: 100, y: 220, x2: 100, y2: 80 },
    { type: "skating", x: 160, y: 220, x2: 160, y2: 80 },
  ],
  drill: [
    { type: "player", x: 50, y: 200, label: "A" },
    { type: "player", x: 150, y: 200, label: "B" },
    { type: "skating-puck", x: 50, y: 200, x2: 100, y2: 100 },
    { type: "pass", x: 100, y: 100, x2: 150, y2: 140 },
    { type: "shot", x: 150, y: 140, x2: 180, y2: 40 },
    { type: "goalie", x: 180, y: 30 },
    { type: "cone", x: 100, y: 150 },
  ],
  game: [
    { type: "player", x: 60, y: 180, label: "A" },
    { type: "player", x: 140, y: 180, label: "B" },
    { type: "defender", x: 60, y: 100, label: "D1" },
    { type: "defender", x: 140, y: 100, label: "D2" },
    { type: "goalie", x: 100, y: 30 },
    { type: "skating", x: 60, y: 180, x2: 100, y2: 120 },
    { type: "pass", x: 100, y: 120, x2: 140, y2: 80 },
  ],
  finish: [
    { type: "player", x: 40, y: 200, label: "A" },
    { type: "player", x: 100, y: 200, label: "B" },
    { type: "player", x: 160, y: 200, label: "C" },
    { type: "defender", x: 70, y: 120, label: "D1" },
    { type: "defender", x: 130, y: 120, label: "D2" },
    { type: "goalie", x: 100, y: 30 },
  ],
};

function computeZoneAreas(stations: number, iceConfig: string, layoutType?: string | null): { x_start: number; y_start: number; width: number; height: number }[] {
  if (layoutType === "2-1-2" && stations === 5) {
    return [
      { x_start: 0, y_start: 0, width: 50, height: 33 },
      { x_start: 50, y_start: 0, width: 50, height: 33 },
      { x_start: 25, y_start: 33, width: 50, height: 34 },
      { x_start: 0, y_start: 67, width: 50, height: 33 },
      { x_start: 50, y_start: 67, width: 50, height: 33 },
    ];
  }
  if (layoutType === "4-lanes" && stations === 4) {
    return [
      { x_start: 0, y_start: 0, width: 25, height: 50 },
      { x_start: 25, y_start: 0, width: 25, height: 50 },
      { x_start: 50, y_start: 0, width: 25, height: 50 },
      { x_start: 75, y_start: 0, width: 25, height: 50 },
    ];
  }
  if (layoutType === "3-zones" && stations === 3) {
    return [
      { x_start: 0, y_start: 0, width: 100, height: 33 },
      { x_start: 0, y_start: 33, width: 100, height: 34 },
      { x_start: 0, y_start: 67, width: 100, height: 33 },
    ];
  }
  if (layoutType === "half-ice-4" && stations === 4) {
    return [
      { x_start: 0, y_start: 0, width: 50, height: 50 },
      { x_start: 50, y_start: 0, width: 50, height: 50 },
      { x_start: 0, y_start: 50, width: 50, height: 50 },
      { x_start: 50, y_start: 50, width: 50, height: 50 },
    ];
  }
  const sliceWidth = Math.floor(100 / stations);
  return Array.from({ length: stations }, (_, i) => ({
    x_start: i * sliceWidth,
    y_start: 0,
    width: i === stations - 1 ? 100 - i * sliceWidth : sliceWidth,
    height: 100,
  }));
}

function rinkViewFromZone(zone: { x_start: number; width: number }): string {
  if (zone.width >= 90) return "full";
  if (zone.x_start < 30 && zone.width <= 55) return "zone-left";
  if (zone.x_start >= 60) return "zone-right";
  if (zone.width >= 45) return zone.x_start < 30 ? "half-left" : "half-right";
  return "neutral";
}

export interface AssemblyResult {
  content: any;
  assembledFromDB: boolean;
}

export function assembleTrainingFromDatabase(
  input: {
    methodology: string;
    category: string;
    duration: number;
    iceConfig: string;
    stations: number;
    focus: string[];
    drillRatio: number;
    cognitiveLoad: string;
    playersCount: number;
    goaliesCount: number;
    layoutType?: string | null;
    customLayoutCoordinates?: any;
  },
  coachProfile: any,
  drillContext?: { favorites: string[]; banned: string[]; highRated: string[] },
  knowledgeLibrary?: { title: string; content: string; category: string | null; tags: string[] | null }[],
): AssemblyResult | null {
  const effectiveMethodology = input.methodology || coachProfile?.preferredMethodology || "Hybrid";
  const relevantDrills = getRelevantDrills(effectiveMethodology, input.focus, input.iceConfig, input.category);

  const bannedSet = new Set((drillContext?.banned || []).map(s => s.toLowerCase()));
  const favoriteSet = new Set((drillContext?.favorites || []).map(s => s.toLowerCase()));
  const highRatedSet = new Set((drillContext?.highRated || []).map(s => s.toLowerCase()));

  let available = relevantDrills.filter(d => !bannedSet.has(d.title.toLowerCase()));
  available.sort((a, b) => {
    const aBoost = (favoriteSet.has(a.title.toLowerCase()) ? 10 : 0) + (highRatedSet.has(a.title.toLowerCase()) ? 5 : 0);
    const bBoost = (favoriteSet.has(b.title.toLowerCase()) ? 10 : 0) + (highRatedSet.has(b.title.toLowerCase()) ? 5 : 0);
    return bBoost - aBoost;
  });

  const coachDrills = (knowledgeLibrary || []).filter(k => !bannedSet.has(k.title.toLowerCase()));

  const neededSlots = input.stations + 2;
  const totalAvailable = available.length + coachDrills.length;
  if (totalAvailable < neededSlots) {
    return null;
  }

  const used = new Set<string>();
  function pickDrill(filter: (d: SeedDrill) => boolean): SeedDrill | null {
    for (const d of available) {
      if (!used.has(d.title) && filter(d)) {
        used.add(d.title);
        return d;
      }
    }
    return null;
  }
  function pickCoachDrill(filter: (d: { title: string; content: string; category: string | null }) => boolean) {
    for (const d of coachDrills) {
      if (!used.has(d.title) && filter(d)) {
        used.add(d.title);
        return d;
      }
    }
    return null;
  }

  const warmupDrill = pickDrill(d => d.category.toLowerCase().includes("skating") || d.tags.some(t => t.toLowerCase().includes("rozcvička") || t.toLowerCase().includes("warm")))
    || pickDrill(d => d.drillType === "Drill");
  if (!warmupDrill) return null;

  const finishDrill = pickDrill(d => d.drillType === "Game")
    || pickDrill(d => d.category.toLowerCase().includes("game") || d.tags.some(t => t.toLowerCase().includes("hra") || t.toLowerCase().includes("game")))
    || pickDrill(() => true);
  if (!finishDrill) return null;

  const mainDrills: { title: string; content: string; category: string; drillType: string; tags: string[] }[] = [];
  const drillCount = Math.ceil(input.stations * (input.drillRatio / 100));
  const maxCoachDrills = Math.min(Math.floor(input.stations / 2), coachDrills.length);
  let coachDrillsUsed = 0;

  for (let i = 0; i < input.stations; i++) {
    const wantGame = i >= drillCount;
    if (coachDrillsUsed < maxCoachDrills) {
      const focusLower = input.focus.map(f => f.toLowerCase());
      const coachPick = pickCoachDrill(d =>
        focusLower.some(f => (d.category || "").toLowerCase().includes(f) || (d as any).tags?.some((t: string) => t.toLowerCase().includes(f)))
      ) || (coachDrillsUsed === 0 ? pickCoachDrill(() => true) : null);
      if (coachPick) {
        coachDrillsUsed++;
        mainDrills.push({
          title: coachPick.title,
          content: coachPick.content,
          category: coachPick.category || input.focus[0] || "General",
          drillType: wantGame ? "Game" : "Drill",
          tags: (coachPick as any).tags || [],
        });
        continue;
      }
    }
    const seedPick = wantGame
      ? pickDrill(d => d.drillType === "Game") || pickDrill(() => true)
      : pickDrill(d => d.drillType === "Drill") || pickDrill(() => true);
    if (!seedPick) return null;
    mainDrills.push(seedPick);
  }

  const warmupDur = Math.round(input.duration * 0.12);
  const finishDur = Math.round(input.duration * 0.12);
  const mainTotalDur = input.duration - warmupDur - finishDur;
  const stationDur = Math.round(mainTotalDur / input.stations);

  const zones = input.customLayoutCoordinates
    ? input.customLayoutCoordinates
    : computeZoneAreas(input.stations, input.iceConfig, input.layoutType);

  const skillDist: Record<string, number> = {};
  input.focus.forEach(f => { skillDist[f] = Math.round(100 / input.focus.length); });

  const content = {
    warmup: {
      title: warmupDrill.title,
      duration: `${warmupDur} min`,
      description: warmupDrill.content,
      key_points: warmupDrill.tags.slice(0, 4),
      diagram_elements: CANNED_DIAGRAMS.warmup,
      rink_view: "full",
    },
    main: mainDrills.map((drill, i) => ({
      station_id: i + 1,
      drill_id: `drill_${drill.category.toLowerCase().replace(/\s+/g, "_")}_${String(i + 1).padStart(3, "0")}`,
      duration: stationDur,
      rotation_cycles: 1,
      title: drill.title,
      type: drill.drillType,
      description: drill.content,
      focus_tags: drill.tags?.slice(0, 5) || [drill.category],
      zone_area: zones[i] || zones[zones.length - 1],
      zone_label: `Station ${i + 1}`,
      zone_color: ZONE_COLORS[i % ZONE_COLORS.length],
      diagram_elements: drill.drillType === "Game" ? CANNED_DIAGRAMS.game : CANNED_DIAGRAMS.drill,
      rink_view: zones[i] ? rinkViewFromZone(zones[i]) : "full",
    })),
    finish: {
      title: finishDrill.title,
      duration: `${finishDur} min`,
      description: finishDrill.content,
      diagram_elements: CANNED_DIAGRAMS.finish,
      rink_view: "full",
    },
    metadata: {
      skill_distribution: skillDist,
      cognitive_load: input.cognitiveLoad,
      intensity: "Varies by Age",
      ice_config: input.iceConfig,
      station_timing_mode: (input as any).stationTimingMode || "Automatic",
      max_station_duration: (input as any).maxStationDuration || null,
      assembled_from_database: true,
    },
  };

  return { content, assembledFromDB: true };
}

export const seedDrills: SeedDrill[] = [
  // ===== SKATING - UNIVERSAL =====
  {
    title: "Školička bruslení",
    content: "Základní bruslařská cvičení pro nejmladší hráče. Celá ledová plocha rozdělena na zóny. Hráči procvičují základní postoj, skluz na jedné noze, přenášení váhy, zastavení pluhem. Trenér ukazuje cviky na středu, hráči opakují v řadách přes celou šířku kluziště. Klíčové body: pokrčená kolena, ruce před tělem, hlava vzhůru.",
    category: "Skating",
    drillType: "Drill",
    tags: ["bruslení", "základy", "začátečníci", "technika", "postoj"],
    methodology: ["all"],
    ageGroups: ["U7", "U8", "U9"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Kruhový trénink - bruslení",
    content: "Stanovištní trénink zaměřený na bruslení. 4-6 stanovišť rozmístěných po celé ploše. S1: Přeskoky přes překážky, S2: Slalom mezi kužely, S3: Start-stop na modré, S4: Překřižování kolem kruhu, S5: Jízda vzad mezi kužely, S6: Starty z různých poloh. Rotace po 2 minutách, signál píšťalkou. Maximální využití ledové plochy.",
    category: "Skating",
    drillType: "Drill",
    tags: ["bruslení", "stanoviště", "kruhový trénink", "obratnost"],
    methodology: ["Czech", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Swedish Skating - hrany a přechody",
    content: "Švédská bruslařská škola. Celá plocha, hráči v řadách. Cvičení v sekvenci: 1) Inside edge forward - jízda na vnitřních hranách, 2) Outside edge forward - vnější hrany, 3) Crossover circles - překřižování na kruzích, 4) Mohawk turns - přechody vpřed-vzad přes mohawk, 5) Open hip turns - otevřené obraty, 6) T-push starts. Důraz na dokonalou techniku, plynulost a čistotu provedení. Pomalé tempo, maximální přesnost.",
    category: "Skating",
    drillType: "Drill",
    tags: ["bruslení", "hrany", "přechody", "technika", "swedish skating"],
    methodology: ["Swedish", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Powerskating - dynamické bruslení",
    content: "Intenzivní powerskatingový trénink. Celá plocha, hráči v řadách. Cvičení: 1) C-řezy vpřed/vzad, 2) Překřižování v obou směrech kolem kruhů, 3) Přechody vpřed-vzad na každé čáře, 4) Mohawky a pivoty, 5) Tight turns kolem kuželů, 6) Sprint s maximálním počtem kroků na 10m. Důraz na správný sklon brusle, práci s hranami a explosivní odraz.",
    category: "Skating",
    drillType: "Drill",
    tags: ["bruslení", "powerskating", "hrany", "technika", "C-řezy", "exploze"],
    methodology: ["all"],
    ageGroups: ["U12", "U13", "U14", "U15", "U16", "U17", "U18"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Obratnostní bruslení - Půlměsíc, Přechody, Oblouk",
    content: "Tři stanoviště zaměřená na obratnostní bruslení. Půlměsíc: hráči bruslí po oblouku kolem středového kruhu s důrazem na náklon a hrany. Přechody: cvičení přechodů z jízdy vpřed do jízdy vzad a zpět na modré čáře (mohawk, pivot, open hip). Oblouk: bruslení v oblouku kolem kuželů s maximálním náklonem. Hráči rotují mezi stanovišti po 3 minutách.",
    category: "Skating",
    drillType: "Drill",
    tags: ["bruslení", "obratnost", "hrany", "přechody", "oblouk"],
    methodology: ["Czech", "Swedish", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Rychlostní starty a brzdy",
    content: "Celá ledová plocha, hráči v řadách. Rychlostní starty od modré čáry, sprint k další čáře, prudká brzda (hokejová), okamžitý start. Variace: start z kleku, z lehu, na signál, z otočky. Poměr práce:odpočinek 1:3-5. Důraz na explosivní první 3 kroky a efektivní brzdění s nízkým těžištěm.",
    category: "Skating",
    drillType: "Drill",
    tags: ["bruslení", "rychlost", "brzdy", "starty", "exploze"],
    methodology: ["all"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14", "U15", "U16"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Bruslení slalom mezi mantinely",
    content: "Hráči bruslí slalomem mezi kužely od jednoho mantinelu k druhému. S výjezdem na modrou čáru, přechod do jízdy vzad a start vpřed. Důraz na práci s hranami, rychlé přechody vpřed/vzad a dynamické starty. Skupiny startují s 5s rozestupy.",
    category: "Skating",
    drillType: "Drill",
    tags: ["bruslení", "slalom", "hrany", "přechody"],
    methodology: ["all"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Bruslení s bognou a vyšlápnutím",
    content: "Hráči bruslí podél mantinelu, provádějí bognu (tight turn kolem kužele) a vyšlápnutí (power crossover) směrem ven. Cvičení vpřed i vzad. Střídavě na obou stranách kluziště. Důraz na správné vyšlápnutí vnější nohou, náklon těla a udržení rychlosti v oblouku.",
    category: "Skating",
    drillType: "Drill",
    tags: ["bruslení", "bogna", "vyšlápnutí", "crossover", "tight turn"],
    methodology: ["Czech", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Karusel brzda",
    content: "Hráči bruslí v karuselu (kruhovém vzoru) kolem celé plochy podél mantinelů. Na signál trenéra všichni provedou brzdu a okamžitě mění směr. Variace: hokejová brzda, brzda na jednu stranu, brzda s obratem vzad, brzda a start do strany. Kontinuální pohyb s pravidelnými brzdami.",
    category: "Skating",
    drillType: "Drill",
    tags: ["bruslení", "karusel", "brzdy", "obraty", "změna směru"],
    methodology: ["Czech", "Hybrid"],
    ageGroups: ["U9", "U10", "U11", "U12", "U13"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Přešlapování na kruzích",
    content: "Cvičení zaměřené na techniku přešlapování (crossovers). Hráči bruslí po kruzích pro vhazování na obou stranách kluziště. Důraz na správné překřížení vnější nohy přes vnitřní, náklon těla do oblouku, udržení rychlosti. Variace: s kotoučem, závodní formát, střídání směru na signál.",
    category: "Skating",
    drillType: "Drill",
    tags: ["bruslení", "přešlapování", "crossovers", "kruhy", "technika"],
    methodology: ["all"],
    ageGroups: ["U9", "U10", "U11", "U12", "U13", "U14"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Intervalové sprinty - starty modrá/červená/modrá",
    content: "Intervalový sprint. Hráči startují od mantinelu, sprint k modré (brzda), zpět, sprint k červené (brzda), zpět, sprint k vzdálené modré (brzda), zpět. Odpočinek 1:3-5. Důraz na explosivní starty po brzdění a správnou techniku zastavení. 4-6 opakování.",
    category: "Skating",
    drillType: "Drill",
    tags: ["bruslení", "sprinty", "intervaly", "kondice", "brzdy"],
    methodology: ["all"],
    ageGroups: ["U12", "U13", "U14", "U15", "U16", "U17"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Stíhací závod",
    content: "Závodní formát bruslení. Dva hráči startují z protilehlých stran kruhu, bruslí po obvodu a snaží se dohnat soupeře. Variace: s překážkami, s obraty, s kotoučem. Motivační cvičení na konci tréninku. Soutěžní prvek zvyšuje intenzitu.",
    category: "Skating",
    drillType: "Game",
    tags: ["bruslení", "závod", "rychlost", "motivace", "soutěž"],
    methodology: ["all"],
    ageGroups: ["U9", "U10", "U11", "U12", "U13", "U14"],
    iceConfig: ["Full Ice", "Half Ice"],
  },
  {
    title: "Reakční starty na blazepody/signály",
    content: "Hráči stojí na středu v řadě. Trenér aktivuje vizuální signály (blazepody, čísla, barvy) nebo zvukové signály. Hráči reagují sprintem ke správnému cíli. Kombinace se zastavením, obratem a návratem. Trénink reakční rychlosti, periferního vnímání a akcelerace.",
    category: "Skating",
    drillType: "Drill",
    tags: ["bruslení", "reakce", "rychlost", "starty", "kognice"],
    methodology: ["Canadian", "Finnish", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice", "Full Ice"],
  },
  {
    title: "Technika bruslení - odraz a skluz",
    content: "Technicko-bruslařský trénink se zaměřením na správný odraz a skluz. Cvičení v řadách: 1) Odraz z plné plochy brusle - push and glide, 2) Jízda na jedné noze (min 3s skluz), 3) Přenášení váhy v-postoji, 4) T-start s maximálním prvním krokem, 5) Tichý skluz (minimalizace zvuku = správná technika). Pomalé tempo, maximální kontrola.",
    category: "Skating",
    drillType: "Drill",
    tags: ["bruslení", "technika", "odraz", "skluz", "základy"],
    methodology: ["Swedish", "Czech", "Hybrid"],
    ageGroups: ["U7", "U8", "U9", "U10", "U11"],
    iceConfig: ["Full Ice"],
  },

  // ===== STICKHANDLING =====
  {
    title: "Stickhandling - základy na místě",
    content: "Cvičení vedení kotouče na místě. Hráči rozmístěni po ploše, každý s kotoučem. Cviky: 1) Vedení vpřed-vzad (forhend-bekhend), 2) Vedení do stran, 3) Vedení kolem těla, 4) Vedení jednou rukou (horní/dolní), 5) Vedení se zdvihem hlavy (head up). Důraz na soft hands - měkké ruce, kotouč na středu čepele.",
    category: "Stickhandling",
    drillType: "Drill",
    tags: ["vedení kotouče", "stickhandling", "technika", "základy", "soft hands"],
    methodology: ["all"],
    ageGroups: ["U7", "U8", "U9", "U10", "U11"],
    iceConfig: ["any"],
  },
  {
    title: "Stickhandling v pohybu - slalom",
    content: "Vedení kotouče slalomem mezi kužely v pohybu. Kužely ve 3-4 řadách s různými rozestupy. Progrese: 1) Široký slalom (velké rozestupy), 2) Úzký slalom, 3) Slalom s kličkou na konci, 4) Slalom s head-up (trenér ukazuje čísla). Důraz na kontrolu kotouče a periferní vnímání.",
    category: "Stickhandling",
    drillType: "Drill",
    tags: ["vedení kotouče", "slalom", "pohyb", "kužely", "kontrola"],
    methodology: ["all"],
    ageGroups: ["U9", "U10", "U11", "U12", "U13"],
    iceConfig: ["any"],
  },
  {
    title: "Vedení kotouče - obratnost a klička",
    content: "Kombinace bruslení a vedení kotouče s kličkami. Parcours s kužely: slalom, obraty s kotoučem, klička forhend, klička bekhend, klička mezi nohama (through the legs), klička za zády. Postupné zvyšování rychlosti. Důraz na hlavu nahoře a automatizaci kliček.",
    category: "Stickhandling",
    drillType: "Drill",
    tags: ["vedení kotouče", "klička", "obratnost", "forhend", "bekhend"],
    methodology: ["Czech", "Canadian", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14"],
    iceConfig: ["Half Ice", "Full Ice"],
  },
  {
    title: "1na1 Puckhandling - B-figure",
    content: "Cvičení vedení kotouče ve tvaru písmene B. Half-ice. Hráč startuje od mantinelu, vede kotouč po oblouku kolem kruhu pro vhazování (tvar B), zakončuje střelou. Důraz na kontrolu kotouče v oblouku, ochranu puku tělem a zakončení v pohybu. Střídavě z obou stran.",
    category: "Stickhandling",
    drillType: "Drill",
    tags: ["vedení kotouče", "B-figure", "zakončení", "oblouk"],
    methodology: ["Czech", "Hybrid"],
    ageGroups: ["U11", "U12", "U13", "U14"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Puck protection - ochrana kotouče",
    content: "Cvičení na ochranu kotouče tělem. Dvojice v kruhu pro vhazování. Útočník chrání kotouč tělem (široký postoj, tělo mezi obráncem a kotoučem), obránce se snaží kotouč získat. Střídání rolí po 15s. Důraz na správnou pozici těla, nízké těžiště a aktivní práci nohama.",
    category: "Stickhandling",
    drillType: "Drill",
    tags: ["vedení kotouče", "ochrana puku", "puck protection", "souboje", "tělo"],
    methodology: ["Canadian", "Finnish", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Puckhandling pod tlakem",
    content: "Vedení kotouče pod tlakem obránce. Half-ice. Útočník startuje s kotoučem, obránce s 2s zpožděním. Útočník vede kotouč přes překážky a zakončuje pod tlakem. Progrese: 1) Pasivní obránce, 2) Semi-aktivní, 3) Plně aktivní. Důraz na rychlé rozhodování, ochranu puku a zakončení pod tlakem.",
    category: "Stickhandling",
    drillType: "Drill",
    tags: ["vedení kotouče", "pod tlakem", "rozhodování", "ochrana puku"],
    methodology: ["Canadian", "Finnish", "Hybrid"],
    ageGroups: ["U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Bruslení s kotoučem - komplexní",
    content: "Komplexní bruslení s kotoučem po celé ploše. Hráči vedou kotouč a procvičují: 1) Jízda vpřed s vedením, 2) Jízda vzad s vedením, 3) Překřižování s kotoučem, 4) Obraty s kotoučem (tight turn), 5) Přechody vpřed-vzad s kotoučem. Důraz na automatizaci - kotouč nesmí zpomalovat bruslení.",
    category: "Stickhandling",
    drillType: "Drill",
    tags: ["bruslení", "vedení kotouče", "technika", "kontrola", "automatizace"],
    methodology: ["all"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14"],
    iceConfig: ["Full Ice"],
  },

  // ===== SHOOTING =====
  {
    title: "Střelba ze slotu - příjem a zakončení",
    content: "Střelba z prostoru před bránou (slot) po příjmu ze strany. Nahrávač na křídle u mantinelu, střelec najíždí do slotu. Příjem na forhend/bekhend a okamžitá střela. Střídavě z pravé a levé strany. Brankář v bráně. Důraz na rychlost zpracování (max 1 dotek na příjem), přesnost a výběr místa.",
    category: "Shooting",
    drillType: "Drill",
    tags: ["střelba", "slot", "příjem", "zakončení", "forhend", "bekhend"],
    methodology: ["all"],
    ageGroups: ["U11", "U12", "U13", "U14", "U15", "U16"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Střelba obránců z modré s kombinací",
    content: "Obránci na modré čáře rozehrávají a střílí švihem. Po střele rozehrávka na útočníky pro 2vs2 nebo 2vs1. Útočníci doplňují dorážky a tečování. Důraz na tvrdou a přesnou střelu z modré, low shot pro tečování, a rychlý přechod do herní situace.",
    category: "Shooting",
    drillType: "Drill",
    tags: ["střelba", "obránci", "modrá čára", "švih", "tečování", "2vs2"],
    methodology: ["all"],
    ageGroups: ["U13", "U14", "U15", "U16", "U17"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "5x zakončení - série",
    content: "Pět různých typů zakončení v sérii. Half-ice. 1) Švih z mezikruží (wrist shot), 2) Přiklepnutí z kruhu (snap shot), 3) Blafák po kličce (deke), 4) Dorážka po střele od modré (rebound), 5) Zakončení z otočky (spin-o-rama). Každý hráč provede všech 5, poté střídání. Brankář v bráně.",
    category: "Shooting",
    drillType: "Drill",
    tags: ["střelba", "zakončení", "švih", "přiklepnutí", "blafák", "dorážka"],
    methodology: ["Canadian", "Czech", "Hybrid"],
    ageGroups: ["U12", "U13", "U14", "U15", "U16"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Shooting - předbrankový prostor (net-front)",
    content: "Střelba a práce v předbrankovém prostoru. Hráči najíždějí do slotu, přijímají nahrávky z rohů a od mantinelu. Cvičení: tečování (tip-in), dorážky (rebounds), zakončení z otočky, zakončení bekhend. Důraz na pozici těla před bránou, souboj o prostor a rychlé ruce.",
    category: "Shooting",
    drillType: "Drill",
    tags: ["střelba", "předbrankový prostor", "net-front", "dorážky", "tečování"],
    methodology: ["Finnish", "Canadian", "Hybrid"],
    ageGroups: ["U12", "U13", "U14", "U15", "U16"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Sniper - přesná střelba na terče",
    content: "Přesná střelba na terče v rozích brány. Terče nebo desky umístěny v rozích (4 rohy). Hráči střílí z různých pozic a vzdáleností. Bodový systém: blocker side high = 3 body, glove side high = 3 body, five-hole = 2 body. Soutěžní formát. Důraz na cílení, ne na sílu střely.",
    category: "Shooting",
    drillType: "Drill",
    tags: ["střelba", "přesnost", "sniper", "terče", "soutěž", "cílení"],
    methodology: ["Canadian", "Czech", "Hybrid"],
    ageGroups: ["U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Kolotoč se zakončením",
    content: "Hráči bruslí v kolotoči kolem kruhu pro vhazování. Na signál hráč s kotoučem vyjíždí ze skupiny a zakončuje střelou na bránu. Ostatní pokračují v kolotoči. Kontinuální cvičení s pravidelnými zakončeními. Střídavě z obou kruhů. Důraz na rychlý přechod z bruslení do střelby.",
    category: "Shooting",
    drillType: "Drill",
    tags: ["střelba", "kolotoč", "zakončení", "kontinuální", "přechod"],
    methodology: ["Czech", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Střelba 2-0 s kombinací",
    content: "Střelba ve dvojici bez obránce. Dva hráči vyjíždějí od modré, nahrávají si a zakončují. Variace: křížení (crisscross), zpětná nahrávka (drop pass), přihrávka přes obránce (kužel = defender). Důraz na načasování nahrávek, komunikaci a střelu v pohybu.",
    category: "Shooting",
    drillType: "Drill",
    tags: ["střelba", "2-0", "kombinace", "křížení", "drop pass"],
    methodology: ["all"],
    ageGroups: ["U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Cvičení na střely ze slotu - najetí a zapracování obránců",
    content: "Útočník najíždí do slotu, obránce nahrává z modré čáry. Útočník tečuje nebo střílí z první. Obránce pak střílí přímo (low shot), útočník clení brankáři. Důraz na správné postavení v předbrankovém prostoru, timing najetí, a koordinaci útočník-obránce.",
    category: "Shooting",
    drillType: "Drill",
    tags: ["střelba", "slot", "najetí", "obránci", "tečování", "clonění"],
    methodology: ["all"],
    ageGroups: ["U13", "U14", "U15", "U16"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Střelba s jízdou do 1vs1",
    content: "Hráč střílí z pozice na kruhu, rozjíždí se pro nový kotouč a jde do 1vs1 proti obránci. Střelba z kruhu, poté nájezd z rohu s kotoučem proti obránci startujícímu od modré. Trénink přechodu ze střelecké situace do soubojové. Half-ice.",
    category: "Shooting",
    drillType: "Drill",
    tags: ["střelba", "1vs1", "přechod", "souboj", "rozhodování"],
    methodology: ["Canadian", "Finnish", "Hybrid"],
    ageGroups: ["U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Obratnost, střelba, reakce",
    content: "Kombinované cvičení: obratnostní parcours (slalom, obraty, přeskoky), střelba na bránu, reakce na signál (blazepod/číslo). Hráč absolvuje obratnostní cvičení, střílí na bránu, poté reaguje na signál trenéra. Komplexní trénink koordinace, přesnosti a reakční rychlosti.",
    category: "Shooting",
    drillType: "Drill",
    tags: ["obratnost", "střelba", "reakce", "kombinované", "koordinace"],
    methodology: ["Canadian", "Finnish", "Hybrid"],
    ageGroups: ["U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice"],
  },

  // ===== PASSING =====
  {
    title: "Přihrávky s komunikací",
    content: "Přihrávkové cvičení s důrazem na komunikaci. Trojice v pohybu přes celou plochu. Pravidla: 1) Vždy volat jméno spoluhráče před nahrávkou, 2) Komunikovat směr pohybu ('mám to', 'nahoř'), 3) Terč - ukázat čepel hokejky kam chci nahrávku. Variace: bez mluvení (oční kontakt), s obráncem. Klíčové pro rozvoj herní komunikace.",
    category: "Passing",
    drillType: "Drill",
    tags: ["přihrávky", "komunikace", "trojice", "pohyb", "terč"],
    methodology: ["all"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Přihrávky v pohybu - přechody zónami",
    content: "Přihrávky ve dvojicích/trojicích při přechodu z obranného pásma přes střední do útočného. Důraz na timing (nahrávka v pohybu, nikdy ve stoji), přesnost a správný úhel nahrávky. Variace: s pasivním obráncem, s aktivním forčekingem. Švédský koncept 5-lane pro správné rozložení hráčů.",
    category: "Passing",
    drillType: "Drill",
    tags: ["přihrávky", "přechody", "zóny", "timing", "5-lane"],
    methodology: ["Swedish", "Czech", "Hybrid"],
    ageGroups: ["U12", "U13", "U14", "U15", "U16"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Karusel 4 nahrávky",
    content: "Čtyři hráči na kruhu pro vhazování. Nahrávky v kruhu: forhend, bekhend, po ledě, vzduchem (saucer pass). Postupně zvyšovat rychlost. Po zvládnutí přidat pohyb - hráči se posouvají po kruhu. Důraz na kvalitu příjmu (měkké ruce), okamžitou rozehrávku a přesnost.",
    category: "Passing",
    drillType: "Drill",
    tags: ["přihrávky", "karusel", "kruhy", "saucer pass", "příjem"],
    methodology: ["all"],
    ageGroups: ["U10", "U11", "U12", "U13"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Přihraj a jeď (Give-and-go)",
    content: "Give-and-go cvičení. Hráč nahraje spoluhráči a okamžitě se rozjíždí do volného prostoru pro zpětnou nahrávku. Kontinuální pohyb přes celou plochu. Progrese: 1) Bez obránce, 2) S pasivním obráncem, 3) S aktivním obráncem. Klíčový koncept: support play - podpora hráče s kotoučem.",
    category: "Passing",
    drillType: "Drill",
    tags: ["přihrávky", "give-and-go", "podpora", "pohyb", "timing"],
    methodology: ["Swedish", "Czech", "Hybrid"],
    ageGroups: ["U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Full Ice", "Half Ice"],
  },
  {
    title: "Dvoupytel - rozehrávka na modrou",
    content: "Rozehrávka obránce na modrou čáru. Obránce získá kotouč za bránou, rozehrává na útočníka na modré čáře. Útočník přijímá a pokračuje v útoku. Variace: dva obránci, dva útočníci, pod tlakem forčekingu. Důraz na rychlou a přesnou rozehrávku, správné načasování najetí útočníka.",
    category: "Passing",
    drillType: "Drill",
    tags: ["rozehrávka", "obránce", "modrá čára", "breakout", "timing"],
    methodology: ["all"],
    ageGroups: ["U12", "U13", "U14", "U15", "U16"],
    iceConfig: ["Half Ice", "Full Ice"],
  },

  // ===== TACTICS =====
  {
    title: "2na2 Slot game + Shooter",
    content: "Taktické cvičení 2na2 v prostoru před bránou se střelcem na modré. Dva útočníci vs dva obránci v slotu. Obránce na modré čáře může kdykoli střílet - útočníci clení, dorážejí. Obránci vyklízejí slot, pokrývají hokejky. Důraz na boj o pozici v předbrankovém prostoru, box-out techniku.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "2na2", "slot", "box-out", "předbrankový prostor"],
    methodology: ["Canadian", "Finnish", "Hybrid"],
    ageGroups: ["U13", "U14", "U15", "U16"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Forčeking 2na1 - napadání",
    content: "Nácvik napadání 2na1 v útočném pásmu. Dva forvardi napadají jednoho obránce s kotoučem. F1 (první forvard) angluje obránce ke straně, F2 uzavírá přihrávkovou dráhu. Obránce se učí rozehrávat pod tlakem. Progrese: 1) Pasivní forčeking, 2) Semi-aktivní, 3) Plný tlak.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "forčeking", "napadání", "2na1", "anglování"],
    methodology: ["Canadian", "Finnish", "Hybrid"],
    ageGroups: ["U13", "U14", "U15", "U16"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "3-0 regroup + zakončení",
    content: "Rozehrávka 3-0 s regroupem. Tři útočníci vyjíždějí z obranného pásma, nahrávají obránci na modrou (regroup/swing), obránce rozehrává zpět. Útočníci přecházejí do útočného pásma ve formaci (middle lane drive) a zakončují. Důraz na správný timing, lane discipline (5-lane concept) a rychlé zakončení.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "regroup", "rozehrávka", "3-0", "formace", "5-lane"],
    methodology: ["Swedish", "Canadian", "Hybrid"],
    ageGroups: ["U13", "U14", "U15", "U16"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "2-1 regroup",
    content: "Přechodové cvičení 2na1 s regroupem. Dva útočníci vyjíždějí do útoku, regroup na modré s obráncem, poté 2na1 proti druhému obránci. Důraz na: 1) Speed through neutral zone, 2) Drive the net, 3) Support play, 4) Shot selection. Obránce cvičí gap control.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "regroup", "2na1", "gap control", "přechod"],
    methodology: ["Swedish", "Canadian", "Hybrid"],
    ageGroups: ["U13", "U14", "U15", "U16"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Backcheck - zpětné napadání",
    content: "Nácvik backchecku. Útočník s kotoučem útočí, obránce startuje se zpožděním a musí backcheckovat. Správný úhel přiblížení (inside-out angle), pozice hokejky (aktivní hůl na kotouč), timing kontaktu. Variace: 2na1 s backcheckujícím třetím hráčem. Klíčové pro finskou a kanadskou školu.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "backcheck", "obrana", "zpětné napadání", "úhel"],
    methodology: ["Finnish", "Canadian", "Hybrid"],
    ageGroups: ["U12", "U13", "U14", "U15", "U16"],
    iceConfig: ["Full Ice", "Half Ice"],
  },
  {
    title: "Backcheck mezi modrými čarami",
    content: "Backchecking ve středním pásmu. Útočník vyjíždí s kotoučem, obránce startuje z protilehlé modré a musí ho dohnat. Důraz na správný inside-out úhel pronásledování, uzavření prostoru ve středním pásmu, aktivní hokejka. Obránce se snaží získat pozici stick-on-puck.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "backcheck", "střední pásmo", "inside-out"],
    methodology: ["Finnish", "Canadian", "Hybrid"],
    ageGroups: ["U12", "U13", "U14", "U15"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Kombinační hra - nacvičené akce",
    content: "Útočné kombinace ve trojicích. Nacvičené akce: 1) Křížení (crisscross), 2) Drop pass, 3) Zpětná nahrávka (cycle), 4) Screen and tip, 5) Delay and support. Trenér určuje kombinaci číslem/signálem. Obránci reagují. Důraz na automatizaci, timing a správné provedení bez přemýšlení.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "kombinace", "křížení", "drop pass", "cycle"],
    methodology: ["Czech", "Swedish", "Hybrid"],
    ageGroups: ["U13", "U14", "U15", "U16"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Hra 2na2 útok vs obrana",
    content: "Situační hra 2na2 s důrazem na útočné a obranné principy. Half-ice. Útočníci: drive the net, puck support, shot selection. Obránci: gap control, stick positioning, box-out. Střídání rolí po každé akci. Trenér komentuje a opravuje taktické chyby v reálném čase.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "2na2", "útok", "obrana", "gap control", "principy"],
    methodology: ["all"],
    ageGroups: ["U12", "U13", "U14", "U15", "U16"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Nácvik najetí k mantinelu",
    content: "Trénink najetí k mantinelu pro získání kotouče. Stanoviště podél mantinelu. Hráči nacvičují: správný úhel najetí (45°), pozici těla (rameno vpřed), ochranu kotouče po získání, rozehrávku od mantinelu. Progrese: bez odporu → s pasivním odporem → s aktivním soubojovým tlakem.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "mantinel", "najetí", "souboje", "ochrana puku"],
    methodology: ["Canadian", "Finnish", "Hybrid"],
    ageGroups: ["U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Technika hole - aktivní hokejka",
    content: "Cvičení práce s hokejkou v obraně. Poke check (bodnutí), lift stick (zvednutí hole), press check (přitlačení hole). Správné držení hokejky při jízdě vzad (active stick position). Souboje o puk s důrazem na aktivní holí. Klíčové pro finskou defenzivní školu.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["technika", "hokejka", "poke check", "lift stick", "obrana"],
    methodology: ["Finnish", "Canadian", "Hybrid"],
    ageGroups: ["U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "3vs0 → 3vs1 progrese",
    content: "Postupné cvičení přečíslení. Fáze 1: 3vs0 - tři útočníci bez odporu, nacvičují formaci (wide lanes), přihrávkové vzorce a zakončení. Fáze 2: přidání jednoho obránce (3vs1), útočníci nacvičují přečíslení. Obránce cvičí gap control a výběr pozice. Progrese může pokračovat do 3vs2.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "3vs0", "3vs1", "přečíslení", "formace", "gap control"],
    methodology: ["all"],
    ageGroups: ["U12", "U13", "U14", "U15", "U16"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Drop pass v rohu s rotací a zapojením obránců",
    content: "Nácvik drop passu (přenechání kotouče) v rohu kluziště s následnou rotací hráčů. Útočník vjíždí do rohu, nechává kotouč pro najíždějícího spoluhráče (drop pass), rotuje do slotu. Druhý hráč sbírá kotouč, nahrává obránci na modrou pro střelu. Obránce střílí, útočníci dorážejí. Důraz na timing, komunikaci a pokrytí prostoru.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "drop pass", "roh", "rotace", "obránci", "cycle"],
    methodology: ["Canadian", "Czech", "Hybrid"],
    ageGroups: ["U13", "U14", "U15", "U16"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Breakout - rozehrávka z obranného pásma",
    content: "Nácvik strukturované rozehrávky z obranného pásma. Obránce získá puk za bránou, komunikuje s partnerem. Varianty: 1) Rimboard (o mantinel), 2) Direct pass na křídlo, 3) Reverse (na druhou stranu), 4) Up the middle. Útočníci nabízejí podporu ve správných pozicích. Klíčový koncept švédské a kanadské školy.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "breakout", "rozehrávka", "obranné pásmo", "komunikace"],
    methodology: ["Swedish", "Canadian", "Hybrid"],
    ageGroups: ["U13", "U14", "U15", "U16", "U17"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Defensive zone coverage - obranné pokrytí",
    content: "Nácvik obranného pokrytí v obranném pásmu. Pět hráčů nacvičují pozice: strong side D, weak side D, strong side F (low), weak side F (high), center (slot). Důraz na: 1) Communication, 2) Stick positioning, 3) Boxing out, 4) Clearing the net front, 5) Puck retrieval. Finský a kanadský koncept.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "obranné pásmo", "pokrytí", "pozice", "boxing out"],
    methodology: ["Finnish", "Canadian", "Hybrid"],
    ageGroups: ["U14", "U15", "U16", "U17"],
    iceConfig: ["Half Ice"],
  },

  // ===== GAMES (Herní cvičení) =====
  {
    title: "Hry na malém prostoru (Small-area games)",
    content: "Herní cvičení na zmenšeném hřišti (třetina nebo čtvrtina plochy). 3na3 nebo 4na4 s malými brankami. Pravidla: 1) Max 2 doteky, 2) Gól pouze po nahrávce, 3) Gól z předbrankového prostoru = 2 body. Důraz na rychlé rozhodování, krátké přihrávky, souboje 1na1. Časový limit 90s na výměnu.",
    category: "Tactics",
    drillType: "Game",
    tags: ["hra", "malý prostor", "small-area game", "rozhodování", "intenzita"],
    methodology: ["Canadian", "Czech", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Minihokej - cross-ice",
    content: "Hra minihokej na šířku kluziště (cross-ice). Malé branky bez brankářů. 3na3, 4na4. Ideální pro mladší kategorie (U7-U12). Více dotyků s kotoučem, více rozhodovacích situací, více zakončení. Pravidla se mění: max doteky, povinné přihrávky, gól po kombinaci.",
    category: "Tactics",
    drillType: "Game",
    tags: ["minihokej", "cross-ice", "malé branky", "rozvoj", "rozhodování"],
    methodology: ["Canadian", "Swedish", "Hybrid"],
    ageGroups: ["U7", "U8", "U9", "U10", "U11", "U12"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Minihokej - dvě poloviny současně",
    content: "Minihokej hraný současně na obou polovinách kluziště. Každá polovina: 3na3 nebo 4na4 s malými brankami. Maximální zapojení všech hráčů. Trenér může měnit pravidla na každé polovině nezávisle. Efektivní využití ledové plochy.",
    category: "Tactics",
    drillType: "Game",
    tags: ["minihokej", "dvě poloviny", "zapojení všech", "efektivita"],
    methodology: ["all"],
    ageGroups: ["U9", "U10", "U11", "U12", "U13"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Full Ice 5na5 - přípravná hra",
    content: "Hra 5na5 na celé ploše s pravidly. Plnohodnotná přípravná hra. Trenér zastavuje (freeze) a komentuje klíčové situace: forecheck, backcheck, breakout, transition. Důraz na aplikaci nacvičených prvků. Teachable moments - využití herních situací pro okamžitou korekci.",
    category: "Tactics",
    drillType: "Game",
    tags: ["hra", "5na5", "celá plocha", "přípravná hra", "teachable moments"],
    methodology: ["all"],
    ageGroups: ["U13", "U14", "U15", "U16", "U17"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Hra s modifikovanými pravidly",
    content: "Hra 4na4 nebo 5na5 s měnícími se pravidly. Příklady: 1) Gól platí jen po nahrávce, 2) Max 3 doteky, 3) Povinné křížení před střelou, 4) Gól z backhendu = 2 body, 5) Gól po dorážce = 2 body. Pravidla se mění každých 3-5 minut. Rozvoj kreativního myšlení a adaptability.",
    category: "Tactics",
    drillType: "Game",
    tags: ["hra", "modifikace", "pravidla", "kreativita", "adaptabilita"],
    methodology: ["all"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Full Ice", "Half Ice"],
  },
  {
    title: "3vs3 intenzivní hra",
    content: "Intenzivní hra 3na3 na zmenšeném hřišti (třetina plochy). Malé branky s brankáři. Rychlé střídání po 45s. Důraz na souboje 1na1, rychlé přihrávky, kreativní řešení. Battle level - vysoká intenzita soupeření. Soutěžní formát: tým s více góly vítězí.",
    category: "Tactics",
    drillType: "Game",
    tags: ["hra", "3na3", "intenzita", "souboje", "battle"],
    methodology: ["Canadian", "Finnish", "Hybrid"],
    ageGroups: ["U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "2na2 half-ice battle",
    content: "Hra 2na2 na polovině kluziště. Branka s brankářem. Po ztrátě útočný tým se mění na obranný (transition). Střídání po gólu nebo po 30s. Důraz na souboje 1na1, krytí hráče bez kotouče, quick transition po zisku/ztrátě kotouče.",
    category: "Tactics",
    drillType: "Game",
    tags: ["hra", "2na2", "half-ice", "souboje", "transition"],
    methodology: ["all"],
    ageGroups: ["U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "1na1 v kruhu - soubojové cvičení",
    content: "Souboj 1na1 v prostoru kruhu pro vhazování (omezený prostor). Kotouč uprostřed, oba hráči startují z okraje kruhu na signál. Kdo získá kotouč, snaží se zakončit na malou branku. Prohrávající okamžitě brání. Rozvoj soubojových dovedností, ochrana/získání puku v omezeném prostoru.",
    category: "Tactics",
    drillType: "Game",
    tags: ["hra", "1na1", "souboj", "kruh", "omezený prostor", "battle"],
    methodology: ["Canadian", "Finnish", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "3vs3 s Gretzkým (neutral player)",
    content: "Hra 3na3 s jedním neutrálním hráčem ('Gretzky'), který hraje za tým s kotoučem. Vždy 4vs3 přesila pro tým s pukem. Důraz na rychlé přepínání (transition), podporu hráče s kotoučem, hru v přesile i oslabení. Neutrální hráč se mění každé 2 minuty.",
    category: "Tactics",
    drillType: "Game",
    tags: ["hra", "3na3", "neutrální hráč", "přesila", "transition"],
    methodology: ["Swedish", "Czech", "Hybrid"],
    ageGroups: ["U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Hra 6 puků - chaos drill",
    content: "Speciální hra se šesti puky na ledě současně. Na signál obě strany sbírají puky a zakončují. Každý puk = jeden pokus o gól. Rozvoj periferního vnímání, rychlého rozhodování a zakončení pod chaotickým tlakem. Velký zábavný faktor. Kdo dá více gólů z 6 puků vyhrává.",
    category: "Tactics",
    drillType: "Game",
    tags: ["hra", "chaos", "více puků", "zakončení", "zábava"],
    methodology: ["Canadian", "Czech", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Rovnovážné situace 1v1, 2v2, 3v3",
    content: "Postupné cvičení rovnovážných herních situací. Začíná se 1na1 (souboj o puk, zakončení). Po zvládnutí přidání dalších hráčů: 2na2 (pokrývání, komunikace). Finále: 3na3 (správné pozice, podpora). Důraz na obranné principy při rovnosti hráčů: stick-on-puck, body position, gap control.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["taktika", "1v1", "2v2", "3v3", "rovnováha", "obranné principy"],
    methodology: ["all"],
    ageGroups: ["U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice"],
  },

  // ===== CONDITIONING & WARM-UP =====
  {
    title: "Warm Up - strukturované rozcvičení",
    content: "Standardní rozcvičení dle metodických pravidel. 1) Volné bruslení s kotoučem 2-3 min (nikdy bez kotouče dle české metodiky), 2) Dynamické protahování na ledě (leg swings, hip openers), 3) Krátké sprinty s postupným zvyšováním intenzity, 4) Přihrávky ve dvojicích v pohybu. Celkem 8-10 minut.",
    category: "Conditioning",
    drillType: "Drill",
    tags: ["rozcvičení", "warm-up", "protahování", "příprava", "struktura"],
    methodology: ["all"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14", "U15", "U16"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Kondiční trénink na ledě",
    content: "Intervalové sprinty na ledě. Série: 1) Sprint modrá-modrá x5, 2) Sprint celá plocha x3, 3) Suicides (modrá-zpět-červená-zpět-modrá) x3, 4) 30s sprint / 30s volno x6. Kombinace s bruslařskými prvky (obraty, přešlapování). Odpočinek mezi sériemi 2 minuty. Důraz na udržení techniky i při únavě.",
    category: "Conditioning",
    drillType: "Drill",
    tags: ["kondice", "sprinty", "intervaly", "vytrvalost", "technika při únavě"],
    methodology: ["all"],
    ageGroups: ["U13", "U14", "U15", "U16", "U17"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Skills dovednostní trénink",
    content: "Komplexní dovednostní trénink na stanovištích. 4-6 stanovišť: S1: Stickhandling parcours, S2: Přihrávky na přesnost, S3: Střelba na terče, S4: 1na1 souboj, S5: Bruslení parcours, S6: Klička a zakončení. Rotace po 2-3 minutách. Důraz na kvalitu provedení, progresivní obtížnost.",
    category: "Stickhandling",
    drillType: "Drill",
    tags: ["dovednosti", "skills", "stanoviště", "komplexní", "progrese"],
    methodology: ["all"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14"],
    iceConfig: ["Full Ice"],
  },

  // ===== STATION/SECTOR TRAINING =====
  {
    title: "Stanovištní trénink - 4 stanoviště",
    content: "Celá plocha rozdělena na 4 stanoviště. S1: Bruslení/obratnost (u jedné branky), S2: Stickhandling (neutrální zóna vlevo), S3: Přihrávky a střelba (neutrální zóna vpravo), S4: Herní situace (u druhé branky). Skupiny po 4-5 hráčích rotují na signál (3-4 minuty). Efektivní využití celé ledové plochy dle české metodiky.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["stanoviště", "rotace", "4 skupiny", "efektivita", "česká metodika"],
    methodology: ["Czech", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "2x sektor - dvě skupiny",
    content: "Plocha rozdělena na 2 sektory (poloviny). V každém sektoru jiné cvičení současně. Sektor 1: Herní cvičení (3na3 s brankářem). Sektor 2: Dovednostní cvičení (střelba, přihrávky, stickhandling). Skupiny se střídají po 8-10 minutách. Maximální aktivita všech hráčů.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["sektory", "2 skupiny", "současně", "efektivita"],
    methodology: ["Czech", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "3x sektor - tři skupiny",
    content: "Plocha rozdělena na 3 sektory (třetiny). S1: Bruslení/obratnost, S2: Přihrávky a střelba, S3: Herní situace (2na2, 1na1). Tři skupiny rotují po 6-7 minutách. Efektivní využití celé plochy. Každý sektor má vlastního trenéra/asistenta.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["sektory", "3 skupiny", "rotace", "efektivita"],
    methodology: ["Czech", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "4x sektor - čtyři skupiny",
    content: "Plocha rozdělena na 4 sektory (čtvrtiny). S1: Bruslení, S2: Stickhandling, S3: Střelba, S4: Minihra. Čtyři skupiny rotují po 5 minutách. Maximální využití prostoru pro větší počty hráčů (16+). Ideální pro české podmínky s větším počtem hráčů na ledě.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["sektory", "4 skupiny", "rotace", "větší počet hráčů"],
    methodology: ["Czech", "Hybrid"],
    ageGroups: ["U10", "U11", "U12", "U13", "U14", "U15"],
    iceConfig: ["Full Ice"],
  },

  // ===== AGE-SPECIFIC TRAINING FORMATS =====
  {
    title: "Přípravka - hravý trénink",
    content: "Tréninkový formát pro přípravku (U7-U9). 90% hravá forma, soutěže, hry. Cvičení max 2-3 minuty, rychlé střídání aktivit. Obsah: základy bruslení formou her, jednoduché vedení kotouče, mini-hry cross-ice. Důraz na radost z pohybu, pozitivní motivace. Trenér jako facilitátor zábavy.",
    category: "Skating",
    drillType: "Drill",
    tags: ["přípravka", "U7-U9", "hry", "zábava", "základy"],
    methodology: ["all"],
    ageGroups: ["U7", "U8", "U9"],
    iceConfig: ["Full Ice", "Half Ice"],
  },
  {
    title: "Mateřské školky - úvod do hokeje",
    content: "Program pro děti z mateřských škol. Základní pohyb na ledě formou her. Cviky: jízda vpřed, zastavení, padání a vstávání, sbírání předmětů na ledě, hry na honěnou. Krátká cvičení (max 1-2 minuty). Důraz na bezpečnost, radost a pozitivní první zkušenost s ledem.",
    category: "Skating",
    drillType: "Drill",
    tags: ["školky", "úvod", "základy", "bezpečnost", "zábava"],
    methodology: ["all"],
    ageGroups: ["U5", "U6", "U7"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Pojď hrát hokej - náborový trénink",
    content: "Náborový formát 'Pojď hrát hokej'. Seznámení s ledem, bruslení, hokejka a kotouč. Hravá forma s odměnami a soutěžemi. Cvičení pro úplné začátečníky: chůze po ledě, skluz, jednoduchý pád a vstání, vedení míčku, mini-hra. Důraz na pozitivní zážitek, motivaci pokračovat a rodičovské zapojení.",
    category: "Skating",
    drillType: "Drill",
    tags: ["nábor", "začátečníci", "motivace", "zábava", "rodiče"],
    methodology: ["Czech", "Hybrid"],
    ageGroups: ["U5", "U6", "U7", "U8"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "5. třída - situace 1na1",
    content: "Trénink situací 1na1 pro 5. třídu (U11). Různé varianty: 1) 1na1 z jízdy (útočník vs obránce face-to-face), 2) 1na1 z místa (battle za kotouč), 3) 1na1 s backcheckem, 4) 1na1 v omezeném prostoru (kruh). Střídání rolí útočník/obránce. Důraz na rozvoj individuálních soubojových dovedností.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["1na1", "souboje", "klička", "obrana", "individuální"],
    methodology: ["all"],
    ageGroups: ["U10", "U11", "U12"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Kruhový trénink s pukem - mladší žáci",
    content: "Stanovištní trénink s kotoučem pro mladší žáky (U10-U12). 5-6 stanovišť: S1: Vedení slalom, S2: Přihrávky o mantinel, S3: Střelba na malé branky, S4: Klička a zakončení, S5: Souboj 1na1 o puk, S6: Nahrávky ve dvojicích. Rotace po 2 minutách. Hravá forma s bodovým systémem.",
    category: "Stickhandling",
    drillType: "Drill",
    tags: ["kruhový trénink", "puk", "stanoviště", "mladší žáci", "bodování"],
    methodology: ["Czech", "Hybrid"],
    ageGroups: ["U10", "U11", "U12"],
    iceConfig: ["Full Ice"],
  },

  // ===== METHODOLOGY-SPECIFIC DRILLS =====
  {
    title: "Swedish Flow Drill - plynulé přechody",
    content: "Typicky švédské cvičení s plynulým přechodem mezi fázemi bez zastavení. Hráči v kontinuálním pohybu: přihrávka → bruslení → příjem → nahrávka → přechod → zakončení. Celá plocha, 3-4 skupiny v různých fázích. Důraz na flow - plynulost, tempo a přesnost v pohybu. Žádné stání, žádné fronty.",
    category: "Passing",
    drillType: "Drill",
    tags: ["swedish flow", "plynulost", "přechody", "kontinuální", "tempo"],
    methodology: ["Swedish", "Hybrid"],
    ageGroups: ["U13", "U14", "U15", "U16"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Canadian Battle Drill - soubojové cvičení",
    content: "Typicky kanadské soubojové cvičení. Variations: 1) Puck battle along the boards (souboj u mantinelu), 2) Net-front battle (souboj před bránou), 3) Corner battle (souboj v rohu), 4) Open-ice battle. Střídání po 15-20s. Maximální intenzita. Compete level = 100%. Rozvoj fyzické hry a mentální houževnatosti.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["battle", "souboje", "compete", "kanadská škola", "intenzita"],
    methodology: ["Canadian", "Hybrid"],
    ageGroups: ["U12", "U13", "U14", "U15", "U16"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Finnish Defensive Structure",
    content: "Finská obranná struktura. Nácvik 5-man defensive unit: F1 pressures puck, F2 takes away strong-side option, D1 plays tight gap, D2 covers weak side, F3 covers high slot. Rotace při pohybu kotouče. Důraz na aktivní hokejku (stick-on-puck), komunikaci a disciplínu. Žádné freelancing.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["obrana", "finská struktura", "pokrytí", "disciplína", "aktivní hokejka"],
    methodology: ["Finnish", "Hybrid"],
    ageGroups: ["U14", "U15", "U16", "U17"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Czech Combination Play - česká kombinační hra",
    content: "Typicky české kombinační cvičení ve trojicích. Nacvičené akce: 1) Trojúhelník s přihrávkou zpět, 2) Křížení s výměnou pozic, 3) Double pass a najetí do slotu, 4) Cycle v rohu s podporou obránce. Důraz na kreativitu v rámci struktury, improvizaci nad nacvičeným základem. Čtení spoluhráče.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["kombinace", "česká škola", "kreativita", "trojice", "improvizace"],
    methodology: ["Czech", "Hybrid"],
    ageGroups: ["U13", "U14", "U15", "U16"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Swedish 5-Lane Transition",
    content: "Švédský přechodový drill využívající 5-lane koncept. Hráči se pohybují v 5 vertikálních pruzích (2 křídla u mantinelů, 2 vnitřní pruhy, 1 středový pruh). Přechod z obrany do útoku s důrazem na šířku hry, puck support a správné rozložení. Obránci cvičí kontrolovaný regroup.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["5-lane", "transition", "přechod", "šířka hry", "regroup"],
    methodology: ["Swedish", "Hybrid"],
    ageGroups: ["U14", "U15", "U16", "U17"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Herní trénink - aplikační",
    content: "Trénink zaměřený na aplikaci nacvičených prvků v herním kontextu. Většina času ve hře s modifikacemi zaměřenými na nacvičované dovednosti. Formáty: 3na3, 4na4, 5na5. Trenér zastavuje a komentuje klíčové situace (teachable moments). Důraz na přenos z tréninku do hry.",
    category: "Tactics",
    drillType: "Game",
    tags: ["herní trénink", "aplikace", "teachable moments", "přenos"],
    methodology: ["all"],
    ageGroups: ["U12", "U13", "U14", "U15", "U16"],
    iceConfig: ["Full Ice"],
  },
  {
    title: "Bruslení se střelbou a nahrávkami - komplexní",
    content: "Komplexní cvičení kombinující bruslení, přihrávky a střelbu v jednom drill. Hráč bruslí parcours, přijímá nahrávku v pohybu, posílá nahrávku dalšímu hráči, najíždí do pozice a zakončuje střelou. Kontinuální cvičení s plynulou rotací. Důraz na kvalitu všech prvků v herním tempu.",
    category: "Shooting",
    drillType: "Drill",
    tags: ["bruslení", "střelba", "přihrávky", "komplexní", "kontinuální"],
    methodology: ["all"],
    ageGroups: ["U12", "U13", "U14", "U15"],
    iceConfig: ["Half Ice", "Full Ice"],
  },
  {
    title: "Nácvik přečíslení 2na1",
    content: "Systematický nácvik přečíslení 2na1. Útočníci: 1) Speed through neutral zone, 2) Puck carrier drives wide, 3) Support player drives the net, 4) Read the D - střela nebo nahrávka. Obránce: 1) Control gap, 2) Take away pass or shot, 3) Force decision. Postupná progrese od walk-through k game speed.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["přečíslení", "2na1", "útok", "obrana", "gap control"],
    methodology: ["all"],
    ageGroups: ["U12", "U13", "U14", "U15", "U16"],
    iceConfig: ["Full Ice", "Half Ice"],
  },
  {
    title: "Power play - přesilová hra",
    content: "Nácvik přesilové hry. Formace: 1-3-1 nebo umbrella (2-2-1). Pohyb kotouče po obvodu, hledání shooting lanes. Důraz na: 1) Quick puck movement, 2) One-timer setup, 3) Net-front presence, 4) Shot from the point, 5) Screening. Cvičení nejprve bez odporu, poté s pasivním PK.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["přesilovka", "power play", "formace", "1-3-1", "umbrella"],
    methodology: ["Canadian", "Swedish", "Hybrid"],
    ageGroups: ["U14", "U15", "U16", "U17"],
    iceConfig: ["Half Ice"],
  },
  {
    title: "Penalty kill - oslabení",
    content: "Nácvik hry v oslabení. Box formace (diamond/square). Důraz na: 1) Pressure on puck carrier, 2) Collapsing to protect slot, 3) Shot blocking, 4) Clearing lanes, 5) Quick breakout after puck recovery. Agresivní PK (finský styl) vs konzervativní PK (box). Komunikace je klíčová.",
    category: "Tactics",
    drillType: "Drill",
    tags: ["oslabení", "penalty kill", "box", "diamond", "obrana"],
    methodology: ["Finnish", "Canadian", "Hybrid"],
    ageGroups: ["U14", "U15", "U16", "U17"],
    iceConfig: ["Half Ice"],
  },
];
