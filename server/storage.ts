import { db } from "./db";
import { 
  users, coachProfiles, trainings, trainingPlans, cycles, knowledgeChunks, drillFeedback, coachInsights,
  type User, type CoachProfile, type Training, type TrainingPlan, type Cycle, type UpsertUser,
  type InsertCoachProfile, type InsertTraining, type InsertPlan, type InsertCycle,
  type DrillFeedback, type InsertDrillFeedback,
  type CoachInsight, type InsertCoachInsight,
  type KnowledgeChunk, type InsertKnowledgeChunk
} from "@shared/schema";
import { eq, desc, and, sql, gte, lte, inArray } from "drizzle-orm";

export interface IStorage {
  // Users (handled by auth module mostly, but exposed here if needed)
  getUser(id: string): Promise<User | undefined>;
  
  // Coach Profiles
  getCoachProfile(userId: string): Promise<CoachProfile | undefined>;
  createOrUpdateCoachProfile(userId: string, profile: InsertCoachProfile): Promise<CoachProfile>;
  
  // Trainings
  createTraining(userId: string, training: InsertTraining): Promise<Training>;
  getTraining(id: number): Promise<Training | undefined>;
  getUserTrainings(userId: string): Promise<Training[]>;
  deleteTraining(id: number): Promise<void>;
  
  // Training content updates
  updateTrainingContent(id: number, content: any): Promise<void>;
  
  // Plans
  createPlan(userId: string, plan: InsertPlan): Promise<TrainingPlan>;
  getPlan(id: number): Promise<TrainingPlan | undefined>;
  getUserPlans(userId: string): Promise<TrainingPlan[]>;
  
  // Cycles
  createCycle(userId: string, cycle: InsertCycle): Promise<Cycle>;
  getUserCycles(userId: string): Promise<Cycle[]>;

  // Drill Feedback
  getUserDrillFeedback(userId: string): Promise<DrillFeedback[]>;
  getDrillFeedback(userId: string, drillId: string): Promise<DrillFeedback | undefined>;
  upsertDrillFeedback(userId: string, feedback: InsertDrillFeedback): Promise<DrillFeedback>;
  getUserFavoriteDrills(userId: string): Promise<DrillFeedback[]>;
  getUserBannedDrills(userId: string): Promise<DrillFeedback[]>;

  // Calendar
  getTrainingsByDateRange(userId: string, startDate: string, endDate: string): Promise<Training[]>;
  updateTrainingStatus(id: number, status: string): Promise<void>;
  updateTrainingDate(id: number, trainingDate: string, startTime?: string): Promise<void>;
  updateTrainingFields(id: number, fields: Partial<{ trainingDate: string; startTime: string; status: string; location: string; notes: string }>): Promise<void>;

  // Coach Insights
  getLatestInsight(userId: string, category?: string): Promise<CoachInsight | undefined>;
  getUserInsights(userId: string): Promise<CoachInsight[]>;
  createInsight(userId: string, insight: InsertCoachInsight): Promise<CoachInsight>;

  // Analytics (completed only)
  getCompletedTrainings(userId: string): Promise<Training[]>;
  getUserTrainingStats(userId: string): Promise<any>;

