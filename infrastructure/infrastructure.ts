#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FrontendInfrastructureStack } from './substacks/frontend-stack';

const app = new cdk.App();
// The name of this is annoying but I don't want to rebuild just for that
const result = new FrontendInfrastructureStack(app, 'InfrastructureStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' },
});

