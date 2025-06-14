// import { useState } from 'react'
// import LocationSelector from './LocationSelector'

// const Dashboard = ({ user, onLogout }) => {
//   const [showLocationSelector, setShowLocationSelector] = useState(false)

//   return (
//     <div className="min-h-screen">
//       {!showLocationSelector ? (
//         <div className="flex items-center justify-center min-h-screen px-4">
//           <div className="text-center">
//             <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
//               <div className="mb-6">
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                   Welcome, {user.username}!
//                 </h1>
//                 <p className="text-gray-600">Ready to select your location?</p>
//               </div>
              
//               <button
//                 onClick={() => setShowLocationSelector(true)}
//                 className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
//               >
//                 📍 Select Location
//               </button>
              
//               <button
//                 onClick={onLogout}
//                 className="w-full mt-4 text-gray-500 hover:text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <LocationSelector 
//           onBack={() => setShowLocationSelector(false)}
//           user={user}
//         />
//       )}
//     </div>
//   )
// }

// export default Dashboard



import { useState } from 'react'
import LocationSelector from './LocationSelector'

const Dashboard = ({ user, onLogout, onLocationSelect }) => {
  const [showLocationSelector, setShowLocationSelector] = useState(false)

  const handleLocationSelect = (locationData) => {
    onLocationSelect(locationData)
  }

  return (
    <div className="min-h-screen">
      {!showLocationSelector ? (
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome, Shikhar!
                </h1>
                <p className="text-gray-600">Ready to select your location?</p>
              </div>
              
              <button
                onClick={() => setShowLocationSelector(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                📍 Select Location
              </button>
              
              <button
                onClick={onLogout}
                className="w-full mt-4 text-gray-500 hover:text-gray-700 py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : (
        <LocationSelector 
          onBack={() => setShowLocationSelector(false)}
          onLocationSelect={handleLocationSelect}
          user={user}
        />
      )}
    </div>
  )
}

export default Dashboard