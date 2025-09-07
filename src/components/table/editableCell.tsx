import {useState, useEffect, useCallback, useRef} from "react";
import { toast } from "react-toastify";
import { api } from "~/utils/api";

interface EditableCellProps {
  initialValue: string | number | null;
  tableId: string;
  rowId: string;
  columnId: string;
  isFocused?: boolean;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right' | 'tab' | 'shift-tab') => void;
  onFocusCell?: (rowId: string, columnId: string) => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  initialValue,
  tableId,
  rowId,
  columnId,
  isFocused,
  onNavigate,
  onFocusCell,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState<string>(initialValue === null || initialValue === undefined ? "" : String(initialValue));
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  const updateCell = api.cell.updateCell.useMutation({
    onSuccess: () => {
      setIsEditing(false);
    },
    onError: () => {
      setValue(initialValue === null || initialValue === undefined ? "" : String(initialValue));
      setIsEditing(false);
      toast.error("Error updating cell");
    }
  });
  
  useEffect(() => {
    if (isFocused && !isEditing) {
      cellRef.current?.focus();
    }
  }, [isFocused, isEditing]);
  
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = useCallback(async () => {
    if (!isEditing) {
      return;
    }
    
    const currentValue = initialValue === null || initialValue === undefined ? "" : String(initialValue);
    if (value === currentValue) {
      setIsEditing(false);
      return;
    }
    
    const trimmedValue = value.trim();
    const numberValue = Number(trimmedValue);
    const isNumber = !isNaN(numberValue) && isFinite(numberValue) && trimmedValue !== "";

    try {
      await updateCell.mutateAsync({
        columnId,
        rowId,
        intValue: isNumber ? Math.floor(numberValue) : undefined,
        stringValue: isNumber ? undefined : trimmedValue,
      });
    } catch (error) {
    }
  }, [value, initialValue, isEditing, updateCell, columnId, rowId]);

  const handleCancel = useCallback(() => {
    setValue(initialValue === null || initialValue === undefined ? "" : String(initialValue));
    setIsEditing(false);
  }, [initialValue]);

  const handleNavigation = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (isEditing) {
        void handleSave();
        setTimeout(() => {
          if (onNavigate) {
            onNavigate("down");
          }
        }, 0);
      } else {
        setIsEditing(true);
      }
    }
    else if (e.key === "Escape") {
      e.preventDefault();
      if (isEditing) {
        handleCancel();
      }
    }
    else if (e.key === "Tab") {
      e.preventDefault();
      if (isEditing) {
        void handleSave();
      }
      if (onNavigate) {
        const direction = e.shiftKey ? 'shift-tab' : 'tab';
        setTimeout(() => {
          onNavigate(direction);
        }, 0);
      }
    }
    else if (e.key === "ArrowUp") {
      if (!isEditing || inputRef.current?.selectionStart === 0) {
        e.preventDefault();
        if (isEditing) {
          void handleSave();
        }
        if (onNavigate) {
          setTimeout(() => {
            onNavigate("up");
          }, 0);
        }
      }
    }
    else if (e.key === "ArrowDown") {
      if (!isEditing || inputRef.current?.selectionStart === inputRef.current?.value.length) {
        e.preventDefault();
        if (isEditing) {
          void handleSave();
        }
        if (onNavigate) {
          setTimeout(() => {
            onNavigate("down");
          }, 0);
        }
      }
    }
    else if (e.key === "ArrowLeft") {
      if (!isEditing || inputRef.current?.selectionStart === 0) {
        e.preventDefault();
        if (isEditing) {
          void handleSave();
        }
        if (onNavigate) {
          setTimeout(() => {
            onNavigate("left");
          }, 0);
        }
      }
    }
    else if (e.key === "ArrowRight") {
      if (!isEditing || inputRef.current?.selectionStart === inputRef.current?.value.length) {
        e.preventDefault();
        if (isEditing) {
          void handleSave();
        }
        if (onNavigate) {
          setTimeout(() => {
            onNavigate("right");
          }, 0);
        }
      }
    }
    else if (!isEditing && (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete')) {
      e.preventDefault();
      setIsEditing(true);
      if (e.key === 'Backspace' || e.key === 'Delete') {
        setValue('');
      } else if (e.key.length === 1) {
        setValue(e.key);
      }
    }
  }, [handleSave, handleCancel, onNavigate, isEditing]);

  const handleBlur = useCallback(() => {
    if (isEditing) {
      void handleSave();
    }
  }, [handleSave, isEditing]);

  const handleCellClick = useCallback(() => {
    cellRef.current?.focus();
    onFocusCell?.(rowId, columnId);
  }, [onFocusCell, rowId, columnId]);

  const handleDoubleClick = useCallback(() => {
    onFocusCell?.(rowId, columnId);
    setIsEditing(true);
  }, [onFocusCell, rowId, columnId]);

  useEffect(() => {
    if (isFocused && !isEditing) {
      onFocusCell?.(rowId, columnId);
      cellRef.current?.focus();
    }
  }, [isFocused, isEditing, onFocusCell, rowId, columnId]);

  const displayValue = value ?? (typeof initialValue === 'number' ? initialValue.toString() : initialValue ?? "");

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleNavigation}
        className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={updateCell.isPending}
      />
    );
  }

  return (
    <div
      ref={cellRef}
      onClick={handleCellClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleNavigation}
      tabIndex={0}
      className={`w-full px-2 py-1 cursor-pointer hover:bg-gray-100 rounded min-h-[2rem] flex items-center focus:outline-none ${
        isFocused ? 'ring-2 ring-blue-300' : ''
      }`}
      title="Click to select, double-click to edit, use arrow keys or Tab to navigate"
    >
      {displayValue}
    </div>
  );
};