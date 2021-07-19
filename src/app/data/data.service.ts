import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { Appwrite } from 'appwrite';
import { environment } from 'src/environments/environment';
import { UserNotifierService } from '../notifier/user-notifier.service';
const {  Storage } = Plugins;
import {v4 as uuidv4} from 'uuid';
import { FailedRequest } from './failed-request';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public offlineMode : boolean = true;
  private appwrite : Appwrite;

  public failedRequests : FailedRequest[] = [];

  constructor(private userNotifierService : UserNotifierService) {
    this.appwrite = new Appwrite();
    this.appwrite.setEndpoint(environment.API_ENDPOINT);
    this.appwrite.setProject(environment.API_PROJECT);
    this.loadFailedRequests();

  this.getFromStorage('offlineMode').then((res) =>
  {
    if(res.value === "false"){
      this.offlineMode = false;
    }else{
      this.offlineMode = true;
    }
  });
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

  async getCollectionFromStorage(key: string): Promise<Map<string,any>>{
    const val = await this.getFromStorage(key);
    // console.log("Got " +key +" locally:",val,JSON.parse(val.value),new Map<string,any>(JSON.parse(val.value)));
    let parsedVal = JSON.parse(val.value);
    if(!parsedVal || !parsedVal['length']){
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

  async fetchOnlineCollection(collectionName: string){
    if(!this.offlineMode){
      const prom =  this.appwrite.database.listDocuments(environment.collectionMap[collectionName],[],100);
      const res = await this.userNotifierService.notifyOnPromiseReject(prom,"(Online) Fetching "+collectionName);
      if(res.success){
        let documents = [].concat(res.result.documents);
        let totalAmount = res.result.sum;
        let offset = 1;
        while(documents.length < totalAmount){
          const prom =  this.appwrite.database.listDocuments(environment.collectionMap[collectionName],[],100,offset);
          const res = await this.userNotifierService.notifyOnPromiseReject(prom,"(Online) Fetching "+collectionName);
          documents.concat(res.result.documents);
          offset++;
          console.log(offset,documents.length,totalAmount);
          // Shouldn't change, but lets play safe:
          // totalAmount = res.result.sum; 
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
  }

  async fetchCollection(collectionName: string){
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
}
