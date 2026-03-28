import {
  ChefHat, Stethoscope, Sparkles, Hammer, ShoppingBag,
  GraduationCap, Building2, LayoutGrid, Home, Calendar,
  Users, DollarSign, Package, FileText, Target, BarChart3,
  ClipboardList, BookOpen, Settings, UserCircle, Bell,
  Briefcase, Heart, Star, type LucideIcon
} from 'lucide-react';
import type { Segment, UserRole } from '@/types/database';

// ─── Segment Definitions ───────────────────────────────────────────
export interface SegmentDefinition {
  id: Segment;
  label: string;
  description: string;
  icon: LucideIcon;
  emoji: string;
  modules: string[];
  color: string;
}

export const SEGMENTS: SegmentDefinition[] = [
  {
    id: 'confeitaria',
    label: 'Confeitaria & Alimentação',
    description: 'Cardápio, Encomendas, Produção',
    icon: ChefHat,
    emoji: '🍰',
    modules: ['dashboard', 'cardapio', 'encomendas', 'clientes', 'financeiro', 'estoque', 'agenda', 'equipe'],
    color: '#F59E0B',
  },
  {
    id: 'clinica',
    label: 'Clínica & Saúde',
    description: 'Prontuário, Agenda Médica, Convênios',
    icon: Stethoscope,
    emoji: '🏥',
    modules: ['dashboard', 'agenda', 'pacientes', 'prontuarios', 'convenios', 'financeiro', 'equipe'],
    color: '#22C55E',
  },
  {
    id: 'beleza',
    label: 'Beleza & Estética',
    description: 'Serviços, Fidelidade, Comissões',
    icon: Sparkles,
    emoji: '💅',
    modules: ['dashboard', 'agenda', 'clientes', 'servicos', 'fidelidade', 'comissoes', 'financeiro', 'equipe'],
    color: '#EC4899',
  },
  {
    id: 'construcao',
    label: 'Construção & Serviços',
    description: 'Orçamentos, Obras, Contratos',
    icon: Hammer,
    emoji: '🏗️',
    modules: ['dashboard', 'orcamentos', 'obras', 'contratos', 'clientes', 'financeiro', 'estoque', 'equipe'],
    color: '#F97316',
  },
  {
    id: 'varejo',
    label: 'Varejo & E-commerce',
    description: 'PDV, Estoque, Marketplace',
    icon: ShoppingBag,
    emoji: '🛍️',
    modules: ['dashboard', 'pdv', 'estoque', 'clientes', 'financeiro', 'leads', 'equipe'],
    color: '#8B5CF6',
  },
  {
    id: 'educacao',
    label: 'Educação & Cursos',
    description: 'Turmas, Alunos, Certificados',
    icon: GraduationCap,
    emoji: '🎓',
    modules: ['dashboard', 'turmas', 'alunos', 'certificados', 'financeiro', 'agenda', 'equipe'],
    color: '#3B82F6',
  },
  {
    id: 'empresarial',
    label: 'Empresarial Geral',
    description: 'CRM completo, Financeiro, RH',
    icon: Building2,
    emoji: '🏢',
    modules: ['dashboard', 'leads', 'propostas', 'clientes', 'financeiro', 'estoque', 'agenda', 'equipe', 'metas', 'comissoes', 'wiki'],
    color: '#6366F1',
  },
  {
    id: 'multissegmento',
    label: 'Multissegmento (Tudo)',
    description: 'Todos os módulos acima',
    icon: LayoutGrid,
    emoji: '🌐',
    modules: ['all'],
    color: '#6C63FF',
  },
];

// ─── Module Menu Items ─────────────────────────────────────────────
export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  group: string;
  badge?: number;
}

