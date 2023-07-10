import cloud from '@lafjs/cloud';

const db = cloud.database();
const mongodb = cloud.mongo.db;

export async function main(ctx: FunctionContext) {
  const { headers } = ctx;
  const token = headers['authorization'].split(' ')[1];
  const parsed = cloud.parseToken(token);
  const uid = parsed.uid;
  if (!uid) {
    return 'Unauthorized';
  }

  const { displayName, collectionName, fields = [], description } = ctx.body;
  if (!displayName || !collectionName) {
    return 'displayName or collectionName cannot be empty';
  }

  // check collectionName
  const whiteList = ['schema','schema-api', 'admin', 'role', 'permission', 'password'];
  if (whiteList.indexOf(collectionName) > -1) {
    return 'collectionName cannot be ' + whiteList.join(', ');
  }

  // check exist
  const { total } = await db.collection('schema').where({ collectionName }).count();
  if (total > 0) {
    return 'schema already exists';
  }

  const schema = {
    displayName,
    collectionName,
    fields: [
      ...fields,
      {
        displayName: '创建时间',
        name: 'created_at',
        type: 'DateTime',
        dateFormatType: 'timestamp-ms',
        id: 'created_at',
        isSystem: true,
        description: 'CMS 系统字段，请勿随意修改。通过 CMS 系统录入的数据会默认添加该字段',
      },
      {
        displayName: '更新时间',
        name: 'updated_at',
        type: 'DateTime',
        dateFormatType: 'timestamp-ms',
        id: 'updated_at',
        isSystem: true,
        description: 'CMS 系统字段，请勿随意修改。通过 CMS 系统录入的数据会默认添加该字段',
      },
    ],
    description,
    created_at: Date.now(),
    updated_at: Date.now(),
  };

  // add collection to schema
  const addRes = await db.collection('schema').add(schema);

  // add collection to mongodb
  await mongodb.createCollection(collectionName);

  return {
    code: 0,
    data: addRes,
  };
}
