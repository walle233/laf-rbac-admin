import cloud from '@lafjs/cloud';
const mongodb = cloud.mongo.db;

export async function main(ctx: FunctionContext) {
  console.log('Hello World');
  mongodb.renameCollection('test', 'test_new');
  return { data: 'hi, laf' };
}
