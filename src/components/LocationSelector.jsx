// import { useState } from 'react'

// const LocationSelector = ({ onBack, onLocationSelect, user, currentLocation }) => {
//   const [selectedCategory, setSelectedCategory] = useState(null) // 'Farm Visit' or 'Ho Visit'
//   const [selectedLocation, setSelectedLocation] = useState('')

//   // Main categories
//   const categories = [
//     { name: 'Farm Visit', emoji: '🚜', color: 'green' },
//     { name: 'Ho Visit', emoji: '🏥', color: 'blue' }
//   ]

//   // Location data for each category
//   const locationData = {
//     'Farm Visit': [
//       { name: 'Green Valley Farm', address: 'Rural Road 123, Farmville', type: 'Organic Farm' },
//       { name: 'Sunny Acres Farm', address: 'Highway 45, Countryside', type: 'Dairy Farm' },
//       { name: 'Happy Harvest Farm', address: 'Farm Lane 78, Village East', type: 'Vegetable Farm' },
//       { name: 'Golden Fields Farm', address: 'Country Route 12, Meadowland', type: 'Grain Farm' },
//       { name: 'Fresh Valley Farm', address: 'Green Road 56, Hillside', type: 'Fruit Farm' },
//       { name: 'Morning Dew Farm', address: 'Sunrise Avenue 34, Farmtown', type: 'Mixed Farm' }
//     ],
//     'Ho Visit': [
//       { name: 'City General Hospital', address: '123 Main Street, Downtown', type: 'Multi-specialty Hospital' },
//       { name: 'Green Park Medical Center', address: '456 Park Avenue, Midtown', type: 'Medical Center' },
//       { name: 'Sunshine Clinic', address: '789 Health Street, Suburb', type: 'Primary Care Clinic' },
//       { name: 'Metro Heart Institute', address: '321 Cardiac Lane, Medical District', type: 'Cardiac Specialty' },
//       { name: 'Children\'s Care Hospital', address: '654 Kids Avenue, Family Zone', type: 'Pediatric Hospital' },
//       { name: 'Wellness Home Care', address: '987 Home Street, Residential Area', type: 'Home Care Service' }
//     ]
//   }

//   const handleCategorySelect = (category) => {
//     setSelectedCategory(category)
//   }

//   const handleLocationSelect = (location) => {
//     setSelectedLocation(location.name)
//     // Call the parent callback with full location info
//     if (onLocationSelect) {
//       onLocationSelect(`${selectedCategory} - ${location.name}`)
//     }
//     // Show confirmation
//     alert(`Selected: ${selectedCategory} - ${location.name}`)
//   }

//   const handleBackToCategories = () => {
//     setSelectedCategory(null)
//     setSelectedLocation('')
//   }

//   const getColorClasses = (color) => {
//     const colorMap = {
//       green: 'border-green-500 bg-green-50 hover:bg-green-100',
//       blue: 'border-blue-500 bg-blue-50 hover:bg-blue-100'
//     }
//     return colorMap[color] || 'border-gray-500 bg-gray-50 hover:bg-gray-100'
//   }

//   return (
//     <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
//       <div className="max-w-2xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl p-8">
          
//           {/* Header */}
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 {!selectedCategory ? 'Select Visit Type' : `${selectedCategory} Locations`}
//               </h1>
//               <p className="text-gray-600">
//                 {!selectedCategory ? 'Choose the type of visit' : 'Select a specific location'}
//               </p>
//             </div>
//             <button
//               onClick={selectedCategory ? handleBackToCategories : onBack}
//               className="text-gray-500 hover:text-gray-700 p-2 rounded-lg transition-colors hover:bg-gray-100"
//             >
//               ← Back
//             </button>
//           </div>

//           {/* Breadcrumb */}
//           {selectedCategory && (
//             <div className="mb-6 text-sm text-gray-600">
//               <span className="cursor-pointer hover:text-blue-600" onClick={handleBackToCategories}>
//                 Visit Types
//               </span>
//               <span className="mx-2">→</span>
//               <span className="font-medium text-gray-900">{selectedCategory}</span>
//             </div>
//           )}

//           {/* Category Selection */}
//           {!selectedCategory ? (
//             <div className="grid gap-4">
//               {categories.map((category, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleCategorySelect(category.name)}
//                   className="w-full text-left p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
//                 >
//                   <div className="flex items-center">
//                     <span className="text-3xl mr-4">{category.emoji}</span>
//                     <div>
//                       <span className="font-semibold text-gray-900 text-lg block">{category.name}</span>
//                       <span className="text-gray-600 text-sm">
//                         {locationData[category.name].length} locations available
//                       </span>
//                     </div>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           ) : (
//             /* Location List */
//             <div className="space-y-3 max-h-96 overflow-y-auto">
//               {locationData[selectedCategory].map((location, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleLocationSelect(location)}
//                   className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 hover:shadow-md"
//                 >
//                   <div className="flex items-start">
//                     <span className="text-xl mr-3 mt-1">📍</span>
//                     <div className="flex-1">
//                       <div className="font-medium text-gray-900 mb-1">{location.name}</div>
//                       <div className="text-sm text-gray-600 mb-1">{location.address}</div>
//                       <div className="text-xs text-blue-600 font-medium">{location.type}</div>
//                     </div>
//                   </div>
//                 </button>
//               ))}
//             </div>
//           )}

//           {/* Footer Info */}
//           <div className="mt-6 pt-4 border-t border-gray-200">
//             <p className="text-sm text-gray-500 text-center">
//               {!selectedCategory 
//                 ? "Select a visit type to see available locations"
//                 : `Showing ${locationData[selectedCategory].length} ${selectedCategory.toLowerCase()} locations`
//               }
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default LocationSelector



