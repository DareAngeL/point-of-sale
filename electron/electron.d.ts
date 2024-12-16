export interface ElectronAPI {
    getUserDataPath: () => string;
    fileExists: (filePath: string) => boolean;
    writeFileSync: (filePath: string, content: string) => void;
    readFileSync: (filePath: string) => void;
  }
  
declare global{
    interface Window {
      electronAPI: ElectronAPI;
    }
}