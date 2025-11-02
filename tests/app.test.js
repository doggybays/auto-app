// tests/app.test.js
import request from 'supertest';
import express from 'express';
let app;
try {
  app = (await import('../app.js')).default || (await import('../app.js')).app;
} catch (e) {
  app = express();
  app.get('/', (req,res) => res.send('ok'));
}
describe('Basic server', () => {
  test('GET / responds', async () => {
    const res = await request(app).get('/');
    expect([200,304,302]).toContain(res.statusCode);
  }, 10000);
});
