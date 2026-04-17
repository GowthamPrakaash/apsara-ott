<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Check from '@lucide/svelte/icons/check';
	import Crown from '@lucide/svelte/icons/crown';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import { env } from '$env/dynamic/public';
	import { toast } from 'svelte-sonner';

	let { data } = $props();
	const { subscription, isAdminOrSuper, payments } = $derived(data);

	let loading = $state(false);

	const daysRemaining = $derived(() => {
		if (!subscription?.endDate) return 0;
		const diff = new Date(subscription.endDate).getTime() - Date.now();
		return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
	});

	async function subscribe() {
		loading = true;
		try {
			const res = await fetch('/api/razorpay/create-order', { method: 'POST' });
			const orderData = await res.json();
			if (!orderData.id) throw new Error('Failed to create order');

			const Razorpay = (window as any).Razorpay;
			const rzp = new Razorpay({
				key: env.PUBLIC_RAZORPAY_KEY_ID,
				amount: orderData.amount,
				currency: orderData.currency,
				name: 'Apsara Entertainment',
				description: 'Monthly Subscription',
				order_id: orderData.id,
				handler: async (response: any) => {
					const verifyRes = await fetch('/api/razorpay/verify', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							orderId: response.razorpay_order_id,
							paymentId: response.razorpay_payment_id,
							signature: response.razorpay_signature
						})
					});
					const result = await verifyRes.json();
					if (result.success) {
						toast.success('Subscription activated! Enjoy watching.', { duration: 5000 });
						setTimeout(() => window.location.reload(), 1500);
					} else {
						toast.error('Payment verification failed. Please contact support.');
					}
				},
				prefill: { name: data.user?.name ?? '', email: data.user?.email ?? '' },
				theme: { color: '#3b82f6' }
			});
			rzp.open();
		} catch (err) {
			toast.error('Failed to initiate payment. Please try again.');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Subscription — Apsara Entertainment</title>
	<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</svelte:head>

<div class="max-w-3xl mx-auto space-y-8">
	<div>
		<h1 class="text-3xl font-bold text-foreground">Subscription</h1>
		<p class="text-muted-foreground text-sm mt-1">Manage your Apsara Entertainment subscription</p>
	</div>

	{#if isAdminOrSuper}
		<!-- Admin/Super Admin - free access -->
		<div class="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-8 text-center">
			<Crown class="w-12 h-12 text-yellow-500 mx-auto mb-4" />
			<h2 class="text-xl font-bold text-foreground mb-2">Admin Access</h2>
			<p class="text-muted-foreground">You have unlimited access to all content as an administrator.</p>
		</div>
	{:else if subscription}
		<!-- Active subscription -->
		<div class="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/30 rounded-2xl p-8">
			<div class="flex items-start justify-between gap-4 mb-6">
				<div>
					<div class="flex items-center gap-2 mb-2">
						<Sparkles class="w-5 h-5 text-primary" />
						<h2 class="text-xl font-bold text-foreground">Active Subscription</h2>
						<Badge class="bg-green-500/20 text-green-500 border-green-500/30">Active</Badge>
					</div>
					<p class="text-muted-foreground text-sm">
						Expires {new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
					</p>
				</div>
				<div class="text-right">
					<p class="text-2xl font-bold text-foreground">{daysRemaining()}</p>
					<p class="text-xs text-muted-foreground">days left</p>
				</div>
			</div>

			<div class="grid grid-cols-3 gap-4 mb-6">
				{#each ['Unlimited Movies', 'Unlimited Series', 'HD Quality'] as feat}
					<div class="flex items-center gap-2 text-sm text-foreground">
						<Check class="w-4 h-4 text-primary" />{feat}
					</div>
				{/each}
			</div>

			<Button onclick={subscribe} disabled={loading} variant="outline" class="w-full sm:w-auto">
				{loading ? 'Processing...' : 'Renew Subscription — ₹99'}
			</Button>
		</div>
	{:else}
		<!-- No subscription -->
		<div class="border border-border rounded-2xl overflow-hidden">
			<div class="bg-gradient-to-b from-primary/10 to-transparent p-8 text-center">
				<h2 class="text-2xl font-bold text-foreground mb-2">Get Unlimited Access</h2>
				<p class="text-muted-foreground mb-6">Watch all movies and series with a monthly subscription</p>

				<div class="inline-flex flex-col items-center bg-card border border-border rounded-2xl p-8 mb-6 min-w-[260px]">
					<p class="text-xs text-muted-foreground uppercase tracking-wider mb-2">Monthly Plan</p>
					<div class="flex items-start gap-1 mb-1">
						<span class="text-xl font-semibold text-muted-foreground mt-2">₹</span>
						<span class="text-5xl font-extrabold text-foreground">99</span>
					</div>
					<p class="text-sm text-muted-foreground">per month</p>
				</div>

				<ul class="text-sm text-left space-y-2 max-w-xs mx-auto mb-8">
					{#each ['Unlimited Movies', 'Unlimited Series', 'HD Video Quality', 'Subtitle Support', 'Watch History', 'Watchlist'] as f}
						<li class="flex items-center gap-2">
							<Check class="w-4 h-4 text-primary flex-shrink-0" />
							<span class="text-muted-foreground">{f}</span>
						</li>
					{/each}
				</ul>

				<Button onclick={subscribe} disabled={loading} size="lg" class="w-full max-w-xs shadow-lg shadow-primary/25">
					{loading ? 'Processing...' : 'Subscribe Now — ₹99'}
				</Button>
			</div>
		</div>
	{/if}

	<!-- Payment History -->
	{#if payments.length > 0}
		<div>
			<h2 class="text-xl font-bold text-foreground mb-4">Payment History</h2>
			<div class="rounded-xl border border-border overflow-hidden">
				<table class="w-full text-sm">
					<thead class="bg-muted/50">
						<tr>
							<th class="text-left px-4 py-3 text-muted-foreground font-medium">Date</th>
							<th class="text-left px-4 py-3 text-muted-foreground font-medium">Amount</th>
							<th class="text-left px-4 py-3 text-muted-foreground font-medium">Payment ID</th>
							<th class="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
						</tr>
					</thead>
					<tbody>
						{#each payments as payment}
							<tr class="border-t border-border hover:bg-muted/20 transition-colors">
								<td class="px-4 py-3 text-muted-foreground">
									{new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
								</td>
								<td class="px-4 py-3 text-foreground font-medium">
									₹{(payment.amountPaise / 100).toFixed(0)}
								</td>
								<td class="px-4 py-3 text-muted-foreground font-mono text-xs">
									{payment.razorpayPaymentId ?? '—'}
								</td>
								<td class="px-4 py-3">
									<Badge class="{payment.status === 'captured' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30'}">
										{payment.status}
									</Badge>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
