import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle,
  Info, Users, RefreshCw, ArrowLeft, Eye, Clock, FileText,
  ChevronDown, ChevronUp, SkipForward, Edit3, Trash2, Filter,
  AlertCircle, BarChart2, UserCheck, UserX, Copy, History, Search
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { addItem, updateItem, getDb } from '../../utils/mockDb';

// ─── Types ───────────────────────────────────────────────────────────────────
type RowStatus = 'valid' | 'error' | 'duplicate' | 'existing';
type RowAction = 'import' | 'skip' | 'update' | 'none';

interface ImportRow {
  rowNumber: number;
  data: Record<string, any>;
  status: RowStatus;
  errors: string[];
  warnings: string[];
  existingUserId?: string;
  existingUserName?: string;
  branchId?: string;
  trainerId?: string;
  action: RowAction;
}

interface ValidationSummary {
  total: number;
  valid: number;
  error: number;
  duplicate: number;
  existing: number;
  newCustomers: number;
}

interface ImportResult {
  newCustomers: number;
  updatedCustomers: number;
  skippedCustomers: number;
  failedRecords: number;
  failedRows: any[];
  status: string;
  importId: string;
}

interface HistoryRecord {
  _id: string;
  fileName: string;
  status: string;
  totalRecords: number;
  newCustomers: number;
  updatedCustomers: number;
  skippedCustomers: number;
  failedRecords: number;
  importedBy: { firstName: string; lastName: string; email: string };
  createdAt: string;
  failedRows?: any[];
}

type Step = 'upload' | 'validating' | 'preview' | 'confirming' | 'importing' | 'result' | 'history';

// ─── Template columns ─────────────────────────────────────────────────────────
const TEMPLATE_COLUMNS = [
  'Customer Name', 'Email', 'Mobile Number', 'Gender', 'Date of Birth',
  'Height', 'Weight', 'Membership Plan', 'Membership Start Date',
  'Membership End Date', 'Branch', 'Trainer', 'Status', 'Emergency Contact',
];

const SAMPLE_DATA = [
  ['Arun Kumar', 'arun.kumar@example.com', '9876543210', 'Male', '1990-05-15', '175', '75', 'Premium', '2025-01-01', '2026-01-01', 'Anna Nagar', 'Rajesh Kumar', 'Active', 'Anitha Kumar'],
  ['Priya Sharma', 'priya.sharma@example.com', '9876543211', 'Female', '1995-08-20', '162', '58', 'Standard', '2025-03-01', '2025-09-01', 'Anna Nagar', '', 'Active', 'Ram Sharma'],
  ['Vignesh Raj', 'vignesh.raj@example.com', '9876543212', 'Male', '1992-11-10', '180', '82', 'Premium', '2025-02-15', '2026-02-15', 'Velachery', 'Rajesh Kumar', 'Active', 'Pooja Raj'],
  ['Divya Lakshmi', 'divya.lakshmi@example.com', '9876543213', 'Female', '1998-04-05', '165', '60', 'Basic', '2025-04-10', '2025-10-10', 'Velachery', '', 'Active', 'Kiran Kumar'],
  ['Karthik M', 'karthik.m@example.com', '9876543214', 'Male', '1988-12-25', '170', '78', 'Annual Pro', '2025-01-20', '2026-01-20', 'Anna Nagar', 'Suresh Babu', 'Active', 'Meena M'],
  ['Sneha R', 'sneha.r@example.com', '9876543215', 'Female', '1996-07-30', '160', '55', 'Standard', '2025-05-05', '2025-11-05', 'Velachery', '', 'Active', 'Ramesh R'],
  ['Rahul Verma', 'rahul.verma@example.com', '9876543216', 'Male', '1993-09-18', '178', '85', 'Premium', '2025-02-01', '2026-02-01', 'Anna Nagar', 'Rajesh Kumar', 'Active', 'Neha Verma'],
  ['Anjali Desai', 'anjali.desai@example.com', '9876543217', 'Female', '1994-02-12', '168', '62', 'Basic', '2025-03-15', '2025-09-15', 'Velachery', 'Suresh Babu', 'Active', 'Raj Desai'],
  ['Manoj Kumar', 'manoj.kumar@example.com', '9876543218', 'Male', '1991-06-22', '172', '80', 'Standard', '2025-04-01', '2025-10-01', 'Anna Nagar', '', 'Active', 'Sujatha Kumar'],
  ['Swathi N', 'swathi.n@example.com', '9876543219', 'Female', '1997-11-08', '158', '52', 'Annual Pro', '2025-01-10', '2026-01-10', 'Velachery', 'Rajesh Kumar', 'Active', 'Naveen N'],
  ['Siddharth Jain', 'siddharth.jain@example.com', '9876543220', 'Male', '1989-03-14', '182', '88', 'Premium', '2025-02-20', '2026-02-20', 'Anna Nagar', 'Suresh Babu', 'Active', 'Priya Jain'],
  ['Kavitha S', 'kavitha.s@example.com', '9876543221', 'Female', '1992-10-27', '164', '59', 'Standard', '2025-05-15', '2025-11-15', 'Velachery', '', 'Active', 'Senthil S'],
  ['Deepak Reddy', 'deepak.reddy@example.com', '9876543222', 'Male', '1995-01-05', '176', '76', 'Basic', '2025-03-10', '2025-09-10', 'Anna Nagar', 'Rajesh Kumar', 'Active', 'Lakshmi Reddy'],
  ['Pooja Iyer', 'pooja.iyer@example.com', '9876543223', 'Female', '1993-08-11', '161', '56', 'Premium', '2025-04-25', '2026-04-25', 'Velachery', 'Suresh Babu', 'Active', 'Ravi Iyer'],
  ['Ashwin M', 'ashwin.m@example.com', '9876543224', 'Male', '1990-12-03', '179', '84', 'Annual Pro', '2025-01-05', '2026-01-05', 'Anna Nagar', '', 'Active', 'Revathi M']
];

