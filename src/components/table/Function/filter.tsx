import {
  ChevronDown,
  Trash2,
  Plus,
} from "lucide-react";
import { useState, useMemo } from "react";


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


type filterLogic = "AND" | "OR";

type Filter = { columnId: string; type: FilterType; value?: string | number | null };

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

interface FilterProps {
 columns: Column[],
 filters: Filter[];
 filterLogic: filterLogic,
 onFilterChange: (filter: Filter[]) => void;
 onFilterLogicChange: (filterLogic: filterLogic) => void;
}

export default function FilterBar({
  columns,
  filters,
  filterLogic,
  onFilterChange,
  onFilterLogicChange,
}: FilterProps){
    const [selectedFilterColId, setSelectedFilterColId] = useState<string>(columns?.[0]?.id ?? "");
    const [filterType, setFilterType] = useState<FilterType>("contains");
    const [filteredValue, setFilteredValue] = useState<string>("");

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

    return (
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
  )
}
