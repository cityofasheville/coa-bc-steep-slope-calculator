// This script sets up the "build" directory structure for deployment to AWS Lambda
import { promises as fs } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url)); // current directory

let buildDir = 'build';

try {
  // create empty build dir
  await fs.rm('./' + buildDir, { force: true, recursive: true });
  await fs.mkdir('./' + buildDir);

  // copy all deploy files to build dir
  let filelist = await fs.readdir(__dirname);
  filelist
  .filter(file => file !== 'deploy.js' && file !== buildDir)
  .forEach(async file => {
    await fs.copyFile(file, './' + buildDir + '/' + file);
  });

  // get name of Lambda from .env variable "prog_name" and replace in Terraform files
  let env = await fs.readFile('../.env', 'utf8');
  let lambdaName = env.split('\n').find(line => line.startsWith('prog_name')).split('=')[1].replace(/"| /g, '');
  let terraformFiles = await fs.readdir('./build');
  terraformFiles
  .filter(file => file.endsWith('.tf'))
  .forEach(async file => {
    let data = await fs.readFile('./build/' + file, 'utf8');
    let result = data.replace(/\$\{prog_name\}/g, lambdaName);
    await fs.writeFile('./build/' + file, result, 'utf8');
  });

  // Copy files into "nodejs" and "funcdir" subdirectories for zip files
  await fs.mkdir('./build/nodejs');
  await fs.copyFile('../package.json', './build/nodejs/package.json');
  await fs.copyFile('../package-lock.json', './build/nodejs/package-lock.json');

  await fs.mkdir('./build/funcdir');
  await fs.cp('../src/', './build/funcdir/', { recursive: true });
  await fs.copyFile('../package.json', './build/funcdir/package.json');
}
catch (err) {
  console.log(err);
}