// ─── Utility helpers ─────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<RowStatus, { label: string; dotColor: string; bg: string; text: string }> = {
  valid:     { label: 'Valid',             dotColor: 'bg-emerald-500', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  error:     { label: 'Error',             dotColor: 'bg-red-500',     bg: 'bg-red-50',      text: 'text-red-700'     },
  duplicate: { label: 'Duplicate',         dotColor: 'bg-amber-500',   bg: 'bg-amber-50',    text: 'text-amber-700'   },
  existing:  { label: 'Existing Customer', dotColor: 'bg-blue-500',    bg: 'bg-blue-50',     text: 'text-blue-700'    },
};

function downloadTemplate() {
  const wb = XLSX.utils.book_new();
  const wsData = [TEMPLATE_COLUMNS, ...SAMPLE_DATA];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = TEMPLATE_COLUMNS.map(() => ({ wch: 22 }));

  XLSX.utils.book_append_sheet(wb, ws, 'Customer Import Template');
  XLSX.writeFile(wb, 'customer_import_template.xlsx');
}

function downloadErrorReport(failedRows: any[]) {
  if (!failedRows.length) return;
  const wb = XLSX.utils.book_new();
  const headers = ['Row Number', ...TEMPLATE_COLUMNS, 'Errors'];
  const data = failedRows.map(r => [
    r.rowNumber,
    r.data?.customerName || '',
    r.data?.email || '',
    r.data?.mobile || '',
    r.data?.gender || '',
    r.data?.dateOfBirth || '',
    r.data?.height || '',
    r.data?.weight || '',
    r.data?.membershipPlan || '',
    r.data?.membershipStartDate || '',
    r.data?.membershipEndDate || '',
    r.data?.branch || '',
    r.data?.trainer || '',
    r.data?.status || '',
    r.data?.emergencyContact || '',
    (r.errors || []).join('; '),
  ]);
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
  ws['!cols'] = headers.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, ws, 'Failed Rows');
  XLSX.writeFile(wb, 'import_error_report.xlsx');
}

