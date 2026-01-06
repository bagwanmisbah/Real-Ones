import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { ShieldAlert, Activity, Users, Clock, Terminal, Info } from 'lucide-react';

const AdminDashboard = ({ onNavigate }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Poll the API every 2 seconds for "Live" feel
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/admin/stats');
        const json = await res.json();
        setData(json);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Live Refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Security Operations Center...</div>;

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 font-sans">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="text-red-600" /> SECURITY OPS CENTER
          </h1>
          <p className="text-gray-500 text-sm">Real-time Threat Monitoring & Bot Forensics</p>
        </div>
        <button onClick={() => onNavigate('login')} className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded text-sm shadow-sm transition-colors">
          Back to Login App
        </button>
      </header>

      {/* TOP ROW: KEY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard 
          title="Total Attacks" 
          value={data.recent_logs.length} 
          icon={<ShieldAlert size={20} className="text-red-500" />} 
          trend="+12% this hour"
        />
        <MetricCard 
          title="Avg Confidence" 
          value="98.5%" 
          icon={<Activity size={20} className="text-blue-500" />} 
          trend="High Precision"
        />
        <MetricCard 
          title="Active Ghosts" 
          value={data.zoo_data.find(x => x.name.includes('Ghost'))?.value || 0} 
          icon={<Users size={20} className="text-purple-500" />} 
          trend="Headless Browsers"
        />
        <MetricCard 
          title="Last Attack" 
          value={new Date(data.recent_logs[0]?.time).toLocaleTimeString()} 
          icon={<Clock size={20} className="text-orange-500" />} 
          trend="Just now"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* CHART 1: ATTACK FUNNEL (Defense Efficiency) */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 overflow-visible">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <ShieldAlert size={18} className="text-gray-500" /> Defense Efficiency
             </h3>
             <InfoTooltip text="Shows which security layer is stopping the most bots. High numbers on 'Honeypot' or 'Ghost' mean your cheap traps are working well. 'Model' catches the smart ones." />
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.funnel_data} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} itemStyle={{color: '#374151'}} cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                  {data.funnel_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: THE ZOO (Bot Types) */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 overflow-visible">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <Users size={18} className="text-gray-500" /> Bot Classification
             </h3>
             <InfoTooltip text="Breakdown of bot personalities. 'Ghosts' are headless browsers. 'Statues' are bots that injected clicks without moving the mouse." />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                    data={data.zoo_data} 
                    cx="50%" cy="50%" 
                    innerRadius={60} 
                    outerRadius={80} 
                    paddingAngle={5} 
                    dataKey="value"
                >
                  {data.zoo_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} itemStyle={{color: '#374151'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: CRON JOB DETECTOR (Hourly Heatmap) */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 overflow-visible">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <Clock size={18} className="text-gray-500" /> Cron Job Detector
             </h3>
             <InfoTooltip text="Heatmap of attack times. Sharp spikes at specific hours (e.g., 3:00 AM) usually indicate automated 'Cron Job' scripts running on a schedule." />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.heatmap_data}>
                <defs>
                  <linearGradient id="colorBots" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="hour" tick={{fontSize: 10, fill: '#6b7280'}} interval={3} />
                <YAxis hide />
                <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} itemStyle={{color: '#374151'}} />
                <Area type="monotone" dataKey="bots" stroke="#ef4444" fillOpacity={1} fill="url(#colorBots)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: LIVE FEED & VOLUME */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LIVE THREAT MONITOR */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 overflow-visible">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <Terminal size={18} className="text-gray-500" /> Live Threat Feed
             </h3>
             <InfoTooltip text="A real-time ticker of blocked attempts. Look for rapid bursts of RED logs from the same source." />
          </div>

          <div className="overflow-y-auto max-h-64 space-y-2 pr-2 custom-scrollbar">
            {data.recent_logs.map((log) => (
              <div key={log.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border-l-4 border-gray-300 hover:bg-gray-100 transition-colors">
                <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${log.verdict === 'BOT' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {log.verdict}
                    </span>
                    <span className="ml-3 text-sm text-gray-700 font-medium">{log.source}</span>
                </div>
                <div className="text-right">
                    <div className="text-xs text-gray-400">{new Date(log.time).toLocaleTimeString()}</div>
                    <div className="text-xs text-gray-500 font-semibold">{log.score.toFixed(1)}% Conf</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HUMAN vs MACHINE OVERLAP */}
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 overflow-visible">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                    <Activity size={18} className="text-gray-500" /> Traffic Volume
                </h3>
                <InfoTooltip text="Comparison of traffic volume. If the RED line (Bots) mirrors the GREEN line (Humans), attackers are trying to blend in with peak hours." />
            </div>

            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.volume_data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#6b7280'}} />
                    <YAxis tick={{fill: '#6b7280'}} />
                    <Tooltip contentStyle={{backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} itemStyle={{color: '#374151'}} />
                    <Legend />
                    <Line type="monotone" dataKey="humans" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="bots" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{r: 6}} />
                </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>
    </div>
  );
};

// --- NEW COMPONENT: INFO TOOLTIP (CSS ONLY) ---
// This uses 'group-hover' to show the text. No JS = No Errors.
const InfoTooltip = ({ text }) => (
    <div className="relative group cursor-help">
        <Info size={16} className="text-gray-400 hover:text-blue-500 transition-colors" />
        <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50">
            {text}
            {/* Tiny arrow pointing down */}
            <div className="absolute bottom-[-4px] right-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
    </div>
);

// Simple Stats Card Component
const MetricCard = ({ title, value, icon, trend }) => (
  <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center justify-between transition-transform hover:-translate-y-1">
    <div>
      <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{title}</p>
      <h2 className="text-3xl font-bold text-gray-900 mt-1">{value}</h2>
      <p className="text-green-600 text-xs mt-1 font-medium bg-green-50 inline-block px-1 rounded">{trend}</p>
    </div>
    <div className="bg-gray-50 p-4 rounded-full border border-gray-100">
      {icon}
    </div>
  </div>
);

export default AdminDashboard;