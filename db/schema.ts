import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const rfps = pgTable("rfps", {
  id: serial("id").primaryKey(),
  title: text("title"),
  description: text("description"),
  structured: jsonb("structured"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  contact: text("contact"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  rfpId: integer("rfp_id").references(() => rfps.id),
  vendorId: integer("vendor_id").references(() => vendors.id),
  parsed: jsonb("parsed"),
  aiSummary: text("ai_summary"),
  rawEmail: text("raw_email"),
  createdAt: timestamp("created_at").defaultNow(),
});
