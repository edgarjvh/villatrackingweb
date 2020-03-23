// export const serverURL = 'http://localhost:8000';

export default class Config{
    serverURL(){
        return 'http://localhost:8000';
    }
}

export const serverURL = Config.prototype.serverURL;