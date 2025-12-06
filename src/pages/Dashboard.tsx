import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSessions, getSessionsByStudent, getSessionStats, clearSessions, LearningSession } from '@/lib/session-store';
import { useLearning } from '@/contexts/LearningContext';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  User,
  Calendar,
  Trash2,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Dashboard() {
  const { state, setStudentId } = useLearning();
  const [inputId, setInputId] = useState(state.studentId);
  const [refreshKey, setRefreshKey] = useState(0);

  const sessions = useMemo(() => {
    return getSessionsByStudent(state.studentId);
  }, [state.studentId, refreshKey]);

  const stats = useMemo(() => {
    return getSessionStats(state.studentId);
  }, [state.studentId, refreshKey]);

  const chartData = useMemo(() => {
    return sessions.map((s, index) => ({
      session: `S${index + 1}`,
      engagement: s.engagementScore,
      quiz: s.quizScore,
      module: s.moduleTitle,
    }));
  }, [sessions]);

  const pieData = useMemo(() => {
    return [
      { name: 'Advanced', value: stats.advancedCount, color: 'hsl(var(--success))' },
      { name: 'Repeat', value: stats.repeatCount, color: 'hsl(var(--warning))' },
      { name: 'Remedial', value: stats.remedialCount, color: 'hsl(var(--destructive))' },
    ].filter(d => d.value > 0);
  }, [stats]);

  const handleStudentChange = () => {
    setStudentId(inputId);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all session data?')) {
      clearSessions();
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="animate-fade-in">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                <BarChart3 className="w-4 h-4" />
                Learning Analytics
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-1">
                <User className="w-4 h-4 text-muted-foreground ml-2" />
                <Input
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  placeholder="Student ID"
                  className="w-32 border-0 bg-transparent h-8 focus-visible:ring-0"
                />
                <Button size="sm" onClick={handleStudentChange}>
                  Load
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setRefreshKey(prev => prev + 1)}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleClearData}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border shadow-soft p-6">
              <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
              <p className="font-display text-3xl font-bold text-foreground">
                {stats.totalSessions}
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border shadow-soft p-6">
              <p className="text-sm text-muted-foreground mb-1">Avg Engagement</p>
              <p className="font-display text-3xl font-bold text-primary">
                {stats.avgEngagement}%
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border shadow-soft p-6">
              <p className="text-sm text-muted-foreground mb-1">Avg Quiz Score</p>
              <p className="font-display text-3xl font-bold text-accent">
                {stats.avgQuizScore}%
              </p>
            </div>
            <div className="bg-card rounded-xl border border-border shadow-soft p-6">
              <p className="text-sm text-muted-foreground mb-1">Advanced Recs</p>
              <p className="font-display text-3xl font-bold text-success">
                {stats.advancedCount}
              </p>
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-card rounded-xl border border-border shadow-soft p-12 text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                No Sessions Yet
              </h2>
              <p className="text-muted-foreground mb-6">
                Complete a learning session to see your analytics here.
              </p>
              <Button asChild variant="hero">
                <a href="/learn">Start Learning</a>
              </Button>
            </div>
          ) : (
            <>
              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Performance Over Time */}
                <div className="bg-card rounded-xl border border-border shadow-soft p-6">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                    Performance Over Time
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="session" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="engagement" 
                          name="Engagement"
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="quiz" 
                          name="Quiz Score"
                          stroke="hsl(var(--accent))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--accent))' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Score Comparison */}
                <div className="bg-card rounded-xl border border-border shadow-soft p-6">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                    Session Scores
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="session" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Legend />
                        <Bar 
                          dataKey="engagement" 
                          name="Engagement"
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="quiz" 
                          name="Quiz Score"
                          fill="hsl(var(--accent))" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recommendations Distribution & Session History */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Pie Chart */}
                <div className="bg-card rounded-xl border border-border shadow-soft p-6">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                    Recommendations
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Session History */}
                <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-soft p-6">
                  <h3 className="font-display font-semibold text-lg text-foreground mb-4">
                    Session History
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Module</th>
                          <th className="text-center py-2 px-3 font-medium text-muted-foreground">Engagement</th>
                          <th className="text-center py-2 px-3 font-medium text-muted-foreground">Quiz</th>
                          <th className="text-left py-2 px-3 font-medium text-muted-foreground">Recommendation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessions.slice().reverse().map((session) => (
                          <tr key={session.id} className="border-b border-border/50 hover:bg-muted/30">
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(session.timestamp).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-2 px-3 font-medium">{session.moduleTitle}</td>
                            <td className="py-2 px-3 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                session.engagementScore >= 70 ? "bg-success/10 text-success" :
                                session.engagementScore >= 40 ? "bg-warning/10 text-warning" :
                                "bg-destructive/10 text-destructive"
                              )}>
                                {session.engagementScore}%
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                session.quizScore >= 70 ? "bg-success/10 text-success" :
                                session.quizScore >= 40 ? "bg-warning/10 text-warning" :
                                "bg-destructive/10 text-destructive"
                              )}>
                                {session.quizScore}%
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <div className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                session.recommendation === 'advanced' && "bg-success/10 text-success",
                                session.recommendation === 'repeat' && "bg-warning/10 text-warning",
                                session.recommendation === 'remedial' && "bg-destructive/10 text-destructive"
                              )}>
                                {session.recommendation === 'advanced' && <TrendingUp className="w-3 h-3" />}
                                {session.recommendation === 'repeat' && <Minus className="w-3 h-3" />}
                                {session.recommendation === 'remedial' && <TrendingDown className="w-3 h-3" />}
                                <span className="capitalize">{session.recommendation}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
