const express = require('express');
const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');

const app = express();
app.use(express.json());

let users = {};        // ユーザー情報（公開鍵などを簡易保存）
let challenges = {};   // チャレンジ保存

// トップページ
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// 登録開始
app.post('/register/start', (req, res) => {
  const username = req.body.username;
  const challenge = Buffer.from(Math.random().toString()).toString('base64url');
  challenges[username] = challenge;

  const options = generateRegistrationOptions({
    rpName: 'Demo Site',
    rpID: 'localhost',
    userID: username,
    userName: username,
    challenge
  });

  res.json(options);
});

// 登録完了
app.post('/register/finish', (req, res) => {
  const { username, attestation } = req.body;
  // 簡易的に公開鍵だけ保存（実運用では verifyRegistrationResponse 必須）
  users[username] = attestation;
  res.json({ status: 'ok' });
});

// 認証開始
app.post('/login/start', (req, res) => {
  const username = req.body.username;
  const challenge = Buffer.from(Math.random().toString()).toString('base64url');
  challenges[username] = challenge;

  const options = generateAuthenticationOptions({
    allowCredentials: users[username] ? [{ id: users[username].id, type: 'public-key' }] : [],
    userVerification: 'preferred',
    challenge
  });

  res.json(options);
});

// 認証完了
app.post('/login/finish', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
