# front-standard

Archetype with boilerplate code for a front web app with standard HTML, CSS and JS (TypeScript stripped on the fly). No frameworks, no build step, no CDN dependencies.

## Quick start

> [!IMPORTANT]
> this project uses `bun` as a package manager, test runner, and runtime.

[Bun](https://bun.com/docs) is a fast all-in-one JavaScript and TypeScript runtime with a package manager and test runner.

```bash
# one-time, system-level (Windows PowerShell)
powershell -c "irm bun.com/install.ps1 | iex"

# pin expected runtime for this repo
bun --version  # expected: 1.4.0

bun install
bun run dev   # starts the static client server on http://localhost:4000
```

TypeScript 7 is supported. This project uses explicit type packages in `tsconfig.json` (`bun` and `node`) to match TS 6/7 type discovery behavior.

The client expects the API (the `back` project) on port 3000. 

---

-**Author**

- [Alberto Basalo](https://albertobasalo.dev)
- [GitHub](https://github.com/AIDDbot/AIDDbot)
- [A.I. Code Academy](https://aicode.academy) (ES)
