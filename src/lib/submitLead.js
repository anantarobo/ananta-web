const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || ''

export async function submitLead(data) {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('YOUR_DEPLOYMENT_ID')) {
    throw new Error('Google Sheet is not connected. Set VITE_GOOGLE_SCRIPT_URL in .env')
  }

  const params = new URLSearchParams()
  Object.entries(data).forEach(([key, value]) => {
    params.append(key, String(value))
  })

  const response = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, {
    method: 'GET',
    redirect: 'follow',
  })

  const result = await response.json()

  if (!result.ok) {
    throw new Error(result.error || 'Could not save to Google Sheet.')
  }

  return result
}
