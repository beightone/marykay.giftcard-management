export const formatExpirationDate = (dateString: string): string => {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) {
    throw new Error(
      `Invalid expiration date format: ${dateString}. Expected ISO 8601 format.`
    )
  }

  return date.toISOString()
}

