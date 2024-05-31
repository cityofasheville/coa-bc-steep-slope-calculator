import fs from 'fs/promises';
import { role_settings, vpc_role_settings, secrets_manager_role_settings, invoke_lambda_role_settings, s3_role_settings, ses_role_settings } from './settings/role_settings.js';

async function build_role(config) {
  let roleresult = role_settings(config);

  if(config.lambda_options.vpc === 'true') {
    roleresult = roleresult + vpc_role_settings(config);
  }
  if(config.lambda_options.secrets_manager === 'true') {
    roleresult = roleresult + secrets_manager_role_settings(config);
  }
  if(config.lambda_options.invoke_lambda === 'true') {
    roleresult = roleresult + invoke_lambda_role_settings(config);
  }
  if(config.lambda_options.s3 === 'true') {
    roleresult = roleresult + s3_role_settings(config);
  }
  if(config.lambda_options.ses === 'true') {
    roleresult = roleresult + ses_role_settings(config);
  }
  
  await fs.writeFile(`${config.build_dir}/role.tf`, roleresult, 'utf8');
}

export {build_role};