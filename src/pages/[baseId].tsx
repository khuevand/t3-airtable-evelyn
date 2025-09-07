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
import { useEffect, useMemo, useState, useCallback } from "react";
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
import { CreateColumn } from "~/components/table/createColumn";
import FunctionBar from "~/components/table/functionBar";
import TableTabs from "~/components/table/tableTab";
import { EditableCell } from "~/components/table/editableCell";

type Cell = {
  id: string;
  rowId: string;
  columnId: string;
  stringVal: string | null;
  intVal: number | null;
};

type Row = {
  id: string;
  tableId: string;
  createdAt: string | Date; 
  cell?: Cell[];   
  cells?: Cell[];
};

type CellPrimitive = string | number | null;

type FlattenedRow = {
  id: string;
} & Record<string, CellPrimitive>;

type FilterType =
  "is"
  | "is not"
  | "contains"
  | "does not contain"
  | "is empty"
  | "is not empty"
  | "greater than"
  | "lesser than";

type Filter = { columnId: string; type: FilterType; value?: string | number | null };
type Sort = { columnId: string; direction: "asc" | "desc" };


type filterLogic = "AND" | "OR";

export default function BasePage(){
  const router = useRouter();
  const utils = api.useUtils();
  const { user, isLoaded, isSignedIn } = useUser();
  const { baseId } = router.query;
  const baseIdString = Array.isArray(baseId) ? baseId[0] : baseId;
 
  const [isHomeIconHover, setHomeIconHover] = useState(false);
  const [activeTableId, setActiveTableId] = useState<string | undefined>(undefined);
  const [isCreateColumn, setCreateColumn] = useState(false);


  const [filters, setFilters] = useState<Filter[]>([]);
  const [filterLogic, setFilterLogic] = useState<filterLogic>("AND");
  const [sorts, setSorts] = useState<Sort[]>([]);
  const [deleteMenu, setDeleteMenu] = useState<{
    type: "row" | "column" | null;
    id?: string;
    x?: number;
    y?: number;
  }>({ type: null });

  const [focusedCell, setFocusedCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  const {data: baseData,
        isLoading: isBaseLoading,
  } = api.base.getBaseById.useQuery({baseId: baseIdString!}, {enabled: !!baseIdString});

  const {data: tableData,
      isLoading: isTableLoading,
  } = api.table.getTableByBaseId.useQuery({baseId: baseIdString!}, {enabled: !!baseIdString});
 
  const {data: activeTableData,
       isLoading: isActiveTableLoading,
  } = api.table.getTableById.useQuery({tableId: activeTableId!}, {enabled: !!activeTableId});

  const { data: opRows, isLoading: isRowsLoading } = api.row.getRowsByOperation.useQuery(
    {
      tableId: activeTableId!,
      filters: filters,
      sorts: sorts,
      logic: filterLogic,
    },
    { enabled: !!activeTableId }
  );
 
  const createTable = api.table.createTable.useMutation({
    onMutate: async({ baseId }) => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      await utils.base.getBaseById.cancel({baseId});
      await utils.table.getTableByBaseId.cancel({ baseId });

      const prevBase = utils.base.getBaseById.getData();
       const prevTables = utils.table.getTableByBaseId.getData({ baseId });

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
        userId: user?.id,
        table: [optimisticTable],
      }

      utils.base.getBaseById.setData({baseId}, (old) => {
        if (!old) return optimisticBase;
        return {...old, table: [...old.table, optimisticTable]};
      });

      if (prevTables) {
        utils.table.getTableByBaseId.setData({ baseId }, [...prevTables, optimisticTable]);
      }
      return {baseId, prevBase, prevTables, optimisticTable};
    },

    onError: (_error, _variables, ctx) => {
      if (ctx?.prevBase){
        utils.base.getBaseById.setData({baseId: ctx.baseId}, ctx.prevBase);
        utils.table.getTableByBaseId.setData({ baseId: ctx.baseId }, ctx.prevTables);
      }
    },

    onSuccess: () => {
      toast.success("Successfully create table");
    },

    onSettled: (_data, _err, ctx) => {
      void utils.table.getTableByBaseId.invalidate({ baseId: ctx.baseId });
    },
  });

  const deleteTable = api.table.deleteTable.useMutation({
    onMutate: async({baseId, tableId}) => {
      await utils.base.getBaseById.cancel({baseId});
      await utils.table.getTableByBaseId.cancel({ baseId });

      const prevBase = utils.base.getBaseById.getData();
      const prevTables = utils.table.getTableByBaseId.getData({ baseId });

      utils.base.getBaseById.setData({baseId}, (old) => {
        if (!old) return old;
        const remainingTable = old.table.filter((t) => t.id != tableId);
        const fallbackTable = remainingTable[0]?.id ?? undefined;
        setActiveTableId(fallbackTable);
        return {...old, table: remainingTable};
      });

      if (prevTables){
        utils.table.getTableByBaseId.setData({baseId}, prevTables.filter((t) => t.id !== tableId))
      };

      return {prevBase, prevTables, baseId};
    },

    onError: (_err, _variables, ctx) => {
      if (ctx?.prevBase) {
        utils.base.getBaseById.setData({baseId: ctx.baseId}, ctx.prevBase);
        utils.table.getTableByBaseId.setData({ baseId: ctx.baseId }, ctx.prevTables);
      }
      toast.error("Error on deleting table");
    },

    onSuccess: () => {
      toast.success("Table moved to trash.");
    },

    onSettled: (_data, _error, _variables, ctx) => {
      void utils.table.getTableByBaseId.invalidate({ baseId: ctx?.baseId });
    }
  });

  const addRow = api.row.createRow.useMutation({
    onSuccess: () => {
      toast.success("Row created successfully!");
      void utils.row.getRowsByOperation.invalidate({
        tableId: activeTableId!,
        filters: filters,
        sorts: sorts,
      });
    },
    onError: () => {
      toast.error("Error creating row.");
    },
  });


  const deleteRow = api.row.deleteRow.useMutation({
    onSuccess: () => {
      toast.success("Row deleted successfully!");
      void utils.row.getRowsByOperation.invalidate({
        tableId: activeTableId!,
        filters: filters,
        sorts: sorts,
      });
    },
    onError: () => {
      toast.error("Error deleting row.");
    },
  });

  const addColumn = api.column.createColumn.useMutation({
    onSuccess: () => {
      toast.success("Column created successfully!");
      void utils.table.getTableById.invalidate({ tableId: activeTableId });
      void utils.row.getRowsByOperation.invalidate({
        tableId: activeTableId!,
        filters: filters,
        sorts: sorts,
      });
    },
    onError: () => {
      toast.error("Error creating column.");
    },
  });


  const deleteColumn = api.column.deleteColumn.useMutation({
    onSuccess: () => {
      toast.success("Column deleted successfully!");
      void utils.table.getTableById.invalidate({ tableId: activeTableId });
      void utils.row.getRowsByOperation.invalidate({
        tableId: activeTableId!,
        filters: filters,
        sorts: sorts,
      });
    },
    onError: () => {
      toast.error("Error deleting column.");
    },
  });

   useEffect(() => {
    if (isTableLoading) {
      return;
    }
    if (!tableData || tableData.length === 0) {
      setActiveTableId(undefined);
    }
    else{
      setActiveTableId((prev) => {
        const tableStillExist = prev && tableData.some(t => t.id === prev);
        const newActiveTableId = tableStillExist ? prev : tableData[0]?.id ?? undefined;
        if (newActiveTableId !== prev) {
          setFilters([]);
          setSorts([]);
        }
        return newActiveTableId;
      })
    } 
  }, [tableData, isTableLoading]);

  useEffect(() => {
    if (!activeTableData?.column) return;
    setColumnVisibility(prev => {
      const next: Record<string, boolean> = {};
      for (const c of activeTableData.column) next[c.id] = prev[c.id] ?? true;
      return next;
    });
  }, [activeTableData?.column?.map(c => c.id).join(",")]);

  const handleToggleColumn = useCallback((colId: string, visible: boolean) => {
    setColumnVisibility(prev => ({ ...prev, [colId]: visible }));
  }, []);

  const handleShowAllColumns = useCallback(() => {
    if (!activeTableData?.column) return;
    setColumnVisibility(Object.fromEntries(activeTableData.column.map(c => [c.id, true])));
  }, [activeTableData?.column?.map(c => c.id).join(",")]);

  const handleHideAllColumns = useCallback(() => {
    if (!activeTableData?.column) return;
    setColumnVisibility(Object.fromEntries(activeTableData.column.map(c => [c.id, false])));
  }, [activeTableData?.column?.map(c => c.id).join(",")]);

  const transformRows = useMemo<FlattenedRow[]>(() => {
    const src: Row[] = opRows ?? [];
    return src.map((r) => {
      const flat: Record<string, CellPrimitive> = {};
      const cells = r.cell ?? r.cells ?? []; 
      for (const c of cells) {
        flat[c.columnId] =
          (c.stringVal as CellPrimitive) ??
          (typeof c.intVal === "number" ? (c.intVal as CellPrimitive) : null);
      }
      return { id: r.id, ...flat };
    });
  }, [opRows, activeTableData]);

  const handleCellNavigation = useCallback((direction: 'up' | 'down' | 'left' | 'right' | 'tab' | 'shift-tab') => {
    if (!focusedCell || !activeTableData) return;

    const rows = transformRows;
    const columns = activeTableData.column;
    
    const currentRowIndex = rows.findIndex(row => row.id === focusedCell.rowId);
    const currentColIndex = columns.findIndex(col => col.id === focusedCell.columnId);
    
    if (currentRowIndex === -1 || currentColIndex === -1) return;

    let newRowIndex = currentRowIndex;
    let newColIndex = currentColIndex;

    switch (direction) {
      case 'up':
        newRowIndex = Math.max(0, currentRowIndex - 1);
        break;
      case 'down':
        newRowIndex = Math.min(rows.length - 1, currentRowIndex + 1);
        break;
      case 'left':
      case 'shift-tab':
        newColIndex = Math.max(0, currentColIndex - 1);
        break;
      case 'right':
      case 'tab':
        newColIndex = Math.min(columns.length - 1, currentColIndex + 1);
        break;
    }

    const newRowId = rows[newRowIndex]?.id;
    const newColumnId = columns[newColIndex]?.id;

    if (newRowId && newColumnId) {
      setFocusedCell({ rowId: newRowId, columnId: newColumnId });
    }
  }, [focusedCell, transformRows, activeTableData]);


  const transformColumns = useMemo<ColumnDef<FlattenedRow, CellPrimitive>[]>(() => {
    if (!activeTableData || !activeTableData?.column) {
      return [];
    };

    return activeTableData.column.map((col) => ({
      accessorKey: col.id,
      header: col.name,
      cell: ({getValue, row}) => {
        const v = getValue();
        const rowId = row.original.id;
        const isFocused = focusedCell?.rowId === rowId && focusedCell?.columnId === col.id;

        return (
        <EditableCell
          initialValue={v}
          tableId={activeTableId!}
          rowId={rowId}
          columnId={col.id}
          isFocused={isFocused}
          onNavigate={handleCellNavigation}
          onFocusCell={(rId, cId) => setFocusedCell({ rowId: rId, columnId: cId })}
        />
      );
      },
    }))
  }, [activeTableData]);

  const table = useReactTable({
    data: transformRows,
    columns: transformColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  })

  const handleCreateTable = (baseId: string) => {
    createTable.mutate({ baseId });
  }

  const handleDeleteTable = (baseId: string, tableId: string) => {
    deleteTable.mutate({ baseId, tableId });
  }

  const handleAddRow = (tableId: string) => {
    addRow.mutate({tableId});
  }

  const handleDeleteRow = (rowId: string) => {
    deleteRow.mutate({rowId});
  }

  const handleCreateColumn = (tableId: string, name: string, stringVal: boolean, intVal: boolean) =>{
    addColumn.mutate({tableId, name, stringVal, intVal});
  }

  const handleDeleteColumn = (tableId: string, columnId: string) => {
    deleteColumn.mutate({tableId, columnId});
  }

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


        {tableData && baseIdString && (
          <TableTabs
            tableData={tableData}
            baseId={baseIdString}
            activeTableId={activeTableId}
            createTablePending={createTable.isPending}
            setActiveTable={setActiveTableId}
            handleCreateTable={handleCreateTable}
            handleDeleteTable={handleDeleteTable}
          />
        )}

        {activeTableData && activeTableData.column.length > 0 && (
          <FunctionBar
            columns={activeTableData?.column ?? []}
            filters={filters}
            sorts={sorts}
            filterLogic={filterLogic}
            onFilterChange={setFilters}
            onSortChange={setSorts}
            onFilterLogicChange={setFilterLogic}

            columnVisibility={columnVisibility}
            onToggleColumn={handleToggleColumn}
            onShowAllColumns={handleShowAllColumns}
            onHideAllColumns={handleHideAllColumns}
          />
        )}

        <main className="flex-1 min-h-0 flex">
          <div className=" flex flex-col w-[280px] p-3 text-gray-900 border-r border-gray-200 gap-1">
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
            <div className="flex-1 bg-slate-100">
              {isTableLoading ? (
                <div className="flex items-center justify-center min-h-screen">
                  <LoadingState text="Loading table data" />
                </div>
              ) : (
                <div className="inline-flex flex flex-col w-full">
                  <table className="bg-white text-[13px]">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header, i) => (
                            <th
                              key={header.id}
                              style={{width: header.getSize()}}
                              className={`border ${i === 0 ? "border-l-0" : ""} text-left border-t-0 border-gray-300 px-2 py-2 font-semibold hover:bg-gray-100`}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setDeleteMenu({
                                  type: "column",
                                  id: header.column.id,
                                  x: e.clientX,
                                  y: e.clientY,
                                });
                              }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                          {transformColumns.length > 0 && !isRowsLoading && (
                            <th className="border border-t-0 border-gray-300 px-2 py-2 font-semibold text-center w-10 hover:bg-gray-100 cursor-pointer"
                                onClick={() => setCreateColumn(true)}
                            >
                              <Plus className="w-4 h-4 text-gray-600 inline" />
                            </th>
                          )}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}
                            className="hover:bg-gray-100"
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setDeleteMenu({
                                type: "row",
                                id: row.original.id,
                                x: e.clientX,
                                y: e.clientY,
                              })
                            }}>
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}
                                style={{ width: cell.column.getSize?.() }}
                                className=" border border-l-0 border-gray-300 px-3 py-4">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => activeTableId && handleAddRow(activeTableId)}
                      >
                        {transformColumns.length > 0 && !isRowsLoading && (
                          <td
                            colSpan={table.getVisibleLeafColumns().length}
                            className="border border-l-0 border-gray-300"
                          >
                            <div className="flex items-center gap-2 text-gray-600 px-3 py-4">
                              <Plus className="w-3.5 h-3.5"/>
                              <span>Add row</span>
                            </div>
                          </td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                  
                  {activeTableId && (
                    <CreateColumn
                      tableId={activeTableId}
                      isCreateColumn={isCreateColumn}
                      onClose={() => setCreateColumn(false)}
                      onCreateColumn={handleCreateColumn}
                    />
                  )}

                  {deleteMenu && (
                    <div
                      className="absolute z-50 bg-white border border-gray-200 shadow-md rounded-md"
                      style={{ top: deleteMenu.y, left: deleteMenu.x }}
                    >
                      {deleteMenu.type === "row" && (
                        <div className="flex flex-col">
                          <button className="px-3 py-2 text-[12.5px] text-center w-full bg-white hover:bg-gray-100"
                                  onClick={() => {
                                    if (deleteMenu.id){
                                      handleDeleteRow(deleteMenu.id);
                                    }
                                    setDeleteMenu({type: null});
                                  }}>
                            Delete row
                          </button>
                          <button className="px-3 py-2 text-red-500 text-[12.5px] text-center w-full bg-white hover:bg-gray-100"
                                  onClick={() => setDeleteMenu({type: null})}>
                            Cancel
                          </button>
                        </div>
                      )}

                      {deleteMenu.type === "column" && (
                        <div className="flex flex-col">
                          <button className="px-4 py-2 text-[12.5px] text-center w-full bg-white hover:bg-gray-100"
                                  onClick={() => {
                                    if (deleteMenu.id && activeTableId){
                                      handleDeleteColumn(activeTableId, deleteMenu.id);
                                    }
                                    setDeleteMenu({type: null});
                                  }}>
                            Delete column
                          </button>
                          <button className="px-4 py-2 text-red-500 text-[12.5px] text-center w-full bg-white hover:bg-gray-100"
                                  onClick={() => setDeleteMenu({type: null})}>
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}


                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

