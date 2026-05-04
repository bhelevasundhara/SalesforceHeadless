'use client'

import { useState } from 'react';
import { createLeadAction } from './actions/leadAction';

export default function HeadlessLeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{leadId: string; method: string} | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const response = await createLeadAction(formData);
    
    if (response.success && response.leadId) {
      setSuccessData({ leadId: response.leadId, method: response.method || 'Headless API' });
    } else {
      alert("Error: " + response.error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Salesforce <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Headless 360</span>
          </h1>
          <p className="text-slate-400">Direct MCP Data Injection Demo</p>
        </div>

        {/* Success State */}
        {successData ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl shadow-indigo-500/10">
            <div className="w-20 h-20 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
            <h2 className="text-2xl font-bold mb-2">Lead Successfully Created!</h2>
            <p className="text-slate-400 mb-4">The record was injected directly into Salesforce via Headless 360.</p>
            <div className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-6" style={{background: successData.method === 'MCP' ? 'rgba(99,102,241,0.15)' : 'rgba(34,197,94,0.15)', color: successData.method === 'MCP' ? '#818cf8' : '#22c55e'}}>
              Protocol: {successData.method === 'MCP' ? '⚡ MCP Streamable HTTP' : '🔗 Salesforce REST API'}
            </div>
            
            <div className="bg-slate-950 rounded-2xl p-6 mb-8 border border-slate-800 text-left flex flex-col gap-2">
              <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Salesforce Record ID</div>
              <div className="text-lg font-mono text-indigo-400">{successData.leadId}</div>
            </div>
            
            <button onClick={() => setSuccessData(null)} className="w-full py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors">
              Submit Another Lead
            </button>
          </div>
        ) : (
          /* Form UI */
          <div className="bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl shadow-black/50">
            <h2 className="text-xl font-bold mb-8">New Business Lead</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
                  <input required name="firstName" className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                  <input required name="lastName" className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Company Name</label>
                <input required name="company" className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                  <input required type="email" name="email" className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Phone</label>
                  <input required type="tel" name="phone" className="w-full bg-slate-950 p-4 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none transition-colors" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full mt-6 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20"
              >
                {isSubmitting ? 'Transmitting to Salesforce...' : 'Submit to Salesforce via MCP'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
