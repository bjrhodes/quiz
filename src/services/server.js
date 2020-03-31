import { nanoid } from 'nanoid';

const commands = (socket, uid, peerId, quizId) => {

    const send = (cmd, event = {}) => socket.send(JSON.stringify({ uid, cmd, event }));

    const joinTeam = teamId => send('joinTeam', { teamId });

    const getTeamState = teamId => send('getTeamState', { teamId });

    const getQuizState = teamId => send('getQuizState');

    const getTeams = () => send('getTeams');

    const getParticipants = () => send('getParticipants', { quizId });

    const updateAnswers = doc => send('writeAnswers', { doc });

    const register = () => send('register', { quizId, uid, peerId });

    return { joinTeam, getTeamState, getTeams, getParticipants, getQuizState, register, updateAnswers, getUid: () => uid }
}

const pubSub = (socket, uid, peerId, quizId) => {

    const subscribers = [];

    const notify = state => subscribers.forEach(({ fn }) => fn(state));

    const unsubscribe = id => {
        const index = subscribers.findIndex(({ _id }) => _id === id);
        if (index !== -1) {
            subscribers.splice(index, 1);
        }
    }

    const subscribe = (id, fn) => {
        unsubscribe(id);
        subscribers.push({ id, fn });
    }

    socket.addEventListener('message', function (event) {
        var received = JSON.parse(event.data);
        console.log('Message from server ', received);

        notify(received);
    });

    return {
        subscribe,
        unsubscribe,
        ...commands(socket, uid, peerId, quizId)
    };
}

const heartbeat = ws => {
    console.log("HEARTBEAR", ws)
    clearTimeout(ws.pingTimeout);
    ws.pingTimeout = window.setTimeout(() => {
        console.log("TIMING OUT!");
        ws.terminate();
    }, 31000);
}

/**
 * The server maintains a db of quizzes, each of which has several participants 
 * who are divided into teams.
 * 
 * @param {string} host The hostname of the server, (e.g. quiz.learningcode.co.uk)
 * @param {string} quizId The id of the quiz
 */
const server = (host, quizId) => {
    if (!quizId) {
        console.log("not init'ing server without a quizId");
        return Promise.reject("not init'ing server without a quizId");
    }

    const url = `ws://${host}`;

    const uid = localStorage.getItem('uid') || nanoid();

    localStorage.setItem('uid', uid);

    const socket = new WebSocket(url);

    const peer = new window.Peer({ host: 'localhost', port: 9000, path: '/peer' });

    const socketReady = new Promise((resolve, reject) => {
        socket.addEventListener('error', reject);
        socket.addEventListener('open', resolve);
    }).then(() => {
        socket.addEventListener('ping', () => heartbeat(socket));
        socket.addEventListener('close', () => clearTimeout(socket.pingTimeout));
        heartbeat(socket);
    });

    const peerReady = new Promise((resolve) => {
        peer.on('open', resolve);
    });

    return Promise.all([peerReady, socketReady]).then(([peerId]) => {
        const commands = pubSub(socket, uid, peerId, quizId);

        commands.register();
        console.log("RETURNING COMMANDS!")
        return commands;
    }).catch(console.error);
};

export default server;