import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { app } from '../src/app.js';

describe('myHealthMate AI REST API Test Suite', () => {

  it('GET /api/v1/health should return system status', async () => {
    const res = await request(app).get('/api/v1/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'ONLINE');
  });

  it('POST /api/v1/auth/login should authenticate demo patient with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'alex.morgan@example.com',
        password: 'PatientPass123!'
      });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.role, 'PATIENT');
  });

  it('POST /api/v1/auth/login should reject invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'alex.morgan@example.com',
        password: 'WrongPassword999!'
      });

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/v1/auth/register should create a new patient account', async () => {
    const testEmail = `test_patient_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Jordan Lee',
        email: testEmail,
        password: 'SafePassword123!'
      });

    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.email, testEmail);
  });

  it('GET /api/v1/dashboard/summary should return dashboard metrics', async () => {
    const res = await request(app).get('/api/v1/dashboard/summary');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.totalReports >= 1);
    assert.ok(res.body.data.vitalMetrics);
  });

  it('GET /api/v1/reports should list patient medical reports', async () => {
    const res = await request(app).get('/api/v1/reports');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  it('GET /api/v1/reports/:id/analysis should return lab parameter cards', async () => {
    const res = await request(app).get('/api/v1/reports/rep_7482_cmp/analysis');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.parameters));
    assert.ok(res.body.data.parameters.length >= 1);
  });

  it('POST /api/v1/chat/message should provide educational responses with emergency safeguards', async () => {
    const res = await request(app)
      .post('/api/v1/chat/message')
      .send({ message: 'What is cholesterol?' });

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.reply.includes('Cholesterol'));

    // Test emergency trigger
    const emerRes = await request(app)
      .post('/api/v1/chat/message')
      .send({ message: 'I have severe chest pain and cannot breathe' });

    assert.strictEqual(emerRes.statusCode, 200);
    assert.ok(emerRes.body.data.reply.includes('URGENT MEDICAL NOTICE'));
    assert.strictEqual(emerRes.body.data.isEmergencyAlert, true);
  });

  it('GET /api/v1/admin/stats should reject patient access with 403 Forbidden', async () => {
    // Normal patient token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'alex.morgan@example.com',
        password: 'PatientPass123!'
      });

    const token = loginRes.body.data.token;
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.statusCode, 403);
    assert.strictEqual(res.body.success, false);
  });

  it('GET /api/v1/admin/stats should allow admin access with 200 OK', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@myhealthmate.ai',
        password: 'AdminPass123!'
      });

    const token = loginRes.body.data.token;
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.status, 'HEALTHY');
  });

  it('DELETE /api/v1/account should delete account and purge session', async () => {
    const res = await request(app).delete('/api/v1/account');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
  });

  it('GET /api/v1/chat/conversations should return active conversation list', async () => {
    const res = await request(app).get('/api/v1/chat/conversations');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  it('POST /api/v1/chat/conversations should create and delete a conversation thread', async () => {
    const createRes = await request(app)
      .post('/api/v1/chat/conversations')
      .send({ title: 'Cardiology Followup Consultation' });

    assert.strictEqual(createRes.statusCode, 201);
    assert.strictEqual(createRes.body.success, true);
    assert.strictEqual(createRes.body.data.title, 'Cardiology Followup Consultation');
    const convId = createRes.body.data.id;

    // Send a message within this conversation in Telugu
    const msgRes = await request(app)
      .post('/api/v1/chat/message')
      .send({
        conversationId: convId,
        message: 'కొలెస్ట్రాల్ అంటే ఏమిటి?',
        language: 'te'
      });

    assert.strictEqual(msgRes.statusCode, 200);
    assert.strictEqual(msgRes.body.success, true);
    assert.ok(msgRes.body.data.reply.length > 10);
    assert.strictEqual(msgRes.body.data.conversationId, convId);

    // Fetch messages for conversation
    const getMsgsRes = await request(app).get(`/api/v1/chat/conversations/${convId}/messages`);
    assert.strictEqual(getMsgsRes.statusCode, 200);
    assert.ok(getMsgsRes.body.data.messages.length >= 2);

    // Delete conversation
    const delRes = await request(app).delete(`/api/v1/chat/conversations/${convId}`);
    assert.strictEqual(delRes.statusCode, 200);
    assert.strictEqual(delRes.body.success, true);
  });

  it('GET /api/v1/reports/:id/analysis should support multilingual doctor discussion guides', async () => {
    const resTe = await request(app).get('/api/v1/reports/rep_7482_cmp/analysis?lang=te');
    assert.strictEqual(resTe.statusCode, 200);
    assert.strictEqual(resTe.body.success, true);
    assert.ok(Array.isArray(resTe.body.data.doctorQuestions));
    assert.ok(resTe.body.data.doctorQuestions.length >= 1);

    const resHi = await request(app).get('/api/v1/reports/rep_7482_cmp/analysis?lang=hi');
    assert.strictEqual(resHi.statusCode, 200);
    assert.ok(resHi.body.data.doctorQuestions.length >= 1);
  });
});
