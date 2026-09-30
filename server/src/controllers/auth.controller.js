/**
 * server/src/controllers/auth.controller.js
 */

const authSvc = require('../services/auth.service');
const userQ   = require('../db/queries/users');

async function register(req, res, next) {
  try {
    const result = await authSvc.register(req.body);
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const result = await authSvc.login(req.body);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

async function refresh(req, res, next) {
  try {
    const result = authSvc.refresh(req.body.refresh_token);
    res.status(200).json(result);
  } catch (err) { next(err); }
}

async function logout(req, res, next) {
  try {
    authSvc.logout(req.body.refresh_token);
    res.sendStatus(204);
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const user = await userQ.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    res.json(user);
  } catch (err) { next(err); }
}

module.exports = { register, login, refresh, logout, me };
