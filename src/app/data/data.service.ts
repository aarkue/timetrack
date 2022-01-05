import { EventEmitter, Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Appwrite } from 'appwrite';
import { environment } from 'src/environments/environment';
import { UserNotifierService } from '../notifier/user-notifier.service';
const {  Storage } = Plugins;
import {v4 as uuidv4} from 'uuid';
import { FailedRequest } from './failed-request';
import { TimeTrackerService } from '../time-tracker/time-tracker.service';
@Injectable({
  providedIn: 'root'
})
export class DataService {

  public offlineMode : boolean = true;
  private appwrite : Appwrite;

  public failedRequests : FailedRequest[] = [];

  public busy: boolean = false;

  public prefs : any = {};

  public refreshNeeded : EventEmitter<string> = new EventEmitter<string>();

  constructor(private userNotifierService : UserNotifierService) {
    this.appwrite = new Appwrite();
    this.appwrite.setEndpoint(environment.API_ENDPOINT);
    this.appwrite.setProject(environment.API_PROJECT);
    this.loadFailedRequests();
} 

  async init(){
    await this.getPrefsFromStorage();
    const res = await this.getFromStorage('offlineMode');
      if(res.value === "false"){
        this.offlineMode = false;
        const serverPrefs = await this.fetchPrefsFromServer();
        if(!this.prefs['lastUpdated'] || (serverPrefs['lastUpdated'] && this.prefs['lastUpdated'] < serverPrefs['lastUpdated']) ){
          this.prefs = serverPrefs;
          this.savePrefsToStorage(this.prefs);
        }else{
          this.savePrefsToServer(this.prefs);
        }
      }else{
        this.offlineMode = true;
    }
    this.refreshNeeded.emit('Init');
  }

  saveOfflineModeSetting(){
    this.saveToStorage("offlineMode",this.offlineMode+"");
  }

  async saveToStorage(key: string, value: string) {
    await Storage.set({ key: key, value: value });
  }

  getFromStorage(key: string) {
    return Storage.get({ key: key });
  }


  getDefaultCollectionValue(key: string){

    // if user is not new, don't provide any defaults
    if(!this.prefs['firstStart']){
      return [];
      }
    
    switch(key){
      case 'activities':
        return [['default_STUDY',{  localID: 'default_STUDY',
        label: 'Study',
        icon: 'library',
        color: '#454333',
        startDate: undefined,
        tags: []}],
        ['default_HOUSEDUTIES',{  localID: 'default_HOUSEDUTIES',
        label: 'House duties',
        icon: 'home',
        color: '#B0C227',
        startDate: undefined,
        tags: []}],
        ['default_WORKOUT',{  localID: 'default_WORKOUT',
        label: 'Workout',
        icon: 'barbell',
        color: '#DB662C',
        startDate: undefined,
        tags: []}],
        ['default_MEETINGS',{  localID: 'default_MEETINGS',
        label: 'Meetings',
        icon: 'megaphone',
        color: '#8FF0A4',
        startDate: undefined,
        tags: []}],
        ['default_MAILS',{  localID: 'default_MAILS',
        label: 'Mails',
        icon: 'mail-unread',
        color: '#B5835A',
        startDate: undefined,
        tags: []}],
      ];
      default:
        return [];
    }
  }

  async getCollectionFromStorage(key: string): Promise<Map<string,any>>{
    const val = await this.getFromStorage(key);
    // console.log("Got " +key +" locally:",val,JSON.parse(val.value),new Map<string,any>(JSON.parse(val.value)));
    let parsedVal = JSON.parse(val.value);
    if(parsedVal == undefined || !parsedVal['length']){
      parsedVal = this.getDefaultCollectionValue(key);
    }
    if(parsedVal.length == 0){
      parsedVal = [];
    }else if(parsedVal[0].length != 2 || !parsedVal[0][1]['localID']){
      parsedVal = [];
    }
    return new Map<string,any>(parsedVal);
  }

  async createDocument(collectionName: string, data: any){
    console.log("Create Document",collectionName,data);
    if(data['localID'] == null){
      data['localID'] = uuidv4();
    }
    if(!this.offlineMode){
      const resID = await this.createDocumentOnline(collectionName,data,data['localID']);
      if(resID){
        data['$id'] = resID;
      }
    }
    const res = await this.createDocumentOffline(collectionName,data);
    if(this.prefs['firstStart']){
      this.saveCollectionToStorage(collectionName,await this.getCollectionFromStorage(collectionName));
      this.prefs['firstStart'] = false;
      this.savePrefs(this.prefs);
      }
      return res;
    }

