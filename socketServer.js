import { Server } from "socket.io";

let id = 1;
let activeClients = 0;

export const createSocket = (httpServer) => {
    const io = new Server(httpServer, {
        // ניתן להוסיף הגדרות נוספות על השרת
        // cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    // כשלקוח מתחבר לשרת
    // socket - נתוני הלקוח שהתחבר כרגע
    io.on('connection', (socket) => {
        // ניתן להוסיף נתונים על היוזר הנוכחי בצורה כזו לסוקט
        socket.userId = id++;
        socket.username = null;
        socket.color = null;
        console.log(`user ${socket.userId} connected successfully`);

        // עדכון מונה הלקוחות הפעילים
        activeClients++;
        io.emit('clients count updated', { count: activeClients });

        // שליחת אירוע לקליינט הנוכחי שהתחבר
        socket.emit('user connected', { userId: socket.userId });

        socket.on('update user details', (userDetails) => {
            socket.username = userDetails.username;
            socket.color = userDetails.color;
            console.log(`User ${socket.userId} updated details: ${socket.username}, ${socket.color}`);
        });

        // לקוח מודיע שהוא עומד להתנתק
        socket.on('client disconnecting', ({ username, color }) => {
            const finalUsername = username || socket.username || 'unknown';
            const finalColor = color || socket.color || '#000000';

            // שיגור הודעת ניתוק לכל הלקוחות האחרים בלבד (לא ללקוח הנוכחי)
            socket.broadcast.emit('user disconnected message', {
                username: finalUsername,
                color: finalColor
            });
        });

        socket.on('new message', (newMessage) => {
            // קביעת שם משתמש וצבע עם ברירות מחדל
            const username = socket.username || 'unknown';
            const color = socket.color || '#000000';

            // שיגור אירוע לכל הלקוחות שמחוברים כרגע
            io.emit('send message', {
                by: socket.userId,
                username,
                color,
                msg: newMessage
            });
        });

        // אירוע ניתוק שמור של Socket.IO
        socket.on('disconnect', () => {
            activeClients = Math.max(0, activeClients - 1);
            io.emit('clients count updated', { count: activeClients });
        });
    });
};