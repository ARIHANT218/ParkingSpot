import { useEffect, useState } from 'react';
import axios from '../api/axios';
import AdminChatsList from '../components/AdminChatList';

export default function AdminDashboard() {
  
  const [parkingLots, setParkingLots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  // add form fields
  const [name, setName] = useState('');
  const [locationText, setLocationText] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [amenities, setAmenities] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

 
  const [loadingLots, setLoadingLots] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
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
      console.log('Admin bookings fetched:', res.data);
      setBookings(res.data || []);
    } catch (err) {
      console.error('fetchBookings error', err);
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    setError('');
    setLoadingUsers(true);
    try {
      const res = await axios.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('fetchUsers error', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchParkingLots();
    fetchBookings();
    fetchUsers();
  }, []);

  // Add parking lot
  const handleAdd = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!name || !city || !price || !capacity) {
      setError('Please fill all required fields: Name, City, Price per hour, and Capacity.');
      return;
    }

    if (isNaN(Number(price)) || Number(price) <= 0) {
      setError('Price per hour must be a positive number.');
      return;
    }

    if (isNaN(Number(capacity)) || Number(capacity) <= 0) {
      setError('Capacity must be a positive number.');
      return;
    }

    try {
      const payload = {
        name: name.trim(),
        location: locationText?.trim() || '',
        city: city.trim(),
        latitude: latitude !== '' ? Number(latitude) : undefined,
        longitude: longitude !== '' ? Number(longitude) : undefined,
        pricePerHour: Number(price),
        capacity: Number(capacity),
        availableSlots: Number(capacity),
        amenities: amenities ? amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
      };

      await axios.post('/admin/parking-lot', payload);
      setSuccessMsg('Parking lot added successfully!');
      // reset form
      setName('');
      setLocationText('');
      setCity('');
      setPrice('');
      setCapacity('');
      setAmenities('');
      setLatitude('');
      setLongitude('');
      
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

  // Start editing a lot
  const startEdit = (lot) => {
    setEditingId(lot._id);
    setEditValues({
      name: lot.name || '',
      locationText: lot.location || '',
      city: lot.city || '',
      pricePerHour: lot.pricePerHour ?? '',
      capacity: lot.capacity ?? '',
      availableSlots: lot.availableSlots ?? '',
      amenities: (lot.amenities || []).join(', '),
      latitude: lot.latitude ?? '',
      longitude: lot.longitude ?? '',
    });
    setError('');
    setSuccessMsg('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  
  const saveEdit = async (id) => {
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        name: editValues.name,
        location: editValues.locationText,
        city: editValues.city,
        latitude: editValues.latitude !== '' ? Number(editValues.latitude) : undefined,
        longitude: editValues.longitude !== '' ? Number(editValues.longitude) : undefined,
        pricePerHour: Number(editValues.pricePerHour),
        capacity: Number(editValues.capacity),
        availableSlots: Number(editValues.availableSlots),
        amenities: editValues.amenities ? editValues.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
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

  // Confirm booking
  const handleConfirmBooking = async (id) => {
    setError('');
    setSuccessMsg('');
    try {
      await axios.patch(`/admin/bookings/${id}/confirm`);
      setSuccessMsg('Booking confirmed successfully. Chat is now available!');
      await fetchBookings();
      
      window.dispatchEvent(new Event('bookingConfirmed'));
    } catch (err) {
      console.error('confirm booking error', err);
      setError(err.response?.data?.message || 'Failed to confirm booking');
    }
  };

  
  const handleUpdateUserRole = async (userId, isAdmin) => {
    setError('');
    setSuccessMsg('');
    try {
      const res = await axios.patch(`/admin/users/${userId}/role`, { isAdmin });
      setSuccessMsg(res.data.message || `User ${isAdmin ? 'promoted to admin' : 'demoted to regular user'} successfully`);
      await fetchUsers();
    } catch (err) {
      console.error('update user role error', err);
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  // Render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your parking lots, bookings, and customer support</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg px-4 py-2">
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                <svg className="h-4 w-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Private Dashboard
              </p>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> You can only view and manage parking lots that you created. Other admins cannot modify your parking spaces.
            </p>
          </div>
        </header>

        {/* messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMsg}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Add parking form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Add New Parking Lot</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fill in the details to add a new parking location</p>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Parking Lot Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
                  placeholder="e.g., Downtown Parking Plaza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
                    placeholder="City name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price/Hour (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="price"
                    type="number"
                    min="1"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location / Address
                </label>
                <input
                  id="location"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
                  placeholder="Street address, landmark, etc."
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  id="capacity"
                  type="number"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
                  placeholder="Number of parking slots"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Latitude (optional)
                  </label>
                  <input
                    id="latitude"
                    type="number"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
                    placeholder="e.g., 28.6139"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Longitude (optional)
                  </label>
                  <input
                    id="longitude"
                    type="number"
                    step="any"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
                    placeholder="e.g., 77.2090"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="amenities" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amenities (comma separated)
                </label>
                <input
                  id="amenities"
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
                  placeholder="e.g., CCTV, Security, EV Charging"
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Separate multiple amenities with commas</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Parking Lot
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setName('');
                    setLocationText('');
                    setCity('');
                    setPrice('');
                    setCapacity('');
                    setAmenities('');
                    setLatitude('');
                    setLongitude('');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          {/* Parking lots list */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Parking Lots</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your parking locations (only your own)</p>
            </div>

            {loadingLots ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : parkingLots.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No parking lots yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add your first parking lot using the form on the left</p>
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">

                {parkingLots.map((lot) => (
                  <div key={lot._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition">
                    {editingId === lot._id ? (
                      <div className="space-y-3">
                        <input
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          value={editValues.name}
                          onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                          placeholder="Name"
                        />
                        <input
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          value={editValues.locationText}
                          onChange={(e) => setEditValues((v) => ({ ...v, locationText: e.target.value }))}
                          placeholder="Location"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={editValues.city}
                            onChange={(e) => setEditValues((v) => ({ ...v, city: e.target.value }))}
                            placeholder="City"
                          />
                          <input
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={editValues.pricePerHour}
                            onChange={(e) => setEditValues((v) => ({ ...v, pricePerHour: e.target.value }))}
                            placeholder="Price/hr"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={editValues.capacity}
                            onChange={(e) => setEditValues((v) => ({ ...v, capacity: e.target.value }))}
                            placeholder="Capacity"
                          />
                          <input
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={editValues.availableSlots}
                            onChange={(e) => setEditValues((v) => ({ ...v, availableSlots: e.target.value }))}
                            placeholder="Available Slots"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(lot._id)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">Save</button>
                          <button onClick={cancelEdit} className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-medium transition">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{lot.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {lot.city} • {lot.location || 'No address'}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Price/hr:</span>
                            <span className="font-semibold text-gray-900 dark:text-white ml-1">₹{lot.pricePerHour}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Slots:</span>
                            <span className={`font-semibold ml-1 ${
                              lot.availableSlots > 5 ? 'text-green-600 dark:text-green-400' :
                              lot.availableSlots > 0 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {lot.availableSlots}/{lot.capacity}
                            </span>
                          </div>
                        </div>
                        {lot.amenities && lot.amenities.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amenities:</p>
                            <div className="flex flex-wrap gap-1">
                              {lot.amenities.map((amenity, idx) => (
                                <span key={idx} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <button onClick={() => startEdit(lot)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition">Edit</button>
                          <button onClick={() => handleDeleteParking(lot._id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition">Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bookings */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Bookings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage bookings for your parking lots only</p>
          </div>
          {loadingBookings ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No bookings found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Bookings will appear here when customers make reservations</p>
            </div>
          ) : (
            <div className="space-y-4">

              {bookings.map((b) => {
                const statusConfig = {
                  confirmed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
                  pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300' },
                  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
                  completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' }
                };
                const config = statusConfig[b.status] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-300' };
                return (
                  <div key={b._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{b.parkingLot?.name || '—'}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className="font-medium">User:</span> {b.user?.name} ({b.user?.email})
                        </p>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div><span className="font-medium">Start:</span> {new Date(b.startTime).toLocaleString()}</div>
                          <div><span className="font-medium">End:</span> {new Date(b.endTime).toLocaleString()}</div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                        {b.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-600">
                      {b.status === 'pending' && (
                        <button 
                          onClick={() => handleConfirmBooking(b._id)} 
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                          Confirm Booking
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteBooking(b._id)} 
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* User Management */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Management</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage user roles and permissions</p>
          </div>
          {loadingUsers ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 dark:text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Joined</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{user.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isAdmin 
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                        }`}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {user.isAdmin ? (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to demote ${user.name} from admin?`)) {
                                handleUpdateUserRole(user._id, false);
                              }
                            }}
                            className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg font-medium transition"
                          >
                            Demote to User
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to promote ${user.name} to admin?`)) {
                                handleUpdateUserRole(user._id, true);
                              }
                            }}
                            className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
                          >
                            Promote to Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      <AdminChatsList token={localStorage.getItem('token')} />

      </div>
    </div>
  );
}
