// התחברות לשרת הסוקט בפורט הנוכחי
const socket = io();

// אם השרת והלקוח בפרויקטים אחרים
// const socket = io.connect("http://localhost:8000");

const h1 = document.querySelector('h1');//h1 הוא הכותרת של הדף
const form = document.getElementById('form');//form הוא הטפס של הדף
const input = document.getElementById('input');//input הוא הטפס של הדף
const messages = document.getElementById('messages');//messages הוא הטפס של הדף
const userForm = document.getElementById('userForm');//userForm הוא הטפס של פרטי המשתמש
const usernameInput = document.getElementById('username');//username הוא שם המשתמש
const colorInput = document.getElementById('color');//color הוא הצבע הנבחר
const logoutBtn = document.getElementById('logoutBtn');//logoutBtn הוא כפתור ההתנתקות
const clientsCountElement = document.getElementById('clientsCount');//clientsCountElement מציג כמה לקוחות מחוברים

userForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const color = colorInput.value;

    if (username) {
        socket.emit('update user details', {
            username: username,
            color: color
        });
    }
});

// כפתור התנתקות
logoutBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim() || 'unknown';
    const color = colorInput.value || '#000000';

    // שיגור אירוע התנתקות לשרת עם שם וצבע
    socket.emit('client disconnecting', { username, color });

    // ביצוע ההתנתקות בפועל של הסוקט מהשרת
    socket.disconnect();
});

// Handle form submission
form.addEventListener('submit', e => {//e הוא האירוע של הטפס
    e.preventDefault();//e.preventDefault() הוא הפונקציה שמונעת מהדף לשלוף מחדש כאשר המשתמש מגיב על הטפס

    const message = input.value.trim();//message הוא ההודעה שהמשתמש הזין
    if (message) {
        // Emit the message to the server
        socket.emit('new message', message);
        // socket.emit('new message', message) הוא הפונקציה ששולחת הודעה לשרת

        // Clear the input
        input.value = '';//input.value = '' הוא הפונקציה שמנקה את הטפס
    }
});

// Listen for incoming messages
socket.on('user connected', ({ userId }) => {//userId הוא המשתמש שהתחבר
    h1.textContent += ` - user ${userId}`//h1.textContent += ` - user ${userId}` הוא הנוסף לכותרת
})
socket.on('send message', msgFromServer => {//msgFromServer הוא ההודעה שהשרת שלח
    const item = document.createElement('li');//item הוא האירוע של הטפס
    // הצגת שם המשתמש (או unknown) וההודעה
    item.textContent = `new message added by ${msgFromServer.username} (id: ${msgFromServer.by}): ${msgFromServer.msg}`;
    // צביעת ההודעה בצבע שנשלח מהשרת
    if (msgFromServer.color) {
        item.style.color = msgFromServer.color;
    }
    messages.append(item);//messages.append(item) הוא הפונקציה שמוסיפה את ההודעה לכותרת

    // Scroll to the bottom
    messages.scrollTop = messages.scrollHeight;//messages.scrollTop = messages.scrollHeight הוא הפונקציה שמעבירת את ההודעה לכותרת
});

// הודעת ניתוק לקוח מהשרת
socket.on('user disconnected message', data => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>לקוח ${data.username} התנתק מהמערכת</strong>`;
    item.style.color = data.color || '#000000';
    messages.append(item);

    messages.scrollTop = messages.scrollHeight;
});

// עדכון מונה הלקוחות המחוברים
socket.on('clients count updated', ({ count }) => {
    clientsCountElement.textContent = `יש ${count} לקוחות פעילים כרגע`;
});