# Testify

This app is a frontend to view records in the [TenantAct](https://github.com/gordonmaloney/tenantactAPI) database.

## Usage

This app uses [Node.js](https://nodejs.org) and [React](https://react.dev/). To use this app, you must be running an instance of the [TenantAct API](https://github.com/gordonmaloney/tenantactAPI).

After cloning this repository, copy the `.env.example` to `.env` and set the environment variables.

```
# Should match the URL and password where
# the TenantAct API is running
# See: https://github.com/gordonmaloney/tenantactAPI
VITE_API_BASE=http://localhost:3000
VITE_PASSWORD=password
```

Install dependencies.

```
npm install
```

Launch the site for local development.

```
npm run dev
```

If you see the message, `Something is already running on port 3000`, type `Y` to use another port. The app will be running at `http://localhost:3001` or a similar URL.
