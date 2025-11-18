const DEFAULT_PROD_API_URL = 'http://3.144.196.0:8000'
const DEFAULT_LOCAL_API_URL = 'http://localhost:8000'

const resolveApiBaseUrl = () => {
  const isBrowser = typeof window !== 'undefined'

  if (isBrowser) {
    const globalOverride = window.__RIFT_REWIND_CONFIG__?.apiBaseUrl
    if (globalOverride) {
      return globalOverride
    }

    const { hostname } = window.location
    const isLocalHost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]'

    if (isLocalHost) {
      return DEFAULT_LOCAL_API_URL
    }
  }

  return DEFAULT_PROD_API_URL
}

export const API_BASE_URL = resolveApiBaseUrl()

export const getApiBaseUrl = () => API_BASE_URL

