import cloud from '@lafjs/cloud'

const db = cloud.database();

export default async function (ctx: FunctionContext) {

  const { key } = ctx.body;

  const { data } = await db.collection('setting').where({ key }).getOne();

  return { code: 0, result: data }
}