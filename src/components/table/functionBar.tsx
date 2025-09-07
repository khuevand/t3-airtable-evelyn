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
import FilterBar from "./Function/filter";
import SortBar from "./Function/sort";

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

  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortColId, setSortColId] = useState<string>(columns?.[0]?.id ?? "");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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
            <FilterBar
              columns={columns}
              filters={filters}
              filterLogic={filterLogic}
              onFilterChange={onFilterChange}
              onFilterLogicChange={onFilterLogicChange}/>
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
            <SortBar
              columns={columns}
              sorts={sorts}
              onSortChange={onSortChange}/>
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
  );
}
