import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as route53Pats from 'aws-cdk-lib/aws-route53-patterns'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import * as lambda from 'aws-cdk-lib/aws-lambda'

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);


    const domainName = `www.itwasntamanual.com`

    const frontendS3Bucket = new s3.Bucket(this, 'itwasntamanual.com', {
      removalPolicy: RemovalPolicy.DESTROY,
    })

    new s3deploy.BucketDeployment(this, 'DeployitwasntamanualcomWebsite', {
      sources: [s3deploy.Source.asset('../client/build')],
      destinationBucket: frontendS3Bucket
    })

    const frontendS3BucketOriginAccess = new OriginAccessIdentity(this, 'FrontendOriginAccess', {});
    frontendS3Bucket.grantRead(frontendS3BucketOriginAccess);

    const zone = route53.HostedZone.fromLookup(this, 'itwasntamanualZone', {
      domainName: 'itwasntamanual.com'
    });

    const certificate = new acm.Certificate(this, 'itwasntamanualcomCertificate', {
      domainName,
      validation: acm.CertificateValidation.fromDns(zone),
    });

    const edgeFunction = new cloudfront.experimental.EdgeFunction(this, 'IndexHtmlRedirectFunction', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'slashDirector.handler',
      code: lambda.Code.fromAsset('./lambdas'),
    });

    const cfDist = new cloudfront.Distribution(this, 'itwasntamanualcomDistribution', {
      defaultBehavior: { 
          origin: new origins.S3Origin(frontendS3Bucket, {
              originAccessIdentity: frontendS3BucketOriginAccess
            }),
          edgeLambdas: [
            {
              functionVersion: edgeFunction.currentVersion,
              eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST
            }
          ],
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html'
        }
      ],
      certificate: certificate,
      domainNames: [domainName]
    });


    new route53.CnameRecord(this, 'Frontend53', {
      zone: zone,
      recordName: "www",
      domainName: cfDist.distributionDomainName,
    });

    new route53Pats.HttpsRedirect(this, 'www redirect',  {
      zone: zone,
      recordNames: ['itwasntamanual.com'],
      targetDomain: 'www.itwasntamanual.com'
    })

    new cdk.CfnOutput(this, 'frontendCloudfrontDistributionId', { value: cfDist.distributionId });
  }
}
