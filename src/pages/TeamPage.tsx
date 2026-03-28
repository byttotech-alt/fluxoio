import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/lib/utils';
import { ROLES } from '@/lib/constants';
import { Plus, Shield, ClipboardList, MessageSquare, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { TeamMember, Task } from '@/types/database';

export function TeamPage() {
  const { user, profile } = useAuthStore();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [tab, setTab] = useState<'members' | 'permissions' | 'mural'>('members');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('team_members').select('*').eq('profile_id', user.id).then(({ data }) => { if (data) setMembers(data as TeamMember[]); });
  }, [user]);

  async function inviteMember(email: string, role: any) {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('team_members').insert({
        profile_id: user.id,
        invited_email: email,
        role: role,
        status: 'invited',
      });

      if (error) throw error;

      await supabase.functions.invoke('send-invite', {
        body: {
          emails: [email],
          inviterName: profile?.display_name || profile?.company_name || 'Sua Equipe Fluxio'
        }
      });

      toast.success('Convite enviado com sucesso!');
      
      const { data } = await supabase.from('team_members').select('*').eq('profile_id', user.id);
      if (data) setMembers(data as TeamMember[]);
      
      setShowInviteModal(false);
      setShowInviteModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao convidar membro.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from('team_members').delete().eq('id', deleteConfirmId);
    if (!error) {
      setMembers(prev => prev.filter(m => m.id !== deleteConfirmId));
      toast.success('Membro removido com sucesso!');
    } else {
      toast.error('Erro ao remover membro');
    }
    setDeleteConfirmId(null);
  }

  const roleColors: Record<string, string> = { admin: '#6C63FF', gerente: '#3B82F6', operacional: '#22C55E', visualizador: '#64748B' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="leads-header">
        <div><h1>Equipe</h1><p>Gerencie membros, permissões e colaboração</p></div>
        <button className="leads-add-btn" onClick={() => setShowInviteModal(true)}>
          <Plus size={18} /> Convidar Membro
        </button>
      </div>

      <div className="finance-tabs">
        {([['members', 'Membros'], ['permissions', 'Permissões'], ['mural', 'Mural']] as const).map(([t, label]) => (
          <button key={t} className={`finance-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t as any)}>{label}</button>
        ))}
      </div>

      {tab === 'members' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {members.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-tertiary)', padding: 40 }}>Nenhum membro na equipe. Convide alguém!</p>}
          {members.map(m => (
            <div key={m.id} className="glass-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{getInitials(m.name || m.invited_email)}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, display: 'block' }}>{m.name || m.invited_email}</span>
                <span style={{ fontSize: '0.75rem', color: roleColors[m.role], fontWeight: 600 }}>{ROLES.find(r => r.value === m.role)?.label}</span>
              </div>
              <span style={{ fontSize: '0.6875rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: m.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: m.status === 'active' ? '#22C55E' : '#F59E0B', fontWeight: 600 }}>
                {m.status === 'active' ? 'Ativo' : 'Convidado'}
              </span>
              <button 
                className="kanban-delete-btn" 
                onClick={() => setDeleteConfirmId(m.id)}
                title="Remover Membro"
                style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'permissions' && (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="finance-table">
            <thead><tr><th>Permissão</th>{ROLES.map(r => <th key={r.value} style={{ textAlign: 'center' }}>{r.label}</th>)}</tr></thead>
            <tbody>
              {['Ver Dashboard', 'Gerenciar Clientes', 'Gerenciar Financeiro', 'Gerenciar Estoque', 'Gerenciar Equipe', 'Configurações'].map(perm => (
                <tr key={perm}><td style={{ fontWeight: 500 }}>{perm}</td>
                  <td style={{ textAlign: 'center', color: 'var(--color-success)' }}>✅</td>
                  <td style={{ textAlign: 'center', color: 'var(--color-success)' }}>✅</td>
                  <td style={{ textAlign: 'center' }}>{perm.includes('Configurações') || perm.includes('Equipe') ? '❌' : '✅'}</td>
                  <td style={{ textAlign: 'center' }}>{perm === 'Ver Dashboard' ? '✅' : '❌'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'mural' && (
        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
          <MessageSquare size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
          <p style={{ color: 'var(--text-tertiary)' }}>O mural de atualizações aparecerá aqui. Comece uma conversa com sua equipe!</p>
        </div>
      )}

      {showInviteModal && (
        <div className="modal-overlay" onClick={() => !isSubmitting && setShowInviteModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h2>Convidar Membro</h2>
            <form onSubmit={e => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              inviteMember(fd.get('email') as string, fd.get('role') as any);
            }}>
              <div className="modal-fields">
                <input name="email" type="email" placeholder="E-mail do membro *" required style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 12, color: 'white' }} />
                <select name="role" required style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 12, color: 'white' }}>
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions" style={{ marginTop: 24 }}>
                <button type="button" className="modal-cancel" onClick={() => setShowInviteModal(false)} disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className="modal-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : 'Enviar Convite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2>Remover Membro</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
              Tem certeza que deseja remover este membro da equipe? Ele perderá acesso ao sistema imediatamente.
            </p>
            <div className="modal-actions" style={{ marginTop: 0 }}>
              <button type="button" className="modal-cancel" onClick={() => setDeleteConfirmId(null)}>Cancelar</button>
              <button type="button" className="modal-submit" style={{ background: 'var(--error-color, #ef4444)' }} onClick={confirmDelete}>
                Remover Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
