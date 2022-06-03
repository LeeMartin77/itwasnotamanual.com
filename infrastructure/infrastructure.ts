#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontendInfrastructureStack } from './substacks/frontend-stack';
import { APIStack } from './substacks/api-stack';

const app = new cdk.App();
// The name of this is annoying but I don't want to rebuild just for that
new FrontendInfrastructureStack(app, 'InfrastructureStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
});


new APIStack(app, 'APIStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
});
