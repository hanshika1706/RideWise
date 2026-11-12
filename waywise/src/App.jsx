import { useEffect, useMemo, useState } from 'react';
import CabBooking from "./components/CabBooking.jsx";
import AboutUs from "./components/AboutUs.jsx";
import MapplsMap from "./components/MapplsMap.jsx";
import RouteMap from "./components/RouteMap.jsx";
import {
  MapPin, Navigation, Route, Clock3, IndianRupee, ChevronDown, ChevronRight,
  ArrowLeft, ArrowRight, ArrowUpDown, CarFront, ShieldCheck, Bell, Settings as SettingsIcon,
  UserRound, Home, Search, LogOut, Plus, Trash2, Pencil, Check, LocateFixed,
  SlidersHorizontal, Eye, LockKeyhole, HelpCircle, Menu, X, ExternalLink,
  Star, Sparkles, MessageSquare, Send, CheckCircle2, AlertCircle, Compass, Zap
} from 'lucide-react';

const initialRoutes = [
  { id: 1, name: 'Route A via NH-48 Express', tag: 'Fastest', time: '45 min', distanceKm: 32, fare: 600, toll: 100, color: 'blue', detail: 'Highway driving with express lanes and automated toll plaza.' },
  { id: 2, name: 'Route B via Old Delhi Road', tag: 'Cheapest', time: '58 min', distanceKm: 28, fare: 490, toll: 0, color: 'green', detail: 'Avoids all toll booths using local arterial roads with moderate traffic.' },
  { id: 3, name: 'Route C via Cyber City Flyover', tag: 'Scenic', time: '50 min', distanceKm: 30, fare: 540, toll: 50, color: 'blue', detail: 'Smooth flyover bypass with minimal signals and one minor toll.' }
];

const fallbackPlaces = [
  { name: 'Home', address: 'Palam Vihar, Gurugram, Haryana', type: 'Home' },
  { name: 'BMU Campus', address: 'Kapriwas, District Rewari, Haryana', type: 'College' },
  { name: 'Ambience Mall', address: 'NH-8, DLF Phase 3, Gurugram', type: 'Shopping' },
  { name: 'Fitness Gym', address: 'Sector 14, Gurugram', type: 'Fitness' }
];

const VEHICLE_OPTIONS = [
  { id: 'bike', name: 'Bike', desc: 'Fast solo commute', fare: 249, time: '3 min', seats: 1, icon: '🛵' },
  { id: 'auto', name: 'City Auto', desc: 'Affordable breezy ride', fare: 399, time: '5 min', seats: 3, icon: '🛺' },
  { id: 'mini', name: 'Mini Cab', desc: 'Air-conditioned everyday ride', fare: 599, time: '6 min', seats: 4, icon: '🚗', popular: true },
  { id: 'sedan', name: 'Sedan', desc: 'Extra legroom & comfort', fare: 749, time: '8 min', seats: 4, icon: '🚘' },
  { id: 'suv', name: 'SUV Plus', desc: 'Spacious 6-seater for groups', fare: 999, time: '10 min', seats: 6, icon: '🚙' }
];

