export interface FailedRequest{
  ID: string,
  time: number,
  type: string,
  collectionName: string,
  dataID?: string,
  dataLocalID: string,
  data: any
}