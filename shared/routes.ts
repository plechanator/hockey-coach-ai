import { z } from 'zod';
import { 
  insertCoachProfileSchema, 
  insertTrainingSchema, 
  generateTrainingInputSchema,
  insertPlanSchema,
  insertCycleSchema,
  trainings,
  coachProfiles,
  trainingPlans,
  cycles
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // --- Coach Profile ---
  coachProfile: {
    get: {
      method: 'GET' as const,
      path: '/api/coach-profile' as const,
      responses: {
        200: z.custom<typeof coachProfiles.$inferSelect>(),
        404: z.null(), // Profile might not exist yet
      },
    },
    createOrUpdate: {
      method: 'POST' as const,
      path: '/api/coach-profile' as const,
      input: insertCoachProfileSchema.omit({ userId: true }), // UserId from auth session
      responses: {
        200: z.custom<typeof coachProfiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },

  // --- Trainings ---
  trainings: {
    list: {
      method: 'GET' as const,
      path: '/api/trainings' as const,
      responses: {
        200: z.array(z.custom<typeof trainings.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/trainings/:id' as const,
      responses: {
        200: z.custom<typeof trainings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/trainings/generate' as const,
      input: generateTrainingInputSchema,
      responses: {
        200: z.custom<typeof trainings.$inferSelect>(), // Returns the generated AND saved training
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    upload: {
      method: 'POST' as const,
      path: '/api/trainings/upload' as const,
      input: z.object({
        text: z.string(), // OCR text or manual input
        title: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof trainings.$inferSelect>(),
        500: errorSchemas.internal,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/trainings/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    generateFromPrompt: {
      method: 'POST' as const,
      path: '/api/trainings/generate-from-prompt' as const,
      input: z.object({
        prompt: z.string().min(5),
      }),
      responses: {
        200: z.custom<typeof trainings.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },

  // --- Plans ---
  plans: {
    list: {
      method: 'GET' as const,
      path: '/api/plans' as const,
      responses: {
        200: z.array(z.custom<typeof trainingPlans.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/plans' as const,
      input: insertPlanSchema.omit({ userId: true, content: true }).extend({
        generateWithAI: z.boolean().default(true),
      }),
      responses: {
        201: z.custom<typeof trainingPlans.$inferSelect>(),
      },
    },
  },

  // --- Cycles ---
  cycles: {
    list: {
      method: 'GET' as const,
      path: '/api/cycles' as const,
      responses: {
        200: z.array(z.custom<typeof cycles.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/cycles' as const,
      input: insertCycleSchema.omit({ userId: true, content: true }).extend({
         generateWithAI: z.boolean().default(true),
      }),
      responses: {
        201: z.custom<typeof cycles.$inferSelect>(),
      },
    },
  },
  
  // --- Analytics ---
  analytics: {
    get: {
      method: 'GET' as const,
      path: '/api/analytics' as const,
      responses: {
        200: z.object({
          totalTrainings: z.number(),
          averageDrillRatio: z.number(),
          focusDistribution: z.record(z.number()),
          methodologyDistribution: z.record(z.number()),
          recentActivity: z.array(z.object({ date: z.string(), title: z.string() })),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
