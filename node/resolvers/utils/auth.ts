export const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString()
        .split('')
        .map(c => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export const getAuthorEmail = (context: {
  vtex: { adminUserAuthToken?: string; authToken?: string }
}): string => {
  const token = context.vtex.adminUserAuthToken || context.vtex.authToken || ''
  const decoded = decodeJWT(token)
  return decoded?.sub || decoded?.email || 'unknown@vtex.com'
}

