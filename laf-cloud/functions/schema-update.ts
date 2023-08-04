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

  const { data: schemaApi } = await db.collection('schema-api').where({ 'collectionName': schema.collectionName }).getOne();

  const sdata = { updated_at: Date.now() } as any;
  const data = { updated_at: Date.now() } as any;

  if (collectionName) {
    // check collectionName
    const whiteList = ['schema', 'admin', 'role', 'permission', 'password'];
    if (whiteList.indexOf(collectionName) > -1) {
      return 'collectionName cannot be ' + whiteList.join(', ');
    }

    data.collectionName = collectionName;
    sdata.collectionName = collectionName;
    mongodb.renameCollection(schema.collectionName, collectionName);
  }

  if (displayName) {
    data.displayName = displayName;
    sdata.displayName = displayName;
  }

  if (fields) {
    data.fields = fields;

    const addFiledBody = {};
    const updateFiledBody = {};
    fields
      .filter((field) => {
        return !(field.name == 'updated_at' || field.name == 'created_at');
      })
      .forEach((field) => {
        addFiledBody[field.name] = `${field.displayName}(${field.isRequired ? '必须' : '可选'
          } | ${field.type})`;
        updateFiledBody[field.name] = `${field.displayName}(可选 | ${field.type})`;
      });
    sdata.apis = {
      'add': { 'body': addFiledBody },
      'update': { 'body': updateFiledBody },
    }
  }

  if (description) {
    data.description = description;
  }


  // update schema
  if (sdata) {
    const sapi = db.collection('schema-api').doc(schemaApi._id);
    await sapi.update({
      apis: {
        "read": {
          "body": db.command.remove(),
        },
        "add": {
          "body": db.command.remove(),
        },
        "update": {
          "body": db.command.remove(),
        },
        "remove": {
          "body": db.command.remove(),
        }
      }
    });
    await sapi.update(sdata);
  }
  const r = await db.collection('schema').where({ _id }).update(data);

  return {
    code: 0,
    result: r,
  };
}
