import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const rowRouter = createTRPCRouter({
  createRow: privateProcedure
    .input(z.object({ tableId: z.string()}))
    .mutation(async ({ctx, input}) => {
      const columns = await ctx.db.column.findMany({
        where: {tableId: input.tableId},
      });

      const createCells = columns.map((col) => {
        let stringVal = null;
        let intVal = null;
        if (col.stringVal){
          stringVal = "";
        }
        else if (col.intVal){
          intVal = null;
        }
        return {
          columnId: col.id,
          stringVal,
          intVal,
        }
      });

      const row = await ctx.db.row.create({
        data: {
          tableId: input.tableId,
          cell: {
            create: createCells,
          }
        }
      });
      
      return row;
    }
  ),

  deleteRow: privateProcedure
    .input(z.object({rowId: z.string()}))
    .mutation(async ({ctx, input}) => {
      const {count} = await ctx.db.row.deleteMany({
        where: {id: input.rowId},
      });

      return {
        success: count > 0,
        rowId: input.rowId,
        alreadyDeleted: true,
      }
    })
})