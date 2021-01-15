import axios from "axios"
export { httpGet, httpPost };

function httpGet(url: string, params?: any): Promise<any> {
  const promise = new Promise((resolve) => {
    resolve(axios.get(url, { params: params }));
  });
  return promise;
}

function httpPost(url: string, paramsObj: any): Promise<any> {
  const promise = new Promise((resolve) => {
    resolve(axios.post(url, paramsObj));
  });
  return promise;
}