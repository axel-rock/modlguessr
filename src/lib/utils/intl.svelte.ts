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
