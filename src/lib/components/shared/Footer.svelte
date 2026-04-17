<script lang="ts">
	import PlaySquare from '@lucide/svelte/icons/play-square';
</script>

<footer class="bg-card/50 border-t border-border mt-20">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
			<!-- Brand -->
			<div class="col-span-1 sm:col-span-2 md:col-span-1">
				<div class="flex items-center gap-2.5 mb-4">
					<div class="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/30">
						<PlaySquare class="w-5 h-5 text-primary-foreground" />
					</div>
					<span class="text-xl font-bold text-foreground">Apsara Entertainment</span>
				</div>
				<p class="text-muted-foreground text-sm leading-relaxed max-w-xs">
					Your premium streaming destination. Watch movies and series anytime, anywhere.
				</p>
				<div class="mt-4 space-y-1">
					<a href="mailto:apsaraentertainmentott@gmail.com" class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
						<span>✉️</span> apsaraentertainmentott@gmail.com
					</a>
					<a href="tel:+919744958809" class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
						<span>📞</span> +91 97449 58809
					</a>
				</div>
			</div>

			<!-- Browse -->
			<div>
				<h3 class="text-sm font-semibold text-foreground mb-3">Browse</h3>
				<ul class="space-y-2">
					{#each [['/', 'Home'], ['/movies', 'Movies'], ['/series', 'Series'], ['/pricing', 'Pricing']] as [href, label]}
						<li>
							<a href={href} class="text-sm text-muted-foreground hover:text-foreground transition-colors">
								{label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Account -->
			<div>
				<h3 class="text-sm font-semibold text-foreground mb-3">Account</h3>
				<ul class="space-y-2">
					{#each [['/profile', 'Profile'], ['/profile/watchlist', 'Watchlist'], ['/profile/history', 'Watch History'], ['/profile/subscription', 'Subscription']] as [href, label]}
						<li>
							<a href={href} class="text-sm text-muted-foreground hover:text-foreground transition-colors">
								{label}
							</a>
						</li>
					{/each}
				</ul>
			</div>

			<!-- Company -->
			<div>
				<h3 class="text-sm font-semibold text-foreground mb-3">Company</h3>
				<ul class="space-y-2">
					{#each [['/about', 'About Us'], ['/contact', 'Contact Us'], ['/pricing', 'Pricing'], ['/terms', 'Terms & Conditions'], ['/privacy', 'Privacy Policy']] as [href, label]}
						<li>
							<a href={href} class="text-sm text-muted-foreground hover:text-foreground transition-colors">
								{label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>

		<div class="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
			<p class="text-xs text-muted-foreground">
				© {new Date().getFullYear()} Apsara Entertainment. All rights reserved.
			</p>
			<div class="flex items-center gap-4 text-xs text-muted-foreground">
				<a href="/about" class="hover:text-foreground transition-colors">About</a>
				<a href="/contact" class="hover:text-foreground transition-colors">Contact</a>
				<a href="/terms" class="hover:text-foreground transition-colors">Terms</a>
				<a href="/privacy" class="hover:text-foreground transition-colors">Privacy</a>
			</div>
		</div>
	</div>
</footer>
