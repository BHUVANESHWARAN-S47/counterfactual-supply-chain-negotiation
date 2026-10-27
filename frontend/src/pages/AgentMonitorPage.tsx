import React, { useState, useEffect } from 'react';
import { AgentTask, AgentLog } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { Activity, Shield, Cpu, RefreshCw, Eye, CheckCircle2, AlertCircle, X, Terminal } from 'lucide-react';

export const AgentMonitorPage: React.FC = () => {
  const [agentsStatus, setAgentsStatus] = useState<any | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskPayload, setSelectedTaskPayload] = useState<AgentTask | null>(null);

  const fetchAgentData = async () => {
    try {
      const [stData, tData, lData] = await Promise.all([
        api.getAgentsStatus(),
        api.getAgentTasks(30),
        api.getAgentLogs(undefined, 50),
      ]);
      setAgentsStatus(stData);
      setTasks(tData);
      setLogs(lData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
    const interval = setInterval(fetchAgentData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Multi-Agent System Orchestrator & Live Monitor</h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry and task dependencies across 9 specialized autonomous supply chain agents.
          </p>
        </div>
        <button
          onClick={fetchAgentData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* 9 Agent Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {agentsStatus?.agents?.map((ag: any, idx: number) => (
          <div
            key={idx}
            className="glass-card rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  {ag.name}
                </h4>
                <span className="text-[10px] text-blue-400 font-semibold">{ag.category}</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {ag.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">{ag.role}</p>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-500">
              <span>Tasks Executed: <strong className="text-slate-200">{ag.total_tasks_run}</strong></span>
              <span>Health: <strong className="text-emerald-400">{ag.health}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Tasks and Live Logs Tabs/Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Tasks */}
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-400" />
              Agent Task Execution Stream
            </h3>
            <span className="text-xs text-slate-500">{tasks.length} Logged Tasks</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {tasks.map((t) => (
              <div key={t.id} className="p-3.5 hover:bg-slate-900/40 transition flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{t.agent_name}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>{t.task_number}</span>
                    {t.related_order_id && <span>• Order #{t.related_order_id}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-[10px] text-slate-500">
                    <div>{new Date(t.created_at).toLocaleTimeString()}</div>
                    {t.requires_approval && (
                      <span className="text-amber-400 font-bold uppercase">Approval Gate</span>
                    )}
                  </div>
                  {t.output_payload && (
                    <button
                      onClick={() => setSelectedTaskPayload(t)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition"
                      title="Inspect Structured Payload"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Execution Logs */}
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              Live Execution Event Logs
            </h3>
            <span className="text-xs text-slate-500">{logs.length} Events</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs">
            {logs.map((l) => (
              <div
                key={l.id}
                className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] flex items-start gap-2"
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    l.log_level === 'SUCCESS'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : l.log_level === 'WARNING'
                      ? 'bg-amber-500/20 text-amber-400'
                      : l.log_level === 'ERROR'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {l.log_level}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span className="text-slate-300 font-bold">{l.agent_name}</span>
                    <span>{new Date(l.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">{l.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Payload Inspector Modal */}
      {selectedTaskPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Payload Inspector: {selectedTaskPayload.task_number}
                </h3>
                <p className="text-xs text-slate-400">{selectedTaskPayload.agent_name}</p>
              </div>
              <button onClick={() => setSelectedTaskPayload(null)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">Input Payload:</span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 overflow-x-auto">
                  {JSON.stringify(selectedTaskPayload.input_payload, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">Output Payload:</span>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 overflow-x-auto">
                  {JSON.stringify(selectedTaskPayload.output_payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
