import { useState } from "react";
import {
ArrowLeft,
ArrowRight,
Bike,
CarFront,
CheckCircle2,
CreditCard,
IndianRupee,
MapPin,
Navigation,
ShieldCheck,
Users,
Wallet,
} from "lucide-react";

import "../cabBooking.css";

const vehicles = [
{
    id: "bike",
    name: "Bike",
    description: "Quick and affordable solo rides",
    seats: 1,
    fare: 249,
    arrival: "3 min",
    icon: Bike,
},
{
    id: "auto",
    name: "Auto",
    description: "Budget-friendly city travel",
    seats: 3,
    fare: 399,
    arrival: "5 min",
    icon: CarFront,
},
{
    id: "mini",
    name: "Mini Cab",
    description: "Comfortable everyday rides",
    seats: 4,
    fare: 599,
    arrival: "6 min",
    icon: CarFront,
},
{
    id: "sedan",
    name: "Sedan",
    description: "Extra comfort for your journey",
    seats: 4,
    fare: 749,
    arrival: "7 min",
    icon: CarFront,
},
{
    id: "suv",
    name: "SUV",
    description: "Spacious rides for groups",
    seats: 6,
    fare: 999,
    arrival: "9 min",
    icon: CarFront,
},
];

export default function CabBooking({
origin = "",
destination = "",
onBack = () => {},
}) {
const [pickup, setPickup] = useState(origin);
const [drop, setDrop] = useState(destination);

const [selectedVehicle, setSelectedVehicle] = useState("mini");
const [paymentMethod, setPaymentMethod] = useState("cash");

const [booking, setBooking] = useState(null);
const [error, setError] = useState("");

const vehicle = vehicles.find(
    (item) => item.id === selectedVehicle
);

const formattedFare = (amount) =>
    new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    }).format(amount);

function handleBooking() {
    setError("");

    if (!pickup.trim() || !drop.trim()) {
    setError("Please enter pickup and destination.");
    return;
    }

    if (pickup.trim().toLowerCase() === drop.trim().toLowerCase()) {
    setError("Pickup and destination cannot be the same.");
    return;
    }

    const newBooking = {
    id: `RW-${Date.now().toString().slice(-8)}`,
    pickup: pickup.trim(),
    destination: drop.trim(),
    vehicle: vehicle.name,
    fare: vehicle.fare,
    paymentMethod,
    arrival: vehicle.arrival,
    status: "Demo Confirmed",
    };

    setBooking(newBooking);
}

function resetBooking() {
    setBooking(null);
    setError("");
}

if (booking) {
    return (
    <section className="cab-booking-page">
        <div className="cab-success-card">
        <CheckCircle2
            size={58}
            className="cab-success-icon"
        />

        <h1>Booking Confirmed!</h1>

        <p>
            Your demo ride has been successfully confirmed.
        </p>

        <div className="cab-demo-badge">
            DEMO BOOKING — NO REAL DRIVER ASSIGNED
        </div>

        <div className="cab-booking-summary">
            <div>
            <span>Booking ID</span>
            <strong>{booking.id}</strong>
            </div>

            <div>
            <span>Pickup</span>
            <strong>{booking.pickup}</strong>
            </div>

            <div>
            <span>Destination</span>
            <strong>{booking.destination}</strong>
            </div>

            <div>
            <span>Vehicle</span>
            <strong>{booking.vehicle}</strong>
            </div>

            <div>
            <span>Estimated Fare</span>
            <strong>{formattedFare(booking.fare)}</strong>
            </div>

            <div>
            <span>Payment Method</span>
            <strong>
                {booking.paymentMethod === "cash"
                ? "Cash"
                : "UPI"}
            </strong>
            </div>

            <div>
            <span>Status</span>
            <strong className="cab-status">
                {booking.status}
            </strong>
            </div>
        </div>

        <button
            className="cab-primary-btn"
            onClick={resetBooking}
        >
            Book Another Ride
        </button>

        <button
            className="cab-secondary-btn"
            onClick={onBack}
        >
            Back to Home
        </button>
        </div>
    </section>
    );
}

