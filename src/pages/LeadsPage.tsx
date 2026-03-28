import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { LEAD_STAGES } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, Filter, GripVertical, User, DollarSign, Calendar as CalIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Lead, LeadStage } from '@/types/database';
import './LeadsPage.css';

export function LeadsPage() {
  const { user } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  useEffect(() => {
    loadLeads();
  }, [user]);

  async function loadLeads() {
    if (!user) return;
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setLeads(data as Lead[]);
    setLoading(false);
  }

  const filteredLeads = useMemo(() => {
    if (!search) return leads;
    const q = search.toLowerCase();
    return leads.filter(l => l.name.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q));
  }, [leads, search]);

  const columns = useMemo(() => {
    return LEAD_STAGES.map(stage => ({
      ...stage,
      leads: filteredLeads.filter(l => l.stage === stage.id),
    }));
  }, [filteredLeads]);

  async function updateLeadStage(leadId: string, newStage: LeadStage) {
    const { error } = await supabase
      .from('leads')
      .update({ stage: newStage })
      .eq('id', leadId);
    if (!error) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
      toast.success('Lead atualizado');
    }
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from('leads').delete().eq('id', deleteConfirmId);
    if (!error) {
      setLeads(prev => prev.filter(l => l.id !== deleteConfirmId));
      toast.success('Lead excluído com sucesso');
    } else {
      toast.error('Erro ao excluir lead');
    }
    setDeleteConfirmId(null);
  }

  async function createLead(data: Partial<Lead>) {
    if (!user) return;
    const { error } = await supabase.from('leads').insert({
      ...data,
      profile_id: user.id,
    });
    if (!error) {
      toast.success('Lead criado com sucesso!');
      loadLeads();
      setShowNewModal(false);
    } else {
      toast.error('Erro ao criar lead');
    }
  }

  function handleDragStart(lead: Lead) {
    setDraggedLead(lead);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(stageId: string) {
    if (draggedLead && draggedLead.stage !== stageId) {
      updateLeadStage(draggedLead.id, stageId as LeadStage);
    }
    setDraggedLead(null);
  }

  return (
    <motion.div className="leads-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="leads-header">
        <div>
          <h1>Leads & CRM</h1>
          <p>Gerencie seu pipeline de vendas</p>
        </div>
        <div className="leads-actions">
          <div className="leads-search">
            <Search size={16} />
            <input placeholder="Buscar leads..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="leads-add-btn" onClick={() => setShowNewModal(true)}>
            <Plus size={18} /> Novo Lead
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {columns.map(col => (
          <div
            key={col.id}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(col.id)}
          >
            <div className="kanban-column-header">
              <div className="kanban-column-dot" style={{ background: col.color }} />
              <span className="kanban-column-title">{col.label}</span>
              <span className="kanban-column-count">{col.leads.length}</span>
            </div>
            <div className="kanban-cards">
              {col.leads.map(lead => (
                <div
                  key={lead.id}
                  className="kanban-card glass-card"
                  draggable
                  onDragStart={() => handleDragStart(lead)}
                  style={{ position: 'relative' }}
                >
                  <button 
                    type="button"
                    className="kanban-delete-btn"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteConfirmId(lead.id); }}
                    title="Excluir lead"
                  >
                    <Trash2 size={14} />
                  </button>
                  <h4>{lead.name}</h4>
                  {lead.company && <span className="kanban-company">{lead.company}</span>}
                  <div className="kanban-card-meta">
                    {lead.value > 0 && (
                      <span className="kanban-meta-item">
                        <DollarSign size={12} /> {formatCurrency(lead.value)}
                      </span>
                    )}
                    <span className="kanban-meta-item">
                      <CalIcon size={12} /> {formatDate(lead.created_at)}
                    </span>
                  </div>
                  {lead.source && <span className="kanban-source">{lead.source}</span>}
                </div>
              ))}
              {col.leads.length === 0 && (
                <div className="kanban-empty">Arraste leads aqui</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Lead Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h2>Novo Lead</h2>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createLead({
                name: fd.get('name') as string,
                email: fd.get('email') as string,
                phone: fd.get('phone') as string,
                company: fd.get('company') as string,
                value: Number(fd.get('value')) || 0,
                source: fd.get('source') as string,
                stage: 'novo',
              });
            }}>
              <div className="modal-fields">
                <input name="name" placeholder="Nome *" required />
                <input name="email" placeholder="E-mail" type="email" />
                <input name="phone" placeholder="Telefone" />
                <input name="company" placeholder="Empresa" />
                <input name="value" placeholder="Valor estimado" type="number" step="0.01" />
                <input name="source" placeholder="Fonte (ex: site, indicação)" />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowNewModal(false)}>Cancelar</button>
                <button type="submit" className="modal-submit">Criar Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2>Excluir Lead</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
              Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.
            </p>
            <div className="modal-actions" style={{ marginTop: 0 }}>
              <button type="button" className="modal-cancel" onClick={() => setDeleteConfirmId(null)}>
                Cancelar
              </button>
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
