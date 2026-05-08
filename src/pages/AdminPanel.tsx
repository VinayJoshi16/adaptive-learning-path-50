import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  LayoutDashboard, Users, BookOpen, ShieldAlert, ClipboardList,
  LogOut, Sun, Moon, Plus, Trash2, Edit, Search, RefreshCw, X, ChevronDown
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '/api';

function adminFetch(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem('admin_token');
  return fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers as any) },
  }).then(async r => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'Request failed'); return d; });
}

/* ════════════════════ Theme Hook ════════════════════ */
function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('admin_theme') !== 'light');
  const toggle = () => setDark(p => { const n = !p; localStorage.setItem('admin_theme', n ? 'dark' : 'light'); return n; });
  return { dark, toggle };
}

/* ════════════════════ Sub-components ════════════════════ */

function StatCard({ label, value, icon: Icon, color, dark }: any) {
  return (
    <div className={`rounded-xl border p-5 flex items-center gap-4 transition-all ${dark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className={`text-2xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        <p className={`text-xs ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{label}</p>
      </div>
    </div>
  );
}

function DataTable({ columns, data, dark, onDelete, emptyMsg }: any) {
  const [search, setSearch] = useState('');
  const filtered = data.filter((r: any) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
          className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm border ${dark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'} focus:outline-none focus:ring-2 focus:ring-amber-500/40`} />
      </div>
      <div className="overflow-x-auto rounded-xl border" style={dark ? { borderColor: 'rgba(255,255,255,.1)' } : {}}>
        <table className="w-full text-sm">
          <thead><tr className={dark ? 'bg-white/5' : 'bg-gray-50'}>
            {columns.map((c: any) => <th key={c.key} className={`px-4 py-3 text-left font-medium ${dark ? 'text-slate-400' : 'text-gray-500'}`}>{c.label}</th>)}
            {onDelete && <th className="px-4 py-3 text-right font-medium">Actions</th>}
          </tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={columns.length + (onDelete ? 1 : 0)} className={`px-4 py-8 text-center ${dark ? 'text-slate-500' : 'text-gray-400'}`}>{emptyMsg || 'No data'}</td></tr>
            ) : filtered.map((row: any, i: number) => (
              <tr key={row.id || i} className={`border-t ${dark ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}>
                {columns.map((c: any) => <td key={c.key} className={`px-4 py-3 ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{c.render ? c.render(row) : row[c.key]}</td>)}
                {onDelete && <td className="px-4 py-3 text-right">
                  <button onClick={() => onDelete(row)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>{filtered.length} of {data.length} records</p>
    </div>
  );
}

/* ════════════════════ Tabs ════════════════════ */

function OverviewTab({ dark }: { dark: boolean }) {
  const [analytics, setAnalytics] = useState<any>(null);
  useEffect(() => { adminFetch('/admin/analytics').then(setAnalytics).catch(() => toast.error('Failed to load analytics')); }, []);
  if (!analytics) return <div className={`text-center py-12 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading analytics…</div>;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard dark={dark} label="Total Students" value={analytics.totalStudents} icon={Users} color="bg-gradient-to-br from-blue-500 to-indigo-600" />
        <StatCard dark={dark} label="Avg Quiz Score" value={`${analytics.avgQuizScore}%`} icon={ClipboardList} color="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard dark={dark} label="Total Violations" value={analytics.totalViolations} icon={ShieldAlert} color="bg-gradient-to-br from-red-500 to-rose-600" />
        <StatCard dark={dark} label="Avg Engagement" value={`${analytics.avgEngagement}%`} icon={LayoutDashboard} color="bg-gradient-to-br from-amber-500 to-orange-600" />
        <StatCard dark={dark} label="Total Sessions" value={analytics.totalSessions} icon={BookOpen} color="bg-gradient-to-br from-violet-500 to-purple-600" />
        <StatCard dark={dark} label="Signups (7d)" value={analytics.recentSignups} icon={Users} color="bg-gradient-to-br from-cyan-500 to-sky-600" />
      </div>
      {Object.keys(analytics.moduleCompletions || {}).length > 0 && (
        <div className={`rounded-xl border p-5 ${dark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
          <h3 className={`font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>Module Completion Rates</h3>
          <div className="space-y-3">
            {Object.entries(analytics.moduleCompletions).map(([id, d]: any) => {
              const pct = d.total > 0 ? Math.round((d.passed / d.total) * 100) : 0;
              return (
                <div key={id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={dark ? 'text-slate-300' : 'text-gray-700'}>{id}</span>
                    <span className={dark ? 'text-slate-400' : 'text-gray-500'}>{d.passed}/{d.total} ({pct}%)</span>
                  </div>
                  <div className={`h-2 rounded-full ${dark ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <div className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StudentsTab({ dark }: { dark: boolean }) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => { setLoading(true); adminFetch('/admin/students').then(d => setStudents(d.students || [])).catch(() => toast.error('Failed')).finally(() => setLoading(false)); }, []);
  useEffect(load, [load]);

  const handleDelete = async (s: any) => {
    if (!confirm(`Delete student "${s.displayName}"? This cannot be undone.`)) return;
    try { await adminFetch(`/admin/students/${s.id}`, { method: 'DELETE' }); toast.success('Student deleted'); load(); } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className={`text-center py-12 ${dark ? 'text-slate-400' : 'text-gray-500'}`}>Loading students…</div>;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{students.length} Students</h3>
        <button onClick={load} className={`p-2 rounded-lg ${dark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'} transition-colors`}><RefreshCw className="w-4 h-4" /></button>
      </div>
      <DataTable dark={dark} onDelete={handleDelete} emptyMsg="No students registered yet"
        columns={[
          { key: 'displayName', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'engagementScore', label: 'Engagement', render: (r: any) => `${r.engagementScore}%` },
          { key: 'modules', label: 'Modules Done', render: (r: any) => Object.keys(r.moduleProgress || {}).length },
          { key: 'violations', label: 'Violations', render: (r: any) => {
            const count = (r.proctoringViolations || []).reduce((s: number, v: any) => s + (v.count || 0), 0);
            return <span className={count > 0 ? 'text-red-400 font-medium' : ''}>{count}</span>;
          }},
          { key: 'createdAt', label: 'Joined', render: (r: any) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—' },
        ]}
        data={students}
      />
    </div>
  );
}

function ModulesTab({ dark }: { dark: boolean }) {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', level: 'beginner', contentType: 'general', description: '', content: '', duration: '10', order: '1', topics: '', videoUrl: '', youtubeUrl: '' });
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const load = useCallback(() => { setLoading(true); adminFetch('/admin/modules').then(d => setModules(d.modules || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  useEffect(load, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminFetch('/admin/modules', { method: 'POST', body: JSON.stringify({ ...form, duration: Number(form.duration), order: Number(form.order), topics: form.topics.split(',').map(t => t.trim()).filter(Boolean) }) });
      toast.success('Module created'); setShowForm(false); setForm({ title: '', level: 'beginner', contentType: 'general', description: '', content: '', duration: '10', order: '1', topics: '', videoUrl: '', youtubeUrl: '' }); load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (m: any) => {
    if (!confirm(`Delete module "${m.title}"?`)) return;
    try { await adminFetch(`/admin/modules/${m.id}`, { method: 'DELETE' }); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  const inputCls = `w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-amber-500/40`;
  const labelCls = `block text-sm font-medium mb-1 ${dark ? 'text-slate-300' : 'text-gray-700'}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Learning Modules</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Cancel' : 'Add Module'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`rounded-xl border p-5 space-y-4 ${dark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelCls}>Title</label><input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
            <div><label className={labelCls}>Content Type</label>
              <select className={inputCls} value={form.contentType} onChange={e => setForm({ ...form, contentType: e.target.value })}>
                <option value="general">📘 General Learning</option><option value="coding">💻 Coding Module</option><option value="practice">📝 Practice Questions</option>
              </select>
            </div>
            <div><label className={labelCls}>Level</label>
              <select className={inputCls} value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
              </select>
            </div>
            <div><label className={labelCls}>Duration (min)</label><input type="number" className={inputCls} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></div>
            <div><label className={labelCls}>Order</label><input type="number" className={inputCls} value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} /></div>
          </div>
          <div><label className={labelCls}>Description</label><input className={inputCls} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
          <div><label className={labelCls}>Topics (comma-separated)</label><input className={inputCls} value={form.topics} onChange={e => setForm({ ...form, topics: e.target.value })} placeholder="Topic 1, Topic 2" /></div>
          <div><label className={labelCls}>Content</label><textarea rows={5} className={inputCls} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required /></div>
          <div className={`rounded-lg border p-3 space-y-3 ${dark ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-gray-500'}`}>🎬 Video Lectures (optional)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><label className={labelCls}>Video URL</label><input className={inputCls} value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://example.com/video.mp4" /></div>
              <div><label className={labelCls}>YouTube URL</label><input className={inputCls} value={form.youtubeUrl} onChange={e => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." /></div>
            </div>
          </div>
          <button type="submit" className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium hover:opacity-90">Create Module</button>
        </form>
      )}

      {loading ? <p className={dark ? 'text-slate-400' : 'text-gray-500'}>Loading…</p> : (
        <div className="space-y-3">
          {modules.length === 0 && <p className={`text-center py-8 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>No modules created yet. Click 'Add Module' to start.</p>}
          {modules.map(mod => (
            <div key={mod.id} className={`rounded-xl border overflow-hidden ${dark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${mod.contentType === 'general' ? 'bg-blue-500/10 text-blue-400' : mod.contentType === 'coding' ? 'bg-violet-500/10 text-violet-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                    {mod.contentType === 'general' ? '📘' : mod.contentType === 'coding' ? '💻' : '📝'}
                  </span>
                  <span className={`font-medium text-sm truncate ${dark ? 'text-white' : 'text-gray-900'}`}>{mod.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${mod.level === 'beginner' ? 'bg-green-500/10 text-green-400' : mod.level === 'intermediate' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>{mod.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${expandedModule === mod.id ? 'bg-amber-500/20 text-amber-400' : `${dark ? 'text-slate-400 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}`}>
                    {expandedModule === mod.id ? '▼ Close Topics' : '▶ Manage Topics'}
                  </button>
                  <button onClick={() => handleDelete(mod)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {expandedModule === mod.id && <SubpartManager dark={dark} moduleId={mod.id} moduleTitle={mod.title} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════ Subpart Manager (inside Modules) ════════════════════ */

function SubpartManager({ dark, moduleId, moduleTitle }: { dark: boolean; moduleId: string; moduleTitle: string }) {
  const [subparts, setSubparts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', order: '1', quizQuestion: '', quizA: '', quizB: '', quizC: '', quizD: '', quizCorrect: 'b', codingQ: '', videoUrl: '', youtubeUrl: '' });

  const inputCls = `w-full px-3 py-2 rounded-lg text-sm border ${dark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-amber-500/40`;
  const labelCls = `block text-sm font-medium mb-1 ${dark ? 'text-slate-300' : 'text-gray-700'}`;

  const load = useCallback(() => { setLoading(true); adminFetch(`/admin/subparts/${moduleId}`).then(d => setSubparts(d.subparts || [])).catch(() => {}).finally(() => setLoading(false)); }, [moduleId]);
  useEffect(load, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quizQuestions = form.quizQuestion ? [{
      question: form.quizQuestion,
      options: { a: form.quizA, b: form.quizB, c: form.quizC, d: form.quizD },
      correctOption: form.quizCorrect,
    }] : [];
    const codingQuestions = form.codingQ ? [{ question: form.codingQ }] : [];
    try {
      await adminFetch('/admin/subparts', { method: 'POST', body: JSON.stringify({ moduleId, title: form.title, content: form.content, order: Number(form.order), quizQuestions, codingQuestions, videoUrl: form.videoUrl, youtubeUrl: form.youtubeUrl }) });
      toast.success('Topic created'); setShowForm(false);
      setForm({ title: '', content: '', order: String(subparts.length + 2), quizQuestion: '', quizA: '', quizB: '', quizC: '', quizD: '', quizCorrect: 'b', codingQ: '', videoUrl: '', youtubeUrl: '' });
      load();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (s: any) => {
    if (!confirm(`Delete topic "${s.title}"?`)) return;
    try { await adminFetch(`/admin/subparts/${s.id}`, { method: 'DELETE' }); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className={`border-t px-4 py-4 space-y-3 ${dark ? 'border-white/10 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
      <div className="flex items-center justify-between">
        <h4 className={`text-sm font-semibold ${dark ? 'text-slate-300' : 'text-gray-700'}`}>Topics in "{moduleTitle}"</h4>
        <button onClick={() => { setShowForm(!showForm); setForm(f => ({ ...f, order: String(subparts.length + 1) })); }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors">
          {showForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />} {showForm ? 'Cancel' : 'Add Topic'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`rounded-lg border p-4 space-y-3 ${dark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2"><label className={labelCls}>Topic Title</label><input className={inputCls} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Introduction to Python" required /></div>
            <div><label className={labelCls}>Order</label><input type="number" className={inputCls} value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} /></div>
          </div>
          <div><label className={labelCls}>Topic Content</label><textarea rows={4} className={inputCls} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write the learning content for this topic..." required /></div>

          <div className={`rounded-lg border p-3 space-y-3 ${dark ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-gray-500'}`}>📋 Quiz Question (optional)</p>
            <input className={inputCls} value={form.quizQuestion} onChange={e => setForm({ ...form, quizQuestion: e.target.value })} placeholder="Enter a quiz question..." />
            {form.quizQuestion && (
              <div className="grid grid-cols-2 gap-2">
                <input className={inputCls} value={form.quizA} onChange={e => setForm({ ...form, quizA: e.target.value })} placeholder="Option A" />
                <input className={inputCls} value={form.quizB} onChange={e => setForm({ ...form, quizB: e.target.value })} placeholder="Option B" />
                <input className={inputCls} value={form.quizC} onChange={e => setForm({ ...form, quizC: e.target.value })} placeholder="Option C" />
                <input className={inputCls} value={form.quizD} onChange={e => setForm({ ...form, quizD: e.target.value })} placeholder="Option D" />
                <div><label className={labelCls}>Correct Answer</label>
                  <select className={inputCls} value={form.quizCorrect} onChange={e => setForm({ ...form, quizCorrect: e.target.value })}>
                    <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className={`rounded-lg border p-3 space-y-2 ${dark ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-gray-500'}`}>💻 Coding Question (optional)</p>
            <textarea rows={2} className={inputCls} value={form.codingQ} onChange={e => setForm({ ...form, codingQ: e.target.value })} placeholder="e.g. Write a function that returns the sum of two numbers..." />
          </div>

          <div className={`rounded-lg border p-3 space-y-2 ${dark ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-gray-500'}`}>🎬 Video Lectures (optional)</p>
            <div className="grid grid-cols-2 gap-2">
              <input className={inputCls} value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} placeholder="Video URL (mp4, webm...)" />
              <input className={inputCls} value={form.youtubeUrl} onChange={e => setForm({ ...form, youtubeUrl: e.target.value })} placeholder="YouTube URL" />
            </div>
          </div>

          <button type="submit" className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">Create Topic</button>
        </form>
      )}

      {loading ? <p className={`text-xs ${dark ? 'text-slate-500' : 'text-gray-400'}`}>Loading topics…</p> : subparts.length === 0 ? (
        <p className={`text-xs text-center py-4 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>No topics yet. Click "Add Topic" to create subparts for this module.</p>
      ) : (
        <div className="space-y-1.5">
          {subparts.map((s, i) => (
            <div key={s.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${dark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:bg-gray-50'} transition-colors`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${dark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>{s.order}</span>
                <span className={`text-sm truncate ${dark ? 'text-slate-300' : 'text-gray-700'}`}>{s.title}</span>
                {(s.quizQuestions || []).length > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400">Quiz</span>}
                {(s.codingQuestions || []).length > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] bg-violet-500/10 text-violet-400">Code</span>}
              </div>
              <button onClick={() => handleDelete(s)} className="p-1 rounded text-red-400 hover:bg-red-500/10"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function ProctoringTab({ dark }: { dark: boolean }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminFetch('/admin/proctoring-logs').then(d => setLogs(d.logs || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <p className={dark ? 'text-slate-400' : 'text-gray-500'}>Loading…</p>;
  return (
    <DataTable dark={dark} emptyMsg="No proctoring violations recorded"
      columns={[
        { key: 'studentName', label: 'Student' },
        { key: 'studentEmail', label: 'Email' },
        { key: 'moduleId', label: 'Module' },
        { key: 'violationCount', label: 'Violations', render: (r: any) => <span className="text-red-400 font-semibold">{r.violationCount}</span> },
        { key: 'date', label: 'Date', render: (r: any) => r.date ? new Date(r.date).toLocaleString() : '—' },
      ]}
      data={logs}
    />
  );
}

function QuizResultsTab({ dark }: { dark: boolean }) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminFetch('/admin/quiz-results').then(d => setResults(d.results || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  if (loading) return <p className={dark ? 'text-slate-400' : 'text-gray-500'}>Loading…</p>;
  return (
    <DataTable dark={dark} emptyMsg="No quiz results yet"
      columns={[
        { key: 'studentName', label: 'Student' },
        { key: 'moduleId', label: 'Module' },
        { key: 'score', label: 'Score', render: (r: any) => <span className={r.score >= 75 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>{r.score}%</span> },
        { key: 'passed', label: 'Status', render: (r: any) => <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{r.passed ? 'Passed' : 'Failed'}</span> },
        { key: 'attempts', label: 'Attempts' },
      ]}
      data={results}
    />
  );
}

/* ════════════════════ Main Admin Panel ════════════════════ */

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'modules', label: 'Modules', icon: BookOpen },
  { id: 'proctoring', label: 'Proctoring', icon: ShieldAlert },
  { id: 'quizzes', label: 'Quiz Results', icon: ClipboardList },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Logged out');
    navigate('/admin/login');
  };

  const bg = dark ? 'bg-[#0f172a]' : 'bg-gray-50';
  const sidebarBg = dark ? 'bg-[#1e293b] border-white/10' : 'bg-white border-gray-200';
  const textPrimary = dark ? 'text-white' : 'text-gray-900';
  const textSecondary = dark ? 'text-slate-400' : 'text-gray-500';

  return (
    <div className={`min-h-screen ${bg} flex transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 ${sidebarBg} border-r min-h-screen sticky top-0`}>
        <div className="p-5 border-b" style={dark ? { borderColor: 'rgba(255,255,255,.1)' } : {}}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`font-bold text-sm ${textPrimary}`}>PALM Admin</h2>
              <p className={`text-xs ${textSecondary}`}>Control Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400' : `${dark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-2" style={dark ? { borderColor: 'rgba(255,255,255,.1)' } : {}}>
          <button onClick={toggle} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${dark ? 'text-slate-400 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100'} transition-colors`}>
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className={`md:hidden sticky top-0 z-40 ${sidebarBg} border-b px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center"><ShieldAlert className="w-4 h-4 text-white" /></div>
            <span className={`font-bold text-sm ${textPrimary}`}>Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className={`p-2 rounded-lg ${dark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>{dark ? <Sun className="w-4 h-4 text-slate-400" /> : <Moon className="w-4 h-4 text-gray-500" />}</button>
            <button onClick={handleLogout} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10"><LogOut className="w-4 h-4" /></button>
          </div>
        </header>

        {/* Mobile tabs */}
        <div className="md:hidden flex overflow-x-auto gap-1 px-4 py-2 border-b" style={dark ? { borderColor: 'rgba(255,255,255,.1)' } : {}}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-amber-500/20 text-amber-400' : `${dark ? 'text-slate-400' : 'text-gray-500'}`}`}>
                <Icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 max-w-7xl">
          <h1 className={`text-2xl font-bold mb-6 ${textPrimary}`}>
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          {activeTab === 'overview' && <OverviewTab dark={dark} />}
          {activeTab === 'students' && <StudentsTab dark={dark} />}
          {activeTab === 'modules' && <ModulesTab dark={dark} />}
          {activeTab === 'proctoring' && <ProctoringTab dark={dark} />}
          {activeTab === 'quizzes' && <QuizResultsTab dark={dark} />}
        </div>
      </div>
    </div>
  );
}
