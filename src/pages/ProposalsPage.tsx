import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, FileText, Eye, Send, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Proposal } from '@/types/database';

export function ProposalsPage() {
  const { user } = useAuthStore();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => { loadProposals(); }, [user]);

  async function loadProposals() {
    if (!user) return;
    const { data } = await supabase.from('proposals').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
    if (data) setProposals(data as Proposal[]);
    setLoading(false);
  }

  async function createProposal(data: Partial<Proposal>) {
    if (!user) return;
    const { error } = await supabase.from('proposals').insert({
      ...data,
      profile_id: user.id,
      items: [],
      notes: '',
    });
    
    if (!error) {
      toast.success('Proposta criada com sucesso!');
      loadProposals();
      setShowNewModal(false);
    } else {
      toast.error('Erro ao criar proposta');
    }
  }

  const statusIcon: Record<string, React.ReactNode> = {
    rascunho: <FileText size={14} />, enviada: <Send size={14} />,
    visualizada: <Eye size={14} />, aceita: <Check size={14} />, recusada: <X size={14} />,
  };
  const statusColor: Record<string, string> = {
    rascunho: '#64748B', enviada: '#3B82F6', visualizada: '#F59E0B', aceita: '#22C55E', recusada: '#EF4444',
  };

  const filtered = proposals.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="leads-header">
        <div><h1>Propostas</h1><p>Gerencie suas propostas comerciais</p></div>
        <div className="leads-actions">
          <div className="leads-search"><Search size={16} /><input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <button className="leads-add-btn" onClick={() => setShowNewModal(true)}><Plus size={18} /> Nova Proposta</button>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && !loading && <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 40 }}>Nenhuma proposta encontrada. Clique em "Nova Proposta" para começar.</p>}
        {filtered.map(p => (
          <div key={p.id} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{p.title}</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{formatDate(p.created_at)}</span>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>{formatCurrency(p.total)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: statusColor[p.status], padding: '4px 10px', borderRadius: 'var(--radius-full)', background: statusColor[p.status] + '1a' }}>
              {statusIcon[p.status]} {p.status}
            </span>
          </div>
        ))}
      </div>

      {/* New Proposal Modal */}
      {showNewModal && (
        <div className="modal-overlay" onClick={() => setShowNewModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h2>Nova Proposta</h2>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              createProposal({
                title: fd.get('title') as string,
                total: Number(fd.get('total')) || 0,
                status: 'rascunho',
                valid_until: fd.get('valid_until') as string || null,
              });
            }}>
              <div className="modal-fields">
                <input name="title" placeholder="Título da Proposta *" required />
                <input name="total" placeholder="Valor Total (R$)" type="number" step="0.01" required />
                <input name="valid_until" placeholder="Válido até" type="date" title="Válido até" />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowNewModal(false)}>Cancelar</button>
                <button type="submit" className="modal-submit">Salvar Rascunho</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
