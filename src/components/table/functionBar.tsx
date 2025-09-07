import {
  EyeOff,
  ListFilter,
  ArrowUpDown,
  X,
  Search,
  Menu,
  Grid3X3,
  ChevronDown,
  Trash2,
  ToggleLeft,
  ToggleRight,
  PaintBucket,
  SquareArrowOutUpRight,
  Logs,
  Plus,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";


interface Column {
  id: string;
  name: string;
  stringVal: boolean;
  intVal: boolean;
}

type FilterType =
  "is"
  | "is not"
  | "contains"
  | "does not contain"
  | "is empty"
  | "is not empty"
  | "greater than"
  | "lesser than";


type SortDir = "asc" | "desc";
type filterLogic = "AND" | "OR";

type Filter = { columnId: string; type: FilterType; value?: string | number | null };
type Sort = { columnId: string; direction: SortDir };


const FilterTypeOptions: FilterType[] = [
  "is",
  "is not",
  "contains",
  "does not contain",
  "is empty",
  "is not empty",
  "greater than",
  "lesser than",
];


interface FunctionBarProps {
 columns: Column[],
 filters: Filter[];
 sorts: Sort[];
 filterLogic: filterLogic,
 onFilterChange: (filter: Filter[]) => void;
 onSortChange: (sort: Sort[]) => void;
 onFilterLogicChange: (filterLogic: filterLogic) => void;
}

export default function FunctionBar({
  columns,
  filters,
  sorts,
  filterLogic,
  onFilterChange,
  onSortChange,
  onFilterLogicChange,
}: FunctionBarProps){
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilterColId, setSelectedFilterColId] = useState<string>(columns?.[0]?.id ?? "");
  const [filterType, setFilterType] = useState<FilterType>("contains");
  const [filteredValue, setFilteredValue] = useState<string>("");


  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortColId, setSortColId] = useState<string>(columns?.[0]?.id ?? "");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const emptyFilterChoice = filterType === "is empty" || filterType === "is not empty";
  const isNumericChoice = filterType === "greater than" || filterType === "lesser than";

  
  const canAddFilter = useMemo(() => {
    if (!selectedFilterColId){
      return false;
    }
    if (emptyFilterChoice){
      return true;
    }
    if (filterType === "greater than" || filterType === "lesser than"){
      if (filteredValue.trim() === ""){
        return false;
      }
      return !Number.isNaN(Number(filteredValue));
    }
    return filteredValue.trim().length > 0;
  }, [selectedFilterColId, filterType, filteredValue]);


  const addFilterRules = () => {
    if (!canAddFilter){
      return false;
    }
    onFilterChange([...filters, {columnId: selectedFilterColId, type: filterType, value: filteredValue}]);
    setFilteredValue("");
  };


   const removeFilter = (index: number) => {
    const next = filters.filter((_,i) => i != index);
    return onFilterChange(next);
  };

  const clearAllFilters = () => {
    onFilterChange([]);
  };

  const unusedSortCols = useMemo(
    () => columns.filter((c) => !sorts.some((s) => s.columnId === c.id)),
    [columns, sorts]
  );

  useEffect(() => {
    if (!sortColId || !unusedSortCols.some((c) => c.id === sortColId)) {
      setSortColId(unusedSortCols[0]?.id ?? "");
    }
  }, [unusedSortCols, sortColId]);
  
  const canAddSort = useMemo(() =>
    Boolean(sortColId && sortDir && unusedSortCols.length > 0),
   [sortColId, sortDir, unusedSortCols]);

  const addSortRules = () => {
    if (!canAddSort){
      return;
    }
    onSortChange([...sorts, {columnId: sortColId, direction: sortDir}]);
  };

  const removeSort = (index: number) => {
    const next = sorts.filter((_,i) => i != index);
    return onSortChange(next);
  }

  const clearAllSorts = () => {
    onSortChange([]);
  };


  return (
    <div className="flex items-center justify-between border-b border-gray-200 py-2.5">
      <div className="flex items-center gap-2 ml-3">
        <div className="px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <Menu className="w-3.5 h-3.5 text-gray-500 "/>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <Grid3X3 className="w-3.5 h-3.5 text-blue-500"/>
          <span className="text-[12.5px] font-semibold">Grid View</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500"/>
        </div>
      </div>


      <div className="flex items-center gap-2 mr-3">
        <button className="flex items-center text-gray-600 gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <EyeOff className="w-3.5 h-3.5"/>
          <span className="text-gray-600 text-[12.5px]">Hide fields</span>
        </button>


        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer ${
              filters.length > 0 ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            <Logs className="w-3.5 h-3.5"/>
            <span className="text-[12.5px]">
              Filter {filters.length > 0 && `(${filters.length})`}
            </span>
            {filters.length > 0 && <X className="w-3 h-3 ml-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        clearAllFilters();
                                        }}
                                    />
            }
          </button>


          {showFilterMenu && (
            <div className="absolute z-50 top-full mt-1 right-0 bg-white border border-gray-200 shadow-lg rounded-md p-3">
              <div className="flex flex-col gap-2 text-left p-1 text-[12.5px]">
                <span className="text-gray-600">In this view, show records</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">Where</span>

                  <select
                    className="px-2 py-1 border border-gray-200 rounded-md text-[12.5px] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={selectedFilterColId}
                    onChange={(e) => setSelectedFilterColId(e.target.value)}
                  >
                    {columns?.length ? (
                      columns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No columns</option>
                    )}
                  </select>


                  {/* Filter type dropdown */}
                  <select
                    className="px-2 py-1 border border-gray-200 rounded-md text-[12.5px] bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                  >
                    {FilterTypeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  {!emptyFilterChoice && (
                    <input
                      className="px-2 py-1 border border-gray-200 rounded-md w-40 bg-white placeholder:text-gray-400"
                      placeholder={ isNumericChoice ? "Enter number" : "Enter value"
                      }
                      value={filteredValue}
                      onChange={(e) => setFilteredValue(e.target.value)}
                      inputMode={isNumericChoice ? "decimal" : "text"}
                    />
                  )}

                  <button
                    onClick={addFilterRules}
                    disabled={!canAddFilter}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

              {filters.length > 0 && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <button
                      onClick={() => onFilterLogicChange(filterLogic === "AND" ? "OR" : "AND")}
                      className="flex px-2 py-1 border border-gray-100 hover:bg-gray-50"
                    >
                      {filterLogic === "AND" ? (
                        <div className="flex items-center gap-2">
                           <span>AND</span>
                            <ChevronDown className="w-3.5 h-3.5"/>
                        </div>

                      ) : (
                         <div className="flex items-center gap-2">
                           <span>OR</span>
                            <ChevronDown className="w-3.5 h-3.5"/>
                        </div>
                      )}
                    </button>
                  </div>

                  {filters.map((r, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-2 py-1">
                      <select className="px-2 py-1 border border-gray-200 rounded-md bg-white"
                              value={r.columnId}
                              onChange={(e) => {
                          const existFilter = [...filters];
                          if (existFilter[idx] === undefined) return;
                          existFilter[idx] = { ...existFilter[idx], columnId: e.target.value };
                          onFilterChange(existFilter);
                        }}
                      >
                        {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>

                       <select
                        className="px-2 py-1 border border-gray-200 rounded-md bg-white"
                        value={r.type}
                        onChange={(e) => {
                          const existFilter = [...filters];
                          const newType = e.target.value as FilterType; 
                          if (existFilter[idx] === undefined) return;
                          existFilter[idx] = {
                            columnId: existFilter[idx].columnId ?? "",
                            type: newType,
                            value: (newType === "is empty" || newType === "is not empty") 
                              ? null 
                              : existFilter[idx].value ?? ""
                          };
                          onFilterChange(existFilter);
                        }}
                      >
                        {FilterTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>

                      {!(r.type === "is empty" || r.type === "is not empty") && (
                        <input
                          className="px-2 py-1 border border-gray-200 rounded-md w-40 bg-white placeholder:text-gray-400"
                          placeholder={(r.type === "greater than" || r.type === "lesser than") ? "Enter number" : "Enter value"}
                          value={r.value === null || typeof r.value === "undefined" ? "" : String(r.value)}
                          onChange={(e) => {
                            const existFilter = [...filters];
                            const raw = e.target.value;
                            const isNum = r.type === "greater than" || r.type === "lesser than";
                            if (existFilter[idx] === undefined) return;
                            existFilter[idx] = { 
                              columnId: existFilter[idx].columnId,
                              type: existFilter[idx].type,
                              value: isNum ? (raw === "" ? "" : Number(raw)) : raw 
                            };
                            onFilterChange(existFilter);
                          }}
                          inputMode={(r.type === "greater than" || r.type === "lesser than") ? "decimal" : "text"}
                        />
                      )}

                      <button onClick={() => removeFilter(idx)} className="p-1 rounded hover:bg-red-50 text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              </div>
            </div>
          )}
        </div>


        <button className="flex items-center text-gray-600 gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <ListFilter className="w-3.5 h-3.5"/>
          <span className="text-gray-600 text-[12.5px]">Group</span>
        </button>


        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer ${
              sorts.length > 0 ? "bg-blue-100 text-blue-700" : "text-gray-600"
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="text-[12.5px]">Sort</span>
            {sorts.length > 0 && (
              <X
                className="w-3 h-3 ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllSorts();
                }}
              />
            )}
          </button>


          {showSortMenu && (
            <div className="absolute z-50 top-full mt-1 right-0 bg-white border border-gray-200 shadow-lg rounded-md p-3">
              <div className="flex flex-col gap-2 text-left p-1 text-[12.5px]">
                <span className="text-gray-600">Sort by:</span>
                <div className="flex items-center gap-2">
                  <select className="px-2 py-1 border border-gray-200 rounded-sm hover:bg-gray-100 cursor-pointer"
                          value={sortColId}
                          onChange={(e) => setSortColId(e.target.value)}
                          disabled={unusedSortCols.length === 0}>
                    {unusedSortCols.length > 0 ? (
                      unusedSortCols.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <option value="">All columns are already sorted</option>
                    )}
                  </select>

                  <select className="px-2 py-1 border border-gray-200 rounded-sm hover:bg-gray-100 cursor-pointer"
                          value={sortDir}
                          onChange={(e) => setSortDir(e.target.value as SortDir)}>
                    <option value="asc">A → Z / 0 → 9</option>
                    <option value="desc">Z → A / 9 → 0</option>
                  </select>

                  <button
                    onClick={addSortRules}
                    disabled={!canAddSort}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add </span>
                  </button>
                </div>
                {sorts.length > 0 && (
                  <div className="flex flex-col gap-1">
                    {sorts.map((s, idx) => {
                      const usedByOthers = new Set(
                        sorts.filter((_, i) => i !== idx).map(x => x.columnId)
                      );

                      const availableForThisRow = columns.filter(
                        c => c.id === s.columnId || !usedByOthers.has(c.id)
                      );
                      return (
                        <div key={idx} className="flex items-center gap-2  py-1">
                          <select className="px-2 py-1 border border-gray-200 rounded-md bg-white"
                                  value={s.columnId}
                                  onChange={(e) => {
                                    const existSort = [...sorts];
                                    if (existSort[idx] === undefined) return;
                                    existSort[idx] = {...existSort[idx], columnId: e.target.value};
                                    onSortChange(existSort);
                                  }}>
                          {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>

                          <select className="px-2 py-1 border border-gray-200 rounded-md bg-white"
                                  value={s.direction}
                                  onChange={(e) => {
                                    const existSort = [...sorts];
                                    if (existSort[idx] === undefined) return;
                                    existSort[idx] = {...existSort[idx], direction: e.target.value as SortDir};
                                    onSortChange(existSort);
                                  }}>
                          <option value="asc">A → Z / 0 → 9</option>
                          <option value="desc">Z → A / 9 → 0</option>
                          </select>

                          <button className="p-1 rounded hover:bg-red-50 text-red-600"
                                  onClick={() => removeSort(idx)}>
                            <Trash2 className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      )
                  })}

                  </div>
                )}
              </div >
            </div>
          )}
        </div>




        <button className="flex items-center text-gray-600 gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <PaintBucket className="w-3.5 h-3.5"/>
          <span className="text-gray-600 text-[12.5px]">Color</span>
        </button>


        <button className="flex items-center text-gray-600 gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <SquareArrowOutUpRight className="w-3.5 h-3.5"/>
          <span className="text-gray-600 text-[12.5px]">Share and sync</span>
        </button>


        <button className="flex items-center text-gray-600 px-1.5 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
          <Search className="w-3.5 h-3.5"/>
        </button>
      </div>
    </div>
  )
}





