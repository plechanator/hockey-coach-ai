import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Re-export auth models
export * from "./models/auth";
import { users } from "./models/auth";

// --- Coach DNA Module ---
export const coachProfiles = pgTable("coach_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  club: text("club"),
  category: text("category"), // U13, U15, etc.
  preferredMethodology: text("preferred_methodology"), // Canadian, Swedish, etc.
  defaultDrillRatio: integer("default_drill_ratio").default(60), // 0-100
  totalTrainings: integer("total_trainings").default(0),
  averageDrillRatio: integer("average_drill_ratio").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// --- Trainings Module ---
export const trainings = pgTable("trainings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  date: timestamp("date").defaultNow(),
  trainingDate: text("training_date"), // YYYY-MM-DD format for calendar
  startTime: text("start_time"), // HH:MM format
  status: text("status").default("planned"), // planned, completed, cancelled
  location: text("location"),
  notes: text("notes"),
  duration: integer("duration").notNull(), // in minutes
  methodology: text("methodology").notNull(),
  focus: text("focus").array(), // Multi-select tags
  iceConfig: text("ice_config").default("Full Ice"), // Full, Half, Offensive, Neutral
  stationCount: integer("station_count").default(1),
  stationTimingMode: text("station_timing_mode").default("Automatic"), // Automatic, Max Duration, Custom
  maxStationDuration: integer("max_station_duration"),
  difficulty: text("difficulty"),
  drillRatio: integer("drill_ratio"), // 0-100
  
  content: jsonb("content").notNull(), 
  inputParams: jsonb("input_params").notNull(),
  
  isAnalyzed: boolean("is_analyzed").default(false),
});

// --- Plans Module (Weekly/Monthly) ---
export const trainingPlans = pgTable("training_plans", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'weekly' or 'monthly'
  title: text("title").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  goals: text("goals"),
  content: jsonb("content").notNull(), // The generated plan structure
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Cycles Module (Micro/Meso) ---
export const cycles = pgTable("cycles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'microcycle' or 'mesocycle'
  title: text("title").notNull(),
  focus: text("focus"),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Drill Feedback / Rating System ---
export const drillFeedback = pgTable("drill_feedback", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  drillId: text("drill_id").notNull(),
  category: text("category"),
  title: text("title"),
  description: text("description"),
  rating: integer("rating").default(0),
  favorite: boolean("favorite").default(false),
  banned: boolean("banned").default(false),
  timesUsed: integer("times_used").default(0),
  lastUsedDate: timestamp("last_used_date"),
  focusTags: text("focus_tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Coach Insights (AI Analysis) ---
export const coachInsights = pgTable("coach_insights", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  category: text("category"), // category-specific insight or null for global
  summary: text("summary").notNull(),
  strengths: text("strengths").array(),
  weaknesses: text("weaknesses").array(),
  recommendations: text("recommendations").array(),
  metrics: jsonb("metrics"), // { skillDistribution, drillGameRatio, iceUsage, stabilityIndex, repetitionFrequency }
  trainingCount: integer("training_count").default(0),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// --- Knowledge Layer (Drill Library) ---
export const knowledgeChunks = pgTable("knowledge_chunks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  sourceName: text("source_name").notNull(),
  content: text("content").notNull(),
  category: text("category"),
  tags: text("tags").array(),
  drillType: text("drill_type"),
  sourceType: text("source_type").default("text"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Relations ---
export const coachProfilesRelations = relations(coachProfiles, ({ one }) => ({
  user: one(users, {
    fields: [coachProfiles.userId],
    references: [users.id],
  }),
}));

export const trainingsRelations = relations(trainings, ({ many }) => ({
  user: many(users),
}));

// --- Schemas & Types ---
export const insertCoachProfileSchema = createInsertSchema(coachProfiles).omit({ 
  id: true, 
  userId: true,
  updatedAt: true,
  totalTrainings: true,
  averageDrillRatio: true
});

export const insertTrainingSchema = createInsertSchema(trainings).omit({ 
  id: true, 
  userId: true,
  date: true,
  isAnalyzed: true
});

export const insertCoachInsightSchema = createInsertSchema(coachInsights).omit({
  id: true,
  userId: true,
  generatedAt: true,
});

export const insertPlanSchema = createInsertSchema(trainingPlans).omit({ 
  id: true, 
  createdAt: true 
});

export const insertCycleSchema = createInsertSchema(cycles).omit({ 
  id: true, 
  createdAt: true 
});

export const insertDrillFeedbackSchema = createInsertSchema(drillFeedback).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertKnowledgeChunkSchema = createInsertSchema(knowledgeChunks).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// Zone area schema for layout templates
export const zoneAreaSchema = z.object({
  station_id: z.number(),
  zone_area: z.object({
    x_start: z.number(),
    y_start: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  zone_label: z.string().optional(),
});

// Input Schema for Training Generation (used by frontend form)
export const generateTrainingInputSchema = z.object({
  category: z.enum(["<U6", "U10", "U12", "U15", "U18", ">U18"]),
  playersCount: z.number().min(1),
  goaliesCount: z.number().min(0),
  duration: z.number().min(30).max(120),
  stations: z.number().min(1).max(5),
  iceConfig: z.enum(["Full Ice", "Half Ice", "Offensive Zone", "Neutral Zone", "Defensive Zone"]),
  layoutType: z.enum(["auto", "2-1-2", "4-lanes", "3-zones", "half-ice-4", "custom"]).default("auto"),
  customLayoutCoordinates: z.array(zoneAreaSchema).optional(),
  stationTimingMode: z.enum(["Automatic", "Maximum station duration", "Custom"]),
  maxStationDuration: z.number().optional(),
  focus: z.array(z.string()).min(1),
  methodology: z.enum(["Canadian", "Swedish", "American", "Czech", "Hybrid"]),
  drillRatio: z.number().min(0).max(100),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  cognitiveLoad: z.enum(["Low", "Medium", "High"]),
});

export type CoachProfile = typeof coachProfiles.$inferSelect;
export type InsertCoachProfile = z.infer<typeof insertCoachProfileSchema>;

export type Training = typeof trainings.$inferSelect;
export type InsertTraining = z.infer<typeof insertTrainingSchema>;
export type GenerateTrainingInput = z.infer<typeof generateTrainingInputSchema>;

export type TrainingPlan = typeof trainingPlans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

export type Cycle = typeof cycles.$inferSelect;
export type InsertCycle = z.infer<typeof insertCycleSchema>;

export type DrillFeedback = typeof drillFeedback.$inferSelect;
export type InsertDrillFeedback = z.infer<typeof insertDrillFeedbackSchema>;

export type CoachInsight = typeof coachInsights.$inferSelect;
export type InsertCoachInsight = z.infer<typeof insertCoachInsightSchema>;

export type KnowledgeChunk = typeof knowledgeChunks.$inferSelect;
export type InsertKnowledgeChunk = z.infer<typeof insertKnowledgeChunkSchema>;
