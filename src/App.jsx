// import { useState } from 'react'
// import LoginForm from './components/LoginForm'
// import Dashboard from './components/Dashboard'
// import Form from './components/Form'


// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [user, setUser] = useState(null)

//   const handleLogin = (userData) => {
//     console.log('Login successful:', userData) // Debug log
//     setUser(userData)
//     setIsLoggedIn(true)
//   }

//   const handleLogout = () => {
//     console.log('Logout clicked') // Debug log
//     setUser(null)
//     setIsLoggedIn(false)
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {!isLoggedIn ? (
//         <LoginForm onLogin={handleLogin} />
//       ) : (
//         <Form/>
//       )}
//     </div>
//   )
// }

// export default App



// import { useState } from 'react'
// import LoginForm from './components/LoginForm'
// import Dashboard from './components/Dashboard'
// import Form from './components/Form'

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [user, setUser] = useState(null)
//   const [selectedLocation, setSelectedLocation] = useState(null)

//   const handleLogin = (userData) => {
//     console.log('Login successful:', userData)
//     setUser(userData)
//     setIsLoggedIn(true)
//   }

//   const handleLogout = () => {
//     console.log('Logout clicked')
//     setUser(null)
//     setIsLoggedIn(false)
//     setSelectedLocation(null)
//   }

//   const handleLocationSelect = (locationData) => {
//     console.log('Location selected:', locationData)
//     setSelectedLocation(locationData)
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {!isLoggedIn ? (
//         <LoginForm onLogin={handleLogin} />
//       ) : !selectedLocation ? (
//         <Dashboard 
//           user={user} 
//           onLogout={handleLogout}
//           onLocationSelect={handleLocationSelect}
//         />
//       ) : (
//         <Form 
//           user={user}
//           selectedLocation={selectedLocation}
//           onBack={() => setSelectedLocation(null)}
//           onLogout={handleLogout}
//         />
//       )}
//     </div>
//   )
// }

// export default App



// import { useState } from 'react'
// import LoginForm from './components/LoginForm'
// import Dashboard from './components/Dashboard'
// import CheckInTravel from './components/CheckInTravel'
// import Form from './components/Form'

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [user, setUser] = useState(null)
//   const [selectedLocation, setSelectedLocation] = useState(null)
//   const [showForm, setShowForm] = useState(false)
//   const [activeTravel, setActiveTravel] = useState(null)

//   const handleLogin = (userData) => {
//     console.log('Login successful:', userData)
//     setUser(userData)
//     setIsLoggedIn(true)
//   }

//   const handleLogout = () => {
//     console.log('Logout clicked')
//     setUser(null)
//     setIsLoggedIn(false)
//     setSelectedLocation(null)
//     setShowForm(false)
//     setActiveTravel(null)
//   }

//   const handleLocationSelect = (locationData) => {
//     console.log('Location selected:', locationData)
//     setSelectedLocation(locationData)
//   }

//   const handleStartForm = (travelData) => {
//     console.log('Starting form with travel data:', travelData)
//     setActiveTravel(travelData)
//     setShowForm(true)
//   }

//   const handleBackToTravel = () => {
//     setShowForm(false)
//     setActiveTravel(null)
//   }

//   const handleBackToLocationSelect = () => {
//     setSelectedLocation(null)
//     setShowForm(false)
//     setActiveTravel(null)
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
//       {!isLoggedIn ? (
//         <LoginForm onLogin={handleLogin} />
//       ) : !selectedLocation ? (
//         <Dashboard 
//           user={user} 
//           onLogout={handleLogout}
//           onLocationSelect={handleLocationSelect}
//         />
//       ) : showForm ? (
//         <Form 
//           user={user}
//           selectedLocation={selectedLocation}
//           activeTravel={activeTravel}
//           onBack={handleBackToTravel}
//           onLogout={handleLogout}
//         />
//       ) : (
//         <CheckInTravel
//           user={user}
//           selectedLocation={selectedLocation}
//           onBack={handleBackToLocationSelect}
//           onLogout={handleLogout}
//           onStartForm={handleStartForm}
//         />
//       )}
//     </div>
//   )
// }

// export default App



import { useState } from 'react'
import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import CheckInTravel from './components/CheckInTravel'
import Form from './components/Form'
import TravelHistory from './components/TravelHistory'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showTravelHistory, setShowTravelHistory] = useState(false)
  const [activeTravel, setActiveTravel] = useState(null)

  const handleLogin = (userData) => {
    console.log('Login successful:', userData)
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    console.log('Logout clicked')
    setUser(null)
    setIsLoggedIn(false)
    setSelectedLocation(null)
    setShowForm(false)
    setShowTravelHistory(false)
    setActiveTravel(null)
  }

  const handleLocationSelect = (locationData) => {
    console.log('Location selected:', locationData)
    setSelectedLocation(locationData)
  }

  const handleStartForm = (travelData) => {
    console.log('Starting form with travel data:', travelData)
    setActiveTravel(travelData)
    setShowForm(true)
  }

  const handleBackToTravel = (action) => {
    if (action === 'showTravelHistory') {
      // Show travel history after checkout
      setShowForm(false)
      setShowTravelHistory(true)
      setActiveTravel(null)
    } else {
      // Normal back to check-in/travel page
      setShowForm(false)
      setActiveTravel(null)
    }
  }

  const handleBackToLocationSelect = () => {
    setSelectedLocation(null)
    setShowForm(false)
    setShowTravelHistory(false)
    setActiveTravel(null)
  }

  const handleStartNewVisit = () => {
    setShowTravelHistory(false)
    setShowForm(false)
    setSelectedLocation(null)
    setActiveTravel(null)
  }

  const handleBackFromTravelHistory = () => {
    setShowTravelHistory(false)
    // Keep the selected location so user goes back to CheckInTravel
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {!isLoggedIn ? (
        <LoginForm onLogin={handleLogin} />
      ) : showTravelHistory ? (
        <TravelHistory
          user={user}
          onBack={handleBackFromTravelHistory}
          onLogout={handleLogout}
          onStartNewVisit={handleStartNewVisit}
        />
      ) : !selectedLocation ? (
        <Dashboard 
          user={user} 
          onLogout={handleLogout}
          onLocationSelect={handleLocationSelect}
        />
      ) : showForm ? (
        <Form 
          user={user}
          selectedLocation={selectedLocation}
          activeTravel={activeTravel}
          onBack={handleBackToTravel}
          onLogout={handleLogout}
        />
      ) : (
        <CheckInTravel
          user={user}
          selectedLocation={selectedLocation}
          onBack={handleBackToLocationSelect}
          onLogout={handleLogout}
          onStartForm={handleStartForm}
        />
      )}
    </div>
  )
}

export default App