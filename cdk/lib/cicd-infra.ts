import * as cdk from '@aws-cdk/core';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as ecr from '@aws-cdk/aws-ecr'
import * as iam from '@aws-cdk/aws-iam';
import * as pipelines from '@aws-cdk/pipelines';

import { LocalDeploymentStage } from './local-deployment';

// NOTE: Create the pipeline and CI/CD infra such as ECR/S3
export class CicdInfraStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sourceArtifact = new codepipeline.Artifact();
    const cdkOutputArtifact = new codepipeline.Artifact();

    const pipeline = new pipelines.CdkPipeline(this, 'CdkPipeline', {
      selfMutating: true,
      pipelineName: 'cdk-cdkpipeline',
      cloudAssemblyArtifact: cdkOutputArtifact,

      sourceAction: new codepipeline_actions.GitHubSourceAction({
        actionName: 'DownloadSources',

        // NOTE: Specify your source repository here.
        owner: 'bitedd',
        repo: 'demo-tesolar-post-api',
        oauthToken: cdk.SecretValue.secretsManager('testsecret-201219', {
          jsonField: 'github-token'
        }),
        output: sourceArtifact,
      }),

      synthAction: pipelines.SimpleSynthAction.standardNpmSynth({
        sourceArtifact: sourceArtifact,
        cloudAssemblyArtifact: cdkOutputArtifact,
        subdirectory: 'cdk',
        //synthCommand: 'cdk  deploy CicdInfraStack --require-approval=never --verbos',
      }),
    });

    // Build and Publish application artifacts
    const repository = new ecr.Repository(this, 'Repository', {
      repositoryName: 'demo-tesolar-post-api/app',
    });

    const buildRole = new iam.Role(this, 'DockerBuildRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
    });
    repository.grantPullPush(buildRole);

    const buildStage = pipeline.addStage('AppBuild')
    buildStage.addActions(new codepipeline_actions.CodeBuildAction({
      actionName: 'DockerBuild201222',
      input: sourceArtifact,
      project: new codebuild.Project(this, 'DockerBuild201222', {
        role: buildRole,
        environment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_4_0,
          privileged: true,
        },
        buildSpec: this.getDockerBuildSpec(repository.repositoryUri),
      }),
    }));

    // Deploy - Local
    const localStage = new LocalDeploymentStage(this, 'AppDeployLocal');
    pipeline.addApplicationStage(localStage);
  }

  getDockerBuildSpec(repositoryUri: string): codebuild.BuildSpec {
    return codebuild.BuildSpec.fromObject({
      version: '0.2',
      phases: {
        pre_build: {
          commands: [
            'echo Logging in to Amazon ECR...',
            '$(aws ecr get-login --no-include-email --region $AWS_DEFAULT_REGION)',
            'docker login --username closeyes2devops --password sdif235S12hn3lfhHL4Odi'
          ]
        },
        build: {
          commands: [
            'echo Build started on `date`',
            'echo Building the Docker image...',
            `docker build -t ${repositoryUri}:$CODEBUILD_RESOLVED_SOURCE_VERSION .`,
          ]
        },
        post_build: {
          commands: [
            'echo Build completed on `date`',
            'echo Pushing the Docker image...',
            `docker push ${repositoryUri}:$CODEBUILD_RESOLVED_SOURCE_VERSION`,
          ]
        },
      },
    });
  }
}
