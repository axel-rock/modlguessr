<footer>
	<div class="grid">
		<div class="tools">
			<a href="/about">About</a>
			<a href="/blog">Devblog</a>
			<span>Source code:</span>
			<a href="https://github.com/axel-rock/modlguessr" target="_blank">
				<img src="/logo/github.svg" alt="GitHub" />
				<span>GitHub</span>
			</a>
		</div>
		<div class="tools">
			<span>Powered by:</span>
			<a href="https://svelte.dev/" target="_blank">
				<img src="/logo/svelte.svg" alt="Svelte" />
				<span>SvelteKit</span></a
			>
			<a href="https://convex.dev/referral/AXELRO9828" target="_blank">
				<img src="/logo/convex.svg" alt="Convex" />
				<span>Convex</span></a
			>
			<a href="https://www.better-auth.com/" target="_blank">
				<img src="/logo/better-auth.svg" alt="Better Auth" />
				<span>Better Auth</span></a
			>
			<a href="https://useautumn.com/" target="_blank">
				<img src="/logo/autumn.png" alt="Autumn" />
				<span>Autumn</span></a
			>
			<a href="https://vercel.com/" target="_blank">
				<img src="/logo/vercel.svg" alt="Vercel" />
				<span>Vercel AI</span></a
			>
		</div>
	</div>
</footer>

<style>
	footer {
		--icon-size: 1.75rem;
		--background-color: color-mix(in oklab, var(--grey-100) 50%, var(--grey-0));

		align-items: start;
		justify-content: space-evenly;
		gap: 1rem;
		position: relative;

		& > div.grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			width: 100%;
			max-width: var(--narrow-page);
			justify-self: center;

			& > div > * {
				display: grid;
				align-items: center;
				height: 2rem;
				font-size: 0.85rem;
			}
		}

		background-color: var(--background-color);

		a:has(img) {
			display: grid;
			grid-template-columns: var(--icon-size) 1fr;
			gap: 0.25rem;
			align-items: center;
			font-size: 1em;

			img {
				width: 100%;
				aspect-ratio: 1;
				object-fit: contain;
				justify-self: center;
			}

			&[href*='vercel'] img {
				scale: 0.66;
			}

			&[href*='github'] img {
				scale: 0.8;
			}

			@media (prefers-color-scheme: dark) {
				&:is([href*='vercel'], [href*='better-auth'], [href*='github']) img {
					filter: invert(1);
				}
			}
		}

		/**
		* Create "inverted" border radius effect
		*/
		&::before,
		&::after {
			--radius: 3rem;
			content: '';
			position: absolute;
			left: 0;
			right: 0;
			bottom: 100%;
			width: 100%;
			height: var(--radius);
			background-color: var(--background-color);
			z-index: -1;
		}

		&::after {
			border-bottom-left-radius: var(--radius);
			border-bottom-right-radius: var(--radius);
			background-color: var(--grey-0);
		}
	}
</style>
