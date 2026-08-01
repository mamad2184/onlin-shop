# Django REST Frontend

This frontend is built as a React single-page application using Vite and Tailwind CSS.

## Why these technologies?

- **React**: Popular, easy to use with Django REST APIs, and a strong ecosystem for web UIs.
- **Vite**: Fast development server and build tooling.
- **Tailwind CSS**: Utility-first styling for a polished UI without custom CSS overload.
- **Axios**: Simple promise-based HTTP client for API requests.
- **React Router**: Client-side navigation for Home, Basket, Product detail, and Auth pages.

## Included pages

- **Home**: Product listing from `/products/`
- **Product**: Product detail page from `/products/:id/`
- **Basket**: Basket list from `/mybasket-list/`
- **Auth**: Login and register using `/get-token/` and `/register/`

## Run locally

1. Install Node.js and npm
2. In `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

3. Open the local Vite URL shown in the terminal.

## API base URL

The frontend uses `VITE_API_BASE` from environment variables if set, otherwise it defaults to `http://127.0.0.1:8000/`.

If your Django backend runs on another host or port, create a `.env` file in `frontend/` with:

```env
VITE_API_BASE=http://127.0.0.1:8000/
```
