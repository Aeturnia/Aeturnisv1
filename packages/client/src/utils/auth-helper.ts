/**
 * Temporary authentication helper for testing
 * In production, this would be handled by a proper auth service
 */

export async function testLogin(email: string = 'test@example.com', password: string = 'Test123!@#') {
  try {
    const response = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emailOrUsername: email, password }),
    })

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.data?.accessToken) {
      localStorage.setItem('access_token', data.data.accessToken)
      if (data.data.refreshToken) {
        localStorage.setItem('refresh_token', data.data.refreshToken)
      }
      console.log('Login successful, tokens stored')
      return data.data
    } else {
      throw new Error('No access token received')
    }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('access_token')
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  console.log('Logged out, tokens removed')
}