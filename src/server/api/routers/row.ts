import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

const filterSchema = z.object({
  columnId: z.string(),
  type: z.enum([
    "is",
    "is not",
    "contains",
    "does not contain",
    "is empty",
    "is not empty",
    "greater than",
    "lesser than",
  ]),
  value: z.union([z.string(), z.number()]).optional().nullish(),
});

const sortSchema = z.object({
  columnId: z.string(),
  direction: z.enum(["asc", "desc"]),
});

export const rowRouter = createTRPCRouter({
  createRow: privateProcedure
    .input(z.object({ tableId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const columns = await ctx.db.column.findMany({
        where: { tableId: input.tableId },
      });

      const createCells = columns.map((col) => {
        let stringVal: string | null = null;
        let intVal: number | null = null;

        if (col.stringVal) {
          stringVal = "";
        } else if (col.intVal) {
          intVal = null;
        }

        return { columnId: col.id, stringVal, intVal };
      });

      const row = await ctx.db.row.create({
        data: {
          tableId: input.tableId,
          cell: { create: createCells },
        },
        include: { cell: true },
      });

      return row;
    }),

  deleteRow: privateProcedure
    .input(z.object({ rowId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { count } = await ctx.db.row.deleteMany({
        where: { id: input.rowId },
      });

      return {
        success: count > 0,
        rowId: input.rowId,
        alreadyDeleted: count === 0,
      };
    }),

  getRowsByOperation: privateProcedure
    .input(
      z.object({
        tableId: z.string(),
        filter: filterSchema.nullish(),
        sort: sortSchema.nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { tableId, filter, sort } = input;

      const table = await ctx.db.table.findUnique({
        where: { id: tableId },
        include: { column: { orderBy: { order: "asc" } } },
      });
      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
      }

      const AND: Prisma.RowWhereInput[] = [{ tableId }];

      if (filter) {
        const col = table.column.find((c) => c.id === filter.columnId);
        if (col) {
          const v = filter.value;

          if (col.stringVal) {
            const filterStr = String(v ?? "");

            switch (filter.type) {
              case "is":
                AND.push({
                  cell: {
                    some: {
                      columnId: col.id,
                      stringVal: { equals: filterStr, mode: "insensitive" },
                    },
                  },
                });
                break;

              case "is not":
                AND.push({
                  NOT: {
                    cell: {
                      some: {
                        columnId: col.id,
                        stringVal: { equals: filterStr, mode: "insensitive" },
                      },
                    },
                  },
                });
                break;

              case "contains":
                AND.push({
                  cell: {
                    some: {
                      columnId: col.id,
                      stringVal: { contains: filterStr, mode: "insensitive" },
                    },
                  },
                });
                break;

              case "does not contain":
                AND.push({
                  NOT: {
                    cell: {
                      some: {
                        columnId: col.id,
                        stringVal: { contains: filterStr, mode: "insensitive" },
                      },
                    },
                  },
                });
                break;

              case "is empty":
                AND.push({
                  OR: [
                    { cell: { none: { columnId: col.id } } },
                    {
                      cell: {
                        some: {
                          columnId: col.id,
                          OR: [{ stringVal: null }, { stringVal: "" }],
                        },
                      },
                    },
                  ],
                });
                break;

              case "is not empty":
                AND.push({
                  cell: {
                    some: {
                      columnId: col.id,
                      AND: [
                        { stringVal: { not: null } },
                        { stringVal: { not: "" } },
                      ],
                    },
                  },
                });
                break;
            }
          }

          if (col.intVal) {
            const filterInt = typeof v === "string" ? Number(v) : (v as number | undefined);
            if (filterInt !== undefined && !Number.isNaN(filterInt)) {
              switch (filter.type) {
                case "greater than":
                  AND.push({
                    cell: {
                      some: { columnId: col.id, intVal: { gt: filterInt } },
                    },
                  });
                  break;

                case "lesser than":
                  AND.push({
                    cell: {
                      some: { columnId: col.id, intVal: { lt: filterInt } },
                    },
                  });
                  break;
              }
            }
          }
        }
      }

  const whereClause: Prisma.RowWhereInput = AND.length > 1 ? { AND } : AND[0]!;
    
    const rows = await ctx.db.row.findMany({
      where: whereClause,
      include: {
        cell: true,
      },
      orderBy: [{createdAt: "asc"}],
    });
     
    if (sort) {
      const sortCol = table.column.find((c) => c.id === sort.columnId);
      if (sortCol) {
        rows.sort((a, b) => {
          const ac = a.cell.find((c) => c.columnId === sortCol.id);
          const bc = b.cell.find((c) => c.columnId === sortCol.id);

          if (sortCol.stringVal) {
            const av = (ac?.stringVal ?? "").toLowerCase();
            const bv = (bc?.stringVal ?? "").toLowerCase();
            const cmp = av.localeCompare(bv);
            return sort.direction === "desc" ? -cmp : cmp;
          }

          if (sortCol.intVal) {
            const av = Number(ac?.intVal ?? 0);
            const bv = Number(bc?.intVal ?? 0);
            const cmp = av - bv;
            return sort.direction === "desc" ? -cmp : cmp;
          }

          return 0;
        });
      }
    }

    return rows.map((r) => ({
      id: r.id,
      tableId: tableId,
      createdAt: r.createdAt,
      cells: r.cell.map((c) => ({
        id: c.id,
        rowId: c.rowId,
        columnId: c.columnId,
        stringVal: c.stringVal,
        intVal: c.intVal,
      })
    ),
    
    }))
    }),
});
