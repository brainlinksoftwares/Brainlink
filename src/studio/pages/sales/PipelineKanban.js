import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Building2,
  Calendar,
  Clock,
} from 'lucide-react';
import Drawer from '../../components/ui/Drawer';
import { formatINR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getDeals,
  createDeal,
  updateDealStage,
  PIPELINE_STAGES,
} from '../../services/salesService';
import { convertDealToClient } from '../../services/clientService';

export default function PipelineKanban() {
  const { userProfile } = useAuth();
  const toast = useToast();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const loadDeals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDeals();
      setDeals(data);
    } catch (err) {
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

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
      setDrawerOpen(false);
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Sales Pipeline
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <span>
              Pipeline: <strong className="text-slate-800 dark:text-slate-200 font-mono font-semibold">{formatINR(totalPipelineValue)}</strong>
            </span>
            <span>•</span>
            <span>
              Weighted: <strong className="text-slate-800 dark:text-slate-200 font-mono font-semibold">{formatINR(weightedPipeline)}</strong>
            </span>
          </div>
        </div>

        <button onClick={() => setDrawerOpen(true)} className="st-btn-primary st-btn-sm self-start sm:self-auto">
          <Plus className="w-3.5 h-3.5" />
          <span>New Deal</span>
        </button>
      </div>

      {/* Kanban Columns Container */}
      <div className="flex gap-3 overflow-x-auto pb-4 studio-scrollbar min-h-[560px]">
        {PIPELINE_STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => (d.stage || 'New Lead') === stage);
          const stageSum = stageDeals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

          return (
            <div
              key={stage}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
              className="w-72 shrink-0 flex flex-col rounded-lg bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-2.5"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1.5 py-1 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {stage}
                  </span>
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {stageDeals.length}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium">
                  {formatINR(stageSum)}
                </span>
              </div>

              {/* Deal Cards Container */}
              <div className="flex-1 space-y-2 overflow-y-auto studio-scrollbar min-h-[300px]">
                {stageDeals.length === 0 ? (
                  <div className="h-20 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-md flex items-center justify-center text-[11px] text-slate-400">
                    Drag opportunities here
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.id)}
                      className="st-card p-3 cursor-grab active:cursor-grabbing hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs"
                    >
                      <div className="font-semibold text-slate-900 dark:text-white line-clamp-1 mb-1">
                        {deal.name}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{deal.company || 'Direct Client'}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatINR(deal.value || 0)}
                        </span>
                        {deal.expectedClose && (
                          <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                            <Calendar className="w-3 h-3" />
                            {deal.expectedClose}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SIDE DRAWER: New Deal */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="New Sales Deal"
        subtitle="Create an opportunity in your sales pipeline"
        width="max-w-lg"
        footer={
          <>
            <button type="button" onClick={() => setDrawerOpen(false)} className="st-btn-secondary">
              Cancel
            </button>
            <button type="submit" form="deal-form" className="st-btn-primary">
              Create Deal
            </button>
          </>
        }
      >
        <form id="deal-form" onSubmit={handleCreateDeal} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
              Deal Title *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Acme Mobile App v2"
              className="st-input"
            />
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
              Company / Client Name *
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="e.g. Acme Tech Pvt Ltd"
              className="st-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Value (INR) *
              </label>
              <input
                type="number"
                required
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="150000"
                className="st-input font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Initial Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="st-select w-full"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Probability (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                className="st-input font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                Target Close Date
              </label>
              <input
                type="date"
                value={formData.expectedClose}
                onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })}
                className="st-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
              Internal Deal Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Commercial parameters, competition, or client milestones..."
              className="st-textarea"
            />
          </div>
        </form>
      </Drawer>
    </div>
  );
}
