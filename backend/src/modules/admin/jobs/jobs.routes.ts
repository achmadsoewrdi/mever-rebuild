import { FastifyInstance } from "fastify";
import { getJobs, retryJob } from "./jobs.controller";
import { authenticate } from "../../../middlewares/authenticate";
import { authorize } from "../../../middlewares/authorize";

export const adminJobsRoutes = async (app: FastifyInstance) => {
  app.get("/jobs", { preHandler: [authenticate, authorize(["admin"])] }, getJobs);
  app.post("/jobs/:id/retry", { preHandler: [authenticate, authorize(["admin"])] }, retryJob);
};
