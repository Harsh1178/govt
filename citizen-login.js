import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: 'AIzaSyCHQTHvCkMN5-Z1XjOl3PQ6ItZ4RBWFjzI',
    authDomain: 'govt-8686e.firebaseapp.com',
    projectId: 'govt-8686e',
    storageBucket: 'govt-8686e.firebasestorage.app',
    messagingSenderId: '470046436438',
    appId: '1:470046436438:web:e12b16a5cf6c090d63dff7'
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const btnLogin = document.getElementById('btn-login');
const toast = document.getElementById('toast');
const inputName = document.getElementById('name');
const inputEmail = document.getElementById('email');
const loginForm = document.getElementById('citizen-login-form');

function showToast(msg, type = 'error') {
    toast.textContent = msg;
    toast.className = 'toast ' + type;
    toast.classList.remove('hidden');
}
function toggleBtn(loading) {
    btnLogin.querySelector('.btn-text').classList.toggle('hidden', loading);
    btnLogin.querySelector('.btn-spinner').classList.toggle('hidden', !loading);
    btnLogin.disabled = loading;
}
async function handleLogin() {
    const name = inputName.value.trim();
    const email = inputEmail.value.trim().toLowerCase();
    if (!name || name.length < 2) return showToast('Please enter your name (at least 2 characters).');
    if (!email || !/\S+@\S+\.\S+/.test(email)) return showToast('Please enter a valid email address.');
    toggleBtn(true);
    const uid = 'citizen_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20);
    const userSession = { uid, name, email, role: 'citizen', points: 1280, phone: '', address: '' };
    sessionStorage.setItem('janconnect_user', JSON.stringify(userSession));
    setDoc(doc(db, 'users', uid), { name, email, role: 'citizen', points: 1280, createdAt: new Date().toISOString() }, { merge: true }).catch(() => {});
    showToast('Welcome, ' + name + '!', 'success');
    setTimeout(() => { window.location.href = 'citizen/index.html'; }, 700);
    toggleBtn(false);
}
if (loginForm) loginForm.addEventListener('submit', e => { e.preventDefault(); handleLogin(); });
if (btnLogin) btnLogin.addEventListener('click', handleLogin);
