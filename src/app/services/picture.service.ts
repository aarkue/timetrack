import { Injectable } from '@angular/core';
import { CameraPhoto, CameraResultType, CameraSource, Capacitor, FilesystemDirectory, Plugins } from '@capacitor/core';
import { AlertController, Platform } from '@ionic/angular';
import { Picture } from '../models/picture';


const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PictureService {
  public pictures : Picture[] = [];
  private readonly PICTURE_STORAGE : string = "pictures";

  constructor(private platform: Platform,public alertController: AlertController) {
  }

  public async addNewToGallery(){
    const picture = await  Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100
      }).catch((res) => {
        return;
      });

      if(!picture){
        const alert = await this.alertController.create({header: "Failed to take picture", buttons: ['Ok']});
        alert.present();
        return;
      }
    

    const savedImageFile = await this.savePicture(picture);
    this.pictures.unshift(savedImageFile)
    Storage.set({key: this.PICTURE_STORAGE, value: JSON.stringify(this.pictures)});
  }

  private async savePicture(pic: CameraPhoto) : Promise<{filepath:string, webviewPath: string}>{
    const base64Data = await this.readAsBase64(pic);
    const fileName = new Date().getTime()+".jpeg";

    const savedFile = await Filesystem.writeFile({path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data});

    if(this.platform.is("hybrid")){
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri) 
      };
    }else{
      return {
        filepath: fileName,
        webviewPath: pic.webPath
      };
    }

  }

  private async readAsBase64(pic: CameraPhoto) {
    if(this.platform.is("hybrid")){
      const file = await Filesystem.readFile({path: pic.path});
      return file.data;
    }else{
      const resp = await fetch(pic.webPath);
      const blob = await resp.blob();
      return await this.convertBlobToBase64(blob) as string;
    }
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });


  public async loadSaved(){
    const pictureList = await Storage.get({key: this.PICTURE_STORAGE});
    this.pictures = JSON.parse(pictureList.value) || [];

    if(!this.platform.is("hybrid")){
      for(let pic of this.pictures){
        const readFile = await Filesystem.readFile({path: pic.filepath, directory: FilesystemDirectory.Data});
        pic.webviewPath = "data:image/jpeg;base64, " + readFile.data;
      }
    }
    
  }

  async deletePicture(pic: Picture, index: number) {
    const filename = pic.filepath.substr(pic.filepath.lastIndexOf('/') + 1);
    const delFile = await Filesystem.deleteFile({path: filename, directory: FilesystemDirectory.Data});
    this.pictures.splice(index,1);
    Storage.set({key: this.PICTURE_STORAGE, value: JSON.stringify(this.pictures)});
  }

}
