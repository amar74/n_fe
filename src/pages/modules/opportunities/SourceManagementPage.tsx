import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Play, Pause, Calendar, ExternalLink, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { opportunityIngestionApi } from '@/services/api/opportunityIngestionApi';
import type { OpportunitySourceResponse, OpportunitySourceCreate, OpportunitySourceUpdate, ScrapeHistoryResponse } from '@/types/opportunityIngestion';

interface SourceFormData {
  name: string;
  url: string;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  status: 'active' | 'paused' | 'archived';
  tags: string[];
  notes: string;
  is_auto_discovery_enabled: boolean;
}

export default function SourceManagementPage() {
  const [sources, setSources] = useState<OpportunitySourceResponse[]>([]);
  const [scrapeHistory, setScrapeHistory] = useState<ScrapeHistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<OpportunitySourceResponse | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SourceFormData>({
    name: '',
    url: '',
    category: '',
    frequency: 'daily',
    status: 'active',
    tags: [],
    notes: '',
    is_auto_discovery_enabled: true,
  });

  useEffect(() => {
    loadSources();
  }, []);

  useEffect(() => {
    if (selectedSourceId) {
      loadScrapeHistory(selectedSourceId);
    }
  }, [selectedSourceId]);

  const loadSources = async () => {
    try {
      setIsLoading(true);
      const data = await opportunityIngestionApi.listSources();
      setSources(data);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to load sources');
    } finally {
      setIsLoading(false);
    }
  };

  const loadScrapeHistory = async (sourceId: string) => {
    try {
      const data = await opportunityIngestionApi.listHistory({ sourceId, limit: 50 });
      setScrapeHistory(data);
    } catch (error: any) {
      toast.error('Failed to load scrape history');
    }
  };

  const handleOpenModal = (source?: OpportunitySourceResponse) => {
    if (source) {
      setEditingSource(source);
      setFormData({
        name: source.name,
        url: source.url,
        category: source.category || '',
        frequency: source.frequency,
        status: source.status,
        tags: source.tags || [],
        notes: source.notes || '',
        is_auto_discovery_enabled: source.is_auto_discovery_enabled,
      });
    } else {
      setEditingSource(null);
      setFormData({
        name: '',
        url: '',
        category: '',
        frequency: 'daily',
        status: 'active',
        tags: [],
        notes: '',
        is_auto_discovery_enabled: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSource(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSource) {
        const updateData: OpportunitySourceUpdate = {
          name: formData.name,
          url: formData.url,
          category: formData.category || null,
          frequency: formData.frequency,
          status: formData.status,
          tags: formData.tags.length > 0 ? formData.tags : null,
          notes: formData.notes || null,
          is_auto_discovery_enabled: formData.is_auto_discovery_enabled,
        };
        await opportunityIngestionApi.updateSource(editingSource.id, updateData);
        toast.success('Source updated successfully');
      } else {
        const createData: OpportunitySourceCreate = {
          name: formData.name,
          url: formData.url,
          category: formData.category || null,
          frequency: formData.frequency,
          status: formData.status,
          tags: formData.tags.length > 0 ? formData.tags : null,
          notes: formData.notes || null,
          is_auto_discovery_enabled: formData.is_auto_discovery_enabled,
        };
        await opportunityIngestionApi.createSource(createData);
        toast.success('Source created successfully');
      }
      handleCloseModal();
      loadSources();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save source');
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return;
    
    try {
      await opportunityIngestionApi.deleteSource(sourceId);
      toast.success('Source deleted successfully');
      loadSources();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete source');
    }
  };

  const handleToggleStatus = async (source: OpportunitySourceResponse) => {
    try {
      const newStatus = source.status === 'active' ? 'paused' : 'active';
      await opportunityIngestionApi.updateSource(source.id, { status: newStatus });
      toast.success(`Source ${newStatus === 'active' ? 'activated' : 'paused'}`);
      loadSources();
    } catch (error: any) {
      toast.error('Failed to update source status');
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
      archived: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.archived}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getFrequencyBadge = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      manual: 'Manual',
    };
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {labels[frequency] || frequency}
      </span>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Opportunity Source Management</h1>
          <p className="text-gray-600 mt-1">Manage automated opportunity discovery sources</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Add Source
        </button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((source) => (
          <div key={source.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{source.name}</h3>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  {source.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(source.status)}
                {getFrequencyBadge(source.frequency)}
              </div>
            </div>

            {source.category && (
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Category:</span> {source.category}
              </p>
            )}

            {source.tags && source.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {source.tags.map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Last run: {formatDate(source.last_run_at)}</span>
              </div>
              {source.next_run_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Next run: {formatDate(source.next_run_at)}</span>
                </div>
              )}
              {source.is_auto_discovery_enabled && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Auto-discovery enabled</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleToggleStatus(source)}
                className="flex-1 px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
              >
                {source.status === 'active' ? <><Pause className="w-4 h-4 inline mr-1" />Pause</> : <><Play className="w-4 h-4 inline mr-1" />Activate</>}
              </button>
              <button
                onClick={() => handleOpenModal(source)}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(source.id)}
                className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedSourceId(selectedSourceId === source.id ? null : source.id)}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {selectedSourceId === source.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-sm mb-2">Recent Scrape History</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {scrapeHistory.filter(h => h.source_id === source.id).slice(0, 5).map((history) => (
                    <div key={history.id} className="text-xs text-gray-600 flex items-center justify-between">
                      <span className="truncate flex-1">{history.url}</span>
                      <span className={`ml-2 ${
                        history.status === 'success' ? 'text-green-600' :
                        history.status === 'error' ? 'text-red-600' :
                        'text-gray-400'
                      }`}>
                        {history.status}
                      </span>
                    </div>
                  ))}
                  {scrapeHistory.filter(h => h.source_id === source.id).length === 0 && (
                    <p className="text-xs text-gray-400">No scrape history</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {sources.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No opportunity sources configured</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Source
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingSource ? 'Edit Source' : 'Create New Source'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., SoftiCation Projects"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/projects"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Construction/Real Estate"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
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
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="construction, infrastructure, public-works"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Additional notes about this source..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto_discovery"
                    checked={formData.is_auto_discovery_enabled}
                    onChange={(e) => setFormData({ ...formData, is_auto_discovery_enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="auto_discovery" className="ml-2 text-sm text-gray-700">
                    Enable auto-discovery
                  </label>
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
                    {editingSource ? 'Update' : 'Create'} Source
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

