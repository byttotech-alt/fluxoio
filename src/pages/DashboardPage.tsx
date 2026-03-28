import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { getGreeting, formatCurrency, percentChange, formatDateTime } from '@/lib/utils';
import {
  DollarSign, Users, Calendar, ClipboardList, TrendingUp, TrendingDown,
  Target, AlertTriangle, Package, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './DashboardPage.css';

interface KPI {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  color: string;
}

const CHART_COLORS = ['#6C63FF', '#4F8EF7', '#22C55E', '#F59E0B', '#EC4899', '#EF4444'];

// Mock data for charts (will be replaced by Supabase queries)
const revenueData = [
  { month: 'Out', value: 12400 },
  { month: 'Nov', value: 15800 },
  { month: 'Dez', value: 18200 },
  { month: 'Jan', value: 14600 },
  { month: 'Fev', value: 21300 },
  { month: 'Mar', value: 24800 },
];

const categoryData = [
  { name: 'Vendas', value: 45 },
  { name: 'Serviços', value: 30 },
  { name: 'Consultoria', value: 15 },
  { name: 'Outros', value: 10 },
];

const weeklyData = [
  { week: 'Sem 1', entradas: 5200, saidas: 3100 },
  { week: 'Sem 2', entradas: 6800, saidas: 4200 },
  { week: 'Sem 3', entradas: 4500, saidas: 3800 },
  { week: 'Sem 4', entradas: 8100, saidas: 5000 },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function DashboardPage() {
  const { profile, user } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 24800,
    prevRevenue: 21300,
    clients: 142,
    todayAppointments: 8,
    pendingTasks: 15,
    avgTicket: 174.65,
    conversionRate: 32,
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    if (!user) return;
    try {
      // Fetch last 10 transactions
      const { data: txns } = await supabase
        .from('transactions')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (txns) setTransactions(txns);

      // Fetch contact count
      const { count: clientCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id);

      // Fetch today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { count: apptCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id)
        .gte('start_time', today.toISOString())
        .lt('start_time', tomorrow.toISOString());

      // Pending tasks
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', user.id)
        .eq('status', 'pendente');

      setStats(prev => ({
        ...prev,
        clients: clientCount || 0,
        todayAppointments: apptCount || 0,
        pendingTasks: taskCount || 0,
      }));
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const kpis: KPI[] = [
    {
      label: 'Receita do Mês',
      value: formatCurrency(stats.revenue),
      change: percentChange(stats.revenue, stats.prevRevenue),
      icon: DollarSign,
      color: '#22C55E',
    },
    {
      label: 'Clientes Ativos',
      value: stats.clients.toString(),
      change: 12,
      icon: Users,
      color: '#3B82F6',
    },
    {
      label: 'Agendamentos Hoje',
      value: stats.todayAppointments.toString(),
      change: 0,
      icon: Calendar,
      color: '#8B5CF6',
    },
    {
      label: 'Tarefas Pendentes',
      value: stats.pendingTasks.toString(),
      change: -5,
      icon: ClipboardList,
      color: '#F59E0B',
    },
    {
      label: 'Ticket Médio',
      value: formatCurrency(stats.avgTicket),
      change: 8.3,
      icon: TrendingUp,
      color: '#EC4899',
    },
    {
      label: 'Conversão de Leads',
      value: `${stats.conversionRate}%`,
      change: 4.2,
      icon: Target,
      color: '#6C63FF',
    },
  ];

  const statusColors: Record<string, string> = {
    pago: '#22C55E',
    pendente: '#F59E0B',
    vencido: '#EF4444',
    cancelado: '#64748B',
  };

  return (
    <motion.div className="dashboard" variants={container} initial="hidden" animate="show">
      {/* Greeting */}
      <motion.div className="dashboard-greeting" variants={item}>
        <h1>{getGreeting()}, {profile?.full_name?.split(' ')[0]}! 👋</h1>
        <p>Aqui está o resumo de hoje</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div className="dashboard-kpis" variants={item}>
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card glass-card">
            <div className="kpi-header">
              <div className="kpi-icon" style={{ background: kpi.color + '1a', color: kpi.color }}>
                <kpi.icon size={20} />
              </div>
              <div className={`kpi-change ${kpi.change >= 0 ? 'positive' : 'negative'}`}>
                {kpi.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(kpi.change).toFixed(1)}%
              </div>
            </div>
            <div className="kpi-info">
              <span className="kpi-label">{kpi.label}</span>
              <span className="kpi-value">{loading ? '—' : kpi.value}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="dashboard-charts-row">
        {/* Revenue Line Chart */}
        <motion.div className="dashboard-chart glass-card" variants={item}>
          <h3>Receita — Últimos 6 meses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  fontSize: 13,
                }}
                formatter={(value: number) => [formatCurrency(value), 'Receita']}
              />
              <Line type="monotone" dataKey="value" stroke="#6C63FF" strokeWidth={3} dot={{ r: 4, fill: '#6C63FF' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Donut */}
        <motion.div className="dashboard-chart glass-card small-chart" variants={item}>
          <h3>Receita por Categoria</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 13 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bar Chart + Transactions */}
      <div className="dashboard-bottom-row">
        <motion.div className="dashboard-chart glass-card" variants={item}>
          <h3>Entradas vs Saídas — por semana</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="week" stroke="var(--text-tertiary)" fontSize={12} />
              <YAxis stroke="var(--text-tertiary)" fontSize={12} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 13 }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="entradas" fill="#22C55E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="saidas" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Last transactions */}
        <motion.div className="dashboard-transactions glass-card" variants={item}>
          <h3>Últimas Transações</h3>
          <div className="txn-list">
            {transactions.length === 0 && !loading ? (
              <p className="txn-empty">Nenhuma transação registrada</p>
            ) : transactions.map(txn => (
              <div key={txn.id} className="txn-item">
                <div className={`txn-type-icon ${txn.type}`}>
                  {txn.type === 'receita' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </div>
                <div className="txn-info">
                  <span className="txn-desc">{txn.description || txn.category}</span>
                  <span className="txn-date">{formatDateTime(txn.created_at)}</span>
                </div>
                <div className="txn-right">
                  <span className={`txn-amount ${txn.type}`}>
                    {txn.type === 'receita' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </span>
                  <span className="txn-status" style={{ color: statusColors[txn.status] || '#64748B' }}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Alerts */}
      <motion.div className="dashboard-alerts" variants={item}>
        <div className="alert-card warning glass-card">
          <AlertTriangle size={18} />
          <span>3 produtos abaixo do estoque mínimo</span>
        </div>
        <div className="alert-card info glass-card">
          <Clock size={18} />
          <span>2 tarefas atrasadas precisam de atenção</span>
        </div>
        <div className="alert-card error glass-card">
          <Package size={18} />
          <span>1 proposta expirando em 2 dias</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
