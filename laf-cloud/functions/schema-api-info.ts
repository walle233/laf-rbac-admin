
import cloud from '@lafjs/cloud'

const db = cloud.database();

export default async function (ctx: FunctionContext) {
  const token = ctx.headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) return { code: 'NO_AUTH', error: 'permission denied' };

  const { collectionName } = ctx.body;

  const {data:api} = await db.collection('schema-api').where({ collectionName: collectionName }).getOne();

  return {
    code: 0,
    result: api,
  };
}
