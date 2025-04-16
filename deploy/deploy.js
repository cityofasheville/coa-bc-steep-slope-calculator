// This script sets up the "build" directory structure for deployment to AWS Lambda
import fs from 'fs/promises';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import YAML from 'yaml';

import { vpc_settings } from './settings/vpc_settings.js';
import { build_main } from './build_main.js';
import { build_role } from './build_role.js';


try {
  const __deploy_dir = dirname(fileURLToPath(import.meta.url)); // current directory

  const file = await fs.readFile(`${__deploy_dir}/deploy.yaml`, 'utf8');
  let config = YAML.parse(file);
  config.deploy_dir = __deploy_dir;
  const gitBranch = execSync('git branch --show-current').toString().trim();

  // get Lambda environment variables from .env file
  try {
    config.env_variables = await fs.readFile(`${__deploy_dir}/../.env`, 'utf8');
    config.env_variables = config.env_variables.split('\n').filter(line => !line.startsWith('#')).join('\n');
  } catch (err) {
    config.env_variables = '';
  }

  // // Get dev or prod from command line
  // if (process.argv.length !== 3 || (process.argv[2] !== 'prod' && process.argv[2] !== 'dev')) {
  //   console.error('Usage: npm run deploy prod|dev');
  //   process.exit(1);
  // }
  let deploy_type = gitBranch; // prod or dev

  // determine Lambda name
  if (deploy_type === 'production' || deploy_type === 'main') {
    config.prog_name = config.lambda_name;
    config.build_dir = 'build/prod';
  } else if (deploy_type === 'development') {
    config.prog_name = config.lambda_name + '_dev';
    config.build_dir = 'build/dev';
  } else {
    config.prog_name = config.lambda_name + '_' + deploy_type;
    config.build_dir = 'build/' + deploy_type;
  }

  // Set domain name and certificate for API Gateway
  if (config.lambda_options.api_gateway === 'true') {
    let prodDomain = config.api_gateway_settings.production_domain_name;
    let prodCertificateArn = config.api_gateway_settings.production_certificate_arn;
    let devDomain = config.api_gateway_settings.development_domain_name ?? prodDomain;
    let devCertificateArn = config.api_gateway_settings.development_certificate_arn ?? prodCertificateArn;
  
    if (deploy_type === 'production' || deploy_type === 'main') {
      config.domain_name = prodDomain;
      config.certificate_arn = prodCertificateArn;
    } else if (deploy_type === 'development') {
      config.domain_name = `dev-${devDomain}`;
      config.certificate_arn = devCertificateArn;
    } else {
      config.domain_name = `${deploy_type}-${devDomain}`;
      config.certificate_arn = devCertificateArn;
    }
    
  } else {
    config.domain_name = '';
    config.certificate_arn = '';
  }

  // vpc settings
  if (config.lambda_options.vpc === 'true') {
    config.vpc_settings = vpc_settings(config);
  } else {
    config.vpc_settings = '';
  }

  // Set up files for deployment
  setUpFiles(config);
}
catch (err) {
  console.log(err);
}

async function setUpFiles(config) {
  let build_dir = config.build_dir;
  // create empty build dir
  await fs.rm('./' + build_dir, { force: true, recursive: true });
  await fs.mkdir('./' + build_dir, { force: true, recursive: true });

  // build config.tf file
  await build_main(config);

  // Build role.tf file
  await build_role(config);

  // Copy files into "funcdir" subdirectory for zip files
  await fs.mkdir(`${build_dir}/funcdir`);
  await fs.cp('../src/', `${build_dir}/funcdir/`, { recursive: true });
  await fs.copyFile('../package.json', `${build_dir}/funcdir/package.json`);

  // Build NodeJS or Python
  if (config.nodejs_or_python === 'nodejs') {
    await BuildNodeJS(build_dir);
  } else if (config.nodejs_or_python === 'python') {
    await fs.copyFile('template.yaml', `${build_dir}/template.yaml`)
    await BuildPython(build_dir, config.sam_deploy);
  }
///////////////////////////////////
 execSync(`cd ${build_dir} && terraform init && terraform apply -auto-approve`, { stdio: 'inherit' });
///////////////////////////////////
}

async function BuildPython(build_dir, sam_deploy) {
  // FOR PYTHON: Copy files into "python" and "funcdir" subdirectories for zip files
  await fs.copyFile('../src/requirements.txt', `${build_dir}/requirements.txt`);
  await fs.mkdir(`${build_dir}/python`);
  await fs.mkdir(`${build_dir}/python/python`);
  if (sam_deploy === 'true') {
    execSync(`cd ${build_dir}/ && ls && sam build --use-container`);
    await fs.rename(`${build_dir}/.aws-sam/build/program/`, `${build_dir}/python/python/`, { recursive: true });
  } else {
    execSync(`cd ${build_dir}/ && pip3 install -r requirements.txt --target ./python/python`);
  }
}

async function BuildNodeJS(build_dir) {
  // FOR NODEJS: Copy files into "nodejs" and "funcdir" subdirectories for zip files
  await fs.mkdir(`${build_dir}/nodejs`);
  await fs.copyFile('../package.json', `${build_dir}/nodejs/package.json`);
  await fs.copyFile('../package-lock.json', `${build_dir}/nodejs/package-lock.json`);

  execSync(`npm install --prefix ${build_dir}/nodejs --omit-dev`, { stdio: 'inherit' });
}