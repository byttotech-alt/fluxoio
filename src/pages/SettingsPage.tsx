import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useThemeStore } from '@/store/themeStore';
import { ACCENT_COLORS, SEGMENTS } from '@/lib/constants';
import {
  Building2, User, Palette, CreditCard, Bell, Plug, Shield,
  Check, Sun, Moon, Save, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Segment } from '@/types/database';

type SettingsTab = 'company' | 'profile' | 'segments' | 'plans' | 'integrations' | 'notifications' | 'appearance';

export function SettingsPage() {
  const { profile, updateProfile } = useAuth();
  const { mode, accentColor, setMode, setAccentColor, toggleMode } = useThemeStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('company');
  const [saving, setSaving] = useState(false);

  // Company form
  const [companyName, setCompanyName] = useState(profile?.company_name || '');
  const [cnpj, setCnpj] = useState(profile?.cnpj || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');

  // Profile
  const [fullName, setFullName] = useState(profile?.full_name || '');

  // Segments
  const [segments, setSegments] = useState<Segment[]>(profile?.segments as Segment[] || []);

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({
        company_name: companyName,
        cnpj,
        phone,
        display_name: displayName,
        full_name: fullName,
        segments,
        accent_color: accentColor,
        theme: mode,
      });
      toast.success('Configurações salvas!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'segments', label: 'Segmentos', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'plans', label: 'Planos', icon: CreditCard },
    { id: 'integrations', label: 'Integrações', icon: Plug },
    { id: 'notifications', label: 'Notificações', icon: Bell },
  ];

  const integrations = [
    { name: 'WhatsApp Business', desc: 'Envie mensagens aos clientes', enabled: false },
    { name: 'Mercado Pago', desc: 'Receba pagamentos online', enabled: false },
    { name: 'Google Calendar', desc: 'Sincronize agendamentos', enabled: false },
    { name: 'Instagram', desc: 'Conecte suas redes sociais', enabled: false },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 24 }}>
      {/* Side tabs */}
      <div style={{ minWidth: 200, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem', fontWeight: activeTab === tab.id ? 600 : 400,
              background: activeTab === tab.id ? 'var(--accent-color-muted)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent-color)' : 'var(--text-secondary)',
              transition: 'all 150ms', textAlign: 'left',
            }}>
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: 640 }}>
        {activeTab === 'company' && (
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>Perfil da Empresa</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="onboarding-field"><label>Nome da empresa</label><input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
              <div className="onboarding-field"><label>CNPJ</label><input type="text" value={cnpj} onChange={e => setCnpj(e.target.value)} /></div>
              <div className="onboarding-field"><label>Telefone</label><input type="text" value={phone} onChange={e => setPhone(e.target.value)} /></div>
              <div className="onboarding-field"><label>Nome de exibição</label><input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
              <button className="leads-add-btn" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start' }}>
                {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Salvar
              </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>Meu Perfil</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="onboarding-field"><label>Nome completo</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} /></div>
              <button className="leads-add-btn" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start' }}>
                {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Salvar
              </button>
            </div>
          </div>
        )}

        {activeTab === 'segments' && (
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Segmentos Ativos</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>Altere os segmentos para recarregar o menu</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {SEGMENTS.map(seg => {
                const isActive = segments.includes(seg.id);
                return (
                  <button key={seg.id} onClick={() => {
                    if (seg.id === 'multissegmento') setSegments(['multissegmento']);
                    else {
                      setSegments(prev => {
                        const noMulti = prev.filter(s => s !== 'multissegmento') as Segment[];
                        return noMulti.includes(seg.id) 
                          ? noMulti.filter(s => s !== seg.id) 
                          : [...noMulti, seg.id];
                      });
                    }
                  }}
                    style={{
                      padding: '16px', borderRadius: 'var(--radius-lg)', border: `2px solid ${isActive ? seg.color : 'var(--border-color)'}`,
                      background: isActive ? seg.color + '1a' : 'var(--bg-tertiary)', textAlign: 'left', transition: 'all 150ms',
                    }}>
                    <span style={{ fontSize: '1.25rem' }}>{seg.emoji}</span>
                    <span style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginTop: 6 }}>{seg.label}</span>
                  </button>
                );
              })}
            </div>
            <button className="leads-add-btn" onClick={handleSave} disabled={saving} style={{ marginTop: 20 }}>
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Salvar Segmentos
            </button>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>Aparência</h2>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, fontSize: '0.875rem' }}>Tema</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setMode('dark')} className={`theme-btn ${mode === 'dark' ? 'active' : ''}`}><Moon size={18} /> Escuro</button>
                <button onClick={() => setMode('light')} className={`theme-btn ${mode === 'light' ? 'active' : ''}`}><Sun size={18} /> Claro</button>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 12, fontSize: '0.875rem' }}>Cor de destaque</label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {ACCENT_COLORS.map(c => (
                  <button key={c.hex} onClick={() => setAccentColor(c.hex)}
                    style={{ width: 40, height: 40, borderRadius: '50%', background: c.hex, border: accentColor === c.hex ? '3px solid var(--text-primary)' : '3px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 150ms' }}>
                    {accentColor === c.hex && <Check size={14} color="#fff" />}
                  </button>
                ))}
              </div>
            </div>
            <button className="leads-add-btn" onClick={handleSave} disabled={saving} style={{ marginTop: 20 }}>
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Salvar
            </button>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Planos & Faturamento</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>Plano atual: <strong style={{ color: 'var(--accent-color)' }}>{profile?.plan?.toUpperCase()}</strong></p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { name: 'Free', price: 'R$ 0', features: ['5 colaboradores', '100 clientes', 'Módulos básicos'] },
                { name: 'Pro', price: 'R$ 97/mês', features: ['Ilimitado colaboradores', 'Ilimitado clientes', 'Todos os módulos', 'Relatórios PDF'] },
                { name: 'Enterprise', price: 'R$ 297/mês', features: ['Tudo do Pro', 'API access', 'Suporte prioritário', 'Multi-unidades'] },
              ].map(plan => (
                <div key={plan.name} style={{ padding: 20, borderRadius: 'var(--radius-lg)', border: profile?.plan === plan.name.toLowerCase() ? '2px solid var(--accent-color)' : '1px solid var(--border-color)', background: 'var(--bg-tertiary)' }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{plan.name}</h3>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-color)' }}>{plan.price}</span>
                  <ul style={{ marginTop: 12, fontSize: '0.8125rem', color: 'var(--text-secondary)', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {plan.features.map(f => <li key={f}>✓ {f}</li>)}
                  </ul>
                  <button className="leads-add-btn" style={{ marginTop: 16, width: '100%', justifyContent: 'center', opacity: profile?.plan === plan.name.toLowerCase() ? 0.5 : 1 }}>
                    {profile?.plan === plan.name.toLowerCase() ? 'Plano Atual' : 'Upgrade'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>Integrações</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {integrations.map(i => (
                <div key={i.name} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <Plug size={20} style={{ color: 'var(--accent-color)' }} />
                  <div style={{ flex: 1 }}><span style={{ fontWeight: 600, display: 'block' }}>{i.name}</span><span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{i.desc}</span></div>
                  <label style={{ position: 'relative', width: 44, height: 24, cursor: 'pointer' }}>
                    <input type="checkbox" checked={i.enabled} readOnly style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', inset: 0, borderRadius: 12, background: i.enabled ? 'var(--accent-color)' : 'var(--bg-hover)', transition: 'all 150ms' }}>
                      <span style={{ position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: 'white', top: 3, left: i.enabled ? 23 : 3, transition: 'left 150ms' }} />
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="glass-card" style={{ padding: 28 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>Notificações</h2>
            {['Novos leads', 'Agendamentos', 'Tarefas atrasadas', 'Estoque baixo', 'Propostas', 'Pagamentos'].map(n => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 500 }}>{n}</span>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}><input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-color)' }} /> E-mail</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}><input type="checkbox" defaultChecked style={{ accentColor: 'var(--accent-color)' }} /> In-app</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}><input type="checkbox" style={{ accentColor: 'var(--accent-color)' }} /> Push</label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
