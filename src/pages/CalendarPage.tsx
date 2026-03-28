import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Plus, ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { Appointment } from '@/types/database';
import './CalendarPage.css';

export function CalendarPage() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { loadAppointments(); }, [user, currentDate]);

  async function loadAppointments() {
    if (!user) return;
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const { data } = await supabase.from('appointments').select('*').eq('profile_id', user.id)
      .gte('start_time', start.toISOString()).lte('start_time', end.toISOString());
    if (data) setAppointments(data as Appointment[]);
  }

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  async function createAppointment(data: Partial<Appointment>) {
    if (!user) return;
    const { error } = await supabase.from('appointments').insert({ ...data, profile_id: user.id });
    if (!error) { toast.success('Agendamento criado!'); loadAppointments(); setShowModal(false); } else toast.error('Erro');
  }

  return (
    <motion.div className="calendar-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="leads-header">
        <div><h1>Agenda</h1><p>Gerencie seus agendamentos e compromissos</p></div>
        <button className="leads-add-btn" onClick={() => setShowModal(true)}><Plus size={18} /> Novo Agendamento</button>
      </div>

      <div className="calendar-controls">
        <div className="calendar-nav">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}><ChevronLeft size={18} /></button>
          <h2>{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}><ChevronRight size={18} /></button>
        </div>
        <div className="calendar-views">
          {(['month', 'week', 'day', 'list'] as const).map(v => (
            <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>
              {{ month: 'Mês', week: 'Semana', day: 'Dia', list: 'Lista' }[v]}
            </button>
          ))}
        </div>
      </div>

      <div className="calendar-grid glass-card">
        <div className="calendar-header-row">
          {dayNames.map(d => <div key={d} className="calendar-day-name">{d}</div>)}
        </div>
        <div className="calendar-body">
          {days.map(day => {
            const dayAppts = appointments.filter(a => isSameDay(new Date(a.start_time), day));
            return (
              <div key={day.toISOString()} className={`calendar-cell ${!isSameMonth(day, currentDate) ? 'other-month' : ''} ${isSameDay(day, new Date()) ? 'today' : ''}`}>
                <span className="calendar-day-num">{format(day, 'd')}</span>
                {dayAppts.slice(0, 3).map(a => (
                  <div key={a.id} className="calendar-event" style={{ background: (a.color || 'var(--accent-color)') + '33', borderLeft: `3px solid ${a.color || 'var(--accent-color)'}` }}>
                    {a.title}
                  </div>
                ))}
                {dayAppts.length > 3 && <span className="calendar-more">+{dayAppts.length - 3} mais</span>}
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <h2>Novo Agendamento</h2>
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); createAppointment({ title: fd.get('title') as string, start_time: (fd.get('date') as string) + 'T' + (fd.get('start_time') as string), end_time: (fd.get('date') as string) + 'T' + (fd.get('end_time') as string), notes: fd.get('notes') as string, status: 'aguardando' }); }}>
              <div className="modal-fields">
                <input name="title" placeholder="Título *" required />
                <input name="date" type="date" required defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                <input name="start_time" type="time" required defaultValue="09:00" />
                <input name="end_time" type="time" required defaultValue="10:00" />
                <textarea name="notes" placeholder="Observações" />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="modal-submit">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
