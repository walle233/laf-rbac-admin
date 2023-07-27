
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

  const { collectionName, displayName } = ctx.body;
  if (!collectionName || !displayName) {
    return 'displayName & collectionName cannot be empty';
  }

  // check collectionName
  const whiteList = ['schema', 'schema-api', 'admin', 'role', 'permission', 'password', 'user', 'user-token'];
  if (whiteList.indexOf(collectionName) > -1) {
    return 'collectionName cannot be ' + whiteList.join(', ');
  }

  // check exist
  const { total } = await db.collection('schema-api').where({ collectionName }).count();
  if (total > 0) {
    await db.collection('schema-api').where({ collectionName }).remove();
  }

  const api = {
    displayName: displayName,
    collectionName: collectionName,
    enable: false,
    apis: {
      "read": {
        "target": "api-cms-schema",
        "enable": false,
        "token": false,
        "tokenEdit": true,
        "displayName": "读取 / Read",
        "url": `/api/cms/schema/${collectionName}/{id}`,
        "method": "GET",
        "params": {
          'id': '数据ID（可选:传入ID返回对应数据，不传则返回列表）',
          'page': '分页(列表可选)',
          'count': '分页数据数(列表可选)',
          'order': '排序字段(列表可选)',
        },
        "body": {},
      },
      "add": {
        "target": "api-cms-schema",
        "enable": false,
        "token": false,
        "tokenEdit": true,
        "displayName": "添加 / Add",
        "url": `/api/cms/schema/${collectionName}`,
        "method": "POST",
        "params": {},
        "body": {},
      },
      "update": {
        "target": "api-cms-schema",
        "enable": false,
        "token": false,
        "tokenEdit": true,
        "displayName": "更新 / Update",
        "url": `/api/cms/schema/${collectionName}/{id}`,
        "method": "PUT",
        "params": {},
        "body": {},
      },
      "remove": {
        "target": "api-cms-schema",
        "enable": false,
        "token": false,
        "tokenEdit": true,
        "displayName": "删除 / Remove",
        "url": `/api/cms/schema/${collectionName}/{id}`,
        "method": "DELETE",
        "params": {},
        "body": {},
      }
    },
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
