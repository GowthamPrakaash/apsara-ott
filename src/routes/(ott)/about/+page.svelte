<svelte:head>
	<title>About Us — Apsara Entertainment</title>
	<meta name="description" content="Learn about Apsara Entertainment, your premium streaming platform for movies and series. Discover our mission, values, and team." />
</svelte:head>

<div class="max-w-4xl mx-auto py-8 space-y-16">
	<!-- Hero -->
	<div class="text-center space-y-6">
		<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
			About Apsara Entertainment
		</div>
		<h1 class="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
			Bringing Stories to Life,<br />
			<span class="text-muted-foreground">One Stream at a Time</span>
		</h1>
		<p class="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
			Apsara Entertainment is a premium streaming platform dedicated to delivering the finest
			movies and series straight to your screen — anytime, anywhere.
		</p>
	</div>

	<!-- Divider -->
	<div class="h-px bg-border"></div>

	<!-- Mission -->
	<div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
		<div class="space-y-4">
			<h2 class="text-2xl font-bold text-foreground">Our Mission</h2>
			<p class="text-muted-foreground leading-relaxed">
				We believe great entertainment should be accessible to everyone. Our mission is to provide
				a seamless, high-quality streaming experience with a curated library of content that
				entertains, inspires, and connects people across cultures and communities.
			</p>
			<p class="text-muted-foreground leading-relaxed">
				From blockbuster hits to hidden gems, Apsara Entertainment is your go-to destination for
				premium digital entertainment.
			</p>
		</div>
		<div class="grid grid-cols-2 gap-4">
			{#each [
				{ number: '10,000+', label: 'Titles Available' },
				{ number: '50+', label: 'Genres & Categories' },
				{ number: '4K', label: 'Ultra HD Quality' },
				{ number: '24/7', label: 'Customer Support' }
			] as stat}
				<div class="bg-card border border-border rounded-xl p-6 text-center space-y-1">
					<p class="text-3xl font-bold text-foreground">{stat.number}</p>
					<p class="text-sm text-muted-foreground">{stat.label}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- Divider -->
	<div class="h-px bg-border"></div>

	<!-- Values -->
	<div class="space-y-8">
		<div class="text-center">
			<h2 class="text-2xl font-bold text-foreground">What We Stand For</h2>
			<p class="text-muted-foreground mt-2">The principles that guide everything we do</p>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each [
				{
					icon: '🎬',
					title: 'Premium Content',
					desc: 'Carefully curated movies and series from top studios and independent creators around the world.'
				},
				{
					icon: '⚡',
					title: 'Seamless Streaming',
					desc: 'Buffer-free, high-definition playback across all your devices with adaptive streaming technology.'
				},
				{
					icon: '🔒',
					title: 'Privacy First',
					desc: 'Your viewing data stays private. We are committed to protecting your personal information.'
				},
				{
					icon: '💬',
					title: 'Community Driven',
					desc: 'We listen to our community to shape our content library and improve the platform experience.'
				},
				{
					icon: '🌍',
					title: 'Diverse Content',
					desc: 'Content across languages, cultures, and genres so everyone finds something they love.'
				},
				{
					icon: '💰',
					title: 'Affordable Plans',
					desc: 'Flexible subscription plans that give you the best value for unlimited entertainment.'
				}
			] as value}
				<div class="bg-card border border-border rounded-xl p-6 space-y-3 hover:border-primary/30 transition-colors">
					<div class="text-3xl">{value.icon}</div>
					<h3 class="font-semibold text-foreground">{value.title}</h3>
					<p class="text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- Divider -->
	<div class="h-px bg-border"></div>

	<!-- Contact Info -->
	<div class="bg-card border border-border rounded-2xl p-8 space-y-6">
		<div class="text-center space-y-2">
			<h2 class="text-2xl font-bold text-foreground">Get in Touch</h2>
			<p class="text-muted-foreground">We'd love to hear from you. Reach out to our team anytime.</p>
		</div>
		<div class="flex flex-col sm:flex-row gap-6 justify-center">
			<a
				href="mailto:apsaraentertainmentott@gmail.com"
				class="flex items-center gap-3 px-6 py-4 bg-muted/50 hover:bg-muted rounded-xl border border-border transition-colors group"
			>
				<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
					<span class="text-lg">✉️</span>
				</div>
				<div>
					<p class="text-xs text-muted-foreground">Email Us</p>
					<p class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
						apsaraentertainmentott@gmail.com
					</p>
				</div>
			</a>
			<a
				href="tel:+919744958809"
				class="flex items-center gap-3 px-6 py-4 bg-muted/50 hover:bg-muted rounded-xl border border-border transition-colors group"
			>
				<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
					<span class="text-lg">📞</span>
				</div>
				<div>
					<p class="text-xs text-muted-foreground">Call Us</p>
					<p class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
						+91 97449 58809
					</p>
				</div>
			</a>
		</div>
		<p class="text-center text-xs text-muted-foreground">
			Or visit our <a href="/contact" class="text-primary hover:underline">Contact page</a> for more ways to reach us.
		</p>
	</div>
</div>
