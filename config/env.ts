declare global {
  interface Window {
    __ENV__: {
      serverIp: string;
      appName: string;
      version: string;
    };
  }
}

export const env =
  typeof window !== "undefined"
    ? window.__ENV__
    : {
        serverIp: "",
        appName: "",
        version: "",
      };