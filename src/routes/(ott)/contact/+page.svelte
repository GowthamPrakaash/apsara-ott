<script lang="ts">
	let name = $state('');
	let email = $state('');
	let subject = $state('');
	let message = $state('');
	let submitted = $state(false);
	let submitting = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		submitting = true;
		// Simulate form submission
		await new Promise((r) => setTimeout(r, 800));
		submitting = false;
		submitted = true;
	}
</script>

<svelte:head>
	<title>Contact Us — Apsara Entertainment</title>
	<meta name="description" content="Get in touch with the Apsara Entertainment support team. We're here to help with any questions about your subscription, content, or technical issues." />
</svelte:head>

<div class="max-w-4xl mx-auto py-8 space-y-12">
	<!-- Hero -->
	<div class="text-center space-y-4">
		<div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
			Contact Us
		</div>
		<h1 class="text-4xl font-bold text-foreground">We're Here to Help</h1>
		<p class="text-muted-foreground max-w-xl mx-auto">
			Have a question or need support? Reach out to us directly — our team is always ready to assist.
		</p>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
		<!-- Contact Info -->
		<div class="lg:col-span-2 space-y-4">
			<h2 class="text-lg font-semibold text-foreground">Contact Information</h2>

			<div class="space-y-3">
				<a
					href="mailto:apsaraentertainmentott@gmail.com"
					class="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors group"
				>
					<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
						<span class="text-lg">✉️</span>
					</div>
					<div>
						<p class="text-xs text-muted-foreground mb-0.5">Email</p>
						<p class="text-sm font-medium text-foreground group-hover:text-primary transition-colors break-all">
							apsaraentertainmentott@gmail.com
						</p>
						<p class="text-xs text-muted-foreground mt-1">We respond within 24 hours</p>
					</div>
				</a>

				<a
					href="tel:+919744958809"
					class="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors group"
				>
					<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
						<span class="text-lg">📞</span>
					</div>
					<div>
						<p class="text-xs text-muted-foreground mb-0.5">Phone</p>
						<p class="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
							+91 97449 58809
						</p>
						<p class="text-xs text-muted-foreground mt-1">Mon–Sat, 9 AM – 6 PM IST</p>
					</div>
				</a>

				<div class="flex items-start gap-4 p-4 bg-card border border-border rounded-xl">
					<div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
						<span class="text-lg">📍</span>
					</div>
					<div>
						<p class="text-xs text-muted-foreground mb-0.5">Location</p>
						<p class="text-sm font-medium text-foreground">India</p>
						<p class="text-xs text-muted-foreground mt-1">Serving audiences nationwide</p>
					</div>
				</div>
			</div>


		</div>

		<!-- Contact Form -->
		<div class="lg:col-span-3">
			<div class="bg-card border border-border rounded-2xl p-6 sm:p-8">
				{#if submitted}
					<div class="text-center py-12 space-y-4">
						<div class="text-5xl">✅</div>
						<h3 class="text-xl font-semibold text-foreground">Message Sent!</h3>
						<p class="text-muted-foreground max-w-sm mx-auto">
							Thanks for reaching out. We'll get back to you at <strong>{email}</strong> within 24 hours.
						</p>
						<button
							onclick={() => { submitted = false; name = ''; email = ''; subject = ''; message = ''; }}
							class="text-sm text-primary hover:underline"
						>
							Send another message
						</button>
					</div>
				{:else}

					<form onsubmit={handleSubmit} class="space-y-5">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div class="space-y-1.5">
								<label for="name" class="text-sm font-medium text-foreground">Full Name</label>
								<input
									id="name"
									type="text"
									bind:value={name}
									required
									placeholder="Your name"
									class="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
								/>
							</div>
							<div class="space-y-1.5">
								<label for="email" class="text-sm font-medium text-foreground">Email Address</label>
								<input
									id="email"
									type="email"
									bind:value={email}
									required
									placeholder="your@email.com"
									class="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
								/>
							</div>
						</div>
						<div class="space-y-1.5">
							<label for="subject" class="text-sm font-medium text-foreground">Subject</label>
							<select
								id="subject"
								bind:value={subject}
								required
								class="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
							>
								<option value="" disabled selected>Select a topic</option>
								<option value="billing">Billing &amp; Subscription</option>
								<option value="technical">Technical Issue</option>
								<option value="content">Content Request</option>
								<option value="account">Account Help</option>
								<option value="other">Other</option>
							</select>
						</div>
						<div class="space-y-1.5">
							<label for="message" class="text-sm font-medium text-foreground">Message</label>
							<textarea
								id="message"
								bind:value={message}
								required
								rows="5"
								placeholder="Describe your issue or question..."
								class="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none"
							></textarea>
						</div>
						<button
							type="submit"
							disabled={submitting}
							class="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
						>
							{submitting ? 'Sending...' : 'Send Message'}
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>
</div>
