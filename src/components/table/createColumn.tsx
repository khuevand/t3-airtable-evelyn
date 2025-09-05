import { useState } from 'react';

interface ColumnCreationFormProps {
	tableId: string,
  isCreateColumn: boolean;
  onClose: () => void;
  onCreateColumn: (tableId: string, name: string, isText: boolean, isNumber: boolean) => void;
}

export function CreateColumn({ 
	tableId,
  isCreateColumn, 
  onClose, 
  onCreateColumn 
}: ColumnCreationFormProps) {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState<'text' | 'number'>('text');

  const handleCreate = () => {
    if (columnName.trim()) {
      onCreateColumn(
				tableId,
        columnName.trim(), 
        columnType === 'text', 
        columnType === 'number'
      );
      handleClose();
    }
  };

  const handleClose = () => {
    setColumnName('');
    setColumnType('text');
    onClose();
  };

  if (!isCreateColumn) return null;

  return (
    <div className="absolute z-50 bg-white border shadow-lg rounded-lg p-3 right-0">
      <input
        type="text"
        placeholder="Column name"
        value={columnName}
        onChange={(e) => setColumnName(e.target.value)}
        className="border border-gray-300 px-2 py-1.5 rounded w-full mb-2 text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter' && columnName.trim()) {
            handleCreate();
          } else if (e.key === 'Escape') {
            handleClose();
          }
        }}
      />
      
      <div className="flex gap-1 mb-2">
        <button
          onClick={() => setColumnType('text')}
          className={`px-2 py-1 text-xs rounded ${
            columnType === 'text' 
              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Text
        </button>
        <button
          onClick={() => setColumnType('number')}
          className={`px-2 py-1 text-xs rounded ${
            columnType === 'number' 
              ? 'bg-blue-100 text-blue-700 border border-blue-300' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Number
        </button>
      </div>
      
      <div className="flex gap-1">
        <button
          onClick={handleCreate}
          disabled={!columnName.trim()}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex-1"
        >
          Create
        </button>
        <button
          onClick={handleClose}
          className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}