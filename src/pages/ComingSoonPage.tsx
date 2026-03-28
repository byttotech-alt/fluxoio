import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Hammer } from 'lucide-react';

export function ComingSoonPage() {
  const location = useLocation();
  const path = location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.substring(2).replace(/-/g, ' ');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="leads-header">
        <div>
          <h1>{path || 'Módulo'}</h1>
          <p>Módulo em desenvolvimento</p>
        </div>
      </div>
      
      <div className="glass-card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        minHeight: '400px'
      }}>
        <div style={{
          width: 80,
          height: 80,
          background: 'var(--accent-color)',
          opacity: 0.1,
          borderRadius: '24px',
          position: 'absolute',
          transform: 'rotate(10deg)'
        }} />
        <Hammer size={48} style={{ color: 'var(--accent-color)', marginBottom: 24, zIndex: 1 }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: 12, zIndex: 1 }}>Em Breve!</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, zIndex: 1 }}>
          Estamos construindo ferramentas incríveis para o módulo de <strong>{path}</strong>. 
          As funcionalidades específicas para o seu segmento estarão disponíveis nas próximas atualizações.
        </p>
      </div>
    </motion.div>
  );
}
