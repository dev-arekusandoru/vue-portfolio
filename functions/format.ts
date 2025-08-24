export const formatDate = (date: string | null) => {
  if (!date) return date
  const dateObj = new Date(date)

  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(dateObj)

  return formatted
}
