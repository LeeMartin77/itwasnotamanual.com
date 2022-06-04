import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import {
  CorsHttpMethod,
  DomainName,
  HttpApi,
  HttpMethod,
} from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as path from 'path';
import { RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGatewayv2DomainProperties } from 'aws-cdk-lib/aws-route53-targets';
import { corsOrigins } from '../util/configuration';

export class APIStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const predictionsTable = new dynamodb.Table(this, 'itwasntamanualPredictions', {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: {
        name: "pageUrl",
        type: dynamodb.AttributeType.STRING
      }
    })

    predictionsTable.addGlobalSecondaryIndex({
      indexName: "openlibraryid-wiki",
      partitionKey: {
        name: "openlibraryid",
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: "wiki",
        type: dynamodb.AttributeType.STRING
      }
    })

    const zone = route53.HostedZone.fromLookup(this, 'itwasntamanualZone', {
      domainName: 'itwasntamanual.com'
    });

    const backingApiDomain = 'backing-api.itwasntamanual.com'

    const backingCertificate = new acm.Certificate(this, 'backingapiitwasntamanualcomCertificate', {
      domainName: backingApiDomain,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    const backingDomainName = new DomainName(this, 'backingApiDomainNameRef', {
      domainName: backingApiDomain,
      certificate: backingCertificate
    })

    const corsMethods = [
      CorsHttpMethod.OPTIONS,
      CorsHttpMethod.GET,
      CorsHttpMethod.POST,
    ]

    const httpApi = new HttpApi(this, "itwasntamanualcomLambdaApi", {
      description: 'ItWasntAManual Http Api',
      defaultDomainMapping: {
        domainName: backingDomainName
      },
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: corsMethods,
        allowOrigins: corsOrigins,
        allowCredentials: true,
      },
    });

    new route53.ARecord(this, 'BackingApi53', {
      zone: zone,
      recordName: "backing-api",
      target: RecordTarget.fromAlias(new ApiGatewayv2DomainProperties(backingDomainName.regionalDomainName, backingDomainName.regionalHostedZoneId))
    });

    const lambdas = [
      {
        handler: 'main',
        lambdaFile: 'getPredictions.ts',
        endpointPath: '/predictions',
        methods: [HttpMethod.GET]
      },
      {
        handler: 'main',
        lambdaFile: 'getPredictionByUrl.ts',
        endpointPath: '/prediction/{predictionUrl}',
        methods: [HttpMethod.GET]
      },
      {
        handler: 'main',
        lambdaFile: 'getRandomPrediction.ts',
        endpointPath: '/prediction/random',
        methods: [HttpMethod.GET]
      },
      {
        handler: 'main',
        lambdaFile: 'createPrediction.ts',
        endpointPath: '/prediction',
        methods: [HttpMethod.POST]
      },
    ]

    lambdas.forEach(({handler, lambdaFile, endpointPath, methods}) => {
      const lambdaFunction = new NodejsFunction(this, "itwasntamanual"+ methods.join()+endpointPath, {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler,
        entry: path.join(__dirname, '..', 'lambdas', lambdaFile),
        timeout: cdk.Duration.seconds(10),
        memorySize: 256,
        bundling: {
          externalModules: ['aws-sdk'],
          
        },
        environment: {
          PREDICTIONS_TABLE_NAME: predictionsTable.tableName
        }
      })

      predictionsTable.grantReadWriteData(lambdaFunction)
  
      httpApi.addRoutes({
        path: endpointPath,
        methods: methods,
        integration: new HttpLambdaIntegration(
          endpointPath,
          lambdaFunction
        )
      })  
    })

    const domainName = `api.itwasntamanual.com`

    const certificate = new acm.Certificate(this, 'apiitwasntamanualcomCertificate', {
      domainName,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    const cachePolicy = new cloudfront.CachePolicy(this, 'defaultCachePolicy', {
      maxTtl: cdk.Duration.hours(8),
      // This is more to stop things getting absolutely clobbered
      defaultTtl: cdk.Duration.minutes(30),
    })

    const responseHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'CloudfrontCorsHeaders', {
      corsBehavior: {
        accessControlAllowMethods: corsMethods,
        accessControlAllowOrigins: corsOrigins,
        accessControlAllowCredentials: false,
        accessControlAllowHeaders: ['*'],
        originOverride: true
      }
    }); 

    const cfDist = new cloudfront.Distribution(this, 'itwasntamanualcomDistribution', {
      defaultBehavior: { 
        origin: new origins.HttpOrigin(backingApiDomain),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy,
        responseHeadersPolicy
      },
      certificate: certificate,
      domainNames: [domainName]
    });

    
    new route53.CnameRecord(this, 'API53', {
      zone: zone,
      recordName: "api",
      domainName: cfDist.distributionDomainName,
    });

    new cdk.CfnOutput(this, "ApiCloudfrontDistributionId", { value: cfDist.distributionId });
  }
}