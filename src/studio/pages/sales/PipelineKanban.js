import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Plus,
  MoreVertical,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getDeals,
  createDeal,
  updateDealStage,
  deleteDeal,
  PIPELINE_STAGES,
} from '../../services/salesService';
import { convertDealToClient } from '../../services/clientService';

export default function PipelineKanban() {
  const navigate = useNavigate();
  const { userProfile, role } = useAuth();
  const toast = useToast();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [draggedDealId, setDraggedDealId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    value: '',
    probability: 40,
    stage: 'Qualified',
    expectedClose: '',
    priority: 'High',
    notes: '',
  });

  const loadDeals = async () => {
    setLoading(true);
    try {
      const data = await getDeals();
      setDeals(data);
    } catch (err) {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handleDragStart = (e, dealId) => {
    setDraggedDealId(dealId);
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    if (!dealId) return;

    try {
      const updated = await updateDealStage(dealId, targetStage, userProfile?.email);
      setDeals(prev => prev.map(d => (d.id === dealId ? updated : d)));
      toast.success(`Deal moved to ${targetStage}`);

      if (targetStage === 'Won') {
        const deal = deals.find(d => d.id === dealId);
        if (deal) {
          await convertDealToClient(deal, userProfile?.email);
          toast.success('Converted to Client profile & initialized onboarding!');
        }
      }
    } catch (err) {
      toast.error('Failed to move deal');
    } finally {
      setDraggedDealId(null);
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Deal title is required');
      return;
    }

    try {
      await createDeal(
        {
          ...formData,
          value: Number(formData.value) || 0,
          owner: userProfile?.displayName || 'Aaditya Vishnoi',
        },
        userProfile?.email
      );
      toast.success(`Created deal: ${formData.name}`);
      setModalOpen(false);
      setFormData({
        name: '',
        company: '',
        value: '',
        probability: 40,
        stage: 'Qualified',
        expectedClose: '',
        priority: 'High',
        notes: '',
      });
      await loadDeals();
    } catch (err) {
      toast.error('Error creating deal');
    }
  };

  const totalPipelineValue = deals
    .filter(d => d.stage !== 'Won' && d.stage !== 'Lost')
    .reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  const weightedPipeline = deals
    .filter(d => d.stage !== 'Won' && d.stage !== 'Lost')
    .reduce((sum, d) => sum + (Number(d.weightedValue) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            Sales Pipeline Kanban
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
            <span>
              Total Pipeline: <strong className="text-slate-800 font-bold">{formatINR(totalPipelineValue)}</strong>
            </span>
            <span>•</span>
            <span>
              Weighted Value: <strong className="text-blue-600 font-bold">{formatINR(weightedPipeline)}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </button>
      </div>

      {/* Kanban Board Container (Horizontal Scrollable) */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-4 min-w-[1300px]">
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className="w-80 shrink-0 bg-slate-100/70 border border-slate-200/80 rounded-xl flex flex-col max-h-[calc(100vh-210px)]"
              >
                {/* Column Header */}
                <div className={`p-3.5 border-t-4 bg-white rounded-t-xl border-b border-slate-100 shadow-2xs ${stage.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{stage.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{formatINR(stageTotal)}</span>
                    <span>{stage.defaultProbability}% default</span>
                  </div>
                </div>

                {/* Cards Container */}
                <div className="p-2 space-y-2.5 overflow-y-auto flex-1 min-h-[150px]">
                  {stageDeals.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[11px] text-slate-400">
                      Drop deals here
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs hover:shadow-md hover:border-blue-400 cursor-grab active:cursor-grabbing transition-all select-none group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                            {deal.name}
                          </span>
                          <StatusBadge status={deal.priority || 'Medium'} />
                        </div>

                        {deal.company && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-1.5 font-medium">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{deal.company}</span>
                          </div>
                        )}

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-900">{formatINR(deal.value)}</div>
                            <div className="text-[10px] text-slate-400">
                              Prob: {deal.probability}% ({formatINR(deal.weightedValue)})
                            </div>
                          </div>
                          {deal.expectedClose && (
                            <div className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{formatDate(deal.expectedClose)}</span>
                            </div>
                          )}
                        </div>

                        {/* Quick Action dropdown for stage move on mobile or touch */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">
                            {deal.owner || 'Aaditya'}
                          </span>
                          <select
                            value={deal.stage}
                            onChange={(e) => {
                              const newStg = e.target.value;
                              updateDealStage(deal.id, newStg, userProfile?.email).then((updated) => {
                                setDeals(prev => prev.map(d => (d.id === deal.id ? updated : d)));
                                toast.success(`Moved to ${newStg}`);
                              });
                            }}
                            className="text-[10px] font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                Move: {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Deal Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Pipeline Opportunity"
        subtitle="Add a new high-value proposal or deal into the sales pipeline"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateDeal}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              Add to Pipeline
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateDeal} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Deal Title *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Enterprise Cloud ERP & Driver Dispatch"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Client / Company Name</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Zenith Tech"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Deal Value (INR ₹) *</label>
            <input
              type="number"
              required
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              placeholder="e.g. 850000"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Stage</label>
            <select
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Probability (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Expected Close Date</label>
            <input
              type="date"
              value={formData.expectedClose}
              onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Opportunity Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
