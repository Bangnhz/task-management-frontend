import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ColumnModal from './column-modal';

interface CreateColumnFormProps {
  projectId: string;
  onSuccess: () => void;
  buttonText?: string;
  placeholder?: string;
}

export default function CreateColumnForm({
  projectId,
  onSuccess,
  buttonText = 'Add Column',
}: CreateColumnFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex items-start w-72 shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 text-slate-600 hover:from-slate-100 hover:to-slate-200 hover:border-slate-400 hover:text-slate-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
          <span>{buttonText}</span>
        </button>
      </div>

      <ColumnModal
        mode="create"
        projectId={projectId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={onSuccess}
      />
    </>
  );
}
