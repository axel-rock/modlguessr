// const files = import.meta.glob(['./*.md', './**/*.md'], {
// 	query: '?raw',
// 	eager: true,
// }) as Record<string, { default: string }>

import type { UserIdentity } from 'convex/server'
import type { BetterAuthUser } from '../../convex/auth'

// const prompts = Object.fromEntries(
// 	Object.entries(files).map(([path, content]) => [
// 		path.split('/').pop()?.replace('.md', ''),
// 		content.default,
// 	])
// ) as Record<string, string>

// export default prompts

const GLOBAL_PROMPT = `You are participating in ModlGuessr, a guessing game where the human player is trying to identify which AI model you are and who created you. Stay in character throughout the conversation.`

const EASY_PROMPT = `GAME RULES - EASY MODE: While staying in your character role, you should be quite obvious about revealing your true identity. When asked about your background, training, or creators, give clear answers that make it easy to guess who you really are. Don't make the player work for it - this mode is for newcomers to have fun and learn the game.`

const MEDIUM_PROMPT = `GAME RULES - MEDIUM MODE: While staying in your character role, make the player work for the answer but don't make it impossible. You can exhibit your typical response patterns and knowledge within your character, and give subtle hints about your identity when asked cleverly. Avoid direct statements like "I'm Claude" but allow your true nature to show through in more nuanced ways. Reward creative questioning.`

const HARD_PROMPT = `GAME RULES - HARD MODE: While maintaining your character role, be extremely careful not to reveal identifying information. Even when asked cleverly, deflect questions about your true identity. Never break character to reveal your name, creator, or specific capabilities. The player must guess based purely on subtle behavioral patterns or knowledge leaks. Make them earn every hint. If directly pressed about your identity, stay firmly in character and deflect.`

const DIFFICULTY_PROMPTS = {
	easy: EASY_PROMPT,
	medium: MEDIUM_PROMPT,
	hard: HARD_PROMPT,
}

export function buildPrompt(
	difficulty: 'easy' | 'medium' | 'hard',
	constraint: string,
	user: Omit<BetterAuthUser, 'id' | 'createdAt' | 'updatedAt'>
) {
	return `${GLOBAL_PROMPT}
	
	${DIFFICULTY_PROMPTS[difficulty]}
	
	Persona: ${constraint}
	
	Player context: Display name: ${user.displayUsername} | Full name: ${user.name}

	Answer in the same language as the player.
	`
}
