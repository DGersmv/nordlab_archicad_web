# Nordlab

Маркетинговый сайт и activation/payment entrypoint для плагинов Nordlab.

## Plugins

### MeshMaster

- Price: `3000 RUB / 30 EUR`
- Current sales mode: manual sale
- License generator: not implemented yet
- Temporary workflow:
  - collect contact and machine/context data from the customer
  - process payment manually
  - send installation / activation details manually

### TableSet

- Price: `3000 RUB / 30 EUR`
- Current sales mode: manual sale
- License generator: not implemented yet
- Temporary workflow:
  - collect contact and machine/context data from the customer
  - process payment manually
  - send installation / activation details manually

### OpeningMaster

- Price: `3000 RUB / 30 EUR`
- Current sales mode: manual sale with machine-bound key
- Public machine ID format: `OM1-XXXX-XXXX-XXXX`
- License key format: `OM27-XXXXXXXX-XXXXXXXX`

## OpeningMaster License Issuing

Use the local CLI generator from any trusted computer where this project is available.

```bash
npm run license:generate -- openingmaster OM1-E0C6-7737-78EA
```

Example output:

```json
{
  "pluginSlug": "openingmaster",
  "machineId": "OM1-E0C6-7737-78EA",
  "price": {
    "rub": 3000,
    "eur": 30
  },
  "licenseKey": "OM27-B34371D4-B34376ED"
}
```

Manual workflow:

1. Customer sends the `machineId` from the plugin palette.
2. Run `npm run license:generate -- openingmaster <machineId>`.
3. Copy the returned `licenseKey`.
4. Send the key to the customer.
5. Customer pastes the key into the `OpeningMaster` palette and activates the plugin.

## Optional Remote Generation

There is also a protected server endpoint for remote generation:

- Route: `POST /api/admin/generate-license`
- Auth: `Authorization: Bearer <LICENSE_ADMIN_SECRET>`
  or `x-license-admin-secret: <LICENSE_ADMIN_SECRET>`

Example JSON body:

```json
{
  "pluginSlug": "openingmaster",
  "machineId": "OM1-E0C6-7737-78EA"
}
```

Required env variable:

```env
LICENSE_ADMIN_SECRET=
```
