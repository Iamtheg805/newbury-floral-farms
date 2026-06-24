import { useEffect, useState } from 'react'

export function useAuth(requiredRole?: 'manager' | 'rep') {
  const [checked, setChecked] = useState(false)

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

    setChecked(true)
  }, [requiredRole])

  return checked
}