  async createDocumentOffline(collectionName: string, data: {localID: string}){
    let collection = await this.getCollectionFromStorage(collectionName);
    collection.set(data['localID'],data);
    const success = await this.saveCollectionToStorage(collectionName,collection);
    return {success: success, localID: data['localID']};
  }

  async updateDocument(collectionName: string, data : {ID?: string, localID: string}){
    console.log("Update Document",collectionName,data);
    if(!data.localID){
      return null;
    }else{
      if(!this.offlineMode){
        this.updateDocumentOnline(collectionName,data);
      }
      this.putLocalObject(collectionName,data['localID'],data);
    }
    if(this.prefs['firstStart']){
      this.saveCollectionToStorage(collectionName,await this.getCollectionFromStorage(collectionName));
      this.prefs['firstStart'] = false;
      this.savePrefs(this.prefs);
      }
  }

      public stringify(obj: any){
        return JSON.stringify(obj);
      }

    async createDocumentOnline(collectionName: string, data: any, localID: string, notifyOnSuccess : boolean = false) : Promise<string>{
      const apiProm =  this.appwrite.database.createDocument(environment.collectionMap[collectionName],data);
      const apiRes = await this.userNotifierService.notifyForPromiseFlag(apiProm, "(Online) " + collectionName +  " creation",notifyOnSuccess);
      let ID = null;
      if(apiRes.success){
        ID = apiRes.result.$id;
        data['$id'] = ID;
        const collection = await this.getCollectionFromStorage(collectionName);
        collection.set(localID,data);
        await this.saveCollectionToStorage(collectionName,collection);
      }else{
        this.failedRequests.push({ID: uuidv4(), time: Date.now(),type: 'create', dataLocalID: localID, data: data, collectionName: collectionName});
        this.saveFailedRequests();
      }
      return ID;
      }
    
      async updateDocumentOnline(collectionName: string, data : {$id?: string, localID: string}, notifyOnSuccess : boolean = false) : Promise<boolean>{
        if(data.$id){
          const apiProm =  this.appwrite.database.updateDocument(environment.collectionMap[collectionName],data.$id,data);
          const apiRes = await this.userNotifierService.notifyForPromiseFlag(apiProm, "(Online) " + collectionName +  " Update",notifyOnSuccess);
          if(!apiRes.success){
            this.failedRequests.push({ID: uuidv4(), time: Date.now(), type: 'update', dataLocalID: data['localID'], dataID: data['$id'], data: data, collectionName: collectionName});
            this.saveFailedRequests();
            return false;
          }else{
            return true;
          }
        }else{
          this.userNotifierService.notify("Object "+ data.localID + " does not exist on server.","","danger");
          this.failedRequests.push({ID: uuidv4(), time: Date.now(), type: 'update', dataLocalID: data['localID'], dataID: data['$id'], data: data, collectionName: collectionName});
          this.saveFailedRequests();
          return false;
        }
      }

      async retryRequest(req: FailedRequest){
        this.removeFailedRequest(req.ID);
        switch (req.type) {
          case 'create':
            const ID = await this.createDocumentOnline(req.collectionName,req.data,req.dataLocalID,true);
            const collection = await this.getCollectionFromStorage(req.collectionName);
            const object = collection.get(req.dataLocalID);
            object.ID = ID;
            this.saveCollectionToStorage(req.collectionName,collection);
            break;
          case 'update':
            console.log(req.data);
            this.updateDocumentOnline(req.collectionName,req.data);
          break;
          default:
            this.userNotifierService.notify("Invalid request type",this.stringify(req),"danger");
            break;
        }
      }


      async getLocalObject(collectionName: string, localID: string){
        const collection = await this.getCollectionFromStorage(collectionName);
        if(!collection){
          return null;
        }else{
          return collection.get(localID);
        }
      }

      async putLocalObject(collectionName: string, localID: string, obj: any){
        const collection = await this.getCollectionFromStorage(collectionName);
        if(!obj){
          return false;
        }else{
          collection.set(localID,obj);
          await this.saveCollectionToStorage(collectionName,collection);
          return true;
        }
      }

