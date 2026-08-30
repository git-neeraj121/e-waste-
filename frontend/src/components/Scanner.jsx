import React, { useState } from 'react';
import { Camera, Upload, CheckCircle, AlertCircle, Package, ArrowRight, ShieldCheck } from 'lucide-react';

function Scanner({ onAutofill, token }) {
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectedItems, setDetectedItems] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG/JPG)');
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setError('');
    setDetectedItems(null);

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage({
        base64: reader.result,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!image) return;

    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/detect-waste', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image: image.base64,
          mimeType: image.type
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze the e-waste image');
      }

      setDetectedItems(data.items);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutofillClick = () => {
    if (!detectedItems || detectedItems.length === 0) return;
    
    // Map detected categories to our scheduler keys
    // Scheduler categories are:
    // phones, laptops, batteries, screens, cables, appliances
    const schedulerPrefill = {};
    
    detectedItems.forEach(item => {
      const type = item.type;
      const qty = item.quantity || 1;
      
      if (type.includes("Phone")) schedulerPrefill.phones = qty;
      else if (type.includes("Laptop") || type.includes("Computer")) schedulerPrefill.laptops = qty;
      else if (type.includes("Batter")) schedulerPrefill.batteries = qty;
      else if (type.includes("Screen") || type.includes("Monitor")) schedulerPrefill.screens = qty;
      else if (type.includes("Cable") || type.includes("Charger")) schedulerPrefill.cables = qty;
      else if (type.includes("Appliance")) schedulerPrefill.appliances = qty;
    });

    onAutofill(schedulerPrefill);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm transition-all duration-200">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-2">
          <span>AI E-Waste Image Scanner</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Upload a photo of your old electronics. Gemini Vision will identify the items, calculate weights, and pre-fill your pickup booking details.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-xs p-3.5 rounded-xl flex items-start gap-2.5 mb-4 font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="flex flex-col gap-6">
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-950/10 min-h-[220px] text-center relative hover:border-primary-400 transition">
          {previewUrl ? (
            <div className="relative w-full max-w-[320px] h-[200px] rounded-xl overflow-hidden shadow-sm">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <label className="absolute bottom-2.5 right-2.5 bg-black/60 hover:bg-black/75 cursor-pointer text-white font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg flex items-center gap-1 transition">
                <Upload className="h-3 w-3" /> Change Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center gap-3">
              <div className="p-3 bg-primary-50 dark:bg-primary-950/40 rounded-xl text-primary-600 dark:text-primary-400">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <span className="text-sm font-extrabold text-gray-800 dark:text-gray-200 block">Select or Drop Image</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 block">PNG, JPG up to 10MB</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
          )}
        </div>

        {/* Trigger analysis button */}
        {previewUrl && !detectedItems && (
          <button
            onClick={handleScan}
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Analyzing with Gemini AI...
              </>
            ) : (
              <>
                Scan E-Waste Items
              </>
            )}
          </button>
        )}

        {/* Detected Items Results */}
        {detectedItems && (
          <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 md:p-6 flex flex-col gap-4 animate-fade-in text-xs font-semibold">
            <h3 className="font-extrabold text-sm text-gray-800 dark:text-gray-250 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
              <Package className="h-4.5 w-4.5 text-primary-500" /> AI Detection Results
            </h3>

            {detectedItems.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                ⚠️ No recognized electronic items found in the image. Please try another photo.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                {detectedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-3 rounded-xl shadow-sm">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{item.type}</p>
                      <span className="text-[10px] text-gray-400 font-medium">Confidence: {(item.confidence * 100).toFixed(0)}%</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {detectedItems.length > 0 && (
              <button
                onClick={handleAutofillClick}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md transition active:scale-98 flex items-center justify-center gap-1.5 mt-2"
              >
                Autofill into Scheduler <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Scanner;
