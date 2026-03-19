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
        .min(8, "Date of birth must be 8 digits (DDMMYYYY)")
        .max(8, "Date of birth must be 8 digits (DDMMYYYY)")
        .regex(
            /^\d{8}$/,
            "Date of birth must be in DDMMYYYY format"
        ),
});
