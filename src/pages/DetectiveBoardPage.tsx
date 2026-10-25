import React, { useState } from 'react';
import { useCase } from '../context/CaseContext';
import { BoardNode, BoardConnection } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import {
  Network,
  Plus,
  Trash2,
  Link,
  Sparkles,
  RotateCcw,
  Pin,
  Pencil,
  Search,
  FileText,
  User,
  FolderOpen
} from 'lucide-react';

export const DetectiveBoardPage: React.FC = () => {
  const {
    selectedCase,
    addBoardNode,
    updateBoardNode,
    deleteBoardNode,
    addBoardConnection,
    deleteBoardConnection,
    showToast
  } = useCase();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'SUSPECT' | 'EVIDENCE' | 'MOTIVE' | 'TIMELINE' | 'NOTE'>('NOTE');
  const [newSummary, setNewSummary] = useState('');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Link mode state
  const [linkSourceNodeId, setLinkSourceNodeId] = useState<string | null>(null);

  if (!selectedCase) {
    return <div className="p-8 text-center font-mono text-cyan-400">NO CASE SELECTED</div>;
  }

  const { boardNodes, boardConnections } = selectedCase;

  const handleAddNodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (editingNodeId) {
      updateBoardNode(editingNodeId, { title: newTitle.trim(), type: newType, summary: newSummary.trim() || 'Investigator pinned insight' });
      setIsAddModalOpen(false);
      setEditingNodeId(null);
      setNewTitle('');
      setNewSummary('');
      showToast('Blackboard item updated.');
      return;
    }

    // Place randomly in central area
    const randomX = Math.floor(Math.random() * 60) + 20;
    const randomY = Math.floor(Math.random() * 60) + 20;

    addBoardNode({
      title: newTitle,
      type: newType,
      summary: newSummary || 'Investigator pinned insight',
      x: randomX,
      y: randomY
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewSummary('');
    showToast('New clue node pinned to detective board.');
  };

  const handleNodeClick = (nodeId: string) => {
    if (!linkSourceNodeId) {
      // Start link
      setLinkSourceNodeId(nodeId);
      showToast('Source clue selected. Click second clue to draw forensic connection line.');
    } else if (linkSourceNodeId === nodeId) {
      // Cancel link
      setLinkSourceNodeId(null);
    } else {
      // Create connection
      addBoardConnection({
        fromNodeId: linkSourceNodeId,
        toNodeId: nodeId,
        label: 'Forensic Correlation'
      });
      setLinkSourceNodeId(null);
      showToast('Investigative thread connected.');
    }
  };

  const getNodeById = (id: string) => boardNodes.find((n) => n.id === id);
  const visibleNodes = boardNodes.filter(node => `${node.title} ${node.subtitle || ''} ${node.summary || ''} ${node.type}`.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              SPATIAL EVIDENCE GRAPH // #{selectedCase.id}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            DETECTIVE CORKBOARD & CLUE MAPPING
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Link forensic artifacts, suspects, and motive nodes with connected investigative string threads.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative"><Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search this board" aria-label="Search detective board" className="pl-7 pr-2 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white" /></label>
          {linkSourceNodeId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLinkSourceNodeId(null)}
              className="text-amber-400 border-amber-500/50"
            >
              CANCEL LINKING
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => { setEditingNodeId(null); setNewTitle(''); setNewSummary(''); setIsAddModalOpen(true); }}
            icon={<Plus className="w-4 h-4" />}
          >
            PIN NEW CLUE
          </Button>
        </div>
      </div>

      {/* Interactive Corkboard Canvas */}
      <div className="relative w-full h-[620px] bg-[#070a10] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl p-4 select-none">
        {/* Background Grid Texture */}
        <div className="absolute inset-0 forensic-grid opacity-30 pointer-events-none" />

        {/* SVG Rendered Connection String Threads */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {boardConnections.map((conn) => {
            const from = getNodeById(conn.fromNodeId);
            const to = getNodeById(conn.toNodeId);
            if (!from || !to) return null;

            return (
              <g key={conn.id}>
                {/* Red/Cyan crime string */}
                <line
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />
                <circle cx={`${from.x}%`} cy={`${from.y}%`} r="4" fill="#ef4444" />
                <circle cx={`${to.x}%`} cy={`${to.y}%`} r="4" fill="#ef4444" />
              </g>
            );
          })}
        </svg>

        {/* Clue Nodes on Corkboard */}
        {visibleNodes.map((node) => {
          const isSelectedForLink = linkSourceNodeId === node.id;
          const nodeTypeColor = {
            SUSPECT: 'border-amber-500 text-amber-300',
            EVIDENCE: 'border-cyan-500 text-cyan-300',
            MOTIVE: 'border-rose-500 text-rose-300',
            TIMELINE: 'border-emerald-500 text-emerald-300',
            NOTE: 'border-purple-500 text-purple-300'
          }[node.type];

          return (
            <div
              key={node.id}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => handleNodeClick(node.id)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 w-48 p-3 rounded-xl bg-slate-950/95 border-2 shadow-2xl transition-transform hover:scale-105 cursor-pointer ${nodeTypeColor} ${
                isSelectedForLink
                  ? 'ring-4 ring-cyan-400 scale-110 shadow-[0_0_25px_rgba(6,182,212,0.8)]'
                  : ''
              }`}
            >
              {/* Pin Header Icon */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                    {node.type}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingNodeId(node.id);
                    setNewTitle(node.title);
                    setNewType(node.type as typeof newType);
                    setNewSummary(node.summary || '');
                    setIsAddModalOpen(true);
                  }}
                  className="text-slate-500 hover:text-cyan-300 p-0.5"
                  title="Edit blackboard item"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBoardNode(node.id);
                  }}
                  className="text-slate-500 hover:text-rose-400 p-0.5"
                  title="Remove from board"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Title & Summary */}
              <h4 className="text-xs font-bold font-hud text-white leading-tight truncate">
                {node.title}
              </h4>
              <p className="text-[10px] font-mono text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                {node.summary}
              </p>

              <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono text-slate-400">
                <span>CLICK TO LINK</span>
                <Link className="w-2.5 h-2.5 text-cyan-400" />
              </div>
            </div>
          );
        })}

        {/* Bottom Help Instructions Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-30 p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold">INSTRUCTIONS:</span>
            <span>Click any node once to select it, then click a second node to connect a forensic thread.</span>
          </div>

          <div className="flex items-center gap-2 text-cyan-300">
            <Network className="w-4 h-4" />
            <span>{boardConnections.length} ACTIVE THREADS</span>
          </div>
        </div>
      </div>

      {/* Add Clue Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingNodeId(null); }}
        title={editingNodeId ? 'EDIT BLACKBOARD ITEM' : 'PIN INVESTIGATIVE CLUE'}
        subtitle="ATTACH ARTIFACT OR DEDUCTIVE HYPOTHESIS TO CORKBOARD"
        maxWidth="md"
      >
        <form onSubmit={handleAddNodeSubmit} className="space-y-4 font-mono text-xs text-left">
          <div>
            <label className="text-cyan-400 uppercase block mb-1">Clue Category</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="SUSPECT">SUSPECT NODE</option>
              <option value="EVIDENCE">EVIDENCE ARTIFACT</option>
              <option value="MOTIVE">MOTIVE HYPOTHESIS</option>
              <option value="TIMELINE">TIMELINE EVENT</option>
              <option value="NOTE">INVESTIGATOR NOTE</option>
            </select>
          </div>

          <div>
            <label className="text-cyan-400 uppercase block mb-1">Clue Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Laser Bypass Signature"
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="text-cyan-400 uppercase block mb-1">Observation Summary</label>
            <textarea
              value={newSummary}
              onChange={(e) => setNewSummary(e.target.value)}
              placeholder="Explains the physical technique and ties directly into suspect's technical background..."
              rows={3}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setIsAddModalOpen(false); setEditingNodeId(null); }}
            >
              CANCEL
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingNodeId ? 'SAVE CHANGES' : 'PIN TO BOARD'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
