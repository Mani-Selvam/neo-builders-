import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { getPath, setPath, formatDateForInput } from '../../utils/objectPath';
import { createMasterApi } from '../../api/masterApi';

function useRefOptions(field) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!field.refEndpoint) return;
    const api = createMasterApi(field.refEndpoint);
    api.listAll().then(({ data }) => setOptions(data.data || [])).catch(() => setOptions([]));
  }, [field.refEndpoint]);

  return options;
}

function FieldInput({ field, value, onChange }) {
  const refOptions = field.type === 'select' && field.refEndpoint ? useRefOptions(field) : null;

  if (field.type === 'textarea') {
    return (
      <textarea
        className="form-textarea"
        rows={3}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  if (field.type === 'select') {
    const options = field.refEndpoint ? refOptions : field.options?.map((o) => ({ _id: o, [field.refLabel || 'label']: o }));
    return (
      <select className="form-select" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select {field.label}</option>
        {(options || []).map((opt) => (
          <option key={opt._id || opt} value={opt._id || opt}>
            {opt[field.refLabel] || opt.label || opt._id || opt}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'date') {
    return (
      <input
        type="date"
        className="form-input"
        value={formatDateForInput(value)}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  return (
    <input
      type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
      className="form-input"
      value={value ?? ''}
      onChange={(e) => onChange(field.type === 'number' ? e.target.valueAsNumber || '' : e.target.value)}
    />
  );
}

export default function MasterFormModal({ config, initialData, onClose, onSaved, toast }) {
  const isEdit = Boolean(initialData?._id);
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const api = useMemo(() => createMasterApi(config.endpoint), [config.endpoint]);

  useEffect(() => {
    setFormData(initialData || {});
  }, [initialData]);

  const sections = useMemo(() => {
    const map = new Map();
    config.fields.forEach((f) => {
      const section = f.section || 'Details';
      if (!map.has(section)) map.set(section, []);
      map.get(section).push(f);
    });
    return Array.from(map.entries());
  }, [config.fields]);

  const handleChange = (name, value) => {
    setFormData((prev) => setPath(prev, name, value));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    config.fields.forEach((f) => {
      if (f.required) {
        const value = getPath(formData, f.name);
        if (value === undefined || value === null || value === '') {
          newErrors[f.name] = `${f.label} is required`;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await api.update(initialData._id, formData);
        toast.success(`${config.title} updated successfully`);
      } else {
        await api.create(formData);
        toast.success(`${config.title} created successfully`);
      }
      onSaved();
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong';
      toast.error(message);
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((fe) => {
          fieldErrors[fe.field] = fe.message;
        });
        setErrors(fieldErrors);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-panel ${config.fields && config.fields.length <= 2 ? 'modal-narrow' : ''}`}>
        <div className="modal-header">
          <h3>{isEdit ? `Edit ${config.title}` : `Add ${config.title}`}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {sections.map(([sectionName, fields]) => (
              <div key={sectionName} className="form-section">
                {sections.length > 1 && <div className="form-section-title">{sectionName}</div>}
                <div className="form-grid">
                  {fields.map((field) => (
                    <div key={field.name} className={`form-group ${field.type === 'textarea' || config.fields.length === 1 ? 'span-2' : ''}`}>
                      <label>
                        {field.label}
                        {field.required && <span className="required-mark">*</span>}
                      </label>
                      <FieldInput
                        field={field}
                        value={getPath(formData, field.name)}
                        onChange={(value) => handleChange(field.name, value)}
                      />
                      {errors[field.name] && <span className="field-error">{errors[field.name]}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
