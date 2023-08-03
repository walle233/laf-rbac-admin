/**
 * 本函数可用于初始化一套 RBAC 必要的数据，通常不需要删除此云函数，也不要开启 HTTP 调用。
 */
import cloud from '@lafjs/cloud';
import * as assert from 'assert';
import * as crypto from 'crypto';
const db = cloud.database();

export async function main() {

  // 创建初始化设置
  createSystemSetting();

  // 创建 RBAC 初始权限
  await createInitialPermissions();

  // 创建 RBAC 初始角色
  await createFirstRole();

  // 创建初始管理员
  await createFirstAdmin('admin', '123456');

  // 创建初始集合
  await createInitalSchema();

  // 创建初始集合接口
  await createInitalSchemaApi();

  return 'ok';
}

const sysEmail = {
  key: "email",
  emailAddr: '',
  smtpAddr: '',
  smtpPort: '',
  smtpName: '',
  smtpPassword: '',
}
const sysSetting = {
  key: 'basic',
  name: 'LafCms',
  logo: ['https://laf.run/logo.png'],
  icpCode: '',
  mobile: '',
  address: '',
  loginCode: '',
  systemOpen: true,
  closeText: '网站维护中...',
}

async function createSystemSetting() {
  await cloud.mongo.db.collection('setting').createIndex('key', { unique: true });
  try {
    for (const api of innerSchemaApis) {
      try {
        db.collection('setting').add(sysEmail);
        db.collection('setting').add(sysSetting);
      } catch (error) {
        if (error.code == 11000) {
          console.log('setting already exists');
          continue;
        }
        console.error(error.message);
      }
    }

  } catch (error) {

  }
}

/**
 * 预置 RBAC 权限
 */
const permissions = [
  { name: 'role', label: '角色管理' },
  { name: 'role.create', label: '创建角色' },
  { name: 'role.read', label: '读取角色' },
  { name: 'role.edit', label: '编辑角色' },
  { name: 'role.delete', label: '删除角色' },

  { name: 'permission', label: '权限管理' },
  { name: 'permission.create', label: '创建权限' },
  { name: 'permission.read', label: '读取权限' },
  { name: 'permission.edit', label: '编辑权限' },
  { name: 'permission.delete', label: '删除权限' },

  { name: 'user', label: '用户' },
  { name: 'user.create', label: '创建用户' },
  { name: 'user.read', label: '获取用户' },
  { name: 'user.edit', label: '编辑用户' },
  { name: 'user.delete', label: '删除用户' },

  { name: 'user.token', label: '用户Token' },
  { name: 'user.token.create', label: '创建用户Token' },
  { name: 'user.token.read', label: '获取用户Token' },
  { name: 'user.token.edit', label: '编辑用户Token' },
  { name: 'user.token.delete', label: '删除用户Token' },

  { name: 'admin', label: '管理员' },
  { name: 'admin.create', label: '创建管理员' },
  { name: 'admin.read', label: '获取管理员' },
  { name: 'admin.edit', label: '编辑管理员' },
  { name: 'admin.delete', label: '删除管理员' },

  { name: 'schema', label: '内容模型' },
  { name: 'schema.create', label: '创建内容模型' },
  { name: 'schema.read', label: '读取内容模型' },
  { name: 'schema.edit', label: '编辑内容模型' },
  { name: 'schema.delete', label: '删除内容模型' },

  { name: 'schema.api', label: '内容模型接口' },
  { name: 'schema.api.read', label: '读取内容模型接口' },
  { name: 'schema.api.edit', label: '编辑内容模型接口' },

  { name: 'oss.manager', label: '资源管理' },
  { name: 'oss.manager.read', label: '读取资源文件' },
  { name: 'oss.manager.delete', label: '删除资源文件' },

  { name: 'system.setting', label: '系统设置' },
  { name: 'system.setting.read', label: '读取系统设置' },
  { name: 'system.setting.edit', label: '修改系统设置' },
];

