<svelte:head>
	<title>Pricing — Apsara Entertainment</title>
	<meta
		name="description"
		content="Choose the perfect Apsara Entertainment plan for you. Affordable monthly and annual subscription plans with access to thousands of movies and series."
	/>
</svelte:head>

<div class="max-w-5xl mx-auto py-8 space-y-16">
	<!-- Hero -->
	<div class="text-center space-y-4">
		<div
			class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium"
		>
			Simple, Transparent Pricing
		</div>
		<h1 class="text-4xl sm:text-5xl font-bold text-foreground">
			Choose Your Plan
		</h1>
		<p class="text-muted-foreground max-w-lg mx-auto">
			Unlimited entertainment at your fingertips. Cancel anytime, no
			questions asked.
		</p>
	</div>

	<!-- Plan -->
	<div class="flex justify-center">
		<div
			class="relative flex flex-col rounded-2xl border border-primary bg-primary/5 shadow-xl shadow-primary/10 p-8 w-full max-w-sm transition-transform hover:-translate-y-1 duration-200"
		>
			<div class="space-y-2 mb-6">
				<h2 class="text-xl font-bold text-foreground">Basic</h2>
				<div class="flex items-end gap-1">
					<span class="text-4xl font-bold text-foreground">₹99</span>
					<span class="text-muted-foreground text-sm mb-1"
						>/month</span
					>
				</div>
				<p class="text-sm text-muted-foreground">
					Perfect for casual viewers who want access to great content.
				</p>
			</div>

			<ul class="space-y-2.5 flex-1 mb-8">
				{#each ["Access to 5,000+ titles", "HD streaming (720p)", "Standard audio quality", "Monthly content updates", "Email support"] as feature}
					<li class="flex items-start gap-2.5 text-sm">
						<span class="text-green-500 mt-0.5 shrink-0">✓</span>
						<span class="text-muted-foreground">{feature}</span>
					</li>
				{/each}
			</ul>

			<a
				href="/login"
				class="block text-center py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground transition-opacity hover:opacity-90"
			>
				Get Started
			</a>
		</div>
	</div>

	<!-- Divider -->
	<div class="h-px bg-border"></div>

	<!-- Feature Comparison Note -->
	<div class="text-center space-y-2">
		<p class="text-sm text-muted-foreground">
			Prices are in Indian Rupees (INR) and include applicable taxes.
		</p>
	</div>

	<!-- FAQ -->
	<div class="space-y-6">
		<h2 class="text-2xl font-bold text-foreground text-center">
			Frequently Asked Questions
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each [{ q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. You will continue to have access until the end of your current billing period." }, { q: "What payment methods are accepted?", a: "We accept all major credit/debit cards, UPI, net banking, and popular digital wallets." }] as faq}
				<div
					class="bg-card border border-border rounded-xl p-5 space-y-2"
				>
					<h3 class="text-sm font-semibold text-foreground">
						{faq.q}
					</h3>
					<p class="text-sm text-muted-foreground leading-relaxed">
						{faq.a}
					</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- CTA -->
	<div
		class="bg-card border border-border rounded-2xl p-8 text-center space-y-4"
	>
		<h2 class="text-2xl font-bold text-foreground">
			Still Have Questions?
		</h2>
		<p class="text-muted-foreground">
			Our support team is happy to help you find the right plan.
		</p>
		<a
			href="/contact"
			class="inline-block px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
		>
			Contact Support
		</a>
	</div>
</div>
