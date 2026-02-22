import { Request, Response, NextFunction, Express } from "express";

/**
 * SIMPLE DEV AUTH
 * Replace later with real authentication.
 */

export async function setupAuth(app: Express) {
  console.log("Auth initialized (DEV MODE)");
}

export function registerAuthRoutes(app: Express) {
  app.get("/api/auth/me", (req, res) => {
    res.json({
      id: "dev-user",
      email: "coach@test.com",
      name: "Dev Coach",
    });
  });
}

export function isAuthenticated(
  req: any,
  _res: Response,
  next: NextFunction
) {
  // Fake logged user
  req.user = {
    claims: {
      sub: "dev-user",
    },
  };

  next();
}