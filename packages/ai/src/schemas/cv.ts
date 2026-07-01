import { z } from "zod";

export const cvSchema = z.object({
  personalInfo: z.object({
    fullName: z.string(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    location: z.string().nullable(),
    linkedIn: z.string().nullable(),
    portfolio: z.string().nullable(),
  }),
  summary: z.string().nullable(),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    description: z.string().nullable(),
    highlights: z.array(z.string()),
  })),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    graduationDate: z.string().nullable(),
    gpa: z.string().nullable(),
  })),
  skills: z.array(z.string()),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string().nullable(),
    date: z.string().nullable(),
  })),
  languages: z.array(z.string()),
});
