import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/lib/utils';
import { Plus, Search, AlertTriangle, Package, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types/database';

export function InventoryPage() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => { loadProducts(); }, [user]);

  async function loadProducts() {
    if (!user) return;
    const { data } = await supabase.from('products').select('*').eq('profile_id', user.id).order('name');
    if (data) setProducts(data as Product[]);
    setLoading(false);
  }

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search));

  async function createProduct(data: Partial<Product>) {
    if (!user) return;
    const { error } = await supabase.from('products').insert({ ...data, profile_id: user.id });
    if (!error) { toast.success('Produto criado!'); loadProducts(); setShowModal(false); } else toast.error('Erro');
  }

  async function confirmDelete() {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from('products').delete().eq('id', deleteConfirmId);
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== deleteConfirmId));
      toast.success('Produto excluído com sucesso!');
    } else {
      toast.error('Erro ao excluir produto');
    }
    setDeleteConfirmId(null);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="leads-header">
        <div><h1>Estoque</h1><p>Gerencie seus produtos e movimentações</p></div>
        <div className="leads-actions">
          <div className="leads-search"><Search size={16} /><input placeholder="Buscar por nome ou código de barras..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} /></div>
          <button className="leads-add-btn" onClick={() => setShowModal(true)}><Plus size={18} /> Novo Produto</button>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'auto' }}>
        <table className="finance-table">
          <thead><tr><th>Produto</th><th>SKU</th><th>Categoria</th><th>Un.</th><th style={{ textAlign: 'right' }}>Custo</th><th style={{ textAlign: 'right' }}>Preço</th><th style={{ textAlign: 'center' }}>Estoque</th><th style={{ textAlign: 'center' }}>Mín.</th><th style={{ textAlign: 'center' }}>Ações</th></tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>Nenhum produto cadastrado</td></tr>}
            {filtered.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {p.stock_qty <= p.min_stock && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-error)', display: 'inline-block', animation: 'skeleton-pulse 1s ease-in-out infinite' }} title="Estoque crítico" />}
                  {p.name}
                </td>
                <td style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>{p.sku || '—'}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{p.category || '—'}</td>
                <td>{p.unit}</td>
                <td style={{ textAlign: 'right' }}>{formatCurrency(p.cost)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(p.price)}</td>
                <td style={{ textAlign: 'center', fontWeight: 600, color: p.stock_qty <= p.min_stock ? 'var(--color-error)' : 'var(--text-primary)' }}>{p.stock_qty}</td>
                <td style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>{p.min_stock}</td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => setDeleteConfirmId(p.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}
                    title="Excluir produto"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h2>Novo Produto</h2>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); createProduct({ name: fd.get('name') as string, sku: fd.get('sku') as string, category: fd.get('category') as string, price: Number(fd.get('price')), cost: Number(fd.get('cost')), stock_qty: Number(fd.get('stock_qty')), min_stock: Number(fd.get('min_stock')), unit: fd.get('unit') as string || 'un', barcode: fd.get('barcode') as string }); }}>
              <div className="modal-fields">
                <input name="name" placeholder="Nome do produto *" required />
                <input name="sku" placeholder="SKU" />
                <input name="category" placeholder="Categoria" />
                <input name="price" placeholder="Preço de venda *" type="number" step="0.01" required />
                <input name="cost" placeholder="Preço de custo" type="number" step="0.01" />
                <input name="stock_qty" placeholder="Quantidade em estoque" type="number" />
                <input name="min_stock" placeholder="Estoque mínimo" type="number" />
                <input name="unit" placeholder="Unidade (un, kg, etc)" />
                <input name="barcode" placeholder="Código de barras (EAN)" />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="modal-submit">Criar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2>Excluir Produto</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
              Tem certeza que deseja excluir este produto do estoque? Esta ação não pode ser desfeita e pode afetar o histórico de vendas.
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