  // Knowledge Base (Drill Library)
  getUserKnowledgeChunks(userId: string): Promise<KnowledgeChunk[]>;
  createKnowledgeChunk(userId: string, chunk: InsertKnowledgeChunk): Promise<KnowledgeChunk>;
  deleteKnowledgeChunk(id: number, userId: string): Promise<void>;
  getKnowledgeChunksByCategory(userId: string, category: string): Promise<KnowledgeChunk[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getCoachProfile(userId: string): Promise<CoachProfile | undefined> {
    const [profile] = await db.select().from(coachProfiles).where(eq(coachProfiles.userId, userId));
    return profile;
  }

  async createOrUpdateCoachProfile(userId: string, profileData: InsertCoachProfile): Promise<CoachProfile> {
    const [profile] = await db
      .insert(coachProfiles)
      .values({ ...profileData, userId })
      .onConflictDoUpdate({
        target: coachProfiles.userId,
        set: { ...profileData, updatedAt: new Date() },
      })
      .returning();
    return profile;
  }

  async createTraining(userId: string, trainingData: InsertTraining): Promise<Training> {
    const [training] = await db
      .insert(trainings)
      .values({ ...trainingData, userId })
      .returning();
    return training;
  }

  async getTraining(id: number): Promise<Training | undefined> {
    const [training] = await db.select().from(trainings).where(eq(trainings.id, id));
    return training;
  }

  async getUserTrainings(userId: string): Promise<Training[]> {
    return db.select().from(trainings).where(eq(trainings.userId, userId)).orderBy(desc(trainings.date));
  }

  async updateTrainingContent(id: number, content: any): Promise<void> {
    await db.update(trainings).set({ content }).where(eq(trainings.id, id));
  }

  async deleteTraining(id: number): Promise<void> {
    await db.delete(trainings).where(eq(trainings.id, id));
  }

  async createPlan(userId: string, planData: InsertPlan): Promise<TrainingPlan> {
    const [plan] = await db
      .insert(trainingPlans)
      .values({ ...planData, userId })
      .returning();
    return plan;
  }

  async getPlan(id: number): Promise<TrainingPlan | undefined> {
    const [plan] = await db.select().from(trainingPlans).where(eq(trainingPlans.id, id));
    return plan;
  }

  async getUserPlans(userId: string): Promise<TrainingPlan[]> {
    return db.select().from(trainingPlans).where(eq(trainingPlans.userId, userId)).orderBy(desc(trainingPlans.createdAt));
  }

  async createCycle(userId: string, cycleData: InsertCycle): Promise<Cycle> {
    const [cycle] = await db
      .insert(cycles)
      .values({ ...cycleData, userId })
      .returning();
    return cycle;
  }

  async getUserCycles(userId: string): Promise<Cycle[]> {
    return db.select().from(cycles).where(eq(cycles.userId, userId)).orderBy(desc(cycles.createdAt));
  }

  async getUserDrillFeedback(userId: string): Promise<DrillFeedback[]> {
    return db.select().from(drillFeedback).where(eq(drillFeedback.userId, userId)).orderBy(desc(drillFeedback.rating));
  }

  async getDrillFeedback(userId: string, drillId: string): Promise<DrillFeedback | undefined> {
    const [fb] = await db.select().from(drillFeedback)
      .where(and(eq(drillFeedback.userId, userId), eq(drillFeedback.drillId, drillId)));
    return fb;
  }

  async upsertDrillFeedback(userId: string, data: InsertDrillFeedback): Promise<DrillFeedback> {
    const existing = await this.getDrillFeedback(userId, data.drillId);
    if (existing) {
      const [updated] = await db.update(drillFeedback)
        .set({ ...data, lastUsedDate: new Date() })
        .where(eq(drillFeedback.id, existing.id))
        .returning();
      return updated;
    }
    const [created] = await db.insert(drillFeedback)
      .values({ ...data, userId })
      .returning();
    return created;
  }

  async getUserFavoriteDrills(userId: string): Promise<DrillFeedback[]> {
    return db.select().from(drillFeedback)
      .where(and(eq(drillFeedback.userId, userId), eq(drillFeedback.favorite, true)))
      .orderBy(desc(drillFeedback.rating));
  }

  async getUserBannedDrills(userId: string): Promise<DrillFeedback[]> {
    return db.select().from(drillFeedback)
      .where(and(eq(drillFeedback.userId, userId), eq(drillFeedback.banned, true)));
  }

  async getTrainingsByDateRange(userId: string, startDate: string, endDate: string): Promise<Training[]> {
    return db.select().from(trainings)
      .where(and(
        eq(trainings.userId, userId),
        gte(trainings.trainingDate, startDate),
        lte(trainings.trainingDate, endDate)
      ))
      .orderBy(trainings.trainingDate);
  }

  async updateTrainingStatus(id: number, status: string): Promise<void> {
    await db.update(trainings).set({ status }).where(eq(trainings.id, id));
  }

  async updateTrainingDate(id: number, trainingDate: string, startTime?: string): Promise<void> {
    const updates: any = { trainingDate };
    if (startTime !== undefined) updates.startTime = startTime;
    await db.update(trainings).set(updates).where(eq(trainings.id, id));
  }

  async updateTrainingFields(id: number, fields: Partial<{ trainingDate: string; startTime: string; status: string; location: string; notes: string }>): Promise<void> {
    await db.update(trainings).set(fields).where(eq(trainings.id, id));
  }

  async getLatestInsight(userId: string, category?: string): Promise<CoachInsight | undefined> {
    const conditions = [eq(coachInsights.userId, userId)];
    if (category) {
      conditions.push(eq(coachInsights.category, category));
    } else {
      conditions.push(sql`${coachInsights.category} IS NULL`);
    }
    const [insight] = await db.select().from(coachInsights)
      .where(and(...conditions))
      .orderBy(desc(coachInsights.generatedAt))
      .limit(1);
    return insight;
  }

  async getUserInsights(userId: string): Promise<CoachInsight[]> {
    return db.select().from(coachInsights)
      .where(eq(coachInsights.userId, userId))
      .orderBy(desc(coachInsights.generatedAt));
  }

  async createInsight(userId: string, insightData: InsertCoachInsight): Promise<CoachInsight> {
    const [insight] = await db.insert(coachInsights)
      .values({ ...insightData, userId })
      .returning();
    return insight;
  }

  async getCompletedTrainings(userId: string): Promise<Training[]> {
    return db.select().from(trainings)
      .where(and(eq(trainings.userId, userId), eq(trainings.status, "completed")))
      .orderBy(desc(trainings.date));
  }

  async getUserTrainingStats(userId: string): Promise<any> {
    const completedTrainings = await this.getCompletedTrainings(userId);
    const allTrainings = await this.getUserTrainings(userId);
    
    if (allTrainings.length === 0) {
      return {
        totalTrainings: 0,
        completedTrainings: 0,
        averageDrillRatio: 0,
        focusDistribution: {},
        methodologyDistribution: {},
        recentActivity: [],
      };
    }

    const source = completedTrainings.length > 0 ? completedTrainings : allTrainings;
    const avgDrillRatio = source.reduce((acc, t) => acc + (t.drillRatio || 0), 0) / source.length;

    const focusDistribution: Record<string, number> = {};
    const methodologyDistribution: Record<string, number> = {};

    source.forEach(t => {
      if (t.focus) {
        t.focus.forEach(f => {
          focusDistribution[f] = (focusDistribution[f] || 0) + 1;
        });
      }
      if (t.methodology) {
        methodologyDistribution[t.methodology] = (methodologyDistribution[t.methodology] || 0) + 1;
      }
    });

    const recentActivity = allTrainings.slice(0, 5).map(t => ({
      date: t.date?.toISOString() || "",
      title: t.title,
    }));

    return {
      totalTrainings: allTrainings.length,
      completedTrainings: completedTrainings.length,
      averageDrillRatio: Math.round(avgDrillRatio),
      focusDistribution,
      methodologyDistribution,
      recentActivity,
    };
  }

  async getUserKnowledgeChunks(userId: string): Promise<KnowledgeChunk[]> {
    return db.select().from(knowledgeChunks).where(eq(knowledgeChunks.userId, userId)).orderBy(desc(knowledgeChunks.createdAt));
  }

  async createKnowledgeChunk(userId: string, chunk: InsertKnowledgeChunk): Promise<KnowledgeChunk> {
    const [created] = await db.insert(knowledgeChunks).values({ ...chunk, userId }).returning();
    return created;
  }

  async deleteKnowledgeChunk(id: number, userId: string): Promise<void> {
    await db.delete(knowledgeChunks).where(and(eq(knowledgeChunks.id, id), eq(knowledgeChunks.userId, userId)));
  }

  async getKnowledgeChunksByCategory(userId: string, category: string): Promise<KnowledgeChunk[]> {
    return db.select().from(knowledgeChunks).where(and(eq(knowledgeChunks.userId, userId), eq(knowledgeChunks.category, category)));
  }
}

export const storage = new DatabaseStorage();
