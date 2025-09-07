import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import Filter from "~/components/table/Function/filter";
import Sort from "~/components/table/Function/sort";

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

// Define the column type (adjust this based on your actual Column type from Prisma)
type Column = {
  id: string;
  stringVal?: boolean;
  intVal?: boolean;
  order: number;
  // Add other column properties as needed
};

// Define the sort info type
type SortInfo = {
  column: Column;
  direction: "asc" | "desc";
};

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
        filters: z.array(filterSchema).default([]),
        sorts: z.array(sortSchema).default([]),
        logic: z.enum(["AND", "OR"]).default("AND"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { tableId, filters, sorts, logic } = input;

      const table = await ctx.db.table.findUnique({
        where: { id: tableId },
        include: { column: { orderBy: { order: "asc" } } },
      });
      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
      }

      const baseRules: Prisma.RowWhereInput = { tableId };
      const conditions: Prisma.RowWhereInput[] = [];

      for (const filter of filters) {
        const col = table.column.find((c) => c.id === filter.columnId);
        if (col) {
          const v = filter.value;

          if (col.stringVal) {
            const filterStr = String(v ?? "");

           if (filter.type === "is"){
                conditions.push({
                  cell: {
                    some: {
                      columnId: col.id,
                      stringVal: { equals: filterStr, mode: "insensitive" },
                    },
                  },
                });
                continue;
            }

            if (filter.type === "is not"){
                conditions.push({
                  NOT: {
                    cell: {
                      some: {
                        columnId: col.id,
                        stringVal: { equals: filterStr, mode: "insensitive" },
                      },
                    },
                  },
                });
                continue;
            }

            if (filter.type === "contains"){
                conditions.push({
                  cell: {
                    some: {
                      columnId: col.id,
                      stringVal: { contains: filterStr, mode: "insensitive" },
                    },
                  },
                });
                continue;
            }

            if (filter.type === "does not contain"){
                conditions.push({
                  NOT: {
                    cell: {
                      some: {
                        columnId: col.id,
                        stringVal: { contains: filterStr, mode: "insensitive" },
                      },
                    },
                  },
                });
                continue;
            }

            if (filter.type === "is empty"){
                conditions.push({
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
                continue;
            }

            if (filter.type === "is not empty"){
                conditions.push({
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
                continue;
            }
          }

          if (col.intVal) {
            const filterInt = typeof v === "string" ? Number(v) : (v as number | undefined);
            if (filterInt !== undefined && !Number.isNaN(filterInt)) {
              if (filter.type === "greater than"){
                  conditions.push({
                    cell: {
                      some: { columnId: col.id, intVal: { gt: filterInt } },
                    },
                  });
                  continue;
              }

              if (filter.type === "lesser than"){
                  conditions.push({
                    cell: {
                      some: { columnId: col.id, intVal: { lt: filterInt } },
                    },
                  });
                  continue;
              }
            }
          }
        }
      }

  const whereClause: Prisma.RowWhereInput =
    conditions.length === 0
      ? baseRules
      : logic === "AND"
        ? { AND: [baseRules, ...conditions] }
        : { AND: [baseRules, { OR: conditions }] };
      
    const rows = await ctx.db.row.findMany({
      where: whereClause,
      include: {
        cell: true,
      },
      orderBy: [{createdAt: "asc"}],
    });

    if (sorts.length > 0) {
      // Use a properly typed Map instead of any
      const sortColumns = new Map<string, SortInfo>();
      
      for (const sort of sorts) {
        const sortCol = table.column.find((c) => c.id === sort.columnId);
        if (sortCol) {
          sortColumns.set(sort.columnId, { 
            column: sortCol,
            direction: sort.direction 
          });
        }
      }

      // When we change the value, we would have to remove the changed sort rules
      // -> only take sorts that only include valid columns
      const validSorts = sorts.filter(sort => sortColumns.has(sort.columnId));

      if (validSorts.length > 0) {
        rows.sort((a, b) => {
          for (const sort of validSorts) {
            const sortInfo = sortColumns.get(sort.columnId);
            if (!sortInfo) continue;

            const ac = a.cell.find((c) => c.columnId === sortInfo.column.id);
            const bc = b.cell.find((c) => c.columnId === sortInfo.column.id);

            let cmp = 0;

            if (sortInfo.column.stringVal) {
              const av = (ac?.stringVal ?? "").toLowerCase();
              const bv = (bc?.stringVal ?? "").toLowerCase();
              cmp = av.localeCompare(bv);
            } else if (sortInfo.column.intVal) {
              const av = ac?.intVal ?? 0;
              const bv = bc?.intVal ?? 0;
              cmp = av - bv;
            }

            if (sortInfo.direction === "desc") {
              cmp = -cmp;
            }

            if (cmp !== 0) {
              return cmp;
            }
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
      })),
    }));
    }),
});