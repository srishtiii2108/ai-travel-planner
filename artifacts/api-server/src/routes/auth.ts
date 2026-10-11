import { Router, type IRouter, type Request, type Response } from "express";
import { GetCurrentAuthUserResponse } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { clearSession, getSessionId, createSession, deleteSession, SESSION_COOKIE, SESSION_TTL, type SessionData } from "../lib/auth";
import crypto from "crypto";

const router: IRouter = Router();

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, { httpOnly: true, secure: false, sameSite: "lax", path: "/", maxAge: SESSION_TTL });
}

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(GetCurrentAuthUserResponse.parse({ user: req.isAuthenticated() ? req.user : null }));
});

router.get("/login", (req: Request, res: Response) => {
  const returnTo = req.query.returnTo || "/";
  const isSignup = req.query.action === "signup";
  const action = isSignup ? "signup" : "login";
  res.send(`<!DOCTYPE html><html><head><title>WanderAI</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f5f5f5}.card{background:white;padding:40px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);width:360px}h2{margin:0 0 24px;color:#1a1a1a;text-align:center}label{font-size:13px;color:#555}input{width:100%;padding:10px 14px;margin:6px 0 16px;border:1px solid #ddd;border-radius:8px;font-size:15px;box-sizing:border-box}button{width:100%;padding:12px;background:#FF6B35;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer}.flag{text-align:center;font-size:32px;margin-bottom:8px}.toggle{text-align:center;margin-top:16px;font-size:14px;color:#666}a{color:#FF6B35;text-decoration:none}</style></head><body><div class="card"><div class="flag">🇮🇳</div><h2>${isSignup ? "Create Account" : "Welcome Back"}</h2><form method="POST" action="/api/login/local"><input type="hidden" name="returnTo" value="${returnTo}"/><input type="hidden" name="action" value="${action}"/><label>Username</label><input type="text" name="username" placeholder="Enter username" required/><label>Password</label><input type="password" name="password" placeholder="Enter password" required/><button type="submit">${isSignup ? "Sign Up" : "Sign In"}</button></form><div class="toggle">${isSignup ? `Already have an account? <a href="/api/login?returnTo=${returnTo}">Login</a>` : `New here? <a href="/api/login?action=signup&returnTo=${returnTo}">Sign Up</a>`}</div></div></body></html>`);
});

router.post("/login/local", async (req: Request, res: Response) => {
  const { username, password, returnTo, action } = req.body;
  if (!username || !password) { res.status(400).send("Username and password required"); return; }

  const userId = crypto.createHash("md5").update(username).digest("hex");
  const passwordHash = crypto.createHash("sha256").update(password + "wanderai_salt").digest("hex");
  const safeReturn = typeof returnTo === "string" && returnTo.startsWith("/") ? returnTo : "/";

  const existing = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  const user = existing[0];

  const errorPage = (msg: string, link: string, linkText: string) =>
    `<!DOCTYPE html><html><head><title>Error</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f5f5f5}.card{background:white;padding:40px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);width:360px;text-align:center}</style></head><body><div class="card"><div style="font-size:32px">&#127988;</div><h2 style="color:#e53e3e">${msg}</h2><a href="${link}" style="color:#FF6B35">${linkText}</a></div></body></html>`;

  if (action === "signup") {
    if (user) { res.status(400).send(errorPage("Username already exists!", "/api/login", "Go to Login")); return; }
    await db.insert(usersTable).values({ id: userId, email: `${username}@local.dev`, firstName: username, lastName: null, profileImageUrl: null, passwordHash });
    const sessionData: SessionData = { user: { id: userId, email: `${username}@local.dev`, firstName: username, lastName: null, profileImageUrl: null }, access_token: "local-token", refresh_token: undefined, expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 };
    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);
    res.redirect(safeReturn);
  } else {
    if (!user) { res.status(400).send(errorPage("User not found!", `/api/login?action=signup&returnTo=${safeReturn}`, "Sign Up")); return; }
    if (user.passwordHash !== passwordHash) { res.status(400).send(errorPage("Invalid credentials!", "/api/login", "Try Again")); return; }
    const sessionData: SessionData = { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, profileImageUrl: user.profileImageUrl }, access_token: "local-token", refresh_token: undefined, expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 };
    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);
    res.redirect(safeReturn);
  }
});

router.get("/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  res.redirect("/");
});

router.post("/mobile-auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  if (sid) { await deleteSession(sid); }
  res.json({ success: true });
});

export default router;
