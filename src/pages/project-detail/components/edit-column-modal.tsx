import React from 'react';
import ColumnModal from './column-modal';

interface EditColumnModalProps {
  id: number;
  currentTitle: string;
  currentIsDone?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditColumnModal({
  id,
  currentTitle,
  currentIsDone = false,
  isOpen,
  onClose,
  onSuccess,
}: EditColumnModalProps) {
  return (
    <ColumnModal
      mode="edit"
      id={id}
      currentTitle={currentTitle}
      currentIsDone={currentIsDone}
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
