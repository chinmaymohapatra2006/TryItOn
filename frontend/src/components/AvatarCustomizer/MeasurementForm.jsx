import React, { useState, useEffect } from 'react';
import { useMeasurements, defaultMeasurements, BODY_PRESETS } from '../../context/MeasurementContext.jsx';
import { Save, RotateCcw, AlertCircle, CheckCircle2, UserCheck, Sparkles } from 'lucide-react';

const limits = {
  height: { min: 140, max: 220, required: true },
  shoulderWidth: { min: 30, max: 60, required: true },
  chest: { min: 70, max: 130, required: true },
  waist: { min: 50, max: 120, required: true },
  hip: { min: 70, max: 130, required: true },
  armLength: { min: 45, max: 85, required: false },
  legLength: { min: 65, max: 110, required: false },
};

export const MeasurementForm = () => {
  const { measurements, activePreset, updateMeasurements, applyBodyPreset, resetMeasurements } = useMeasurements();
  const [formData, setFormData] = useState(measurements);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  // Sync form when global context changes
  useEffect(() => {
    setFormData(measurements);
  }, [measurements]);

  const validateField = (name, value) => {
    const rules = limits[name];
    if (rules.required && (value === '' || value === null)) {
      return 'This field is required.';
    }
    const num = parseFloat(value);
    if (isNaN(num)) {
      return 'Must be a valid number.';
    }
    if (num < rules.min || num > rules.max) {
      return `Must be between ${rules.min} and ${rules.max} cm.`;
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setStatus(null);

    const errorMsg = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: errorMsg
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    let isValid = true;
    
    Object.keys(limits).forEach(key => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) {
        newErrors[key] = errorMsg;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (isValid) {
      const parsedData = Object.keys(formData).reduce((acc, key) => {
        acc[key] = parseFloat(formData[key]);
        return acc;
      }, {});
      
      updateMeasurements(parsedData);
      setStatus({ type: 'success', message: 'Body parameters and garment fitting updated!' });
      setTimeout(() => setStatus(null), 3000);
    } else {
      setStatus({ type: 'error', message: 'Please fix validation errors above.' });
    }
  };

  const handleReset = () => {
    resetMeasurements();
    setErrors({});
    setStatus(null);
  };

  const InputField = ({ name, label, required }) => (
    <div className="mb-4">
      <label 
        htmlFor={`input-${name}`}
        className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
      >
        {label} {required && <span className="text-purple-400">*</span>}
      </label>
      <div className="relative">
        <input
          id={`input-${name}`}
          type="number"
          name={name}
          value={formData[name] === null ? '' : formData[name]}
          onChange={handleChange}
          step="0.5"
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `error-${name}` : undefined}
          className={`w-full bg-slate-900 border ${errors[name] ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:ring-purple-500'} rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 transition-all`}
          placeholder={`e.g. ${defaultMeasurements[name]}`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono pointer-events-none">cm</span>
      </div>
      {errors[name] && (
        <p id={`error-${name}`} className="mt-1.5 text-xs text-rose-400 flex items-start gap-1" role="alert">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{errors[name]}</span>
        </p>
      )}
    </div>
  );

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-400" />
            Body Measurements & Fitting Profiles
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test and adapt costume fitting across distinct human body proportions.
          </p>
        </div>
      </div>

      {/* Body Preset Quick Selectors (Phase 6 Requirement) */}
      <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
        <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Phase 6 Test Configurations</span>
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {Object.entries(BODY_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyBodyPreset(key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border text-center ${
                activePreset === key
                  ? 'bg-purple-600/30 text-purple-200 border-purple-500 shadow-md ring-1 ring-purple-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="font-bold">{preset.label.split(' ')[0]} Body</div>
              <div className="text-[10px] text-slate-400 font-normal mt-0.5">{preset.height}cm • {preset.chest}cm</div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <InputField name="height" label="Height" required />
          <InputField name="shoulderWidth" label="Shoulder Width" required />
          <InputField name="chest" label="Chest" required />
          <InputField name="waist" label="Waist" required />
          <InputField name="hip" label="Hip" required />
          <InputField name="armLength" label="Arm Length" required={false} />
          <InputField name="legLength" label="Leg Length" required={false} />
        </div>

        {status && (
          <div className={`mt-2 p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
            status.type === 'success' 
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40' 
              : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
          }`}>
            {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {status.message}
          </div>
        )}

        <div className="mt-6 pt-5 border-t border-slate-800 flex items-center gap-3">
          <button
            type="submit"
            className="flex-1 inline-flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-purple-600/20"
          >
            <Save className="w-4 h-4" />
            Apply Fitting
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex justify-center items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeasurementForm;
