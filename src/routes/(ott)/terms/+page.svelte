<svelte:head>
	<title>Terms & Conditions — Apsara Entertainment</title>
	<meta name="description" content="Read the Terms and Conditions for using Apsara Entertainment's streaming platform. Understand your rights and responsibilities as a subscriber." />
</svelte:head>

<div class="max-w-3xl mx-auto py-8 space-y-10">
	<!-- Header -->
	<div class="space-y-3 border-b border-border pb-8">
		<h1 class="text-3xl font-bold text-foreground">Terms & Conditions</h1>
		<p class="text-sm text-muted-foreground">Last updated: April 17, 2025</p>
		<p class="text-muted-foreground leading-relaxed">
			Please read these Terms and Conditions carefully before using the Apsara Entertainment
			streaming platform. By accessing or using our service, you agree to be bound by these terms.
		</p>
	</div>

	<!-- Sections -->
	<div class="space-y-8 text-sm leading-relaxed">

		{#each [
			{
				title: '1. Acceptance of Terms',
				content: `By creating an account or accessing any part of the Apsara Entertainment platform ("Service"), you agree to these Terms and Conditions and our Privacy Policy. If you do not agree, you must not use our Service. These Terms apply to all visitors, users, and subscribers of the Service.`
			},
			{
				title: '2. Eligibility',
				content: `You must be at least 13 years of age to use our Service. By using the Service, you represent and warrant that you meet this age requirement and that you have the legal capacity to enter into a binding agreement. If you are under 18, you must have parental or guardian consent.`
			},
			{
				title: '3. Account Registration',
				content: `To access certain features, you must register for an account. You agree to provide accurate, current, and complete information during registration and to keep your account credentials confidential. You are responsible for all activity that occurs under your account. Notify us immediately at apsaraentertainmentott@gmail.com if you suspect unauthorized use.`
			},
			{
				title: '4. Subscriptions & Payments',
				content: `Access to premium content requires a paid subscription. By subscribing, you authorize us to charge the applicable subscription fees to your selected payment method. Subscriptions automatically renew unless cancelled before the renewal date. All fees are non-refundable except where required by law. We reserve the right to modify pricing with prior notice.`
			},
			{
				title: '5. Content & Intellectual Property',
				content: `All content available on the Service — including movies, series, images, and text — is owned by or licensed to Apsara Entertainment and is protected by applicable intellectual property laws. You may not copy, distribute, reproduce, transmit, or create derivative works from any content without prior written permission.`
			},
			{
				title: '6. Permitted Use',
				content: `The Service is for your personal, non-commercial use only. You may stream content on the number of devices permitted by your subscription plan. You agree not to: use the Service for any unlawful purpose, attempt to bypass or circumvent any security or access controls, share your account credentials with others outside your plan, or use any automated tool to access the Service.`
			},
			{
				title: '7. Cancellation & Termination',
				content: `You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period. We reserve the right to suspend or terminate your account without notice if you violate these Terms, engage in fraudulent activity, or use the Service in a manner harmful to others.`
			},
			{
				title: '8. Disclaimer of Warranties',
				content: `The Service is provided on an "as is" and "as available" basis without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses. We make no guarantee regarding the accuracy or completeness of any content available on the platform.`
			},
			{
				title: '9. Limitation of Liability',
				content: `To the fullest extent permitted by law, Apsara Entertainment shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the Service, even if advised of the possibility of such damages. Our total liability to you for any claim shall not exceed the amount you paid us in the 3 months preceding the claim.`
			},
			{
				title: '10. Governing Law',
				content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of courts located in India.`
			},
			{
				title: '11. Changes to These Terms',
				content: `We may update these Terms from time to time. We will notify you of significant changes via email or a prominent notice on our platform. Your continued use of the Service after changes become effective constitutes acceptance of the revised Terms.`
			},
			{
				title: '12. Contact Us',
				content: `If you have any questions about these Terms, please contact us:\n\nEmail: apsaraentertainmentott@gmail.com\nPhone: +91 97449 58809`
			}
		] as section}
			<div class="space-y-3">
				<h2 class="text-base font-semibold text-foreground">{section.title}</h2>
				<p class="text-muted-foreground whitespace-pre-line">{section.content}</p>
			</div>
		{/each}
	</div>

	<!-- Footer note -->
	<div class="border-t border-border pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
		<p class="text-xs text-muted-foreground">For questions, email <a href="mailto:apsaraentertainmentott@gmail.com" class="text-primary hover:underline">apsaraentertainmentott@gmail.com</a></p>
		<div class="flex gap-4 text-xs">
			<a href="/privacy" class="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
			<a href="/contact" class="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
		</div>
	</div>
</div>
