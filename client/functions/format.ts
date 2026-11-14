export const formatDate = (date: string | null) => {
  if (!date) return date
  // PocketBase stores dates as "2021-10-02 00:00:00.000Z"; Safari needs the T.
  const dateObj = new Date(date.replace(' ', 'T'))

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
