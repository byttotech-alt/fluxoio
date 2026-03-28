import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { Plus, Search, Grid3X3, List, Phone, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { Contact } from '@/types/database';

export function ContactsPage() {
  const { user } = useAuthStore();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadContacts(); }, [user]);

  async function loadContacts() {
    if (!user) return;
    const { data } = await supabase.from('contacts').select('*').eq('profile_id', user.id).order('name');
    if (data) setContacts(data as Contact[]);
    setLoading(false);
  }

  const filtered = contacts.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));

  async function createContact(data: Partial<Contact>) {
    if (!user) return;
    const { error } = await supabase.from('contacts').insert({ ...data, profile_id: user.id });
    if (!error) { toast.success('Contato criado!'); loadContacts(); setShowModal(false); } else toast.error('Erro');
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="leads-header">
        <div><h1>Clientes & Contatos</h1><p>Gerencie sua base de clientes</p></div>
        <div className="leads-actions">
          <div className="leads-search"><Search size={16} /><input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <button onClick={() => setViewMode('grid')} style={{ padding: '6px 10px', background: viewMode === 'grid' ? 'var(--accent-color-muted)' : 'transparent', color: viewMode === 'grid' ? 'var(--accent-color)' : 'var(--text-tertiary)' }}><Grid3X3 size={16} /></button>
            <button onClick={() => setViewMode('list')} style={{ padding: '6px 10px', background: viewMode === 'list' ? 'var(--accent-color-muted)' : 'transparent', color: viewMode === 'list' ? 'var(--accent-color)' : 'var(--text-tertiary)' }}><List size={16} /></button>
          </div>
          <button className="leads-add-btn" onClick={() => setShowModal(true)}><Plus size={18} /> Novo Contato</button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-tertiary)', padding: 40 }}>Nenhum contato encontrado</p>}
          {filtered.map(c => (
            <div key={c.id} className="glass-card" style={{ padding: 20, cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>{getInitials(c.name)}</div>
                <div><span style={{ fontWeight: 600, display: 'block' }}>{c.name}</span><span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{c.type}</span></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {c.email && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={13} /> {c.email}</span>}
                {c.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={13} /> {c.phone}</span>}
                {c.last_visit && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={13} /> Última visita: {formatDate(c.last_visit)}</span>}
              </div>
              {c.total_spent > 0 && <div style={{ marginTop: 10, fontWeight: 600, color: 'var(--color-success)', fontSize: '0.875rem' }}>Total: {formatCurrency(c.total_spent)}</div>}
              {c.tags?.length > 0 && <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>{c.tags.map(t => <span key={t} style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--accent-color-muted)', color: 'var(--accent-color)', fontSize: '0.6875rem', fontWeight: 500 }}>{t}</span>)}</div>}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card" style={{ overflow: 'auto' }}>
          <table className="finance-table">
            <thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Tipo</th><th style={{ textAlign: 'right' }}>Total Gasto</th></tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}><td style={{ fontWeight: 500 }}>{c.name}</td><td>{c.email || '—'}</td><td>{c.phone || '—'}</td><td>{c.type}</td><td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(c.total_spent)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h2>Novo Contato</h2>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); createContact({ name: fd.get('name') as string, email: fd.get('email') as string, phone: fd.get('phone') as string, document: fd.get('document') as string, type: fd.get('type') as string || 'cliente', notes: fd.get('notes') as string }); }}>
              <div className="modal-fields">
                <input name="name" placeholder="Nome *" required /><input name="email" placeholder="E-mail" type="email" /><input name="phone" placeholder="Telefone" /><input name="document" placeholder="CPF/CNPJ" />
                <select name="type"><option value="cliente">Cliente</option><option value="paciente">Paciente</option><option value="fornecedor">Fornecedor</option><option value="lead">Lead</option></select>
                <textarea name="notes" placeholder="Notas" />
              </div>
              <div className="modal-actions"><button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancelar</button><button type="submit" className="modal-submit">Criar</button></div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
