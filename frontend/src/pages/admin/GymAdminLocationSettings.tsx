import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Navigation, Search, Save, CheckCircle2, AlertCircle, Loader2, Building2, Globe, ShieldCheck, ExternalLink, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

declare global {
  interface Window {
    L: any;
  }
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'tirupattur': { lat: 12.4926, lng: 78.5679 },
  'tirupathur': { lat: 12.4926, lng: 78.5679 },
  '635601': { lat: 12.4926, lng: 78.5679 },
  'vellore': { lat: 12.9165, lng: 79.1325 },
  'hosur': { lat: 12.7409, lng: 77.8253 },
  'krishnagiri': { lat: 12.5186, lng: 78.2137 },
  'dharmapuri': { lat: 12.1211, lng: 78.1582 },
  'salem': { lat: 11.6643, lng: 78.1460 },
  'erode': { lat: 11.3410, lng: 77.7172 },
  'coimbatore': { lat: 11.0168, lng: 76.9558 },
  'trichy': { lat: 10.7905, lng: 78.7047 },
  'tiruchirappalli': { lat: 10.7905, lng: 78.7047 },
  'madurai': { lat: 9.9252, lng: 78.1198 },
  'tirunelveli': { lat: 8.7139, lng: 77.7567 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
};

export const GymAdminLocationSettings: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get('branchId') || user?.branchId;

  const [gym, setGym] = useState<any>(null);
  const [isBranchLocation, setIsBranchLocation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [hasSavedLocation, setHasSavedLocation] = useState(false);

  // Form State
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [country, setCountry] = useState('India');
  const [pinCode, setPinCode] = useState('');
  const [latitude, setLatitude] = useState<number | string>('');
  const [longitude, setLongitude] = useState<number | string>('');

  // Flag to avoid cyclic geocoding when map pin is moved manually
  const isMapUpdatingFormRef = useRef(false);

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const resolveCityCoordinates = (cityName: string, pin: string) => {
    const cKey = (cityName || '').toLowerCase().trim();
    const pKey = (pin || '').trim();

    if (CITY_COORDINATES[cKey]) return CITY_COORDINATES[cKey];
    if (CITY_COORDINATES[pKey]) return CITY_COORDINATES[pKey];

    // Substring match for Tirupattur or other city
    for (const key of Object.keys(CITY_COORDINATES)) {
      if (key.length > 3 && cKey.includes(key)) {
        return CITY_COORDINATES[key];
      }
    }
    return null;
  };

  // Reverse Geocode: convert Lat/Lng to street address, area, city, state, pincode
  const reverseGeocode = useCallback(async (lat: number, lng: number, updateAddressOnlyIfEmpty = false) => {
    try {
      setReverseLoading(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.address) {
        const a = data.address;
        const street = a.road || a.suburb || a.neighbourhood || a.pedestrian || '';
        const subArea = a.suburb || a.residential || a.neighbourhood || a.subdistrict || '';
        const cty = a.city || a.town || a.village || a.county || a.district || '';
        const st = a.state || '';
        const pin = a.postcode || '';
        const cntry = a.country || 'India';

        isMapUpdatingFormRef.current = true;
        if (street && (!updateAddressOnlyIfEmpty || !address)) setAddress(street);
        if (subArea && (!updateAddressOnlyIfEmpty || !area)) setArea(subArea);
        if (cty && (!updateAddressOnlyIfEmpty || !city)) setCity(cty);
        if (st && (!updateAddressOnlyIfEmpty || !stateName)) setStateName(st);
        if (pin && (!updateAddressOnlyIfEmpty || !pinCode)) setPinCode(pin);
        if (cntry && (!updateAddressOnlyIfEmpty || !country)) setCountry(cntry);

        setTimeout(() => {
          isMapUpdatingFormRef.current = false;
        }, 800);
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    } finally {
      setReverseLoading(false);
    }
  }, [address, area, city, stateName, pinCode, country]);

  // Load existing Gym or Branch location details
  const fetchGymLocation = async () => {
    try {
      setLoading(true);
      if (branchId) {
        setIsBranchLocation(true);
        const res = await api.get(`/branches/${branchId}`);
        if (res.data.success && res.data.branch) {
          const b = res.data.branch;
          setGym({ name: `${b.branchName} (Branch)`, _id: b._id, isBranch: true });
          const loc = b.location || {};
          const loadedCity = loc.city || '';
          const loadedState = loc.state || '';
          const loadedPin = loc.pinCode || '';
          const loadedAddress = loc.address || '';

          setAddress(loadedAddress);
          setArea(loc.area || '');
          setCity(loadedCity);
          setStateName(loadedState);
          setCountry(loc.country || 'India');
          setPinCode(loadedPin);

          let resolvedLat = loc.latitude;
          let resolvedLng = loc.longitude;

          if (!resolvedLat || !resolvedLng || (resolvedLat === 13.0827 && resolvedLng === 80.2707 && loadedCity.toLowerCase() !== 'chennai')) {
            const matched = resolveCityCoordinates(loadedCity, loadedPin);
            if (matched) {
              resolvedLat = matched.lat;
              resolvedLng = matched.lng;
            } else if (loadedCity.toLowerCase().includes('tirupat') || loadedPin === '635601') {
              resolvedLat = 12.4926;
              resolvedLng = 78.5679;
            }
          }

          setLatitude(resolvedLat !== undefined && resolvedLat !== null ? resolvedLat : '');
          setLongitude(resolvedLng !== undefined && resolvedLng !== null ? resolvedLng : '');

          if (loc.latitude && loc.longitude) {
            setHasSavedLocation(true);
          }
        }
      } else {
        setIsBranchLocation(false);
        const res = await api.get('/gyms/my-gym');
        if (res.data.success && res.data.gym) {
          const g = res.data.gym;
          setGym(g);
          const loc = g.location || {};
          const loadedCity = loc.city || '';
          const loadedState = loc.state || '';
          const loadedPin = loc.pinCode || '';
          const loadedAddress = loc.address || '';

          setAddress(loadedAddress);
          setArea(loc.area || '');
          setCity(loadedCity);
          setStateName(loadedState);
          setCountry(loc.country || 'India');
          setPinCode(loadedPin);

          let resolvedLat = loc.latitude;
          let resolvedLng = loc.longitude;

          if (!resolvedLat || !resolvedLng || (resolvedLat === 13.0827 && resolvedLng === 80.2707 && loadedCity.toLowerCase() !== 'chennai')) {
            const matched = resolveCityCoordinates(loadedCity, loadedPin);
            if (matched) {
              resolvedLat = matched.lat;
              resolvedLng = matched.lng;
            } else if (loadedCity.toLowerCase().includes('tirupat') || loadedPin === '635601') {
              resolvedLat = 12.4926;
              resolvedLng = 78.5679;
            }
          }

          setLatitude(resolvedLat !== undefined && resolvedLat !== null ? resolvedLat : '');
          setLongitude(resolvedLng !== undefined && resolvedLng !== null ? resolvedLng : '');

          if (loc.latitude && loc.longitude) {
            setHasSavedLocation(true);
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to load location details:', err);
      showToast('Could not load location details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGymLocation();
  }, [branchId]);

  // Dynamically load Leaflet JS & CSS
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if ((window as any).L) {
      setMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Initialize and manage Leaflet Map instance
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || loading) return;

    const L = window.L;
    if (!L) return;

    const matchedCoords = resolveCityCoordinates(city, pinCode);
    const fallbackLat = matchedCoords?.lat || (city.toLowerCase().includes('tirupat') || pinCode === '635601' ? 12.4926 : 12.4926);
    const fallbackLng = matchedCoords?.lng || (city.toLowerCase().includes('tirupat') || pinCode === '635601' ? 78.5679 : 78.5679);

    const defaultLat = Number(latitude) || fallbackLat;
    const defaultLng = Number(longitude) || fallbackLng;
    const initialZoom = 15;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: initialZoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Custom neon pin icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin-wrapper',
        html: `
          <div style="
            width: 38px;
            height: 38px;
            background: #F97316;
            border: 3px solid #FFFFFF;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 14px rgba(249, 115, 22, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 10px; height: 10px; background: #FFFFFF; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38]
      });

      const marker = L.marker([defaultLat, defaultLng], {
        draggable: true,
        icon: customIcon
      }).addTo(map);

      marker.bindPopup(`<b>${gym?.name || 'My Gym Location'}</b><br/>Drag pin to set exact coordinates.`).openPopup();

      // Update lat/lng and trigger reverse geocoding on marker drag end
      marker.on('dragend', (e: any) => {
        const latlng = e.target.getLatLng();
        const lat = parseFloat(latlng.lat.toFixed(6));
        const lng = parseFloat(latlng.lng.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        reverseGeocode(lat, lng);
      });

      // Update lat/lng and move marker on map click
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        const roundedLat = parseFloat(lat.toFixed(6));
        const roundedLng = parseFloat(lng.toFixed(6));
        marker.setLatLng([roundedLat, roundedLng]);
        setLatitude(roundedLat);
        setLongitude(roundedLng);
        reverseGeocode(roundedLat, roundedLng);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;
    } else {
      // Update existing map view if lat/lng changed externally
      if (latitude && longitude && mapInstanceRef.current && markerInstanceRef.current) {
        const newLat = Number(latitude);
        const newLng = Number(longitude);
        mapInstanceRef.current.setView([newLat, newLng], mapInstanceRef.current.getZoom() || 15);
        markerInstanceRef.current.setLatLng([newLat, newLng]);
      }
    }
  }, [mapLoaded, loading, gym?.name, latitude, longitude, reverseGeocode]);

  // Forward Geocode: Search address from manual form inputs to reposition map pin
  const handleSearchAddressOnMap = async (silent = false) => {
    const fullQuery = [address, area, city, stateName, pinCode, country].filter(Boolean).join(', ');
    const shortQuery = [city, stateName, pinCode, country].filter(Boolean).join(', ');

    const q = fullQuery.trim() || shortQuery.trim();

    if (!q) {
      if (!silent) showToast('Please enter an address or city to search on map', 'error');
      return;
    }

    try {
      if (!silent) setGeocoding(true);
      let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
      let data = await res.json();

      // Fallback search with city and pincode if full street address query yields no hit
      if ((!data || data.length === 0) && shortQuery.trim() && q !== shortQuery.trim()) {
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(shortQuery.trim())}`);
        data = await res.json();
      }

      if (data && data.length > 0) {
        const first = data[0];
        const lat = parseFloat(parseFloat(first.lat).toFixed(6));
        const lng = parseFloat(parseFloat(first.lon).toFixed(6));

        setLatitude(lat);
        setLongitude(lng);

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerInstanceRef.current.setLatLng([lat, lng]);
          markerInstanceRef.current.getPopup()?.setContent(`<b>${gym?.name || 'My Gym Location'}</b><br/>${first.display_name.slice(0, 50)}...`).openPopup();
        }
        if (!silent) {
          showToast(`Located address on map: ${first.display_name.slice(0, 45)}...`);
        }
      } else {
        const matched = resolveCityCoordinates(city, pinCode);
        if (matched) {
          setLatitude(matched.lat);
          setLongitude(matched.lng);
          if (mapInstanceRef.current && markerInstanceRef.current) {
            mapInstanceRef.current.setView([matched.lat, matched.lng], 15);
            markerInstanceRef.current.setLatLng([matched.lat, matched.lng]);
          }
          if (!silent) showToast(`Centered map on ${city || 'city'} location`);
        } else if (!silent) {
          showToast('Address not found on map. You can click anywhere on map to set pin manually.', 'error');
        }
      }
    } catch (err) {
      console.error('Geocoding failed:', err);
      if (!silent) showToast('Failed to geocode address. Please set marker manually on map.', 'error');
    } finally {
      if (!silent) setGeocoding(false);
    }
  };

  // Automatic debounced geocode when manual form inputs change (User typing location in form)
  useEffect(() => {
    if (loading || isMapUpdatingFormRef.current) return;
    if (!city && !address && !pinCode) return;

    const timer = setTimeout(() => {
      handleSearchAddressOnMap(true);
    }, 750);

    return () => clearTimeout(timer);
  }, [address, area, city, stateName, pinCode, loading]);

  // Handle Current GPS Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);

        if (mapInstanceRef.current && markerInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerInstanceRef.current.setLatLng([lat, lng]);
        }
        reverseGeocode(lat, lng);
        showToast('Captured your current GPS coordinates & updated address fields!');
      },
      (error) => {
        console.error('Geolocation error:', error);
        showToast('Could not fetch current location. Please check browser permissions.', 'error');
      },
      { enableHighAccuracy: true }
    );
  };

  // Save or Update Location
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim() || !city.trim() || !stateName.trim() || !pinCode.trim()) {
      showToast('Street Address, City, State, and Pincode are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        address: address.trim(),
        area: area.trim(),
        city: city.trim(),
        state: stateName.trim(),
        country: country.trim(),
        pinCode: pinCode.trim(),
        latitude: latitude !== '' && latitude !== null ? Number(latitude) : undefined,
        longitude: longitude !== '' && longitude !== null ? Number(longitude) : undefined
      };

      let res;
      if (branchId) {
        res = await api.put(`/branches/${branchId}`, { location: payload });
      } else {
        try {
          res = await api.put('/gyms/my-gym/location', payload);
        } catch (firstErr) {
          if (gym?._id) {
            res = await api.put(`/gyms/${gym._id}`, {
              address: payload.address,
              city: payload.city,
              state: payload.state,
              pinCode: payload.pinCode,
              area: payload.area,
              country: payload.country,
              latitude: payload.latitude,
              longitude: payload.longitude
            });
          } else {
            throw firstErr;
          }
        }
      }

      if (res?.data?.success) {
        setHasSavedLocation(true);
        showToast(hasSavedLocation ? 'Location updated successfully!' : 'Location saved successfully!');
      } else {
        showToast(res?.data?.message || 'Failed to save location', 'error');
      }
    } catch (err: any) {
      console.error('Save location error:', err);
      showToast(err.response?.data?.message || err.message || 'Failed to save location details', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-[#78716C]">
        <Loader2 size={40} className="animate-spin text-[#F97316] mb-3" />
        <p className="font-semibold text-sm">Loading location settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-semibold text-sm transition-all animate-in slide-in-from-bottom-4 ${
          toast.type === 'success' ? 'bg-[#F97316]' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <Link
              to={branchId ? `/admin/branches/${branchId}` : '/admin/gym-profile'}
              className="w-10 h-10 rounded-2xl bg-[#FFFDF8] border border-[#E7E5E4] text-[#78716C] hover:text-[#F97316] flex items-center justify-center font-bold transition-colors shrink-0"
              title="Back to profile"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="w-10 h-10 rounded-2xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold shrink-0">
              <MapPin size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#292524] tracking-tight">
                Location Settings {isBranchLocation ? `— ${gym?.name}` : ''}
              </h1>
              <p className="text-xs text-[#78716C] mt-0.5">
                Manage {isBranchLocation ? 'branch' : 'gym'} official address & interactive map GPS pin for member discovery.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            hasSavedLocation
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <ShieldCheck size={14} />
            {hasSavedLocation ? 'Location Configured' : 'Setup Required'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Address Form */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-xs space-y-5">
          <div className="border-b border-[#E7E5E4] pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#292524] flex items-center gap-2">
                <Building2 className="text-[#F97316]" size={18} />
                Gym Address Details
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                Enter official gym address details to show on receipts & member app.
              </p>
            </div>
            {reverseLoading && (
              <span className="text-[11px] font-semibold text-[#F97316] flex items-center gap-1 bg-[#F97316]/10 px-2.5 py-1 rounded-full border border-[#F97316]/20">
                <Loader2 size={12} className="animate-spin" /> Reverse Geocoding...
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Gym Name Display */}
            <div>
              <label className="block font-bold text-[#292524] mb-1">Gym Name</label>
              <input
                type="text"
                value={gym?.name || ''}
                disabled
                className="w-full bg-[#F8FAFC] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-sm font-bold text-[#78716C] outline-none cursor-not-allowed"
              />
            </div>

            {/* Address Line 1 */}
            <div>
              <label className="block font-bold text-[#292524] mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Door No, Building Name, Street Road..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-sm text-[#292524] font-medium focus:border-[#F97316] outline-none transition-colors"
              />
            </div>

            {/* Area / Landmark */}
            <div>
              <label className="block font-bold text-[#292524] mb-1">Area / Landmark</label>
              <input
                type="text"
                placeholder="Near Metro Station, Opp. Park..."
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-sm text-[#292524] font-medium focus:border-[#F97316] outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* City */}
              <div>
                <label className="block font-bold text-[#292524] mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tirupattur"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-sm text-[#292524] font-medium focus:border-[#F97316] outline-none transition-colors"
                />
              </div>

              {/* State */}
              <div>
                <label className="block font-bold text-[#292524] mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tamil Nadu"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  required
                  className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-sm text-[#292524] font-medium focus:border-[#F97316] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Pincode */}
              <div>
                <label className="block font-bold text-[#292524] mb-1">
                  Postal / Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="635601"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  required
                  className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-sm text-[#292524] font-medium focus:border-[#F97316] outline-none transition-colors"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block font-bold text-[#292524] mb-1">Country</label>
                <input
                  type="text"
                  placeholder="India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3.5 py-2.5 text-sm text-[#292524] font-medium focus:border-[#F97316] outline-none transition-colors"
                />
              </div>
            </div>

            {/* GPS Coordinates Section */}
            <div className="pt-2 border-t border-[#E7E5E4]">
              <div className="flex items-center justify-between mb-2">
                <label className="font-bold text-[#292524] flex items-center gap-1.5 text-xs">
                  <Globe className="text-[#F97316]" size={14} /> GPS Coordinates (Captured from Map)
                </label>
                {latitude && longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[#F97316] hover:underline flex items-center gap-1"
                  >
                    View on Google Maps <ExternalLink size={10} />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E7E5E4]">
                <div>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase block mb-1">Latitude</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="12.4926"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full bg-white border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-[#292524] outline-none focus:border-[#F97316]"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#78716C] uppercase block mb-1">Longitude</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="78.5679"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full bg-white border border-[#E7E5E4] rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-[#292524] outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>
            </div>

            {/* Form Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-200 text-sm cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Saving Location...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {hasSavedLocation ? 'Update Location' : 'Save Location'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Interactive OpenStreetMap with Draggable Pin */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#E7E5E4] shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-[#292524] flex items-center gap-2">
                  <MapPin className="text-[#F97316]" size={18} />
                  Interactive Map Pinpoint
                </h2>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Click on map or drag red marker pin to capture precise GPS location.
                </p>
              </div>
            </div>

            {/* Map Action Control Buttons */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1.5 text-xs cursor-pointer shadow-2xs"
                title="Use browser GPS current location"
              >
                <Navigation size={14} />
                Use My GPS Location
              </button>

              <button
                type="button"
                onClick={() => handleSearchAddressOnMap(false)}
                disabled={geocoding}
                className="px-3 py-2 bg-[#FFFDF8] text-[#292524] border border-[#E7E5E4] font-bold rounded-xl hover:bg-white transition-colors flex items-center gap-1.5 text-xs cursor-pointer shadow-2xs disabled:opacity-50"
                title="Search entered address on map"
              >
                {geocoding ? <Loader2 size={14} className="animate-spin text-[#F97316]" /> : <Search size={14} className="text-[#F97316]" />}
                Search Address on Map
              </button>
            </div>

            {/* Leaflet Map Canvas Container */}
            <div className="relative w-full h-[360px] rounded-2xl overflow-hidden border border-[#E7E5E4] shadow-inner bg-slate-100">
              <div ref={mapContainerRef} className="w-full h-full z-10" />

              {!mapLoaded && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-20">
                  <Loader2 size={32} className="animate-spin text-[#F97316]" />
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#FFFDF8] border border-[#E7E5E4] p-3.5 rounded-2xl text-xs text-[#78716C]">
            <p className="font-bold text-[#292524] mb-0.5">📌 Interactive Map & Address Auto-Sync:</p>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li><strong>Manual Typing:</strong> Entering address, city, or pincode automatically repositions map pin.</li>
              <li><strong>Map Drag / GPS:</strong> Dragging pin or using GPS reverse-geocodes exact street address to form.</li>
              <li>Click <strong>"Save Location"</strong> or <strong>"Update Location"</strong> to show on landing page find a gym page.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymAdminLocationSettings;
