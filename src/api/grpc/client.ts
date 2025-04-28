
import { ADAClient } from './ada.client';
import { ProxyGrpcWebFetchTransport } from './proxy'
import { Local, Session } from '/@/utils/storage';

export class Client {
  private url: string;
  // private port: string;
  public ada: ADAClient;

  constructor(
    url = "http:localhost", // here http is required otherwise fetch API doesn't consider it a request
    // port = "80"
  ) {
    this.url = url;
    // this.port = port;

    let transport = new ProxyGrpcWebFetchTransport({
      baseUrl: `${url}`,
      format: 'binary',
      interceptors: [{
        interceptUnary: (next, method, input, options) => {
          const token = Local.get('token');
          if (token) {
            options.meta = {
              'Authorization': `Bearer ${token}`,
            }
          }
          return next(method, input, options);
        }
      }],
    });

    this.ada = new ADAClient(transport);
  }
}