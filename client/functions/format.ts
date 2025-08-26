export const formatDate = (date: string | null) => {
  if (!date) return date
  const dateObj = new Date(date)

  const formatted = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(dateObj)

  return formatted
}

export const formatLinks = (text: string) => {
  return text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match, linkText, url) =>
      `<a href="${url}" class="markdown-link" target="_blank" rel="noopener noreferrer">${linkText}</a>`,
  )
}
