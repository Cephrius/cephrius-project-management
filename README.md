This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Preferences Automation

Settings under `Settings > Preferences` are processed by a daily cron route:

- `Invoice Reminder Emails`
- `Weekly Summary`
- `Product Updates`

Route:

- `GET /api/cron/preferences?mode=auto`

Required environment variables:

```bash
CRON_SECRET=your-random-secret
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL="JobSyte <notifications@yourdomain.com>"
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
```

Optional:

```bash
INVOICE_REMINDER_LEAD_DAYS=3
PRODUCT_UPDATE_BULLETS="Update 1|Update 2|Update 3"
```

Manual run example:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/preferences?mode=all&force=1"
```

## Project and Job CSV Import

Use the importer to bulk create projects and jobs from CSV.

Command:

```bash
npm run import:projects-jobs -- --file ./path/to/projects.csv --user-id <user-uuid>
```

Start with a dry run:

```bash
npm run import:projects-jobs -- --file ./path/to/projects.csv --user-id <user-uuid> --dry-run
```

Optional flags:

- `--default-builder "Builder Name"`
- `--default-subdivision "Subdivision Name"`

Supported headers (case-insensitive aliases):

- `project_address` (or `address`, `project`)
- `house_number` (or `street_number`, `street no`) + `street_address` (or `street`, `street_name`) as an alternative to `project_address`
- `job_title` (or `job`, `title`)
- `price` (or `amount`, `job_price`, `job_cost`)
- `builder_name` (or `builder`)
- `subdivision` (or `subdivision_name`)
- `superintendent` (or `gc`, `crew`)
- `scheduled_completion` (or `scheduled`, `date`) in `YYYY-MM-DD` or `MM/DD/YYYY`

Example CSV:

```csv
project_address,job_title,price,builder_name,subdivision,superintendent,scheduled_completion
1204 Main St,Rough Grade,120,Acme Homes,North Ridge,John Smith,2026-02-20
1204 Main St,Final Grade,90,Acme Homes,North Ridge,John Smith,2026-02-21
1208 Main St,Rough Grade,125,Acme Homes,North Ridge,,2026-02-22
```

Also supported: a single composite column value like:

```text
1204 Main St ----> Job: Rough Grade -----> Price: 120
```

Behavior:

- Creates builder/subdivision records if they do not exist.
- Creates a project when one does not already exist for the same user + builder + subdivision + address.
- Adds jobs to existing projects when matched.
- Skips duplicate jobs inside a project (same title + price + schedule + superintendent).
