/**
 * CipherMind AI - Universal Build Pipeline
 * Compiles React SPA client via Vite and Express server via esbuild.
 * Ensures dist/, build/, and public/ are fully populated and synced across cwd and __dirname.
 */

import { build as buildClient } from 'vite';
import esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = process.cwd();

async function runBuild() {
  console.log('⚡ [CipherMind AI] Starting production build pipeline...');
  console.log('📂 __dirname:', __dirname);
  console.log('📂 process.cwd():', cwd);

  const primaryDist = path.resolve(__dirname, 'dist');

  // 1. Compile React SPA Client with Vite
  console.log('📦 [1/3] Compiling React client with Vite...');
  await buildClient({
    root: __dirname,
    configFile: path.resolve(__dirname, 'vite.config.ts'),
    build: {
      outDir: primaryDist,
      emptyOutDir: true,
    },
  });

  // Verify primary dist and index.html
  if (!fs.existsSync(primaryDist) || !fs.existsSync(path.resolve(primaryDist, 'index.html'))) {
    throw new Error(`CRITICAL: Primary dist/index.html was not generated at ${primaryDist}`);
  }

  const generatedFiles = fs.readdirSync(primaryDist);
  console.log(`✓ [1/3] Client build verified in dist/ (${generatedFiles.length} files: ${generatedFiles.join(', ')})`);

  // 2. Synchronize output to build/, public/, and cwd targets to guarantee Vercel/cloud compatibility
  console.log('🔄 [2/3] Synchronizing build artifacts across target directories...');
  const syncTargets = new Set([
    path.resolve(__dirname, 'build'),
    path.resolve(cwd, 'dist'),
    path.resolve(cwd, 'build'),
  ]);

  for (const targetDir of syncTargets) {
    if (targetDir !== primaryDist) {
      fs.mkdirSync(targetDir, { recursive: true });
      fs.cpSync(primaryDist, targetDir, { recursive: true });
      console.log(`   -> Synced to: ${targetDir}`);
    }
  }

  // Also copy index.html and assets into public/ as fallback
  const publicDir = path.resolve(__dirname, 'public');
  fs.mkdirSync(publicDir, { recursive: true });
  fs.cpSync(primaryDist, publicDir, { recursive: true });
  console.log(`   -> Synced to public/ directory`);

  // 3. Compile backend server.ts with esbuild
  console.log('⚙️  [3/3] Compiling backend server.ts with esbuild...');
  await esbuild.build({
    entryPoints: ['server.ts'],
    platform: 'node',
    format: 'esm',
    packages: 'external',
    outfile: path.resolve(__dirname, 'server.js'),
  });
  console.log('✓ [3/3] Server compilation complete -> server.js');

  console.log('🎉 [CipherMind AI] Full production build completed successfully.');
  console.log('   dist/ exists:', fs.existsSync(path.resolve(cwd, 'dist')));
  console.log('   dist/index.html exists:', fs.existsSync(path.resolve(cwd, 'dist', 'index.html')));
}

runBuild().catch((err) => {
  console.error('❌ [CipherMind AI] Build failed:', err);
  process.exit(1);
});
