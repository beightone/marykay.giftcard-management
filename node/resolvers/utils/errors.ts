const safeStringify = (obj: any): string => {
  if (obj === null || obj === undefined) {
    return String(obj)
  }

  if (typeof obj !== 'object') {
    return String(obj)
  }

  if (obj instanceof Error) {
    return obj.message || 'Error'
  }

  try {
    const seen = new WeakSet()
    const replacer = (_key: string, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]'
        }
        seen.add(value)
      }
      if (value instanceof Error) {
        return value.message
      }
      if (value && typeof value === 'object' && ('req' in value || 'res' in value || 'request' in value || 'response' in value)) {
        return '[HTTP Object]'
      }
      return value
    }
    return JSON.stringify(obj, replacer, 2)
  } catch {
    return '[Unable to stringify]'
  }
}

export const extractErrorMessage = (error: any): string => {
  if (!error) {
    return 'Unknown error'
  }

  if (error?.response?.data) {
    const data = error.response.data
    
    if (data.Message) return data.Message
    if (data.message) return data.message
    if (data.error) return data.error
    if (typeof data === 'string') return data
    
    try {
      return safeStringify(data)
    } catch {
      return 'Error parsing response data'
    }
  }
  
  if (error?.response?.statusText) {
    return `${error.response.status} ${error.response.statusText}`
  }
  
  if (error?.message) {
    const msg = String(error.message)
    if (msg.includes('circular') || msg.includes('Circular')) {
      return `HTTP error: ${error?.response?.status || error?.status || 500}`
    }
    return msg
  }
  
  return 'Unknown error'
}

export const extractErrorDetails = (error: any) => {
  const errorResponse = error?.response?.data || {}
  
  let errorMessage = 
    errorResponse?.Message || 
    errorResponse?.message || 
    errorResponse?.error || 
    errorResponse?.Error ||
    null

  if (!errorMessage && typeof errorResponse === 'string') {
    errorMessage = errorResponse
  }

  if (!errorMessage && error?.message) {
    const msg = String(error.message)
    if (!msg.includes('circular') && !msg.includes('Circular')) {
      errorMessage = msg
    }
  }

  if (!errorMessage) {
    errorMessage = `MasterData error: ${error?.response?.status || error?.status || 400}`
  }

  return {
    message: String(errorMessage),
    status: error?.response?.status || error?.status || 400,
    responseData: errorResponse,
  }
}

