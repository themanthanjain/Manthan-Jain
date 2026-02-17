import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { generateDataset } from '../services/mockData';
import { analyzeCase } from '../services/mlEngine';
import { CourtCase } from '../types';
import { Users, Clock, CheckCircle, AlertTriangle, Filter } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [allCases, setAllCases] = useState<CourtCase[]>([]);
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const [stats, setStats] = useState({
    total: 0,
    mediation: 0,
    delayed: 0,
    savedHours: 0
  });

  const [caseTypeData, setCaseTypeData] = useState<any[]>([]);

  useEffect(() => {
    // Initial Load
    const rawData = generateDataset(100);
    const analyzed = rawData.map(analyzeCase);
    setAllCases(analyzed);
  }, []);

  useEffect(() => {
    let result = allCases;

    // Apply Case Type Filter
    if (filterType !== 'All') {
      result = result.filter(c => c.case_type === filterType);
    }

    // Apply Status Filter
    if (filterStatus === 'Mediation Recommended') {
      result = result.filter(c => c.settlement_possible);
    } else if (filterStatus === 'High Delay Risk') {
      result = result.filter(c => c.likely_delay);
    }

    // Calculate Stats
    const total = result.length;
    const mediationCount = result.filter(c => c.settlement_possible).length;
    const delayedCount = result.filter(c => c.likely_delay).length;
    // Calculate saved hours (assuming mediation saves ~3 hearings of 20 mins each)
    const savedHours = Math.round((mediationCount * 3 * 20) / 60);

    setStats({
      total,
      mediation: mediationCount,
      delayed: delayedCount,
      savedHours
    });

    // Chart Data
    const types = result.reduce((acc, curr) => {
      acc[curr.case_type] = (acc[curr.case_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setCaseTypeData(Object.keys(types).map(k => ({ name: k, value: types[k] })));

  }, [allCases, filterType, filterStatus]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-slate-800">Judicial Dashboard</h2>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-2 text-slate-500">
            <Filter size={16} />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <select 
            className="text-sm border-slate-200 rounded-md py-1.5 pl-2 pr-8 bg-slate-50 hover:bg-slate-100 focus:ring-2 focus:ring-blue-100 outline-none border"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Case Types</option>
            <option value="Civil">Civil</option>
            <option value="Criminal">Criminal</option>
            <option value="Family">Family</option>
            <option value="Traffic">Traffic</option>
            <option value="Consumer">Consumer</option>
          </select>

          <select 
            className="text-sm border-slate-200 rounded-md py-1.5 pl-2 pr-8 bg-slate-50 hover:bg-slate-100 focus:ring-2 focus:ring-blue-100 outline-none border"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Mediation Recommended">Mediation Recommended</option>
            <option value="High Delay Risk">High Delay Risk</option>
          </select>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Filtered Cases</p>
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
              <p className="text-xs text-green-600 mt-1">{stats.total > 0 ? (stats.mediation/stats.total * 100).toFixed(0) : 0}% of selection</p>
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
              <p className="text-xs text-purple-500 mt-1">Projected from selection</p>
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