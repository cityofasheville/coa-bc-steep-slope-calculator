
import fs from 'fs/promises';
import { main_settings } from './settings/main_settings.js';
import { api_gateway_settings } from './settings/api_gateway_settings.js';
import { lambda_url_settings } from './settings/lambda_url_settings.js';

async function build_main(config) {
  // build config.tf file
  let configresult = main_settings(config);

  // lambda url settings
  if (config.lambda_options.lambda_url === 'true') {
    configresult = configresult + lambda_url_settings(config);
  }
  // api_gateway settings
  if (config.lambda_options.api_gateway === 'true') {
    configresult = configresult + api_gateway_settings(config);
  }
  await fs.writeFile(`${config.build_dir}/config.tf`, configresult, 'utf8');
}

export {build_main};