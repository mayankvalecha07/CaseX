import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCase } from '../context/CaseContext';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  User,
  ShieldCheck,
  Award,
  Mail,
  Calendar,
  FolderOpen,
  CheckCircle2,
  Lock,
  Edit3,
  Save
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { cases, activities, showToast } = useCase();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Pulkit Gupta');
  const [badgeNumber, setBadgeNumber] = useState(user?.badgeNumber || 'DET-7091');
  const [department, setDepartment] = useState(user?.department || 'Digital Forensics Division');

  const solvedCasesCount = cases.filter((c) => c.status === 'SOLVED' || c.warrantData.warrantIssued).length;
  const totalEvidenceCollected = cases.reduce(
    (acc, c) => acc + c.evidenceList.filter((e) => e.status === 'COLLECTED').length,
    0
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !badgeNumber.trim() || !department.trim()) {
      showToast('Name, badge ID, and department are required.', 'error');
      return;
    }
    updateProfile({
      name: name.trim(),
      badgeNumber: badgeNumber.trim(),
      department: department.trim()
    });
    setIsEditing(false);
    showToast('Investigator profile credentials updated.');
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setName(user?.name || 'Pulkit Gupta');
      setBadgeNumber(user?.badgeNumber || 'DET-7091');
      setDepartment(user?.department || 'Digital Forensics Division');
      setIsEditing(false);
      return;
    }
    setIsEditing(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
              PERSONNEL DOSSIER // CLEARANCE LEVEL 5
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-hud text-white">
            INVESTIGATOR PROFILE
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Credential records, clearance privileges, and career forensic performance metrics.
          </p>
        </div>

        <Button
          variant={isEditing ? 'ghost' : 'secondary'}
          size="sm"
          onClick={handleEditToggle}
          icon={isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
        >
          {isEditing ? 'CANCEL' : 'EDIT CREDENTIALS'}
        </Button>
      </div>

      {/* Main Profile Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-cyan-950 flex items-center justify-center text-cyan-400 font-bold font-mono text-3xl">
                  {user?.name?.charAt(0) || 'D'}
                </div>
              )}
            </div>

            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-[#0a0a0a] border border-cyan-400 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Profile Details or Edit Form */}
          {!isEditing ? (
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                  <Badge variant="cyan" size="md">
                    {user?.badgeNumber || 'DET-7091'}
                  </Badge>
                  <Badge variant="purple" size="md">
                    {user?.clearanceLevel || 'LEVEL 5 SPECIAL AGENT'}
                  </Badge>
                  <Badge variant="emerald" size="md" dot>
                    ACTIVE STATUS
                  </Badge>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold font-hud text-white">
                  {user?.name || 'Pulkit Gupta'}
                </h2>
                <p className="text-xs sm:text-sm font-mono text-cyan-400 mt-0.5">
                  {user?.department || 'Digital Forensics Division'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>{user?.email || 'gpulkit1231@gmail.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Joined: {user?.joinedDate || 'Not recorded'}</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="flex-1 space-y-3 font-mono text-xs text-left w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-cyan-400 uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-cyan-400 uppercase block mb-1">Verified email (OTP sign-in)</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-cyan-400 uppercase block mb-1">Badge ID</label>
                  <input
                    type="text"
                    value={badgeNumber}
                    onChange={(e) => setBadgeNumber(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-cyan-400 uppercase block mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" variant="primary" size="sm">
                  SAVE CREDENTIALS
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/35 to-slate-950 border border-cyan-400/15 space-y-2">
          <h3 className="text-cyan-300 font-bold uppercase tracking-wider">Investigator summary</h3>
          <p className="text-slate-300 leading-relaxed">{user?.name || 'Investigator'} is assigned to {user?.department || 'the investigation division'} with {user?.clearanceLevel || 'the account clearance on file'}. Case and evidence totals below are calculated from current shared CaseX records.</p>
          <p className="text-slate-500">Email OTP sign-in remains the verified account identity.</p>
        </div>
        <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-white/10 space-y-2">
          <h3 className="text-cyan-300 font-bold uppercase tracking-wider">Recent shared activity</h3>
          {activities.slice(0, 4).length ? activities.slice(0, 4).map(activity => <p key={activity.id} className="border-b border-white/5 pb-2 text-slate-300">{activity.description}<span className="block mt-1 text-[10px] text-slate-500">{activity.caseId} · {activity.timestamp}</span></p>) : <p className="text-slate-500">No investigation activity has been recorded yet.</p>}
        </div>
      </section>

      {/* Service Record Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
          <span className="text-slate-400 text-xs uppercase block mb-1">TOTAL CASES</span>
          <span className="text-2xl font-bold font-hud text-white">{cases.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
          <span className="text-emerald-400 text-xs uppercase block mb-1">CASES SOLVED</span>
          <span className="text-2xl font-bold font-hud text-emerald-300">{solvedCasesCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
          <span className="text-cyan-400 text-xs uppercase block mb-1">EVIDENCE COLLECTED</span>
          <span className="text-2xl font-bold font-hud text-cyan-300">
            {totalEvidenceCollected}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
          <span className="text-purple-400 text-xs uppercase block mb-1">CLEARANCE LEVEL</span>
          <span className="text-2xl font-bold font-hud text-purple-300">5</span>
        </div>
      </div>
    </div>
  );
};
