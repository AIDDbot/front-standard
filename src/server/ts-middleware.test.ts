import { execFileSync } from "node:child_process";
import { test } from "node:test";

const middlewareScenario = `
      import assert from 'node:assert/strict';
      import { mkdtempSync, writeFileSync, statSync, utimesSync, rmSync } from 'node:fs';
      import { tmpdir } from 'node:os';
      import path from 'node:path';
      import express from 'express';
      const dir = mkdtempSync(path.join(tmpdir(), 'front-ts-'));
      process.env.CLIENT_SRC = dir;
      const { serveTsAsJs } = await import('./src/server/ts-middleware.ts');
      const file = path.join(dir, 'module.ts');
      const original = 'export const value: number = 1;';
      writeFileSync(file, original);
      utimesSync(file, new Date(1000000000000), new Date(1000000000000));
      const app = express();
      app.use(serveTsAsJs);
      app.use((_req, res) => res.sendStatus(404));
      const server = app.listen(0, '127.0.0.1');
      await new Promise(resolve => server.once('listening', resolve));
      const base = 'http://127.0.0.1:' + server.address().port;
      try {
        const first = await fetch(base + '/module.ts');
        assert.equal(first.status, 200);
        assert.match(first.headers.get('content-type'), /^text\\/javascript/);
        const js = await first.text();
        assert.ok(!js.includes(': number'));
        assert.ok(js.includes('= 1'));
        assert.equal(first.headers.get('cache-control'), process.env.NODE_ENV === 'production' ? null : 'no-store');
        const { mtime } = statSync(file);
        writeFileSync(file, 'export const value: number = 2;');
        utimesSync(file, mtime, mtime);
        const second = await (await fetch(base + '/module.ts')).text();
        assert.ok(second.includes(process.env.NODE_ENV === 'production' ? '= 1' : '= 2'));
        utimesSync(file, mtime, new Date(mtime.getTime() + 2000));
        assert.ok((await (await fetch(base + '/module.ts')).text()).includes('= 2'));
        for (const route of ['/missing.ts', '/module.js', '/plain.css', '/folder.ts']) {
          assert.equal((await fetch(base + route)).status, 404);
        }
        rmSync(file);
        assert.equal((await fetch(base + '/module.ts')).status, 404);
      } finally {
        await new Promise(resolve => server.close(resolve));
        rmSync(dir, { recursive: true, force: true });
      }
    `;

for (const mode of ["production", "development"]) {
  void test(`TypeScript middleware in ${mode}`, () => {
    execFileSync(process.execPath, ["--input-type=module", "-e", middlewareScenario], {
      env: { ...process.env, NODE_ENV: mode, npm_lifecycle_event: "test" },
      stdio: "pipe",
    });
  });
}
