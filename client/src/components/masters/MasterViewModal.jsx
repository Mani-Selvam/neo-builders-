import { X } from 'lucide-react';
import { getPath } from '../../utils/objectPath';

export default function MasterViewModal({ config, data, onClose }) {
  if (!data) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{config.title} Details</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="details-grid">
            {config.fields.map((field) => {
              const value = getPath(data, field.name);
              let displayValue = value;

              if (field.type === 'select' || field.type === 'ref') {
                if (value && typeof value === 'object') {
                  displayValue =
                    value.departmentName ||
                    value.designationName ||
                    value.categoryName ||
                    value.uomName ||
                    value.siteName ||
                    value.siteType ||
                    value.vehicleType ||
                    value.name ||
                    value.empName ||
                    value.stationName ||
                    value.companyName ||
                    value.clientName ||
                    '—';
                }
              }

              if (displayValue === undefined || displayValue === null || displayValue === '') {
                displayValue = '—';
              }

              return (
                <div key={field.name} className="detail-item">
                  <span className="detail-label">{field.label}</span>
                  <span className="detail-value">{String(displayValue)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
