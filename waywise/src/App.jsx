import { useMemo, useState } from 'react';
import CabBooking from "./components/CabBooking.jsx";
import {
  MapPin, Navigation, Route, Clock3, IndianRupee, ChevronDown, ChevronRight,
  ArrowLeft, ArrowRight, CarFront, ShieldCheck, Bell, Settings as SettingsIcon,
  UserRound, Home, Search, LogOut, Plus, Trash2, Pencil, Check, LocateFixed,
  SlidersHorizontal, Eye, LockKeyhole, HelpCircle, Menu, X, ExternalLink
} from 'lucide-react';

const routes = [
  { id: 1, name: 'Route A via Highway 1', tag: 'Fastest', time: '45 min', distance: '32 km', fare: '₹600', toll: '₹100', color: 'blue', detail: 'Mostly highway driving with a toll road.' },
  { id: 2, name: 'Route B via Local Roads', tag: 'Cheapest', time: '58 min', distance: '28 km', fare: '₹790', toll: '₹0', color: 'green', detail: 'Avoid toll roads and use local roads.' }
];
const savedPlaces = [
  { name: 'Home', address: 'Palam Vihar, Gurugram, Haryana', type: 'Home' },
  { name: 'BMU Campus', address: 'Kapriwas, District Rewari, Haryana', type: 'College' },
  { name: 'Ambience Mall', address: 'NH-8, DLF Phase 3, Gurugram', type: 'Shopping' },
  { name: 'Fitness Gym', address: 'Sector 14, Gurugram', type: 'Fitness' }
];

