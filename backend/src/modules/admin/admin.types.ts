import { z } from "zod";

/**
 * =======================
 * Role Schema
 * =======================
 */

export const updateRoleSchema = z.object({
  role: z.enum(["admin", "user"], {
    message: "Role harus berupa 'admin' atau 'user'",
  }),
});

export const updateStatusSchema = z.object({
  isActive: z.boolean({
    message: "Status isActive harus berupa boolean true atau false",
  }),
});

export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;
