import { motion } from 'framer-motion';
import { Clock, Phone, Calendar, User } from 'lucide-react';

export function WaitListPage() {
  const mockWaitList = [
    { id: '1', name: 'Ana Souza', service: 'Corte + Escova', waitTime: '15 min', phone: '(11) 99999-0001' },
    { id: '2', name: 'Carlos Lima', service: 'Consulta Retorno', waitTime: '25 min', phone: '(11) 99999-0002' },
    { id: '3', name: 'Beatriz Santos', service: 'Limpeza de Pele', waitTime: '45 min', phone: '(11) 99999-0003' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="leads-header">
        <div><h1>Lista de Espera</h1><p>Fila de atendimento em tempo real</p></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mockWaitList.map((item, idx) => (
          <div key={item.id} className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.875rem' }}>{idx + 1}</div>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, display: 'block' }}>{item.name}</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} /> {item.service}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-warning)', fontSize: '0.8125rem', fontWeight: 500 }}><Clock size={14} /> {item.waitTime}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}><Phone size={14} /> {item.phone}</div>
            <button className="leads-add-btn" style={{ padding: '6px 16px', fontSize: '0.8125rem' }}><User size={14} /> Chamar</button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
