// This script removes all AWS resources
import { promises as fs } from 'fs';
import { execSync } from 'child_process';

try {
  // Running dev or prod?
  const gitBranch = execSync('git branch --show-current').toString().trim();
  
  let deployType = gitBranch;

  let buildDir = 'build/';

  if (deployType === 'production' || deployType === 'main') {
    buildDir += 'prod';
  } else if (deployType === 'development') {
    buildDir += 'dev';
  } else {
    buildDir += deployType
  }

  execSync(`cd ${buildDir} && terraform init && terraform destroy -auto-approve`, { stdio: 'inherit' });

}
catch (err) {
  console.log(err);
}
