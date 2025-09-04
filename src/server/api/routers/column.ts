import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const columnRouter = createTRPCRouter({
  createColumn: privateProcedure
    .input(z.object({ tableId: z.string(), name: z.string(), stringVal: z.boolean(), intVal: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const table = await ctx.db.table.update({
        where: { id: input.tableId },
        data: {
          columnSequence: { increment: 1 }
        },
        select: { columnSequence: true },
      });

      const column = await ctx.db.column.create({
        data: {
          tableId: input.tableId,
          name: input.name,
          order: table.columnSequence,
          stringVal: input.stringVal,
          intVal: input.intVal,
        }
      });

      const rows = await ctx.db.row.findMany({
        where: { tableId: input.tableId },
        select: { id: true },
      });

      if (rows.length > 0) {
        await ctx.db.cell.createMany({
          data: rows.map((row) => ({
            rowId: row.id,
            columnId: column.id,
            stringVal: input.stringVal ? "" : null,
            intVal: input.intVal ? null : null,
          })),
        });
      }

      return column;
    }
  ),

  deleteColumn: privateProcedure
    .input(z.object({tableId: z.string(), columnId: z.string()}))
    .mutation(async ({ctx, input}) => {
      const table = await ctx.db.table.update({
        where: {id: input.tableId},
        data: {
          columnSequence: {decrement: 1},
        }
      });

      const {count} = await ctx.db.column.deleteMany({
        where: {
          id: input.columnId,
        }
      });

      return {
        table,
        success: count > 0,
        columnId: input.columnId,
        alreadyDeleted: true,
      }
    }
  ),

  renameColumn: privateProcedure
    .input(z.object({columnId: z.string(), name: z.string()}))
    .mutation(async ({ctx, input}) => {
      const column = await ctx.db.column.update({
        where: {id: input.columnId},
        data: {name: input.name},
      });
      return column;
    }
  ),

  changeTypeColumn: privateProcedure
    .input(z.object({columnId: z.string(), stringVal: z.boolean(), intVal: z.boolean()}))
    .mutation(async ({ctx, input}) => {
      const column = await ctx.db.column.update({
        where: {id: input.columnId},
        data: {
          stringVal: input.stringVal,
          intVal: input.intVal,
        }
      });

      const cells = await ctx.db.cell.findMany({
        where: {columnId: input.columnId},
      });

      const updatedCells = cells.map((cell) => {
        let stringVal = null;
        let intVal = null;
        if (input.stringVal){
          stringVal = cell.stringVal ?? "";
        }
        else if (input.intVal){
          intVal = cell.intVal ?? null;
        }
        return {
          id: cell.id,
          stringVal,
          intVal,
        }
      });

      await ctx.db.cell.updateMany({
        data: updatedCells,
      });
    }
  )
});