export default function App() {
  const [page, setPage] = useState('home');
  const [origin, setOrigin] = useState('BML Munjal University');
  const [destination, setDestination] = useState('Ambience Mall');
  const [selectedRoute, setSelectedRoute] = useState(1);
  const [rideConfirmed, setRideConfirmed] = useState(false);
  const [profileName, setProfileName] = useState('Suhani');
  const [profileEmail, setProfileEmail] = useState('suhani.jain@example.com');
  const [showLogin, setShowLogin] = useState(false);
  const [remember, setRemember] = useState(true);
  const [activeSettings, setActiveSettings] = useState('Notifications');
  const [toggles, setToggles] = useState({ alerts: true, push: false, reminders: true, share: true, history: false });
  const [saved, setSaved] = useState(savedPlaces);
  const [newPlace, setNewPlace] = useState('');
  const [notice, setNotice] = useState('');
  const [mobileNav, setMobileNav] = useState(false);

  const chosenRoute = useMemo(() => routes.find(r => r.id === selectedRoute) || routes[0], [selectedRoute]);
  const notify = (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 3000); };
  const go = (next) => { setPage(next); setMobileNav(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  const wazeUrl = `https://waze.com/ul?q=${encodeURIComponent(destination)}&navigate=yes`;
  const openLink = (url) => window.open(url, '_blank', 'noopener,noreferrer');

  function submitSearch(e) {
    e.preventDefault();
    setSelectedRoute(1);
    go('routes');
  }

  function toggleSetting(key) {
    setToggles(old => ({ ...old, [key]: !old[key] }));
  }

  return <div className="waywise-app">
    <header className="topbar">
      <button className="brand" onClick={() => go('home')}><span className="brand-icon"><Route size={17}/></span><span>WayWise</span></button>
      <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation">{mobileNav ? <X size={18}/> : <Menu size={18}/>}</button>
      <nav className={mobileNav ? 'topnav nav-open' : 'topnav'}>
        <button className={page === 'home' ? 'nav-active' : ''} onClick={() => go('home')}>Home</button>
        <button className={page === 'trips' || page === 'routes' || page === 'details' || page === 'confirm' || page === 'tracking' ? 'nav-active' : ''} onClick={() => go('trips')}>My Trips</button>
        <button className={page === 'profile' || page === 'settings' ? 'nav-active' : ''} onClick={() => go('profile')}>Profile</button>
      </nav>
    </header>

    
    <main className="page-wrap">

  {page === "cab-booking" && (
    <CabBooking
      origin={origin}
      destination={destination}
      onBack={() => go("home")}
    />
  )}

      {page === 'login' && <section className="login-screen">
        <div className="login-card">
          <div className="login-mark"><Route size={21}/></div>
          <h1>Welcome Back</h1><p>Sign in to manage your saved routes and active trips.</p>
          <form onSubmit={e => { e.preventDefault(); go('home'); notify('Welcome back! You are signed in to the demo.'); }}>
            <label>Email Address</label><input type="email" defaultValue="suhani.jain@example.com" required/>
            <label>Password</label><input type="password" defaultValue="waywise123" required/>
            <div className="login-row"><label className="remember"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}/> Remember me</label><button type="button" className="text-button" onClick={() => notify('Password reset is a demo feature.')}>Forgot Password?</button></div>
            <button className="btn btn-dark full" type="submit">Login</button>
          </form>
          <div className="login-bottom">Don't have an account? <button className="text-button" onClick={() => notify('Sign-up is a demo feature.')}>Sign Up</button></div>
        </div>
      </section>}

      {page === 'home' && <>
        <section className="home-hero">
          <h1>Compare Routes. Save Time.<br/>Travel Smarter.</h1>
          <p>WayWise helps college students and daily commuters discover the best travel choices.<br className="desktop-only"/> Instantly compare travel times, fare costs, and real-time route conditions in one simple interface.</p>
        </section>
        <form className="search-bar-card" onSubmit={submitSearch}>
          <div className="search-field"><label htmlFor="home-origin">Current Location</label><div><MapPin size={15}/><input id="home-origin" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Enter city, address or college" required/><button type="button" title="Use sample location" onClick={() => setOrigin('BML Munjal University')}><LocateFixed size={14}/></button></div></div>
          <div className="search-field"><label htmlFor="home-destination">Destination</label><div><Navigation size={15}/><input id="home-destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Enter destination mall or terminal" required/></div></div>
          <button className="btn btn-dark find-btn" type="submit">Find Routes</button>
        </form>
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
  <button
    type="button"
    className="btn btn-blue"
    onClick={() => go("cab-booking")}
  >
    <CarFront size={16} />
    Book a Cab
    <ArrowRight size={14} />
  </button>
</div>
        <section className="popular-section"><div className="section-label">Popular Commutes</div><div className="popular-grid">
          {[
            ['Ambience Mall','Gurugram, Haryana','32 min away'],
            ['ISKCON Temple','Sector 25, Gurugram','38 min away'],
            ['Cyber Hub','DLF Phase 2, Gurugram','25 min away'],
            ['BMU Campus','Kapriwas, Haryana','8 km away']
          ].map(([name, address, time]) => <article className="popular-card" key={name}><span className="round-pin"><MapPin size={14}/></span><div className="popular-info"><strong>{name}</strong><small>{address}</small><div className="popular-bottom"><span>{time}</span><button onClick={() => { setDestination(name); go('routes'); }}>Quick options</button></div></div></article>)}
        </div></section>
        <section className="home-secondary"><div><h2>Travel with more control.</h2><p>Compare route costs, skip tolls where possible, and choose the journey that fits your day.</p></div><button className="btn btn-blue" onClick={() => go('login')}>Sign in / Create account <ArrowRight size={14}/></button></section>
      </>}

      {page === 'routes' && <>
        <div className="page-title-row"><div><div className="eyebrow">ROUTE PLANNER</div><h1>Available Routes</h1><p>Choose the route that works best for you.</p></div><button className="btn btn-outline" onClick={() => go('home')}><ArrowLeft size={14}/> Edit journey</button></div>
        <div className="routes-layout"><div className="route-list">{routes.map(route => <article key={route.id} className={`route-option ${selectedRoute === route.id ? 'chosen' : ''}`}><div className="route-option-top"><strong>{route.name}</strong><span className={`route-tag ${route.color}`}>{route.tag}</span></div><div className="route-stats"><div><small>TRAVEL TIME</small><b>{route.time}</b></div><div><small>DISTANCE</small><b>{route.distance}</b></div><div><small>EST. FARE</small><b>{route.fare}</b></div><div><small>TOLL COST</small><b>{route.toll}</b></div></div><p>{route.detail}</p><button className={`btn ${selectedRoute === route.id ? 'btn-blue' : 'btn-dark'} full`} onClick={() => { setSelectedRoute(route.id); notify(`${route.name} selected`); }}> {selectedRoute === route.id ? 'Selected Route' : 'Select Route'}</button><button className="route-detail-link" onClick={() => { setSelectedRoute(route.id); go('details'); }}>View route details <ChevronRight size={13}/></button></article>)}</div>
          <div className="map-card"><div className="map-head"><strong>Route Map</strong><span>PREVIEW</span></div><div className="map-canvas"><MapDrawing/><div className="map-location start"><span><MapPin size={14}/></span><b>{origin}</b></div><div className="map-location end"><span><Navigation size={14}/></span><b>{destination}</b></div><div className="map-key"><span/> Selected route · {chosenRoute.distance}</div></div><div className="map-links"><button onClick={() => openLink(mapsUrl)}>Google Maps <ExternalLink size={12}/></button><button onClick={() => openLink(wazeUrl)}>Waze <ExternalLink size={12}/></button></div><p className="muted-note">Illustrative route preview. Open a map app for navigation.</p></div>
        </div>
        <div className="bottom-actions"><button className="btn btn-outline" onClick={() => go('home')}>Back</button><button className="btn btn-blue" onClick={() => go('details')}>Review selected route <ArrowRight size={14}/></button></div>
      </>}

      {page === 'details' && <>
        <div className="page-title-row"><div><div className="eyebrow">MAP VIEW / ROUTE DETAILS</div><h1>Route Details</h1><p>Review the selected route before confirming.</p></div><button className="btn btn-outline" onClick={() => go('routes')}><ArrowLeft size={14}/> Back to routes</button></div>
        <div className="details-map"><MapDrawing/><div className="map-dot dot-start"/><div className="map-dot dot-end"/><div className="map-distance-pill">{chosenRoute.distance} · {chosenRoute.time}</div></div>
        <div className="details-summary"><h2>Selected Route: {chosenRoute.name}</h2><p>Review your route metrics below before confirming.</p><div className="detail-metrics"><div><small>ESTIMATED TIME</small><strong>{chosenRoute.time}</strong><span>Depending on traffic</span></div><div><small>TOTAL DISTANCE</small><strong>{chosenRoute.distance}</strong><span>Approximate journey</span></div><div><small>ESTIMATED FARE</small><strong>{chosenRoute.fare}</strong><span>Indicative estimate</span></div><div><small>TOLL CHARGES</small><strong>{chosenRoute.toll}</strong><span>{chosenRoute.toll === '₹0' ? 'No tolls on this option' : 'Tolls included separately'}</span></div></div><div className="detail-actions"><button className="btn btn-outline" onClick={() => go('routes')}>Back</button><button className="btn btn-blue" onClick={() => go('confirm')}>Continue to Confirmation <ArrowRight size={14}/></button></div></div>
      </>}

      {page === 'confirm' && <section className="center-page"><div className="confirmation-card"><div className="card-heading"><div><h1>Ride Confirmation</h1><p>Please verify your trip details.</p></div><span className="confirm-icon"><CarFront size={20}/></span></div><div className="confirm-locations"><div><span className="small-dot green-dot"/><div><small>From</small><strong>{origin}</strong></div></div><div className="vertical-dash"/><div><span className="small-dot blue-dot"/><div><small>To</small><strong>{destination}</strong></div></div></div><div className="confirm-table"><div><span>Selected Route</span><strong>{chosenRoute.name}</strong></div><div><span>Estimated Time</span><strong>{chosenRoute.time}</strong></div><div><span>Total Distance</span><strong>{chosenRoute.distance}</strong></div><div><span>Estimated Fare</span><strong>{chosenRoute.fare} <small>(incl. toll {chosenRoute.toll})</small></strong></div></div><div className="vehicle-choice"><span className="vehicle-icon"><CarFront size={19}/></span><div><strong>Standard Sedan (4 seats)</strong><small>Illustrative vehicle option · provider booking not connected</small></div><ChevronDown size={15}/></div><div className="confirm-actions"><button className="btn btn-outline" onClick={() => go('details')}>Cancel</button><button className="btn btn-blue" onClick={() => { setRideConfirmed(true); go('tracking'); }}>Confirm Ride</button></div><p className="muted-note"><ShieldCheck size={13}/> Demo confirmation only; this does not book a real cab.</p></div></section>}

      {page === 'tracking' && <><div className="page-title-row"><div><div className="eyebrow">TRIP VIEW / LIVE TRACKING</div><h1>Trip Tracking</h1><p>{rideConfirmed ? 'Your demo trip has been confirmed.' : 'Track your selected route.'}</p></div><span className="status-pill"><span/> DEMO TRIP</span></div><div className="tracking-layout"><div className="tracking-map"><MapDrawing/><div className="tracking-route-line"/><div className="map-dot dot-start"/><div className="map-dot dot-end"/></div><div className="tracking-info"><div className="tracking-label">TRIP PROGRESS</div><h2>{chosenRoute.name}</h2><div className="tracking-big">{chosenRoute.time}</div><p>Estimated travel time · {chosenRoute.distance}</p><div className="progress-track"><span/></div><div className="confirm-table"><div><span>From</span><strong>{origin}</strong></div><div><span>To</span><strong>{destination}</strong></div><div><span>Estimated fare</span><strong>{chosenRoute.fare}</strong></div></div><button className="btn btn-dark full" onClick={() => openLink(mapsUrl)}><Navigation size={14}/> Navigate with Google Maps</button><button className="btn btn-outline full waze-wide" onClick={() => openLink(wazeUrl)}>Open Waze <ExternalLink size={13}/></button><button className="text-button cancel-trip" onClick={() => { setRideConfirmed(false); go('home'); }}>End demo trip</button></div></div></>}

      {page === 'trips' && <><div className="page-title-row"><div><div className="eyebrow">YOUR JOURNEYS</div><h1>My Trips</h1><p>View your recent and saved trip plans.</p></div><button className="btn btn-blue" onClick={() => go('home')}>Plan a new trip <Plus size={14}/></button></div><div className="trip-list"><article className="trip-card"><div className="trip-icon"><Route size={18}/></div><div className="trip-main"><strong>{origin} <ArrowRight size={13}/> {destination}</strong><small>Recent trip · Route preview</small><span>{chosenRoute.name} · {chosenRoute.distance} · {chosenRoute.time}</span></div><strong className="trip-price">{chosenRoute.fare}</strong><button className="btn btn-outline" onClick={() => go('details')}>View details</button></article><article className="trip-card"><div className="trip-icon"><MapPin size={18}/></div><div className="trip-main"><strong>BMU Campus <ArrowRight size={13}/> Ambience Mall</strong><small>Sample previous trip</small><span>Route B via Local Roads · 28 km · 58 min</span></div><strong className="trip-price">₹790</strong><button className="btn btn-outline" onClick={() => { setOrigin('BML Munjal University'); setDestination('Ambience Mall'); setSelectedRoute(2); go('details'); }}>View details</button></article></div></>}

      {page === 'profile' && <><div className="page-title-row"><div><div className="eyebrow">YOUR ACCOUNT</div><h1>Profile</h1><p>Manage your personal information and saved places.</p></div><button className="btn btn-dark" onClick={() => go('settings')}><SettingsIcon size={14}/> Settings</button></div><div className="profile-card"><div className="profile-header"><div className="avatar"><UserRound size={25}/></div><div className="profile-main"><strong>{profileName}</strong><span>{profileEmail}</span><small>+91 98765 43210 · <i>Verified Profile</i></small></div><button className="btn btn-dark" onClick={() => { const n = window.prompt('Enter your name', profileName); if (n?.trim()) setProfileName(n.trim()); }}> <Pencil size={13}/> Edit Profile</button></div><div className="saved-heading"><strong>Saved Places & Hubs</strong><button className="text-button" onClick={() => { const place = window.prompt('Enter a place name'); if (place?.trim()) setSaved(old => [...old, { name: place.trim(), address: 'Custom saved location', type: 'Saved place' }]); }}>+ Add New Place</button></div><div className="saved-list">{saved.map((place, i) => <div className="saved-place" key={`${place.name}-${i}`}><span className="saved-pin"><MapPin size={14}/></span><div><strong>{place.name}</strong><small>{place.address}</small></div><button onClick={() => { setDestination(place.name); go('home'); }}>Plan Trip</button><button className="delete-place" title="Remove saved place" onClick={() => setSaved(old => old.filter((_, idx) => idx !== i))}><Trash2 size={13}/></button></div>)}</div></div></>}

      {page === 'settings' && <><div className="page-title-row"><div><div className="eyebrow">ACCOUNT PREFERENCES</div><h1>Settings</h1><p>Personalise your WayWise experience.</p></div></div><div className="settings-layout"><aside className="settings-menu"><h3>SETTINGS MENU</h3>{[['Account Security',LockKeyhole],['Notifications',Bell],['Map Preferences',SlidersHorizontal],['Privacy & Safety',ShieldCheck],['Help & Support',HelpCircle]].map(([name, Icon]) => <button key={name} className={activeSettings === name ? 'settings-active' : ''} onClick={() => setActiveSettings(name)}><Icon size={14}/>{name}</button>)}<button className="logout-button" onClick={() => go('login')}><LogOut size={14}/> Logout Account</button></aside><section className="settings-content"><h2>{activeSettings}</h2>{activeSettings === 'Notifications' && <><SettingToggle title="Email Alerts & Logs" desc="Receive updates on trip reviews and fare comparisons." checked={toggles.alerts} onChange={() => toggleSetting('alerts')}/><SettingToggle title="Push Notifications" desc="Real-time alerts for traffic changes and saved routes." checked={toggles.push} onChange={() => toggleSetting('push')}/><SettingToggle title="Trip Reminders" desc="Receive reminders about your scheduled journeys." checked={toggles.reminders} onChange={() => toggleSetting('reminders')}/></>}{activeSettings === 'Map Preferences' && <><h3>Map & Route Preferences</h3><div className="settings-fields"><label>Default City<input defaultValue="Gurugram (Delhi NCR)"/></label><label>Measurement Unit<select defaultValue="km"><option value="km">Kilometers (km)</option><option value="mi">Miles (mi)</option></select></label></div><p className="muted-note">Map preferences are saved for this demo session only.</p></>}{activeSettings === 'Privacy & Safety' && <><SettingToggle title="Share Anonymous Trip Logs" desc="Allow anonymous usage analytics to improve route suggestions." checked={toggles.share} onChange={() => toggleSetting('share')}/><SettingToggle title="Keep Lifetime History" desc="Retain trip history for your account." checked={toggles.history} onChange={() => toggleSetting('history')}/></>}{activeSettings === 'Account Security' && <><div className="setting-info"><strong>Password & Sign-in</strong><p>Manage account access and sign-in preferences.</p><button className="btn btn-outline" onClick={() => notify('Password change is a demo feature.')}>Change Password</button></div><div className="setting-info"><strong>Verified profile</strong><p>Your demo profile is marked as verified.</p></div></>}{activeSettings === 'Help & Support' && <div className="setting-info"><strong>Need help with WayWise?</strong><p>This student project prototype uses sample routes and does not book real rides.</p><button className="btn btn-outline" onClick={() => notify('Support contact is not configured in this demo.')}>Contact Support</button></div>}</section></div></>}

      {notice && <div className="toast"><Check size={15}/>{notice}<button onClick={() => setNotice('')}><X size={13}/></button></div>}
    </main>
    <footer className="footer"><button onClick={() => go('home')} className="footer-brand"><span className="brand-icon"><Route size={15}/></span> WayWise</button><span>Designed for smarter daily commutes.</span><span>Student project prototype · © 2026</span></footer>
  </div>;
}

