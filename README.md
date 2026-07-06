# front-standard

Archetype with boilerplate code for a front web app with standard HTML, CSS and JS (TypeScript stripped on the fly). No frameworks, no build step, no CDN dependencies.

## Quick start

```bash
npm install -g --ignore-scripts=false @nubjs/nub   # one-time, system-level
nub node install 26 && nub node pin 26
nub install
nub run dev   # starts the static client server on http://localhost:4000
```

The client expects the API (the `back` project) on port 3000. Override with a `.env` file (see `.env.example`): `PORT` for this server, `API_BASE_URL` for the API location injected into the client.

---

-**Author**

- [Alberto Basalo](https://albertobasalo.dev)
- [GitHub](https://github.com/AIDDbot/AIDDbot)
- [A.I. Code Academy](https://aicode.academy) (ES)
