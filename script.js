// Firebase initialization (already done in HTML)
const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const screens = {
    auth: document.getElementById('authScreen'),
    mainMenu: document.getElementById('mainMenuScreen'),
    aiDifficulty: document.getElementById('aiDifficultyScreen'),
    game: document.getElementById('gameScreen'),
    profile: document.getElementById('profileScreen'),
    leaderboard: document.getElementById('leaderboardScreen'),
    store: document.getElementById('storeScreen'),
    achievements: document.getElementById('achievementsScreen'),
    topup: document.getElementById('topupScreen')
};

const authElements = {
    email: document.getElementById('email'),
    password: document.getElementById('password'),
    loginBtn: document.getElementById('loginBtn'),
    signupBtn: document.getElementById('signupBtn'),
    authError: document.getElementById('authError')
};

const menuElements = {
    userNameDisplay: document.getElementById('userNameDisplay'),
    userCoins: document.getElementById('userCoins'),
    quickPlayBtn: document.getElementById('quickPlayBtn'),
    multiplayerBtn: document.getElementById('multiplayerBtn'),
    profileBtn: document.getElementById('profileBtn'),
    leaderboardBtn: document.getElementById('leaderboardBtn'),
    storeBtn: document.getElementById('storeBtn'),
    achievementsBtn: document.getElementById('achievementsBtn'),
    topupBtn: document.getElementById('topupBtn'),
    logoutBtn: document.getElementById('logoutBtn')
};

const aiElements = {
    difficultyBtns: document.querySelectorAll('.difficulty-btn'),
    backToMenuFromAI: document.getElementById('backToMenuFromAI')
};

const gameElements = {
    gameTitle: document.getElementById('gameTitle'),
    gameStatus: document.getElementById('gameStatus'),
    gameTimer: document.getElementById('gameTimer'),
    gameCoins: document.getElementById('gameCoins'),
    cells: document.querySelectorAll('.cell'),
    leaveGameBtn: document.getElementById('leaveGameBtn'),
    rematchBtn: document.getElementById('rematchBtn')
};

const profileElements = {
    profileName: document.getElementById('profileName'),
    userLevel: document.getElementById('userLevel'),
    userXP: document.getElementById('userXP'),
    nextLevelXP: document.getElementById('nextLevelXP'),
    xpFill: document.getElementById('xpFill'),
    winsCount: document.getElementById('winsCount'),
    lossesCount: document.getElementById('lossesCount'),
    drawsCount: document.getElementById('drawsCount'),
    winStreak: document.getElementById('winStreak'),
    profileCoins: document.getElementById('profileCoins'),
    backToMenuFromProfile: document.getElementById('backToMenuFromProfile')
};

const leaderboardElements = {
    leaderboardList: document.getElementById('leaderboardList'),
    backToMenuFromLeaderboard: document.getElementById('backToMenuFromLeaderboard')
};

const storeElements = {
    storeGrid: document.getElementById('storeGrid'),
    backToMenuFromStore: document.getElementById('backToMenuFromStore')
};

const achievementsElements = {
    achievementsGrid: document.getElementById('achievementsGrid'),
    backToMenuFromAchievements: document.getElementById('backToMenuFromAchievements')
};

const topupElements = {
    backToMenuFromTopup: document.getElementById('backToMenuFromTopup')
};

// Game State
let gameState = {
    currentPlayer: 'X',
    board: Array(9).fill(''),
    gameActive: false,
    isMyTurn: true,
    currentDifficulty: 'medium',
    gameMode: 'ai', // 'ai' or 'multiplayer'
    timer: null,
    timeLeft: 30,
    blitzMode: false,
    multiplayer: {
        gameDocRef: null,
        unsubscribe: null,
        myMark: 'X',
        createdGame: false,
        matchmakingTimeoutId: null,
        isActive: false
    }
};

// User State
let currentUser = null;
let userStats = {
    level: 1,
    xp: 0,
    coins: 100, // Starting coins for demo
    wins: 0,
    losses: 0,
    draws: 0,
    winStreak: 0,
    achievements: [],
    purchasedThemes: ['classic'],
    currentTheme: 'classic'
};

