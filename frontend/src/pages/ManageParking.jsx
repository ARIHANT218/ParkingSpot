import React, { useState, useEffect } from 'react';
import { getParkingLots, createParkingLot, updateParkingLot, deleteParkingLot } from '../services/api';

const ManageParking = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLot, setCurrentLot] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    totalSpots: '',
    pricePerHour: '',
  });

  const fetchParkingLots = async () => {
    setIsLoading(true);
    try {
      const { data } = await getParkingLots();
      setParkingLots(data);
    } catch (err) {
      setError('Failed to fetch parking lots.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParkingLots();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const openModalForCreate = () => {
    setIsEditing(false);
    setFormData({ name: '', location: '', totalSpots: '', pricePerHour: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (lot) => {
    setIsEditing(true);
    setCurrentLot(lot);
    setFormData({
        name: lot.name,
        location: lot.location,
        totalSpots: lot.totalSpots,
        pricePerHour: lot.pricePerHour
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const lotData = { ...formData, totalSpots: Number(formData.totalSpots), pricePerHour: Number(formData.pricePerHour) };
    
    try {
      if (isEditing) {
        await updateParkingLot(currentLot._id, lotData);
      } else {
        await createParkingLot(lotData);
      }
      fetchParkingLots();
      setIsModalOpen(false);
    } catch (err) {
      setError(isEditing ? 'Failed to update lot.' : 'Failed to create lot.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this parking lot?')) {
        try {
            await deleteParkingLot(id);
            fetchParkingLots();
        } catch (err) {
            setError('Failed to delete lot.');
        }
    }
  };


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Parking Lots</h1>
        <button onClick={openModalForCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300">
          + Add New Lot
        </button>
      </div>

      {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-md mb-4">{error}</p>}
      
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left text-gray-300">
          <thead className="bg-gray-700 text-xs text-gray-400 uppercase">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Location</th>
              <th className="px-6 py-3">Total Spots</th>
              <th className="px-6 py-3">Price/Hour</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
            ) : parkingLots.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4">No parking lots found.</td></tr>
            ) : (
              parkingLots.map(lot => (
                <tr key={lot._id} className="border-b border-gray-700 hover:bg-gray-700/50">
                  <td className="px-6 py-4 font-medium text-white">{lot.name}</td>
                  <td className="px-6 py-4">{lot.location}</td>
                  <td className="px-6 py-4">{lot.totalSpots}</td>
                  <td className="px-6 py-4">${lot.pricePerHour.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => openModalForEdit(lot)} className="text-indigo-400 hover:text-indigo-300 mr-4">Edit</button>
                    <button onClick={() => handleDelete(lot._id)} className="text-red-500 hover:text-red-400">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-lg text-white">
                <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Parking Lot' : 'Add New Parking Lot'}</h2>
                <form onSubmit={handleFormSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleInputChange} required className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Total Spots</label>
                        <input type="number" name="totalSpots" value={formData.totalSpots} onChange={handleInputChange} required className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-400 mb-2">Price Per Hour ($)</label>
                        <input type="number" step="0.01" name="pricePerHour" value={formData.pricePerHour} onChange={handleInputChange} required className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md">{isEditing ? 'Save Changes' : 'Create Lot'}</button>
                    </div>
                </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default ManageParking;
