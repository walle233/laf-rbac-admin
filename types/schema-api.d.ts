interface SchemaApi {
  _id: string;
  displayName: string;
  collectionName: string;
  enable: boolean;
  apis: Api[];
  _creatTime?: number;
  _updateTime?: number;
}

interface Api {
  collapse: boolean;
  token: boolean;
  tokenEdit: boolean;
  enable: boolean;
  displayName: string;
  method: string;
  url: string;
  headers: Object;
  params: Object;
  body: Object;
}
