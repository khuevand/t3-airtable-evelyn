import { z } from "zod";
import { TRPCError } from "@trpc/server";
// import { clerkClient, currentUser, getAuth } from "@clerk/nextjs/server";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

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
      return{
        base
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
      return{
        success: count > 0,
        baseId: input.baseId,
        alreadyDeleted: true,
      }
    }
  ),

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
        alreadyDeleted: true,
      }
    })
});