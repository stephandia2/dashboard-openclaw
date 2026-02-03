import React, { useState, useEffect } from 'react';
import { useApi, apiPost, apiPut, apiDelete } from '../hooks/useApi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

const COLUMNS = {
  todo: { label: 'À faire', color: 'bg-gray-700' },
  in_progress: { label: 'En cours', color: 'bg-blue-900/50' },
  done: { label: 'Terminé', color: 'bg-green-900/50' },
};

const PRIORITIES = {
  low: { label: 'Basse', color: 'text-green-400' },
  medium: { label: 'Moyenne', color: 'text-yellow-400' },
  high: { label: 'Haute', color: 'text-red-400' },
};

function SortableTask({ task, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-700 rounded-lg p-4 mb-3 cursor-move hover:shadow-lg transition-shadow group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-white font-medium">{task.title}</h4>
          {task.description && (
            <p className="text-gray-400 text-sm mt-1">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <span className={`text-xs font-medium ${PRIORITIES[task.priority]?.color || 'text-gray-400'}`}>
              {PRIORITIES[task.priority]?.label || task.priority}
            </span>
            {task.assignee && (
              <span className="text-xs text-gray-500">
                @{task.assignee}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="btn-icon text-gray-400 hover:text-white"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="btn-icon text-gray-400 hover:text-red-400"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function KanbanBoard() {
  const { data: tasks, loading, refetch } = useApi('/api/tasks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignee: '',
    status: 'todo',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overColumn = over.id;

    if (activeTask && COLUMNS[overColumn] && activeTask.status !== overColumn) {
      try {
        await apiPut(`/api/tasks/${activeTask.id}`, {
          ...activeTask,
          status: overColumn,
        });
        refetch();
      } catch (error) {
        console.error('Erreur lors du déplacement:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await apiPut(`/api/tasks/${editingTask.id}`, formData);
      } else {
        await apiPost('/api/tasks', formData);
      }
      setIsModalOpen(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assignee: '',
        status: 'todo',
      });
      refetch();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (taskId) => {
    if (confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
      try {
        await apiDelete(`/api/tasks/${taskId}`);
        refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      assignee: task.assignee || '',
      status: task.status,
    });
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      assignee: '',
      status: 'todo',
    });
    setIsModalOpen(true);
  };

  const tasksByColumn = {
    todo: tasks?.filter((t) => t.status === 'todo') || [],
    in_progress: tasks?.filter((t) => t.status === 'in_progress') || [],
    done: tasks?.filter((t) => t.status === 'done') || [],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Kanban Board</h1>
          <p className="text-gray-400 mt-1">
            Gérez vos tâches avec le système Kanban
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nouvelle tâche
        </button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(COLUMNS).map(([columnId, column]) => (
            <div
              key={columnId}
              id={columnId}
              className={`${column.color} rounded-lg p-4 min-h-[400px]`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">{column.label}</h3>
                <span className="badge-gray">
                  {tasksByColumn[columnId].length}
                </span>
              </div>
              <SortableContext
                items={tasksByColumn[columnId].map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {tasksByColumn[columnId].map((task) => (
                    <SortableTask
                      key={task.id}
                      task={task}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-icon text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Titre
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input h-24 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="input"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input"
                  >
                    <option value="todo">À faire</option>
                    <option value="in_progress">En cours</option>
                    <option value="done">Terminé</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Assigné à
                </label>
                <input
                  type="text"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  className="input"
                  placeholder="@username"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingTask ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default KanbanBoard;
