const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Welcome Message
console.log(`\nWelcome to the Number Guessing Game!`);
console.log(`I'm thinking of a number between 1 and 100.`);
console.log(`\nPlease select the difficulty level:`);
console.log(`1. Easy (10 chances)`);
console.log(`2. Medium (5 chances)`);
console.log(`3. Hard (3 chances)\n`);

// Function to prompt the user and return a promise
const askQuestion = (query) => {
	return new Promise((resolve) => rl.question(query, (answer) => resolve(answer)));
};

// Get difficulty level and max attempts
function getDifficultyLevel(level) {
	switch (level) {
		case 1: return { text: "Easy", maxTrials: 10 };
		case 2: return { text: "Medium", maxTrials: 5 };
		case 3: return { text: "Hard", maxTrials: 3 };
		default: return { text: "", maxTrials: 0 };
	}
}

// Function to start the game
async function startGame() {
	let difficultySelected = false;
	let maxTrials = 0;

	while (!difficultySelected) {
		let answer = parseInt(await askQuestion("Enter your choice: "));
		let difficulty = getDifficultyLevel(answer);

		if (difficulty.maxTrials > 0) {
			console.log(`\nGreat! You have selected ${difficulty.text} difficulty.`);
			console.log(`You will have ${difficulty.maxTrials} chances to guess the correct number.`);
			maxTrials = difficulty.maxTrials;
			difficultySelected = true;
		} else {
			console.log("\nInvalid choice. Please enter 1, 2, or 3.");
		}
	}

	// Generate random number
	const developerChoice = Math.floor(Math.random() * 100) + 1;
	console.log("\nLet's start the game!\n");

	let trials = 0;
	let guessedCorrectly = false;

	while (trials < maxTrials && !guessedCorrectly) {
		let userGuess = await guessSection();
		trials++;
		// console.log(`trials ${trials}, developerChoice ${developerChoice} and maxTrials ${maxTrials}`);

		if (userGuess === developerChoice) {
			console.log(`Congratulations! You guessed the correct number in ${trials} tries!`);
			guessedCorrectly = true;
		} else if (userGuess < developerChoice) {
			console.log("Incorrect! The number is too low. Try again.");
		} else {
			console.log("Incorrect! The number is too high. Try again.");
		}
	}

	if (!guessedCorrectly) {
		console.log(`Game Over! The correct number was ${developerChoice}.`);
	}

	rl.close();
}

// Function to handle guessing
async function guessSection() {
	let guessAnswer = await askQuestion("\nEnter your guess: ");
	let userGuess = parseInt(guessAnswer);

	console.log(`You guessed: ${userGuess}`);
	return userGuess;
}



// Start the game
startGame();
