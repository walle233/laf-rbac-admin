import cloud from '@lafjs/cloud';

const db = cloud.database();

export async function main(ctx: FunctionContext) {
  // check permission
  const token = ctx.headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) return { code: 'NO_AUTH', error: 'permission denied' };

  const { _id } = ctx.body;

  const { data: schema } = await db.collection('schema').where(
    db.command.or({ _id: _id }, { collectionName: _id })
  ).getOne();

  return {
    code: 0,
    result: schema,
  };
}
