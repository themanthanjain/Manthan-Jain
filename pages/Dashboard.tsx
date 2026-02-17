import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { generateDataset } from '../services/mockData';
import { analyzeCase } from '../services/mlEngine';
import { CourtCase } from '../types';
import { Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    mediation: 0,
    delayed: 0,
    savedHours: 0
  });

  const [caseTypeData, setCaseTypeData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate fetching and analyzing bulk data
    const rawData = generateDataset(100);
    const analyzed = rawData.map(analyzeCase);
    
    const mediationCount = analyzed.filter(c => c.settlement_possible).length;
    const delayedCount = analyzed.filter(c => c.likely_delay).length;
    
    // Calculate saved hours (assuming mediation saves ~3 hearings of 20 mins each)
    const savedHours = Math.round((mediationCount * 3 * 20) / 60);

    setStats({
      total: 100,
      mediation: mediationCount,
      delayed: delayedCount,
      savedHours
    });

    // Chart Data
    const types = analyzed.reduce((acc, curr) => {
      acc[curr.case_type] = (acc[curr.case_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setCaseTypeData(Object.keys(types).map(k => ({ name: k, value: types[k] })));

  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Judicial Dashboard</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total Active Cases</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Diverted to Mediation</p>
              <h3 className="text-3xl font-bold text-green-600 mt-1">{stats.mediation}</h3>
              <p className="text-xs text-green-600 mt-1">{(stats.mediation/stats.total * 100).toFixed(0)}% of caseload</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">High Delay Risk</p>
              <h3 className="text-3xl font-bold text-red-600 mt-1">{stats.delayed}</h3>
              <p className="text-xs text-red-500 mt-1">Require intervention</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Judicial Time Saved</p>
              <h3 className="text-3xl font-bold text-purple-600 mt-1">{stats.savedHours} hrs</h3>
              <p className="text-xs text-purple-500 mt-1">This month projection</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Case Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={caseTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {caseTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-80">
           <h3 className="text-lg font-semibold text-slate-700 mb-4">Backlog Reduction Projection</h3>
           <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[
                { name: 'Mon', Standard: 40, AI_Optimized: 55 },
                { name: 'Tue', Standard: 35, AI_Optimized: 58 },
                { name: 'Wed', Standard: 45, AI_Optimized: 60 },
                { name: 'Thu', Standard: 38, AI_Optimized: 52 },
                { name: 'Fri', Standard: 42, AI_Optimized: 59 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Standard" fill="#cbd5e1" name="Traditional Clearing" />
              <Bar dataKey="AI_Optimized" fill="#2563eb" name="NyayaFlow Clearing" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;