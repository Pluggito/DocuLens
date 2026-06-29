import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import {
  documents,
  eq,
  and,
  desc,
  ilike,
  count,
  sql,
} from "@repo/db";

export const documentRouter = router({
  /** Get all documents for the current user */
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
        documentType: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, documentType, status, search } = input;
      const offset = (page - 1) * pageSize;

      const conditions = [eq(documents.userId, ctx.session.user.id)];

      if (documentType) {
        conditions.push(eq(documents.documentType, documentType));
      }
      if (status) {
        conditions.push(eq(documents.processingStatus, status));
      }
      if (search) {
        conditions.push(
          ilike(documents.fileName, `%${search}%`)
        );
      }

      const where = and(...conditions);

      const [items, totalResult] = await Promise.all([
        ctx.db
          .select()
          .from(documents)
          .where(where)
          .orderBy(desc(documents.createdAt))
          .limit(pageSize)
          .offset(offset),
        ctx.db
          .select({ total: count() })
          .from(documents)
          .where(where),
      ]);

      const total = totalResult[0]?.total ?? 0;

      return {
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  /** Get a single document by ID */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [document] = await ctx.db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.id, input.id),
            eq(documents.userId, ctx.session.user.id)
          )
        )
        .limit(1);

      if (!document) {
        throw new Error("Document not found");
      }

      return document;
    }),

  /** Delete a document */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [deleted] = await ctx.db
        .delete(documents)
        .where(
          and(
            eq(documents.id, input.id),
            eq(documents.userId, ctx.session.user.id)
          )
        )
        .returning();

      if (!deleted) {
        throw new Error("Document not found");
      }

      // TODO: Also delete from Vercel Blob storage

      return { success: true };
    }),

  /** Update document type (manual override) — re-triggers extraction */
  updateType: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        documentType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(documents)
        .set({
          documentType: input.documentType,
          processingStatus: "processing",
        })
        .where(
          and(
            eq(documents.id, input.id),
            eq(documents.userId, ctx.session.user.id)
          )
        )
        .returning();

      if (!updated) {
        throw new Error("Document not found");
      }

      // TODO: Trigger re-extraction with new document type

      return updated;
    }),

  /** Get document stats for dashboard */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [totalResult, byTypeResult, byStatusResult] = await Promise.all([
      ctx.db
        .select({ total: count() })
        .from(documents)
        .where(eq(documents.userId, userId)),
      ctx.db
        .select({
          documentType: documents.documentType,
          count: count(),
        })
        .from(documents)
        .where(eq(documents.userId, userId))
        .groupBy(documents.documentType),
      ctx.db
        .select({
          status: documents.processingStatus,
          count: count(),
        })
        .from(documents)
        .where(eq(documents.userId, userId))
        .groupBy(documents.processingStatus),
    ]);

    return {
      total: totalResult[0]?.total ?? 0,
      byType: byTypeResult,
      byStatus: byStatusResult,
    };
  }),
});
