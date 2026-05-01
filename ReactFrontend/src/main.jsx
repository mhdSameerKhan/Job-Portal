import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// FontAwesome setup
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faUserCheck, 
  faBriefcase, 
  faLocationDot, 
  faClock, 
  faMoneyBillWave,
  faBell,
  faMessage,
  faUser
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faUserCheck, 
  faBriefcase, 
  faLocationDot, 
  faClock, 
  faMoneyBillWave,
  faBell,
  faMessage,
  faUser
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
