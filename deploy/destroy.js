// This script removes all AWS resources
import { promises as fs } from 'fs';
import { execSync } from 'child_process';

try {
  // Running dev or prod?
  if (process.argv.length === 2) {
    console.error('Usage: npm run destroy prod|dev');
    process.exit(1);
  }
  let args = process.argv.slice(2);
  let deployType = args[0];

  let buildDir = 'build/';

  if (deployType === 'prod') {
    buildDir += deployType;
  } else if (deployType === 'dev') {
    buildDir += deployType;
  } else {
    console.error('Usage: npm run destroy prod|dev');
    process.exit(1);
  }

  execSync(`cd ${buildDir} && terraform init && terraform destroy -auto-approve`, { stdio: 'inherit' });

}
catch (err) {
  console.log(err);
}
