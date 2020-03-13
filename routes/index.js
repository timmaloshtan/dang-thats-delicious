const express = require('express');
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

// Do work here
router.get('/', catchErrors(storeController.getStores));

router.get('/stores', catchErrors(storeController.getStores));

router.get('/add',
  authController.isLoggedIn,
  storeController.addStore,
);

router.post('/add',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);

router.post('/add/:storeId',
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

router.get('/stores/:storeId/edit', catchErrors(storeController.editStore));

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags/:tag?', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);

router.post('/login', authController.login);

router.get('/register', userController.registerForm);
// 1. Validate
// 2. Register
// 3. Log in
router.post('/register',
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login,
);

router.get('/logout', authController.logout);

router.get('/account',
  authController.isLoggedIn,
  userController.account,
);

router.post('/account', catchErrors(userController.updateAccount));

router.post('/account/forgot', catchErrors(authController.forgot));

router.get('/account/reset/:token', catchErrors(authController.reset));

router.post(
  '/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update), 
);

router.get('/map', storeController.mapPage);

/**
 * API endpoints (according to course's author)
 */

router.get('/api/search', catchErrors(storeController.searchStores));
router.get('/api/stores/near', catchErrors(storeController.mapStores));

router.post('/api/stores/:storeId/heart', catchErrors(storeController.heartStore));

router.get('/hearts', authController.isLoggedIn, catchErrors(storeController.getHearts));

module.exports = router;
