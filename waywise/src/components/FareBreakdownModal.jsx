import { X, Info, ShieldCheck, IndianRupee } from 'lucide-react';

export default function FareBreakdownModal({ fareData, onClose }) {
  if (!fareData) return null;

  const { vehicleName, distanceKm, breakdown, totalFare, currency } = fareData;

  return (
    <div className="fare-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="fare-modal-card" onClick={e => e.stopPropagation()}>
        <div className="fare-modal-header">
          <div>
            <div className="eyebrow">FARE BREAKDOWN ENGINE</div>
            <h3>{vehicleName} Estimate</h3>
          </div>
          <button className="fare-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        <div className="fare-total-banner">
          <div>
            <small>ESTIMATED TOTAL FARE</small>
            <div className="fare-total-amount">₹{totalFare}</div>
          </div>
          <span className="fare-distance-badge">{distanceKm} km commute</span>
        </div>

        <div className="fare-breakdown-list">
          <div className="fare-breakdown-item">
            <div>
              <strong>Base Fare</strong>
              <small>Includes first {breakdown.includedKm} km</small>
            </div>
            <span>₹{breakdown.baseFare}</span>
          </div>

          <div className="fare-breakdown-item">
            <div>
              <strong>Distance Charge</strong>
              <small>{breakdown.billableKm} km @ ₹{breakdown.perKmRate}/km</small>
            </div>
            <span>₹{breakdown.distanceFare}</span>
          </div>

          {breakdown.surgeAmount > 0 && (
            <div className="fare-breakdown-item surge-item">
              <div>
                <strong>Peak / Night Multiplier</strong>
                <small>{breakdown.surgeMultiplier}x demand adjustment</small>
              </div>
              <span>+₹{breakdown.surgeAmount}</span>
            </div>
          )}

          <div className="fare-breakdown-item">
            <div>
              <strong>Toll Charges</strong>
              <small>{breakdown.tolls > 0 ? 'Via Mappls Toll Data' : 'No tolls on this route / mode'}</small>
            </div>
            <span className={breakdown.tolls > 0 ? 'toll-cost' : 'toll-free'}>
              {breakdown.tolls > 0 ? `+₹${breakdown.tolls}` : '₹0 (Free)'}
            </span>
          </div>

          <div className="fare-breakdown-item">
            <div>
              <strong>Platform & Safety Fee</strong>
              <small>App access & 24x7 support</small>
            </div>
            <span>+₹{breakdown.platformFee}</span>
          </div>

          {breakdown.taxAmount > 0 && (
            <div className="fare-breakdown-item">
              <div>
                <strong>Taxes & GST</strong>
                <small>{breakdown.taxRatePercent}% applicable taxes</small>
              </div>
              <span>+₹{breakdown.taxAmount}</span>
            </div>
          )}
        </div>

        <div className="fare-modal-footer">
          <p className="muted-note">
            <ShieldCheck size={12} /> Fares are computed transparently based on route distance and toll information.
          </p>
          <button className="btn btn-blue full" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
