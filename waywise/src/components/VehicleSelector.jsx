import { CarFront, Zap, Bike, Info } from 'lucide-react';
import { VEHICLE_CONFIGS } from '../utils/fareEngine';

const iconMap = {
  sedan: CarFront,
  mini: CarFront,
  auto: Zap,
  bike: Bike
};

export default function VehicleSelector({ selectedVehicle, onSelectVehicle, vehicleFares, onOpenBreakdown }) {
  return (
    <div className="vehicle-selector-wrap">
      <div className="vehicle-selector-header">
        <label>SELECT COMMUTE MODE</label>
        <span className="vehicle-calc-note">Fares auto-calculated from route distance & tolls</span>
      </div>

      <div className="vehicle-grid">
        {vehicleFares.map(v => {
          const isSelected = selectedVehicle === v.vehicleId;
          const Icon = iconMap[v.vehicleId] || CarFront;

          return (
            <div
              key={v.vehicleId}
              className={`vehicle-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectVehicle(v.vehicleId)}
            >
              <div className="vehicle-card-top">
                <span className="vehicle-icon-box">
                  <Icon size={16} />
                </span>
                <span className="vehicle-capacity">{v.capacity}</span>
              </div>

              <div className="vehicle-info">
                <strong>{v.vehicleName}</strong>
                <small>{v.description}</small>
              </div>

              <div className="vehicle-card-bottom">
                <div className="vehicle-fare">
                  <b>₹{v.totalFare}</b>
                  {v.tolls > 0 && <span className="toll-tag">incl. ₹{v.tolls} toll</span>}
                </div>
                <button
                  type="button"
                  className="breakdown-btn"
                  title="View fare calculation breakdown"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBreakdown(v);
                  }}
                >
                  <Info size={12} /> Breakdown
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
