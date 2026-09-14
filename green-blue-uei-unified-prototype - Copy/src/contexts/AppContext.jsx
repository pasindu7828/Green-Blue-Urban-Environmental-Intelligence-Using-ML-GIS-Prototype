import { createContext, useContext, useMemo, useState } from 'react'

const AppContext = createContext(null)

const defaultProfile = {
  name: 'Planning Officer',
  role: 'UDA Planning Officer',
  organization: 'Urban Development Authority',
  email: 'planner@prototype.local',
  photo: ''
}

const seedNotifications = [
  { id: 1, title: 'Heat trend alert', body: 'Zone KD-0847 has entered an Intensifying trend.', time: '12 min ago', unread: true },
  { id: 2, title: 'Wetland review', body: 'Demo wetland W-04 is flagged for field verification.', time: '42 min ago', unread: true },
  { id: 3, title: 'River corridor watch', body: 'Built-up encroachment demo score increased in Section R-06.', time: '2 h ago', unread: false }
]

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(defaultProfile)
  const [notifications, setNotifications] = useState(seedNotifications)
  const [toast, setToast] = useState(null)
  const [assistantOpen, setAssistantOpen] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    window.setTimeout(() => setToast(null), 2800)
  }

  const markNotificationsRead = () => {
    setNotifications((items) => items.map((item) => ({ ...item, unread: false })))
  }

  const value = useMemo(() => ({
    profile,
    setProfile,
    notifications,
    setNotifications,
    markNotificationsRead,
    toast,
    showToast,
    assistantOpen,
    setAssistantOpen
  }), [profile, notifications, toast, assistantOpen])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