import { useState, useEffect } from 'react'

const LocationSelector = ({ onBack, onLocationSelect, user }) => {
  const [locations, setLocations] = useState([])
  const [farms, setFarms] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [farmLoading, setFarmLoading] = useState(false)

  const baseUrl = 'http://localhost:3002'
  const employeeId = '10001020' // You can get this from user data later

  // Fetch locations on component mount
  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${baseUrl}/api/doctor/doc-locations`)
      const result = await response.json()
      
      if (result.success && Array.isArray(result.data)) {
        setLocations(result.data.filter(location => location.isActiveLocation))
      } else {
        setLocations([])
      }
    } catch (err) {
      setError('Failed to fetch locations')
      console.error('Locations API Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFarms = async () => {
    try {
      setFarmLoading(true)
      const response = await fetch(`${baseUrl}/api/doctor/doc-emp-farms?EmployeeId=${employeeId}`)
      const result = await response.json()
      
      if (result.success && Array.isArray(result.data)) {
        setFarms(result.data.filter(farm => farm.isActive))
      } else {
        setFarms([])
      }
    } catch (err) {
      setError('Failed to fetch farms')
      console.error('Farms API Error:', err)
    } finally {
      setFarmLoading(false)
    }
  }

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
    if (location.LocationName === 'Farm Visit') {
      fetchFarms()
    }
  }

  const handleFarmSelect = (farm) => {
    const locationData = {
      locationType: selectedLocation.LocationName,
      locationId: selectedLocation.LocationId,
      farmData: farm,
      employeeId: employeeId
    }
    onLocationSelect(locationData)
  }

  const handleHoVisitSelect = () => {
    const locationData = {
      locationType: selectedLocation.LocationName,
      locationId: selectedLocation.LocationId,
      employeeId: employeeId
    }
    onLocationSelect(locationData)
  }

  const handleBackToLocations = () => {
    setSelectedLocation(null)
    setFarms([])
    setError(null)
  }

  const getLocationIcon = (locationName) => {
    switch (locationName) {
      case 'Farm Visit':
        return '🚜'
      case 'HO Visit':
        return '🏥'
      default:
        return '📍'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <span className="text-red-500 text-xl mr-2">⚠️</span>
            <p className="text-red-700">{error}</p>
          </div>
          <button 
            onClick={fetchLocations}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {!selectedLocation ? 'Select Visit Type' : 
                 selectedLocation.LocationName === 'Farm Visit' ? 'Select Farm' : 
                 'Confirm Location'}
              </h1>
              <p className="text-gray-600">
                {!selectedLocation ? 'Choose the type of visit' : 
                 selectedLocation.LocationName === 'Farm Visit' ? 'Select your assigned farm' :
                 'Proceed with HO visit'}
              </p>
            </div>
            <button
              onClick={selectedLocation ? handleBackToLocations : onBack}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg transition-colors hover:bg-gray-100"
            >
              ← Back
            </button>
          </div>

          {/* Breadcrumb */}
          {selectedLocation && (
            <div className="mb-6 text-sm text-gray-600">
              <span className="cursor-pointer hover:text-blue-600" onClick={handleBackToLocations}>
                Visit Types
              </span>
              <span className="mx-2">→</span>
              <span className="font-medium text-gray-900">{selectedLocation.LocationName}</span>
            </div>
          )}

          {/* Location Selection */}
          {!selectedLocation ? (
            <div className="grid gap-4">
              {locations.length > 0 ? (
                locations.map((location) => (
                  <button
                    key={location.LocationId}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full text-left p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                  >
                    <div className="flex items-center">
                      <span className="text-3xl mr-4">{getLocationIcon(location.LocationName)}</span>
                      <div>
                        <span className="font-semibold text-gray-900 text-lg block">{location.LocationName}</span>
                        <span className="text-gray-600 text-sm">
                          {location.LocationName === 'Farm Visit' ? 'Visit assigned farms' : 'Head office visit'}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">📍</span>
                  <p>No locations available</p>
                </div>
              )}
            </div>
          ) : selectedLocation.LocationName === 'Farm Visit' ? (
            /* Farm List for Farm Visit */
            <div className="space-y-3">
              {farmLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your assigned farms...</p>
                </div>
              ) : farms.length > 0 ? (
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {farms.map((farmData, index) => (
                    <button
                      key={index}
                      onClick={() => handleFarmSelect(farmData)}
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200 hover:shadow-md"
                    >
                      <div className="flex items-start">
                        {/* <span className="text-xl mr-3 mt-1">🚜</span> */}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 mb-1">{farmData.farm.FarmName}</div>
                          {/* <div className="text-sm text-gray-600 mb-1">
                            Employee: {farmData.employee.EmployeeName}
                          </div> */}
                          {/* <div className="text-sm text-gray-600 mb-1">
                            Phone: {farmData.employee.EmployeePhone}
                          </div> */}
                          {/* <div className="text-xs text-green-600 font-medium">Farm ID: {farmData.FarmId}</div> */}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">🚜</span>
                  <p>No farms assigned to you</p>
                  <p className="text-sm mt-2">Contact your administrator for farm assignments</p>
                </div>
              )}
            </div>
          ) : (
            /* HO Visit Confirmation */
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">🏥</span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">HO Visit</h3>
              <p className="text-gray-600 mb-6">You've selected to proceed with a Head Office visit</p>
              <button
                onClick={handleHoVisitSelect}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Proceed with HO Visit
              </button>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              {!selectedLocation 
                ? `Showing ${locations.length} visit types available`
                : selectedLocation.LocationName === 'Farm Visit'
                ? `Employee ID: ${employeeId} • ${farms.length} farms assigned`
                : "Ready to proceed with HO visit"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationSelector