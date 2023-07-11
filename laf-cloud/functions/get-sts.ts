import cloud from '@lafjs/cloud';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';

export async function main() {
  const sts: any = new STSClient({
    region: cloud.env.OSS_REGION,
    endpoint: cloud.env.OSS_INTERNAL_ENDPOINT,
    credentials: {
      accessKeyId: cloud.env.OSS_ACCESS_KEY || '',
      secretAccessKey: cloud.env.OSS_ACCESS_SECRET || '',
    },
  });

  const cmd = new AssumeRoleCommand({
    DurationSeconds: 3600,
    Policy:
      '{"Version":"2012-10-17","Statement":[{"Sid":"Stmt1","Effect":"Allow","Action":"s3:*","Resource":"arn:aws:s3:::*"}]}',
    RoleArn: 'arn:xxx:xxx:xxx:xxxx',
    RoleSessionName: cloud.appid,
  });

  const res = await sts.send(cmd);

  return {
    credentials: res.Credentials,
    endpoint: cloud.env.OSS_POINT,
    region: cloud.env.OSS_REGION,
  };
}
