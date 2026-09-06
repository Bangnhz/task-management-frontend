import React, { useState } from "react";
import ProjectService from "../../services/project.service";
import type { ProjectCreateRequestDTO, ProjectVisibility } from "../../types/project";
import { Plus } from "lucide-react";

interface CreateProjectFormProps {
  workspaceId?: number;
  workspaces?: { id: number; name: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateProjectForm({ 
  workspaceId: initialWorkspaceId, 
  workspaces = [], 
  onSuccess, 
  onCancel 
}: CreateProjectFormProps) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | undefined>(
    initialWorkspaceId || (workspaces.length > 0 ? workspaces[0].id : undefined)
  );
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<ProjectVisibility>('PUBLIC');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const wsId = initialWorkspaceId || selectedWorkspaceId;
    if (!wsId) {
      setError('Please select a Workspace');
      return;
    }
    if (!title.trim() || isCreating) return;

    setIsCreating(true);
    setError(null);
    try {
      const payload: ProjectCreateRequestDTO = {
        title: title.trim(),
        visibility: visibility || 'PUBLIC'
      };
      await ProjectService.createProject(wsId, payload);
      setTitle('');
      onSuccess?.();
    } catch (err: any) {
      console.error('❌ Failed to create project:', err);
      setError(err?.response?.data?.message || 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Select Workspace if not pre-specified */}
      {!initialWorkspaceId && workspaces.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select Workspace <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedWorkspaceId}
            onChange={(e) => setSelectedWorkspaceId(Number(e.target.value))}
            disabled={isCreating}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Project Name <span className="text-red-500">*</span>
        </label>
        <input 
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter project name..."
          required
          disabled={isCreating}
          autoFocus
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Visibility
        </label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as ProjectVisibility)}
          disabled={isCreating}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="PUBLIC">🌐 PUBLIC - Public access</option>
          <option value="WORKSPACE">🏢 WORKSPACE - Workspace members</option>
          <option value="PRIVATE">🔒 PRIVATE - Private only</option>
        </select>
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isCreating}
            className="flex-1 px-4 py-2 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!title.trim() || isCreating}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>{isCreating ? 'Creating...' : 'Create Project'}</span>
        </button>
      </div>
    </form>
  );
}