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

  const { _id, collectionName, fields, displayName, description } = ctx.body;
  if (!_id) {
    return '_id cannot be empty';
  }

  // check id
  const { data: schema } = await db.collection('schema').where({ _id }).getOne();
  if (!schema) {
    return { code: 'INVALID_PARAM', error: 'not exists' };
  }

  const data = { updated_at: Date.now() } as any;

  if (collectionName) {
    data.collectionName = collectionName;
    mongodb.renameCollection(schema.collectionName, collectionName);
  }

  if (displayName) {
    data.displayName = displayName;
  }

  if (fields) {
    data.fields = fields;
  }

  if (description) {
    data.description = description;
  }

  // update schema
  const r = await db.collection('schema').where({ _id }).update(data);

  return {
    code: 0,
    result: r,
  };
}
