import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  FolderOpen,
  CheckCircle,
  Filter,
  User
} from 'lucide-react';
import { useCase } from '../context/CaseContext';
import { Button } from '../components/common/Button';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  caseId: string;
  category: 'TASK' | 'INTERVIEW' | 'DEADLINE' | 'EVIDENCE_REVIEW';
  status?: string;
  isOverdue?: boolean;
}

export const InvestigationCalendarPage: React.FC = () => {
  const { cases, tasks, interviews } = useCase();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 24)); // Oct 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-24');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Build calendar events from real tasks, interviews, and deadlines
  const events: CalendarEvent[] = [];

  // 1. Tasks
  tasks.forEach(t => {
    const overdue = t.status !== 'COMPLETED' && new Date(t.dueDate) < new Date();
    events.push({
      id: t.id,
      title: t.title,
      date: t.dueDate,
      caseId: t.caseId,
      category: 'TASK',
      status: t.status,
      isOverdue: overdue
    });
  });

  // 2. Interviews
  interviews.forEach(i => {
    const datePart = i.interviewDate.split(' ')[0] || '2026-10-25';
    events.push({
      id: i.id,
      title: `Interview: ${i.witnessName}`,
      date: datePart,
      time: i.interviewDate.split(' ')[1] || '11:00',
      caseId: i.caseId,
      category: 'INTERVIEW',
      status: 'SCHEDULED'
    });
  });

  // 3. Evidence Reviews & Case Deadlines
  cases.forEach(c => {
    events.push({
      id: `rev-${c.id}`,
      title: `Grand Jury Docket Review: ${c.id}`,
      date: '2026-10-29',
      caseId: c.id,
      category: 'DEADLINE',
      status: 'PENDING'
    });
  });

  const filteredEvents = events.filter(e => {
    if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;
    return true;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  const formatDateStr = (day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const selectedDateEvents = filteredEvents.filter(e => e.date === selectedDateStr);

  const categoryBadges: Record<string, string> = {
    TASK: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    INTERVIEW: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    DEADLINE: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    EVIDENCE_REVIEW: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>CASE CHRONOLOGY & FORENSIC SCHEDULE</span>
          </div>
          <h1 className="text-2xl font-bold font-hud text-white tracking-wide">
            INVESTIGATION CALENDAR
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Track operational due dates, deposition appointments, and judicial court deadlines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleToday}>
            TODAY
          </Button>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-mono font-bold text-white min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 p-3 bg-white/[0.02] border border-white/10 rounded-xl text-xs font-mono">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">CATEGORY:</span>
          {(['ALL', 'TASK', 'INTERVIEW', 'DEADLINE'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono transition-all ${
                categoryFilter === cat
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-slate-400 text-xs">
          Showing {filteredEvents.length} scheduled events
        </div>
      </div>

      {/* Calendar Grid & Side Panel Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month Grid */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono text-slate-500 font-bold uppercase pb-2 border-b border-white/5">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty prefix slots */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 rounded-xl bg-white/[0.005] border border-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDateStr(day);
              const dayEvents = filteredEvents.filter(e => e.date === dateStr);
              const isSelected = dateStr === selectedDateStr;
              const hasOverdue = dayEvents.some(e => e.isOverdue);

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-20 p-2 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : dayEvents.length > 0
                      ? 'border-white/15 bg-white/[0.02] hover:border-cyan-400/30 hover:bg-white/[0.04]'
                      : 'border-white/5 bg-transparent hover:bg-white/[0.01]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={isSelected ? 'text-cyan-300 font-bold' : 'text-slate-300'}>
                      {day}
                    </span>
                    {hasOverdue && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className={`text-[9px] font-mono truncate px-1 py-0.5 rounded border ${
                          ev.isOverdue
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : ev.category === 'TASK'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
                        }`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] font-mono text-slate-400 pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail Panel */}
        <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-4">
          <div className="border-b border-white/5 pb-3">
            <div className="text-[10px] font-mono uppercase text-slate-500">
              AGENDA FOR
            </div>
            <h3 className="text-base font-bold font-hud text-white">
              {selectedDateStr}
            </h3>
            <div className="text-xs font-mono text-cyan-400 mt-0.5">
              {selectedDateEvents.length} recorded events
            </div>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {selectedDateEvents.length === 0 ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                No events or deadlines recorded on this date.
              </div>
            ) : (
              selectedDateEvents.map(ev => (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-cyan-400/30 space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold ${categoryBadges[ev.category] || 'text-slate-400'}`}>
                      {ev.category}
                    </span>
                    <Link
                      to={`/cases/${ev.caseId}`}
                      className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <FolderOpen className="w-3 h-3" />
                      <span>{ev.caseId}</span>
                    </Link>
                  </div>

                  <h4 className="text-xs font-bold font-hud text-white leading-snug">
                    {ev.title}
                  </h4>

                  {ev.isOverdue && (
                    <div className="text-[10px] font-mono text-rose-400 flex items-center gap-1 font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>PAST DUE &bull; IMMEDIATE ACTION REQUIRED</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono text-slate-400">
                    <span>Status: {ev.status || 'Active'}</span>
                    {ev.time && <span>Time: {ev.time}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
