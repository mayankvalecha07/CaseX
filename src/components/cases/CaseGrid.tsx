import React from 'react';
import { InvestigationCase } from '../../types';
import { CaseCard } from './CaseCard';
import { motion } from 'motion/react';
import { SearchX } from 'lucide-react';

interface CaseGridProps {
  cases: InvestigationCase[];
  onViewCase: (caseData: InvestigationCase) => void;
  activeCaseId?: string | null;
}

export const CaseGrid: React.FC<CaseGridProps> = ({
  cases,
  onViewCase,
  activeCaseId
}) => {
  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[#090d16]/60 border border-slate-800/80 my-6">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-white font-mono uppercase tracking-wider">
          NO CASES FOUND
        </h4>
        <p className="text-xs font-mono text-slate-400 mt-1 max-w-sm">
          No classified investigations match the active search query or filter parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cases.map((caseItem, idx) => (
        <motion.div
          key={caseItem.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: idx * 0.05 }}
        >
          <CaseCard
            caseData={caseItem}
            onViewCase={onViewCase}
            isActive={caseItem.id === activeCaseId}
          />
        </motion.div>
      ))}
    </div>
  );
};
