import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CosmoHealthDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    declined: 0,
    pending: 0,
    approvalRate: 0,
    byAntibiotic: {},
    byWard: {},
  });

  // Your Sheety API endpoint
  const SHEETY_URL = 'https://api.sheety.co/3f8ed38ec6cb4d5131024c60be0f9f80/antibioticDeEscalationAuditTrail/sheet1';

  useEffect(() => {
    fetchAndAnalyzeData();
    // Refresh every 30 seconds for live updates
    const interval = setInterval(fetchAndAnalyzeData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAndAnalyzeData = async () => {
    try {
      const response = await fetch(SHEETY_URL);
      const json = await response.json();
      const records = json.rows || [];
      analyzeData(records);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const analyzeData = (records) => {
    setData(records);

    const total = records.length;
    const approved = records.filter(r => r.clinicianDecision === 'Approve' || r.clinicianDecision === 'approve').length;
    const declined = records.filter(r => r.clinicianDecision === 'Decline' || r.clinicianDecision === 'decline').length;
    const pending = records.filter(r => !r.clinicianDecision || r.clinicianDecision === '').length;
    const approvalRate = total > 0 ? Math.round((approved / (approved + declined)) * 100) : 0;

    // Group by antibiotic
    const byAntibiotic = {};
    records.forEach(r => {
      const abx = r.currentAntibiotic || 'Unknown';
      if (!byAntibiotic[abx]) {
        byAntibiotic[abx] = { name: abx, approved: 0, declined: 0, pending: 0 };
      }
      if (r.clinicianDecision === 'Approve' || r.clinicianDecision === 'approve') {
        byAntibiotic[abx].approved++;
      } else if (r.clinicianDecision === 'Decline' || r.clinicianDecision === 'decline') {
        byAntibiotic[abx].declined++;
      } else {
        byAntibiotic[abx].pending++;
      }
    });

    // Group by ward
    const byWard = {};
    records.forEach(r => {
      const ward = r.patientId?.substring(0, 3) || 'Unknown';
      if (!byWard[ward]) {
        byWard[ward] = { name: ward, approved: 0, declined: 0, pending: 0 };
      }
      if (r.clinicianDecision === 'Approve' || r.clinicianDecision === 'approve') {
        byWard[ward].approved++;
      } else if (r.clinicianDecision === 'Decline' || r.clinicianDecision === 'decline') {
        byWard[ward].declined++;
      } else {
        byWard[ward].pending++;
      }
    });

    setStats({
      total,
      approved,
      declined,
      pending,
      approvalRate,
      byAntibiotic: Object.values(byAntibiotic),
      byWard: Object.values(byWard),
    });
  };

  const pieData = [
    { name: 'Approved', value: stats.approved, color: '#10b981' },
    { name: 'Declined', value: stats.declined, color: '#ef4444' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Loading CosmoHealth...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Playfair+Display:wght@700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        .dashboard-title { font-family: 'Playfair Display', serif; }
      `}</style>

      {/* Header */}
      <div className="mb-12">
        <h1 className="dashboard-title text-5xl font-bold text-white mb-2">CosmoHealth</h1>
        <p className="text-slate-400 text-lg">Antibiotic De-escalation Intelligence Dashboard</p>
        <p className="text-slate-500 text-sm mt-2">Live data from Google Sheets • Updates every 30 seconds</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
        {/* Total Recommendations */}
        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <p className="text-cyan-100 text-sm font-semibold uppercase tracking-wide">Total</p>
          <p className="text-4xl font-bold text-white mt-2">{stats.total}</p>
          <div className="mt-4 h-1 bg-cyan-400 rounded-full w-12"></div>
        </div>

        {/* Approved */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <p className="text-emerald-100 text-sm font-semibold uppercase tracking-wide">Approved</p>
          <p className="text-4xl font-bold text-white mt-2">{stats.approved}</p>
          <div className="mt-4 h-1 bg-emerald-400 rounded-full w-12"></div>
        </div>

        {/* Declined */}
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <p className="text-rose-100 text-sm font-semibold uppercase tracking-wide">Declined</p>
          <p className="text-4xl font-bold text-white mt-2">{stats.declined}</p>
          <div className="mt-4 h-1 bg-rose-400 rounded-full w-12"></div>
        </div>

        {/* Pending */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <p className="text-amber-100 text-sm font-semibold uppercase tracking-wide">Pending</p>
          <p className="text-4xl font-bold text-white mt-2">{stats.pending}</p>
          <div className="mt-4 h-1 bg-amber-400 rounded-full w-12"></div>
        </div>

        {/* Approval Rate */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-shadow">
          <p className="text-indigo-100 text-sm font-semibold uppercase tracking-wide">Approval %</p>
          <p className="text-4xl font-bold text-white mt-2">{stats.approvalRate}%</p>
          <div className="mt-4 h-1 bg-indigo-400 rounded-full w-12"></div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Approval Pie Chart */}
        <div className="bg-slate-800 rounded-xl p-8 shadow-xl border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Approval Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence Distribution */}
        <div className="bg-slate-800 rounded-xl p-8 shadow-xl border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">AI Confidence Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data.slice(0, 10).map((d, i) => ({
                index: i,
                confidence: Math.round((d.aiConfidenceScore || 0) * 100),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="index" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: '#06b6d4', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Antibiotic & Ward Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* By Antibiotic */}
        <div className="bg-slate-800 rounded-xl p-8 shadow-xl border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Decisions by Antibiotic</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.byAntibiotic}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[8, 8, 0, 0]} />
              <Bar dataKey="declined" fill="#ef4444" name="Declined" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By Ward */}
        <div className="bg-slate-800 rounded-xl p-8 shadow-xl border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Decisions by Ward</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.byWard}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Bar dataKey="approved" fill="#10b981" name="Approved" radius={[8, 8, 0, 0]} />
              <Bar dataKey="declined" fill="#ef4444" name="Declined" radius={[8, 8, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-12 bg-slate-800 rounded-xl p-8 shadow-xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Recommendations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Patient</th>
                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Antibiotic</th>
                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Recommendation</th>
                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Decision</th>
                <th className="text-left py-3 px-4 text-slate-400 font-semibold">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, idx) => (
                <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <td className="py-3 px-4 text-slate-200">{row.patientName || 'N/A'}</td>
                  <td className="py-3 px-4 text-slate-200">{row.currentAntibiotic || 'N/A'}</td>
                  <td className="py-3 px-4 text-slate-300 text-xs">{row.deEscalationRecommendation || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        row.clinicianDecision === 'Approve' || row.clinicianDecision === 'approve'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : row.clinicianDecision === 'Decline' || row.clinicianDecision === 'decline'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {row.clinicianDecision || 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200">{Math.round((row.aiConfidenceScore || 0) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-slate-500 text-sm">
        <p>CosmoHealth Dashboard • Real-time Antibiotic De-escalation Intelligence</p>
      </div>
    </div>
  );
}
