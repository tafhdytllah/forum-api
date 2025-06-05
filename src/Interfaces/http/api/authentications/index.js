import AuthenticationsHandler from './handler.js';
import { routes } from './routes.js';

export default {
  name: 'authentications',
  register: async (server, { container }) => {
    const authenticationsHandler = new AuthenticationsHandler(container);
    server.route(routes(authenticationsHandler));
  },
};
