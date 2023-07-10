interface SchemaApi {
  _id: string;

  collectionName: string;

  list: boolean;

  count: boolean;

  read: boolean;

  add: boolean;

  update: boolean;

  remote: boolean;

  _creatTime?: number;

  _updateTime?: number;
}
