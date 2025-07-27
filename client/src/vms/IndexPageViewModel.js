export class IndexPageViewModel {
  constructor() {
    this.name = 'John';
    this.userInfo = {
        username: '',
        avatarUrl: '',
        playerId: '',
    }
    this.gameStats = {
        totalPoints: 0,
        wins: 0,
        losses: 0,
        winRate: '--',
        friendRanking: 0,
    }
    this.showQRModal = false;
    this.isLoggingIn = false;
    this.loginData = null;
    this.roomId = '';
  }

  greet() {
    return `Hello, ${this.name}!`;
  }

  setUserInfo(userInfo) {
    this.userInfo = userInfo;
  }

  setGameStats(gameStats) {
    this.gameStats = gameStats;
  }
  
}