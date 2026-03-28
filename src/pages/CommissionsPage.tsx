import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { DollarSign, Download, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function CommissionsPage() {
  const { user } = useAuthStore();

  const mockData = [
    { name: 'Ana Silva', sales: 12, rate: 10, total: 45600, commission: 4560 },
    { name: 'Carlos Santos', sales: 8, rate: 8, total: 32400, commission: 2592 },
    { name: 'Maria Oliveira', sales: 15, rate: 12, total: 58900, commission: 7068 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="leads-header">
        <div><h1>Comissões</h1><p>Acompanhe as comissões da equipe de vendas</p></div>
        <button className="leads-add-btn"><Download size={18} /> Exportar CSV</button>
      </div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem' }}>Vendedor</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem' }}>Vendas</th>
              <th style={{ textAlign: 'center', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem' }}>%</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem' }}>Total Vendido</th>
              <th style={{ textAlign: 'right', padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem' }}>Comissão</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map(row => (
              <tr key={row.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{row.name}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>{row.sales}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>{row.rate}%</td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{formatCurrency(row.total)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: 'var(--color-success)' }}>{formatCurrency(row.commission)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