// Store Items
const storeItems = [
    { id: 'classic', name: 'Classic', icon: '⭕', price: 0, owned: true },
    { id: 'emoji', name: 'Emoji', icon: '🎯', price: 50, owned: false },
    { id: 'gaming', name: 'Gaming', icon: '🎮', price: 100, owned: false },
    { id: 'space', name: 'Space', icon: '🚀', price: 150, owned: false },
    { id: 'nature', name: 'Nature', icon: '🌿', price: 200, owned: false },
    { id: 'premium', name: 'Premium', icon: '💎', price: 500, owned: false }
];

// Achievements
const achievements = [
    { id: 'first_win', name: 'First Victory', icon: '🏆', desc: 'Win your first game', condition: (stats) => stats.wins >= 1 },
    { id: 'unbeatable', name: 'Unbeatable', icon: '🛡️', desc: 'Win 5 games in a row', condition: (stats) => stats.winStreak >= 5 },
    { id: 'social_butterfly', name: 'Social Butterfly', icon: '🦋', desc: 'Play 10 multiplayer games', condition: (stats) => stats.multiplayerGames >= 10 },
    { id: 'collector', name: 'Theme Collector', icon: '🎨', desc: 'Own 3 themes', condition: (stats) => stats.purchasedThemes.length >= 3 },
    { id: 'high_roller', name: 'High Roller', icon: '💰', desc: 'Spend 500 coins', condition: (stats) => stats.coinsSpent >= 500 },
    { id: 'level_master', name: 'Level Master', icon: '⭐', desc: 'Reach level 10', condition: (stats) => stats.level >= 10 }
];

// Utility Functions
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

function showError(message) {
    authElements.authError.textContent = message;
    authElements.authError.classList.remove('hidden');
    setTimeout(() => {
        authElements.authError.classList.add('hidden');
    }, 5000);
}

function clearAuthFields() {
    authElements.email.value = '';
    authElements.password.value = '';
}

function updateGameStatus(message) {
    gameElements.gameStatus.textContent = message;
}

function renderBoard() {
    gameElements.cells.forEach((cell, index) => {
        cell.textContent = gameState.board[index];
        cell.className = 'cell';
        if (gameState.board[index] === 'X') {
            cell.classList.add('x');
        } else if (gameState.board[index] === 'O') {
            cell.classList.add('o');
        }
    });
}

function setGameTitleForMode() {
    if (gameState.gameMode === 'multiplayer') {
        gameElements.gameTitle.textContent = 'Online Match';
    } else {
        const difficultyNames = { easy: 'Easy', medium: 'Medium', hard: 'Hard', impossible: 'Impossible' };
        gameElements.gameTitle.textContent = `AI Battle - ${difficultyNames[gameState.currentDifficulty]}`;
    }
}

function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameState.board[a] && 
            gameState.board[a] === gameState.board[b] && 
            gameState.board[a] === gameState.board[c]) {
            return gameState.board[a];
        }
    }

    if (!gameState.board.includes('')) {
        return 'draw';
    }

    return null;
}

function calculateXPForLevel(level) {
    return level * 100;
}

function updateProfileDisplay() {
    profileElements.profileName.textContent = currentUser.email.split('@')[0];
    profileElements.userLevel.textContent = userStats.level;
    profileElements.userXP.textContent = userStats.xp;
    const nextLevelXP = calculateXPForLevel(userStats.level);
    profileElements.nextLevelXP.textContent = nextLevelXP;
    profileElements.xpFill.style.width = `${(userStats.xp / nextLevelXP) * 100}%`;
    profileElements.winsCount.textContent = userStats.wins;
    profileElements.lossesCount.textContent = userStats.losses;
    profileElements.drawsCount.textContent = userStats.draws;
    profileElements.winStreak.textContent = userStats.winStreak;
    profileElements.profileCoins.textContent = userStats.coins;
    
    menuElements.userCoins.textContent = userStats.coins;
}

function addXP(xpAmount) {
    userStats.xp += xpAmount;
    const nextLevelXP = calculateXPForLevel(userStats.level);
    
    if (userStats.xp >= nextLevelXP) {
        userStats.level++;
        userStats.xp = userStats.xp - nextLevelXP;
        // In real app, you'd show level up animation
    }
    
    updateProfileDisplay();
}

