import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema remains the same
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// New schema for network diagrams
export const networkDiagrams = pgTable("network_diagrams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  floorPlan: text("floor_plan").notNull(),
  devices: jsonb("devices").notNull(), // Array of devices with position
  connections: jsonb("connections").notNull(), // Array of connections
  createdAt: text("created_at").notNull(), // ISO string
  updatedAt: text("updated_at").notNull(), // ISO string
});

export const insertNetworkDiagramSchema = createInsertSchema(networkDiagrams).omit({
  id: true,
});

export const deviceSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  x: z.number(),
  y: z.number(),
});

export const connectionSchema = z.object({
  id: z.string(),
  sourceId: z.string(),
  targetId: z.string(),
  type: z.enum(["wired", "wireless"]),
});

export const networkDiagramDataSchema = z.object({
  devices: z.array(deviceSchema),
  connections: z.array(connectionSchema),
  floorPlan: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertNetworkDiagram = z.infer<typeof insertNetworkDiagramSchema>;
export type NetworkDiagram = typeof networkDiagrams.$inferSelect;
export type Device = z.infer<typeof deviceSchema>;
export type Connection = z.infer<typeof connectionSchema>;
export type NetworkDiagramData = z.infer<typeof networkDiagramDataSchema>;
