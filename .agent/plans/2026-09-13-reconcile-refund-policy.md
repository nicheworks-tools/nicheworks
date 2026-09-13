# ExecPlan — Reconcile refund policy

## Scope

Only NicheWorks Reconcile refund-policy presentation and its tool specification.

## Files to touch

Final diff:

- `tools/reconcile/index.html`
- `tools/reconcile/refund.html` (new)
- `tools/reconcile/SPEC.md`
- `.agent/plans/2026-09-13-reconcile-refund-policy.md`

A temporary self-deleting workflow under `.github/workflows/` may be used only to apply the mechanical text patch on this branch. It must remove itself before review and must not appear in the final PR diff.

## Contract

- Reconcile Pro remains a ¥3,980 JPY one-time digital feature purchase.
- Customer-convenience cancellations/refunds are generally not accepted after purchase.
- Limited exceptions may be handled individually for duplicate charges, payment-processing errors, or a NicheWorks-side technical failure that prevents use of Reconcile Pro.
- Refunds required by applicable law remain available.
- There is no self-service/automatic refund button.
- If a refund or dispute is processed, only entitlement derived from that Reconcile purchase is revoked under the existing billing contract; separate purchases are not revoked.
- Existing Stripe refund/dispute revocation code remains unchanged.
- Do not create a site-wide refund contract for unrelated products.
- Do not fabricate seller/address/telephone fields for a Japanese commercial disclosure page.

## Steps

1. Add concise JA/EN refund notice immediately adjacent to the Reconcile Pro purchase CTA.
2. Add a Reconcile-specific refund policy page with JA/EN policy, exception handling, contact route, and post-refund access consequence.
3. Link the Reconcile footer to the refund policy.
4. Record the refund contract and acceptance criteria in `tools/reconcile/SPEC.md`.
5. Run changed-file audit, Reconcile tests/syntax, SEO/tool-spec/runtime/data checks, and Cloudflare Pages preview where triggered.

## Manual verification

- The purchase section states that customer-convenience refunds/cancellations are generally unavailable and links to the policy before checkout.
- Refund policy is reachable from the Reconcile page/footer.
- No self-service refund action is present.
- Checkout still sends only `productId` and `returnPath`.
- Reconcile entitlement semantics and one-way grant contract remain unchanged.