function checkAchievements() {
    let newAchievements = false;
    
    achievements.forEach(achievement => {
        if (!userStats.achievements.includes(achievement.id) && 
            achievement.condition(userStats)) {
            userStats.achievements.push(achievement.id);
            newAchievements = true;
            // In real app, show achievement unlocked notification
        }
    });
    
    if (newAchievements) {
        renderAchievements();
    }
}

function renderAchievements() {
    achievementsElements.achievementsGrid.innerHTML = '';
    
    achievements.forEach(achievement => {
        const achievementEl = document.createElement('div');
        achievementEl.className = `achievement-item ${userStats.achievements.includes(achievement.id) ? 'unlocked' : ''}`;
        achievementEl.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        `;
        achievementsElements.achievementsGrid.appendChild(achievementEl);
    });
}

function renderStore() {
    storeElements.storeGrid.innerHTML = '';
    
    storeItems.forEach(item => {
        const isOwned = userStats.purchasedThemes.includes(item.id);
        const storeItemEl = document.createElement('div');
        storeItemEl.className = 'store-item';
        storeItemEl.innerHTML = `
            <div class="store-icon">${item.icon}</div>
            <div class="store-name">${item.name}</div>
            <div class="store-price">${isOwned ? 'Owned' : item.price + ' 🪙'}</div>
            <button class="store-buy-btn" ${isOwned ? 'disabled' : ''} 
                    onclick="purchaseTheme('${item.id}', ${item.price})">
                ${isOwned ? 'Equipped' : 'Buy'}
            </button>
        `;
        storeElements.storeGrid.appendChild(storeItemEl);
    });
}

function renderLeaderboard() {
    // In real app, this would fetch from Firestore
    // For demo, we'll show mock data
    const mockLeaderboard = [
        { rank: 1, name: 'ProGamer', wins: 150 },
        { rank: 2, name: 'TicMaster', wins: 132 },
        { rank: 3, name: 'XOChampion', wins: 128 },
        { rank: 4, name: 'currentUser', wins: userStats.wins },
        { rank: 5, name: 'GameLover', wins: 89 }
    ];
    
    leaderboardElements.leaderboardList.innerHTML = '';
    
    mockLeaderboard.forEach(player => {
        const playerEl = document.createElement('div');
        playerEl.className = 'leaderboard-item';
        playerEl.innerHTML = `
            <div class="leaderboard-rank">#${player.rank}</div>
            <div class="leaderboard-name">${player.name === 'currentUser' ? 'You' : player.name}</div>
            <div class="leaderboard-wins">${player.wins} wins</div>
        `;
        leaderboardElements.leaderboardList.appendChild(playerEl);
    });
}

// AI Logic
function makeAIMove() {
    if (!gameState.gameActive || gameState.isMyTurn) return;
    
    let move;
    
    switch (gameState.currentDifficulty) {
        case 'easy':
            move = getEasyAIMove();
            break;
        case 'medium':
            move = getMediumAIMove();
            break;
        case 'hard':
        case 'impossible':
            move = getHardAIMove();
            break;
    }
    
    if (move !== -1) {
        gameState.board[move] = 'O';
        renderBoard();
        
        const winner = checkWinner();
        if (winner) {
            handleGameEnd(winner);
        } else {
            gameState.isMyTurn = true;
            updateGameStatus('Your turn (X)');
        }
    }
}

function getEasyAIMove() {
    const emptyCells = gameState.board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
    return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : -1;
}

function getMediumAIMove() {
    // Try to win
    const winMove = findWinningMove('O');
    if (winMove !== -1) return winMove;
    
    // Block opponent
    const blockMove = findWinningMove('X');
    if (blockMove !== -1) return blockMove;
    
    // Take center
    if (gameState.board[4] === '') return 4;
    
    // Take corners
    const corners = [0, 2, 6, 8].filter(index => gameState.board[index] === '');
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
    
    // Take any empty
    return getEasyAIMove();
}

function getHardAIMove() {
    // For demo, use medium AI
    // In real app, implement minimax algorithm
    return getMediumAIMove();
}

function findWinningMove(player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameState.board[a] === player && gameState.board[b] === player && gameState.board[c] === '') return c;
        if (gameState.board[a] === player && gameState.board[c] === player && gameState.board[b] === '') return b;
        if (gameState.board[b] === player && gameState.board[c] === player && gameState.board[a] === '') return a;
    }
    
    return -1;
}

function handleGameEnd(winner) {
    gameState.gameActive = false;
    
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    let xpReward = 0;
    let coinReward = 0;
    
    if (winner === 'X') {
        // Player wins
        userStats.wins++;
        userStats.winStreak++;
        updateGameStatus('🎉 You Win!');
        
        switch (gameState.currentDifficulty) {
            case 'easy': xpReward = 5; coinReward = 10; break;
            case 'medium': xpReward = 10; coinReward = 20; break;
            case 'hard': xpReward = 20; coinReward = 40; break;
            case 'impossible': xpReward = 50; coinReward = 100; break;
        }
        
    } else if (winner === 'O') {
        // AI wins
        userStats.losses++;
        userStats.winStreak = 0;
        updateGameStatus('😔 You Lose!');
        xpReward = 2;
        coinReward = 5;
    } else {
        // Draw
        userStats.draws++;
        userStats.winStreak = 0;
        updateGameStatus('🤝 It\'s a Draw!');
        xpReward = 3;
        coinReward = 8;
    }
    
    userStats.coins += coinReward;
    addXP(xpReward);
    checkAchievements();
    updateProfileDisplay();
    saveUserStats(); // Save stats after game
    
    gameElements.rematchBtn.classList.remove('hidden');
}

// Firebase Authentication Functions
async function handleLogin(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
}

async function handleSignup(email, password) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
}

// Firebase Functions for User Stats
async function saveUserStats() {
    if (!currentUser) return;
    try {
        await db.collection('users').doc(currentUser.uid).set(userStats, { merge: true });
        console.log('User stats saved to Firebase');
    } catch (error) {
        console.error('Error saving user stats:', error);
    }
}

async function loadUserStats() {
    if (!currentUser) return;
    try {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        if (doc.exists) {
            const data = doc.data();
            // Merge with defaults to handle new fields
            userStats = {
                level: data.level || 1,
                xp: data.xp || 0,
                coins: data.coins || 100,
                wins: data.wins || 0,
                losses: data.losses || 0,
                draws: data.draws || 0,
                winStreak: data.winStreak || 0,
                achievements: data.achievements || [],
                purchasedThemes: data.purchasedThemes || ['classic'],
                currentTheme: data.currentTheme || 'classic',
                multiplayerGames: data.multiplayerGames || 0,
                coinsSpent: data.coinsSpent || 0
            };
            console.log('User stats loaded from Firebase');
        } else {
            console.log('No existing user stats found, using defaults');
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

// Purchase Functions
function purchaseCoins(coins) {
    // In real app, this would integrate with payment gateway
    // For demo, just add coins
    userStats.coins += coins;
    updateProfileDisplay();
    alert(`✅ Purchased ${coins} coins! (Demo mode)`);
}

function purchaseTheme(themeId, price) {
    if (userStats.coins < price) {
        alert('❌ Not enough coins!');
        return;
    }
    
    if (!userStats.purchasedThemes.includes(themeId)) {
        userStats.purchasedThemes.push(themeId);
        userStats.coins -= price;
        userStats.coinsSpent += price;
        userStats.currentTheme = themeId;
        updateProfileDisplay();
        renderStore();
        saveUserStats(); // Save stats after purchase
        alert(`✅ Purchased ${themeId} theme!`);
    }
}

// Event Listeners
authElements.loginBtn.addEventListener('click', async () => {
    const email = authElements.email.value.trim();
    const password = authElements.password.value;
    
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    try {
        authElements.loginBtn.disabled = true;
        authElements.loginBtn.textContent = 'Logging in...';
        
        const user = await handleLogin(email, password);
        currentUser = user;
        menuElements.userNameDisplay.textContent = user.email.split('@')[0];
        showScreen('mainMenu');
        clearAuthFields();
        
        // Load user stats
        await loadUserStats();
        updateProfileDisplay();
        renderAchievements();
        renderStore();
        
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Login failed. ';
        if (error.code === 'auth/user-not-found') {
            errorMessage += 'User not found.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage += 'Incorrect password.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage += 'Invalid email format.';
        } else {
            errorMessage += 'Please try again.';
        }
        showError(errorMessage);
    } finally {
        authElements.loginBtn.disabled = false;
        authElements.loginBtn.textContent = 'Login';
    }
});

authElements.signupBtn.addEventListener('click', async () => {
    const email = authElements.email.value.trim();
    const password = authElements.password.value;
    
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }

    try {
        authElements.signupBtn.disabled = true;
        authElements.signupBtn.textContent = 'Signing up...';
        
        const user = await handleSignup(email, password);
        currentUser = user;
        menuElements.userNameDisplay.textContent = user.email.split('@')[0];
        showScreen('mainMenu');
        clearAuthFields();
        
        // Initialize new user stats
        userStats = {
            level: 1,
            xp: 0,
            coins: 100,
            wins: 0,
            losses: 0,
            draws: 0,
            winStreak: 0,
            achievements: [],
            purchasedThemes: ['classic'],
            currentTheme: 'classic',
            multiplayerGames: 0,
            coinsSpent: 0
        };
        
        updateProfileDisplay();
        renderAchievements();
        renderStore();
        saveUserStats(); // Save initial stats for new user
        
    } catch (error) {
        console.error('Signup error:', error);
        let errorMessage = 'Signup failed. ';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage += 'Email already in use.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage += 'Invalid email format.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage += 'Password too weak.';
        } else {
            errorMessage += 'Please try again.';
        }
        showError(errorMessage);
    } finally {
        authElements.signupBtn.disabled = false;
        authElements.signupBtn.textContent = 'Sign Up';
    }
});

// Menu Navigation
menuElements.quickPlayBtn.addEventListener('click', () => {
    showScreen('aiDifficulty');
});

// Online Multiplayer - Matchmaking
menuElements.multiplayerBtn.addEventListener('click', async () => {
    if (!currentUser) {
        showError('Please login first');
        return;
    }

    await startMatchmaking();
});

async function startMatchmaking() {
    try {
        gameState.gameMode = 'multiplayer';
        gameState.board = Array(9).fill('');
        gameState.gameActive = false; // becomes true when match starts
        gameState.multiplayer.isActive = false;
        gameState.multiplayer.myMark = 'X';
        gameState.multiplayer.createdGame = false;
        gameState.multiplayer.gameDocRef = null;
        gameState.multiplayer.unsubscribe = null;
        gameState.timeLeft = 30;

        setGameTitleForMode();
        renderBoard();
        gameElements.rematchBtn.classList.add('hidden');
        gameElements.gameCoins.textContent = userStats.coins;
        updateGameStatus('Finding opponent...');
        showScreen('game');

        startMatchmakingCountdown();

        // Try to join an existing waiting game
        const waitingQuery = await db.collection('games')
            .where('status', '==', 'waiting')
            .orderBy('createdAt', 'asc')
            .limit(1)
            .get();

        if (!waitingQuery.empty) {
            const doc = waitingQuery.docs[0];
            const docRef = db.collection('games').doc(doc.id);
            // Attempt to join using a transaction to avoid race conditions
            await db.runTransaction(async (tx) => {
                const snapshot = await tx.get(docRef);
                if (!snapshot.exists) throw new Error('Game no longer exists');
                const data = snapshot.data();
                if (data.status === 'waiting' && !data.playerO) {
                    tx.update(docRef, {
                        playerO: currentUser.uid,
                        status: 'active',
                        startedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    });
                } else {
                    throw new Error('Game already taken');
                }
            });

            gameState.multiplayer.gameDocRef = docRef;
            gameState.multiplayer.myMark = 'O';
            bindGameListener();
            updateGameStatus('Matched! Opponent found.');
            clearMatchmakingTimeout();
        } else {
            // Create a new waiting game
            const newDoc = await db.collection('games').add({
                status: 'waiting',
                playerX: currentUser.uid,
                playerO: null,
                board: Array(9).fill(''),
                currentPlayer: 'X',
                winner: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            gameState.multiplayer.gameDocRef = newDoc;
            gameState.multiplayer.myMark = 'X';
            gameState.multiplayer.createdGame = true;
            bindGameListener();
        }
    } catch (e) {
        console.error('Matchmaking error:', e);
        // Keep waiting instead of instant fallback; rely on 30s timer
        updateGameStatus('Still looking for an opponent...');
    }
}

function startMatchmakingCountdown() {
    // Show 30s countdown; if expires and still waiting, fallback to AI
    gameState.timeLeft = 30;
    gameElements.gameTimer.textContent = `⏱️ ${gameState.timeLeft}s`;
    if (gameState.timer) clearInterval(gameState.timer);
    gameState.timer = setInterval(() => {
        gameState.timeLeft -= 1;
        gameElements.gameTimer.textContent = `⏱️ ${gameState.timeLeft}s`;
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timer);
            gameState.timer = null;
            handleMatchmakingTimeout();
        }
    }, 1000);
}

function clearMatchmakingTimeout() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

async function handleMatchmakingTimeout() {
    try {
        // If we created a waiting game and it's still waiting, delete it
        if (gameState.multiplayer.createdGame && gameState.multiplayer.gameDocRef) {
            const snap = await gameState.multiplayer.gameDocRef.get();
            if (snap.exists && snap.data().status === 'waiting') {
                await gameState.multiplayer.gameDocRef.delete();
            }
        }
    } catch (e) {
        console.warn('Cleanup after timeout failed:', e);
    } finally {
        fallbackToAIFromMatchmaking();
    }
}

function fallbackToAIFromMatchmaking() {
    // Switch to AI game seamlessly
    updateGameStatus('No opponent found. Playing against AI.');
    gameState.gameMode = 'ai';
    gameState.currentDifficulty = 'medium';
    setGameTitleForMode();
    gameState.gameActive = true;
    gameState.isMyTurn = true;
    gameState.board = Array(9).fill('');
    renderBoard();
}

function bindGameListener() {
    if (!gameState.multiplayer.gameDocRef) return;
    if (gameState.multiplayer.unsubscribe) {
        gameState.multiplayer.unsubscribe();
        gameState.multiplayer.unsubscribe = null;
    }
    gameState.multiplayer.unsubscribe = gameState.multiplayer.gameDocRef.onSnapshot((doc) => {
        if (!doc.exists) return;
        const data = doc.data();
        // Activate game when status becomes active
        if (data.status === 'active' && !gameState.multiplayer.isActive) {
            gameState.multiplayer.isActive = true;
            clearMatchmakingTimeout();
            gameState.gameActive = true;
            updateGameStatus(gameState.multiplayer.myMark === data.currentPlayer ? 'Your turn' : "Opponent's turn");
        }

        if (Array.isArray(data.board)) {
            gameState.board = data.board;
            renderBoard();
        }

        if (data.currentPlayer) {
            gameState.currentPlayer = data.currentPlayer;
            gameState.isMyTurn = gameState.multiplayer.myMark === data.currentPlayer;
            if (gameState.multiplayer.isActive) {
                updateGameStatus(gameState.isMyTurn ? 'Your turn' : "Opponent's turn");
            }
        }

        if (data.winner) {
            // End game
            gameState.gameActive = false;
            const winner = data.winner;
            if (winner === 'draw') {
                updateGameStatus('🤝 It\'s a Draw!');
            } else if (winner === gameState.multiplayer.myMark) {
                updateGameStatus('🎉 You Win!');
            } else {
                updateGameStatus('😔 You Lose!');
            }
            gameElements.rematchBtn.classList.remove('hidden');
        }
    });
}

menuElements.profileBtn.addEventListener('click', () => {
    updateProfileDisplay();
    showScreen('profile');
});

menuElements.leaderboardBtn.addEventListener('click', () => {
    renderLeaderboard();
    showScreen('leaderboard');
});

menuElements.storeBtn.addEventListener('click', () => {
    renderStore();
    showScreen('store');
});

menuElements.achievementsBtn.addEventListener('click', () => {
    renderAchievements();
    showScreen('achievements');
});

menuElements.topupBtn.addEventListener('click', () => {
    showScreen('topup');
});

menuElements.logoutBtn.addEventListener('click', async () => {
    try {
        await saveUserStats();
        await auth.signOut();
        currentUser = null;
        showScreen('auth');
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// AI Difficulty Selection
aiElements.difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        gameState.currentDifficulty = btn.dataset.difficulty;
        gameState.gameMode = 'ai';
        gameState.gameActive = true;
        gameState.isMyTurn = true;
        gameState.currentPlayer = 'X';
        gameState.board = Array(9).fill('');
        gameState.blitzMode = false;
        
        // Set game title
        const difficultyNames = {
            easy: 'Easy',
            medium: 'Medium', 
            hard: 'Hard',
            impossible: 'Impossible'
        };
        gameElements.gameTitle.textContent = `AI Battle - ${difficultyNames[gameState.currentDifficulty]}`;
        
        renderBoard();
        updateGameStatus('Your turn (X)');
        gameElements.gameCoins.textContent = userStats.coins;
        gameElements.rematchBtn.classList.add('hidden');
        showScreen('game');
    });
});

aiElements.backToMenuFromAI.addEventListener('click', () => {
    showScreen('mainMenu');
});

// Game Controls
gameElements.cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const index = parseInt(cell.dataset.index);
        
        if (!gameState.gameActive || !gameState.isMyTurn || gameState.board[index] !== '') {
            return;
        }

        if (gameState.gameMode === 'ai') {
            gameState.board[index] = 'X';
            renderBoard();

            const winner = checkWinner();
            if (winner) {
                handleGameEnd(winner);
            } else {
                gameState.isMyTurn = false;
                updateGameStatus('AI thinking...');
                setTimeout(makeAIMove, 800);
            }
        } else if (gameState.gameMode === 'multiplayer') {
            const myMark = gameState.multiplayer.myMark;
            gameState.board[index] = myMark;
            renderBoard();

            const winner = checkWinner();
            if (winner) {
                // Write winner and final board
                if (gameState.multiplayer.gameDocRef) {
                    gameState.multiplayer.gameDocRef.update({
                        board: gameState.board,
                        winner: winner,
                        currentPlayer: myMark,
                    });
                }
                gameState.gameActive = false;
                updateGameStatus('Submitting result...');
                return;
            }

            // Switch turn to opponent
            const nextPlayer = myMark === 'X' ? 'O' : 'X';
            if (gameState.multiplayer.gameDocRef) {
                gameState.multiplayer.gameDocRef.update({
                    board: gameState.board,
                    currentPlayer: nextPlayer,
                });
            }
            gameState.isMyTurn = false;
            updateGameStatus("Opponent's turn");
        }
    });
});

gameElements.leaveGameBtn.addEventListener('click', () => {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    // Cleanup multiplayer listeners and game if still waiting
    if (gameState.gameMode === 'multiplayer') {
        if (gameState.multiplayer.unsubscribe) {
            gameState.multiplayer.unsubscribe();
            gameState.multiplayer.unsubscribe = null;
        }
        // If we created a waiting game, delete it to avoid clutter
        (async () => {
            try {
                if (gameState.multiplayer.createdGame && gameState.multiplayer.gameDocRef) {
                    const snap = await gameState.multiplayer.gameDocRef.get();
                    if (snap.exists && snap.data().status === 'waiting') {
                        await gameState.multiplayer.gameDocRef.delete();
                    }
                }
            } catch (_) {}
        })();
    }
    showScreen('mainMenu');
});

gameElements.rematchBtn.addEventListener('click', () => {
    if (gameState.gameMode === 'ai') {
        // AI rematch
        gameState.board = Array(9).fill('');
        gameState.isMyTurn = true;
        renderBoard();
        updateGameStatus('Your turn (X)');
        gameElements.rematchBtn.classList.add('hidden');
        gameState.gameActive = true;
    } else if (gameState.gameMode === 'multiplayer') {
        // Multiplayer rematch - start new matchmaking
        startMatchmaking();
    }
});

// Profile Navigation
profileElements.backToMenuFromProfile.addEventListener('click', () => {
    showScreen('mainMenu');
});

// Leaderboard Navigation
leaderboardElements.backToMenuFromLeaderboard.addEventListener('click', () => {
    showScreen('mainMenu');
});

// Store Navigation
storeElements.backToMenuFromStore.addEventListener('click', () => {
    showScreen('mainMenu');
});

// Achievements Navigation
achievementsElements.backToMenuFromAchievements.addEventListener('click', () => {
    showScreen('mainMenu');
});

// Top Up Navigation
topupElements.backToMenuFromTopup.addEventListener('click', () => {
    showScreen('mainMenu');
});

// Auth State Listener
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        menuElements.userNameDisplay.textContent = user.email.split('@')[0];
        showScreen('mainMenu');
        updateProfileDisplay();
    } else {
        currentUser = null;
        showScreen('auth');
    }
});

// Initialize achievements on load
renderAchievements();