// 创建初始管理员
async function createFirstAdmin(username: string, password: string) {
  try {
    const { total } = await db.collection('admin').count();
    if (total > 0) {
      // console.log('admin already exists');
      return;
    }

    await cloud.mongo.db.collection('admin').createIndex('username', { unique: true });

    const { data } = await db.collection('role').get();
    const roles = data.map((it) => it.name);

    const r_add = await db.collection('admin').add({
      username,
      avatar: 'https://laf.run/logo.png',
      name: 'Admin',
      roles,
      created_at: Date.now(),
      updated_at: Date.now(),
    });
    assert.ok(r_add.id, 'add admin occurs error');

    await db.collection('password').add({
      uid: r_add.id,
      password: hashPassword(password),
      type: 'admin',
      status: 'active',
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    return r_add.id;
  } catch (error) {
    // console.error(error.message);
  }
}

// 创建初始角色
async function createFirstRole() {
  try {
    await cloud.mongo.db.collection('role').createIndex('name', { unique: true });
    const r_perm = await db.collection('permission').get();
    assert.ok(r_perm, 'get permissions failed');

    const permissions = r_perm.data.map((it) => it.name);
    const r_add = await db.collection('role').add({
      name: 'superadmin',
      label: '超级管理员',
      description: '系统初始化的超级管理员',
      permissions,
      created_at: Date.now(),
      updated_at: Date.now(),
    });

    assert.ok(r_add.id, 'add role occurs error');

    return r_add.id;
  } catch (error) {
    if (error.code == 11000) {
      return console.log('permissions already exists');
    }

    console.error(error.message);
  }
}

// 创建初始权限
async function createInitialPermissions() {
  // 创建唯一索引
  await cloud.mongo.db.collection('permission').createIndex('name', { unique: true });
  for (const perm of permissions) {
    try {
      const data = {
        ...perm,
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      await db.collection('permission').add(data);
    } catch (error) {
      if (error.code == 11000) {
        console.log('permissions already exists');
        continue;
      }
      console.error(error.message);
    }
  }

  return true;
}


const innerSchemas = [
  {
    "displayName": "User",
    "collectionName": "user",
    "system": true,
    "fields": [
      {
        "displayName": "用户名",
        "name": "username"
      },
      {
        "displayName": "昵称",
        "name": "nickname"
      },
      {
        "displayName": "头像",
        "name": "avator"
      },
      {
        "displayName": "手机号",
        "name": "phone"
      },
      {
        "displayName": "邮箱",
        "name": "email"
      }
    ],
    "description": ""
  },
  {
    "displayName": "用户Token",
    "collectionName": "user-token",
    "system": true,
    "fields": [
      {
        "displayName": "创建时间",
        "name": "created_at",
        "type": "DateTime",
        "dateFormatType": "timestamp-ms",
        "id": "created_at",
        "isSystem": true,
        "description": "CMS 系统字段，请勿随意修改。通过 CMS 系统录入的数据会默认添加该字段"
      },
      {
        "displayName": "更新时间",
        "name": "updated_at",
        "type": "DateTime",
        "dateFormatType": "timestamp-ms",
        "id": "updated_at",
        "isSystem": true,
        "description": "CMS 系统字段，请勿随意修改。通过 CMS 系统录入的数据会默认添加该字段"
      },
      {
        "displayName": "用户",
        "name": "uid",
        "description": "",
        "isRequired": true,
        "isHidden": false,
        "isOrderField": false,
        "defaultValue": null,
        "connectResource": "64ae2e438c6deecf4d1337b6",
        "connectCollection": "user",
        "connectField": "username",
        "id": "wxxkSibEtExv83ddh3tG1",
        "type": "Connect"
      },
      {
        "displayName": "Token",
        "name": "token",
        "description": "",
        "isRequired": true,
        "isHidden": false,
        "isOrderField": false,
        "defaultValue": "",
        "id": "LsCoOOXZ0mRkfPx3amkEN",
        "type": "String"
      },
      {
        "displayName": "过期时间",
        "name": "expired_at",
        "description": "",
        "isRequired": true,
        "isHidden": false,
        "isOrderField": false,
        "defaultValue": 1689304008750,
        "dateFormatType": "timestamp-ms",
        "id": "jmdvzSAWR8SBIDTqyAsth",
        "type": "DateTime"
      }
    ],
    "description": ""
  }
]

// 创建初始内置集合
async function createInitalSchema() {
  await cloud.mongo.db.collection('schema').createIndex('collectionName', { unique: true });
  try {
    for (const schema of innerSchemas) {
      try {
        const data = {
          ...schema,
          created_at: Date.now(),
          updated_at: Date.now(),
        };
        await db.collection('schema').add(data);
      } catch (error) {
        if (error.code == 11000) {
          console.log('schema already exists');
          continue;
        }
        console.error(error.message);
      }
    }

  } catch (error) {

  }
}

const innerSchemaApis = [{
  "displayName": "用户",
  "collectionName": "user",
  "enable": true,
  "apis": {
    "register": {
      "target": "api-cms-user-register",
      "enable": true,
      "token": false,
      "tokenEdit": false,
      "displayName": "注册 / Register",
      "url": "/api/cms/user/register",
      "method": "POST",
      "params": {},
      "body": {
        "username": "用户名（必填|String）",
        "nickname": "昵称（可选|String）",
        "password": "密码（必填|String）"
      },
      "collapse": true
    },
    "login": {
      "target": "api-cms-user-login",
      "enable": true,
      "token": false,
      "tokenEdit": false,
      "displayName": "登录 / Login",
      "url": "/api/cms/user/login",
      "method": "POST",
      "params": {},
      "body": {
        "username": "用户名（必填|String）",
        "password": "密码（必填|String）"
      },
      "collapse": false
    },
    "logout": {
      "target": "api-cms-user-logout",
      "enable": true,
      "token": true,
      "tokenEdit": false,
      "displayName": "登出 / Logout",
      "url": "/api/cms/user/logout",
      "method": "POST",
      "headers": {
        "Authorization": "Token(必填|String)"
      },
      "params": {},
      "body": {},
      "collapse": true
    },
    "refreshtoken": {
      "target": "api-cms-user-refreshtoken",
      "enable": true,
      "token": true,
      "tokenEdit": false,
      "displayName": "刷新Token / RefreshToken",
      "url": "/api/cms/user/refreshtoken",
      "method": "POST",
      "headers": {
        "Authorization": "Token(必填|String)"
      },
      "params": {},
      "body": {},
      "collapse": false
    },
    "resetpasswd": {
      "target": "api-cms-user-resetpassword",
      "enable": true,
      "token": true,
      "tokenEdit": false,
      "displayName": "修改密码 / ResetPassword",
      "url": "/api/cms/user/resetpasswd",
      "method": "POST",
      "headers": {
        "Authorization": "Token(必填|String)"
      },
      "params": {},
      "body": {
        "oldpassword": "原密码（必填|String）",
        "newpassword": "新密码（必填|String）"
      },
      "collapse": false
    },
    "update": {
      "target": "api-cms-user-update",
      "enable": true,
      "token": true,
      "tokenEdit": false,
      "displayName": "更新 / Update",
      "url": "/api/cms/user/update",
      "method": "POST",
      "headers": {
        "Authorization": "Token(必填|String)"
      },
      "params": {},
      "body": {
        "nickname": "昵称(可选|String)",
        "avator": "头像(可选|String)",
        "phone": "手机号码(可选|String)",
        "email": "邮箱地址(可选|String)"
      },
      "collapse": false
    }
  },
  "created_at": Date.now(),
  "updated_at": Date.now()
}, {
  "displayName": "资源管理",
  "collectionName": "oss",
  "enable": true,
  "apis": {
    "fileupload": {
      "target": "api-cms-file-upload",
      "enable": true,
      "token": false,
      "tokenEdit": true,
      "displayName": "文件上传 / FileUpload",
      "url": "/api/cms/oss/fileupload",
      "method": "POST",
      "headers": {
        "path": "保存路径(可选|String)"
      },
      "params": {},
      "body": {
        "file": "上传的文件"
      },
      "collapse": true
    },
    "filedelete": {
      "target": "api-cms-file-delete",
      "enable": true,
      "token": false,
      "tokenEdit": true,
      "displayName": "文件删除 / FileDelete",
      "url": "/api/cms/oss/filedelete",
      "method": "POST",
      "headers": {},
      "params": {},
      "body": {
        "key": "文件 Key"
      },
      "collapse": true
    }
  },
  "created_at": Date.now(),
  "updated_at": Date.now()
}];

// 创建初始集合接口
async function createInitalSchemaApi() {
  await cloud.mongo.db.collection('schema-api').createIndex('collectionName', { unique: true });
  try {
    for (const api of innerSchemaApis) {
      try {
        const data = {
          ...api,
          created_at: Date.now(),
          updated_at: Date.now(),
        };
        await db.collection('schema-api').add(data);
      } catch (error) {
        if (error.code == 11000) {
          console.log('schema api already exists');
          continue;
        }
        console.error(error.message);
      }
    }

  } catch (error) {

  }
}

/**
 * @param {string} content
 * @return {string}
 */
function hashPassword(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}
