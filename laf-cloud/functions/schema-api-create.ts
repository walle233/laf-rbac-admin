
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

  const { collectionName, enable, list, read, add, update, remote } = ctx.body;
  if (!collectionName) {
    return 'displayName or collectionName cannot be empty';
  }

  // check collectionName
  const whiteList = ['schema', 'schema-api', 'admin', 'role', 'permission', 'password'];
  if (whiteList.indexOf(collectionName) > -1) {
    return 'collectionName cannot be ' + whiteList.join(', ');
  }

  // check exist
  const { total } = await db.collection('schema-api').where({ collectionName }).count();
  if (total > 0) {
    await db.collection('schema-api').where({ collectionName }).remove();
  }

  const api = {
    collectionName:collectionName,
    enable: false,
    list:false,
    read:false,
    add:false,
    update:false,
    remote:false,
    created_at: Date.now(),
    updated_at: Date.now(),
  };

  // add collection to schema
  const addRes = await db.collection('schema-api').add(api);

  return {
    code: 0,
    data: addRes,
  };

}
