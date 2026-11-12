import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Eraser,
  Image as ImageIcon,
  Loader2,
  PenTool,
  Save,
  Trash2,
  Upload,
  AlertCircle
} from 'lucide-react';
import api from '../../utils/api';

const DigitalSignatureSection = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const [savedSignature, setSavedSignature] = useState<any>(null);
  const [gymInfo, setGymInfo] = useState<{ name?: string; logo?: string }>({});
  const [signatoryName, setSignatoryName] = useState('');
  const [designation, setDesignation] = useState('Gym Owner');
  const [uploadedPreview, setUploadedPreview] = useState<string>('');
  const [hasDrawn, setHasDrawn] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchSignature = async () => {
    try {
      setLoading(true);
      const res = await api.get('/awards/signature');
      if (res.data?.success) {
        setSavedSignature(res.data.signature || null);
        setGymInfo(res.data.gym || {});
        setSignatoryName(
          res.data.signature?.signatoryName || res.data.defaultSignatoryName || 'Gym Owner'
        );
        setDesignation(res.data.signature?.designation || 'Gym Owner');
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to load digital signature settings'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignature();
  }, []);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getCanvasPoint(e);
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawingRef.current = true;
    setHasDrawn(true);
    setFeedback(null);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeedback(null);

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setFeedback({ type: 'error', text: 'Please upload a PNG or JPG signature image.' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: 'error', text: 'Signature image must be smaller than 2MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setFeedback(null);
    let signatureImage = '';

    if (mode === 'draw') {
      if (!hasDrawn && savedSignature?.signatureImage) {
        // Updating signatory name/designation while keeping existing signature
        signatureImage = savedSignature.signatureImage;
      } else if (!hasDrawn) {
        setFeedback({ type: 'error', text: 'Please draw your signature or upload a PNG/JPG image.' });
        return;
      } else if (canvasRef.current) {
        signatureImage = canvasRef.current.toDataURL('image/png');
      }
    } else {
      if (uploadedPreview) {
        signatureImage = uploadedPreview;
      } else if (savedSignature?.signatureImage) {
        signatureImage = savedSignature.signatureImage;
      } else {
        setFeedback({ type: 'error', text: 'Please select a PNG or JPG signature image to upload.' });
        return;
      }
    }

    if (!signatoryName.trim()) {
      setFeedback({ type: 'error', text: 'Signatory name is required.' });
      return;
    }

    try {
      setSaving(true);
      const res = await api.put('/awards/signature', {
        signatureImage,
        signatoryName: signatoryName.trim(),
        designation: designation.trim() || 'Gym Owner'
      });

      if (res.data?.success) {
        setSavedSignature(res.data.signature);
        setUploadedPreview('');
        handleClearCanvas();
        setFeedback({ type: 'success', text: 'Digital signature saved and ready for certificates!' });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save digital signature'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Remove your saved digital signature? Previously issued certificates will still keep their original signature.')) {
      return;
    }
    try {
      setRemoving(true);
      setFeedback(null);
      const res = await api.delete('/awards/signature');
      if (res.data?.success) {
        setSavedSignature(null);
        setUploadedPreview('');
        handleClearCanvas();
        setFeedback({ type: 'success', text: 'Digital signature removed.' });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to remove digital signature'
      });
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-7 h-7 animate-spin text-[#EA580C]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2E8F0] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Digital Signature</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Used automatically on official Award Certificates for{' '}
            <span className="font-semibold text-[#111827]">{gymInfo.name || 'your gym'}</span>.
          </p>
        </div>
        {savedSignature && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start">
            <CheckCircle2 className="w-3.5 h-3.5" /> Signature Active
          </span>
        )}
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Current Saved Signature Preview */}
      {savedSignature && (
        <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Saved Signature Preview
            </span>
            <button
              type="button"
              onClick={handleRemove}
              disabled={removing}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#B91C1C] bg-white hover:bg-red-50 border border-[#E2E8F0] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {removing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Remove
            </button>
          </div>
          <div className="bg-white border border-dashed border-[#CBD5E1] rounded-xl p-4 flex flex-col items-center justify-center">
            <img
              src={savedSignature.signatureImage}
              alt="Saved Gym Owner Signature"
              className="max-h-20 object-contain"
            />
            <div className="w-48 border-t border-[#CBD5E1] mt-2 pt-1.5 text-center">
              <p className="text-xs font-bold text-[#111827]">{savedSignature.signatoryName}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                {savedSignature.designation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Signatory Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#334155] mb-1.5">
            Signatory Name <span className="text-[#B91C1C]">*</span>
          </label>
          <input
            type="text"
            value={signatoryName}
            onChange={(e) => setSignatoryName(e.target.value)}
            placeholder="e.g. Arun Kumar"
            className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#EA580C] rounded-xl text-sm text-[#111827] outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#334155] mb-1.5">
            Designation
          </label>
          <input
            type="text"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. Gym Owner / Founder"
            className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#E2E8F0] focus:border-[#EA580C] rounded-xl text-sm text-[#111827] outline-none"
          />
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-2 bg-[#F8FAFC] p-1 rounded-xl border border-[#E2E8F0] w-fit">
        <button
          type="button"
          onClick={() => setMode('draw')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            mode === 'draw' ? 'bg-[#C2410C] text-white shadow-sm' : 'text-[#64748B] hover:text-[#111827]'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          Draw Signature
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
            mode === 'upload' ? 'bg-[#C2410C] text-white shadow-sm' : 'text-[#64748B] hover:text-[#111827]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload PNG / JPG
        </button>
      </div>

      {/* Draw Pad or File Upload */}
      {mode === 'draw' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B]">
              Draw your signature in the box below using mouse or touch
            </span>
            <button
              type="button"
              onClick={handleClearCanvas}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#64748B] hover:text-[#111827] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-1 cursor-pointer"
            >
              <Eraser className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
          <div className="border-2 border-dashed border-[#CBD5E1] rounded-2xl bg-white overflow-hidden">
            <canvas
              ref={canvasRef}
              width={640}
              height={180}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              className="w-full h-44 touch-none cursor-crosshair block"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-8 px-4 border-2 border-dashed border-[#CBD5E1] hover:border-[#EA580C] rounded-2xl bg-[#F8FAFC] hover:bg-[#FFF7ED]/50 transition flex flex-col items-center justify-center gap-2 cursor-pointer"
          >
            <ImageIcon className="w-8 h-8 text-[#EA580C]" />
            <span className="text-sm font-bold text-[#111827]">Click to upload signature image</span>
            <span className="text-xs text-[#64748B]">PNG or JPG with transparent/white background (Max 2MB)</span>
          </button>

          {uploadedPreview && (
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] flex flex-col items-center">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                New Upload Preview
              </span>
              <img src={uploadedPreview} alt="Uploaded signature preview" className="max-h-20 object-contain" />
            </div>
          )}
        </div>
      )}

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E2E8F0]">
        <p className="text-[11px] text-[#64748B]">
          Previously issued certificates retain the original signature used when they were generated.
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-orange-500/15 cursor-pointer disabled:opacity-60 shrink-0 text-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {savedSignature ? 'Update Signature' : 'Save Signature'}
        </button>
      </div>
    </div>
  );
};

export default DigitalSignatureSection;

