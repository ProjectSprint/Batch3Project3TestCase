// @ts-check
import http from 'http';
import { URL } from 'url';
import net from 'net';

/**
 * @typedef {Object} RouteHandler
 * @property {(req: http.IncomingMessage, res: http.ServerResponse) => Promise<void>} handler The route handler function
 */

/**
 * @typedef {Object} RequestBody
 * @property {any} [data] The parsed request body data
 */

/**
 * @typedef {'GET' | 'POST' | 'PUT' | 'DELETE'} HttpMethod
 */

/**
 * @typedef {Object.<HttpMethod, Object.<string, (req: http.IncomingMessage, res: http.ServerResponse) => Promise<void>>>} RouteMap
 */

/**
 * @typedef {Object} ServerConfig
 * @property {boolean} [cors] Enable CORS headers
 * @property {string} [corsOrigin] CORS origin, defaults to '*'
 */

class TestServer {
  /** @type {http.Server|null} */
  #server = null;
  /** @type {RouteMap} */
  #routes = {
    GET: {},
    POST: {},
    PUT: {},
    DELETE: {},
    PATCH: {}
  };
  /** @type {Required<ServerConfig>} */
  #config = { cors: true, corsOrigin: '*' };

  /**
   * Initialize the test server
   * @param {ServerConfig} [config] Server configuration
   */
  constructor(config = {}) {
    this.#config = { ...this.#config, ...config };
  }

  /**
   * Parse JSON body from incoming request
   * Utility method for route handlers to parse request bodies
   * @param {http.IncomingMessage} req
   * @returns {Promise<any>}
   */
  async getRequestBody(req) {
    /** @type {Buffer[]} */
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Send JSON response
   * @param {http.ServerResponse} res
   * @param {number} statusCode
   * @param {Object} data
   */
  sendJsonResponse(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  /**
   * Configure CORS headers
   * @param {http.ServerResponse} res
   */
  #setCorsHeaders(res) {
    if (this.#config.cors) {
      res.setHeader('Access-Control-Allow-Origin', this.#config.corsOrigin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
  }

  /**
   * Check if a specific port is available
   * @param {number} port
   * @returns {Promise<boolean>}
   */
  async #isPortAvailable(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.unref();

      server.on('error', () => {
        resolve(false);
      });

      server.listen(port, () => {
        server.close(() => {
          resolve(true);
        });
      });
    });
  }

  /**
   * Find an available port with retries
   * @param {number} [retries=3] Number of retries
   * @param {number} [startPort=3000] Starting port number
   * @returns {Promise<number>}
   */
  async #findAvailablePort(retries = 3, startPort = 3000) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Try with port 0 first to get a random port
        const tempServer = net.createServer();
        const port = await new Promise((resolve, reject) => {
          tempServer.unref();
          tempServer.on('error', reject);
          tempServer.listen(0, () => {
            const address = tempServer.address();
            if (address && typeof address === 'object') {
              resolve(address.port);
            } else {
              reject(new Error('Could not get server address'));
            }
          });
        });

        await new Promise((resolve) => tempServer.close(resolve));

        // Verify the port is still available
        if (await this.#isPortAvailable(port)) {
          return port;
        }

        // If not available, try specific ports
        for (let p = startPort + attempt; p < startPort + 1000; p++) {
          if (await this.#isPortAvailable(p)) {
            return p;
          }
        }
      } catch (error) {
        if (attempt === retries) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new Error(`Failed to find available port after ${retries} retries: ${errorMessage}`);
        }
      }
    }

    throw new Error('Could not find available port');
  }

  /**
   * Add a route handler
   * @param {HttpMethod} method HTTP method
   * @param {string} path Route path
   * @param {(req: http.IncomingMessage, res: http.ServerResponse) => Promise<void>} handler Route handler
   */
  addRoute(method, path, handler) {
    const upperMethod = method.toUpperCase();
    if (!this.#routes[upperMethod]) {
      this.#routes[upperMethod] = {};
    }
    this.#routes[upperMethod][path] = handler;
  }

  /**
   * Start the server on a random available port
   * @returns {Promise<number>} The port number the server is listening on
   */
  async start() {
    if (this.#server) {
      throw new Error('Server is already running');
    }

    const port = await this.#findAvailablePort();

    return new Promise((resolve, reject) => {
      this.#server = http.createServer(async (req, res) => {
        this.#setCorsHeaders(res);

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        try {
          const url = req.url || '/';
          const host = req.headers.host || 'localhost';
          const parsedUrl = new URL(url, `http://${host}`);
          const pathname = parsedUrl.pathname;
          const method = req.method || 'GET';

          if (this.#routes[method] && this.#routes[method][pathname]) {
            await this.#routes[method][pathname](req, res);
          } else {
            this.sendJsonResponse(res, 404, { error: 'Not Found' });
          }
        } catch (error) {
          console.error('Server error:', error);
          this.sendJsonResponse(res, 500, { error: 'Internal Server Error' });
        }
      });

      if (!this.#server) {
        reject(new Error('Failed to create server'));
        return;
      }

      this.#server.listen(port, () => {
        resolve(port);
      });
    });
  }

  /**
   * Stop the server
   * @returns {Promise<void>}
   */
  async stop() {
    return new Promise((resolve, reject) => {
      if (!this.#server) {
        resolve();
        return;
      }

      this.#server.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.#server = null;
          resolve();
        }
      });
    });
  }
}

export default TestServer;
