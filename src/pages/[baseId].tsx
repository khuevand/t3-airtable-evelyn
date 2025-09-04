import {
  ChevronDown,
  HelpCircle,
  Bell,
  ArrowLeft,
  History,
  Dock,
  Plus,
  Search,
  Grid2X2
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { api } from "~/utils/api";
import { useReactTable, getCoreRowModel, flexRender} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { ProfileMenu } from "~/components/base/profileMenu";
import stringToColor from "~/components/base/encodeBaseColor";
import LoadingState from "~/components/loadingState";

// Type definitions matching Prisma schema
interface Cell {
  columnId: string;
  stringVal?: string | null;
  intVal?: number | null;
}

interface Row {
  id: string;
  createdAt: Date;
  tableId: string;
  cell: Cell[];
}

interface Column {
  id: string;
  name: string;
}

interface TableData {
  id: string;
  column: Column[];
  row: Row[];
}

export default function BasePage(){
  const router = useRouter();
  const utils = api.useUtils();
  const { } = useUser();
  const { baseId } = router.query;
  const baseIdString = Array.isArray(baseId) ? baseId[0] : baseId;
  
  const [isHomeIconHover, setHomeIconHover] = useState(false);
  const [activeTableId, setActiveTableId] = useState<string | undefined>(undefined); 

  const {data: baseData} = api.base.getBaseById.useQuery({baseId: baseIdString!}, {enabled: !!baseIdString})

  const {data: tableData, isLoading: isTableLoading} = api.table.getTableByBaseId.useQuery({baseId: baseIdString!}, {enabled: !!baseIdString})
  
  const {data: activeTableData, isLoading: isActiveTableLoading} = api.table.getTableById.useQuery({tableId: activeTableId!}, {enabled: !!activeTableId});
  
  const createTable = api.table.createTable.useMutation({
    onMutate: async({ baseId }) => {
      await utils.base.getBaseById.cancel({baseId});
      const prevBase = utils.base.getBaseById.getData();
      const optimisticTable = {
        id: uuidv4(),
        baseId: baseId,
        name: "",
        columnSequence: 5, 
        createdAt: new Date(),
      }

      const optimisticBase = {
        id: baseId,
        name: "Base Name",
        createdAt: new Date(),
        updatedAt: new Date(),
        tableSequence: 1,
        userId: "exampleUserId",
        table: [optimisticTable],
      }

      utils.base.getBaseById.setData({baseId}, (old) => {
        if (!old) return optimisticBase;
        return {...old, table: [...old.table, optimisticTable]};
      });
      return {baseId, prevBase, optimisticTable};
    },

    onError: (_error, _variables, ctx) => {
      if (ctx?.prevBase){
        utils.base.getBaseById.setData({baseId: ctx.baseId}, ctx.prevBase);
      }
    },

    onSuccess: (newTable, ctx) => {
      utils.base .getBaseById.setData({baseId: ctx.baseId}, (old) => {
        if (!old) return old;
        return {
          ...old,
          table: [...old.table, newTable]
        }
      });
    },

    onSettled: (ctx) => {
      void utils.base.getBaseById.invalidate({baseId: ctx?.baseId});
    }
  });

  const deleteTable = api.table.deleteTable.useMutation({
    onMutate: async({baseId, tableId}) => {
      await utils.base.getBaseById.cancel({baseId});
      const prevBase = utils.base.getBaseById.getData();
      utils.base.getBaseById.setData({baseId}, (old) => {
        if (!old) return old;
        const remainingTable = old.table.filter((t) => t.id != tableId);
        const fallbackTable = remainingTable[0]?.id ?? undefined;
        setActiveTableId(fallbackTable);
        return {...old, table: remainingTable};
      })
      return {prevBase, baseId};
    },

    onError: (_err, _variables, ctx) => {
      if (ctx?.prevBase) {
        utils.base.getBaseById.setData({baseId: ctx.baseId}, ctx.prevBase);
      }
      toast.error("Error on deleting table");
    },

    onSuccess: () => {
      toast.success("Table moved to trash.");
    },

    onSettled: (_data, _error, _variables, ctx) => {
      void utils.base.getBaseById.invalidate({baseId: ctx?.baseId});
    }
  });

  const addRow = api.row.createRow.useMutation({
    onSuccess: () => {
      toast.success("Row created successfully!");
    },
    onError: () => {
      toast.error("Error creating row.");
    },
    onSettled: () => {
     void utils.table.getTableById.invalidate({ tableId: activeTableId });
    }
  });

  const deleteRow = api.row.deleteRow.useMutation({
    onSuccess: () => {
      toast.success("Row deleted successfully!");
    },
    onError: () => {
      toast.error("Error deleting row.");
    },
    onSettled: () => {
     void utils.table.getTableById.invalidate({ tableId: activeTableId });
    }
  });

  const addColumn = api.column.createColumn.useMutation({
    onSuccess: () => {
      toast.success("Column created successfully!");
    },
    onError: () => {
      toast.error("Error creating column.");
    },
    onSettled: () => {
     void utils.table.getTableById.invalidate({ tableId: activeTableId });
    }
  });

  const deleteColumn = api.column.deleteColumn.useMutation({
    onSuccess: () => {
      toast.success("Column deleted successfully!");
    },
    onError: () => {
      toast.error("Error deleting column.");
    },
    onSettled: () => {
     void utils.table.getTableById.invalidate({ tableId: activeTableId });
    }
  });

  useEffect(() => {
    if (isTableLoading) {
      return;
    }

    if (!tableData || tableData.length === 0) {
      setActiveTableId(undefined);
    } else {
      setActiveTableId(tableData?.[0]?.id ?? undefined);
    }
  }, [tableData, isTableLoading]);

  const memorizedColumns = useMemo(() => {
    if (!activeTableData?.column) return [];
    return activeTableData.column.map((col) => ({
      id: col.id,
      accessorFn: (row: Row) => {
        const cellData = row.cell?.find((cell) => cell.columnId === col.id);
        return cellData?.stringVal ?? cellData?.intVal?.toString() ?? "";
      },
      header: col.name,
    }));
  }, [activeTableData]);

  const tableDataRows = useMemo(() => {
    if (!activeTableData?.row) return [];
      return activeTableData.row;
  }, [activeTableData]);

  const table = useReactTable({
    data: tableDataRows as Row[],
    columns: memorizedColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex h-screen">
      <aside className="w-13.5 p-4 flex flex-col bg-white border-r border-gray-200 gap-200">
        <div className="flex items-center text-gray-700 cursor-pointer"
              onMouseEnter={() => setHomeIconHover(true)}
              onMouseLeave={() => setHomeIconHover(false)}>
          {isHomeIconHover ? (
            <ArrowLeft className="w-4 h-4"
                        onClick={() => router.push("/home")}/>
          ) : (
            <Image src="/airtable.png" alt="Logo" width={22} height={22}/>
          )}
        </div>

        <div className="flex flex-col gap-2 items-center text-gray cursor-pointer">
          <button className="flex items-center px-1 py-1 gap-1 text-[13px] text-gray-700 rounded-2xl hover:bg-gray-200 cursor-pointer"
                  title="Help Center">
            <HelpCircle className="w-4 h-4"></HelpCircle>
          </button>

          <button className="flex items-center justify-center h-7 w-7 rounded-full text-[13px] text-gray-700 border border-white hover:bg-gray-200 cursor-pointer"
                  title="Notifications"
          >
            <Bell className="w-4 h-4"></Bell>
          </button>
          <div className="flex items-center justify-center h-6 w-6 mr-2">
            <ProfileMenu isBasePage={true}/>
          </div> 
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-1 border border-gray-200 rounded-lg"
                  style={{ backgroundColor: stringToColor(baseIdString ? stringToColor(baseIdString) : 'hsl(0, 70%, 50%)')}}>
              <Image src="/airtable.png" alt="Logo" width={22} height={22}/>
            </div>
            <span className="text-[17px] font-bold">{baseData?.name}</span>
            <ChevronDown className="text-gray-600 w-4 h-4"/>
          </div>

          <div className="flex items-center text-[13px] gap-4 font-medium">
            <span>Data</span>
            <span className="text-gray-600">Automations</span>
            <span className="text-gray-600">Interfaces</span>
            <span className="text-gray-600">Forms</span>
          </div>

          <div className="flex items-center text-[13px] gap-1.5">
            <div className="p-1 rounded-2xl border border-white hover:bg-gray-100 cursor-pointer">
              <History className="w-4 h-4 text-gray-600"/>
            </div>
            <div className="flex items-center px-3.5 py-1 gap-1 rounded-lg border border-gray-200 hover:shadow-lg cursor-pointer">
              <Dock className="w-3 h-3"/>
              <span>Launch</span>
            </div>

            <div className="px-3.5 py-1 font-semibold rounded-lg border border-gray-200 hover:shadow-lg cursor-pointer">
              <span>Share</span>
            </div>
          </div>
        </header>

        <section className="border-b border-gray-200 py-6 bg-white">
          <div className="flex items-center gap-2 px-4">
            <h3 className="text-sm font-medium text-gray-700">Row Controls:</h3>
            <button 
              onClick={() => activeTableId && addRow.mutate({ tableId: activeTableId })}
              disabled={!activeTableId || addRow.isPending}
              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {addRow.isPending ? 'Adding...' : 'Add Row'}
            </button>
            <button 
              onClick={() => {
                const firstRow = tableDataRows[0];
                if (firstRow) {
                  deleteRow.mutate({ rowId: firstRow.id });
                }
              }}
              disabled={!tableDataRows.length || deleteRow.isPending}
              className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {deleteRow.isPending ? 'Deleting...' : 'Delete First Row'}
            </button>
          </div>
          <div className="flex items-center gap-2 px-4 mt-2">
            <h3 className="text-sm font-medium text-gray-700">Column Controls:</h3>
            <button 
              onClick={() => {
                if (activeTableId) {
                  addColumn.mutate({ 
                    tableId: activeTableId, 
                    name: `Column ${Date.now()}`, 
                    stringVal: true, 
                    intVal: false 
                  });
                }
              }}
              disabled={!activeTableId || addColumn.isPending}
              className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {addColumn.isPending ? 'Adding...' : 'Add String Column'}
            </button>
            <button 
              onClick={() => {
                if (activeTableId) {
                  addColumn.mutate({ 
                    tableId: activeTableId, 
                    name: `Number ${Date.now()}`, 
                    stringVal: false, 
                    intVal: true 
                  });
                }
              }}
              disabled={!activeTableId || addColumn.isPending}
              className="px-3 py-1 text-xs bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
            >
              {addColumn.isPending ? 'Adding...' : 'Add Number Column'}
            </button>
            <button 
              onClick={() => {
                const firstColumn = activeTableData?.column[0];
                if (activeTableId && firstColumn) {
                  deleteColumn.mutate({ 
                    tableId: activeTableId, 
                    columnId: firstColumn.id 
                  });
                }
              }}
              disabled={!activeTableData?.column.length || deleteColumn.isPending}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {deleteColumn.isPending ? 'Deleting...' : 'Delete First Column'}
            </button>
          </div>
        </section>

        <section className="border-b border-gray-200 py-6 bg-white">

        </section>
        <main className="flex-1 min-h-0 flex">
          <div className="flex flex-col w-[280px] p-3 text-gray-900 border-r border-gray-200 gap-1">
            <div className="flex items-center p-2 gap-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Plus className="w-4 h-4 text-gray-600"/>
              <span className="text-[12.5px]">Create new...</span>
            </div>

            <div className="flex items-center p-2 gap-2 text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Search className="w-4 h-4"/>
              <span className="text-[12.5px]">Find a view</span>
            </div>

            <div className="flex items-center p-2 gap-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <Grid2X2 className="w-4 h-4 text-blue-700"/>
              <span className="text-[12.5px] font-semibold">Grid view</span>
            </div>
          </div>

          <div className="flex-1 bg-slate-100">
            <div className="flex-1 bg-slate-100 p-4">
              {isActiveTableLoading ? (
                <LoadingState text="Loading table data..." />
              ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th
                              key={header.id}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {table.getRowModel().rows.map(row => (
                        <tr key={row.id}>
                          {row.getVisibleCells().map(cell => (
                            <td
                              key={cell.id}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}