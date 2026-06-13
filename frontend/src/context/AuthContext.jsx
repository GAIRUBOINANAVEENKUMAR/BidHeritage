import { createContext, useContext, useState, useEffect } from 'react'
import API from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('bidheritage_token')
    const savedUser = localStorage.getItem('bidheritage_user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('bidheritage_token')
        localStorage.removeItem('bidheritage_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await API.post('/api/auth/login', { email, password })
    const { token: newToken, user: newUser } = res.data
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('bidheritage_token', newToken)
    localStorage.setItem('bidheritage_user', JSON.stringify(newUser))
    return res.data
  }

  const register = async (formData) => {
    const res = await API.post('/api/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const { token: newToken, user: newUser } = res.data
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('bidheritage_token', newToken)
    localStorage.setItem('bidheritage_user', JSON.stringify(newUser))
    return res.data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('bidheritage_token')
    localStorage.removeItem('bidheritage_user')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('bidheritage_user', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
