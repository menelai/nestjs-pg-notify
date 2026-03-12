export interface IPgNotifyHandler<T = any> {
  handle(event: T): any;
}
