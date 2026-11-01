# shoplab-account-mfe

Account remote: login and registration, profile edit, order history. React + Vite.

**Exposes** `./Account`.
**Consumes** `host/ui` (`useAuth` with `login` and `logout`, `authFetch`), `@shoplab/ui-kit` (`FormField`, `Money`, `ApiError`, shared singleton).
**HTTP:** `POST /auth/register`, `GET /users/:id`, `PATCH /users/:id`, `GET /orders`. Login and logout go through the host, which owns the tokens.
**Order history** reads `GET /orders` (orders service, a later phase); until it exists the page shows "unavailable" and the rest keeps working.

```
npm install
npm test
npm run build     # emits dist/assets/remoteEntry.js
npm start         # build + serve on port 5003
```
