import React, { useState } from 'react';
import { generateRandomCase } from '../services/mockData';
import { analyzeCase, predictSettlement, predictDelay, predictDuration } from '../services/mlEngine';
import { generateMediationAgreement } from '../services/scheduler';
import { CourtCase } from '../types';
import { Wand2, AlertCircle, FileText, Check, X } from 'lucide-react';

const CaseIntake: React.FC = () => {
  const [currentCase, setCurrentCase] = useState<CourtCase | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  const handleGenerate = () => {
    setShowAgreement(false);
    setAnalyzing(true);
    // Simulate API delay
    setTimeout(() => {
      const random = generateRandomCase(Math.floor(Math.random() * 1000));
      const analyzed = analyzeCase(random);
      setCurrentCase(analyzing ? analyzed : analyzed); // Force update
      setAnalyzing(false);
    }, 600);
  };

  const getReliabilityColor = (val: number) => {
    if (val > 0.8) return 'text-green-600';
    if (val > 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-slate-800">Case Intake & Analysis</h2>
           <p className="text-slate-500 mt-1">Enter case details or generate sample data for AI Prediction.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={analyzing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-lg shadow-blue-200"
        >
          {analyzing ? 'Analyzing...' : <><Wand2 size={18} /> Generate & Analyze Sample Case</>}
        </button>
      </div>

      {currentCase ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Case Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-700 mb-4 border-b pb-2">Case Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Case ID</span>
                <span className="font-mono font-medium">{currentCase.case_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">{currentCase.case_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Filing Year</span>
                <span>{currentCase.filing_year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Age</span>
                <span>{currentCase.case_age_days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Claim Amount</span>
                <span className="font-medium">₹{currentCase.claim_amount.toLocaleString()}</span>
              </div>
              <div className="h-px bg-slate-100 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Lawyer Reliability</span>
                <span className={`font-bold ${getReliabilityColor(currentCase.lawyer_reliability)}`}>
                  {(currentCase.lawyer_reliability * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Docs Completeness</span>
                <span className={`font-bold ${getReliabilityColor(currentCase.document_completeness)}`}>
                  {(currentCase.document_completeness * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* AI Predictions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Prediction Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Settlement Prediction */}
              <div className={`p-5 rounded-xl border-l-4 shadow-sm ${currentCase.settlement_possible ? 'bg-green-50 border-green-500' : 'bg-slate-50 border-slate-400'}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Mediation Feasibility</h4>
                <div className="flex items-center gap-2 mb-2">
                   {currentCase.settlement_possible ? <Check className="text-green-600" /> : <X className="text-slate-400" />}
                   <span className={`text-xl font-bold ${currentCase.settlement_possible ? 'text-green-700' : 'text-slate-600'}`}>
                     {currentCase.settlement_possible ? 'Recommended' : 'Unlikely'}
                   </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                  <div 
                    className={`h-1.5 rounded-full ${currentCase.settlement_possible ? 'bg-green-500' : 'bg-slate-400'}`} 
                    style={{ width: `${(currentCase.settlement_prob || 0) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-right">Confidence: {((currentCase.settlement_prob || 0) * 100).toFixed(0)}%</p>
              </div>

              {/* Delay Prediction */}
              <div className={`p-5 rounded-xl border-l-4 shadow-sm ${currentCase.likely_delay ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-400'}`}>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Delay Risk</h4>
                <div className="flex items-center gap-2 mb-2">
                   {currentCase.likely_delay ? <AlertCircle className="text-red-600" /> : <Check className="text-blue-600" />}
                   <span className={`text-xl font-bold ${currentCase.likely_delay ? 'text-red-700' : 'text-blue-700'}`}>
                     {currentCase.likely_delay ? 'High Risk' : 'Low Risk'}
                   </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                  <div 
                    className={`h-1.5 rounded-full ${currentCase.likely_delay ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${(currentCase.delay_prob || 0) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-right">Probability: {((currentCase.delay_prob || 0) * 100).toFixed(0)}%</p>
              </div>

              {/* Duration Prediction */}
              <div className="p-5 rounded-xl border-l-4 border-purple-500 bg-purple-50 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Estimated Duration</h4>
                <div className="flex items-center gap-2 mb-2">
                   <span className="text-xl font-bold text-purple-700">
                     {currentCase.estimated_hearing_minutes} mins
                   </span>
                </div>
                <p className="text-xs text-purple-600 mt-2">
                  Based on complexity & witness count.
                </p>
              </div>
            </div>

            {/* Action Area */}
            {currentCase.settlement_possible && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-green-800 text-lg">✨ AI Recommendation: Divert to Mediation</h4>
                    <p className="text-green-700 text-sm mt-1">This case matches 85% of historically settled cases. Generating an agreement now can save court time.</p>
                  </div>
                  <button 
                    onClick={() => setShowAgreement(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow"
                  >
                    Draft Agreement
                  </button>
                </div>
                
                {showAgreement && (
                  <div className="mt-6 bg-white border border-green-100 rounded-lg p-6 shadow-inner font-mono text-xs md:text-sm text-slate-700 whitespace-pre-wrap animate-in fade-in duration-500">
                    {generateMediationAgreement(currentCase)}
                    <div className="mt-4 flex gap-3">
                      <button className="bg-slate-900 text-white px-3 py-1.5 rounded text-xs">Download PDF</button>
                      <button className="border border-slate-300 px-3 py-1.5 rounded text-xs hover:bg-slate-50">Email to Counsel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!currentCase.settlement_possible && (
               <div className="bg-white border border-slate-200 rounded-xl p-6">
                 <h4 className="font-bold text-slate-800">Next Step: Schedule for Trial</h4>
                 <p className="text-slate-500 text-sm mt-1">Based on the high priority score calculated from case age and risk, this case will be prioritized in the daily schedule.</p>
               </div>
            )}

          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-4">
             <Wand2 size={32} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-medium text-slate-700">Ready to Analyze</h3>
          <p className="text-slate-400 mt-2">Click the button above to simulate an incoming case.</p>
        </div>
      )}
    </div>
  );
};

export default CaseIntake;