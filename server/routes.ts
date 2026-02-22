import {
  setupAuth,
  registerAuthRoutes,
  isAuthenticated,
} from "./auth";
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { getMethodologyContext, getRelevantDrills, formatDrillsForPrompt, assembleTrainingFromDatabase } from "./drillSeedData";

// --- AI Logic ---
async function generateTrainingSession(input: any, coachProfile: any, drillContext?: { favorites: string[], banned: string[], highRated: string[] }, knowledgeLibrary?: { title: string, content: string, category: string | null, tags: string[] | null }[]) {
  const dbResult = assembleTrainingFromDatabase(input, coachProfile, drillContext, knowledgeLibrary);
  if (dbResult) {
    console.log("[Hybrid] Training assembled from database (0 AI calls)");
    return dbResult.content;
  }
  console.log("[Hybrid] Not enough DB drills, falling back to AI generation");

  const drillContextStr = drillContext ? `
    DRILL PREFERENCE CONTEXT (Coach's History):
    - Favorite drill patterns: ${drillContext.favorites.length > 0 ? drillContext.favorites.join("; ") : "None yet"}
    - Banned/disliked drills: ${drillContext.banned.length > 0 ? drillContext.banned.join("; ") : "None"}
    - High-rated patterns: ${drillContext.highRated.length > 0 ? drillContext.highRated.join("; ") : "None"}
    IMPORTANT: Prioritize favorite and high-rated patterns. NEVER include banned drill patterns. Vary drills to avoid repetition.
  ` : "";

  const knowledgeStr = knowledgeLibrary && knowledgeLibrary.length > 0 ? `
    COACH'S PERSONAL DRILL LIBRARY (${knowledgeLibrary.length} custom drills):
    ${knowledgeLibrary.map((k, i) => `
    [Custom ${i + 1}] "${k.title}" ${k.category ? `(Category: ${k.category})` : ""} ${k.tags?.length ? `Tags: ${k.tags.join(", ")}` : ""}
    ${k.content}
    `).join("\n")}
    
    IMPORTANT: PRIORITIZE the coach's personal custom drills above. These are drills the coach specifically added and wants to use. Adapt them to fit the session parameters.
  ` : "";

  const effectiveMethodology = input.methodology || coachProfile?.preferredMethodology || "Hybrid";
  const methodologyKnowledge = getMethodologyContext(effectiveMethodology);
  const relevantDrills = getRelevantDrills(
    effectiveMethodology,
    input.focus || [],
    input.iceConfig || "Full Ice",
    input.category || "",
  );
  const maxInternalDrills = knowledgeLibrary && knowledgeLibrary.length > 0
    ? Math.max(5, 15 - knowledgeLibrary.length)
    : 15;
  const internalDrillsStr = formatDrillsForPrompt(relevantDrills, maxInternalDrills);

  const prompt = `
    You are an expert hockey coach assistant with deep knowledge of hockey training methodologies. Create a structured training session based on professional coaching principles.
    
    ${methodologyKnowledge}

    Session Parameters:
    - Methodology: ${effectiveMethodology}
    - Age Category: ${input.category}
    - Duration: ${input.duration} minutes
    - Ice Configuration: ${input.iceConfig}
    - Number of Stations: ${input.stations}
    - Focus Areas: ${input.focus.join(", ")}
    - Drill vs Game Ratio: ${input.drillRatio}% Drills
    - Cognitive Load: ${input.cognitiveLoad}
    - Players: ${input.playersCount} + ${input.goaliesCount} Goalies
    
    Coach DNA Context:
    - Club: ${coachProfile?.club || "N/A"}
    - Preferred Methodology: ${coachProfile?.preferredMethodology || "N/A"}
    ${drillContextStr}
    ${knowledgeStr}
    ${internalDrillsStr}

    CRITICAL METHODOLOGY REQUIREMENT: All drills MUST follow the principles and philosophy of the ${effectiveMethodology} methodology described above. Drill design, progression, intensity, and coaching points must align with ${effectiveMethodology} training philosophy. Use age-appropriate exercises following the age-specific guidelines.

    STRICT STRUCTURE REQUIREMENT:
    1. Warmup: Activation, low intensity, no main focus.
    2. Main Part: Core development based on selected focus areas. 
       Divide into EXACTLY ${input.stations} stations.
    3. Finish: Application or game-based implementation.

    Ice Configuration: ${input.iceConfig}
    Station Timing: ${input.stationTimingMode} ${input.maxStationDuration ? `(Max ${input.maxStationDuration} min)` : ""}

    CRITICAL: Each station in "main" MUST include a unique "drill_id" string (format: "drill_<focus>_<number>") and a "zone_area" object defining its physical area on the rink.

    DRILL DIAGRAM REQUIREMENT:
    ALL sections (warmup, EVERY main station, AND finish) MUST include a "diagram_elements" array with SVG diagram elements showing the drill visually.
    Element types: "player", "defender", "goalie", "puck", "cone", "pass", "shot", "skating", "skating-backward", "skating-puck", "label"
    Each element has: { "type": "...", "x": number, "y": number, "x2"?: number, "y2"?: number, "label"?: string }
    - Coordinates are in a 200x260 viewBox (x: 0-200, y: 0-260)
    - "player" = circle at (x,y), use "label" for jersey letter (A,B,C)
    - "defender" = triangle at (x,y), use "label" for letter
    - "goalie" = square at (x,y)
    - "cone" = small triangle at (x,y)
    - "pass" = dashed line from (x,y) to (x2,y2) 
    - "shot" = double arrow from (x,y) to (x2,y2)
    - "skating" = solid arrow line from (x,y) to (x2,y2)
    - "skating-puck" = wavy line from (x,y) to (x2,y2)
    - "label" = text label at (x,y) with "label" field
    Include 4-8 elements per drill showing player positions, movement patterns, and passing/shooting lines.
    Also include "rink_view" field that MUST match the station's physical position on the rink:
    - Station in defensive zone (x_start < 30): use "zone-left"
    - Station in offensive zone (x_start > 60): use "zone-right"  
    - Station in neutral zone (30 <= x_start <= 60): use "neutral"
    - Station covering half ice (width ~50): use "half-left" or "half-right"
    - Full ice: use "full"
    The diagram should visually represent what happens in THAT specific zone of the rink, not the full ice.

    Output STRICT JSON format with this structure:
    {
      "warmup": { "title": "...", "duration": "...", "description": "...", "key_points": [],
        "diagram_elements": [{"type":"player","x":100,"y":200,"label":"A"},{"type":"skating","x":100,"y":200,"x2":100,"y2":80}],
        "rink_view": "full"
      },
      "main": [ 
        { 
          "station_id": 1,
          "drill_id": "drill_skating_001",
          "duration": 10,
          "rotation_cycles": 1,
          "title": "...", 
          "type": "Drill" or "Game", 
          "description": "...", 
          "focus_tags": [],
          "zone_area": { "x_start": 0, "y_start": 0, "width": 50, "height": 100 },
          "zone_label": "Station 1",
          "zone_color": "#3B82F6",
          "diagram_elements": [
            {"type":"player","x":60,"y":220,"label":"A"},
            {"type":"player","x":140,"y":220,"label":"B"},
            {"type":"skating","x":60,"y":220,"x2":100,"y2":80},
            {"type":"pass","x":100,"y":80,"x2":140,"y2":140},
            {"type":"shot","x":140,"y":140,"x2":180,"y2":40},
            {"type":"goalie","x":180,"y":30},
            {"type":"cone","x":100,"y":130}
          ],
          "rink_view": "zone-left"
        } 
      ],
      "finish": { "title": "...", "duration": "...", "description": "...",
        "diagram_elements": [{"type":"player","x":50,"y":130,"label":"A"},{"type":"player","x":150,"y":130,"label":"B"}],
        "rink_view": "full"
      },
      "metadata": {
        "skill_distribution": { "Skating": 30, "Shooting": 20, "Passing": 20, "Tactics": 30 },
        "cognitive_load": "${input.cognitiveLoad}",
        "intensity": "Varies by Age",
        "ice_config": "${input.iceConfig}"
      }
    }

    ICE LAYOUT: ${input.layoutType || "auto"}
    ${input.customLayoutCoordinates ? `CUSTOM ZONE COORDINATES: ${JSON.stringify(input.customLayoutCoordinates)}` : ""}
    
    ZONE_AREA RULES for ${input.stations} stations on ${input.iceConfig}:
    - Coordinates are percentages (0-100) of the rink area
    - Zones must NOT overlap
    ${input.layoutType === "2-1-2" ? "- Use 2-1-2 layout: 2 stations in offensive zone, 1 in neutral zone, 2 in defensive zone" : ""}
    ${input.layoutType === "4-lanes" ? "- Use 4 vertical lanes from goal line to red line" : ""}
    ${input.layoutType === "3-zones" ? "- Use 3 horizontal zones: defensive, neutral, offensive" : ""}
    ${input.layoutType === "half-ice-4" ? "- Use 4 segments in half ice" : ""}
    ${input.layoutType === "custom" && input.customLayoutCoordinates ? "- Use the exact custom zone coordinates provided above" : `- Each station gets equal horizontal width: ${Math.floor(100 / input.stations)}%`}
    - Use distinct zone_colors: ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6"]
    - zone_label should be "Station X" format
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      { role: "system", content: "You are a professional hockey coach AI. You follow a strict 3-part structure: Warmup, Main Part, Finish. Output valid JSON only." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // 1. Setup Authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // 2. Coach Profile Routes
  app.get(api.coachProfile.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const profile = await storage.getCoachProfile(userId);
    res.json(profile || null);
  });

  app.post(api.coachProfile.createOrUpdate.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.coachProfile.createOrUpdate.input.parse(req.body);
      const profile = await storage.createOrUpdateCoachProfile(userId, input);
      res.json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // 3. Training Routes
  app.get(api.trainings.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const trainings = await storage.getUserTrainings(userId);
    res.json(trainings);
  });

  app.get(api.trainings.get.path, isAuthenticated, async (req: any, res) => {
    const training = await storage.getTraining(Number(req.params.id));
    if (!training) return res.status(404).json({ message: "Training not found" });
    if (training.userId !== req.user.claims.sub) return res.status(403).json({ message: "Forbidden" });

    const content = training.content as any;
    if (content && content.pending === true) {
      try {
        const genParams = content.generationParams || {};
        const storedInput = (training.inputParams || {}) as any;
        const userId = training.userId;
        const coachProfile = await storage.getCoachProfile(userId);
        const allFeedback = await storage.getUserDrillFeedback(userId);
        const drillContext = {
          favorites: allFeedback.filter(f => f.favorite).map(f => f.title || f.drillId),
          banned: allFeedback.filter(f => f.banned).map(f => f.title || f.drillId),
          highRated: allFeedback.filter(f => (f.rating || 0) >= 4).map(f => f.title || f.drillId),
        };

        const rawFocus = genParams.focus || storedInput.focus || training.focus;
        const safeFocus = Array.isArray(rawFocus) && rawFocus.length > 0 ? rawFocus.map(String) : ["Skating"];
        const safeStations = Math.min(5, Math.max(1, Number(genParams.stations || storedInput.stations || training.stationCount) || 3));
        const safeDuration = Math.min(180, Math.max(15, Number(genParams.duration || storedInput.duration || training.duration) || 60));

        const input = {
          methodology: genParams.methodology || storedInput.methodology || training.methodology || "Hybrid",
          category: genParams.category || storedInput.category || "U15",
          duration: safeDuration,
          iceConfig: genParams.iceConfig || storedInput.iceConfig || training.iceConfig || "Full Ice",
          stations: safeStations,
          focus: safeFocus,
          drillRatio: Number(genParams.drillRatio || storedInput.drillRatio || training.drillRatio) || 60,
          cognitiveLoad: genParams.cognitiveLoad || storedInput.cognitiveLoad || "Medium",
          playersCount: Number(genParams.playersCount || storedInput.playersCount) || 18,
          goaliesCount: Number(genParams.goaliesCount || storedInput.goaliesCount) || 2,
          stationTimingMode: genParams.stationTimingMode || storedInput.stationTimingMode || "Automatic",
          maxStationDuration: genParams.maxStationDuration || storedInput.maxStationDuration || null,
          layoutType: genParams.layoutType || storedInput.layoutType || null,
          customLayoutCoordinates: genParams.customLayoutCoordinates || storedInput.customLayoutCoordinates || null,
        };

        const generatedContent = await generateTrainingSession(input, coachProfile, drillContext);
        await storage.updateTrainingContent(training.id, generatedContent);
        res.json({ ...training, content: generatedContent });
      } catch (err) {
        console.error("Lazy generation error:", err);
        res.json({ ...training, content: { pending: true, error: true, message: "Generation failed, please try again" } });
      }
      return;
    }

    res.json(training);
  });

  app.post(api.trainings.generate.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.trainings.generate.input.parse(req.body);
      const coachProfile = await storage.getCoachProfile(userId);
      
      const allFeedback = await storage.getUserDrillFeedback(userId);
      const drillContext = {
        favorites: allFeedback.filter(f => f.favorite).map(f => f.title || f.drillId),
        banned: allFeedback.filter(f => f.banned).map(f => f.title || f.drillId),
        highRated: allFeedback.filter(f => (f.rating || 0) >= 4).map(f => f.title || f.drillId),
      };

      const knowledgeChunksData = await storage.getUserKnowledgeChunks(userId);
      const knowledgeLibrary = knowledgeChunksData.map(k => ({
        title: k.title,
        content: k.content,
        category: k.category,
        tags: k.tags,
      }));

      // AI Generation
      const generatedContent = await generateTrainingSession(input, coachProfile, drillContext, knowledgeLibrary);

      const today = new Date().toISOString().split("T")[0];
      const training = await storage.createTraining(userId, {
        title: `${input.category} - ${input.focus[0]} Session`,
        duration: input.duration,
        methodology: input.methodology,
        focus: input.focus,
        iceConfig: input.iceConfig,
        stationCount: input.stations,
        stationTimingMode: input.stationTimingMode,
        maxStationDuration: input.maxStationDuration || null,
        difficulty: input.difficulty,
        drillRatio: input.drillRatio,
        content: generatedContent,
        inputParams: input,
        trainingDate: (input as any).trainingDate || today,
        startTime: (input as any).startTime || null,
        status: "planned",
      });

      res.json(training);
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to generate training" });
    }
  });

  // Quick AI Generation from freeform prompt
  app.post(api.trainings.generateFromPrompt.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const { prompt } = api.trainings.generateFromPrompt.input.parse(req.body);
      const coachProfile = await storage.getCoachProfile(userId);

      const allFeedback = await storage.getUserDrillFeedback(userId);
      const drillContext = {
        favorites: allFeedback.filter(f => f.favorite).map(f => f.title || f.drillId),
        banned: allFeedback.filter(f => f.banned).map(f => f.title || f.drillId),
        highRated: allFeedback.filter(f => (f.rating || 0) >= 4).map(f => f.title || f.drillId),
      };
      const drillContextStr = drillContext.favorites.length || drillContext.banned.length || drillContext.highRated.length ? `
        DRILL PREFERENCE CONTEXT:
        - Favorites: ${drillContext.favorites.join("; ") || "None"}
        - Banned: ${drillContext.banned.join("; ") || "None"}
        - High-rated: ${drillContext.highRated.join("; ") || "None"}
      ` : "";

      const extractPrompt = `
        You are a hockey coach AI assistant. A coach described what they want in natural language. 
        Extract training parameters AND generate the full training session in one step.

        Coach's request: "${prompt}"
        
        Coach DNA:
        - Club: ${coachProfile?.club || "Unknown"}
        - Preferred Methodology: ${coachProfile?.preferredMethodology || "Hybrid"}
        - Default Category: ${coachProfile?.category || "U15"}
        ${drillContextStr}

        IMPORTANT RULES:
        1. Extract parameters from the coach's description. If not specified, use smart defaults:
           - category: default "${coachProfile?.category || "U15"}"
           - duration: default 60
           - methodology: default "${coachProfile?.preferredMethodology || "Hybrid"}"
           - iceConfig: default "Full Ice"
           - stations: default 3
           - focus: infer from description
           - playersCount: default 15
           - goaliesCount: default 2
           - difficulty: default "Intermediate"
           - cognitiveLoad: default "Medium"
           - drillRatio: default ${coachProfile?.defaultDrillRatio || 60}
        
        2. Generate a COMPLETE training session with the standard 3-part structure.

        DRILL DIAGRAM REQUIREMENT:
        Each section (warmup, each station in main, finish) MUST include a "diagram_elements" array and "rink_view" field.
        "diagram_elements" is an array of SVG elements: { "type": "player"|"defender"|"goalie"|"cone"|"pass"|"shot"|"skating"|"skating-puck"|"label", "x": number, "y": number, "x2"?: number, "y2"?: number, "label"?: string }
        Coordinates in 200x260 viewBox. Include 4-8 elements per drill showing player positions & movement.
        "rink_view": "full"|"half-left"|"half-right"|"zone-left"|"zone-right"

        Output STRICT JSON with this structure:
        {
          "extractedParams": {
            "category": "...",
            "duration": 60,
            "methodology": "...",
            "iceConfig": "...",
            "stations": 3,
            "focus": ["..."],
            "playersCount": 15,
            "goaliesCount": 2,
            "difficulty": "...",
            "cognitiveLoad": "...",
            "drillRatio": 60,
            "stationTimingMode": "Automatic"
          },
          "session": {
            "warmup": { "title": "...", "duration": "...", "description": "...", "key_points": [],
              "diagram_elements": [{"type":"player","x":100,"y":200,"label":"A"}],
              "rink_view": "full"
            },
            "main": [
              {
                "station_id": 1,
                "drill_id": "drill_<focus>_001",
                "duration": 10,
                "rotation_cycles": 1,
                "title": "...",
                "type": "Drill",
                "description": "...",
                "focus_tags": [],
                "zone_area": { "x_start": 0, "y_start": 0, "width": 33, "height": 100 },
                "zone_label": "Station 1",
                "zone_color": "#3B82F6",
                "diagram_elements": [
                  {"type":"player","x":60,"y":220,"label":"A"},
                  {"type":"skating","x":60,"y":220,"x2":100,"y2":80},
                  {"type":"pass","x":100,"y":80,"x2":140,"y2":140},
                  {"type":"goalie","x":180,"y":30}
                ],
                "rink_view": "zone-left"
              }
            ],
            "finish": { "title": "...", "duration": "...", "description": "...",
              "diagram_elements": [{"type":"player","x":50,"y":130,"label":"A"}],
              "rink_view": "full"
            },
            "metadata": {
              "skill_distribution": { "Skating": 30, "Shooting": 20, "Passing": 20, "Tactics": 30 },
              "cognitive_load": "...",
              "intensity": "Varies by Age",
              "ice_config": "..."
            }
          }
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: "You are a professional hockey coach AI. Parse the coach's natural language request and generate a complete training session. Output valid JSON only." },
          { role: "user", content: extractPrompt }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      const params = result.extractedParams || {};
      const sessionContent = result.session || {};

      const today = new Date().toISOString().split("T")[0];
      const focusArr = Array.isArray(params.focus) ? params.focus : ["General"];
      const training = await storage.createTraining(userId, {
        title: `${params.category || "U15"} - ${focusArr[0] || "General"} Session`,
        duration: params.duration || 60,
        methodology: params.methodology || "Hybrid",
        focus: focusArr,
        iceConfig: params.iceConfig || "Full Ice",
        stationCount: params.stations || 3,
        stationTimingMode: params.stationTimingMode || "Automatic",
        maxStationDuration: params.maxStationDuration || null,
        difficulty: params.difficulty || "Intermediate",
        drillRatio: params.drillRatio || 60,
        content: sessionContent,
        inputParams: { ...params, originalPrompt: prompt },
        trainingDate: today,
        startTime: null,
        status: "planned",
      });

      res.json(training);
    } catch (err) {
      console.error("Quick AI generation error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to generate training from prompt" });
    }
  });

  // Partial Regeneration - Regenerate a single station
  app.post("/api/trainings/:id/regenerate-station", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const trainingId = Number(req.params.id);
    const { stationIndex, feedback } = req.body;

    try {
      const training = await storage.getTraining(trainingId);
      if (!training) return res.status(404).json({ message: "Training not found" });
      if (training.userId !== userId) return res.status(403).json({ message: "Forbidden" });

      const content = training.content as any;
      const inputParams = training.inputParams as any;
      const station = content.main?.[stationIndex];
      if (!station) return res.status(400).json({ message: "Invalid station index" });

      const zoneArea = station.zone_area;
      let rinkViewHint = station.rink_view || "full";
      if (zoneArea) {
        const centerX = zoneArea.x_start + zoneArea.width / 2;
        if (zoneArea.width <= 40) {
          rinkViewHint = centerX <= 30 ? "zone-left" : centerX >= 70 ? "zone-right" : "neutral";
        } else if (zoneArea.width <= 55) {
          rinkViewHint = centerX <= 40 ? "half-left" : centerX >= 60 ? "half-right" : "neutral";
        } else {
          rinkViewHint = "full";
        }
      }

      const prompt = `
        Regenerate ONLY this one station from a hockey training session.
        
        Original station: ${JSON.stringify(station)}
        ${feedback ? `Coach feedback/modification request: "${feedback}"\nIMPORTANT: The coach wants to MODIFY this drill. You MUST create a NEW title that reflects the changes requested. Do NOT keep the original title unchanged. The new title should describe the updated drill content.` : ""}
        
        Context:
        - Ice: ${inputParams.iceConfig || "Full Ice"}
        - Age: ${inputParams.category}
        - Focus: ${inputParams.focus?.join(", ")}
        - Methodology: ${inputParams.methodology}
        - Station zone on rink: ${zoneArea ? JSON.stringify(zoneArea) : "full ice"}

        Return a single station object in STRICT JSON:
        {
          "station_id": ${station.station_id || stationIndex + 1},
          "title": "NEW descriptive title reflecting the drill content${feedback ? " and coach's modification" : ""}",
          "duration": "...",
          "rotation_cycles": 3,
          "type": "Drill|Game",
          "description": "...",
          "focus_tags": [],
          ${zoneArea ? `"zone_area": ${JSON.stringify(zoneArea)},` : ""}
          ${station.zone_label ? `"zone_label": "${station.zone_label}",` : ""}
          ${station.zone_color ? `"zone_color": "${station.zone_color}",` : ""}
          "diagram_elements": [
            {"type":"player","x":60,"y":220,"label":"A"},
            {"type":"skating","x":60,"y":220,"x2":100,"y2":80},
            {"type":"pass","x":100,"y":80,"x2":140,"y2":140},
            {"type":"goalie","x":180,"y":30}
          ],
          "rink_view": "${rinkViewHint}"
        }
        
        DIAGRAM ELEMENTS: Include 4-8 elements showing player positions and movement.
        Element types: "player", "defender", "goalie", "cone", "pass", "shot", "skating", "skating-puck", "label"
        Coordinates in 200x260 viewBox. The diagram should show what happens in the ${rinkViewHint} portion of the rink.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: "You are a professional hockey coach AI. Output valid JSON only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const newStation = JSON.parse(response.choices[0].message.content || "{}");
      content.main[stationIndex] = newStation;

      await storage.updateTrainingContent(trainingId, content);
      res.json({ station: newStation, index: stationIndex });
    } catch (err) {
      console.error("Station regeneration error:", err);
      res.status(500).json({ message: "Failed to regenerate station" });
    }
  });

  app.delete(api.trainings.delete.path, isAuthenticated, async (req: any, res) => {
    const training = await storage.getTraining(Number(req.params.id));
    if (!training) return res.status(404).json({ message: "Not found" });
    if (training.userId !== req.user.claims.sub) return res.status(403).json({ message: "Forbidden" });
    
    await storage.deleteTraining(Number(req.params.id));
    res.status(204).send();
  });

  // 4. Analytics
  app.get(api.analytics.get.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const stats = await storage.getUserTrainingStats(userId);
    res.json(stats);
  });

  // 4b. Coach Consultation Chat
  app.post("/api/coach-chat", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const { message, history, language } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required" });
      }

      const coachProfile = await storage.getCoachProfile(userId);
      const trainings = await storage.getUserTrainings(userId);
      const isCzech = language === "cz";

      const chatHistory = (history || []).slice(-10).map((m: any) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const trainingsSummary = trainings.length > 0
        ? trainings.slice(0, 10).map(t => `${t.title} (${t.methodology}, ${(t.focus || []).join("/")})`).join("; ")
        : isCzech ? "Zatím žádné tréninky" : "No trainings yet";

      const systemPrompt = isCzech
        ? `Jsi CoachAI – přátelský a zkušený hokejový poradce. Vedeš neformální, ale odborný rozhovor s trenérem.
          
Profil trenéra: ${coachProfile ? `Klub: ${coachProfile.club || "neuvedeno"}, Metodika: ${coachProfile.preferredMethodology || "neuvedeno"}` : "Profil zatím nevyplněn"}
Poslední tréninky: ${trainingsSummary}
Počet tréninků celkem: ${trainings.length}

Pravidla:
- Odpovídej vždy ČESKY
- Buď povzbudivý, ale upřímný
- Nabízej praktické tipy a doporučení
- Pokud trenér sdílí pocity nebo obavy, buď empatický
- Můžeš se ptát na detaily, abys lépe poradil
- Sdílej odborné znalosti o hokejových metodikách (Canadian, Swedish, Finnish, Czech, Hybrid)
- Drž se hokeje a tréninku, ale buď přirozený
- Odpovídej stručně (2-4 věty), pokud trenér nežádá podrobnější odpověď`
        : `You are CoachAI – a friendly and experienced hockey coaching advisor. You lead an informal but professional conversation with the coach.
          
Coach profile: ${coachProfile ? `Club: ${coachProfile.club || "not specified"}, Methodology: ${coachProfile.preferredMethodology || "not specified"}` : "Profile not filled yet"}
Recent trainings: ${trainingsSummary}
Total trainings: ${trainings.length}

Rules:
- Be encouraging but honest
- Offer practical tips and recommendations
- If the coach shares feelings or concerns, be empathetic
- Ask follow-up questions to better advise
- Share expert knowledge about hockey methodologies (Canadian, Swedish, Finnish, Czech, Hybrid)
- Stay focused on hockey and training, but be natural
- Keep responses concise (2-4 sentences), unless the coach asks for more detail`;

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatHistory,
          { role: "user", content: message },
        ],
        max_completion_tokens: 500,
      });

      const reply = response.choices[0].message.content || "";
      res.json({ reply });
    } catch (err) {
      console.error("Coach chat error:", err);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // 5. Drill Feedback Routes
  app.get("/api/drill-feedback", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const feedback = await storage.getUserDrillFeedback(userId);
    res.json(feedback);
  });

  app.get("/api/drill-feedback/favorites", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const favorites = await storage.getUserFavoriteDrills(userId);
    res.json(favorites);
  });

  app.get("/api/drill-feedback/banned", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const banned = await storage.getUserBannedDrills(userId);
    res.json(banned);
  });

  app.post("/api/drill-feedback", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const result = await storage.upsertDrillFeedback(userId, req.body);
      res.json(result);
    } catch (err) {
      console.error("Drill feedback error:", err);
      res.status(500).json({ message: "Failed to save drill feedback" });
    }
  });

  // 6. Plans & Cycles
  app.get(api.plans.list.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const plans = await storage.getUserPlans(userId);
    res.json(plans);
  });

  app.get("/api/plans/:id", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = Number(req.params.id);
    const plan = await storage.getPlan(id);
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    if (plan.userId !== userId) return res.status(403).json({ message: "Forbidden" });
    res.json(plan);
  });

  app.post("/api/plans/generate-from-prompt", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
        return res.status(400).json({ message: "Please provide a plan description (at least 5 characters)" });
      }

      const coachProfile = await storage.getCoachProfile(userId);
      const feedbackList = await storage.getUserDrillFeedback(userId);
      const drillContext = {
        favorites: feedbackList.filter(d => d.favorite).map(d => `${d.title} (${d.category})`),
        banned: feedbackList.filter(d => d.banned).map(d => `${d.title} (${d.category})`),
        highRated: feedbackList.filter(d => (d.rating || 0) >= 4).map(d => `${d.title} (${d.category})`),
      };

      const extractPrompt = `You are a hockey coach AI assistant. A coach described what training plan they want in natural language.
Extract plan parameters and return them as JSON.

Coach's request: "${prompt.trim()}"

Coach DNA:
- Club: ${coachProfile?.club || "Unknown"}
- Preferred Methodology: ${coachProfile?.preferredMethodology || "Hybrid"}
- Default Category: ${coachProfile?.category || "U15"}
- Default Drill Ratio: ${coachProfile?.defaultDrillRatio || 60}

Extract these parameters. Use smart defaults if not specified:
- title: descriptive plan title (string)
- trainingsPerWeek: default 3 (1-5)
- durationWeeks: default 4 (1-4)
- startDate: default next Monday YYYY-MM-DD
- category: default "${coachProfile?.category || "U15"}"
- methodology: default "${coachProfile?.preferredMethodology || "Hybrid"}"
- iceConfig: default "Full Ice"
- duration: session duration in minutes, default 60
- difficulty: "Beginner"|"Intermediate"|"Advanced", default "Intermediate"
- weekConfigs: array of {focus: string[], notes: string} for each week. Vary focuses across weeks for progressive development. Focus options: Skating, Shooting, Passing, Stickhandling, Checking, Positioning, Tactics, Power Play, Penalty Kill, Face-offs, Transition, Goaltending, Conditioning

Output STRICT JSON only, no markdown:
{
  "title": "...",
  "trainingsPerWeek": 3,
  "durationWeeks": 4,
  "startDate": "YYYY-MM-DD",
  "category": "...",
  "methodology": "...",
  "iceConfig": "...",
  "duration": 60,
  "difficulty": "...",
  "weekConfigs": [{"focus": ["..."], "notes": "..."}]
}`;

      const openai = (await import("openai")).default;
      const client = new openai({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const extractRes = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: extractPrompt }],
        temperature: 0.4,
        response_format: { type: "json_object" },
      });

      const extracted = JSON.parse(extractRes.choices[0]?.message?.content || "{}");

      const title = extracted.title || "AI Training Plan";
      const trainingsPerWeek = Math.min(5, Math.max(1, extracted.trainingsPerWeek || 3));
      const durationWeeks = Math.min(4, Math.max(1, extracted.durationWeeks || 4));
      const startDate = extracted.startDate || (() => {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) + 7;
        d.setDate(diff);
        return d.toISOString().split("T")[0];
      })();
      const category = extracted.category || coachProfile?.category || "U15";
      const methodology = extracted.methodology || coachProfile?.preferredMethodology || "Hybrid";
      const iceConfig = extracted.iceConfig || "Full Ice";
      const duration = extracted.duration || 60;
      const difficulty = extracted.difficulty || "Intermediate";
      const rawWeekConfigs = Array.isArray(extracted.weekConfigs) ? extracted.weekConfigs : [];
      const weekConfigs = Array.from({ length: durationWeeks }, (_, i) => {
        const raw = rawWeekConfigs[i];
        const focus = Array.isArray(raw?.focus) && raw.focus.length > 0 ? raw.focus.map(String) : ["Skating"];
        const notes = typeof raw?.notes === "string" ? raw.notes : "";
        return { focus, notes };
      });

      const allTrainingIds: number[] = [];
      const weeks: any[] = [];

      for (let weekIdx = 0; weekIdx < durationWeeks; weekIdx++) {
        const weekConfig = weekConfigs[weekIdx] || { focus: ["Skating"], notes: "" };
        const weekTrainingIds: number[] = [];

        for (let dayIdx = 0; dayIdx < trainingsPerWeek; dayIdx++) {
          const trainingDate = new Date(startDate);
          trainingDate.setDate(trainingDate.getDate() + weekIdx * 7 + dayIdx * Math.floor(7 / trainingsPerWeek));
          const dateStr = trainingDate.toISOString().split("T")[0];

          const focusSubset = weekConfig.focus.length > 2
            ? weekConfig.focus.sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2))
            : weekConfig.focus;

          const input = {
            methodology,
            category,
            duration,
            iceConfig,
            stations: 3,
            focus: focusSubset,
            drillRatio: coachProfile?.defaultDrillRatio || 60,
            cognitiveLoad: difficulty === "Advanced" ? "High" : difficulty === "Beginner" ? "Low" : "Medium",
            playersCount: 18,
            goaliesCount: 2,
            stationTimingMode: "Automatic",
            maxStationDuration: null,
            layoutType: null,
            customLayoutCoordinates: null,
          };

          const titleStr = `${title} - W${weekIdx + 1}D${dayIdx + 1}: ${focusSubset.join(", ")}`;

          const training = await storage.createTraining(userId, {
            title: titleStr,
            duration,
            methodology: input.methodology,
            focus: focusSubset,
            iceConfig: input.iceConfig,
            stationCount: input.stations,
            difficulty,
            drillRatio: input.drillRatio,
            content: { pending: true, generationParams: input },
            inputParams: { ...input, planGenerated: true, weekIndex: weekIdx, dayIndex: dayIdx, originalPrompt: prompt },
            trainingDate: dateStr,
            status: "planned",
          });

          weekTrainingIds.push(training.id);
          allTrainingIds.push(training.id);
        }

        weeks.push({
          weekIndex: weekIdx,
          focus: weekConfig.focus,
          notes: weekConfig.notes,
          trainingIds: weekTrainingIds,
        });
      }

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (durationWeeks * 7) - 1);

      const plan = await storage.createPlan(userId, {
        type: durationWeeks <= 1 ? "weekly" : "monthly",
        title,
        startDate: new Date(startDate),
        endDate,
        goals: weekConfigs.map((w: any, i: number) => `Week ${i + 1}: ${w.focus.join(", ")}`).join(" | "),
        content: { weeks, trainingIds: allTrainingIds },
      });

      res.json(plan);
    } catch (err) {
      console.error("Plan from prompt error:", err);
      res.status(500).json({ message: "Failed to generate plan from description" });
    }
  });

  app.post("/api/plans/generate", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const { title, trainingsPerWeek, durationWeeks, startDate, category, methodology, iceConfig, duration, difficulty, weekConfigs } = req.body;

      if (!trainingsPerWeek || !durationWeeks || !startDate || !weekConfigs) {
        return res.status(400).json({ message: "Missing required plan parameters" });
      }

      const coachProfile = await storage.getCoachProfile(userId);
      const feedbackList = await storage.getUserDrillFeedback(userId);
      const favorites = feedbackList.filter(d => d.favorite).map(d => `${d.title} (${d.category})`);
      const banned = feedbackList.filter(d => d.banned).map(d => `${d.title} (${d.category})`);
      const highRated = feedbackList.filter(d => (d.rating || 0) >= 4).map(d => `${d.title} (${d.category})`);
      const drillContext = { favorites, banned, highRated };

      const allTrainingIds: number[] = [];
      const weeks: any[] = [];

      const effectiveMethodology = methodology || coachProfile?.preferredMethodology || "Hybrid";
      const effectiveCategory = category || coachProfile?.category || "U15";

      for (let weekIdx = 0; weekIdx < durationWeeks; weekIdx++) {
        const weekConfig = weekConfigs[weekIdx] || { focus: ["Skating"], notes: "" };
        const weekTrainingIds: number[] = [];

        for (let dayIdx = 0; dayIdx < trainingsPerWeek; dayIdx++) {
          const trainingDate = new Date(startDate);
          trainingDate.setDate(trainingDate.getDate() + weekIdx * 7 + dayIdx * Math.floor(7 / trainingsPerWeek));
          const dateStr = trainingDate.toISOString().split("T")[0];

          const focusSubset = weekConfig.focus.length > 2
            ? weekConfig.focus.sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2))
            : weekConfig.focus;

          const input = {
            methodology: effectiveMethodology,
            category: effectiveCategory,
            duration: duration || 60,
            iceConfig: iceConfig || "Full Ice",
            stations: 3,
            focus: focusSubset,
            drillRatio: coachProfile?.defaultDrillRatio || 60,
            cognitiveLoad: difficulty === "Advanced" ? "High" : difficulty === "Beginner" ? "Low" : "Medium",
            playersCount: 18,
            goaliesCount: 2,
            stationTimingMode: "Automatic",
            maxStationDuration: null,
            layoutType: null,
            customLayoutCoordinates: null,
          };

          const titleStr = `${title || "Plan"} - W${weekIdx + 1}D${dayIdx + 1}: ${focusSubset.join(", ")}`;

          const training = await storage.createTraining(userId, {
            title: titleStr,
            duration: duration,
            methodology: effectiveMethodology,
            focus: focusSubset,
            iceConfig: input.iceConfig,
            stationCount: input.stations,
            difficulty: difficulty,
            drillRatio: input.drillRatio,
            content: { pending: true, generationParams: input },
            inputParams: { ...input, planGenerated: true, weekIndex: weekIdx, dayIndex: dayIdx },
            trainingDate: dateStr,
            status: "planned",
          });

          weekTrainingIds.push(training.id);
          allTrainingIds.push(training.id);
        }

        weeks.push({
          weekIndex: weekIdx,
          focus: weekConfig.focus,
          notes: weekConfig.notes,
          trainingIds: weekTrainingIds,
        });
      }

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (durationWeeks * 7) - 1);

      const plan = await storage.createPlan(userId, {
        type: durationWeeks <= 1 ? "weekly" : "monthly",
        title: title || `${effectiveCategory} Training Plan`,
        startDate: new Date(startDate),
        endDate: endDate,
        goals: weekConfigs.map((w: any, i: number) => `Week ${i + 1}: ${w.focus.join(", ")}`).join(" | "),
        content: { weeks, trainingIds: allTrainingIds },
      });

      res.json(plan);
    } catch (err) {
      console.error("Plan generation error:", err);
      res.status(500).json({ message: "Failed to generate training plan" });
    }
  });

  // 7. Calendar Routes
  app.get("/api/calendar", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ message: "start and end query params required (YYYY-MM-DD)" });
    }
    try {
      const trainingsInRange = await storage.getTrainingsByDateRange(userId, start as string, end as string);
      res.json(trainingsInRange);
    } catch (err) {
      console.error("Calendar fetch error:", err);
      res.status(500).json({ message: "Failed to fetch calendar data" });
    }
  });

  app.patch("/api/trainings/:id/status", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!["planned", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    try {
      const training = await storage.getTraining(id);
      if (!training) return res.status(404).json({ message: "Not found" });
      if (training.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      await storage.updateTrainingStatus(id, status);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.patch("/api/trainings/:id/reschedule", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = Number(req.params.id);
    const { trainingDate, startTime } = req.body;
    if (!trainingDate) return res.status(400).json({ message: "trainingDate required" });
    try {
      const training = await storage.getTraining(id);
      if (!training) return res.status(404).json({ message: "Not found" });
      if (training.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      await storage.updateTrainingDate(id, trainingDate, startTime);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to reschedule" });
    }
  });

  app.patch("/api/trainings/:id/fields", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = Number(req.params.id);
    try {
      const training = await storage.getTraining(id);
      if (!training) return res.status(404).json({ message: "Not found" });
      if (training.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      const { trainingDate, startTime, status, location, notes } = req.body;
      await storage.updateTrainingFields(id, { trainingDate, startTime, status, location, notes });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ message: "Failed to update training" });
    }
  });

  app.post("/api/trainings/:id/duplicate", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const id = Number(req.params.id);
    const { trainingDate } = req.body;
    try {
      const original = await storage.getTraining(id);
      if (!original) return res.status(404).json({ message: "Not found" });
      if (original.userId !== userId) return res.status(403).json({ message: "Forbidden" });
      const duplicate = await storage.createTraining(userId, {
        title: original.title,
        duration: original.duration,
        methodology: original.methodology,
        focus: original.focus,
        iceConfig: original.iceConfig,
        stationCount: original.stationCount,
        stationTimingMode: original.stationTimingMode,
        maxStationDuration: original.maxStationDuration,
        difficulty: original.difficulty,
        drillRatio: original.drillRatio,
        content: original.content,
        inputParams: original.inputParams,
        trainingDate: trainingDate || original.trainingDate,
        startTime: original.startTime,
        status: "planned",
        location: original.location,
        notes: original.notes,
      });
      res.json(duplicate);
    } catch (err) {
      console.error("Duplicate error:", err);
      res.status(500).json({ message: "Failed to duplicate training" });
    }
  });

  // 8. AI Coach Insight Engine
  app.get("/api/insights", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { category } = req.query;
    try {
      const insight = await storage.getLatestInsight(userId, category as string | undefined);
      res.json(insight || null);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch insight" });
    }
  });

  app.post("/api/insights/generate", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const { category } = req.body;
    try {
      const allTrainings = await storage.getUserTrainings(userId);
      const relevantTrainings = category 
        ? allTrainings.filter(t => {
            const params = t.inputParams as any;
            return params?.category === category;
          })
        : allTrainings;

      if (relevantTrainings.length < 1) {
        return res.status(400).json({ message: "Not enough training data to generate insights. Create more training sessions first." });
      }

      const skillDistribution: Record<string, number> = {};
      let totalDrills = 0;
      let totalGames = 0;
      const iceUsage: Record<string, number> = {};
      const focusFrequency: Record<string, number> = {};
      const methodologyUsage: Record<string, number> = {};

      relevantTrainings.forEach(t => {
        const content = t.content as any;
        if (t.focus) t.focus.forEach(f => {
          skillDistribution[f] = (skillDistribution[f] || 0) + 1;
          focusFrequency[f] = (focusFrequency[f] || 0) + 1;
        });
        if (content?.main) {
          content.main.forEach((s: any) => {
            if (s.type === "Drill") totalDrills++;
            else if (s.type === "Game") totalGames++;
          });
        }
        if (t.iceConfig) {
          iceUsage[t.iceConfig] = (iceUsage[t.iceConfig] || 0) + 1;
        }
        if (t.methodology) {
          methodologyUsage[t.methodology] = (methodologyUsage[t.methodology] || 0) + 1;
        }
      });

      const drillGameRatio = totalDrills + totalGames > 0 
        ? Math.round((totalDrills / (totalDrills + totalGames)) * 100) : 50;

      const focusValues = Object.values(focusFrequency);
      const avgFocus = focusValues.length > 0 ? focusValues.reduce((a, b) => a + b, 0) / focusValues.length : 0;
      const stabilityIndex = focusValues.length > 0
        ? Math.round(100 - (Math.sqrt(focusValues.reduce((sum, v) => sum + Math.pow(v - avgFocus, 2), 0) / focusValues.length) / avgFocus * 100))
        : 50;

      const metrics = {
        skillDistribution,
        drillGameRatio,
        iceUsage,
        stabilityIndex: Math.max(0, Math.min(100, stabilityIndex)),
        repetitionFrequency: focusFrequency,
        methodologyUsage,
        totalDrills,
        totalGames,
      };

      const prompt = `
        You are an expert hockey coaching analyst. Analyze the following coaching data and provide insights.

        Training Data Summary (${relevantTrainings.length} sessions${category ? ` for category ${category}` : ""}):
        - Skill Distribution: ${JSON.stringify(skillDistribution)}
        - Drill vs Game Ratio: ${drillGameRatio}% drills, ${100 - drillGameRatio}% games
        - Ice Usage: ${JSON.stringify(iceUsage)}
        - Stability Index: ${stabilityIndex}/100 (how consistent the focus areas are)
        - Focus Area Frequency: ${JSON.stringify(focusFrequency)}
        - Methodology Usage: ${JSON.stringify(methodologyUsage)}

        Provide your analysis in this STRICT JSON format:
        {
          "summary": "2-3 sentence overview of the coaching patterns",
          "strengths": ["strength 1", "strength 2", "strength 3"],
          "weaknesses": ["weakness 1", "weakness 2"],
          "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"]
        }

        Be specific, actionable, and hockey-focused. Reference specific skill areas and patterns.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: "You are a professional hockey coaching analyst. Output valid JSON only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const aiResult = JSON.parse(response.choices[0].message.content || "{}");

      const insight = await storage.createInsight(userId, {
        category: category || null,
        summary: aiResult.summary || "No summary available",
        strengths: aiResult.strengths || [],
        weaknesses: aiResult.weaknesses || [],
        recommendations: aiResult.recommendations || [],
        metrics,
        trainingCount: relevantTrainings.length,
      });

      res.json(insight);
    } catch (err) {
      console.error("Insight generation error:", err);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  const consultationSchema = z.object({
    type: z.enum(["training", "plan"]),
    language: z.enum(["en", "cz"]).default("en"),
    config: z.record(z.any()),
  });

  app.post("/api/ai-consultation", isAuthenticated, async (req: any, res) => {
    try {
      const parsed = consultationSchema.parse(req.body);
      const { type, config, language } = parsed;
      const userId = req.user.claims.sub;
      const coachProfile = await storage.getCoachProfile(userId);

      let contextDescription = "";

      if (type === "training") {
        contextDescription = `
          Training Session Configuration:
          - Category: ${config.category || "U15"}
          - Duration: ${config.duration || 60} minutes
          - Ice: ${config.iceConfig || "Full Ice"}
          - Stations: ${config.stations || 3}
          - Focus: ${(config.focus || []).join(", ")}
          - Methodology: ${config.methodology || "Hybrid"}
          - Difficulty: ${config.difficulty || "Intermediate"}
          - Cognitive Load: ${config.cognitiveLoad || "Medium"}
          - Drill/Game Ratio: ${config.drillRatio || 60}% drills / ${100 - (config.drillRatio || 60)}% games
          - Players: ${config.playersCount || 15} skaters, ${config.goaliesCount || 2} goalies
          - Station Timing: ${config.stationTimingMode || "Automatic"}
        `;
      } else if (type === "plan") {
        const weeksSummary = (config.weekConfigs || []).map((w: any, i: number) =>
          `Week ${i + 1}: Focus = ${(w.focus || []).join(", ")}${w.notes ? ` (Notes: ${w.notes})` : ""}`
        ).join("\n          ");
        contextDescription = `
          Training Plan Configuration:
          - Title: ${config.title || "Training Plan"}
          - Trainings per week: ${config.trainingsPerWeek || 3}
          - Duration: ${config.durationWeeks || 4} weeks (${(config.trainingsPerWeek || 3) * (config.durationWeeks || 4)} total trainings)
          - Start date: ${config.startDate || "N/A"}
          - Category: ${config.category || "U15"}
          - Methodology: ${config.methodology || "Hybrid"}
          - Ice: ${config.iceConfig || "Full Ice"}
          - Duration per session: ${config.duration || 60} minutes
          - Difficulty: ${config.difficulty || "Intermediate"}
          Weekly Breakdown:
          ${weeksSummary}
        `;
      }

      const isCzech = language === "cz";
      const langInstruction = isCzech
        ? "DŮLEŽITÉ: Veškerý textový obsah v JSON odpovědi MUSÍ být v ČESKÉM jazyce. Všechny hodnoty (summary, strengths, improvements, impact, tips) piš česky."
        : "Write all text content in English.";

      const prompt = isCzech
        ? `Jsi zkušený hokejový trenérský konzultant a AI trenérský parťák. Trenér nastavil ${type === "plan" ? "vícetýdenní tréninkový plán" : "tréninkovou jednotku"} a chce tvé odborné zhodnocení před vygenerováním.

        Profil trenéra:
        - Klub: ${coachProfile?.club || "Nespecifikováno"}
        - Preferovaná metodika: ${coachProfile?.preferredMethodology || "Nespecifikováno"}
        - Výchozí kategorie: ${coachProfile?.category || "Nespecifikováno"}

        ${contextDescription}

        ${langInstruction}

        Vrať STRIKTNÍ JSON:
        {
          "overall_rating": "excellent" | "good" | "needs_attention",
          "summary": "2-3 věty celkového hodnocení konfigurace (česky)",
          "strengths": ["silná stránka 1", "silná stránka 2", "silná stránka 3"],
          "improvements": ["návrh na zlepšení 1", "návrh na zlepšení 2"],
          "impact": {
            "physical": "Stručný popis dopadu na fyzický rozvoj (česky)",
            "technical": "Stručný popis dopadu na technické dovednosti (česky)",
            "tactical": "Stručný popis dopadu na taktické povědomí (česky)",
            "mental": "Stručný popis dopadu na mentální/kognitivní rozvoj (česky)"
          },
          "tips": ["praktický tip 1 (česky)", "praktický tip 2 (česky)"]
        }`
        : `You are an experienced hockey coaching consultant and AI training buddy. A coach has configured a ${type === "plan" ? "multi-week training plan" : "training session"} and wants your expert evaluation before generating it.

        Coach Profile:
        - Club: ${coachProfile?.club || "Not specified"}
        - Preferred Methodology: ${coachProfile?.preferredMethodology || "Not specified"}
        - Default Category: ${coachProfile?.category || "Not specified"}

        ${contextDescription}

        ${langInstruction}

        Output STRICT JSON:
        {
          "overall_rating": "excellent" | "good" | "needs_attention",
          "summary": "2-3 sentence overall assessment of this configuration",
          "strengths": ["strength 1", "strength 2", "strength 3"],
          "improvements": ["suggestion 1", "suggestion 2"],
          "impact": {
            "physical": "Brief description of physical development impact",
            "technical": "Brief description of technical skill impact",
            "tactical": "Brief description of tactical awareness impact",
            "mental": "Brief description of mental/cognitive impact"
          },
          "tips": ["practical tip 1", "practical tip 2"]
        }`;

      const systemMessage = isCzech
        ? "Jsi profesionální hokejový trenérský konzultant. Poskytuj strukturované JSON hodnocení tréninkových konfigurací. Buď povzbuzující, ale upřímný. VŽDY odpovídej ČESKY - veškerý text v JSON musí být v českém jazyce."
        : "You are a professional hockey coaching consultant. Provide structured JSON evaluations of training configurations. Be encouraging but honest.";

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      res.json(result);
    } catch (err) {
      console.error("AI consultation error:", err);
      res.status(500).json({ message: "Failed to generate consultation" });
    }
  });

  // --- Knowledge Base (Drill Library) Routes ---
  app.get("/api/knowledge", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const chunks = await storage.getUserKnowledgeChunks(userId);
    res.json(chunks);
  });

  const knowledgeInputSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    sourceName: z.string().optional(),
    category: z.string().nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
    drillType: z.enum(["Drill", "Game"]).nullable().optional(),
    sourceType: z.enum(["text", "image"]).optional(),
  });

  app.post("/api/knowledge", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = knowledgeInputSchema.parse(req.body);
      const chunk = await storage.createKnowledgeChunk(userId, {
        title: input.title,
        sourceName: input.sourceName || "Manual Entry",
        content: input.content,
        category: input.category || null,
        tags: input.tags || null,
        drillType: input.drillType || null,
        sourceType: input.sourceType || "text",
      });
      res.json(chunk);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Knowledge create error:", err);
      res.status(500).json({ message: "Failed to create knowledge entry" });
    }
  });

  app.delete("/api/knowledge/:id", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    await storage.deleteKnowledgeChunk(Number(req.params.id), userId);
    res.status(204).send();
  });

  app.post("/api/knowledge/analyze-image", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const { imageBase64, language } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ message: "Image data is required" });
      }

      const isCzech = language === "cz";
      const analysisPrompt = isCzech
        ? `Analyzuj tento nákres hokejového cvičení. Extrahuj:
1. Název cvičení
2. Detailní popis cvičení (jak se provádí, pravidla, variace)
3. Kategorie zaměření (jedno z: Skating, Shooting, Passing, Stickhandling, Tactics, Checking, Conditioning, Goaltending)
4. Typ (Drill nebo Game)
5. Klíčové body a tipy pro trenéra
6. Tagy zaměření (pole řetězců)

Odpověz STRIKTNĚ v JSON:
{
  "title": "Název cvičení (česky)",
  "description": "Detailní popis cvičení včetně rozmístění hráčů, pohybů, přihrávek, střel atd. (česky)",
  "category": "Skating|Shooting|Passing|Stickhandling|Tactics|Checking|Conditioning|Goaltending",
  "drillType": "Drill|Game",
  "keyPoints": ["klíčový bod 1", "klíčový bod 2"],
  "tags": ["tag1", "tag2"]
}`
        : `Analyze this hockey drill diagram. Extract:
1. Drill name/title
2. Detailed drill description (how it's executed, rules, variations)
3. Focus category (one of: Skating, Shooting, Passing, Stickhandling, Tactics, Checking, Conditioning, Goaltending)
4. Type (Drill or Game)
5. Key coaching points and tips
6. Focus tags (array of strings)

Respond in STRICT JSON:
{
  "title": "Drill name",
  "description": "Detailed drill description including player positions, movements, passes, shots etc.",
  "category": "Skating|Shooting|Passing|Stickhandling|Tactics|Checking|Conditioning|Goaltending",
  "drillType": "Drill|Game",
  "keyPoints": ["key point 1", "key point 2"],
  "tags": ["tag1", "tag2"]
}`;

      const systemMsg = isCzech
        ? "Jsi expert na hokejová cvičení. Analyzuješ nákresy cvičení a extrahuj strukturované informace. Vždy odpovídej česky."
        : "You are a hockey drill analysis expert. Analyze drill diagrams and extract structured information.";

      const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: systemMsg },
          {
            role: "user",
            content: [
              { type: "text", text: analysisPrompt },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");

      const fullContent = `${analysis.description}\n\n${isCzech ? "Klíčové body" : "Key Points"}:\n${(analysis.keyPoints || []).map((p: string) => `- ${p}`).join("\n")}`;

      const chunk = await storage.createKnowledgeChunk(userId, {
        title: analysis.title || (isCzech ? "Analyzované cvičení" : "Analyzed Drill"),
        sourceName: "Image Analysis",
        content: fullContent,
        category: analysis.category || null,
        tags: analysis.tags || null,
        drillType: analysis.drillType || null,
        sourceType: "image",
      });

      res.json({ chunk, analysis });
    } catch (err) {
      console.error("Image analysis error:", err);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  app.post("/api/knowledge/bulk-parse", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const { text, language } = req.body;
      if (!text || text.trim().length < 10) {
        return res.status(400).json({ message: "Text is too short" });
      }

      const isCzech = language === "cz";
      const parsePrompt = isCzech
        ? `Analyzuj následující text, který obsahuje popis jednoho nebo více hokejových cvičení/tréninků. Rozděl je na jednotlivá cvičení a pro každé extrahuj strukturované informace.

Text od trenéra:
"""
${text}
"""

Pro KAŽDÉ nalezené cvičení vytvoř objekt s:
- title: Název cvičení (česky)
- description: Detailní popis cvičení včetně organizace, pravidel, variací (česky)
- category: jedna z: Skating, Shooting, Passing, Stickhandling, Tactics, Checking, Conditioning, Goaltending
- drillType: "Drill" nebo "Game"
- tags: pole klíčových slov (česky)

Odpověz STRIKTNĚ v JSON:
{ "drills": [ { "title": "...", "description": "...", "category": "...", "drillType": "...", "tags": ["..."] } ] }`
        : `Analyze the following text that contains descriptions of one or more hockey drills/training exercises. Split them into individual drills and extract structured information for each.

Coach's text:
"""
${text}
"""

For EACH drill found, create an object with:
- title: Drill name
- description: Detailed drill description including organization, rules, variations
- category: one of: Skating, Shooting, Passing, Stickhandling, Tactics, Checking, Conditioning, Goaltending
- drillType: "Drill" or "Game"
- tags: array of keywords

Respond in STRICT JSON:
{ "drills": [ { "title": "...", "description": "...", "category": "...", "drillType": "...", "tags": ["..."] } ] }`;

      const systemMsg = isCzech
        ? "Jsi expert na hokejová cvičení. Analyzuješ texty trenérů a extrahuj jednotlivá cvičení se strukturovanými informacemi. Pokud text obsahuje jen jedno cvičení, vrať pole s jedním prvkem. Vždy odpovídej česky."
        : "You are a hockey drill analysis expert. Analyze coach texts and extract individual drills with structured information. If text contains only one drill, return array with one element.";

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: parsePrompt },
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"drills":[]}');
      const drills = result.drills || [];

      const created = [];
      for (const drill of drills) {
        const chunk = await storage.createKnowledgeChunk(userId, {
          title: drill.title || (isCzech ? "Cvičení" : "Drill"),
          sourceName: "Bulk Import",
          content: drill.description || "",
          category: drill.category || null,
          tags: drill.tags || null,
          drillType: drill.drillType || null,
          sourceType: "bulk",
        });
        created.push(chunk);
      }

      res.json({ count: created.length, drills: created });
    } catch (err) {
      console.error("Bulk parse error:", err);
      res.status(500).json({ message: "Failed to parse drills" });
    }
  });

  return httpServer;
}
