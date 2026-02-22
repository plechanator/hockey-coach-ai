# AI Hockey Training Assistant (CoachAI)

## Overview

This is an AI-powered hockey coaching platform called **CoachAI** (AI Hockey Training Assistant). It helps hockey coaches create structured training sessions, manage long-term player development, track coaching analytics, and personalize AI-generated training content based on their coaching profile ("Coach DNA"). The system uses OpenAI to generate structured training sessions with warmup, main drills, and finishing exercises based on parameters like methodology, age category, ice configuration, and focus areas.

### Key Features
- **7-Step Training Builder Wizard**: Conversational assistant-driven flow (Category → Players → Ice → Layout → Focus → Character → Summary)
- **Ice Layout Templates**: 4 predefined templates (2-1-2, 4-lanes, 3-zones, half-ice-4) with zone coordinate data
- **Print/PDF Export**: Dedicated A4 print page at `/training/:id/print` with B&W rink diagrams
- **Drill Inspiration Library**: SVG-based drill diagram library (`/inspiration`) with standard hockey coaching symbols (player circle, defender triangle, pass dashed line, shot double arrow, skating with puck wavy line, backward crossover). 12 categorized drills with CZ/EN descriptions.
- **Multi-language**: Full CZ/EN support throughout all features

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (React SPA)
- **Framework**: React with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state (caching, mutations, invalidation)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Charts**: Recharts for analytics visualization
- **Animations**: Framer Motion for page transitions
- **Forms**: React Hook Form with Zod resolvers for validation
- **Design**: Sports-tech theme with dark navy (#0B1C2D), hockey red (#D62828), light gray (#F5F5F5). Uses Inter + Chakra Petch fonts.
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend (Express)
- **Framework**: Express.js running on Node with TypeScript (via tsx)
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **AI Integration**: OpenAI SDK (configured via Replit AI Integrations environment variables `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`) for training session generation. **Model optimization**: `gpt-5.2` for core training generation (quality-critical), `gpt-4.1-mini` for simpler tasks (chat, param extraction, consultation, analytics, bulk parsing)
- **Hybrid Training Generation**: System first tries to assemble trainings from the internal drill database (84+ seed drills + coach's personal Knowledge Base drills) using scoring/matching. Only falls back to OpenAI when not enough quality drills match the request. DB-assembled sessions are instant (0 AI calls). Assembly function: `assembleTrainingFromDatabase()` in `drillSeedData.ts`. Uses canned SVG diagram templates and deterministic zone layout.
- **Lazy Generation**: Plan training sessions use lazy/on-demand generation. When a plan is created, trainings are saved with `content: { pending: true }`. Full session content is generated (via hybrid system) only when the coach opens a specific training.
- **Authentication**: Replit Auth (OpenID Connect) with Passport.js, session-based auth stored in PostgreSQL via `connect-pg-simple`
- **Build**: esbuild for server bundling, Vite for client bundling. Production output goes to `dist/`

### Database
- **Database**: PostgreSQL (required, provisioned via Replit)
- **ORM**: Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema location**: `shared/schema.ts` and `shared/models/` directory
- **Migrations**: Drizzle Kit with `db:push` command for schema sync
- **Key tables**:
  - `users` - User accounts (managed by Replit Auth)
  - `sessions` - Session storage (required for Replit Auth, do not drop)
  - `coach_profiles` - Coach DNA/preferences (club, methodology, default drill ratio)
  - `trainings` - Generated training sessions with JSON content and input parameters
  - `training_plans` - Weekly/monthly training plans
  - `cycles` - Training cycles for periodization
  - `knowledge_chunks` - Coach's personal drill library (per-user, supports text entry and AI image analysis). AI uses these drills when generating training sessions.

### Internal Methodology Knowledge System
Located in `server/drillSeedData.ts`:
- **5 Hockey Methodologies**: Canadian, Swedish, Finnish, Czech, Hybrid - each with detailed corePrinciples, trainingPhilosophy, ageSpecificGuidelines, and drillDesignRules
- **114 Professional Drills**: Tagged with methodology[], ageGroups[], iceConfig[] for intelligent filtering
- **Helper Functions**: `getMethodologyContext()`, `getRelevantDrills()`, `formatDrillsForPrompt()`, `assembleTrainingFromDatabase()` - scoring, selection, and deterministic assembly
- **Scoring System**: Drills are scored by methodology match (+3), focus area match (+5), age group match (+4), ice config match (+2)
- **Priority**: Coach's personal drills (from knowledge_chunks) are always prioritized over internal database drills
  - `conversations` / `messages` - Chat storage for AI conversations

### Shared Code
- `shared/schema.ts` - All Drizzle table definitions and Zod validation schemas
- `shared/routes.ts` - API route contracts with Zod schemas for type safety between client and server
- `shared/models/` - Separated model definitions (auth, chat)

### Key Design Decisions

1. **Monorepo structure with shared types**: The `shared/` directory contains schemas used by both client and server, ensuring type safety across the stack without code duplication.

2. **Replit Auth instead of custom auth**: Uses Replit's OIDC-based authentication system, which handles user registration/login externally. User data is upserted on login. The `users` and `sessions` tables are mandatory and should not be dropped.

3. **AI content as JSON in PostgreSQL**: Training content generated by OpenAI is stored as JSONB in the `trainings.content` column, allowing flexible structured data (warmup, main drills, finish sections, metadata) without rigid relational modeling.

4. **Coach DNA personalization**: The coach profile feeds context into AI prompts, personalizing generated sessions based on the coach's preferred methodology, club, and historical patterns.

5. **Dev/Prod split**: In development, Vite runs as middleware with HMR. In production, the client is pre-built to `dist/public` and served as static files.

### Replit Integration Modules
Located in `server/replit_integrations/` and `client/replit_integrations/`:
- **auth** - Replit Auth (OIDC + Passport + session management)
- **audio** - Voice recording/playback with AudioWorklet for voice chat
- **chat** - Conversation persistence for AI chat
- **image** - Image generation via `gpt-image-1`
- **batch** - Rate-limited batch processing utility for LLM calls

## External Dependencies

- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable. Required for all data storage and session management.
- **OpenAI API** (via Replit AI Integrations): Used for training session generation (`gpt-5.2` model), image generation (`gpt-image-1`), speech-to-text, and text-to-speech. Configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`.
- **Replit Auth**: OIDC authentication provider. Requires `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables.
- **ffmpeg**: System dependency used for audio format conversion (WebM/MP4 to WAV) in the voice chat module.
- **Google Fonts**: Inter, Chakra Petch, DM Sans, Fira Code, Geist Mono loaded from Google Fonts CDN.