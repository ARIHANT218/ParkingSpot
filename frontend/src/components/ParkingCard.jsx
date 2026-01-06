import { Link } from 'react-router-dom';

export default function ParkingCard({ lot }) {
  const availabilityColor = lot.availableSlots > 5 
    ? 'text-green-600 dark:text-green-400' 
    : lot.availableSlots > 0 
    ? 'text-yellow-600 dark:text-yellow-400' 
    : 'text-red-600 dark:text-red-400';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:scale-[1.02]">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{lot.name}</h2>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{lot.city}, {lot.location}</span>
            </div>
          </div>
          {lot.rating > 0 && (
            <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
              <svg className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">{lot.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Price per hour</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">₹{lot.pricePerHour}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Available slots</span>
            <span className={`text-lg font-bold ${availabilityColor}`}>
              {lot.availableSlots} / {lot.capacity}
            </span>
          </div>

          {lot.amenities && lot.amenities.length > 0 && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amenities:</p>
              <div className="flex flex-wrap gap-1">
                {lot.amenities.slice(0, 3).map((amenity, idx) => (
                  <span key={idx} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    {amenity}
                  </span>
                ))}
                {lot.amenities.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">+{lot.amenities.length - 3} more</span>
                )}
              </div>
            </div>
          )}
        </div>

        <Link 
          to={`/parking/${lot._id}`} 
          className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg text-center transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
