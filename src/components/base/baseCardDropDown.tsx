import React, { useState } from 'react';
import {
  Pen,
  Copy,
  ArrowRight,
  Users,
  Paintbrush,
  Trash,
} from "lucide-react";

interface BaseDropdownProps {
  baseId: string;
  onDelete: (baseId: string) => void;
  onRename: (baseId: string, baseName: string) => void;
  onClose: () => void;

}

export const BaseDropdown: React.FC<BaseDropdownProps> = ({
  baseId,
  onDelete,
  onRename,
  onClose,
}) => {
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(baseId);
    onClose();
  };

  const handleRenameBase = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt("Enter new base name:");
    if (newName && newName.trim()) {
      onRename(baseId, newName.trim());
    }
    onClose();
  }

  const handleMenuItemClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="absolute top-full right-0 mt-1 w-60 rounded-lg text-[13px] text-gray-800 bg-white shadow-lg border border-gray-300 z-20"
    >
      <div className="flex flex-col text-left p-2 gap-0.5">
        <button 
          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 w-full text-left"
          onClick={handleRenameBase}
        >
          <Pen className="w-4 h-4"/>
          <span>Rename</span>
        </button>
        
        <button 
          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 w-full text-left"
          onClick={handleMenuItemClick}
        >
          <Copy className="w-4 h-4"/>
          <span>Duplicate</span>
        </button>
        
        <button 
          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 w-full text-left"
          onClick={handleMenuItemClick}
        >
          <ArrowRight className="w-4 h-4"/>
          <span>Move</span>
        </button>
        
        <button 
          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 w-full text-left"
          onClick={handleMenuItemClick}
        >
          <Users className="w-4 h-4"/>
          <span>Go to workspace</span>
        </button>
        
        <button 
          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 w-full text-left"
          onClick={handleMenuItemClick}
        >
          <Paintbrush className="w-4 h-4"/>
          <span>Customize appearance</span>
        </button>
        
        <div className="mx-1 mt-1 border-b border-gray-200"/>
        
        <button 
          className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 w-full text-left"
          onClick={handleDeleteClick}
        >
          <Trash className="w-4 h-4"/>
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};