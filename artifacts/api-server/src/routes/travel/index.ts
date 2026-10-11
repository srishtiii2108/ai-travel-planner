import { Router, type IRouter } from "express";
import { db, tripsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { coordinatorAgent } from "../../agents/coordinatorAgent.js";

const router: IRouter = Router();

router.post("/plan", async (req, res) => {
  try {
    const { destination, budget, startDate, endDate, travelers, preferences, origin } = req.body;

    if (!destination || !budget || !startDate || !endDate || !travelers || !preferences) {
      res.status(400).json({ error: "Bad Request", message: "Missing required fields" });
      return;
    }

    const result = await coordinatorAgent({
      destination,
      budget: Number(budget),
      startDate,
      endDate,
      travelers: Number(travelers),
      preferences,
      origin,
    });

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Error generating travel plan");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to generate travel plan" });
  }
});

// List only the logged-in user's own trips.
router.get("/saved", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized", message: "Please log in to view saved trips" });
    return;
  }

  try {
    const trips = await db
      .select()
      .from(tripsTable)
      .where(eq(tripsTable.userId, req.user.id))
      .orderBy(tripsTable.createdAt);

    const formattedTrips = trips.map(trip => ({
      id: trip.id,
      name: trip.name,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: Number(trip.budget),
      totalCost: Number(trip.totalCost),
      budgetStatus: trip.budgetStatus,
      plan: trip.plan,
      request: trip.request,
      createdAt: trip.createdAt.toISOString(),
    }));

    res.json({ trips: formattedTrips });
  } catch (err) {
    req.log.error({ err }, "Error fetching saved trips");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch saved trips" });
  }
});

// Save a trip and attach it to the logged-in user.
router.post("/saved", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized", message: "Please log in to save trips" });
    return;
  }

  try {
    const { name, plan, request } = req.body;

    if (!name || !plan || !request) {
      res.status(400).json({ error: "Bad Request", message: "Missing required fields" });
      return;
    }

    const [trip] = await db.insert(tripsTable).values({
      name,
      destination: plan.destination ?? request.destination,
      startDate: request.startDate,
      endDate: request.endDate,
      budget: String(request.budget),
      totalCost: String(plan.totalEstimatedCost),
      budgetStatus: plan.budgetStatus,
      plan,
      request,
      userId: req.user.id,
    }).returning();

    res.status(201).json({
      id: trip.id,
      name: trip.name,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: Number(trip.budget),
      totalCost: Number(trip.totalCost),
      budgetStatus: trip.budgetStatus,
      plan: trip.plan,
      request: trip.request,
      createdAt: trip.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error saving trip");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to save trip" });
  }
});

// Intentionally public: this is what makes "Share" links work. Anyone who
// has the trip's link can open it. Only the owner can list or delete it.
router.get("/saved/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Bad Request", message: "Invalid trip ID" });
      return;
    }
    const trips = await db.select().from(tripsTable).where(eq(tripsTable.id, id));
    const trip = trips[0];
    if (!trip) {
      res.status(404).json({ error: "Not Found", message: "Trip not found" });
      return;
    }
    res.json({
      id: trip.id,
      name: trip.name,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: Number(trip.budget),
      totalCost: Number(trip.totalCost),
      budgetStatus: trip.budgetStatus,
      plan: trip.plan,
      request: trip.request,
      createdAt: trip.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching trip");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch trip" });
  }
});

// Only the owner can delete a trip.
router.delete("/saved/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized", message: "Please log in to delete trips" });
    return;
  }

  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      res.status(400).json({ error: "Bad Request", message: "Invalid trip ID" });
      return;
    }

    const deleted = await db
      .delete(tripsTable)
      .where(and(eq(tripsTable.id, id), eq(tripsTable.userId, req.user.id)))
      .returning({ id: tripsTable.id });

    if (deleted.length === 0) {
      res.status(404).json({ error: "Not Found", message: "Trip not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Error deleting trip");
    res.status(500).json({ error: "Internal Server Error", message: "Failed to delete trip" });
  }
});

export default router;