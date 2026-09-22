import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  Download,
  Check,
} from 'lucide-react';
import { csvService, ParsedCsvResult } from '../services/csvService';
import { leadService } from '../services/leadService';
import { Lead } from '../types';
import { useAuth } from '../context/AuthContext';

export const LeadImport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [existingLeads, setExistingLeads] = useState<Lead[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);

  // Results
  const [parseResult, setParseResult] = useState<ParsedCsvResult | null>(null);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    created: number;
    duplicates: number;
    invalid: number;
  } | null>(null);

  useEffect(() => {
    leadService.getAllLeads().then(setExistingLeads);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setParseResult(null);
      setImportSummary(null);
    }
  };

  const handleParse = async () => {
    if (!file) return;
    setParsing(true);
    try {
      const text = await file.text();
      const rawRows = csvService.parseRawCsv(text);
      const validated = csvService.validateCsvRows(rawRows, existingLeads);
      setParseResult(validated);
    } catch (err: any) {
      console.error(err);
      alert('Failed to parse CSV file. Ensure it is a valid UTF-8 CSV.');
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!parseResult || !user) return;
    setImporting(true);
    try {
      const toCreate = parseResult.validRows.map((r) => r.data);
      const created = await leadService.batchCreateLeads(toCreate, {
        id: user.id,
        name: user.name,
      });

      setImportSummary({
        total: parseResult.totalParsed,
        created: created.length,
        duplicates: parseResult.duplicateRows.length,
        invalid: parseResult.invalidRows.length,
      });
      setParseResult(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error occurred while saving batch leads.');
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleCsv = () => {
    const sampleHeaders = 'Name,Company,Email,Phone,Website,Source,Service,Status,Priority,Notes';
    const sampleRow = '"Amitabh Roy","Roy Global Ventures","amitabh@royglobal.in","+919876543210","https://royglobal.in","LinkedIn","CRM Development","New","High","Requirement for custom lead scoring engine"';
    const content = `${sampleHeaders}\n${sampleRow}`;
    csvService.downloadCsv(content, 'brainlink_leads_template.csv');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/leads')}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Import Leads via CSV
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Bulk upload leads with automated schema validation and duplicate detection
            </p>
          </div>
        </div>

        <button
          onClick={downloadSampleCsv}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          Download Sample Template
        </button>
      </div>

      {/* Completion Summary Card */}
      {importSummary && (
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Import Complete</h3>
              <p className="text-xs text-slate-500">Batch leads processed and inserted into CRM.</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400">Total Processed</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{importSummary.total}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-700 font-medium">Successfully Created</span>
              <p className="text-xl font-bold text-emerald-800 mt-1">{importSummary.created}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-xs text-amber-700 font-medium">Duplicates Blocked</span>
              <p className="text-xl font-bold text-amber-800 mt-1">{importSummary.duplicates}</p>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-xs text-rose-700 font-medium">Invalid Rows</span>
              <p className="text-xl font-bold text-rose-800 mt-1">{importSummary.invalid}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => navigate('/leads')}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl"
            >
              View In Leads Table
            </button>
          </div>
        </div>
      )}

      {/* Upload Box */}
      {!importSummary && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Select CSV File</h2>

          <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 text-center transition-colors">
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-700">
              Upload your CSV lead list
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-4">
              Columns supported: Name, Company, Email, Phone, Website, Source, Service, Status, Priority, Notes
            </p>

            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              id="csv-file-input"
              className="hidden"
            />
            <label
              htmlFor="csv-file-input"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors shadow-2xs"
            >
              <Upload className="w-4 h-4" />
              {file ? file.name : 'Choose CSV File'}
            </label>
          </div>

          {file && !parseResult && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleParse}
                disabled={parsing}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {parsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Parse &amp; Validate Records</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Validation & Preview Card */}
      {parseResult && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Parsed File Summary</h3>
              <p className="text-xs text-slate-500">
                Total Rows: <span className="font-semibold">{parseResult.totalParsed}</span> &bull; Valid: <span className="font-semibold text-emerald-600">{parseResult.validRows.length}</span> &bull; Duplicates:{' '}
                <span className="font-semibold text-amber-600">{parseResult.duplicateRows.length}</span> &bull; Invalid:{' '}
                <span className="font-semibold text-rose-600">{parseResult.invalidRows.length}</span>
              </p>
            </div>

            <button
              onClick={handleConfirmImport}
              disabled={importing || parseResult.validRows.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-40"
            >
              {importing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Import {parseResult.validRows.length} Valid Leads</span>
            </button>
          </div>

          {/* Duplicates Alert */}
          {parseResult.duplicateRows.length > 0 && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Blocked Duplicate Records ({parseResult.duplicateRows.length})</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 text-[11px] text-amber-800 pr-1">
                {parseResult.duplicateRows.map((dup, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/70 p-2 rounded-lg border border-amber-200/50">
                    <span className="font-semibold">{dup.raw.name} ({dup.raw.company})</span>
                    <span>{dup.reasons.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invalid Rows Alert */}
          {parseResult.invalidRows.length > 0 && (
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Invalid Rows ({parseResult.invalidRows.length})</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 text-[11px] text-rose-800 pr-1">
                {parseResult.invalidRows.map((inv, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/70 p-2 rounded-lg border border-rose-200/50">
                    <span className="font-semibold">{inv.raw.name || 'Unnamed entry'}</span>
                    <span>{inv.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valid Records Preview Table */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Preview of Valid Records ({parseResult.validRows.length}):
            </span>
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Company</th>
                    <th className="py-2 px-3">Email</th>
                    <th className="py-2 px-3">Phone</th>
                    <th className="py-2 px-3">Service</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parseResult.validRows.slice(0, 10).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-900">{r.data.name}</td>
                      <td className="py-2 px-3 text-slate-600">{r.data.company}</td>
                      <td className="py-2 px-3 text-slate-500">{r.data.email || '—'}</td>
                      <td className="py-2 px-3 text-slate-500">{r.data.phone || '—'}</td>
                      <td className="py-2 px-3 text-slate-600">{r.data.service}</td>
                      <td className="py-2 px-3 text-slate-700">{r.data.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
