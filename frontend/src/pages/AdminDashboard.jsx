// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import axios from '../api/axios';

/**
 * Admin Dashboard
 * - Lists parking lots (GET /admin/parking-lots)
 * - Add parking lot (POST /admin/parking-lot)
 * - Edit parking lot inline (PUT /admin/parking-lot/:id)
 * - Delete parking lot (DELETE /admin/parking-lot/:id)
 * - List bookings (GET /admin/bookings)
 * - Delete booking (DELETE /admin/bookings/:id) - backend restores slot
 */

export default function AdminDashboard() {
  const [parkingLots, setParkingLots] = useState([]);
  const [bookings, setBookings] = useState([]);

  // add form
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [amenities, setAmenities] = useState(''); // comma separated

  // UI states
  const [loadingLots, setLoadingLots] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // editing
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Fetch parking lots
  const fetchParkingLots = async () => {
    setError('');
    setLoadingLots(true);
    try {
      const res = await axios.get('/admin/parking-lots');
      setParkingLots(res.data || []);
    } catch (err) {
      console.error('fetchParkingLots error', err);
      setError(err.response?.data?.message || 'Failed to load parking lots');
    } finally {
      setLoadingLots(false);
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    setError('');
    setLoadingBookings(true);
    try {
      const res = await axios.get('/admin/bookings');
      setBookings(res.data || []);
    } catch (err) {
      console.error('fetchBookings error', err);
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchParkingLots();
    fetchBookings();
  }, []);

  // Add parking lot
  const handleAdd = async () => {
    setError('');
    setSuccessMsg('');
    if (!name || !location || !city || !price || !capacity) {
      setError('Please fill required fields: name, location, city, price, capacity.');
      return;
    }

    try {
      const payload = {
        name,
        location,
        city,
        pricePerHour: Number(price),
        capacity: Number(capacity),
        availableSlots: Number(capacity),
        amenities: amenities
          ? amenities.split(',').map(a => a.trim()).filter(Boolean)
          : []
      };

      await axios.post('/admin/parking-lot', payload);
      setSuccessMsg('Parking lot added successfully.');
      // reset form
      setName(''); setLocation(''); setCity(''); setPrice(''); setCapacity(''); setAmenities('');
      await fetchParkingLots();
    } catch (err) {
      console.error('add parking error', err);
      setError(err.response?.data?.message || 'Failed to add parking lot');
    }
  };

  // Delete parking lot
  const handleDeleteParking = async (id) => {
    setError('');
    setSuccessMsg('');
    if (!window.confirm('Are you sure you want to delete this parking lot? This will also remove related bookings.')) return;
    try {
      await axios.delete(`/admin/parking-lot/${id}`);
      setSuccessMsg('Parking lot deleted.');
      await fetchParkingLots();
      await fetchBookings();
    } catch (err) {
      console.error('delete parking error', err);
      setError(err.response?.data?.message || 'Failed to delete parking lot');
    }
  };

  // Start editing
  const startEdit = (lot) => {
    setEditingId(lot._id);
    setEditValues({
      name: lot.name || '',
      location: lot.location || '',
      city: lot.city || '',
      pricePerHour: lot.pricePerHour ?? '',
      capacity: lot.capacity ?? '',
      availableSlots: lot.availableSlots ?? '',
      amenities: (lot.amenities || []).join(', ')
    });
    setError('');
    setSuccessMsg('');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  // Save edited lot
  const saveEdit = async (id) => {
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        name: editValues.name,
        location: editValues.location,
        city: editValues.city,
        pricePerHour: Number(editValues.pricePerHour),
        capacity: Number(editValues.capacity),
        availableSlots: Number(editValues.availableSlots),
        amenities: editValues.amenities
          ? editValues.amenities.split(',').map(a => a.trim()).filter(Boolean)
          : []
      };
      await axios.put(`/admin/parking-lot/${id}`, payload);
      setSuccessMsg('Parking lot updated.');
      setEditingId(null);
      setEditValues({});
      await fetchParkingLots();
    } catch (err) {
      console.error('save edit error', err);
      setError(err.response?.data?.message || 'Failed to update parking lot');
    }
  };

  // Delete booking
  const handleDeleteBooking = async (id) => {
    setError('');
    setSuccessMsg('');
    if (!window.confirm('Delete this booking? This will restore the parking slot.')) return;
    try {
      await axios.delete(`/admin/bookings/${id}`);
      setSuccessMsg('Booking deleted and slot restored.');
      await fetchBookings();
      await fetchParkingLots();
    } catch (err) {
      console.error('delete booking error', err);
      setError(err.response?.data?.message || 'Failed to delete booking');
    }
  };

  return (
    <div className="p-6 min-h-screen bg-sky-50 dark:bg-sky-900 transition">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
          <div className="text-sm text-slate-600 dark:text-slate-300">Manage parking lots & bookings</div>
        </header>

        {/* messages */}
        {error && <div className="mb-4 p-3 rounded bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200">{error}</div>}
        {successMsg && <div className="mb-4 p-3 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">{successMsg}</div>}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Add parking form */}
          <div className="card bg-white dark:bg-sky-800 text-slate-900 dark:text-slate-100 border p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-3">Add Parking Lot</h2>

            <input className="border p-2 rounded w-full mb-2 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
                   placeholder="Name" value={name} onChange={e => setName(e.target.value)} />

            <input className="border p-2 rounded w-full mb-2 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
                   placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />

            <input className="border p-2 rounded w-full mb-2 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
                   placeholder="City" value={city} onChange={e => setCity(e.target.value)} />

            <div className="flex gap-2">
              <input className="border p-2 rounded w-1/2 mb-2 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
                     placeholder="Price per hour" value={price} onChange={e => setPrice(e.target.value)} />
              <input className="border p-2 rounded w-1/2 mb-2 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
                     placeholder="Capacity" value={capacity} onChange={e => setCapacity(e.target.value)} />
            </div>

            <input className="border p-2 rounded w-full mb-3 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
                   placeholder="Amenities (comma separated)" value={amenities} onChange={e => setAmenities(e.target.value)} />

            <div className="flex items-center gap-3">
              <button onClick={handleAdd} className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 transition">Add Parking</button>
              <button onClick={() => { setName(''); setLocation(''); setCity(''); setPrice(''); setCapacity(''); setAmenities(''); }}
                      className="bg-slate-100 dark:bg-sky-700 text-slate-900 dark:text-slate-100 px-3 py-2 rounded">Clear</button>
            </div>
          </div>

          {/* Parking lots list */}
          <div className="card bg-white dark:bg-sky-800 text-slate-900 dark:text-slate-100 border p-4 rounded-lg shadow max-h-[520px] overflow-auto">
            <h2 className="font-semibold mb-3">Existing Parking Lots</h2>

            {loadingLots ? <p className="text-sm">Loading parking lots...</p> : null}
            {parkingLots.length === 0 && !loadingLots && <p className="text-sm text-slate-600 dark:text-slate-300">No parking lots found.</p>}

            <div className="space-y-3">
              {parkingLots.map(lot => (
                <div key={lot._id} className="p-3 border rounded-lg flex flex-col md:flex-row md:justify-between md:items-start bg-white dark:bg-sky-800">
                  <div className="w-full md:w-3/4">
                    {editingId === lot._id ? (
                      <>
                        <input className="border p-1 rounded w-full mb-1 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
                               value={editValues.name} onChange={e => setEditValues(v => ({ ...v, name: e.target.value }))} />
                        <input className="border p-1 rounded w-full mb-1 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
                               value={editValues.location} onChange={e => setEditValues(v => ({ ...v, location: e.target.value }))} />
                        <input className="border p-1 rounded w-full mb-1 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
                               value={editValues.city} onChange={e => setEditValues(v => ({ ...v, city: e.target.value }))} />

                        <div className="flex gap-2">
                          <input className="border p-1 rounded w-1/2 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
                                 value={editValues.pricePerHour} onChange={e => setEditValues(v => ({ ...v, pricePerHour: e.target.value }))} />
                          <input className="border p-1 rounded w-1/2 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
                                 value={editValues.capacity} onChange={e => setEditValues(v => ({ ...v, capacity: e.target.value }))} />
                        </div>

                        <input className="border p-1 rounded w-full mt-1 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
                               value={editValues.availableSlots} onChange={e => setEditValues(v => ({ ...v, availableSlots: e.target.value }))} />
                        <input className="border p-1 rounded w-full mt-1 bg-white dark:bg-sky-700 text-slate-900 dark:text-slate-100"
                               value={editValues.amenities} onChange={e => setEditValues(v => ({ ...v, amenities: e.target.value }))} />
                      </>
                    ) : (
                      <>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{lot.name}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-300">{lot.city} • {lot.location}</div>
                        <div className="text-sm mt-1">Price/hr: <span className="font-semibold">₹{lot.pricePerHour}</span> • Slots: <span className="font-semibold">{lot.availableSlots}/{lot.capacity}</span></div>
                        <div className="text-sm mt-1">Amenities: {(lot.amenities || []).join(', ')}</div>
                      </>
                    )}
                  </div>

                  <div className="mt-3 md:mt-0 flex gap-2">
                    {editingId === lot._id ? (
                      <>
                        <button onClick={() => saveEdit(lot._id)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Save</button>
                        <button onClick={cancelEdit} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(lot)} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Edit</button>
                        <button onClick={() => handleDeleteParking(lot._id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="mt-6 card bg-white dark:bg-sky-800 text-slate-900 dark:text-slate-100 border p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-3">All Bookings</h2>
          {loadingBookings ? <p className="text-sm">Loading bookings...</p> : null}
          {bookings.length === 0 && !loadingBookings && <p className="text-sm text-slate-600 dark:text-slate-300">No bookings found.</p>}

          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b._id} className="p-3 border rounded-lg flex flex-col md:flex-row md:justify-between md:items-start bg-white dark:bg-sky-800">
                <div>
                  <div className="font-semibold">{b.parkingLot?.name || '—'}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">User: {b.user?.name} • {b.user?.email}</div>
                  <div className="text-sm">Start: {new Date(b.startTime).toLocaleString()}</div>
                  <div className="text-sm">End: {new Date(b.endTime).toLocaleString()}</div>
                </div>
                <div className="mt-3 md:mt-0">
                  <button onClick={() => handleDeleteBooking(b._id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Delete Booking</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
