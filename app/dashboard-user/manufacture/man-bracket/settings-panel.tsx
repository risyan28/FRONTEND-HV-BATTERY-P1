'use client'

import type React from 'react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import type { Destination } from '@/hooks/use-man-bracket'
import { DESTINATIONS } from './constants'

interface SettingsPanelProps {
  showSettings: boolean
  interlockOn: boolean
  manualDestination: Destination
  scanInputRef: React.RefObject<HTMLInputElement | null>
  setShowSettings: (value: boolean) => void
  handleToggleInterlock: (password: string) => Promise<void>
  handleSetManualDestination: (dest: Destination) => void
}

export function SettingsPanel({
  showSettings,
  interlockOn,
  manualDestination,
  scanInputRef,
  setShowSettings,
  handleToggleInterlock,
  handleSetManualDestination,
}: SettingsPanelProps): React.ReactElement {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const closePanel = () => {
    setShowSettings(false)
    scanInputRef.current?.focus()
  }

  const openPasswordModal = () => {
    setPasswordError('')
    setPassword('')
    setShowPasswordModal(true)
  }

  const submitPassword = async () => {
    const trimmedPassword = password.trim()
    if (!trimmedPassword) {
      setPasswordError('Password wajib diisi.')
      return
    }

    setIsSavingPassword(true)
    setPasswordError('')

    try {
      await handleToggleInterlock(trimmedPassword)
      setShowPasswordModal(false)
      setPassword('')
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : 'Password salah atau gagal menyimpan.',
      )
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <AnimatePresence>
      {showSettings && (
        <>
          <motion.div
            className='fixed inset-0 z-40 bg-black/40'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
          />
          <motion.div
            className='fixed top-0 left-0 h-full z-50 w-72 bg-white shadow-2xl flex flex-col'
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            <div className='flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50'>
              <div className='flex items-center gap-2'>
                <Settings className='w-5 h-5 text-slate-600' />
                <span className='font-black text-slate-800 text-lg'>
                  Settings
                </span>
              </div>
              <button
                onClick={closePanel}
                className='text-slate-400 hover:text-slate-700 text-2xl leading-none font-bold'
              >
                ×
              </button>
            </div>

            <div className='flex-1 px-5 py-6 space-y-6'>
              <div>
                <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-3'>
                  Interlock Mode
                </p>
                <button
                  onClick={openPasswordModal}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 font-black text-base transition-all ${
                    interlockOn
                      ? 'bg-green-50 border-green-500 text-green-800'
                      : 'bg-red-50 border-red-400 text-red-800'
                  }`}
                >
                  <span>INTERLOCK</span>
                  <span
                    className={`px-3 py-1 rounded-lg text-white text-sm ${
                      interlockOn ? 'bg-green-600' : 'bg-red-500'
                    }`}
                  >
                    {interlockOn ? 'ON' : 'OFF'}
                  </span>
                </button>
                <p className='text-xs text-slate-400 mt-2'>
                  {interlockOn
                    ? 'Destination is controlled by the system from the database.'
                    : 'Destination is selected manually by the operator.'}
                </p>
              </div>

              {!interlockOn && (
                <div>
                  <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-3'>
                    Destination
                  </p>
                  <div className='flex gap-2'>
                    {DESTINATIONS.map((dest) => (
                      <button
                        key={dest}
                        onClick={() => handleSetManualDestination(dest)}
                        className={`flex-1 py-4 rounded-xl font-black text-md transition-all ${
                          manualDestination === dest
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : 'bg-slate-100 text-slate-500 border-2 border-slate-300 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {dest}
                      </button>
                    ))}
                  </div>
                  <p className='text-xs text-slate-400 mt-2'>
                    Active:{' '}
                    <span className='font-bold text-slate-700'>
                      {manualDestination}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
            {showPasswordModal && (
              <motion.div
                className='fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className='w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl border border-slate-200'
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                >
                  <h3 className='text-3xl font-black text-slate-800'>
                    Enter Password
                  </h3>
                  <p className='mt-2 text-base text-slate-500'>
                    Password required to switch INTERLOCK mode.
                  </p>
                  <input
                    type='password'
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value)
                      setPasswordError('')
                    }}
                    className='mt-5 w-full rounded-2xl border border-slate-300 px-4 py-4 text-2xl font-semibold outline-none focus:border-blue-500'
                    placeholder='Enter password'
                    autoFocus
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        void submitPassword()
                      }
                    }}
                  />
                  {passwordError && (
                    <p className='mt-3 text-sm font-semibold text-red-600'>
                      {passwordError}
                    </p>
                  )}
                  <div className='mt-6 flex gap-3 justify-end'>
                    <button
                      type='button'
                      onClick={() => setShowPasswordModal(false)}
                      className='rounded-xl border border-slate-300 px-5 py-3 text-base font-bold text-slate-700 hover:bg-slate-50'
                    >
                      Cancel
                    </button>
                    <button
                      type='button'
                      onClick={() => void submitPassword()}
                      disabled={isSavingPassword}
                      className='rounded-xl bg-green-600 px-5 py-3 text-base font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300'
                    >
                      {isSavingPassword ? 'Saving...' : 'Confirm'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  )
}
