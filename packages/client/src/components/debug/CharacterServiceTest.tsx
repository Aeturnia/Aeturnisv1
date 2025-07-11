import { useState } from 'react'
import { useCharacter } from '../../hooks/useServices'
import { testLogin, isAuthenticated, logout } from '../../utils/auth-helper'

export function CharacterServiceTest() {
  const [isVisible, setIsVisible] = useState(false)
  const [authStatus, setAuthStatus] = useState(isAuthenticated())
  const [loginError, setLoginError] = useState<string | null>(null)
  const { 
    currentCharacter, 
    characterList, 
    isLoading, 
    error, 
    getCharacters,
    getCharacter,
    service 
  } = useCharacter()

  const handleLogin = async () => {
    setLoginError(null)
    try {
      await testLogin()
      setAuthStatus(true)
      console.log('Login successful')
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed')
      console.error('Login error:', err)
    }
  }

  const handleLogout = () => {
    logout()
    setAuthStatus(false)
    console.log('Logged out')
  }

  const testConnection = async () => {
    console.log('Testing CharacterService connection...')
    console.log('Auth status:', authStatus)
    
    if (!authStatus) {
      console.error('Not authenticated. Please login first.')
      return
    }
    
    try {
      // Test getting all characters
      const characters = await getCharacters()
      console.log('GetCharacters response:', characters)
      
      // If we have characters, test getting a specific one
      if (characters && characters.length > 0) {
        const character = await getCharacter(characters[0].id)
        console.log('GetCharacter response:', character)
      }
      
      console.log('Current state:', {
        currentCharacter,
        characterList: characterList ? Array.from(characterList.values()) : [],
        isLoading,
        error
      })
    } catch (err) {
      console.error('Test failed:', err)
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-24 z-[9999] bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm"
      >
        Test Character Service
      </button>
    )
  }

  return (
    <div className="fixed bottom-20 left-4 z-[9999] bg-gray-900 text-white rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">Character Service Test</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm">
        {/* Auth Controls */}
        <div className="bg-gray-800 p-2 rounded">
          <h4 className="font-medium mb-1">Authentication</h4>
          <div className="text-xs space-y-1">
            <div>Status: {authStatus ? 'Authenticated' : 'Not authenticated'}</div>
            {loginError && <div className="text-red-400">Error: {loginError}</div>}
          </div>
          <div className="mt-2 flex gap-2">
            {!authStatus ? (
              <button
                onClick={handleLogin}
                className="flex-1 py-1 px-2 bg-green-600 hover:bg-green-700 rounded text-xs"
              >
                Login (test@example.com)
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="flex-1 py-1 px-2 bg-red-600 hover:bg-red-700 rounded text-xs"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        <button
          onClick={testConnection}
          className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!authStatus}
        >
          Test Connection
        </button>

        {/* Service Status */}
        <div className="bg-gray-800 p-2 rounded">
          <h4 className="font-medium mb-1">Service Status</h4>
          <div className="text-xs space-y-1">
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            <div>Error: {error ? error.message : 'None'}</div>
            <div>Characters Loaded: {characterList ? characterList.size : 0}</div>
          </div>
        </div>

        {/* Current Character */}
        {currentCharacter && (
          <div className="bg-gray-800 p-2 rounded">
            <h4 className="font-medium mb-1">Current Character</h4>
            <div className="text-xs space-y-1">
              <div>Name: {currentCharacter.name}</div>
              <div>Level: {currentCharacter.level}</div>
              <div>Race: {currentCharacter.race}</div>
              <div>Class: {currentCharacter.class}</div>
            </div>
          </div>
        )}

        {/* Character List */}
        {characterList && characterList.size > 0 && (
          <div className="bg-gray-800 p-2 rounded">
            <h4 className="font-medium mb-1">All Characters</h4>
            <div className="text-xs space-y-1">
              {Array.from(characterList.values()).map(char => (
                <div key={char.id} className="border-b border-gray-700 pb-1">
                  {char.name} - Lvl {char.level} {char.race} {char.class}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Response Log */}
        <div className="bg-gray-800 p-2 rounded">
          <h4 className="font-medium mb-1">Console Log</h4>
          <div className="text-xs text-gray-400">
            Check browser console for detailed API responses
          </div>
        </div>
      </div>
    </div>
  )
}