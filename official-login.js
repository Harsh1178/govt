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

const toast = document.getElementById('toast');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const registerForm = document.getElementById('register-form');
const linkShowRegister = document.getElementById('link-show-register');

function showToast(message, type = 'error') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
}

function hideToast() {
    toast.classList.add('hidden');
}

function toggleButton(btn, loading) {
    const text = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.btn-spinner');
    if (loading) {
        text.classList.add('hidden');
        spinner.classList.remove('hidden');
        btn.disabled = true;
    } else {
        text.classList.remove('hidden');
        spinner.classList.add('hidden');
        btn.disabled = false;
    }
}

if (linkShowRegister) {
    linkShowRegister.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.toggle('hidden');
    });
}

// Quick Demo Login buttons
document.querySelectorAll('.quick-demo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const dept = btn.dataset.dept;
        const email = btn.dataset.email;
        const emailInput = document.getElementById('login-email');
        const deptSelect = document.getElementById('login-dept');
        if (emailInput) emailInput.value = email;
        if (deptSelect) deptSelect.value = dept;
        executeLogin(email, dept, 'Officer (' + dept.replace(' Department', '') + ')');
    });
});

async function executeLogin(rawEmail, selectedDept, customName = null) {
    let email = rawEmail.trim().toLowerCase();
    if (!email) return showToast('Please enter your official email.');
    
    // Auto-complete domain if missing
    if (!email.includes('@')) {
        email += '@govemp.in';
        const emailInput = document.getElementById('login-email');
        if (emailInput) emailInput.value = email;
    }

    if (!/\S+@\S+\.\S+/.test(email)) return showToast('Please enter a valid email address.');

    toggleButton(btnLogin, true);

    const uid = 'official_' + btoa(email).replace(/=/g, '');
    const userName = customName || (email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' (Official)');
    const dept = selectedDept || 'Roads Department';

    const userSession = {
        uid: uid,
        name: userName,
        email: email,
        role: 'official',
        department: dept
    };

    sessionStorage.setItem('janconnect_user', JSON.stringify(userSession));
    localStorage.setItem('janconnect_official_saved', JSON.stringify(userSession));

    // Non-blocking Firestore sync
    try {
        await setDoc(doc(db, 'users', uid), {
            name: userName,
            email: email,
            role: 'official',
            department: dept,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (e) {
        console.warn('Firestore official user save warning (using local session):', e.message);
    }

    showToast(`Welcome, ${userName}! Opening official dashboard...`, 'success');
    setTimeout(() => {
        window.location.href = 'official/india development_demand/index.html';
    }, 700);
}

// LOGIN ACTION
btnLogin.addEventListener('click', async () => {
    hideToast();
    const email = document.getElementById('login-email').value;
    const dept = document.getElementById('login-dept')?.value || 'Roads Department';
    executeLogin(email, dept);
});

// REGISTER ACTION: Registers official with specific department
if (btnRegister) {
    btnRegister.addEventListener('click', async () => {
        hideToast();
        const name = document.getElementById('reg-name').value.trim();
        const dept = document.getElementById('reg-dept').value;
        let email = document.getElementById('reg-email').value.trim().toLowerCase();

        if (!name || !dept || !email) return showToast('Fill all registration fields');
        if (!email.includes('@')) email += '@govemp.in';
        if (!/\S+@\S+\.\S+/.test(email)) return showToast('Please enter a valid email address.');

        toggleButton(btnRegister, true);

        const uid = 'official_' + btoa(email).replace(/=/g, '');
        const userSession = {
            uid: uid,
            name: name,
            email: email,
            role: 'official',
            department: dept
        };

        sessionStorage.setItem('janconnect_user', JSON.stringify(userSession));
        localStorage.setItem('janconnect_official_saved', JSON.stringify(userSession));

        try {
            await setDoc(doc(db, 'users', uid), {
                name: name,
                email: email,
                role: 'official',
                department: dept,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.warn('Firestore official user save warning:', e.message);
        }

        showToast('Registration successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'official/india development_demand/index.html';
        }, 700);
    });
}
