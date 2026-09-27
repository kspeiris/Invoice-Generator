# Invoice Generator

A React + Vite invoice/bill generator that creates A4 PDF invoices in the browser.

## Features

- Live invoice preview
- Multiple invoice items
- Automatic quantity × rate calculation
- Advance/less deduction
- Business and bank details
- Optional logo upload
- Business details saved in browser localStorage
- Download A4 PDF
- Print support
- Mobile responsive
- Netlify-ready configuration

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Build

```bash
npm run build
```

## Deploy to Netlify

1. Push this folder to GitHub.
2. In Netlify, choose **Add new project → Import an existing project**.
3. Select the GitHub repository.
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy.

The included `netlify.toml` already contains the SPA redirect.

## Notes

The PDF is generated client-side. No backend/database is required for the basic version.
# Invoice-Generator
