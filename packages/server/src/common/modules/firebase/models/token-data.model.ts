export interface FCMTokenMessageModel {
  token: string;
  title: string;
  body: string;
  data?: MessageDataModel;
}

export interface MessageDataModel {
  clickAction: string;
  data?: string; // JSON string
}
