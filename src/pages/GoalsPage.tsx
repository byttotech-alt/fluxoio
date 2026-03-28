import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { Plus, Target, Trash2 } from 'lucide-react';
import type { Goal } from '@/types/database';

export function GoalsPage() {
  const { user } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => { loadGoals(); }, [user]);

  async function loadGoals() {
    if (!user) return;
    const { data } = await supabase.from('goals').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
    if (data) setGoals(data as Goal[]);
  }

  async function createGoal(data: Partial<Goal>) {
    if (!user) return;
    const { error } = await supabase.from('goals').insert({
      ...data,
      profile_id: user.id,
      key_results: [],
    });
    if (!error) {
      toast.success('Meta criada!');
      loadGoals();
      setShowNewModal(false);
    } else {
      toast.error('Erro ao criar meta');
    }
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from('goals').delete().eq('id', deleteConfirmId);
    if (!error) {
      setGoals(prev => prev.filter(g => g.id !== deleteConfirmId));
      toast.success('Meta excluída!');
    }
    setDeleteConfirmId(null);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="leads-header">
        <div><h1>Metas & OKRs</h1><p>Acompanhe seus objetivos e resultados</p></div>
        <button className="leads-add-btn" onClick={() => setShowNewModal(true)}><Plus size={18} /> Nova Meta</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {goals.length === 0 && (
          <div className="glass-card" style={{ padding: 40, textAlign: 'center', gridColumn: '1/-1' }}>
            <Target size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-tertiary)' }}>Nenhuma meta definida. Crie sua primeira meta!</p>
          </div>
        )}
        {goals.map(g => {
          const pct = g.target_value > 0 ? Math.round((g.current_value / g.target_value) * 100) : 0;
          return (
            <div key={g.id} className="glass-card" style={{ padding: 20, position: 'relative' }}>
              <button 
                className="kanban-delete-btn" 
                style={{ position: 'absolute', top: 12, right: 12 }}
                onClick={() => setDeleteConfirmId(g.id)}
              >
                <Trash2 size={14} />
              </button>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, paddingRight: 24 }}>{g.title}</h3>
              <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 12px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border-color)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--accent-color)" strokeWidth="3"
                    strokeDasharray={`${pct} 100`} strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{pct}%</span>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                {g.current_value} / {g.target_value}
              </div>
              {g.description && <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{g.description}</p>}
            </div>
          );
        })}
      </div>

      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h2>Nova Meta</h2>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createGoal({
                title: fd.get('title') as string,
                description: fd.get('description') as string,
                target_value: Number(fd.get('target_value')) || 0,
                current_value: Number(fd.get('current_value')) || 0,
                deadline: fd.get('deadline') as string || null,
              });
            }}>
              <div className="modal-fields">
                <input name="title" placeholder="Nome da Meta *" required />
                <input name="description" placeholder="Descrição (opcional)" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input name="current_value" placeholder="Valor Atual" type="number" step="0.01" required />
                  <input name="target_value" placeholder="Valor Alvo" type="number" step="0.01" required />
                </div>
                <input name="deadline" placeholder="Prazo final" type="date" title="Prazo final" />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowNewModal(false)}>Cancelar</button>
                <button type="submit" className="modal-submit">Criar Meta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2>Excluir Meta</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
              Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
            </p>
            <div className="modal-actions" style={{ marginTop: 0 }}>
              <button type="button" className="modal-cancel" onClick={() => setDeleteConfirmId(null)}>Cancelar</button>
              <button type="button" className="modal-submit" style={{ background: 'var(--error-color, #ef4444)' }} onClick={confirmDelete}>
                Excluir Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
