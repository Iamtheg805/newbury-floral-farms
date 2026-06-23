import { useEffect } from 'react'

export function useAuth(requiredRole?: 'manager' | 'rep') {
  useEffect(() => {
    const role = localStorage.getItem('user_role')
    const name = localStorage.getItem('user_name')

    if (!role || !name) {
      window.location.href = '/'
      return
    }

    if (requiredRole === 'manager' && role !== 'manager') {
      window.location.href = '/dashboard'
      return
    }
  }, [requiredRole])
}