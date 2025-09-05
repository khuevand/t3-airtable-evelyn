import {
  EyeOff,
  ListFilter,
  ArrowUpDown,
  X,
  Search,
  Menu,
  Grid3X3,
  ChevronDown,
  ToggleLeft,
  ToggleRight,
  PaintBucket,
  SquareArrowOutUpRight,
  Logs,
  Plus,
} from "lucide-react";
import { useState } from "react";

interface Column {
  id: string;
  name: string;
  stringVal: boolean;
  intVal: boolean;
}

interface FunctionBarProps {
	columns: Column[],
	filter: Filter | null;
	sort: Sort | null;
	onFilterChange: (filter: Filter | null) => void;
	onSortChange: (sort: Sort | null) => void;
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

type Filter = { columnId: string; type: FilterType; value?: string | number | null };
type Sort = { columnId: string; direction: "asc" | "desc" };

export default function FunctionBar({
  columns,
	filter,
	sort,
	onFilterChange,
	onSortChange,
}: FunctionBarProps){
  const [showFilterMenu, setShowFilterMenu] = useState(false);
	const [showSortMenu, setShowSortMenu] = useState(false);

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

        {/* Filter Button with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer ${
              filter ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            <Logs className="w-3.5 h-3.5"/>
            <span className="text-[12.5px]">Filter</span>
            {filter && <X className="w-3 h-3 ml-1" onClick={(e) => {e.stopPropagation(); onFilterChange(null);}} />}
          </button>

          {showFilterMenu && (
            <div className="absolute z-50 top-full mt-1 right-0 w-64 bg-white border border-gray-200 shadow-lg rounded-md p-3">
              <div className="space-y-2">
                {/* Column Selection */}
                <div>
                  <label className="text-xs text-gray-600">Column:</label>
                  <select 
                    className="w-full mt-1 p-1 border border-gray-300 rounded text-sm"
                    value={filter?.columnId ?? ''}
                    onChange={(e) => {
                      const columnId = e.target.value;
                      if (columnId) {
                        onFilterChange({ columnId, type: 'contains', value: '' });
                      }
                    }}
                  >
                    <option value="">Select column</option>
                    {columns.map(col => (
                      <option key={col.id} value={col.id}>{col.name}</option>
                    ))}
                  </select>
                </div>

                {/* Filter Type */}
                {filter && (
                  <div>
                    <label className="text-xs text-gray-600">Type:</label>
                    <select 
                      className="w-full mt-1 p-1 border border-gray-300 rounded text-sm"
                      value={filter.type}
                      onChange={(e) => onFilterChange({...filter, type: e.target.value as FilterType})}
                    >
                      <option value="contains">contains</option>
                      <option value="does not contain">does not contain</option>
                      <option value="is">Is</option>
                      <option value="is not">Is not</option>
                      <option value="is empty">Is empty</option>
                      <option value="is not empty">Is not empty</option>
                      {columns.find(c => c.id === filter.columnId)?.intVal && (
                        <>
                          <option value="greater than">Greater than</option>
                          <option value="lesser than">Lesser than</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                {/* Filter Value */}
                {filter && !['is empty', 'is not empty'].includes(filter.type) && (
                  <div>
                    <label className="text-xs text-gray-600">Value:</label>
                    <input
                      className="w-full mt-1 p-1 border border-gray-300 rounded text-sm"
                      placeholder="Enter value"
                      type={columns.find(c => c.id === filter.columnId)?.intVal ? 'number' : 'text'}
                      onChange={(e) => onFilterChange({...filter, value: e.target.value})}
                    />
                  </div>
                )}

                {/* Clear Filter */}
                {filter && (
                  <button
                    onClick={() => {
                      onFilterChange(null);
                      setShowFilterMenu(false);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <button className="flex items-center text-gray-600 gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer">
          <ListFilter className="w-3.5 h-3.5"/>
          <span className="text-gray-600 text-[12.5px]">Group</span>
        </button>

        {/* Sort Button with Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowSortMenu(!showSortMenu)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer ${
              sort ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5"/>
            <span className="text-[12.5px]">Sort</span>
            {sort && <X className="w-3 h-3 ml-1" onClick={(e) => {e.stopPropagation(); onSortChange(null);}} />}
          </button>

          {showSortMenu && (
            <div className="absolute z-50 top-full mt-1 right-0 w-48 bg-white border border-gray-200 shadow-lg rounded-md p-2">
              {columns.map(col => (
                <div key={col.id} className="py-1">
                  <div className="text-xs font-medium text-gray-700 mb-1">{col.name}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onSortChange({ columnId: col.id, direction: 'asc' });
                        setShowSortMenu(false);
                      }}
                      className={`text-xs px-2 py-1 rounded ${
                        sort?.columnId === col.id && sort?.direction === 'asc' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      A → Z
                    </button>
                    <button
                      onClick={() => {
                        onSortChange({ columnId: col.id, direction: 'desc' });
                        setShowSortMenu(false);
                      }}
                      className={`text-xs px-2 py-1 rounded ${
                        sort?.columnId === col.id && sort?.direction === 'desc' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      Z → A
                    </button>
                  </div>
                </div>
              ))}
              
              {sort && (
                <div className="border-t pt-2 mt-2">
                  <button
                    onClick={() => {
                      onSortChange(null);
                      setShowSortMenu(false);
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Clear sort
                  </button>
                </div>
              )}
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