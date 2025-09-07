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

type SortDir = "asc" | "desc";

type Sort = { columnId: string; direction: SortDir };

interface SortProps {
 columns: Column[],
 sorts: Sort[];
 onSortChange: (sort: Sort[]) => void;
}

export default function SortBar({
  columns,
  sorts,
  onSortChange,
}: SortProps){
  const [sortColId, setSortColId] = useState<string>(columns?.[0]?.id ?? "");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

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

  return (
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
  );
}