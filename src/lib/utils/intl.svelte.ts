export function formatDateAbsolute(date: Date | string | number) {
	if (!(date instanceof Date)) date = new Date(date)
	const today = new Date()
	if (date.getFullYear() === today.getFullYear()) {
		return Intl.DateTimeFormat(undefined, {
			month: 'short',
			day: '2-digit',
			hour: 'numeric',
			minute: 'numeric',
		}).format(date)
	}
	return Intl.DateTimeFormat(undefined, {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
	}).format(date)
}

export function formatDateRelative(date: Date | string | number) {
	if (!(date instanceof Date)) date = new Date(date)

	const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

	// Less than 24 hours ago
	const hoursPast = ~~((date.getTime() - Date.now()) / (1000 * 60 * 60))
	if (Math.abs(hoursPast) < 24) {
		const seconds = ~~(date.getTime() / 1000) - ~~(Date.now() / 1000)
		const minutes = ~~(seconds / 60)
		const hours = ~~(minutes / 60)

		// If over an hour ago
		if (hours < 0 || hours > 0) {
			return relative.format(~~hours, 'hour')
		}
		// If over a minute ago
		if (minutes < 0 || minutes > 0) {
			return relative.format(~~minutes, 'minute')
		}
		// If less than a minute ago
		return relative.format(~~seconds, 'second')
	}

	// Calculate days difference
	const daysDiff = ~~((Math.floor(date.getTime()) - Math.floor(Date.now())) / (1000 * 60 * 60 * 24))

	// If more than 365 days, show in years
	if (Math.abs(daysDiff) >= 365) {
		return relative.format(~~(daysDiff / 365), 'year')
	}

	// If more than 30 days, show in months
	if (Math.abs(daysDiff) >= 30) {
		return relative.format(~~(daysDiff / 30), 'month')
	}

	// Otherwise show in days
	return relative.format(daysDiff, 'day')
}

export const formatPrice = (
	price: number,
	currency: string = 'usd',
	minimumFractionDigits = 2,
	locale?: string
) => {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
		minimumFractionDigits,
	}).format(price)
}
