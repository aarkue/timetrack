//typ checking fuer Accounts
export interface Acc {
  //Ids vllt rausnehmen
  _id: string;
  username: string;
  email: string;
  pw: string;
  currTask: string;
  currList: string;

  shared: [string];

  planid: string;

  experience: number;
  sweat: number;
}
