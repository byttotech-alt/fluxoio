import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Search, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import type { Transaction } from '@/types/database';
import './FinancePage.css';

export function FinancePage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'receitas' | 'despesas' | 'pagar' | 'receber'>('all');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadTransactions(); }, [user]);

  async function loadTransactions() {
    if (!user) return;
    const { data } = await supabase.from('transactions').select('*').eq('profile_id', user.id).order('date', { ascending: false });
    if (data) setTransactions(data as Transaction[]);
    setLoading(false);
  }

  const totals = useMemo(() => {
    const receitas = transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const despesas = transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
    return { receitas, despesas, saldo: receitas - despesas, lucro: receitas - despesas };
  }, [transactions]);

  const filtered = useMemo(() => {
    if (tab === 'all') return transactions;
    if (tab === 'receitas') return transactions.filter(t => t.type === 'receita');
    if (tab === 'despesas') return transactions.filter(t => t.type === 'despesa');
    if (tab === 'receber') return transactions.filter(t => t.type === 'receita' && t.status === 'pendente');
    if (tab === 'pagar') return transactions.filter(t => t.type === 'despesa' && t.status === 'pendente');
    return transactions;
  }, [transactions, tab]);

  const chartData = [
    { name: 'Sem 1', entradas: 5200, saidas: 3100, saldo: 2100 },
    { name: 'Sem 2', entradas: 6800, saidas: 4200, saldo: 2600 },
    { name: 'Sem 3', entradas: 4500, saidas: 3800, saldo: 700 },
    { name: 'Sem 4', entradas: 8100, saidas: 5000, saldo: 3100 },
  ];

  async function createTransaction(data: Partial<Transaction>) {
    if (!user) return;
    const { error } = await supabase.from('transactions').insert({ ...data, profile_id: user.id });
    if (!error) { toast.success('Lançamento criado!'); loadTransactions(); setShowModal(false); }
    else toast.error('Erro ao criar lançamento');
  }

  return (
    <motion.div className="finance-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="leads-header">
        <div><h1>Financeiro</h1><p>Controle de receitas, despesas e fluxo de caixa</p></div>
        <button className="leads-add-btn" onClick={() => setShowModal(true)}><Plus size={18} /> Novo Lançamento</button>
      </div>

      {/* Overview Cards */}
      <div className="finance-overview">
        <div className="finance-card glass-card" style={{ borderLeft: '3px solid var(--color-success)' }}>
          <TrendingUp size={20} style={{ color: 'var(--color-success)' }} />
          <div><span className="finance-card-label">Receitas</span><span className="finance-card-value" style={{ color: 'var(--color-success)' }}>{formatCurrency(totals.receitas)}</span></div>
        </div>
        <div className="finance-card glass-card" style={{ borderLeft: '3px solid var(--color-error)' }}>
          <TrendingDown size={20} style={{ color: 'var(--color-error)' }} />
          <div><span className="finance-card-label">Despesas</span><span className="finance-card-value" style={{ color: 'var(--color-error)' }}>{formatCurrency(totals.despesas)}</span></div>
        </div>
        <div className="finance-card glass-card" style={{ borderLeft: '3px solid var(--color-info)' }}>
          <Wallet size={20} style={{ color: 'var(--color-info)' }} />
          <div><span className="finance-card-label">Saldo</span><span className="finance-card-value">{formatCurrency(totals.saldo)}</span></div>
        </div>
        <div className="finance-card glass-card" style={{ borderLeft: '3px solid var(--accent-color)' }}>
          <DollarSign size={20} style={{ color: 'var(--accent-color)' }} />
          <div><span className="finance-card-label">Lucro Líquido</span><span className="finance-card-value" style={{ color: totals.lucro >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>{formatCurrency(totals.lucro)}</span></div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="glass-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 16 }}>Fluxo de Caixa</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} />
            <YAxis stroke="var(--text-tertiary)" fontSize={12} />
            <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 8 }} />
            <Legend />
            <Bar dataKey="entradas" fill="#22C55E" radius={[4,4,0,0]} />
            <Bar dataKey="saidas" fill="#EF4444" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs + Table */}
      <div className="finance-tabs">
        {(['all','receitas','despesas','pagar','receber'] as const).map(t => (
          <button key={t} className={`finance-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {{ all: 'Todos', receitas: 'Receitas', despesas: 'Despesas', pagar: 'A Pagar', receber: 'A Receber' }[t]}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="finance-table">
          <thead>
            <tr>
              <th>Descrição</th><th>Categoria</th><th>Data</th><th>Status</th><th style={{ textAlign: 'right' }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-tertiary)' }}>Nenhum lançamento encontrado</td></tr>}
            {filtered.map(t => (
              <tr key={t.id}>
                <td style={{ fontWeight: 500 }}>{t.description}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{t.category}</td>
                <td style={{ color: 'var(--text-tertiary)' }}>{formatDate(t.date)}</td>
                <td><span className={`status-badge ${t.status}`}>{t.status}</span></td>
                <td style={{ textAlign: 'right', fontWeight: 600, color: t.type === 'receita' ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h2>Novo Lançamento</h2>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); createTransaction({ type: fd.get('type') as any, category: fd.get('category') as string, description: fd.get('description') as string, amount: Number(fd.get('amount')), date: fd.get('date') as string, status: 'pendente', payment_method: fd.get('payment_method') as any }); }}>
              <div className="modal-fields">
                <select name="type" required><option value="receita">Receita</option><option value="despesa">Despesa</option></select>
                <input name="description" placeholder="Descrição *" required />
                <input name="category" placeholder="Categoria" />
                <input name="amount" placeholder="Valor *" type="number" step="0.01" required />
                <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                <select name="payment_method"><option value="">Método de pagamento</option><option value="pix">PIX</option><option value="dinheiro">Dinheiro</option><option value="cartao_credito">Cartão Crédito</option><option value="cartao_debito">Cartão Débito</option><option value="boleto">Boleto</option><option value="transferencia">Transferência</option></select>
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="modal-submit">Criar Lançamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
