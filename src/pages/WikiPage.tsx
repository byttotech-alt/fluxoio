import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { Plus, BookOpen, Search, FileText, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { WikiDocument } from '@/types/database';

export function WikiPage() {
  const { user } = useAuthStore();
  const [docs, setDocs] = useState<WikiDocument[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<WikiDocument | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from('wiki_documents').select('*').eq('profile_id', user.id).order('updated_at', { ascending: false })
      .then(({ data }) => { if (data) setDocs(data as WikiDocument[]); });
  }, [user]);

  const filtered = docs.filter(d => !search || d.title.toLowerCase().includes(search.toLowerCase()));

  async function createDoc(title: string, category: string) {
    if (!user) return;
    const { data, error } = await supabase.from('wiki_documents').insert({ title, category, content: '', profile_id: user.id, author_id: user.id }).select().single();
    if (!error && data) { toast.success('Documento criado!'); setDocs(prev => [data as WikiDocument, ...prev]); setShowModal(false); setSelectedDoc(data as WikiDocument); }
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from('wiki_documents').delete().eq('id', deleteConfirmId);
    if (!error) {
      setDocs(prev => prev.filter(d => d.id !== deleteConfirmId));
      if (selectedDoc?.id === deleteConfirmId) setSelectedDoc(null);
      toast.success('Documento excluído com sucesso!');
    } else {
      toast.error('Erro ao excluir documento');
    }
    setDeleteConfirmId(null);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="leads-header">
        <div><h1>Wiki</h1><p>Base de conhecimento interna</p></div>
        <div className="leads-actions">
          <div className="leads-search"><Search size={16} /><input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} /></div>
          <button className="leads-add-btn" onClick={() => setShowModal(true)}><Plus size={18} /> Novo Documento</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedDoc ? '300px 1fr' : '1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.length === 0 && (
            <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
              <BookOpen size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-tertiary)' }}>Nenhum documento. Crie o primeiro!</p>
            </div>
          )}
          {filtered.map(d => (
            <div key={d.id} style={{ position: 'relative' }}>
              <button className="glass-card" onClick={() => setSelectedDoc(d)}
                style={{ padding: '14px 18px', textAlign: 'left', width: '100%', border: selectedDoc?.id === d.id ? '1px solid var(--accent-color)' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 24 }}>
                  <FileText size={16} style={{ color: 'var(--accent-color)' }} />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.title}</span>
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: 4, display: 'block' }}>
                  {d.category || 'Sem categoria'} • {formatDate(d.updated_at)}
                </span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(d.id); }}
                style={{ position: 'absolute', top: 12, right: 12, background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}
                title="Excluir documento"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {selectedDoc && (
          <div className="glass-card" style={{ padding: 24, minHeight: 400 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 16 }}>{selectedDoc.title}</h2>
            <textarea
              style={{ width: '100%', minHeight: 300, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 16, fontSize: '0.9375rem', color: 'var(--text-primary)', resize: 'vertical', lineHeight: 1.7 }}
              value={selectedDoc.content}
              onChange={async e => {
                const newContent = e.target.value;
                setSelectedDoc(prev => prev ? { ...prev, content: newContent } : null);
                setDocs(prev => prev.map(d => d.id === selectedDoc.id ? { ...d, content: newContent } : d));
                await supabase.from('wiki_documents').update({ content: newContent, updated_at: new Date().toISOString() }).eq('id', selectedDoc.id);
              }}
              placeholder="Comece a escrever..."
            />
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h2>Novo Documento</h2>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); createDoc(fd.get('title') as string, fd.get('category') as string); }}>
              <div className="modal-fields">
                <input name="title" placeholder="Título *" required />
                <input name="category" placeholder="Categoria (opcional)" />
              </div>
              <div className="modal-actions"><button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancelar</button><button type="submit" className="modal-submit">Criar</button></div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2>Excluir Documento</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
              Tem certeza que deseja excluir esta página da base de conhecimento? Esta ação não pode ser desfeita.
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
