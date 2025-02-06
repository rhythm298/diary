// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_BUCKET.appspot.com",
  messagingSenderId: "123456789",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Authentication Functions
async function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  await auth.createUserWithEmailAndPassword(email, password);
  document.getElementById('auth-container').classList.add('hidden');
  document.getElementById('diary-container').classList.remove('hidden');
}

async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  await auth.signInWithEmailAndPassword(email, password);
  document.getElementById('auth-container').classList.add('hidden');
  document.getElementById('diary-container').classList.remove('hidden');
}

// Save Diary Entry
async function saveEntry() {
  const entry = document.getElementById('diary-entry').value;
  await db.collection('entries').add({
    text: entry,
    date: new Date().toISOString(),
    userId: auth.currentUser.uid
  });
}

// Dark Mode Toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// PDF Export
function exportToPDF() {
  const doc = new jspdf.jsPDF();
  const text = document.getElementById('diary-entry').value;
  doc.text(text, 10, 10);
  doc.save('diary-entry.pdf');
}
function shareOnSocial() {
  if (navigator.share) {
    navigator.share({
      title: 'My Diary Entry',
      text: document.getElementById('diary-entry').value.slice(0, 100) + '...'
    });
  }
}
function changeBackground(color) {
  document.body.style.backgroundColor = color;
  localStorage.setItem('bgColor', color);
}
