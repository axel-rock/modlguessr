const files = import.meta.glob(['./*.md', './**/*.md'], {
	query: '?raw',
	eager: true,
}) as Record<string, { default: string }>

const prompts = Object.fromEntries(
	Object.entries(files).map(([path, content]) => [
		path.split('/').pop()?.replace('.md', ''),
		content.default,
	])
) as Record<string, string>

export default prompts
