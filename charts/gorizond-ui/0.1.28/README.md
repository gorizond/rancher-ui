# Gorizond UI for Rancher

Rancher extension that surfaces Gorizond clusters and billing directly in the Rancher console.

## What it does
- **Clusters:** list, state, Kubernetes version, drill into details.
- **Billings:** workspace balance with **Top Up** (payment link via backend `yookassa-url-generator`).
- **BillingEvents:** history of top-ups/charges.

## Requirements
- Rancher 2.13+ with UI Extensions 3.x enabled.
- Gorizond CRDs installed in the cluster (`provisioning.gorizond.io.*`).
- User permissions to view/manage the workspace and billing.

## How to open
1) In Rancher, go to **Global Apps → Gorizond**.
2) Use tabs **Clusters**, **Billings**, **BillingEvents**.

## How to top up balance
1) Open **Billings**.
2) Click **Top Up**, enter amount, click **Top up on Yookassa** to get the payment link.
3) After payment, the balance updates (event visible in **BillingEvents**).

