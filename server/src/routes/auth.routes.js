/**
 * server/src/routes/auth.routes.js
 */

const { Router } = require('express');
const { body }   = require('express-validator');
const ctrl       = require('../controllers/auth.controller');
const validate   = require('../middleware/validate');
const auth       = require('../middleware/authenticate');

const router = Router();

router.post('/register',
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain a number'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  ],
  validate, ctrl.register
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validate, ctrl.login
);

router.post('/refresh',
  [body('refresh_token').notEmpty()],
  validate, ctrl.refresh
);

router.post('/logout',
  [body('refresh_token').notEmpty()],
  validate, ctrl.logout
);

router.get('/me', auth, ctrl.me);

module.exports = router;
