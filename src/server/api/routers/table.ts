import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { faker } from '@faker-js/faker';

export const tableRouter = createTRPCRouter({
  getTableByBaseId: privateProcedure
    .input(z.object({baseId: z.string()}))
    .query(async ({ctx, input}) => {
      const tables = await ctx.db.table.findMany({
        where: { baseId: input.baseId },
        orderBy: { createdAt: "asc"}
      })
      return tables;
    }
  ),

  createTable: privateProcedure
    .input(z.object({baseId: z.string()}))
    .mutation(async({ctx, input}) => {
      const result = await ctx.db.$transaction(async(tx) => {
        const base = await tx.base.update({
          where: {id: input.baseId},
          data: {
            tableSequence: {increment: 1}
          },
          select: { tableSequence: true },
        });
        const tableName = `Table ${base.tableSequence}`;
        const defaultColumn = [
          { name: "Name", order: 0 },
          { name: "Notes", order: 1 },
          { name: "Assignee", order: 2 },
          { name: "Status", order: 3 },
          { name: "Attachments", order: 4 },
        ];
        const table = await tx.table.create({
          data: {
            name: tableName,
            baseId: input.baseId,
            column: { create: defaultColumn}
          },
          include: {
            // return the column to retrieve and create row according to them
            column: true,
          }
        });

        for (let i = 0; i < 3; i++ ){
          await tx.row.create({
            data: {
              tableId: table.id,
              cell: {
                create: table.column.map((col) => ({
                  columnId: col.id,
                  stringVal: faker.word.words(2),
                }))
              }
            }
          })
        };

        return table;
      })
    }
  ),

  deleteTable: privateProcedure
    .input(z.object({baseId: z.string(), tableId: z.string()}))
    .mutation(async ({ctx, input}) => {
      const {count} = await ctx.db.table.deleteMany({
        where: {
          id: input.tableId,
          baseId: input.baseId,
        }
      })
      const base = await ctx.db.base.update({
        where: {id: input.baseId},
        data: {
          tableSequence: {decrement: 1}
        }
      })
      return {
        base,
        success: count > 0,
        tableId: input.tableId,
        alreadyDeleted: true,
      }
    }
  ),

  getTableById: privateProcedure
    .input(z.object({tableId: z.string()}))
    .query(async ({ctx, input}) => {
      const table = await ctx.db.table.findUnique({
        where: {id: input.tableId},
        include: {
          column: true,
          row: {
            include: {cell: true,},
          }
        }
      })
      return table;
    }
  )
})