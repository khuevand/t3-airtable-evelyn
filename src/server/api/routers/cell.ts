import { z } from "zod";
// import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const cellRouter = createTRPCRouter({
  updateCell: privateProcedure
    .input(z.object({columnId: z.string(), rowId: z.string(), intValue: z.number().int().optional(), stringValue: z.string().optional()}))
    .mutation(async ({ctx, input}) => {
      const {count} = await ctx.db.cell.updateMany({
        where: {
          columnId: input.columnId,
          rowId: input.rowId,
        },
        data: {
          intVal: input.intValue,
          stringVal: input.stringValue,
        }
      })
      return {
        success: count > 0,
        columnId: input.columnId,
        rowId: input.rowId,
      }
    })
    
})