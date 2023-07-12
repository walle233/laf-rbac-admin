
import cloud from '@lafjs/cloud'

const db = cloud.database();


export default async function (ctx: FunctionContext) {
  const { headers } = ctx;
  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) {
    return 'Unauthorized';
  }


  const { _id, collectionName } = ctx.body;
  if (!_id && !collectionName) {
    return '_id or collectionName cannot be empty';
  }


  // check id
  const where = [];
  if (_id) {
    where.push({ _id: _id });
  }
  if (collectionName) {
    where.push({ collectionName: collectionName });
  }
  const { total } = await db.collection('schema-api').where(db.command.or(where)).count();
  if (total <= 0) {
    return { code: 0 };
  }

  // delete schema
  const res = await db.collection('schema-api').where(db.command.or(where)).remove();

  return {
    code: 0,
    data: res,
  };
}
