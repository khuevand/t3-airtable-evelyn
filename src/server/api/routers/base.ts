import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { faker } from '@faker-js/faker';

export const baseRouter = createTRPCRouter({
  getBaseByUserId: privateProcedure
    .query(async ({ctx}) => {
      const user = ctx.currentUser.id;
      if(!user){
        throw new TRPCError({code: "UNAUTHORIZED"});
      }
      const bases = await ctx.db.base.findMany({
        where: { userId: user},
        orderBy: { updatedAt: "desc" },
      })
      return bases;
    }
  ),

  createBase: privateProcedure
    .input(z.object({name: z.string().optional()}))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.currentUser.id;
      if(!user){
        throw new TRPCError({code: "UNAUTHORIZED"});
      }
      
      const name = input.name ?? "Untitled Base";
      const base = await ctx.db.base.create({
        data: {
          name: name,
          userId: user,
        }
      })
      const tableName = `Table ${base.tableSequence}`;
      const defaultColumn = [
        { name: "Name", order: 0 },
        { name: "Notes", order: 1 },
        { name: "Assignee", order: 2 },
        { name: "Status", order: 3 },
        { name: "Attachments", order: 4 },
      ];
      const table = await ctx.db.table.create({
        data: {
          name: tableName,
          baseId: base.id,
          column: { create: defaultColumn,}
        },
        include: {
          column: true,
        }
      });

      for (let i = 0; i < 3; i++ ){
        await ctx.db.row.create({
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
      return{
        base,
        table
      }
    }
  ),

  deleteBase: privateProcedure
    .input(z.object({baseId: z.string()}))
    .mutation(async ({ctx, input}) => {
      const user = ctx.currentUser.id;
      if(!user){
        throw new TRPCError({code: "UNAUTHORIZED"});
      }
      const {count} = await ctx.db.base.deleteMany({
        where: {
          id: input.baseId,
          userId: user,
        },
      })
      return {
        success: count > 0,
        baseId: input.baseId,
        alreadyDeleted: true,
      }
    }
  ),

  getBaseById: privateProcedure
    .input(z.object({baseId: z.string()}))
    .query(async ({ctx, input}) => {
      const base = await ctx.db.base.findUnique({
        where: {id: input.baseId},
        include: {
          table: true, 
        },
      })
      return base;
    }),

  renameBase: privateProcedure
    .input(z.object({baseName: z.string(), baseId: z.string()}))
    .mutation(async ({ctx, input}) => {
      const user = ctx.currentUser.id;
      if (!user){
        throw new TRPCError({code: "UNAUTHORIZED"});
      }
      const {count} = await ctx.db.base.updateMany({
        where: {
          id: input.baseId,
          userId: user,
        },
        data: {name: input.baseName},
      })
      return{
        success: count > 0,
        baseId: input.baseId,
      }
    })
});