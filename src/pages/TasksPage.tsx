import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { formatDate } from '@/lib/utils';
import { Plus, Search, Calendar as CalIcon, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Task, TaskStatus } from '@/types/database';

const TASK_STAGES: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'pendente', label: 'A Fazer', color: '#64748B' },
  { id: 'em_progresso', label: 'Em Progresso', color: '#3B82F6' },
  { id: 'concluida', label: 'Concluído', color: '#22C55E' },
];

export function TasksPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => { loadTasks(); }, [user]);

  async function loadTasks() {
    if (!user) return;
    const { data } = await supabase.from('tasks').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
    if (data) setTasks(data as Task[]);
    setLoading(false);
  }

  const filteredTasks = useMemo(() => {
    if (!search) return tasks;
    return tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase()));
  }, [tasks, search]);

  const columns = useMemo(() => {
    return TASK_STAGES.map(stage => ({
      ...stage,
      tasks: filteredTasks.filter(t => t.status === stage.id),
    }));
  }, [filteredTasks]);

  async function updateTaskStatus(taskId: string, newStatus: TaskStatus) {
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    if (!error) {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    }
  }

  async function createTask(data: Partial<Task>) {
    if (!user) return;
    const { error } = await supabase.from('tasks').insert({
      ...data,
      profile_id: user.id,
      checklist: []
    });
    if (!error) {
      toast.success('Tarefa criada!');
      loadTasks();
      setShowNewModal(false);
    } else {
      toast.error('Erro ao criar tarefa');
    }
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from('tasks').delete().eq('id', deleteConfirmId);
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== deleteConfirmId));
      toast.success('Tarefa excluída');
    }
    setDeleteConfirmId(null);
  }

  function handleDrop(stageId: string) {
    if (draggedTask && draggedTask.status !== stageId) {
      updateTaskStatus(draggedTask.id, stageId as TaskStatus);
    }
    setDraggedTask(null);
  }

  const priorityColors: Record<string, string> = { baixa: '#64748B', media: '#3B82F6', alta: '#F59E0B', urgente: '#EF4444' };

  return (
    <motion.div className="leads-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="leads-header">
        <div>
          <h1>Tarefas</h1>
          <p>Gerencie as atividades da equipe</p>
        </div>
        <div className="leads-actions">
          <div className="leads-search">
            <Search size={16} />
            <input placeholder="Buscar tarefas..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="leads-add-btn" onClick={() => setShowNewModal(true)}>
            <Plus size={18} /> Nova Tarefa
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {columns.map(col => (
          <div
            key={col.id}
            className="kanban-column"
            onDragOver={e => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}
          >
            <div className="kanban-column-header">
              <div className="kanban-column-dot" style={{ background: col.color }} />
              <span className="kanban-column-title">{col.label}</span>
              <span className="kanban-column-count">{col.tasks.length}</span>
            </div>
            <div className="kanban-cards">
              {col.tasks.map(task => (
                <div
                  key={task.id}
                  className="kanban-card glass-card"
                  draggable
                  onDragStart={() => setDraggedTask(task)}
                  style={{ position: 'relative' }}
                >
                  <button 
                    type="button"
                    className="kanban-delete-btn"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteConfirmId(task.id); }}
                    title="Excluir tarefa"
                  >
                    <Trash2 size={14} />
                  </button>
                  <h4 style={{ paddingRight: 20 }}>{task.title}</h4>
                  {task.description && <span className="kanban-company">{task.description}</span>}
                  <div className="kanban-card-meta" style={{ marginTop: 12 }}>
                    <span className="kanban-meta-item" style={{ background: (priorityColors[task.priority] || '#64748B') + '1a', color: priorityColors[task.priority], borderRadius: 12, padding: '2px 8px' }}>
                      <AlertCircle size={10} style={{ marginRight: 4 }} /> {task.priority}
                    </span>
                    {task.due_date && (
                      <span className="kanban-meta-item">
                        <CalIcon size={12} /> {formatDate(task.due_date)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {col.tasks.length === 0 && (
                <div className="kanban-empty">Nenhuma tarefa</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h2>Nova Tarefa</h2>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createTask({
                title: fd.get('title') as string,
                description: fd.get('description') as string,
                priority: fd.get('priority') as any,
                status: 'pendente',
                due_date: fd.get('due_date') as string || null,
              });
            }}>
              <div className="modal-fields">
                <input name="title" placeholder="Título da tarefa *" required />
                <textarea name="description" placeholder="Descrição (opcional)" rows={3} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 12, color: 'white', fontFamily: 'inherit', resize: 'vertical' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <select name="priority" required style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 12, color: 'white', appearance: 'none' }}>
                    <option value="baixa">Prioridade: Baixa</option>
                    <option value="media">Prioridade: Média</option>
                    <option value="alta">Prioridade: Alta</option>
                    <option value="urgente">Prioridade: Urgente</option>
                  </select>
                  <input name="due_date" type="date" title="Prazo final" />
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button type="button" className="modal-cancel" onClick={() => setShowNewModal(false)}>Cancelar</button>
                <button type="submit" className="modal-submit">Criar Tarefa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2>Excluir Tarefa</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              Tem certeza que deseja excluir esta tarefa?
            </p>
            <div className="modal-actions" style={{ marginTop: 0 }}>
              <button type="button" className="modal-cancel" onClick={() => setDeleteConfirmId(null)}>Cancelar</button>
              <button type="button" className="modal-submit" style={{ background: 'var(--error-color, #ef4444)' }} onClick={confirmDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
