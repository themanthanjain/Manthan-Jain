import React, { useEffect, useState } from 'react';
import { generateDataset } from '../services/mockData';
import { analyzeCase } from '../services/mlEngine';
import { generateSchedule } from '../services/scheduler';
import { ScheduleSlot } from '../types';
import { Clock, Calendar, AlertTriangle, Shield, RefreshCw } from 'lucide-react';

const DailySchedule: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSchedule = () => {
    setLoading(true);
    setTimeout(() => {
      // 1. Get raw data
      const cases = generateDataset(30); 
      // 2. Run ML models on all
      const analyzed = cases.map(analyzeCase);
      // 3. Generate Schedule
      const optimized = generateSchedule(analyzed);
      setSchedule(optimized);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Optimized Daily Schedule</h2>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <Calendar size={16} /> {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={loadSchedule}
          className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Regenerate Schedule
        </button>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 p-4 font-semibold text-slate-600 text-sm">
          <div className="col-span-2">Time</div>
          <div className="col-span-2">Case ID</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="animate-spin mx-auto mb-2" size={32} />
            <p>Optimizing timeline...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {schedule.map((slot, index) => {
              const isBreak = slot.case_type === 'Break';
              
              if (isBreak) {
                return (
                  <div key={index} className="bg-slate-100 p-3 text-center text-slate-500 text-sm font-medium tracking-wide">
                    LUNCH BREAK (13:00 - 14:00)
                  </div>
                );
              }

              return (
                <div key={index} className="grid grid-cols-12 p-4 text-sm hover:bg-slate-50 transition-colors items-center group">
                  <div className="col-span-2 font-mono text-slate-700 flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    {slot.time}
                  </div>
                  <div className="col-span-2 font-medium text-blue-700">
                    {slot.case_id}
                  </div>
                  <div className="col-span-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border
                      ${slot.case_type === 'Criminal' ? 'bg-red-50 text-red-700 border-red-100' : 
                        slot.case_type === 'Family' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                      {slot.case_type}
                    </span>
                  </div>
                  <div className="col-span-2 text-slate-600">
                    {slot.duration} mins
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                     <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${Math.min(slot.priority_score * 100, 100)}%` }}></div>
                     </div>
                     <span className="text-xs text-slate-400">{slot.priority_score.toFixed(2)}</span>
                  </div>
                  <div className="col-span-2 text-right flex justify-end gap-2">
                    {slot.risk_flag && (
                      <div className="text-amber-500 bg-amber-50 px-2 py-1 rounded text-xs flex items-center gap-1 border border-amber-100" title="High Delay Risk - Buffer Added">
                         <AlertTriangle size={12} />
                         <span>Buffer</span>
                      </div>
                    )}
                    <div className="text-slate-400 group-hover:text-blue-600 cursor-pointer">
                      <Shield size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-6 text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
          <span>Criminal (High Priority)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-100 border border-amber-200 rounded"></div>
          <span>Risk of Delay (Buffer Added)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded"></div>
          <span>Priority Score Metric</span>
        </div>
      </div>
    </div>
  );
};

export default DailySchedule;