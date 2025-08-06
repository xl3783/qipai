const SSEEvent = require('./sse_event');

class TransferEvent extends SSEEvent {
    constructor(id, from, to, amount, description) {
      super('transfer', { id, from, to, amount, description }, );
    }
}

class JoinEvent extends SSEEvent {
    constructor(id, roomId, userId, username, position, userAvatar) {
        super('join', { id, roomId, userId, username, position, userAvatar });
    }
}

class LeaveEvent extends SSEEvent {
    constructor(id, roomId, userId, username) {
        super('leave', { id, roomId, userId, username });
    }
}



module.exports = { TransferEvent, JoinEvent, LeaveEvent };