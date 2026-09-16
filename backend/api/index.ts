import { createApp, server } from '../src/main';

export default async function handler(req: any, res: any) {
  await createApp(server);
  server(req, res);
}
