---
estimated_steps: 4
estimated_files: 3
---

# T01: Create tsconfig.json, wire Vite alias, and run shadcn init

**Slice:** S01 — Bootstrap + Theme
**Milestone:** M002

## Description

shadcn CLI requires two prerequisites before it can run: (1) a `tsconfig.json` with an `@/*` path alias and (2) a matching Vite `resolve.alias`. Neither exists today. Once those are in place, run `npx shadcn@latest init --preset nova --template vite --yes` from `client/` to scaffold the foundational shadcn artifacts: `components.json`, `src/lib/utils.ts`, and `src/components/ui/button.tsx`. Run `npm install` to pull in the new dependencies. This task produces the contract boundary that all downstream slices depend on.

Note: After init, `index.css` will have v4-incompatible imports and wrong CSS variables — that is expected and will be fixed in T02.

## Steps

1. Create `client/tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. Edit `client/vite.config.js` to add `import path from 'path'` at the top and a `resolve.alias` entry:
   ```js
   import path from 'path'
   // ...existing imports...
   export default defineConfig({
     plugins: [react()],
     resolve: {
       alias: {
         "@": path.resolve(__dirname, "./src"),
       },
     },
   })
   ```

3. Run shadcn init from the `client/` directory:
   ```bash
   cd client && npx shadcn@latest init --preset nova --template vite --yes
   ```
   Accept all defaults. This creates `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`, and patches `index.css` and `package.json`.

4. Run `npm install` from `client/` to install new deps (`radix-ui`, `class-variance-authority`, `shadcn`, `tw-animate-css`, `@fontsource-variable/geist`):
   ```bash
   cd client && npm install
   ```

## Must-Haves

- [ ] `client/tsconfig.json` exists with `compilerOptions.paths["@/*"]`
- [ ] `client/vite.config.js` has `resolve.alias` with `"@"` pointing to `./src`
- [ ] `client/components.json` exists
- [ ] `client/src/lib/utils.ts` exists and exports `cn`
- [ ] `client/src/components/ui/button.tsx` exists
- [ ] `npm install` completes without error

## Verification

- `ls client/tsconfig.json` — exits 0
- `ls client/components.json` — exits 0
- `ls client/src/lib/utils.ts` — exits 0
- `ls client/src/components/ui/button.tsx` — exits 0
- `grep "cn" client/src/lib/utils.ts` — confirms cn function is exported
- `grep '"@/*"' client/tsconfig.json` — confirms path alias present

## Observability Impact

- Signals added/changed: None at runtime; build-time — Vite alias enables `@/` imports throughout the codebase for all future generated components
- How a future agent inspects this: `cat client/components.json` shows iconLibrary, style, and tsx settings; `cat client/src/lib/utils.ts` shows cn implementation
- Failure state exposed: If shadcn init fails, error message will state "No import alias found in your tsconfig.json file" — check tsconfig.json was created before running init

## Inputs

- `client/vite.config.js` — existing Vite config to be patched with alias
- `client/package.json` — existing deps; shadcn init will add to this file

## Expected Output

- `client/tsconfig.json` — new file with `@/*` path alias
- `client/vite.config.js` — patched with path import and resolve.alias
- `client/components.json` — generated shadcn config (nova preset, lucide icons, tsx:true)
- `client/src/lib/utils.ts` — generated cn() utility using clsx + tailwind-merge
- `client/src/components/ui/button.tsx` — generated Button component with variant/size API
- `client/package.json` — updated with new deps from shadcn init