export const ALL_MENU_ITEMS: MenuItem[] = [
  // Principal
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/', group: 'Principal' },
  
  // Vendas & CRM
  { id: 'leads', label: 'Leads / CRM', icon: Target, path: '/leads', group: 'Vendas & CRM' },
  { id: 'propostas', label: 'Propostas', icon: FileText, path: '/propostas', group: 'Vendas & CRM' },
  { id: 'metas', label: 'Metas & OKRs', icon: Target, path: '/metas', group: 'Vendas & CRM' },
  { id: 'comissoes', label: 'Comissões', icon: DollarSign, path: '/comissoes', group: 'Vendas & CRM' },

  // Financeiro
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign, path: '/financeiro', group: 'Financeiro' },
  { id: 'estoque', label: 'Estoque', icon: Package, path: '/estoque', group: 'Financeiro' },

  // Atendimento
  { id: 'agenda', label: 'Agenda', icon: Calendar, path: '/agenda', group: 'Atendimento' },
  { id: 'clientes', label: 'Clientes', icon: Users, path: '/clientes', group: 'Atendimento' },
  { id: 'pacientes', label: 'Pacientes', icon: Heart, path: '/clientes', group: 'Atendimento' },
  { id: 'lista-espera', label: 'Lista de Espera', icon: ClipboardList, path: '/lista-espera', group: 'Atendimento' },

  // Segmento-específico
  { id: 'cardapio', label: 'Cardápio', icon: ChefHat, path: '/cardapio', group: 'Gestão' },
  { id: 'encomendas', label: 'Encomendas', icon: Package, path: '/encomendas', group: 'Gestão' },
  { id: 'servicos', label: 'Serviços', icon: Star, path: '/servicos', group: 'Gestão' },
  { id: 'prontuarios', label: 'Prontuários', icon: FileText, path: '/prontuarios', group: 'Gestão' },
  { id: 'convenios', label: 'Convênios', icon: Building2, path: '/convenios', group: 'Gestão' },
  { id: 'turmas', label: 'Turmas', icon: Users, path: '/turmas', group: 'Gestão' },
  { id: 'alunos', label: 'Alunos', icon: GraduationCap, path: '/alunos', group: 'Gestão' },
  { id: 'certificados', label: 'Certificados', icon: FileText, path: '/certificados', group: 'Gestão' },
  { id: 'pdv', label: 'PDV', icon: ShoppingBag, path: '/pdv', group: 'Gestão' },
  { id: 'orcamentos', label: 'Orçamentos', icon: FileText, path: '/orcamentos', group: 'Gestão' },
  { id: 'obras', label: 'Obras', icon: Hammer, path: '/obras', group: 'Gestão' },
  { id: 'contratos', label: 'Contratos', icon: FileText, path: '/contratos', group: 'Gestão' },
  { id: 'fidelidade', label: 'Fidelidade', icon: Heart, path: '/fidelidade', group: 'Gestão' },

  // Equipe
  { id: 'equipe', label: 'Equipe', icon: Users, path: '/equipe', group: 'Equipe' },
  { id: 'tarefas', label: 'Tarefas', icon: ClipboardList, path: '/tarefas', group: 'Equipe' },
  { id: 'wiki', label: 'Wiki', icon: BookOpen, path: '/wiki', group: 'Equipe' },

  // Sistema
  { id: 'configuracoes', label: 'Configurações', icon: Settings, path: '/configuracoes', group: 'Sistema' },
  { id: 'perfil', label: 'Meu Perfil', icon: UserCircle, path: '/perfil', group: 'Sistema' },
  { id: 'notificacoes', label: 'Notificações', icon: Bell, path: '/notificacoes', group: 'Sistema' },
];

// ─── Utility: Get modules for segments ──────────────────────────────
export function getModulesForSegments(segments: Segment[]): string[] {
  if (segments.includes('multissegmento')) {
    return ALL_MENU_ITEMS.map(item => item.id);
  }

  const moduleSet = new Set<string>();
  // Always include these
  moduleSet.add('dashboard');
  moduleSet.add('configuracoes');
  moduleSet.add('perfil');
  moduleSet.add('notificacoes');

  segments.forEach(segId => {
    const seg = SEGMENTS.find(s => s.id === segId);
    if (seg) {
      seg.modules.forEach(mod => moduleSet.add(mod));
    }
  });

  return Array.from(moduleSet);
}

export function getMenuItemsForSegments(segments: Segment[]): MenuItem[] {
  const activeModules = getModulesForSegments(segments);
  if (activeModules.includes('all')) return ALL_MENU_ITEMS;
  return ALL_MENU_ITEMS.filter(item => activeModules.includes(item.id));
}

// ─── Roles ─────────────────────────────────────────────────────────
export const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Administrador', description: 'Acesso total ao sistema' },
  { value: 'gerente', label: 'Gerente', description: 'Gerencia equipe e relatórios' },
  { value: 'operacional', label: 'Operacional', description: 'Acesso às funções do dia a dia' },
  { value: 'visualizador', label: 'Visualizador', description: 'Apenas visualização de dados' },
];

// ─── Colors ────────────────────────────────────────────────────────
export const ACCENT_COLORS = [
  { name: 'Roxo', hex: '#6C63FF' },
  { name: 'Azul', hex: '#3B82F6' },
  { name: 'Ciano', hex: '#06B6D4' },
  { name: 'Verde', hex: '#22C55E' },
  { name: 'Amarelo', hex: '#F59E0B' },
  { name: 'Rosa', hex: '#EC4899' },
  { name: 'Vermelho', hex: '#EF4444' },
  { name: 'Laranja', hex: '#F97316' },
];

export const SEMANTIC_COLORS = {
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

// ─── Lead stages for Kanban ─────────────────────────────────────────
export const LEAD_STAGES: { id: string; label: string; color: string }[] = [
  { id: 'novo', label: 'Novo Lead', color: '#3B82F6' },
  { id: 'primeiro_contato', label: 'Primeiro Contato', color: '#8B5CF6' },
  { id: 'proposta_enviada', label: 'Proposta Enviada', color: '#F59E0B' },
  { id: 'negociacao', label: 'Negociação', color: '#F97316' },
  { id: 'ganho', label: 'Ganho ✅', color: '#22C55E' },
  { id: 'perdido', label: 'Perdido ❌', color: '#EF4444' },
];

// ─── Transaction categories ─────────────────────────────────────────
export const DEFAULT_CATEGORIES = {
  receita: ['Vendas', 'Serviços', 'Consultoria', 'Assinaturas', 'Outros'],
  despesa: ['Aluguel', 'Salários', 'Fornecedores', 'Marketing', 'Utilities', 'Impostos', 'Equipamentos', 'Outros'],
};
