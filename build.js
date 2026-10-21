/**
 * CipherMind AI - Programmatic Build Pipeline
 * Executes Vite client build and esbuild server compilation via JavaScript APIs.
 * Eliminates shell binary resolution issues (sh: line 1: vite: command not found).
 */

import { build as buildClient } from 'vite';
import esbuild from 'esbuild';

async function runBuild() {
  console.log('⚡ [CipherMind AI] Initializing production build pipeline...');

  // 1. Compile React SPA Client with Vite
  console.log('📦 [1/2] Compiling React client with Vite...');
  await buildClient();
  console.log('✓ [1/2] Client build complete -> dist/');

  // 2. Compile Express / Gemini Server with esbuild
  console.log('⚙️  [2/2] Compiling backend server.ts with esbuild...');
  await esbuild.build({
    entryPoints: ['server.ts'],
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outfile: 'server.js',
  });
  console.log('✓ [2/2] Server compilation complete -> server.js');

  console.log('🎉 [CipherMind AI] Full build finished successfully.');
}

runBuild().catch((err) => {
  console.error('❌ [CipherMind AI] Build failed:', err);
  process.exit(1);
});
