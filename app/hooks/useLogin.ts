// hooks/useLogin.ts
'use client' // Pastikan ini hanya berjalan di client

import { useState } from 'react'
import { useNavigate } from 'react-router-dom' // Ganti dari next/router ke react-router

export function useLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const router = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username && password) {
      router('dashboard-user/manufacture')
    } else {
      alert('Please fill in both fields.')
    }
  }

  return {
    username,
    setUsername,
    password,
    setPassword,
    handleLogin,
  }
}
