# front-standard

Archetype with boilerplate code for a front web app with standard HTML, CSS and JS (TypeScript stripped on the fly). No frameworks, no build step, no CDN dependencies.

## Quick start

> [!IMPORTANT]
> this projects uses `nub` as a package manager and runner.

[Nub](https://github.com/nubjs/nub) is an all-in-one toolkit powered by Node.js that modernizes the developer experience of the Node.js ecosystem. Use it instead of node, npm run, and npx (or the equivalents in your preferred package manager).

```bash
npm install -g --ignore-scripts=false @nubjs/nub   # one-time, system-level
nub node install 26 && nub node pin 26 # latest Node.js 26 LTS
nub install
nub run dev   # starts the static client server on http://localhost:4000
```

The client expects the API (the `back` project) on port 3000. 

---

-**Author**

- [Alberto Basalo](https://albertobasalo.dev)
- [GitHub](https://github.com/AIDDbot/AIDDbot)
- [A.I. Code Academy](https://aicode.academy) (ES)
