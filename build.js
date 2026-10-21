/**
 * CipherMind AI - Programmatic Build Pipeline
 * Executes Vite client build and esbuild server compilation via JavaScript APIs.
 * Eliminates shell binary resolution issues and guarantees output in dist/.
 */

import { build as buildClient } from 'vite';
import esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, 'dist');

async function runBuild() {
  console.log('⚡ [CipherMind AI] Initializing production build pipeline...');
  console.log('📂 Working directory:', __dirname);
  console.log('🎯 Target output directory:', distDir);

  // 1. Compile React SPA Client with Vite
  console.log('📦 [1/2] Compiling React client with Vite...');
  await buildClient({
    root: __dirname,
    configFile: path.resolve(__dirname, 'vite.config.ts'),
    build: {
      outDir: distDir,
      emptyOutDir: true,
    },
  });

  // Verify that dist and dist/index.html exist
  if (!fs.existsSync(distDir) || !fs.existsSync(path.resolve(distDir, 'index.html'))) {
    throw new Error(`CRITICAL: dist directory was not created at ${distDir}!`);
  }

  const generatedFiles = fs.readdirSync(distDir);
  console.log('✓ [1/2] Client build complete -> dist/ (' + generatedFiles.length + ' files: ' + generatedFiles.join(', ') + ')');

  // 2. Compile Express / Gemini Server with esbuild
  console.log('⚙️  [2/2] Compiling backend server.ts with esbuild...');
  await esbuild.build({
    entryPoints: ['server.ts'],
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outfile: path.resolve(__dirname, 'server.js'),
  });
  console.log('✓ [2/2] Server compilation complete -> server.js');

  console.log('🎉 [CipherMind AI] Full build finished successfully with dist/ present.');
}

runBuild().catch((err) => {
  console.error('❌ [CipherMind AI] Build failed:', err);
  process.exit(1);
});
