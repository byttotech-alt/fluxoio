export type UserRole = 'admin' | 'gerente' | 'operacional' | 'visualizador';
export type MemberStatus = 'active' | 'invited' | 'inactive';
export type LeadStage = 'novo' | 'primeiro_contato' | 'proposta_enviada' | 'negociacao' | 'ganho' | 'perdido';
export type ProposalStatus = 'rascunho' | 'enviada' | 'visualizada' | 'aceita' | 'recusada';
export type TransactionType = 'receita' | 'despesa';
export type TransactionStatus = 'pendente' | 'pago' | 'vencido' | 'cancelado';
export type PaymentMethod = 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'transferencia';
export type AppointmentStatus = 'confirmado' | 'aguardando' | 'cancelado' | 'concluido';
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TaskStatus = 'pendente' | 'em_progresso' | 'concluida' | 'cancelada';
export type NotificationType = 'info' | 'warning' | 'success' | 'error';
export type PlanTier = 'free' | 'pro' | 'enterprise';
export type ThemeMode = 'dark' | 'light';

export type Segment =
  | 'confeitaria'
  | 'clinica'
  | 'beleza'
  | 'construcao'
  | 'varejo'
  | 'educacao'
  | 'empresarial'
  | 'multissegmento';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  company_name: string;
  cnpj: string | null;
  phone: string | null;
  address: Record<string, string> | null;
  logo_url: string | null;
  segments: Segment[];
  accent_color: string;
  theme: ThemeMode;
  plan: PlanTier;
  display_name: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export interface TeamMember {
  id: string;
  profile_id: string;
  user_id: string | null;
  role: UserRole;
  status: MemberStatus;
  invited_email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Contact {
  id: string;
  profile_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  type: string;
  notes: string | null;
  tags: string[];
  total_spent: number;
  last_visit: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  profile_id: string;
  contact_id: string | null;
  user_id: string | null;
  title: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  color: string | null;
  notes: string | null;
  service: string | null;
  contact?: Contact;
  created_at: string;
}

export interface Lead {
  id: string;
  profile_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  value: number;
  stage: LeadStage;
  source: string | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProposalItem {
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
}

export interface Proposal {
  id: string;
  profile_id: string;
  lead_id: string | null;
  contact_id: string | null;
  title: string;
  items: ProposalItem[];
  total: number;
  status: ProposalStatus;
  valid_until: string | null;
  notes: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  profile_id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  payment_method: PaymentMethod | null;
  recurrence: 'unico' | 'fixo' | 'parcelado' | null;
  installments: number | null;
  attachment_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  profile_id: string;
  name: string;
  sku: string | null;
  category: string | null;
  price: number;
  cost: number;
  stock_qty: number;
  min_stock: number;
  unit: string;
  image_url: string | null;
  barcode: string | null;
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  profile_id: string;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string | null;
  user_id: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  checklist: { text: string; done: boolean }[];
  created_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export interface Goal {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  target_value: number;
  current_value: number;
  deadline: string | null;
  key_results: { text: string; target: number; current: number }[];
  created_at: string;
}

export interface Commission {
  id: string;
  profile_id: string;
  user_id: string;
  user_name: string;
  total_sales: number;
  commission_rate: number;
  amount_due: number;
  period: string;
  created_at: string;
}

export interface WikiDocument {
  id: string;
  profile_id: string;
  title: string;
  content: string;
  category: string | null;
  author_id: string;
  updated_at: string;
  created_at: string;
}

export interface ActivityFeedItem {
  id: string;
  profile_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  created_at: string;
}
