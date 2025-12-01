// OAuth Helper Functions
// Handles Google and GitHub OAuth authentication

export const getOAuthUrlParams = () => {
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  return {
    accessToken: params.get('access_token'),
    tokenType: params.get('token_type'),
    expiresIn: params.get('expires_in')
  }
}

export const getOAuthCodeParams = () => {
  const search = window.location.search.substring(1)
  const params = new URLSearchParams(search)
  return {
    code: params.get('code'),
    state: params.get('state')
  }
}

// Fetch user info from Google using access token
export const fetchGoogleUserInfo = async (accessToken) => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    const data = await response.json()
    return {
      name: data.name,
      email: data.email,
      picture: data.picture,
      provider: 'google'
    }
  } catch (error) {
    console.error('Error fetching Google user info:', error)
    return null
  }
}

// Fetch user info from GitHub using access token
export const fetchGitHubUserInfo = async (accessToken) => {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })
    const data = await response.json()
    
    // Get email if profile doesn't have it public
    let email = data.email
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })
      const emails = await emailResponse.json()
      email = emails.find(e => e.primary)?.email || emails[0]?.email
    }

    return {
      name: data.name || data.login,
      email: email,
      avatar: data.avatar_url,
      provider: 'github'
    }
  } catch (error) {
    console.error('Error fetching GitHub user info:', error)
    return null
  }
}

// Store auth token in localStorage
export const storeAuthToken = (provider, token) => {
  try {
    localStorage.setItem(`rf_auth_${provider}`, JSON.stringify({
      token,
      timestamp: Date.now()
    }))
  } catch (e) {
    console.error('Error storing auth token:', e)
  }
}

// Retrieve stored auth token
export const getStoredAuthToken = (provider) => {
  try {
    const stored = localStorage.getItem(`rf_auth_${provider}`)
    return stored ? JSON.parse(stored).token : null
  } catch (e) {
    return null
  }
}

// Clear auth token
export const clearAuthToken = (provider) => {
  try {
    localStorage.removeItem(`rf_auth_${provider}`)
  } catch (e) {
    console.error('Error clearing auth token:', e)
  }
}
