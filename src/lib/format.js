export function localeFromLanguage(language) {
  return language === 'ar' ? 'ar-SD' : 'en-SD'
}

export function formatNumber(value, language = 'en') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—'
  }

  return new Intl.NumberFormat(localeFromLanguage(language)).format(
    Number(value)
  )
}

export function formatPrice(value, language = 'en') {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return new Intl.NumberFormat(localeFromLanguage(language), {
    style: 'currency',
    currency: 'SDG',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export function formatDate(value, language = 'en') {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(localeFromLanguage(language), {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function initials(firstName, lastName) {
  const letters = [firstName, lastName]
    .filter(Boolean)
    .map((part) => part.trim().charAt(0).toUpperCase())

  return letters.join('') || '?'
}

export function formatPhone(phone) {
  if (!phone) {
    return '—'
  }
  return phone.replace(/^\+249/, '+249 ')
}