      async saveCollectionToStorage(collectionName: string, collection : Map<string,any>){
        const prom =  this.saveToStorage(collectionName,JSON.stringify(Array.from(collection)));
        const res = await this.userNotifierService.notifyOnPromiseReject(prom,"Saving " + collectionName + " to local storage");
        return res.success;
      }


      async saveFailedRequests(){
        await this.saveToStorage('failedRequests',JSON.stringify(this.failedRequests));
      }

      async loadFailedRequests(){
        const obj = await this.getFromStorage('failedRequests');
        if(obj.value){
          this.failedRequests = JSON.parse(obj.value);
        }else{
          this.failedRequests = [];
        }
      }
        removeFailedRequest(ID: string) {
          this.failedRequests = this.failedRequests.filter((req)=> req.ID !== ID);
          this.saveFailedRequests();
        }
        clearFailedRequests(){
          this.failedRequests = [];
          this.saveFailedRequests();
        }

  async fetchOnlineCollection(collectionName: string){
    if(!this.offlineMode){
        let prom = this.appwrite.database.listDocuments(environment.collectionMap[collectionName],[],100,0);
        const list = await this.userNotifierService.notifyOnPromiseReject(prom,"(Online) Fetching "+collectionName);
        let documents = [].concat(list.result.documents);
        let offset = list.result.documents.length;
        if(list.success){
        let totalAmount = list.result.sum;
        while(documents.length < totalAmount){
          let prom = this.appwrite.database.listDocuments(environment.collectionMap[collectionName],[],100,offset);
          const res = await this.userNotifierService.notifyOnPromiseReject(prom,"(Online) Fetching "+collectionName);
          if(!res.success){ break; }
          documents = documents.concat(res.result.documents);
          offset += res.result.documents.length;
        }
      }
        let collection = await this.getCollectionFromStorage(collectionName);
        // collection.clear();
        documents.forEach((doc) => {
          collection.set(doc.localID,doc);
        })
        this.saveCollectionToStorage(collectionName,collection);
        
        return collection;
      
    }
  }

  async fetchCollection(collectionName: string){
    console.log("Fetching " + collectionName);
    if(!this.offlineMode){
      await this.fetchOnlineCollection(collectionName);
    }
      return await this.getCollectionFromStorage(collectionName);
  }

  async deleteDocument(collectionName : string, data : {$id?: string, localID: string}){
    console.log("Delete Document",collectionName,data);
    if(!this.offlineMode && data.$id){
      this.deleteDocumentOnline(collectionName,data.$id,data);
    }
    const collection = await this.getCollectionFromStorage(collectionName);
    collection.delete(data.localID);
    this.saveCollectionToStorage(collectionName,collection);
    if(this.prefs['firstStart']){
      this.saveCollectionToStorage(collectionName,await this.getCollectionFromStorage(collectionName));
      this.prefs['firstStart'] = false;
      this.savePrefs(this.prefs);
      }
  }

  async deleteDocumentOnline(collectionName : string, $id : string, data : {localID: string}){
    if($id){
      const prom = this.appwrite.database.deleteDocument(environment.collectionMap[collectionName],$id);
      const res = await this.userNotifierService.notifyOnPromiseReject(prom,collectionName + " Deletion");
      if(!res.success){
        this.failedRequests.push({time: Date.now(), ID: uuidv4(), type: "delete", collectionName: collectionName, dataLocalID: data.localID, data: data});
      }
    }
  }

  async sendAllOfflineToServer(){
    this.busy = true;
    for(let collectionName in environment.collectionMap){
      const map = await this.getCollectionFromStorage(collectionName);
      for(let val of map.values()){
        if(!val.$id && val.localID){
          await this.createDocumentOnline(collectionName,val,val.localID);
        }
      }
    }
    this.busy = false;
    this.userNotifierService.notify("Upload successfull!","","success");
  }

  async deleteAllFromLocal(){
    this.busy = true;
    for( let collectionName in environment.collectionMap){
      await this.saveCollectionToStorage(collectionName,new Map<string,any>());
      
    }
    this.busy = false;
    this.userNotifierService.notify("Deleted local copy","","success");
    if(this.prefs['firstStart']){
      this.prefs['firstStart'] = false;
      this.savePrefs(this.prefs);
      }
    this.refreshNeeded.emit("Local Data deleted");
    // setTimeout(() => location.reload(),100);
  }