function MapDrawing() {
  return <svg className="map-drawing" viewBox="0 0 700 370" preserveAspectRatio="none" aria-hidden="true">
    <g className="map-roads">
      <path d="M-30 80 L730 280"/><path d="M-30 300 L730 80"/><path d="M70 -20 L240 400"/><path d="M300 -20 L400 400"/><path d="M540 -20 L470 400"/><path d="M-30 185 L730 185"/><path d="M-20 20 L720 350"/><path d="M30 370 L680 -10"/>
      <path className="map-main-road" d="M75 280 C150 245 185 150 275 175 S420 255 520 85"/>
      <path className="map-main-road-center" d="M75 280 C150 245 185 150 275 175 S420 255 520 85"/>
    </g>
    <g className="map-blocks"><rect x="105" y="35" width="45" height="27"/><rect x="360" y="45" width="57" height="34"/><rect x="570" y="250" width="50" height="26"/><rect x="280" y="290" width="35" height="25"/></g>
  </svg>;
}

function SettingToggle({ title, desc, checked, onChange }) {
  return <div className="setting-toggle"><div><strong>{title}</strong><p>{desc}</p></div><button aria-label={`Toggle ${title}`} className={`switch ${checked ? 'on' : ''}`} onClick={onChange}><span/></button></div>;
}
