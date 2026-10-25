import React, { useState } from 'react';
import {
  HelpCircle,
  Search,
  BookOpen,
  Mail,
  FolderOpen,
  Shield,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: 'CASES' | 'EVIDENCE' | 'EMAIL' | 'REPORTS' | 'GLOSSARY';
}

const FAQS: FaqItem[] = [
  {
    category: 'CASES',
    question: 'How do I create a new investigation dossier?',
    answer: 'Navigate to "Cases" in the sidebar and click "+ NEW CASE" or use the Command Palette (Ctrl+K -> "Create New Case Dossier"). The 4-step wizard guides you through Identifiers, Classification, Briefing & Tags, and final verification. In-progress drafts are auto-saved to browser storage.'
  },
  {
    category: 'CASES',
    question: 'How is case progress calculated?',
    answer: 'Case progress is data-driven based on real milestones: Evidence collected (30%), Witness verification status (15%), CCTV forensic anomaly capture (15%), Investigation completion checklist items (25%), and operational tasks completed (15%). Solved cases display 100% upon judicial warrant execution.'
  },
  {
    category: 'EVIDENCE',
    question: 'How does the Chain of Custody Tracker operate?',
    answer: 'Every evidence item records its current custodian, physical storage repository, and chronological transfer log. Click "Chain of Custody" on any exhibit card or details view to view earlier transfers or log a new transfer to forensics technicians or judicial lockboxes.'
  },
  {
    category: 'EVIDENCE',
    question: 'What is the difference between Uninspected, Inspected, and Collected exhibits?',
    answer: 'Uninspected exhibits are freshly discovered at the 3D crime scene. Once analyzed under optical, UV, or IR filters, they transition to Inspected. When bagged by CSU, they are Collected and logged into the secure Evidence Locker for spectrometer analysis.'
  },
  {
    category: 'EMAIL',
    question: 'How do Email OTP and Case-Resolution emails work?',
    answer: 'CaseX operates an Express Node.js backend with Nodemailer. For 2FA login, a cryptographic 6-digit OTP is hashed with salted SHA-256 on the server. When marking a case solved, a separate dedicated endpoint dispatches a classified judicial resolution brief. Set GMAIL_USER and GMAIL_APP_PASSWORD (or SMTP credentials) in server environment variables to dispatch real emails.'
  },
  {
    category: 'REPORTS',
    question: 'How do I export and print official case reports?',
    answer: 'Navigate to any case and select the "Reports" tab or click "Printable Case Report" in the workspace. You can preview the executive briefing, exhibit manifest, suspect matrix, and timeline chronology, and click "Print Official Dossier" to trigger your browser print dialog with print-optimized CSS.'
  },
  {
    category: 'GLOSSARY',
    question: 'Glossary: Acoustic Resonance Cutter',
    answer: 'Ultrasonic frequency apparatus capable of inducing micro-vibrations in safe tumblers or metallic locks to bypass pressurized vaults without brute-force physical damage.'
  },
  {
    category: 'GLOSSARY',
    question: 'Glossary: Chain of Custody',
    answer: 'Chronological documentation showing the custody, control, transfer, analysis, and disposition of physical and electronic evidence throughout an investigation.'
  },
  {
    category: 'GLOSSARY',
    question: 'Glossary: Probable Cause Affidavit',
    answer: 'A sworn statement outlining factual biometric, testimonial, and circumstantial corroboration sufficient to warrant judicial arrest indictment.'
  }
];

export const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const filteredFaqs = FAQS.filter(item => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 pb-6 border-b border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>INVESTIGATOR OPERATIONAL MANUAL</span>
        </div>
        <h1 className="text-3xl font-bold font-hud text-white tracking-wide">
          CASEX HELP &amp; KNOWLEDGE BASE
        </h1>
        <p className="text-xs text-slate-400 font-mono max-w-lg mx-auto">
          Comprehensive guides covering dossier workflows, forensics protocols, custody logs, and SMTP configuration.
        </p>

        {/* Search Bar */}
        <div className="pt-4 max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-7" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search help topics, forensic terms, or email settings..."
            className="w-full bg-[#0a0f1d] border border-white/15 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none shadow-xl"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap text-xs font-mono">
        {[
          { id: 'ALL', label: 'All Topics' },
          { id: 'CASES', label: 'Case Management' },
          { id: 'EVIDENCE', label: 'Evidence & Custody' },
          { id: 'EMAIL', label: 'Email & OTP' },
          { id: 'REPORTS', label: 'Reports & Export' },
          { id: 'GLOSSARY', label: 'Forensic Glossary' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              selectedCategory === cat.id
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ Accordions */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-slate-500 bg-[#0a0f1d] rounded-2xl border border-white/10">
            No knowledge base articles match your query.
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-white/10 bg-[#0a0f1d] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 font-bold">
                      {faq.category}
                    </span>
                    <span className="text-xs font-bold font-hud text-white">
                      {faq.question}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-300 font-sans leading-relaxed border-t border-white/5 bg-black/20">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Quick assistance card */}
      <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-cyan-400">
          <BookOpen className="w-4 h-4" />
          <span>Curriculum context: Lectures 1–72 &bull; Front End Engineering ST1 + ST2</span>
        </div>
        <span className="text-slate-500">Every Detail Matters &bull; CaseX 3.0</span>
      </div>
    </div>
  );
};
