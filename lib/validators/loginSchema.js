import { z } from "zod";

export const loginSchema = z.object({
    phone: z
        .string()
        .trim()
        .length(10, "Phone number must be exactly 10 digits")
        .regex(/^\d+$/, "Phone number must contain only digits"),

    dob: z
        .string()
        .trim()
        .min(6, "Date of birth is required")
        .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Date of birth must be in YYYY-MM-DD format"
        ),
});