  async deleteAllFromServer(){
    this.busy = true;
    for(let collectionName in environment.collectionMap){
      await this.deleteCollectionFromServer(collectionName);
    }
    this.busy = false;
    this.userNotifierService.notify("Deleted server copy","","success");
    this.refreshNeeded.emit("Server Data deleted");
    // setTimeout(() => location.reload(),100);
  }
  async deleteCollectionFromServer(collectionName: string){
    if(!this.offlineMode){
      const prom =  this.appwrite.database.listDocuments(environment.collectionMap[collectionName],[],100);
      const res = await this.userNotifierService.notifyOnPromiseReject(prom,"(Online) Deleting "+collectionName);
      if(res.success){
        let documents = [];
        let offset = 0;
        let prom = this.appwrite.database.listDocuments(environment.collectionMap[collectionName],[],0,0);
        const list = await this.userNotifierService.notifyOnPromiseReject(prom,"(Online) Deleting "+collectionName);
        if(list.success){
        let totalAmount = list.result.sum;
        do {
          let prom = this.appwrite.database.listDocuments(environment.collectionMap[collectionName],[],100,offset);
          const res = await this.userNotifierService.notifyOnPromiseReject(prom,"(Online) Deleting "+collectionName);
          if(!res.success){ break; }

          documents = documents.concat(res.result.documents);
          offset += res.result.documents.length;
        } while (documents.length < totalAmount);

      }

        let collection = await this.getCollectionFromStorage(collectionName);
        // collection.clear();
        
        for (let i = 0; i < documents.length; i++) {
          const doc = documents[i];
          const el = collection.get(doc.localID)
          const prom = this.appwrite.database.deleteDocument(environment.collectionMap[collectionName],doc.$id);
          const res = await this.userNotifierService.notifyOnPromiseReject(prom,"(Online) Deleting "+collectionName);
          if(el){
          el.$id = undefined;
          }
        }
        this.saveCollectionToStorage(collectionName,collection);
      }
    }
  }

  public trackByID(index : number,obj : {localID: string}){
    return obj.localID;
  }

  public async exportToJSON(){
    this.busy = true;
    let dict = {};
    dict['dataVersion'] = environment.dataVersion;
    for(let collectionName in environment.collectionMap){
      dict[collectionName] = (await this.getFromStorage(collectionName)).value;
    }
    this.busy = false;
    return JSON.stringify(dict);
  }

  public async importJSON(json: any){
    this.busy = true;
    for(let collectionName in environment.collectionMap){
      if(json[collectionName]){
        console.log(json[collectionName]);
        const value = JSON.parse(json[collectionName]);
        let collectionInJSON : Map<string,any> = new Map<string,any>(value);
        console.log(collectionInJSON);
        let localCollection : Map<string,any> = await this.getCollectionFromStorage(collectionName);
        for(const key of collectionInJSON.keys()){
          localCollection.set(key,collectionInJSON.get(key));
        }
        this.saveCollectionToStorage(collectionName,localCollection);
      }
    }
    this.busy = false;
  }


  async fetchPrefsFromServer(){
    const prom =  this.appwrite.account.getPrefs();
    const res = await this.userNotifierService.notifyOnPromiseReject(prom,"(Online) Fetching preferences");
    if(res.success){
      return res.result;
    }else{
      return {};
    }
  }

  async savePrefsToServer(prefs: any){
    const prom =  this.appwrite.account.updatePrefs(prefs);
    const res = await this.userNotifierService.notifyOnPromiseReject(prom,"(Online) Saving preferences");
    if(res.success){
      // this.prefs = res.result;
    }
  }

  async savePrefsToStorage(prefs: any){
    await this.saveToStorage("prefs",JSON.stringify(prefs));
  }

  async savePrefs(prefs: any){
    for(const key in prefs){
      this.prefs[key] = prefs[key];
    }
    this.prefs['lastUpdated'] = Date.now();
    
    await this.savePrefsToStorage(this.prefs);
    if(!this.offlineMode){
      this.savePrefsToServer(this.prefs);
    }
  }

  async getPrefsFromStorage(){
    this.prefs = JSON.parse((await this.getFromStorage("prefs")).value);
    if(!this.prefs){
      this.prefs = {firstStart: true};
    }
  }


}
