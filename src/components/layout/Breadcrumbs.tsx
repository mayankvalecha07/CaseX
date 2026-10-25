import React from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useCase } from '../../context/CaseContext';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { caseId } = useParams<{ caseId?: string }>();
  const { selectedCase, cases } = useCase();

  // Parse path segments
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
        <Home className="w-3.5 h-3.5 text-cyan-400" />
        <span>COMMAND CENTER</span>
      </nav>
    );
  }

  const currentCase = caseId ? cases.find(c => c.id === caseId) || selectedCase : selectedCase;

  // Build breadcrumb items
  const breadcrumbs: { label: string; to: string; isCurrent: boolean }[] = [
    { label: 'HOME', to: '/dashboard', isCurrent: false }
  ];

  let currentPath = '';

  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isCurrent = index === pathnames.length - 1;

    let label = segment.toUpperCase();

    if (segment === 'cases') {
      label = 'CASE ARCHIVE';
    } else if (segment === caseId) {
      label = currentCase ? `CASE #${currentCase.id}` : segment;
    } else if (segment === 'crime-scene') {
      label = 'CRIME SCENE';
    } else if (segment === 'evidence') {
      label = 'EVIDENCE';
    } else if (segment === 'timeline') {
      label = 'TIMELINE';
    } else if (segment === 'suspects') {
      label = 'SUSPECTS';
    } else if (segment === 'witnesses') {
      label = 'WITNESSES';
    } else if (segment === 'notes') {
      label = 'INVESTIGATION NOTES';
    } else if (segment === 'intelligence') {
      label = 'EXTERNAL INTELLIGENCE';
    } else if (segment === 'profile') {
      label = 'INVESTIGATOR PROFILE';
    } else if (segment === 'settings') {
      label = 'SYSTEM SETTINGS';
    } else if (segment === 'new') {
      label = 'NEW RECORD';
    } else if (segment === 'edit') {
      label = 'EDIT RECORD';
    }

    breadcrumbs.push({ label, to: currentPath, isCurrent });
  });

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 truncate max-w-xl">
      {breadcrumbs.map((crumb, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return (
          <React.Fragment key={crumb.to + idx}>
            {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />}
            {isLast ? (
              <span className="text-cyan-300 font-bold truncate max-w-[200px]" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.to}
                className="hover:text-white transition-colors truncate max-w-[140px]"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
