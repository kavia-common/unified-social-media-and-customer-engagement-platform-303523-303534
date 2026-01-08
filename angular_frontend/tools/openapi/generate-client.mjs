import path from 'node:path';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const projectRoot = process.cwd();

function main() {
  const inputSpec = path.join(projectRoot, 'src', 'app', 'api', 'generated', 'openapi.json');
  const outputDir = path.join(projectRoot, 'src', 'app', 'api', 'generated', 'client');

  if (!fs.existsSync(inputSpec)) {
    throw new Error(
      `OpenAPI spec not found at ${path.relative(projectRoot, inputSpec)}. Run "npm run openapi:fetch" first.`
    );
  }

  fs.mkdirSync(outputDir, { recursive: true });

  // Use local CLI (installed in devDependencies).
  const cli = path.join(projectRoot, 'node_modules', '.bin', 'openapi-generator-cli');

  // Generate Angular client.
  execFileSync(
    cli,
    [
      'generate',
      '-g',
      'typescript-angular',
      '-i',
      inputSpec,
      '-o',
      outputDir,

      // Keep paths clean and compatible with Angular 19.
      '--additional-properties',
      [
        'ngVersion=19.0.0',
        'providedInRoot=true',
        'stringEnums=true',
        'withInterfaces=true',
        'npmName=@generated/api',
        'npmVersion=0.0.0'
      ].join(',')
    ],
    { stdio: 'inherit' }
  );

  console.log(`Generated Angular client into ${path.relative(projectRoot, outputDir)}`);
}

main();
