import React, { useState, useEffect } from 'react';
import { AgentTask, AgentLog } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { api } from '../services/api';
import { Activity, Shield, Cpu, RefreshCw, Eye, CheckCircle2, AlertCircle, X, Terminal, Sparkles } from 'lucide-react';

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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#111827] tracking-tight">Multi-Agent System Orchestrator & Live Monitor</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Real-time telemetry and task dependencies across 9 specialized autonomous supply chain agents.
          </p>
        </div>
        <button
          onClick={fetchAgentData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F9FAFB] text-[#2563EB] border border-[#E5E7EB] text-xs font-semibold transition cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* 9 Agent Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {agentsStatus?.agents?.map((ag: any, idx: number) => (
          <div
            key={idx}
            className="rounded-2xl p-4 border border-[#E5E7EB] bg-white hover:border-[#2563EB]/50 transition shadow-xs hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#10B981]"></span>
                    {ag.name}
                  </h4>
                  <span className="text-[10px] text-[#2563EB] font-semibold">{ag.category}</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                  {ag.status}
                </span>
              </div>
              <p className="text-[11px] text-[#6B7280] mb-3 leading-snug">{ag.role}</p>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#F3F4F6] text-[#9CA3AF]">
              <span>Tasks Run: <strong className="text-[#111827]">{ag.total_tasks_run}</strong></span>
              <span>Health: <strong className="text-[#10B981]">{ag.health}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Tasks and Live Logs Tabs/Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Tasks */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#F5F7FB] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#2563EB]" />
              Agent Task Execution Stream
            </h3>
            <span className="text-xs text-[#6B7280]">{tasks.length} Logged Tasks</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#F3F4F6]">
            {tasks.map((t) => (
              <div key={t.id} className="p-3.5 hover:bg-[#F9FAFB] transition flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#111827]">{t.agent_name}</span>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="text-[11px] text-[#6B7280] flex items-center gap-2">
                    <span>{t.task_number}</span>
                    {t.related_order_id && <span>• Order #{t.related_order_id}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-[10px] text-[#9CA3AF]">
                    <div>{new Date(t.created_at).toLocaleTimeString()}</div>
                    {t.requires_approval && (
                      <span className="text-[#F59E0B] font-bold uppercase">Approval Gate</span>
                    )}
                  </div>
                  {t.output_payload && (
                    <button
                      onClick={() => setSelectedTaskPayload(t)}
                      className="p-1.5 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#DBEAFE] transition cursor-pointer"
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
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 border-b border-[#E5E7EB] bg-[#F5F7FB] flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151] flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#10B981]" />
              Live Execution Event Logs
            </h3>
            <span className="text-xs text-[#6B7280]">{logs.length} Events</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs bg-[#F5F7FB]/40">
            {logs.map((l) => (
              <div
                key={l.id}
                className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[11px] flex items-start gap-2 shadow-2xs"
              >
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    l.log_level === 'SUCCESS'
                      ? 'bg-[#ECFDF5] text-[#10B981]'
                      : l.log_level === 'WARNING'
                      ? 'bg-[#FFF7ED] text-[#F59E0B]'
                      : l.log_level === 'ERROR'
                      ? 'bg-[#FEF2F2] text-[#EF4444]'
                      : 'bg-[#EFF6FF] text-[#2563EB]'
                  }`}
                >
                  {l.log_level}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[#6B7280] text-[10px]">
                    <span className="text-[#111827] font-bold">{l.agent_name}</span>
                    <span>{new Date(l.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[#374151] mt-0.5 leading-relaxed">{l.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task Payload Inspector Modal */}
      {selectedTaskPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6] mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#111827]">
                  Payload Inspector: {selectedTaskPayload.task_number}
                </h3>
                <p className="text-xs text-[#6B7280]">{selectedTaskPayload.agent_name}</p>
              </div>
              <button
                onClick={() => setSelectedTaskPayload(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-[#F3F4F6] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto text-xs">
              <div>
                <span className="text-xs font-semibold text-[#4B5563] block mb-1">Input Payload:</span>
                <pre className="p-3 rounded-xl bg-[#F5F7FB] border border-[#E5E7EB] text-[11px] text-[#374151] overflow-x-auto font-mono">
                  {JSON.stringify(selectedTaskPayload.input_payload, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#4B5563] block mb-1">Output Payload:</span>
                <pre className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] text-[#065F46] overflow-x-auto font-mono">
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
