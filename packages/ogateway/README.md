# ogateway

Collect mobile money payments in React with one component. No backend
integration, no secret keys in the browser — pass a publishable key and an
amount, and `<OGCollect />` handles the phone number form, OTP confirmation,
and status polling.

```tsx
import { OGCollect } from 'ogateway';
import 'ogateway/style.css';

<OGCollect
  publicKey="pk_test_xxxxxxxx"
  apiBaseUrl="https://api.ogateway.co"
  amount={149}
  currency="GHS"
  reason="Wireless Earbuds"
  onSuccess={transaction => console.log('paid', transaction)}
  onFailed={(transaction, error) => console.log('failed', error)}
/>;
```

## Install

```bash
npm install ogateway
# or: yarn add ogateway / pnpm add ogateway
```

**Peer dependencies:** `react >=18` (required). `tailwindcss >=3.4` is listed
as an optional peer — you do **not** need Tailwind installed for this to
work, see [Styling](#styling) below.

## Getting a publishable key

Publishable keys (`pk_test_*` / `pk_live_*`) are generated from your
OGateway dashboard: **Settings → API → Publishable Key → Generate**. They are
deliberately a different credential from your `test_key`/`live_key`:

- A publishable key can **only** call the momo-collection routes this
  component uses (`/collections/mobilemoney`, `/collections/otp`,
  `/collections/otp/resend`) plus the unauthenticated status-poll route. It
  cannot initiate disbursements, read business data, or do anything your
  regular API key can.
- That's what makes it safe to ship inside a client-side bundle. Never pass
  your `live_key`/`test_key` or `live_secret_key`/`test_secret_key` to this
  component — those remain full-privilege, server-side-only credentials.

## `<OGCollect />` props

| Prop            | Type                                                          | Required | Description                                                                                      |
| --------------- | ------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `publicKey`     | `string`                                                      | yes      | A `pk_test_*`/`pk_live_*` publishable key.                                                       |
| `apiBaseUrl`    | `string`                                                      | yes      | Base URL of the OGateway API, e.g. `https://api.ogateway.co`.                                    |
| `amount`        | `number`                                                      | yes      | Amount to collect, in the major currency unit (e.g. `149` = GHS 149.00).                         |
| `currency`      | `'GHS' \| 'XOF' \| 'XAF' \| 'KES' \| 'UGX' \| 'TZS' \| 'ZMW'` | yes      | ISO-ish currency code — must be one your business is permissioned for.                           |
| `reason`        | `string`                                                      | no       | Shown as the line item above the amount. Defaults to `"Payment"`.                                |
| `network`       | `string`                                                      | no       | Pre-fill and lock the network (`MTN`/`VODAFONE`/`AIRTELTIGO`) instead of letting the payer pick. |
| `accountNumber` | `string`                                                      | no       | Pre-fill and lock the payer's phone number.                                                      |
| `accountName`   | `string`                                                      | no       | Pre-fill and lock the account name.                                                              |
| `buttonLabel`   | `string`                                                      | no       | Submit button text. Defaults to `"Pay now"`.                                                     |
| `className`     | `string`                                                      | no       | Extra classes merged onto the outer card (layout/sizing overrides).                              |
| `onSuccess`     | `(transaction) => void`                                       | no       | Fires once polling confirms `COMPLETED`.                                                         |
| `onFailed`      | `(transaction \| null, error?) => void`                       | no       | Fires on `FAILED`/`CANCELLED`/`REVERSED`, a timeout, or a request error.                         |

## Headless usage: `useOGCollect`

If you want your own UI instead of the built-in card, use the hook directly
— it's the same state machine `<OGCollect />` is built on:

```tsx
import { useOGCollect } from 'ogateway';

const { stage, transaction, error, initiate, submitOtp, resendOtp, reset } = useOGCollect({ publicKey, apiBaseUrl, onSuccess, onFailed });
```

`stage` is one of: `idle`, `submitting`, `otp_required`, `verifying_otp`,
`polling`, `success`, `failed`. Call `initiate({ amount, currency, network,
accountNumber, accountName, reason })` to start a collection, `submitOtp(otp)`
once `stage === 'otp_required'`, `resendOtp()` to resend the code, and
`reset()` to return to `idle`.

The building blocks used internally (`Button`, `Input`, `Select`,
`OtpInput`, and the `cn` classname helper) are also exported, in case you
want to assemble your own layout with matching styling.

## Styling

This package ships a small, pre-compiled stylesheet — `ogateway/style.css`
— built with Tailwind v4 and imported **once**, anywhere in your app:

```ts
import 'ogateway/style.css';
```

A few deliberate choices, since this component renders inside _your_ page,
not a page we control:

- **No Tailwind Preflight.** Preflight is Tailwind's global base reset
  (it restyles every `<button>`, `<h1>`, `<input>` on the page). Shipping
  that inside an npm package would silently change the look of your own
  site. `ogateway/style.css` only contains scoped utility classes, nothing
  global.
- **Prefixed tokens.** Every design token is namespaced under `og-`
  (`bg-og-primary`, `rounded-og-xl`, `text-og-secondary`, …), generated from
  a Tailwind v4 `@theme` block. If your app already uses Tailwind and/or
  shadcn/ui with its own `--primary`/`--background` tokens, ours won't
  collide with or override yours.
- **Works with or without Tailwind in your app.** Because the CSS ships
  pre-compiled, you don't need Tailwind configured, and your own Tailwind's
  content-scanning doesn't need to know about this package. If you _do_ use
  Tailwind, you can still freely mix your own utility classes via the
  `className` prop.

To re-theme the component, override the CSS custom properties after
importing the stylesheet:

```css
:root {
  --color-og-primary: #6d28d9; /* swap the accent color */
  --radius-og-2xl: 0.5rem; /* less rounded card */
}
```

## How requests are scoped

`<OGCollect />` only ever talks to:

- `POST /collections/mobilemoney` — initiate the debit
- `POST /collections/otp` — confirm the OTP, if the network requires one
- `POST /collections/otp/resend` — resend the OTP
- `GET /transactions/verify/:id` — poll for the final status

All four are the only routes a publishable key can authenticate against on
the OGateway API — it resolves to your business and nothing else, and
structurally cannot reach disbursements, card, checkout, virtual-account, or
any other route, even with a valid `pk_*` key.

## Known limitations (read before going to production)

- There is currently no per-business CORS origin allowlist on the
  momo-collection routes — a leaked publishable key is usable from any
  origin, not just yours. The blast radius is capped to "can initiate a
  momo collection on your business," not account takeover, but origin
  pinning is a reasonable fast-follow if you're embedding this on a public
  site.
- Card, bank transfer, and other collection channels are intentionally out
  of scope for this package — momo only, by design.
