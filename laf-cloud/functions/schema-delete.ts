import cloud from '@lafjs/cloud';

const db = cloud.database();
const mongodb = cloud.mongo.db;

const shared = cloud.shared;
const checkPermission = shared.get('checkPermission');

export async function main(ctx: FunctionContext) {
  const { headers } = ctx;
  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) {
    return 'Unauthorized';
  }

  // check permission
  const code = await checkPermission(uid, 'schema.edit');
  if (code) {
    return 'Permission denied';
  }

  const { schemaId, deleteCollection } = ctx.body;
  if (!schemaId) {
    return '_id cannot be empty';
  }

  // check id
  const { data: schema } = await db.collection('schema').doc(schemaId).get();
  if (!schema) {
    return { code: 'INVALID_PARAM', error: 'not exists' };
  }

  // delete schema
  const res = await db.collection('schema').doc(schemaId).remove();

  // delete collection
  if (deleteCollection) {
    mongodb.dropCollection(schema.collectionName);
  } else {
    mongodb.renameCollection(schema.collectionName, `${schema.collectionName}-${Date.now()}`)
  }

  return {
    code: 0,
    data: res,
  };
}
