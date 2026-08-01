import { z } from "zod";
import { ACTIVITIES } from "./activities";

const activityKeys = ACTIVITIES.map((a) => a.key) as [string, ...string[]];

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

const nameSchema = z.string().trim().min(1).max(80);
const messageSchema = z.string().trim().max(1000).optional().nullable();
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date");
const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time");

export const createWooSchema = z
  .object({
    sender_name: nameSchema,
    sender_email: emailSchema,
    recipient_name: nameSchema,
    recipient_email: emailSchema,
    date: dateSchema,
    time: timeSchema,
    activity_mode: z.enum(["fixed", "recipient_choice"]).default("fixed"),
    plan: z.enum(activityKeys).optional().nullable(),
    proposed_activities: z.array(z.enum(activityKeys)).min(2).max(5).optional().nullable(),
    custom_message: messageSchema,
    theme: z.string().trim().min(1).max(40).default("default"),
  })
  .superRefine((data, ctx) => {
    if (data.activity_mode === "fixed") {
      if (!data.plan) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "plan required for fixed mode",
          path: ["plan"],
        });
      }
    } else if (
      !data.proposed_activities ||
      data.proposed_activities.length < 2
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "proposed_activities must be 2–5 keys",
        path: ["proposed_activities"],
      });
    }
  });

export const respondWooSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("accept"),
  }),
  z.object({
    action: z.literal("choose_activity"),
    chosen_activity: z.enum(activityKeys),
  }),
  z.object({
    action: z.literal("propose_alt"),
    alt_date: dateSchema,
    alt_time: timeSchema,
  }),
]);

export const checkoutSchema = z.object({
  email: emailSchema.optional().nullable(),
  tier: z.enum(["woo_plus", "woo_pro"]).default("woo_pro"),
});

export const emailOnlySchema = z.object({
  email: emailSchema,
});

export const portalSchema = z.object({
  email: emailSchema,
  intent: z.enum(["manage", "cancel"]).default("manage"),
  token: z.string().min(10).optional(),
});

export const unsubscribeSchema = z.object({
  email: emailSchema,
  token: z.string().min(10).optional(),
  immediate: z.boolean().optional().default(false),
});

export const surpriseDateSchema = z.object({
  email: emailSchema,
  preferences: z.string().trim().max(500).optional().nullable(),
  budget: z.string().trim().max(80).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
});

export const sendWooSchema = z.object({
  send_token: z.string().min(10),
});

export const privacyDeleteSchema = z.object({
  email: emailSchema,
  token: z.string().min(10).optional(),
  role: z.enum(["sender", "recipient", "both"]).default("both"),
});

export function zodErrorMessage(err: z.ZodError): string {
  return err.issues[0]?.message || "Invalid request";
}
