<svelte:head>
	<title>Privacy Policy — Apsara Entertainment</title>
	<meta name="description" content="Read the Apsara Entertainment Privacy Policy to understand how we collect, use, and protect your personal information." />
</svelte:head>

<div class="max-w-3xl mx-auto py-8 space-y-10">
	<!-- Header -->
	<div class="space-y-3 border-b border-border pb-8">
		<h1 class="text-3xl font-bold text-foreground">Privacy Policy</h1>
		<p class="text-sm text-muted-foreground">Last updated: April 17, 2025</p>
		<p class="text-muted-foreground leading-relaxed">
			At Apsara Entertainment, we are committed to protecting your privacy. This Privacy Policy
			explains how we collect, use, disclose, and safeguard your personal information when you
			use our platform.
		</p>
	</div>

	<!-- Sections -->
	<div class="space-y-8 text-sm leading-relaxed">

		{#each [
			{
				title: '1. Information We Collect',
				items: [
					{
						subtitle: 'Information You Provide',
						text: 'When you create an account, we collect your name, email address, and payment information. If you contact us, we also collect the content of your communications.'
					},
					{
						subtitle: 'Automatically Collected Information',
						text: 'We automatically collect certain technical data when you use our Service, including IP address, browser type, device identifiers, operating system, and pages visited.'
					},
					{
						subtitle: 'Viewing Activity',
						text: 'We collect information about the content you watch, search for, and add to your watchlist to personalize your experience and improve our recommendations.'
					}
				]
			},
			{
				title: '2. How We Use Your Information',
				items: [
					{
						subtitle: 'Providing the Service',
						text: 'We use your information to operate, maintain, and improve the Apsara Entertainment platform, including processing payments and managing your subscription.'
					},
					{
						subtitle: 'Personalization',
						text: 'We use your viewing history and preferences to recommend content we think you\'ll enjoy and to tailor your experience on the platform.'
					},
					{
						subtitle: 'Communications',
						text: 'We may send you service-related emails such as account confirmations, billing notices, and important platform updates. With your consent, we may also send promotional communications.'
					},
					{
						subtitle: 'Security & Fraud Prevention',
						text: 'We use your information to detect, investigate, and prevent fraudulent transactions and other illegal activities to protect our users and platform.'
					}
				]
			},
			{
				title: '3. Information Sharing',
				items: [
					{
						subtitle: 'Third-Party Service Providers',
						text: 'We share your information with trusted third-party vendors who assist us in operating the platform, such as payment processors and cloud hosting providers. These parties are contractually obligated to keep your data confidential.'
					},
					{
						subtitle: 'Legal Requirements',
						text: 'We may disclose your information if required by law or in response to valid legal requests, such as court orders or government investigations.'
					},
					{
						subtitle: 'No Sale of Data',
						text: 'We do not sell, rent, or trade your personal information to third parties for their marketing purposes.'
					}
				]
			},
			{
				title: '4. Data Retention',
				items: [
					{
						subtitle: '',
						text: 'We retain your personal information for as long as your account is active or as needed to provide the Service. If you delete your account, we will delete or anonymize your data within 30 days, except where we are required by law to retain it longer.'
					}
				]
			},
			{
				title: '5. Security',
				items: [
					{
						subtitle: '',
						text: 'We implement industry-standard security measures, including encryption and secure servers, to protect your personal information from unauthorized access, disclosure, or alteration. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.'
					}
				]
			},
			{
				title: '6. Cookies',
				items: [
					{
						subtitle: '',
						text: 'We use cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze usage patterns. You can control cookie settings through your browser, but disabling cookies may affect certain features of the Service.'
					}
				]
			},
			{
				title: '7. Children\'s Privacy',
				items: [
					{
						subtitle: '',
						text: 'Our Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected data from a child under 13, we will take steps to delete it promptly. If you believe we have such data, please contact us at apsaraentertainmentott@gmail.com.'
					}
				]
			},
			{
				title: '8. Your Rights',
				items: [
					{
						subtitle: 'Access & Correction',
						text: 'You may access and update your personal information through your account settings at any time.'
					},
					{
						subtitle: 'Deletion',
						text: 'You may request deletion of your account and associated personal data by contacting us. We will process your request within 30 days.'
					},
					{
						subtitle: 'Opt-Out',
						text: 'You can opt out of marketing emails by clicking the unsubscribe link in any promotional email, or by updating your notification preferences in account settings.'
					}
				]
			},
			{
				title: '9. Third-Party Links',
				items: [
					{
						subtitle: '',
						text: 'Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties and encourage you to review their privacy policies.'
					}
				]
			},
			{
				title: '10. Changes to This Policy',
				items: [
					{
						subtitle: '',
						text: 'We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a notice on the platform. Your continued use of the Service after changes are posted constitutes your acceptance of the updated policy.'
					}
				]
			},
			{
				title: '11. Contact Us',
				items: [
					{
						subtitle: '',
						text: 'If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us:\n\nEmail: apsaraentertainmentott@gmail.com\nPhone: +91 97449 58809'
					}
				]
			}
		] as section}
			<div class="space-y-4">
				<h2 class="text-base font-semibold text-foreground">{section.title}</h2>
				{#each section.items as item}
					<div class="space-y-1">
						{#if item.subtitle}
							<h3 class="text-sm font-medium text-foreground">{item.subtitle}</h3>
						{/if}
						<p class="text-muted-foreground whitespace-pre-line">{item.text}</p>
					</div>
				{/each}
			</div>
		{/each}
	</div>

	<!-- Footer note -->
	<div class="border-t border-border pt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
		<p class="text-xs text-muted-foreground">For questions, email <a href="mailto:apsaraentertainmentott@gmail.com" class="text-primary hover:underline">apsaraentertainmentott@gmail.com</a></p>
		<div class="flex gap-4 text-xs">
			<a href="/terms" class="text-muted-foreground hover:text-foreground transition-colors">Terms & Conditions</a>
			<a href="/contact" class="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
		</div>
	</div>
</div>
