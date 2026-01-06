export const extractErrorMessage = (error: any): string => {
  return (
    error?.response?.data?.Message ||
    error?.response?.data?.message ||
    error?.message ||
    'Unknown error'
  )
}