return (
    <section className="cab-booking-page">
    <div className="cab-page-heading">
        <button
        className="cab-back-btn"
        onClick={onBack}
        >
        <ArrowLeft size={17} />
        Back
        </button>

        <div className="cab-heading-text">
        <span className="cab-eyebrow">
            RIDEWISE CAB BOOKING
        </span>

        <h1>Book Your Ride</h1>

        <p>
            Compare vehicles, choose your ride and
            travel smarter.
        </p>
        </div>
    </div>

    <div className="cab-main-layout">
        <div className="cab-left-column">
          {/* LOCATION CARD */}

        <div className="cab-card">
            <h2>
            <MapPin size={19} />
            Your Journey
            </h2>

            <div className="cab-location-field">
            <label htmlFor="cab-pickup">
                Pickup Location
            </label>

            <div className="cab-input-wrapper">
                <MapPin size={18} />

                <input
                id="cab-pickup"
                type="text"
                value={pickup}
                onChange={(e) =>
                    setPickup(e.target.value)
                }
                placeholder="Enter pickup location"
                />
            </div>
            </div>

            <div className="cab-location-field">
            <label htmlFor="cab-drop">
                Drop Location
            </label>

            <div className="cab-input-wrapper">
                <Navigation size={18} />

                <input
                id="cab-drop"
                type="text"
                value={drop}
                onChange={(e) =>
                    setDrop(e.target.value)
                }
                placeholder="Enter destination"
                />
            </div>
            </div>
        </div>

          {/* VEHICLE SELECTION */}

        <div className="cab-card">
            <h2>
            <CarFront size={20} />
            Choose Your Ride
            </h2>

            <p className="cab-section-description">
            Select a vehicle that suits your journey.
            </p>

            <div className="cab-vehicle-list">
            {vehicles.map((item) => {
                const Icon = item.icon;

                return (
                <button
                    type="button"
                    key={item.id}
                    className={`cab-vehicle-option ${
                    selectedVehicle === item.id
                        ? "cab-selected"
                        : ""
                    }`}
                    onClick={() =>
                    setSelectedVehicle(item.id)
                    }
                >
                    <div className="cab-vehicle-icon">
                    <Icon size={25} />
                    </div>

                    <div className="cab-vehicle-details">
                    <h3>{item.name}</h3>

                    <p>{item.description}</p>

                    <div className="cab-vehicle-meta">
                        <span>
                        <Users size={13} />
                        {item.seats} seats
                        </span>

                        <span>
                        {item.arrival} sample ETA
                        </span>
                    </div>
                    </div>

                    <div className="cab-vehicle-price">
                    <strong>
                        {formattedFare(item.fare)}
                    </strong>

                    <span>Estimated</span>
                    </div>
                </button>
                );
            })}
            </div>
        </div>
        </div>

        {/* RIGHT COLUMN */}

        <div className="cab-right-column">
          {/* FARE SUMMARY */}

        <div className="cab-card">
            <h2>
            <IndianRupee size={19} />
            Fare Summary
            </h2>

            <div className="cab-fare-row">
            <span>Selected Vehicle</span>
            <strong>{vehicle.name}</strong>
            </div>

            <div className="cab-fare-row">
            <span>Estimated Arrival</span>
            <strong>{vehicle.arrival}</strong>
            </div>

            <div className="cab-fare-row">
            <span>Estimated Ride Fare</span>
            <strong>
                {formattedFare(vehicle.fare)}
            </strong>
            </div>

            <div className="cab-fare-total">
            <span>Total Estimate</span>

            <strong>
                {formattedFare(vehicle.fare)}
            </strong>
            </div>

            <p className="cab-fare-note">
            Prices are sample values for demonstration.
            They are not live cab-provider quotes.
            </p>
        </div>

          {/* PAYMENT */}

        <div className="cab-card">
            <h2>
            <Wallet size={19} />
            Payment Method
            </h2>

            <label className="cab-payment-option">
            <div>
                <Wallet size={18} />
                <span>Cash</span>
            </div>

            <input
                type="radio"
                name="payment"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={() =>
                setPaymentMethod("cash")
                }
            />
            </label>

            <label className="cab-payment-option">
            <div>
                <CreditCard size={18} />
                <span>UPI</span>
            </div>

            <input
                type="radio"
                name="payment"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={() =>
                setPaymentMethod("upi")
                }
            />
            </label>

            <p className="cab-fare-note">
            UPI is a demo selection only.
            No payment will be collected.
            </p>
        </div>

          {/* BOOKING BUTTON */}

        <div className="cab-card">
            {error && (
            <div className="cab-error">
                {error}
            </div>
            )}

            <button
            className="cab-primary-btn"
            onClick={handleBooking}
            >
            Confirm Demo Booking
            <ArrowRight size={17} />
            </button>

            <div className="cab-safety-note">
            <ShieldCheck size={17} />

            <span>
                This is a student project prototype.
                No real cab will be booked.
            </span>
            </div>
        </div>
        </div>
    </div>
    </section>
);
}