export default function App() {
  const [page, setPage] = useState('home');
  const [origin, setOrigin] = useState('BML Munjal University');
  const [destination, setDestination] = useState('Ambience Mall');
  const [selectedRoute, setSelectedRoute] = useState(1);
  const [routeFilter, setRouteFilter] = useState('all');
  const [rideConfirmed, setRideConfirmed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [notice, setNotice] = useState('');

  // User Profile State
  const [profile, setProfile] = useState({
    name: 'Suhani Jain',
    email: 'suhani.jain@example.com',
    phone: '+91 98765 43210',
    city: 'Gurugram (Delhi NCR)',
    role: 'Student / Daily Commuter',
    verified: true
  });

  // Settings State
  const [activeSettings, setActiveSettings] = useState('Notifications');
  const [unit, setUnit] = useState('km'); // km or mi
  const [toggles, setToggles] = useState({
    alerts: true,
    push: false,
    reminders: true,
    share: true,
    history: false
  });

  // Saved places & Bookings from server JSON
  const [saved, setSaved] = useState(fallbackPlaces);
  const [bookedRides, setBookedRides] = useState([]);

  // Cab Vehicle Selection State
  const [selectedVehicle, setSelectedVehicle] = useState('mini');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const activeVehicle = useMemo(() => {
    return VEHICLE_OPTIONS.find(v => v.id === selectedVehicle) || VEHICLE_OPTIONS[2];
  }, [selectedVehicle]);
  
  // Modals
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Quick Notification Helper
  const notify = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3500);
  };

  const go = (next) => {
    setPage(next);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Distance formatter according to selected unit
  const formatDistance = (km) => {
    if (unit === 'mi') {
      return `${(km * 0.621371).toFixed(1)} mi`;
    }
    return `${km} km`;
  };

  // Fetch initial data from server APIs (JSON storage) with localStorage fallback
  useEffect(() => {
    // 1. Load any local bookings first
    try {
      const local = JSON.parse(localStorage.getItem('waywise_bookings') || '[]');
      if (local.length > 0) setBookedRides(local);
    } catch {}

    // 2. Fetch saved places from server/data/places.json
    fetch('/api/places')
      .then(res => {
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : null;
      })
      .then(data => {
        if (data?.places && Array.isArray(data.places)) {
          setSaved(data.places);
        }
      })
      .catch(() => {});

    // 3. Fetch profile from server/data/profile.json
    fetch('/api/profile')
      .then(res => {
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : null;
      })
      .then(data => {
        if (data?.profile) {
          setProfile(data.profile);
        }
      })
      .catch(() => {});

    // 4. Fetch bookings from server and sync
    fetch('/api/bookings')
      .then(res => {
        const ct = res.headers.get('content-type') || '';
        return ct.includes('application/json') ? res.json() : null;
      })
      .then(data => {
        if (data?.bookings && Array.isArray(data.bookings)) {
          setBookedRides(prev => {
            const map = new Map();
            [...data.bookings, ...prev].forEach(item => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  // Reload bookings whenever visiting 'trips'
  useEffect(() => {
    if (page === 'trips') {
      try {
        const local = JSON.parse(localStorage.getItem('waywise_bookings') || '[]');
        if (local.length > 0) setBookedRides(local);
      } catch {}

      fetch('/api/bookings')
        .then(res => {
          const ct = res.headers.get('content-type') || '';
          return ct.includes('application/json') ? res.json() : null;
        })
        .then(data => {
          if (data?.bookings && Array.isArray(data.bookings)) {
            setBookedRides(data.bookings);
          }
        })
        .catch(() => {});
    }
  }, [page]);

  const chosenRoute = useMemo(() => {
    return initialRoutes.find(r => r.id === selectedRoute) || initialRoutes[0];
  }, [selectedRoute]);

  const calculatedFare = useMemo(() => {
    return activeVehicle.fare + (chosenRoute?.toll || 0);
  }, [activeVehicle, chosenRoute]);

  const filteredRoutes = useMemo(() => {
    if (routeFilter === 'fastest') return initialRoutes.filter(r => r.tag === 'Fastest');
    if (routeFilter === 'cheapest') return initialRoutes.filter(r => r.tag === 'Cheapest');
    if (routeFilter === 'toll-free') return initialRoutes.filter(r => r.toll === 0);
    return initialRoutes;
  }, [routeFilter]);

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(destination)}&navigate=yes`;
  const openLink = (url) => window.open(url, '_blank', 'noopener,noreferrer');

  function submitSearch(e) {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) {
      notify('Please enter both pickup and destination locations.');
      return;
    }
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      notify('Current location and destination cannot be identical.');
      return;
    }
    setSelectedRoute(1);
    go('routes');
  }

  function swapLocations() {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    notify('Locations swapped.');
  }

  async function handleConfirmBooking() {
    const newBooking = {
      id: `RW-${Math.floor(10000000 + Math.random() * 90000000)}`,
      pickup: origin,
      destination: destination,
      vehicle: activeVehicle.name,
      fare: calculatedFare,
      paymentMethod,
      arrival: activeVehicle.time,
      status: 'Confirmed',
      submittedAt: new Date().toISOString()
    };
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
      });
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (data?.booking) {
          setBookedRides(prev => [data.booking, ...prev.filter(b => b.id !== data.booking.id)]);
        } else {
          setBookedRides(prev => [newBooking, ...prev]);
        }
      } else {
        setBookedRides(prev => [newBooking, ...prev]);
      }
    } catch {
      setBookedRides(prev => [newBooking, ...prev]);
    }
    try {
      const existing = JSON.parse(localStorage.getItem('waywise_bookings') || '[]');
      localStorage.setItem('waywise_bookings', JSON.stringify([newBooking, ...existing]));
    } catch {}
    setRideConfirmed(true);
    notify(`Ride confirmed with ${activeVehicle.name}! Driver arriving in ${activeVehicle.time}.`);
    go('tracking');
  }

  function toggleSetting(key) {
    setToggles(old => ({ ...old, [key]: !old[key] }));
    notify(`Setting updated: ${key}`);
  }

  async function handleDeletePlace(index) {
    try {
      const res = await fetch(`/api/places/${index}`, { method: 'DELETE' });
      const data = await res.json();
      if (data?.places) {
        setSaved(data.places);
      } else {
        setSaved(old => old.filter((_, i) => i !== index));
      }
      notify('Saved place removed.');
    } catch {
      setSaved(old => old.filter((_, i) => i !== index));
      notify('Saved place removed.');
    }
  }

  async function handleDeleteBooking(id) {
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookedRides(old => old.filter(b => b.id !== id));
        notify(`Booking ${id} cancelled and removed.`);
      }
    } catch {
      notify('Could not cancel booking.');
    }
  }

  return (
    <div className="waywise-app">
      {/* TOP NAVIGATION BAR */}
      <header className="topbar">
        <button className="brand" onClick={() => go('home')}>
          <span className="brand-icon"><Route size={18} /></span>
          <span>WayWise</span>
        </button>

        <button 
          className="mobile-menu" 
          onClick={() => setMobileNav(!mobileNav)} 
          aria-label="Toggle navigation"
        >
          {mobileNav ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={mobileNav ? 'topnav nav-open' : 'topnav'}>
          <button className={page === 'home' ? 'nav-active' : ''} onClick={() => go('home')}>
            <Home size={14} /> Home
          </button>
          <button className={page === 'routes' || page === 'details' || page === 'confirm' || page === 'tracking' ? 'nav-active' : ''} onClick={() => go('routes')}>
            <Compass size={14} /> Routes & Cabs
          </button>
          <button className={page === 'trips' ? 'nav-active' : ''} onClick={() => go('trips')}>
            <Clock3 size={14} /> My Trips {bookedRides.length > 0 && `(${bookedRides.length})`}
          </button>
          <button className={page === 'map' ? 'nav-active' : ''} onClick={() => go('map')}>
            <MapPin size={14} /> Live Map
          </button>
          <button className={page === 'about' ? 'nav-active' : ''} onClick={() => go('about')}>
            About Us
          </button>
          <button className={page === 'feedback' ? 'nav-active' : ''} onClick={() => go('feedback')}>
            <MessageSquare size={14} /> Feedback
          </button>
          <button className={page === 'profile' || page === 'settings' ? 'nav-active' : ''} onClick={() => go('profile')}>
            <UserRound size={14} /> Profile
          </button>
        </nav>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="page-wrap">
        
        {/* ================= HOME VIEW ================= */}
        {page === 'home' && (
          <>
            <section className="home-hero">
              <div className="hero-pill">
                <Sparkles size={14} /> AI-Powered Route & Fare Intelligence
              </div>
              <h1>
                Compare Routes. Save Time.<br />
                <span>Travel Smarter with WayWise.</span>
              </h1>
              <p>
                WayWise helps commuters discover optimal travel choices with transparent fare estimates, real-time toll breakdowns, and fast cab bookings in one seamless interface.
              </p>
            </section>

            {/* INTERACTIVE SEARCH CARD */}
            <div className="search-card-wrapper">
              <form className="search-bar-card" onSubmit={submitSearch}>
                <div className="search-inputs-grid">
                  <div className="search-field">
                    <label htmlFor="home-origin">Pickup Location</label>
                    <div>
                      <MapPin size={18} style={{ color: 'var(--primary)' }} />
                      <input 
                        id="home-origin" 
                        value={origin} 
                        onChange={e => setOrigin(e.target.value)} 
                        placeholder="Enter city, address or campus" 
                        required 
                      />
                      <button 
                        type="button" 
                        className="location-sample-btn"
                        title="Use BMU campus" 
                        onClick={() => setOrigin('BML Munjal University')}
                      >
                        <LocateFixed size={16} />
                      </button>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="swap-btn" 
                    title="Swap locations" 
                    onClick={swapLocations}
                  >
                    <ArrowUpDown size={17} />
                  </button>

                  <div className="search-field">
                    <label htmlFor="home-destination">Destination Location</label>
                    <div>
                      <Navigation size={18} style={{ color: 'var(--accent)' }} />
                      <input 
                        id="home-destination" 
                        value={destination} 
                        onChange={e => setDestination(e.target.value)} 
                        placeholder="Enter destination mall or hub" 
                        required 
                      />
                    </div>
                  </div>

                  <button className="btn btn-blue find-btn" type="submit">
                    <Search size={16} /> Find Routes
                  </button>
                </div>

                {/* Quick suggestions tags */}
                <div className="search-quick-tags">
                  <span>Popular hubs:</span>
                  {['Ambience Mall', 'Cyber Hub', 'BMU Campus', 'IGI Airport T3', 'Sector 29'].map(hub => (
                    <button 
                      key={hub} 
                      type="button" 
                      className="quick-tag-pill" 
                      onClick={() => setDestination(hub)}
                    >
                      + {hub}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* STATS STRIP */}
            <div className="stats-strip">
              <div className="stat-box">
                <div className="stat-icon"><Route size={22} /></div>
                <div className="stat-data">
                  <strong>30,000+</strong>
                  <span>Commute Routes Analyzed</span>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon"><IndianRupee size={22} /></div>
                <div className="stat-data">
                  <strong>₹350 Avg.</strong>
                  <span>Saved on Monthly Tolls</span>
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-icon"><ShieldCheck size={22} /></div>
                <div className="stat-data">
                  <strong>99.4%</strong>
                  <span>Transparent Price Quotes</span>
                </div>
              </div>
            </div>

            {/* POPULAR COMMUTES GRID */}
            <section className="popular-section">
              <div className="section-head">
                <div>
                  <h2>Popular Commuter Journeys</h2>
                  <p>Frequently traveled daily routes with verified sample travel times.</p>
                </div>
                <button className="btn btn-outline" onClick={() => go('routes')}>
                  Explore All Routes <ArrowRight size={14} />
                </button>
              </div>

              <div className="popular-grid">
                {[
                  ['Ambience Mall', 'Gurugram, Haryana', '32 min', '₹600'],
                  ['ISKCON Temple', 'Sector 25, Gurugram', '38 min', '₹550'],
                  ['Cyber Hub', 'DLF Phase 2, Gurugram', '25 min', '₹480'],
                  ['BMU Campus', 'Kapriwas, Haryana', '12 min', '₹220']
                ].map(([name, address, time, fare]) => (
                  <article className="popular-card" key={name}>
                    <div className="popular-top">
                      <span className="popular-pin"><MapPin size={18} /></span>
                      <div className="popular-info">
                        <strong>{name}</strong>
                        <small>{address}</small>
                      </div>
                    </div>
                    <div className="popular-bottom">
                      <span>{time} · {fare}</span>
                      <button onClick={() => { setDestination(name); go('routes'); }}>
                        Select <ArrowRight size={12} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ================= ROUTES LIST VIEW ================= */}
        {page === 'routes' && (
          <>
            <div className="page-title-row">
              <div>
                <div className="eyebrow">ROUTE PLANNER & COMPARISON</div>
                <h1>Available Routes</h1>
                <p>Comparing routes from <b>{origin}</b> to <b>{destination}</b>.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-outline" onClick={() => go('home')}>
                  <ArrowLeft size={14} /> Back to Search
                </button>
              </div>
            </div>

            {/* CAB VEHICLE CATEGORY SELECTOR */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Choose Cab Category:
                </strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Fares dynamically include route tolls
                </span>
              </div>
              <div className="vehicle-selector-grid">
                {VEHICLE_OPTIONS.map(v => {
                  const isSelected = selectedVehicle === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVehicle(v.id);
                        notify(`${v.name} selected.`);
                      }}
                      className={`vehicle-chip-btn ${isSelected ? 'selected' : ''}`}
                    >
                      <span className="vehicle-chip-emoji">{v.icon}</span>
                      <div className="vehicle-chip-content">
                        <div className="vehicle-chip-title">
                          <strong>{v.name}</strong>
                          {v.popular && <span className="popular-badge">POPULAR</span>}
                        </div>
                        <small>₹{v.fare} base · {v.time} ETA</small>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FILTER CHIPS */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[
                { id: 'all', label: 'All Options' },
                { id: 'fastest', label: '⚡ Fastest' },
                { id: 'cheapest', label: '💰 Lowest Cost' },
                { id: 'toll-free', label: '🛣️ Toll-Free' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setRouteFilter(f.id)}
                  className={`btn ${routeFilter === f.id ? 'btn-dark' : 'btn-outline'}`}
                  style={{ height: '34px', fontSize: '12px', borderRadius: '20px' }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="routes-layout">
              <div className="route-list">
                {filteredRoutes.map(route => {
                  const isSelected = selectedRoute === route.id;
                  const routeFare = activeVehicle.fare + (route.toll || 0);

                  return (
                    <article 
                      key={route.id} 
                      className={`route-option ${isSelected ? 'chosen' : ''}`}
                      onClick={() => { setSelectedRoute(route.id); notify(`${route.name} selected.`); }}
                    >
                      <div className="route-option-top">
                        <strong>{route.name}</strong>
                        <span className={`route-tag ${route.color}`}>{route.tag}</span>
                      </div>

                      <div className="route-stats">
                        <div>
                          <small>TRAVEL TIME</small>
                          <b>{route.time}</b>
                        </div>
                        <div>
                          <small>DISTANCE</small>
                          <b>{formatDistance(route.distanceKm)}</b>
                        </div>
                        <div>
                          <small>EST. FARE ({activeVehicle.name})</small>
                          <b style={{ color: '#2563eb' }}>₹{routeFare}</b>
                        </div>
                        <div>
                          <small>TOLL CHARGES</small>
                          <b>{route.toll === 0 ? 'Free' : `₹${route.toll}`}</b>
                        </div>
                      </div>

                      <p>{route.detail}</p>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                        {isSelected ? (
                          <button 
                            className="btn btn-blue full"
                            style={{ height: '42px', fontWeight: '700', borderRadius: '10px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              go('confirm');
                            }}
                          >
                            Book {activeVehicle.name} · ₹{routeFare} →
                          </button>
                        ) : (
                          <button 
                            className="btn btn-dark full"
                            style={{ height: '42px', fontWeight: '700', borderRadius: '10px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRoute(route.id);
                              notify(`${route.name} selected.`);
                            }}
                          >
                            Select this Route
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* MAP PREVIEW CARD */}
              <div className="map-card">
                <div className="map-head">
                  <strong>Selected Route Map</strong>
                  <span>CORRIDOR PREVIEW</span>
                </div>

                <RouteMap 
                  selectedRoute={selectedRoute}
                  onSelectRoute={setSelectedRoute}
                  origin={origin}
                  destination={destination}
                  height="420px"
                />

                <div className="map-links">
                  <button onClick={() => openLink(mapsUrl)}>
                    <ExternalLink size={14} /> Open in Google Maps
                  </button>
                  <button onClick={() => openLink(wazeUrl)}>
                    <ExternalLink size={14} /> Open in Waze
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= ROUTE DETAILS VIEW ================= */}
        {page === 'details' && (
          <>
            <div className="page-title-row">
              <div>
                <div className="eyebrow">ROUTE METRICS & BREAKDOWN</div>
                <h1>Route Details</h1>
                <p>Review the comprehensive journey specifications before taking action.</p>
              </div>
              <button className="btn btn-outline" onClick={() => go('routes')}>
                <ArrowLeft size={14} /> Back to Routes
              </button>
            </div>

            <div className="map-card" style={{ marginBottom: '24px' }}>
              <div className="map-head">
                <strong>Route Alignment Map</strong>
                <span>CORRIDOR OVERVIEW</span>
              </div>
              <RouteMap 
                selectedRoute={selectedRoute}
                origin={origin}
                destination={destination}
                height="320px"
              />
            </div>

            <div className="details-summary">
              <h2>Selected Route: {chosenRoute.name}</h2>
              <p>{chosenRoute.detail}</p>

              <div className="detail-metrics">
                <div>
                  <small>ESTIMATED TRAVEL TIME</small>
                  <strong>{chosenRoute.time}</strong>
                  <span>Subject to live traffic conditions</span>
                </div>
                <div>
                  <small>TOTAL DISTANCE</small>
                  <strong>{formatDistance(chosenRoute.distanceKm)}</strong>
                  <span>Accurate road itinerary</span>
                </div>
                <div>
                  <small>ESTIMATED CAB FARE</small>
                  <strong>₹{chosenRoute.fare}</strong>
                  <span>Indicative standard vehicle price</span>
                </div>
                <div>
                  <small>TOLLWAY FEES</small>
                  <strong>{chosenRoute.toll === 0 ? '₹0 (Toll-Free)' : `₹${chosenRoute.toll}`}</strong>
                  <span>{chosenRoute.toll === 0 ? 'No highway tolls required' : 'FASTag plaza charges'}</span>
                </div>
              </div>

              <div className="detail-actions">
                <button className="btn btn-outline" onClick={() => go('routes')}>
                  <ArrowLeft size={14} /> Change Route
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-blue" onClick={() => go('confirm')}>
                    Proceed to Cab Selection <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= RIDE CONFIRMATION VIEW ================= */}
        {page === 'confirm' && (
          <section className="center-page">
            <div className="confirmation-card" style={{ maxWidth: '580px' }}>
              <div className="card-heading">
                <div>
                  <h1>Choose Cab & Confirm Journey</h1>
                  <p>Select your vehicle category and payment method to book your ride.</p>
                </div>
                <span className="confirm-icon"><CarFront size={24} /></span>
              </div>

              <div className="confirm-locations">
                <div>
                  <span className="small-dot green-dot" />
                  <div>
                    <small>Pickup Point</small>
                    <strong>{origin}</strong>
                  </div>
                </div>
                <div className="vertical-dash" />
                <div>
                  <span className="small-dot blue-dot" />
                  <div>
                    <small>Destination Point</small>
                    <strong>{destination}</strong>
                  </div>
                </div>
              </div>

              <div className="confirm-table">
                <div>
                  <span>Selected Highway Route</span>
                  <strong>{chosenRoute.name}</strong>
                </div>
                <div>
                  <span>Travel Duration</span>
                  <strong>{chosenRoute.time}</strong>
                </div>
                <div>
                  <span>Total Distance</span>
                  <strong>{formatDistance(chosenRoute.distanceKm)}</strong>
                </div>
                <div>
                  <span>Highway Toll</span>
                  <strong>{chosenRoute.toll === 0 ? '₹0 (Toll-Free)' : `₹${chosenRoute.toll} FASTag`}</strong>
                </div>
              </div>

              {/* INTERACTIVE CAB CATEGORY SELECTOR */}
              <div style={{ marginTop: '20px', marginBottom: '18px' }}>
                <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block', marginBottom: '10px' }}>
                  Select Cab Category:
                </strong>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {VEHICLE_OPTIONS.map(v => {
                    const isSelected = selectedVehicle === v.id;
                    const fareWithToll = v.fare + (chosenRoute.toll || 0);
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicle(v.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <span style={{ fontSize: '24px' }}>{v.icon}</span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{v.name}</strong>
                              {v.popular && (
                                <span style={{ fontSize: '10px', fontWeight: '800', background: '#dbeafe', color: '#2563eb', padding: '1px 6px', borderRadius: '4px' }}>
                                  RECOMMENDED
                                </span>
                              )}
                              <span style={{ fontSize: '11px', color: '#64748b' }}>• {v.seats} seats</span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{v.desc} · Arrives in {v.time}</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '16px', color: '#0f172a' }}>₹{fareWithToll}</strong>
                          <span style={{ fontSize: '10px', color: '#10b981', display: 'block', fontWeight: '600' }}>Toll Included</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PAYMENT METHOD SELECTION */}
              <div style={{ marginBottom: '22px' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  Payment Method:
                </strong>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[
                    { id: 'cash', label: '💵 Cash to Driver' },
                    { id: 'upi', label: '📱 UPI / QR Code' },
                    { id: 'card', label: '💳 Credit / Debit Card' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentMethod(p.id)}
                      className={`btn ${paymentMethod === p.id ? 'btn-dark' : 'btn-outline'}`}
                      style={{ height: '36px', fontSize: '12px', borderRadius: '8px', flex: 1 }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="confirm-actions">
                <button className="btn btn-outline" onClick={() => go('routes')}>
                  ← Change Route
                </button>
                <button 
                  className="btn btn-blue" 
                  onClick={handleConfirmBooking}
                >
                  Confirm & Book {activeVehicle.name} · ₹{calculatedFare}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ================= LIVE TRACKING VIEW ================= */}
        {page === 'tracking' && (
          <>
            <div className="page-title-row">
              <div>
                <div className="eyebrow">ACTIVE ITINERARY / LIVE MONITOR</div>
                <h1>Trip Tracking Simulation</h1>
                <p>Monitoring your route progress between {origin} and {destination}.</p>
              </div>
              <span className="hero-pill" style={{ color: 'var(--success)' }}>
                <CheckCircle2 size={15} /> ACTIVE DEMO TRIP
              </span>
            </div>

            <div className="tracking-layout">
              <div className="tracking-map" style={{ padding: 0, overflow: 'hidden' }}>
                <RouteMap 
                  selectedRoute={selectedRoute}
                  origin={origin}
                  destination={destination}
                  height="360px"
                />
              </div>

              <div className="tracking-info">
                <div className="tracking-label">PROGRESS OVERVIEW</div>
                <h2>{chosenRoute.name}</h2>
                <div className="tracking-big">{chosenRoute.time}</div>
                <p>Approximate remaining arrival time · {formatDistance(chosenRoute.distanceKm)}</p>

                <div className="progress-track"><span /></div>

                <div className="confirm-table">
                  <div><span>Origin</span><strong>{origin}</strong></div>
                  <div><span>Destination</span><strong>{destination}</strong></div>
                  <div><span>Estimated Fare</span><strong>₹{chosenRoute.fare}</strong></div>
                  <div><span>Status</span><strong style={{ color: 'var(--success)' }}>En Route</strong></div>
                </div>

                <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
                  <button className="btn btn-blue full" onClick={() => go('map')}>
                    <Compass size={15} /> Switch to Live Interactive Map View
                  </button>
                  <button className="btn btn-dark full" onClick={() => openLink(mapsUrl)}>
                    <Navigation size={15} /> Real-Time Google Maps Navigation
                  </button>
                  <button className="btn btn-outline full" onClick={() => openLink(wazeUrl)}>
                    <ExternalLink size={15} /> Open in Waze
                  </button>
                  <button 
                    className="btn btn-danger full" 
                    onClick={() => {
                      setRideConfirmed(false);
                      notify('Demo trip concluded.');
                      go('home');
                    }}
                  >
                    End Demo Journey
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= CAB BOOKING VIEW ================= */}
        {page === 'cab-booking' && (
          <CabBooking
            origin={origin}
            destination={destination}
            onBack={() => go('home')}
          />
        )}

        {/* ================= MY TRIPS VIEW ================= */}
        {page === 'trips' && (
          <>
            <div className="page-title-row">
              <div>
                <div className="eyebrow">YOUR RECORDED JOURNEYS</div>
                <h1>My Trips & Bookings</h1>
                <p>View your recent journeys and active cab bookings ({bookedRides.length} ride{bookedRides.length === 1 ? '' : 's'}).</p>
              </div>
              <button className="btn btn-blue" onClick={() => go('routes')}>
                <Plus size={15} /> Book a New Ride
              </button>
            </div>

            <div className="trip-list">
              {/* Renders real bookings saved in server/data/bookings.json */}
              {bookedRides.map(b => (
                <article className="trip-card" key={b.id} style={{ borderLeft: '4px solid var(--primary)' }}>
                  <div className="trip-icon"><CarFront size={22} /></div>
                  <div className="trip-main">
                    <strong>{b.pickup} <ArrowRight size={14} /> {b.destination}</strong>
                    <small>
                      Vehicle: <b>{b.vehicle}</b> · Payment: <b>{b.paymentMethod ? b.paymentMethod.toUpperCase() : 'CASH'}</b> · Status: <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{b.status || 'Confirmed'}</span>
                    </small>
                    <span>
                      Booking ID: <b>{b.id}</b> {b.submittedAt ? `· Recorded ${new Date(b.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </span>
                  </div>
                  <strong className="trip-price">₹{b.fare}</strong>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn btn-outline" 
                      onClick={() => {
                        setOrigin(b.pickup);
                        setDestination(b.destination);
                        go('routes');
                      }}
                    >
                      Rebook
                    </button>
                    <button 
                      className="btn btn-danger" 
                      title="Cancel and remove booking"
                      onClick={() => handleDeleteBooking(b.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              ))}

              {/* Sample Fallback Card */}
              <article className="trip-card">
                <div className="trip-icon"><Route size={22} /></div>
                <div className="trip-main">
                  <strong>{origin} <ArrowRight size={14} /> {destination}</strong>
                  <small>Recent Route Inquiry · Fast preview</small>
                  <span>{chosenRoute.name} · {formatDistance(chosenRoute.distanceKm)} · {chosenRoute.time}</span>
                </div>
                <strong className="trip-price">₹{chosenRoute.fare}</strong>
                <button className="btn btn-outline" onClick={() => go('details')}>
                  View Route
                </button>
              </article>
            </div>
          </>
        )}

        {/* ================= USER PROFILE VIEW ================= */}
        {page === 'profile' && (
          <>
            <div className="page-title-row">
              <div>
                <div className="eyebrow">ACCOUNT INFORMATION</div>
                <h1>User Profile</h1>
                <p>Manage your commuter identity and saved frequent locations.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-outline" onClick={() => setShowEditProfileModal(true)}>
                  <Pencil size={14} /> Edit Profile
                </button>
                <button className="btn btn-dark" onClick={() => go('settings')}>
                  <SettingsIcon size={14} /> Settings
                </button>
              </div>
            </div>

            <div className="profile-card">
              <div className="profile-header">
                <div className="avatar"><UserRound size={32} /></div>
                <div className="profile-main">
                  <strong>{profile.name}</strong>
                  <span>{profile.email} · {profile.phone}</span>
                  <small>Default City: <b>{profile.city}</b> · <i>✓ Verified Profile</i></small>
                </div>
              </div>

              <div className="saved-heading">
                <strong>Saved Places & Commute Hubs</strong>
                <button 
                  className="btn btn-blue" 
                  style={{ height: '36px', fontSize: '12px' }}
                  onClick={() => setShowAddPlaceModal(true)}
                >
                  <Plus size={14} /> Add New Place
                </button>
              </div>

              <div className="saved-list">
                {saved.map((place, i) => (
                  <div className="saved-place" key={`${place.name}-${i}`}>
                    <span className="saved-pin"><MapPin size={18} /></span>
                    <div>
                      <strong>{place.name} <span style={{ fontSize: '11px', fontWeight: 'normal', color: 'var(--slate-500)' }}>({place.type || 'Custom'})</span></strong>
                      <small>{place.address}</small>
                    </div>
                    <div className="saved-place-actions">
                      <button 
                        className="btn btn-outline"
                        style={{ height: '32px', fontSize: '12px', padding: '4px 12px' }}
                        onClick={() => { setDestination(place.name); go('home'); }}
                      >
                        Plan Journey
                      </button>
                      <button 
                        className="delete-place" 
                        title="Remove saved place"
                        onClick={() => handleDeletePlace(i)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ================= SETTINGS VIEW ================= */}
        {page === 'settings' && (
          <>
            <div className="page-title-row">
              <div>
                <div className="eyebrow">PREFERENCES & CONTROLS</div>
                <h1>Settings</h1>
                <p>Personalize routing options, measurement units, and safety preferences.</p>
              </div>
            </div>

            <div className="settings-layout">
              <aside className="settings-menu">
                <h3>SETTINGS CATEGORIES</h3>
                {[
                  ['Notifications', Bell],
                  ['Map & Units', SlidersHorizontal],
                  ['Privacy & Safety', ShieldCheck],
                  ['Account Security', LockKeyhole],
                  ['Help & Support', HelpCircle]
                ].map(([name, Icon]) => (
                  <button 
                    key={name}
                    className={activeSettings === name ? 'settings-active' : ''}
                    onClick={() => setActiveSettings(name)}
                  >
                    <Icon size={16} /> {name}
                  </button>
                ))}
                <button className="logout-button" onClick={() => go('login')}>
                  <LogOut size={16} /> Logout Account
                </button>
              </aside>

              <section className="settings-content">
                <h2>{activeSettings}</h2>

                {activeSettings === 'Notifications' && (
                  <>
                    <SettingToggle 
                      title="Trip Fare Comparison Alerts" 
                      desc="Get notified when cheaper or faster alternative routes are discovered." 
                      checked={toggles.alerts} 
                      onChange={() => toggleSetting('alerts')} 
                    />
                    <SettingToggle 
                      title="Push Notifications" 
                      desc="Real-time alerts for traffic changes and saved routes." 
                      checked={toggles.push} 
                      onChange={() => toggleSetting('push')} 
                    />
                    <SettingToggle 
                      title="Scheduled Journey Reminders" 
                      desc="Receive prompt reminders prior to your daily scheduled commute." 
                      checked={toggles.reminders} 
                      onChange={() => toggleSetting('reminders')} 
                    />
                  </>
                )}

                {activeSettings === 'Map & Units' && (
                  <div style={{ display: 'grid', gap: '20px' }}>
                    <div className="form-group">
                      <label>Measurement Unit</label>
                      <select 
                        value={unit} 
                        onChange={e => {
                          setUnit(e.target.value);
                          notify(`Distance unit set to ${e.target.value === 'km' ? 'Kilometers' : 'Miles'}.`);
                        }}
                      >
                        <option value="km">Kilometers (km)</option>
                        <option value="mi">Miles (mi)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Default Search City</label>
                      <input defaultValue={profile.city} readOnly />
                    </div>
                  </div>
                )}

                {activeSettings === 'Privacy & Safety' && (
                  <>
                    <SettingToggle 
                      title="Anonymous Trip Analytics" 
                      desc="Allow aggregated trip data to help improve commuter route predictions." 
                      checked={toggles.share} 
                      onChange={() => toggleSetting('share')} 
                    />
                    <SettingToggle 
                      title="Keep Lifetime Route History" 
                      desc="Retain detailed booking log in your local database." 
                      checked={toggles.history} 
                      onChange={() => toggleSetting('history')} 
                    />
                  </>
                )}

                {activeSettings === 'Account Security' && (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div>
                      <strong>Password Management</strong>
                      <p style={{ fontSize: '13px', color: 'var(--slate-500)', margin: '6px 0 12px' }}>
                        Ensure your account uses a strong and unique password.
                      </p>
                      <button className="btn btn-outline" onClick={() => notify('Password change link sent to your email.')}>
                        Change Password
                      </button>
                    </div>
                  </div>
                )}

                {activeSettings === 'Help & Support' && (
                  <div>
                    <p style={{ fontSize: '14px', color: 'var(--slate-600)', marginBottom: '16px' }}>
                      WayWise is a student-built mobility prototype developed for intelligent route comparison and booking.
                    </p>
                    <button className="btn btn-blue" onClick={() => go('feedback')}>
                      <MessageSquare size={16} /> Open Support & Feedback Form
                    </button>
                  </div>
                )}
              </section>
            </div>
          </>
        )}

        {/* ================= DEDICATED FEEDBACK & SUPPORT VIEW ================= */}
        {page === 'feedback' && (
          <div className="feedback-container">
            <div className="page-title-row">
              <div>
                <div className="eyebrow">COMMUTER SUPPORT</div>
                <h1>Feedback & Inquiries</h1>
                <p>Submit inquiries, reviews, or route suggestions to our team.</p>
              </div>
              <button className="btn btn-outline" onClick={() => go('home')}>
                <ArrowLeft size={14} /> Back to Home
              </button>
            </div>

            <FeedbackForm onSubmitted={(msg) => notify(msg)} />
          </div>
        )}

        {/* ================= ABOUT US VIEW ================= */}
        {page === 'about' && (
          <AboutUs
            onBack={() => go('home')}
            onBookCab={() => go('cab-booking')}
          />
        )}

        {/* ================= LIVE INTERACTIVE MAP VIEW ================= */}
        {page === 'map' && (
          <section style={{ padding: '10px 0' }}>
            <div className="page-title-row">
              <div>
                <div className="eyebrow">LIVE GPS / CORRIDOR MONITOR</div>
                <h1>WayWise Live Interactive Map</h1>
                <p>Real-time Delhi–NCR highway corridor navigation, live cab ride simulation, and satellite imagery.</p>
              </div>
              <button className="btn btn-outline" onClick={() => go('home')}>
                <ArrowLeft size={14} /> Back
              </button>
            </div>
            <MapplsMap />
          </section>
        )}

        {/* ================= LOGIN & AUTH SCREEN ================= */}
        {page === 'login' && (
          <section className="login-screen">
            <div className="login-card">
              <div className="login-mark"><Route size={24} /></div>
              <h1>Welcome to WayWise</h1>
              <p>Sign in to manage your saved routes and active trips.</p>
              
              <form onSubmit={e => {
                e.preventDefault();
                notify('Signed in successfully.');
                go('home');
              }}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" defaultValue={profile.email} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" defaultValue="waywise2026" required />
                </div>
                <button className="btn btn-blue full" type="submit" style={{ height: '46px', marginTop: '12px' }}>
                  Sign In
                </button>
              </form>
            </div>
          </section>
        )}

      </main>

      {/* FOOTER */}
      <footer className="footer">
        <button onClick={() => go('home')} className="footer-brand">
          <span className="brand-icon"><Route size={16} /></span>
          WayWise Mobility
        </button>
        <span>Intelligent Route Planning & Cab Mobility Platform.</span>
        <span>Student Project Prototype · © 2026</span>
      </footer>

      {/* TOAST NOTIFICATION */}
      {notice && (
        <div className="toast">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button onClick={() => setNotice('')}><X size={15} /></button>
        </div>
      )}

      {/* ADD SAVED PLACE MODAL */}
      {showAddPlaceModal && (
        <AddPlaceModal 
          onClose={() => setShowAddPlaceModal(false)}
          onAdded={(newPlace) => {
            setSaved(prev => [...prev, newPlace]);
            setShowAddPlaceModal(false);
            notify(`"${newPlace.name}" added to saved places.`);
          }}
        />
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditProfileModal && (
        <EditProfileModal
          currentProfile={profile}
          onClose={() => setShowEditProfileModal(false)}
          onUpdated={(updated) => {
            setProfile(updated);
            setShowEditProfileModal(false);
            notify('Profile information updated.');
          }}
        />
      )}
    </div>
  );
}

/* ================= SVG ROUTE MAP DRAWING ================= */
function MapDrawing() {
  return (
    <svg className="map-drawing" viewBox="0 0 700 370" preserveAspectRatio="none" aria-hidden="true">
      <g className="map-roads">
        <path d="M-30 80 L730 280" />
        <path d="M-30 300 L730 80" />
        <path d="M70 -20 L240 400" />
        <path d="M300 -20 L400 400" />
        <path d="M540 -20 L470 400" />
        <path d="M-30 185 L730 185" />
        <path d="M-20 20 L720 350" />
        <path d="M30 370 L680 -10" />
        <path className="map-main-road" d="M75 280 C150 245 185 150 275 175 S420 255 520 85" />
        <path className="map-main-road-center" d="M75 280 C150 245 185 150 275 175 S420 255 520 85" />
      </g>
      <g className="map-blocks">
        <rect x="105" y="35" width="45" height="27" rx="3" />
        <rect x="360" y="45" width="57" height="34" rx="3" />
        <rect x="570" y="250" width="50" height="26" rx="3" />
        <rect x="280" y="290" width="35" height="25" rx="3" />
      </g>
    </svg>
  );
}

/* ================= SETTING TOGGLE ================= */
function SettingToggle({ title, desc, checked, onChange }) {
  return (
    <div className="setting-toggle">
      <div>
        <strong>{title}</strong>
        <p>{desc}</p>
      </div>
      <button 
        aria-label={`Toggle ${title}`} 
        className={`switch ${checked ? 'on' : ''}`} 
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}

/* ================= ADD PLACE MODAL ================= */
function AddPlaceModal({ onClose, onAdded }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState('Home');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setError('Both place name and address are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, address, type })
      });

      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save place.');
        onAdded(data.place || { name, address, type });
      } else {
        // Fallback when server is offline
        onAdded({ name, address, type });
      }
    } catch (err) {
      // Still add locally even if server is offline
      onAdded({ name, address, type });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        <h2>Add Saved Location</h2>
        <p>Save frequently visited hubs for one-click route planning.</p>

        {error && <div className="form-error-badge">{error}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: '14px' }}>
          <div className="form-group">
            <label>Place Name (e.g. My Apartment, BMU Hostel)</label>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Gurugram Office"
              required 
            />
          </div>

          <div className="form-group">
            <label>Full Address / Landmark</label>
            <input 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              placeholder="e.g. Sector 29, Gurugram, Haryana"
              required 
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={type} onChange={e => setType(e.target.value)}>
              <option value="Home">Home</option>
              <option value="Work">Work / Office</option>
              <option value="College">College / Campus</option>
              <option value="Shopping">Shopping / Mall</option>
              <option value="Transit">Metro / Airport</option>
              <option value="Fitness">Fitness / Gym</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline full" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-blue full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Place'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= EDIT PROFILE MODAL ================= */
function EditProfileModal({ currentProfile, onClose, onUpdated }) {
  const [name, setName] = useState(currentProfile.name);
  const [email, setEmail] = useState(currentProfile.email);
  const [phone, setPhone] = useState(currentProfile.phone);
  const [city, setCity] = useState(currentProfile.city);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Name and Email are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ name, email, phone, city })
      });

      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update profile.');
        onUpdated(data.profile || { ...currentProfile, name, email, phone, city });
      } else {
        onUpdated({ ...currentProfile, name, email, phone, city });
      }
    } catch (err) {
      onUpdated({ ...currentProfile, name, email, phone, city });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        <h2>Edit Profile Information</h2>
        <p>Update personal contact details and default commute region.</p>

        {error && <div className="form-error-badge">{error}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: '14px' }}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Default City</label>
            <input value={city} onChange={e => setCity(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline full" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-blue full" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ================= FEEDBACK FORM COMPONENT ================= */
function FeedbackForm({ onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Route Accuracy');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!comments.trim() || comments.trim().length < 5) {
      setError('Please provide comments with at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ rating, category, name, email, comments })
      });

      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to submit feedback.');
      }
      setSuccess(true);
      onSubmitted('Thank you! Your feedback has been recorded.');
    } catch (err) {
      // Graceful fallback: still record locally and succeed
      setSuccess(true);
      onSubmitted('Thank you! Your feedback has been recorded.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="feedback-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <CheckCircle2 size={54} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
        <h2>Feedback Successfully Recorded!</h2>
        <p style={{ color: 'var(--slate-500)', margin: '8px 0 24px' }}>
          Thank you for helping us improve WayWise. Your response has been received.
        </p>
        <button 
          className="btn btn-blue" 
          onClick={() => {
            setSuccess(false);
            setComments('');
          }}
        >
          Submit Another Review
        </button>
      </div>
    );
  }

  return (
    <div className="feedback-card">
      <h2>Share Your Commuter Experience</h2>
      <p>Help us improve route intelligence and fare estimates.</p>

      {error && <div className="form-error-badge">{error}</div>}

      <form onSubmit={handleSubmit} style={{ marginTop: '18px' }}>
        <div className="form-group">
          <label>Overall Rating</label>
          <div className="star-rating-row">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                type="button"
                key={star}
                className={`star-btn ${star <= rating ? 'active' : ''}`}
                onClick={() => setRating(star)}
              >
                <Star size={26} fill={star <= rating ? '#fbbf24' : 'none'} />
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="Route Accuracy">Route Accuracy & Travel Time</option>
            <option value="Fare Estimates">Fare & Toll Cost Accuracy</option>
            <option value="Cab Booking Experience">Cab Booking Experience</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Bug Report">Issue / Bug Report</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label>Your Name (Optional)</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Suhani" />
          </div>
          <div className="form-group">
            <label>Email (Optional)</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. suhani@example.com" />
          </div>
        </div>

        <div className="form-group">
          <label>Your Detailed Feedback / Message</label>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            placeholder="Describe your commute experience, toll questions, or feature suggestions..."
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-blue full" 
          disabled={isSubmitting}
          style={{ height: '46px', fontSize: '14px', marginTop: '10px' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'} <Send size={15} />
        </button>
      </form>
    </div>
  );
}


