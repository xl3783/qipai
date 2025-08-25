const SSEEvent = require('./sse_event');

class TransferEvent extends SSEEvent {
    constructor(id, from, fromName, to, toName, amount, description) {
      super('transfer', { id, from, fromName, to, toName, amount, description }, );
    }
}

class JoinEvent extends SSEEvent {
    constructor(id, roomId, userId, username, position, userAvatar, amount) {
        super('join', { id, roomId, userId, username, position, userAvatar, amount });
    }
}

class LeaveEvent extends SSEEvent {
    constructor(id, roomId, userId, username) {
        super('leave', { id, roomId, userId, username });
    }
}



module.exports = { TransferEvent, JoinEvent, LeaveEvent };