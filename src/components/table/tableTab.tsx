import {ChevronDown, Plus} from "lucide-react";
import { useState } from "react";
import LoadingState from "../loadingState";

interface Table {
	name: string;
	id: string;
	createdAt: Date;
	baseId: string;
	columnSequence: number;
}

interface TableTabsProps {
	tableData: Table[],
	baseId: string,
	activeTableId: string | undefined,
	createTablePending: boolean,
	setActiveTable: (tableId: string) => void;
	handleCreateTable: (baseId: string) => void;
	handleDeleteTable: (baseId:string, tableId: string) => void;
}


export default function TableTabs({ 
	tableData,
	baseId,
  activeTableId,
	createTablePending,
  setActiveTable, 
  handleCreateTable,
	handleDeleteTable,
}: TableTabsProps){

	const [tableDropDownMenuId, setTableDropDownMenuId] = useState<string | undefined>(undefined);

  return (
    <div
      className="flex items-center border-gray-200 text-[12.5px] bg-pink-100"
    >
      {tableData.map((table) => (
        <div key={table.id} className="relative border-r border-gray-200">
          <div
            className={`flex items-center px-4 py-1 rounded-t-md border border-gray-200 cursor-pointer ${
              table.id === activeTableId
                ? "bg-white text-black border-b-white font-semibold"
                : "text-gray-500 hover:text-black border-transparent"
            }`}
          >
            <button onClick={() => setActiveTable(table.id)} className="mr-1">
              {table.name}
            </button>
            <ChevronDown
              size={16}
              className="text-gray-500 hover:text-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                setTableDropDownMenuId(table.id);
              }}
            />
          </div>

          {/* Table choice dropdown menu */}
          {tableDropDownMenuId === table.id && (
            <div
              className="absolute z-50 top-full mt-1 left-0 w-56 bg-white border border-gray-200 shadow-lg rounded-md p-1"
            >
              <ul className="text-sm text-gray-700">
                <li className="px-3 py-2 hover:bg-gray-50 cursor-pointer">Import data</li>
                <li className="px-3 py-2 hover:bg-gray-50 cursor-pointer">Rename table</li>
                <li className="px-3 py-2 hover:bg-gray-50 cursor-pointer">Hide table</li>
                <li className="px-3 py-2 hover:bg-gray-50 cursor-pointer">Manage fields</li>
                <li className="px-3 py-2 hover:bg-gray-50 cursor-pointer">Duplicate table</li>
                <li className="px-3 py-2 hover:bg-gray-50 cursor-pointer">Configure date dependencies</li>
                <li className="px-3 py-2 hover:bg-gray-50 cursor-pointer">Edit table description</li>
                <li className="px-3 py-2 hover:bg-gray-50 cursor-pointer">Edit table permissions</li>
                <li
                  className="px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer"
                  onClick={() => handleDeleteTable(baseId, table.id)}
                >
                  Delete table
                </li>
              </ul>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => handleCreateTable(baseId)}
        disabled={createTablePending}
        className={`flex items-center ml-2 px-2 py-1 text-[14px] cursor-pointer transition-colors ${
          createTablePending 
            ? "text-gray-400 cursor-not-allowed" 
            : "text-gray-600 hover:text-gray-700"
        }`}
      >
        {createTablePending ? (
          <>
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin mr-1" />
            <LoadingState text="Creating table"/>
          </>
        ) : (
					<div className="flex items-center text-[14px] text-gray-600 gap-1">
						<Plus className="w-3.5 h-3.5"/>
						<span>Add or import</span>
					</div>
        )}
      </button>
    </div>
  );
}