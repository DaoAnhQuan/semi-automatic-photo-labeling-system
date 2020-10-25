import service from './service'
export class FileService {
    getFileFromServer(fileName){
        //returns Promise object
        return service.getRestClient().get('/image/headsets/'+fileName,{ responseType:"blob" });
    }
}
