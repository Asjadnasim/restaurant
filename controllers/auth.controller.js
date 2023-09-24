const User = require('../models/user.model');
const authUtil = require('../util/authentication');
const validation = require('../util/validation');
const sessionFlash = require('../util/session-flash');

function getSignup(req, res) {
  let sessionData = sessionFlash.getSessionData(req);

  if (!sessionData) {
    sessionData = {
      email: '',
      confirmEmail: '',
      password: '',
      fullName: '',
      street: '',
      postal: '',
      city: '',
    };
  }

  res.render('customer/auth/signup', { inputData: sessionData });
};

async function signup(req, res) {
  const enteredData = {
    email: req.body.email,
    confirmEmail: req.body.confirmEmail,
    password: req.body.password,
    fullName: req.body.fullName,
    street: req.body.street,
    postal: req.body.postal,
    city: req.body.city,
  }
  if (!validation.userDetailsAreValid(
    req.body.email,
    req.body.password,
    req.body.fullName,
    req.body.street,
    req.body.postal,
    req.body.city,
  ) || !validation.emailIsConfirmed(
    req.body.email,
    req.body.confirmEmail)
  ) {
    sessionFlash.flashDataToSession(
      req,
      {
        errorMessage:
          'Please Check your input. Password must be atleast 6 characters long, postal code must be 5 characters long',
        ...enteredData,
      },
      function () {
        res.redirect('/signup');
      })
    return;
  }

  const user = new User(
    req.body.email,
    req.body.password,
    req.body.fullName,
    req.body.street,
    req.body.postal,
    req.body.city,
  );

  try {
    const existsAlready = await user.existsAlready();
    if (existsAlready) {
      sessionFlash.flashDataToSession(
        req,
        {
          errorMessage: 'User exists already! Try logging instead!',
          ...enteredData
        },
        function () {
          res.redirect('/signup');
        }
      )
      return;
    }
    await user.signup();
  } catch (error) {
    next(error);
    return
  }

  res.redirect('/login');
}

function getLogin(req, res) {
  let sessionData = sessionFlash.getSessionData(req);

  if (!sessionData) {
    sessionData = {
      email: '',
      confirmEmail: '',
    };
  }

  res.render('customer/auth/login', { inputData: sessionData });
};

async function login(req, res) {
  const user = new User(req.body.email, req.body.password);
  const existingUser = await user.getUserWithSameEmail();

  const sessionErrorData = {
    errorMessage: 'Invalid credentials -- please double-check your email and password!',
    email: user.email,
    password: user.password,
  };

  if (!existingUser) {
    sessionFlash.flashDataToSession(req, sessionErrorData, function () {
      res.redirect('/login');
    })
    return;
  }

  const passwordIsCorrect = await user.hasMatchingPassword(existingUser.password);

  if (!passwordIsCorrect) {
    sessionFlash.flashDataToSession(req, sessionErrorData, function () {
      res.redirect('/login');
    })
    return;
  }

  authUtil.createUserSession(req, existingUser, function () {
    res.redirect('/')
  })
};

function logout(req, res) {
  authUtil.destroyUserAuthSession(req);
  res.redirect('/login');
}

module.exports = {
  getSignup: getSignup,
  getLogin: getLogin,
  signup: signup,
  login: login,
  logout: logout,
};