// ─── Main Component ───────────────────────────────────────────────────────────
const GymAdminImportCustomers: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('upload');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [validationResult, setValidationResult] = useState<{ summary: ValidationSummary; rows: ImportRow[]; fileName: string } | null>(null);
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [historyDetail, setHistoryDetail] = useState<HistoryRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<RowStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [updateAllExisting, setUpdateAllExisting] = useState<'skip' | 'update' | null>(null);

  const [fixRowData, setFixRowData] = useState<ImportRow | null>(null);
  const [updateRowData, setUpdateRowData] = useState<ImportRow | null>(null);
  const [reviewRowData, setReviewRowData] = useState<ImportRow | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    if (step === 'history') fetchHistory();
  }, [step]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/import/history');
      setHistory(res.data.history || []);
    } catch (e) {
      console.error('Failed to fetch import history', e);
    }
  };

  // ── File handling ──────────────────────────────────────────────────────────
  const validateFile = (file: File): string => {
    const validTypes = ['.xlsx', '.xls', '.csv'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!validTypes.includes('.' + ext)) return 'Only .xlsx, .xls, or .csv files are allowed';
    if (file.size > 10 * 1024 * 1024) return 'File size must not exceed 10 MB';
    return '';
  };

  const handleFile = (file: File) => {
    const err = validateFile(file);
    if (err) { setFileError(err); setSelectedFile(null); return; }
    setFileError('');
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ── Validate file via API ──────────────────────────────────────────────────
  const handleValidate = async () => {
    if (!selectedFile) return;
    setStep('validating');
    setImportProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/import/validate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { summary, rows: resultRows, fileName } = res.data;
      setValidationResult({ summary, rows: resultRows, fileName });
      setRows(resultRows);
      setStep('preview');
    } catch (err: any) {
      setFileError(err.response?.data?.message || 'Failed to validate file. Please try again.');
      setStep('upload');
    }
  };

  // ── Action toggles ─────────────────────────────────────────────────────────
  const toggleExistingAction = (rowNumber: number, action: 'skip' | 'update') => {
    setRows(prev => prev.map(r => r.rowNumber === rowNumber ? { ...r, action } : r));
  };

  const applyToAllExisting = (action: 'skip' | 'update') => {
    setUpdateAllExisting(action);
    setRows(prev => prev.map(r => r.status === 'existing' ? { ...r, action } : r));
  };

  // ── Execute import ─────────────────────────────────────────────────────────
  const handleImport = async () => {
    setShowConfirmModal(false);
    setStep('importing');

    // Simulate progress animation
    let prog = 0;
    const interval = setInterval(() => {
      prog = Math.min(prog + 2, 90);
      setImportProgress(prog);
    }, 100);

    try {
      const res = await api.post('/import/execute', {
        fileName: validationResult?.fileName || selectedFile?.name,
        rows,
      });
      clearInterval(interval);
      setImportProgress(100);
      await new Promise(r => setTimeout(r, 400));
      setImportResult(res.data);
      
      // Update mockDb
      if (res.data.successfulCustomers && res.data.successfulCustomers.length > 0) {
        let dbMembers = getDb('members');
        res.data.successfulCustomers.forEach((c: any) => {
          const existing = dbMembers.find((m: any) => m.email === c.email || m.phone === c.phone);
          if (existing) {
             updateItem('members', existing.id, { ...c, id: existing.id });
          } else {
             addItem('members', c);
          }
        });
      }

      setStep('result');
    } catch (err: any) {
      clearInterval(interval);
      setFileError(err.response?.data?.message || 'Import failed. Please try again.');
      setStep('preview');
    }
  };

  // ── Summary cards ──────────────────────────────────────────────────────────
  const summary = validationResult?.summary;
  const filteredRows = rows.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch = !searchTerm ? true : (
      `${r.data.firstName || ''} ${r.data.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.data.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.data.mobile || '').includes(searchTerm)
    );
    return matchesStatus && matchesSearch;
  });

  const readyToImport = rows.filter(r => r.action === 'import').length;
  const toUpdate = rows.filter(r => r.action === 'update').length;
  const toSkip = rows.filter(r => r.action === 'skip' || r.action === 'none').length;

  // ── Modal Handlers ───────────────────────────────────────────────────────
  const handleFixSave = (fixedData: Record<string, any>) => {
    if (!fixRowData) return;
    setRows(prev => prev.map(r => r.rowNumber === fixRowData.rowNumber ? {
       ...r,
       data: fixedData,
       status: 'valid',
       errors: [],
       action: 'import'
    } : r));
    setFixRowData(null);
  };

  const handleUpdateConfirm = () => {
    if (!updateRowData) return;
    toggleExistingAction(updateRowData.rowNumber, 'update');
    setUpdateRowData(null);
  };

  const handleReviewKeep = (action: 'skip' | 'import') => {
    if (!reviewRowData) return;
    setRows(prev => prev.map(r => r.rowNumber === reviewRowData.rowNumber ? { ...r, action } : r));
    setReviewRowData(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/members')}
            className="p-2 rounded-xl hover:bg-[#F0FDFA] text-[#475569] hover:text-[#16A34A] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight flex items-center gap-2">
              <FileSpreadsheet size={28} className="text-[#16A34A]" />
              Import Existing Customers
            </h1>
            <p className="text-[#475569] mt-1">Upload an Excel or CSV file to bulk-import your existing members.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStep('history')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#CCFBF1] bg-white text-[#475569] hover:bg-[#F0FDFA] hover:text-[#16A34A] transition-colors text-sm font-semibold"
          >
            <History size={16} /> Import History
          </button>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16A34A] text-white font-bold hover:bg-[#15803D] transition-colors shadow-lg shadow-[#16A34A]/20 text-sm"
          >
            <Download size={16} /> Download Template
          </button>
        </div>
      </div>

      {/* Step Breadcrumb */}
      <StepIndicator step={step} />

      {/* ── STEP: UPLOAD ── */}
      {(step === 'upload' || step === 'validating') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Zone */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-[#CCFBF1] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#1E293B] mb-4 flex items-center gap-2">
                <Upload size={20} className="text-[#16A34A]" /> Upload Excel / CSV File
              </h2>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
                  ${dragOver ? 'border-[#16A34A] bg-[#F0FDFA] scale-[1.01]' : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#16A34A] hover:bg-[#F0FDFA]'}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleInputChange}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className={`p-4 rounded-2xl transition-colors ${dragOver ? 'bg-[#16A34A]/10' : 'bg-[#E2E8F0]'}`}>
                    <FileSpreadsheet size={36} className={dragOver ? 'text-[#16A34A]' : 'text-[#94A3B8]'} />
                  </div>
                  {selectedFile ? (
                    <div className="space-y-1">
                      <p className="font-bold text-[#1E293B] text-lg">{selectedFile.name}</p>
                      <p className="text-sm text-[#475569]">{(selectedFile.size / 1024).toFixed(1)} KB · Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-bold text-[#1E293B] text-lg">Drop your file here or click to browse</p>
                      <p className="text-sm text-[#475569]">Supports .xlsx, .xls, .csv · Max 10 MB · Up to 5,000 rows</p>
                    </div>
                  )}
                </div>
              </div>

              {fileError && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" /> {fileError}
                </div>
              )}

              {/* Buttons */}
              <div className="mt-5 flex gap-3">
                {selectedFile && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFileError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-semibold"
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                )}
                <button
                  onClick={handleValidate}
                  disabled={!selectedFile || step === 'validating'}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold hover:bg-[#15803D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#16A34A]/20"
                >
                  {step === 'validating' ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {step === 'validating' ? 'Validating...' : 'Validate File'}
                </button>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            <InfoCard />
            <TemplateCard onDownload={downloadTemplate} />
          </div>
        </div>
      )}

      {/* ── STEP: PREVIEW ── */}
      {step === 'preview' && summary && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <SummaryCard label="Total Rows" value={summary.total} color="text-[#1E293B]" bg="bg-white" />
            <SummaryCard label="Valid" value={summary.valid} color="text-emerald-700" bg="bg-emerald-50" border="border-emerald-200" />
            <SummaryCard label="Errors" value={summary.error} color="text-red-700" bg="bg-red-50" border="border-red-200" />
            <SummaryCard label="Duplicates" value={summary.duplicate} color="text-amber-700" bg="bg-amber-50" border="border-amber-200" />
            <SummaryCard label="Existing" value={summary.existing} color="text-blue-700" bg="bg-blue-50" border="border-blue-200" />
            <SummaryCard label="New" value={summary.newCustomers} color="text-[#16A34A]" bg="bg-[#F0FDFA]" border="border-[#CCFBF1]" />
          </div>

          {/* Existing customers bulk action */}
          {summary.existing > 0 && (
            <div className="flex flex-wrap items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <Info size={18} className="text-blue-600 shrink-0" />
              <span className="text-blue-800 font-semibold text-sm flex-1">
                {summary.existing} existing customer(s) found. Choose default action:
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => applyToAllExisting('skip')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-colors ${updateAllExisting === 'skip' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
                >
                  <SkipForward size={13} className="inline mr-1" /> Skip All
                </button>
                <button
                  onClick={() => applyToAllExisting('update')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-colors ${updateAllExisting === 'update' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}
                >
                  <Edit3 size={13} className="inline mr-1" /> Update All
                </button>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#CCFBF1] overflow-hidden shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-[#CCFBF1]">
              <div className="flex flex-wrap items-center gap-2">
                <Filter size={15} className="text-[#94A3B8]" />
                <span className="text-xs font-bold text-[#475569] mr-1">Filter:</span>

                {/* All */}
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filterStatus === 'all'
                      ? 'bg-[#1E293B] text-white shadow-sm'
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                  }`}
                >
                  All <span className="ml-1 opacity-70">({rows.length})</span>
                </button>

                {/* Valid */}
                <button
                  onClick={() => setFilterStatus('valid')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    filterStatus === 'valid'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'valid' ? 'bg-white' : 'bg-emerald-500'}`} />
                  Valid <span className="opacity-70">({rows.filter(r => r.status === 'valid').length})</span>
                </button>

                {/* Error */}
                <button
                  onClick={() => setFilterStatus('error')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    filterStatus === 'error'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'error' ? 'bg-white' : 'bg-red-500'}`} />
                  Error <span className="opacity-70">({rows.filter(r => r.status === 'error').length})</span>
                </button>

                {/* Duplicate */}
                <button
                  onClick={() => setFilterStatus('duplicate')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    filterStatus === 'duplicate'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'duplicate' ? 'bg-white' : 'bg-amber-500'}`} />
                  Duplicate <span className="opacity-70">({rows.filter(r => r.status === 'duplicate').length})</span>
                </button>

                {/* Existing */}
                <button
                  onClick={() => setFilterStatus('existing')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    filterStatus === 'existing'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === 'existing' ? 'bg-white' : 'bg-blue-500'}`} />
                  Existing <span className="opacity-70">({rows.filter(r => r.status === 'existing').length})</span>
                </button>
              </div>

              <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="text"
                  placeholder="Search name, email, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all placeholder:font-medium"
                />
              </div>
            </div>


            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#CCFBF1]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#475569] uppercase tracking-wider w-12">#</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#475569] uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#475569] uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#475569] uppercase tracking-wider">Mobile</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#475569] uppercase tracking-wider">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#475569] uppercase tracking-wider">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#475569] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-[#475569] uppercase tracking-wider">Action</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-[#475569] uppercase tracking-wider w-20">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredRows.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-12 text-center text-[#94A3B8]">No rows match the selected filter.</td></tr>
                  ) : filteredRows.map(row => (
                    <React.Fragment key={row.rowNumber}>
                      <tr className={`transition-colors ${expandedRow === row.rowNumber ? 'bg-[#F8FAFC]' : 'hover:bg-[#FAFFFE]'}`}>
                        <td className="px-4 py-3 text-[#94A3B8] font-mono text-xs">{row.rowNumber}</td>
                        <td className="px-4 py-3 font-semibold text-[#1E293B]">
                          {row.data.firstName || ''} {row.data.lastName || ''}
                          {row.status === 'existing' && (
                            <div className="text-xs text-blue-500 mt-0.5">Exists as: {row.existingUserName}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#475569] text-xs">{row.data.email || <span className="text-red-400 italic">missing</span>}</td>
                        <td className="px-4 py-3 text-[#475569] text-xs">{row.data.mobile || <span className="text-red-400 italic">missing</span>}</td>
                        <td className="px-4 py-3 text-[#475569] text-xs">{row.data.membershipPlan || '—'}</td>
                        <td className="px-4 py-3 text-[#475569] text-xs">{row.data.branch || '—'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-4 py-3">
                          {row.status === 'existing' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => toggleExistingAction(row.rowNumber, 'skip')}
                                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${row.action === 'skip' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'}`}
                              >Skip</button>
                              <button
                                onClick={() => setUpdateRowData(row)}
                                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${row.action === 'update' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'}`}
                              >Update</button>
                            </div>
                          )}
                          {row.status === 'valid' && <span className="text-xs text-emerald-600 font-semibold">Will Import</span>}
                          {row.status === 'error' && (
                            <button onClick={() => setFixRowData(row)} className="px-3 py-1.5 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors shadow-sm">Fix Errors</button>
                          )}
                          {row.status === 'duplicate' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => toggleExistingAction(row.rowNumber, 'skip')}
                                className={`px-2 py-1 rounded text-xs font-bold transition-colors ${row.action === 'skip' || row.action === 'none' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'}`}
                              >Skip</button>
                              <button
                                onClick={() => setReviewRowData(row)}
                                className="px-2 py-1 rounded text-xs font-bold transition-colors bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                              >Review</button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 flex items-center justify-center">
                          <button
                            onClick={() => setExpandedRow(expandedRow === row.rowNumber ? null : row.rowNumber)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                              expandedRow === row.rowNumber 
                                ? 'bg-[#16A34A] text-white border-[#16A34A] shadow-sm' 
                                : 'bg-white text-[#16A34A] border-[#CCFBF1] hover:bg-[#F0FDFA]'
                            }`}
                          >
                            <Eye size={14} className={expandedRow === row.rowNumber ? 'text-white' : 'text-[#16A34A]'} />
                            View
                          </button>
                        </td>
                      </tr>
                      {expandedRow === row.rowNumber && (
                        <tr className="bg-[#F8FAFC] border-y border-[#E2E8F0]">
                          <td colSpan={9} className="p-4">
                            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                              
                              {/* Errors and Warnings */}
                              {(row.errors.length > 0 || row.warnings.length > 0) && (
                                <div className="p-4 border-b border-[#E2E8F0] space-y-2 bg-[#FAFAFA]">
                                  {row.errors.map((e, i) => (
                                    <div key={i} className="flex items-start gap-2 text-red-700 text-xs bg-red-50 p-2.5 rounded-lg border border-red-100 font-medium">
                                      <XCircle size={14} className="shrink-0 mt-0.5 text-red-500" /> {e}
                                    </div>
                                  ))}
                                  {row.warnings.map((w, i) => (
                                    <div key={i} className="flex items-start gap-2 text-amber-700 text-xs bg-amber-50 p-2.5 rounded-lg border border-amber-100 font-medium">
                                      <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" /> {w}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Customer Details */}
                              <div className="p-4">
                                <h4 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <FileText size={12} /> Parsed Data
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
                                  {Object.entries(row.data).map(([k, v]) => {
                                    // Format value nicely
                                    let displayVal = '—';
                                    if (v !== null && v !== undefined && v !== '') {
                                      if (typeof v === 'string' && v.match(/^\d{4}-\d{2}-\d{2}T/)) {
                                        displayVal = new Date(v).toLocaleDateString();
                                      } else {
                                        displayVal = String(v);
                                      }
                                    }
                                    
                                    return (
                                      <div key={k}>
                                        <div className="text-[10px] font-bold text-[#64748B] uppercase mb-0.5">
                                          {k.replace(/([A-Z])/g, ' $1').trim()}
                                        </div>
                                        <div className="text-xs text-[#1E293B] font-semibold">
                                          {displayVal}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ready to Import Summary + Action Buttons */}
          <div className="bg-white rounded-2xl border border-[#CCFBF1] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              <BarChart2 size={20} className="text-[#16A34A]" /> Ready to Import Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <ReadySummaryCard label="Total Records" value={summary.total} />
              <ReadySummaryCard label="New Customers" value={readyToImport} color="text-[#16A34A]" />
              <ReadySummaryCard label="Will Update" value={toUpdate} color="text-blue-600" />
              <ReadySummaryCard label="Will Skip" value={toSkip} color="text-[#475569]" />
            </div>
            <div className="flex flex-col gap-3">
              {readyToImport + toUpdate === 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-800 text-sm">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  No valid records to import. Please fix the errors in your file and re-upload, or ensure you have marked existing customers to "Update".
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => { setStep('upload'); setSelectedFile(null); setValidationResult(null); setRows([]); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] transition-colors font-semibold text-sm"
                >
                  <ArrowLeft size={16} /> Cancel
                </button>
                <button
                  onClick={() => { if (fileInputRef.current) fileInputRef.current.value = ''; setSelectedFile(null); setValidationResult(null); setRows([]); setStep('upload'); }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] transition-colors font-semibold text-sm"
                >
                  <RefreshCw size={16} /> Re-upload
                </button>
                <button
                  disabled={readyToImport + toUpdate === 0}
                  onClick={() => setShowConfirmModal(true)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold hover:bg-[#15803D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#16A34A]/20"
                >
                  <Users size={16} /> Import Customers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP: IMPORTING ── */}
      {step === 'importing' && (
        <div className="bg-white rounded-2xl border border-[#CCFBF1] p-12 shadow-sm text-center">
          <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#CCFBF1] flex items-center justify-center">
                <RefreshCw size={32} className="text-[#16A34A] animate-spin" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1E293B]">Importing Customers...</h2>
              <p className="text-[#475569] mt-2">Please wait while we securely import your customer data.</p>
            </div>
            <div className="w-full bg-[#E2E8F0] rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#16A34A] to-[#0D9488] rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
            <p className="text-sm text-[#94A3B8]">{importProgress}% complete</p>
          </div>
        </div>
      )}

      {/* ── STEP: RESULT ── */}
      {step === 'result' && importResult && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#CCFBF1] p-8 shadow-sm text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${importResult.status === 'FAILED' ? 'bg-red-100' : 'bg-emerald-100'}`}>
              {importResult.status === 'FAILED'
                ? <XCircle size={40} className="text-red-600" />
                : <CheckCircle size={40} className="text-emerald-600" />
              }
            </div>
            <h2 className="text-2xl font-bold text-[#1E293B]">
              {importResult.status === 'FAILED' ? 'Import Failed' : importResult.status === 'PARTIAL' ? 'Import Partially Completed' : 'Import Successful!'}
            </h2>
            <p className="text-[#475569] mt-2">
              {importResult.status === 'COMPLETED'
                ? 'All valid customers have been imported successfully.'
                : 'Some records could not be imported. Download the error report for details.'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ResultCard label="New Customers" value={importResult.newCustomers} icon={<UserCheck size={20} />} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-200" />
            <ResultCard label="Updated" value={importResult.updatedCustomers} icon={<Edit3 size={20} />} color="text-blue-600" bg="bg-blue-50" border="border-blue-200" />
            <ResultCard label="Skipped" value={importResult.skippedCustomers} icon={<SkipForward size={20} />} color="text-amber-600" bg="bg-amber-50" border="border-amber-200" />
            <ResultCard label="Failed" value={importResult.failedRecords} icon={<UserX size={20} />} color="text-red-600" bg="bg-red-50" border="border-red-200" />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/admin/members')}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold hover:bg-[#15803D] transition-colors shadow-lg shadow-[#16A34A]/20"
            >
              <Users size={16} /> View Members
            </button>
            {importResult.failedRecords > 0 && (
              <button
                onClick={() => downloadErrorReport(importResult.failedRows)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-semibold text-sm"
              >
                <Download size={16} /> Download Error Report
              </button>
            )}
            <button
              onClick={() => setStep('history')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#CCFBF1] text-[#475569] hover:bg-[#F0FDFA] transition-colors font-semibold text-sm"
            >
              <History size={16} /> View Import History
            </button>
            <button
              onClick={() => { setStep('upload'); setSelectedFile(null); setValidationResult(null); setRows([]); setImportResult(null); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#CCFBF1] text-[#475569] hover:bg-[#F0FDFA] transition-colors font-semibold text-sm"
            >
              <Upload size={16} /> Import Another File
            </button>
          </div>
        </div>
      )}

      {/* ── STEP: HISTORY ── */}
      {step === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1E293B] flex items-center gap-2">
              <History size={20} className="text-[#16A34A]" /> Import History
            </h2>
            <button
              onClick={() => setStep('upload')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#16A34A] text-white font-bold hover:bg-[#15803D] transition-colors text-sm shadow-lg shadow-[#16A34A]/20"
            >
              <Upload size={15} /> New Import
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#CCFBF1] overflow-hidden shadow-sm">
            {history.length === 0 ? (
              <div className="p-12 text-center text-[#94A3B8]">
                <History size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No import history yet.</p>
                <p className="text-sm mt-1">Your import records will appear here after you complete an import.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8FAFC] border-b border-[#CCFBF1]">
                    <tr>
                      {['File Name', 'Imported Date', 'Imported By', 'Total', 'New', 'Updated', 'Skipped', 'Failed', 'Status', 'Actions'].map(h => {
                        const isNumeric = ['Total', 'New', 'Updated', 'Skipped', 'Failed'].includes(h);
                        return (
                          <th key={h} className={`px-4 py-3 text-xs font-bold text-[#475569] uppercase tracking-wider ${isNumeric ? 'text-center' : 'text-left'}`}>
                            {h}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9]">
                    {history.map(h => (
                      <tr key={h._id} className="hover:bg-[#FAFFFE] transition-colors">
                        <td className="px-4 py-3 font-semibold text-[#1E293B] flex items-center gap-2">
                          <FileText size={14} className="text-[#94A3B8] shrink-0" /> {h.fileName}
                        </td>
                        <td className="px-4 py-3 text-[#475569] text-xs whitespace-nowrap">{new Date(h.createdAt).toLocaleString()}</td>
                        <td className="px-4 py-3 text-[#475569] text-xs">{h.importedBy?.firstName} {h.importedBy?.lastName}</td>
                        <td className="px-4 py-3 text-center font-bold text-[#1E293B]">{h.totalRecords}</td>
                        <td className="px-4 py-3 text-center font-bold text-emerald-600">{h.newCustomers}</td>
                        <td className="px-4 py-3 text-center font-bold text-blue-600">{h.updatedCustomers}</td>
                        <td className="px-4 py-3 text-center font-bold text-amber-600">{h.skippedCustomers}</td>
                        <td className="px-4 py-3 text-center font-bold text-red-500">{h.failedRecords}</td>
                        <td className="px-4 py-3"><ImportStatusBadge status={h.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setHistoryDetail(h)}
                              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-[#16A34A] hover:bg-[#F0FDFA] transition-colors border border-[#CCFBF1]"
                            >
                              <Eye size={11} /> View
                            </button>
                            {h.failedRecords > 0 && (
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await api.get(`/import/history/${h._id}`);
                                    downloadErrorReport(res.data.record.failedRows || []);
                                  } catch {}
                                }}
                                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors border border-red-200"
                              >
                                <Download size={11} /> Errors
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CONFIRM IMPORT MODAL ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#CCFBF1] overflow-hidden">
            <div className="p-6 border-b border-[#CCFBF1] bg-[#F8FAFC]">
              <h2 className="text-xl font-bold text-[#1E293B]">Confirm Import</h2>
              <p className="text-sm text-[#475569] mt-1">Review before importing. This action cannot be undone.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2 text-sm">
                <ConfirmRow label="Total Records" value={summary?.total || 0} />
                <ConfirmRow label="New Customers to Create" value={readyToImport} highlight />
                <ConfirmRow label="Existing Customers to Update" value={toUpdate} />
                <ConfirmRow label="Records to Skip" value={toSkip} />
                <ConfirmRow label="Errors (skipped)" value={summary?.error || 0} />
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-800 text-sm">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                New customers will receive a secure password setup invitation. No plain-text passwords are stored or exported.
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC] font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#16A34A] text-white font-bold hover:bg-[#15803D] transition-colors shadow-lg shadow-[#16A34A]/20"
                >
                  Import Customers
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY DETAIL MODAL ── */}
      {historyDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#CCFBF1] overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-5 border-b border-[#CCFBF1] bg-[#F8FAFC] flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-[#1E293B]">{historyDetail.fileName}</h2>
                <p className="text-xs text-[#475569] mt-1">{new Date(historyDetail.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setHistoryDetail(null)} className="p-1.5 rounded-lg hover:bg-[#E2E8F0] transition-colors text-[#475569]">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <MiniStatCard label="New" value={historyDetail.newCustomers} color="text-[#16A34A]" />
                <MiniStatCard label="Updated" value={historyDetail.updatedCustomers} color="text-blue-600" />
                <MiniStatCard label="Skipped" value={historyDetail.skippedCustomers} color="text-orange-500" />
                <MiniStatCard label="Failed" value={historyDetail.failedRecords} color="text-red-600" />
              </div>
              
              {historyDetail.skippedCustomers > 0 && (!historyDetail.failedRows || historyDetail.failedRows.length === 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center mt-4">
                  <AlertTriangle size={28} className="mx-auto text-amber-500 mb-3" />
                  <h3 className="font-bold text-amber-800 text-sm mb-1">Records Skipped</h3>
                  <p className="text-xs text-amber-700 max-w-sm mx-auto leading-relaxed">
                    {historyDetail.skippedCustomers} records were skipped during this import. This happens if the customers already exist in the system and "Update" wasn't selected, or if there were duplicate emails/phone numbers within the file itself.
                  </p>
                </div>
              )}

              {historyDetail.failedRows && historyDetail.failedRows.length > 0 && (
                <div>
                  <h3 className="font-bold text-[#1E293B] mb-3 flex items-center gap-2 text-sm">
                    <AlertCircle size={15} className="text-red-500" /> Failed Rows ({historyDetail.failedRows.length})
                  </h3>
                  <div className="space-y-2">
                    {historyDetail.failedRows.map((fr: any, i: number) => (
                      <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-red-700">Row {fr.rowNumber}</span>
                          <span className="text-xs text-[#475569]">{fr.data?.email}</span>
                        </div>
                        {(fr.errors || []).map((e: string, j: number) => (
                          <p key={j} className="text-xs text-red-600 flex items-start gap-1">
                            <XCircle size={11} className="shrink-0 mt-0.5" /> {e}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── FIX ERROR MODAL ── */}
      {fixRowData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#CCFBF1] overflow-hidden">
            <div className="p-5 border-b border-[#CCFBF1] bg-[#F8FAFC] flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-[#1E293B]">Fix Row {fixRowData.rowNumber}</h2>
                <p className="text-xs text-red-600 font-semibold mt-1">Please correct the errors below</p>
              </div>
              <button onClick={() => setFixRowData(null)} className="p-1.5 rounded-lg hover:bg-[#E2E8F0] transition-colors text-[#475569]">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-4 space-y-2">
                {fixRowData.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 flex items-start gap-1">
                    <XCircle size={14} className="shrink-0 mt-0.5" /> {e}
                  </p>
                ))}
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const newData = { ...fixRowData.data };
                fd.forEach((val, key) => { newData[key] = val; });
                handleFixSave(newData);
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">First Name</label>
                    <input name="firstName" defaultValue={fixRowData.data.firstName} className="w-full text-sm p-2 border border-[#E2E8F0] rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Last Name</label>
                    <input name="lastName" defaultValue={fixRowData.data.lastName} className="w-full text-sm p-2 border border-[#E2E8F0] rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Email</label>
                    <input name="email" type="email" defaultValue={fixRowData.data.email} className="w-full text-sm p-2 border border-[#E2E8F0] rounded-lg" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#475569] mb-1">Mobile</label>
                    <input name="mobile" defaultValue={fixRowData.data.mobile} className="w-full text-sm p-2 border border-[#E2E8F0] rounded-lg" required />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[#F1F5F9]">
                  <button type="button" onClick={() => setFixRowData(null)} className="px-4 py-2 rounded-xl text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC]">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl text-sm font-bold bg-[#16A34A] text-white hover:bg-[#15803D]">Save & Validate</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── UPDATE EXISTING MODAL ── */}
      {updateRowData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-blue-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-blue-100 bg-blue-50 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-blue-900">Update Existing Customer</h2>
                <p className="text-xs text-blue-700 mt-1">Review the differences before updating</p>
              </div>
              <button onClick={() => setUpdateRowData(null)} className="p-1.5 rounded-lg hover:bg-blue-200 transition-colors text-blue-800">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                {/* Existing Data */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                  <h3 className="font-bold text-[#1E293B] mb-4 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#94A3B8]" /> Existing Data
                  </h3>
                  <div className="space-y-3 text-sm">
                    <ConfirmRow label="Name" value={updateRowData.existingUserName || 'N/A'} />
                    <ConfirmRow label="Email" value={updateRowData.data.email || 'N/A'} />
                    <ConfirmRow label="Mobile" value={updateRowData.data.mobile || 'N/A'} />
                    <ConfirmRow label="Plan" value={updateRowData.existingData?.planName || 'No Plan'} />
                    <ConfirmRow label="Branch" value={updateRowData.existingData?.branchName || 'Unassigned'} />
                  </div>
                </div>
                {/* Uploaded Data */}
                <div className="bg-[#F0FDFA] border border-[#CCFBF1] rounded-xl p-4">
                  <h3 className="font-bold text-[#0F766E] mb-4 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#14B8A6]" /> Uploaded Data
                  </h3>
                  <div className="space-y-3 text-sm">
                    <ConfirmRow label="Name" value={`${updateRowData.data.firstName || ''} ${updateRowData.data.lastName || ''}`.trim() || 'N/A'} highlight />
                    <ConfirmRow label="Email" value={updateRowData.data.email || 'N/A'} highlight />
                    <ConfirmRow label="Mobile" value={updateRowData.data.mobile || 'N/A'} highlight />
                    <ConfirmRow label="Plan" value={updateRowData.data.membershipPlan || 'No Plan'} highlight />
                    <ConfirmRow label="Branch" value={updateRowData.data.branch || 'Unassigned'} highlight />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-2">
                <button onClick={() => setUpdateRowData(null)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC]">Cancel</button>
                <button onClick={handleUpdateConfirm} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md">Confirm Update</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REVIEW DUPLICATE MODAL ── */}
      {reviewRowData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-amber-200 overflow-hidden">
            <div className="p-5 border-b border-amber-100 bg-amber-50 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-amber-900">Review Duplicate Record</h2>
                <p className="text-xs text-amber-700 mt-1">Row {reviewRowData.rowNumber} conflicts with another row in this file</p>
              </div>
              <button onClick={() => setReviewRowData(null)} className="p-1.5 rounded-lg hover:bg-amber-200 transition-colors text-amber-800">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-5">
              <div className="mb-4 space-y-2">
                {reviewRowData.errors.map((e, i) => (
                  <p key={i} className="text-xs text-amber-600 flex items-start gap-1 font-semibold">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {e}
                  </p>
                ))}
              </div>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 mb-6">
                 <div className="space-y-2 text-sm">
                    <ConfirmRow label="Name" value={`${reviewRowData.data.firstName || ''} ${reviewRowData.data.lastName || ''}`} />
                    <ConfirmRow label="Email" value={reviewRowData.data.email || 'N/A'} />
                    <ConfirmRow label="Mobile" value={reviewRowData.data.mobile || 'N/A'} />
                 </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleReviewKeep('skip')} className="flex-1 px-4 py-2.5 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 font-bold transition-colors">Skip this Row</button>
                <button onClick={() => handleReviewKeep('import')} className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 transition-colors shadow-sm">Keep this Row</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepIndicator: React.FC<{ step: Step }> = ({ step }) => {
  const steps = [
    { key: 'upload', label: 'Upload' },
    { key: 'preview', label: 'Preview' },
    { key: 'importing', label: 'Import' },
    { key: 'result', label: 'Result' },
  ];
  const activeIndex = steps.findIndex(s =>
    step === 'validating' ? s.key === 'upload' :
    step === 'confirming' ? s.key === 'preview' :
    s.key === step
  );
  if (step === 'history') return null;
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${i <= activeIndex ? 'bg-[#16A34A] text-white' : 'bg-[#E2E8F0] text-[#94A3B8]'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${i <= activeIndex ? 'bg-white/30' : 'bg-white/50'}`}>{i + 1}</span>
            {s.label}
          </div>
          {i < steps.length - 1 && <div className={`h-0.5 w-6 ${i < activeIndex ? 'bg-[#16A34A]' : 'bg-[#E2E8F0]'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
};

const InfoCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-[#CCFBF1] p-5 shadow-sm">
    <h3 className="font-bold text-[#1E293B] mb-3 flex items-center gap-2 text-sm"><Info size={16} className="text-[#16A34A]" /> Required Columns</h3>
    <div className="space-y-1.5">
      {[
        { col: 'Customer Name', req: true },
        { col: 'Email', req: true },
        { col: 'Mobile Number', req: true },
        { col: 'Gender', req: false },
        { col: 'Date of Birth', req: false },
        { col: 'Height (cm)', req: false },
        { col: 'Weight (kg)', req: false },
        { col: 'Membership Plan', req: false },
        { col: 'Membership Start Date', req: false },
        { col: 'Membership End Date', req: false },
        { col: 'Branch', req: false },
        { col: 'Trainer', req: false },
        { col: 'Status', req: false },
        { col: 'Emergency Contact', req: false },
      ].map(({ col, req }) => (
        <div key={col} className="flex items-center justify-between text-xs">
          <span className="text-[#475569]">{col}</span>
          {req
            ? <span className="text-red-600 font-bold bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[10px]">Required</span>
            : <span className="text-[#94A3B8] bg-[#F8FAFC] border border-[#E2E8F0] px-1.5 py-0.5 rounded text-[10px]">Optional</span>
          }
        </div>
      ))}
    </div>
  </div>
);

const TemplateCard: React.FC<{ onDownload: () => void }> = ({ onDownload }) => (
  <div className="bg-gradient-to-br from-[#16A34A] to-[#0D9488] rounded-2xl p-5 text-white shadow-lg shadow-green-200">
    <FileSpreadsheet size={24} className="mb-3 opacity-80" />
    <h3 className="font-bold text-base mb-1">Download Template</h3>
    <p className="text-sm opacity-80 mb-4">Get the pre-formatted Excel template with all required columns and sample data.</p>
    <button
      onClick={onDownload}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors text-sm font-bold w-full justify-center backdrop-blur-sm border border-white/30"
    >
      <Download size={15} /> Download Excel Template
    </button>
  </div>
);

const StatusBadge: React.FC<{ status: RowStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotColor}`} />
      {cfg.label}
    </span>
  );
};

const ImportStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const cfg: Record<string, string> = {
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PARTIAL: 'bg-amber-50 text-amber-700 border-amber-200',
    FAILED: 'bg-red-50 text-red-700 border-red-200',
    PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold border ${cfg[status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
      {status}
    </span>
  );
};

const SummaryCard: React.FC<{ label: string; value: number; color: string; bg: string; border?: string }> = ({ label, value, color, bg, border }) => (
  <div className={`${bg} rounded-2xl p-4 border ${border || 'border-[#CCFBF1]'} text-center shadow-sm`}>
    <div className={`text-2xl font-black ${color}`}>{value}</div>
    <div className="text-xs text-[#475569] font-semibold mt-1">{label}</div>
  </div>
);

const ReadySummaryCard: React.FC<{ label: string; value: number; color?: string }> = ({ label, value, color }) => (
  <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
    <div className={`text-xl font-black ${color || 'text-[#1E293B]'}`}>{value}</div>
    <div className="text-xs text-[#475569] font-semibold mt-1">{label}</div>
  </div>
);

const ResultCard: React.FC<{ label: string; value: number; icon: React.ReactNode; color: string; bg: string; border: string }> = ({ label, value, icon, color, bg, border }) => (
  <div className={`${bg} rounded-2xl p-5 border ${border} text-center shadow-sm`}>
    <div className={`flex justify-center mb-2 ${color}`}>{icon}</div>
    <div className={`text-3xl font-black ${color}`}>{value}</div>
    <div className="text-xs text-[#475569] font-semibold mt-1">{label}</div>
  </div>
);

const ConfirmRow: React.FC<{ label: string; value: number; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex justify-between items-center py-1 border-b border-[#F1F5F9] last:border-0">
    <span className="text-[#475569]">{label}</span>
    <span className={`font-bold ${highlight ? 'text-[#16A34A]' : 'text-[#1E293B]'}`}>{value}</span>
  </div>
);

const MiniStatCard: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="bg-white rounded-xl p-3 text-center border border-[#E2E8F0]">
    <div className={`text-xl font-black ${color}`}>{value}</div>
    <div className="text-xs text-[#475569] font-semibold mt-0.5">{label}</div>
  </div>
);

export default GymAdminImportCustomers;
