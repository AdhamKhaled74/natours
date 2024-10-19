// const { default: axios } = require('axios');
// eslint-disable-next-line import/no-extraneous-dependencies
// const Stripe = require('stripe');

/* eslint-disable */
const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm
      }
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Signed up Successfully');
      window.setTimeout(() => {
        location.assign('/login');
      }, 1500);
    }
  } catch (e) {
    showAlert('error', e.response.data.message);
  }
};
// download cookie-parser and axios import it to base.pug

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout'
      // withCredentials: true // Include credentials such as cookies
    });
    if (res.data.status === 'success') {
      // location.reload(true);
      location.assign('/');
    }
  } catch (err) {
    showAlert('error', 'Error logging out! try again.');
  }
};

const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

const bookTour = async tourId => {
  const stripe = Stripe(
    'pk_test_51Q7g7E00napEQiipL1vevadyEn6Ma1JSnnOrVb2vVKFVsFpfp1CMowtDrdtj2gXM0Q6ABOtifbhoF5Ef8w4KyRUh00QToF6zf0'
  );
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
    console.log(session);
    // 2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    showAlert(
      'error',
      err.response.data.message ? err.response.data.message : err
    );
  }
};

const hideAlert = () => {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};
// Type is success or error
const showAlert = (type, msg, time = 5000) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}"> ${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, time);
};

const loginForm = document.querySelector('.form--login');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

const signupForm = document.querySelector('.form--signup');
if (signupForm) {
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });
}

const logOutBtn = document.querySelector('.nav__el--logout');
if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}

const userDataForm = document.querySelector('.form-user-data');
if (userDataForm) {
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateSettings(form, 'data');
  });
}

const userPasswordForm = document.querySelector('.form-user-password');
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').innerHTML = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );
    document.querySelector('.btn--save-password').innerHTML = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

const bookBtn = document.getElementById('book-tour');
if (bookBtn) {
  bookBtn.addEventListener('click', e => {
    e.target.innerHTML = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20000);
