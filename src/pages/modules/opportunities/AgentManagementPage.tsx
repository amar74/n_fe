import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, Pause, Calendar, ExternalLink, RefreshCw, AlertCircle, CheckCircle, Clock, Bot } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { opportunityIngestionApi } from '@/services/api/opportunityIngestionApi';
import type { OpportunityAgentResponse, OpportunityAgentCreate, OpportunityAgentUpdate, OpportunityAgentRunResponse } from '@/types/opportunityIngestion';

interface AgentFormData {
  name: string;
  prompt: string;
  base_url: string;
  frequency: '12h' | '24h' | '72h' | '168h';
  status: 'active' | 'paused' | 'disabled';
  source_id: string | null;
}

export default function AgentManagementPage() {
  const [agents, setAgents] = useState<OpportunityAgentResponse[]>([]);
  const [agentRuns, setAgentRuns] = useState<Record<string, OpportunityAgentRunResponse[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<OpportunityAgentResponse | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    prompt: '',
    base_url: '',
    frequency: '24h',
    status: 'active',
    source_id: null,
  });

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    if (selectedAgentId) {
      loadAgentRuns(selectedAgentId);
    }
  }, [selectedAgentId]);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const data = await opportunityIngestionApi.listAgents();
      setAgents(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAgentRuns = async (agentId: string) => {
    try {
      const data = await opportunityIngestionApi.listAgentRuns(agentId, 20);
      setAgentRuns(prev => ({ ...prev, [agentId]: data }));
    } catch (error: any) {
      toast.error('Failed to load agent runs');
    }
  };

  const handleOpenModal = (agent?: OpportunityAgentResponse) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        name: agent.name,
        prompt: agent.prompt,
        base_url: agent.base_url,
        frequency: agent.frequency,
        status: agent.status,
        source_id: agent.source_id,
      });
    } else {
      setEditingAgent(null);
      setFormData({
        name: '',
        prompt: 'Find new construction projects or tenders',
        base_url: '',
        frequency: '24h',
        status: 'active',
        source_id: null,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAgent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAgent) {
        const updateData: OpportunityAgentUpdate = {
          name: formData.name,
          prompt: formData.prompt,
          base_url: formData.base_url,
          frequency: formData.frequency,
          status: formData.status,
          source_id: formData.source_id,
        };
        await opportunityIngestionApi.updateAgent(editingAgent.id, updateData);
        toast.success('Agent updated successfully');
      } else {
        const createData: OpportunityAgentCreate = {
          name: formData.name,
          prompt: formData.prompt,
          base_url: formData.base_url,
          frequency: formData.frequency,
          status: formData.status,
          source_id: formData.source_id,
        };
        await opportunityIngestionApi.createAgent(createData);
        toast.success('Agent created successfully');
      }
      handleCloseModal();
      loadAgents();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save agent');
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      await opportunityIngestionApi.deleteAgent(agentId);
      toast.success('Agent deleted successfully');
      loadAgents();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete agent');
    }
  };

  const handleToggleStatus = async (agent: OpportunityAgentResponse) => {
    try {
      const newStatus = agent.status === 'active' ? 'paused' : 'active';
      await opportunityIngestionApi.updateAgent(agent.id, { status: newStatus });
      toast.success(`Agent ${newStatus === 'active' ? 'activated' : 'paused'}`);
      loadAgents();
    } catch (error: any) {
      toast.error('Failed to update agent status');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      disabled: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.disabled}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      '12h': 'Every 12 Hours',
      '24h': 'Daily',
      '72h': 'Every 3 Days',
      '168h': 'Weekly',
    };
    return labels[frequency] || frequency;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Agent Management</h1>
          <p className="text-gray-600 mt-1">Manage AI agents for automated opportunity discovery</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Create Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                </div>
                <a
                  href={agent.base_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  {agent.base_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(agent.status)}
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {getFrequencyLabel(agent.frequency)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Prompt:</span>
              </p>
              <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                {agent.prompt}
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Last run: {formatDate(agent.last_run_at)}</span>
              </div>
              {agent.next_run_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Next run: {formatDate(agent.next_run_at)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleToggleStatus(agent)}
                className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
              >
                {agent.status === 'active' ? <><Pause className="w-4 h-4 inline mr-1" />Pause</> : <><Play className="w-4 h-4 inline mr-1" />Activate</>}
              </button>
              <button
                onClick={() => handleOpenModal(agent)}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(agent.id)}
                className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {selectedAgentId === agent.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-sm mb-2">Recent Runs</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {agentRuns[agent.id]?.slice(0, 5).map((run) => (
                    <div key={run.id} className="text-xs text-gray-600 flex items-center justify-between">
                      <div className="flex-1">
                        <span className={`font-medium ${
                          run.status === 'succeeded' ? 'text-green-600' :
                          run.status === 'failed' ? 'text-red-600' :
                          'text-gray-400'
                        }`}>
                          {run.status}
                        </span>
                        {run.new_opportunities > 0 && (
                          <span className="ml-2 text-blue-600">
                            {run.new_opportunities} opportunities
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 ml-2">
                        {formatDate(run.started_at)}
                      </span>
                    </div>
                  ))}
                  {(!agentRuns[agent.id] || agentRuns[agent.id].length === 0) && (
                    <p className="text-xs text-gray-400">No runs yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No AI agents configured</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Agent
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingAgent ? 'Edit AI Agent' : 'Create New AI Agent'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Monitor SoftiCation Infra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.base_url}
                    onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    AI Prompt *
                  </label>
                  <textarea
                    required
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Find new construction projects or tenders"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Describe what the AI agent should look for on this website
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="12h">Every 12 Hours</option>
                      <option value="24h">Daily</option>
                      <option value="72h">Every 3 Days</option>
                      <option value="168h">Weekly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingAgent ? 'Update' : 'Create'} Agent
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

