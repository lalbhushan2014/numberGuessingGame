const readline = require('readline');
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});



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

function slugify(str) {
	str = str.replace(/^\s+|\s+$/g, ''); // trim leading/trailing white space
	str = str.toLowerCase(); // convert string to lowercase
	str = str.replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
		.replace(/\s+/g, '-') // replace spaces with hyphens
		.replace(/-+/g, '-'); // remove consecutive hyphens
	return str;
}

async function getName() {
	let contestantSlug = "";
	let contestantName = await askQuestion("Enter your name: ");

	if (contestantName && contestantName.trim().length > 0) {
		// Return the slug when name is valid
		return {
			contestantName: contestantName,
			contestantSlug: slugify(contestantName)
		};
	} else {
		// Wait for the recursive call to return before continuing
		return await getName();
	}
}


async function storeGameScore(gameInfo) {
	const dataFilePath = path.join(__dirname, "data.json");
	let gameScores = {};

	// Read existing data from the JSON file
	try {
		if (fs.existsSync(dataFilePath)) {
			let rawData = fs.readFileSync(dataFilePath);
			gameScores = JSON.parse(rawData);
		}
	} catch (error) {
		console.error("Error reading data file:", error);
		return;
	}

	let contestantSlug = gameInfo.contestantSlug;

	if (!contestantSlug || contestantSlug.trim().length === 0) {
		console.error("Invalid contestantSlug");
		return;
	}


	// Check if contestant already exists
	if (gameScores[contestantSlug]) {
		// Update existing contestant data
		gameScores[contestantSlug].totalRoundsPlayed += 1;
		gameScores[contestantSlug].totalWins += gameInfo.winningStatus == 1 ? 1 : 0;
		gameScores[contestantSlug].totalLoss += gameInfo.winningStatus ? 0 : 1;
		gameScores[contestantSlug].summary.push({
			trials: gameInfo.trials,
			winningNumber: gameInfo.winningNumber,
			guesses: gameInfo.guesses,
			winningStep: gameInfo.winningStep
		});
	} else {
		// Add new contestant
		gameScores[contestantSlug] = {
			name: gameInfo.contestantName,
			slug: contestantSlug,
			totalRoundsPlayed: 1,
			totalWins: gameInfo.winningStatus == 1 ? 1 : 0,
			totalLoss: gameInfo.winningStatus == 0 ? 1 : 0,
			summary: [
				{
					trials: gameInfo.trials,
					winningNumber: gameInfo.winningNumber,
					guesses: gameInfo.guesses,
					winningStep: gameInfo.winningStep
				}
			]
		};
	}

	// Save updated data back to file
	try {
		fs.writeFileSync(dataFilePath, JSON.stringify(gameScores, null, 2));
		// console.log("Game score updated successfully!");
	} catch (error) {
		console.error("\n Error writing to data file:", error);
	}
}

async function resumeGame() {
	let resumeGameStatus = await askQuestion("Do you want to play another round of game? (yes/no): ");

	resumeGameStatus = resumeGameStatus.trim().toLowerCase();

	if (resumeGameStatus === 'yes') {
		return 1;
	} else if (resumeGameStatus === 'no') {
		return 0;
	} else {
		console.log("Invalid input. Please enter 'yes' or 'no'.");
		return await resumeGame(); // Recursively call itself until a valid input is received
	}
}




// Function to start the game
async function startGame() {
	let difficultySelected = false;
	let maxTrials = 0;
	let contestantScore = 0;
	let contestantCompletionTime = 0;




	let contestantInfo = await getName();



	if (contestantInfo.contestantSlug && contestantInfo.contestantSlug.trim().length > 0) {
		// Welcome Message
		console.log(`\nWelcome to the Number Guessing Game!`);
		console.log(`I'm thinking of a number between 1 and 100.`);
		console.log(`\nPlease select the difficulty level:`);
		console.log(`1. Easy (10 chances)`);
		console.log(`2. Medium (5 chances)`);
		console.log(`3. Hard (3 chances)\n`);
	}




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
	let guessArr = [];

	while (trials < maxTrials && !guessedCorrectly) {
		let userGuess = await guessSection();
		trials++;

		guessArr.push(userGuess);
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

	// console.log(`trials ${trials}, developerChoice ${developerChoice} and maxTrials ${maxTrials}`);

	// store game score in the site start 

	let gameInfo = {
		"trials": trials,
		"winningNumber": developerChoice,
		"guesses": guessArr,
		"winningStep": (guessedCorrectly) ? guessArr.length : 0,
		"winningStatus": guessedCorrectly,
		"contestantSlug": contestantInfo.contestantSlug,
		"contestantName": contestantInfo.contestantName

	};
	storeGameScore(gameInfo);
	// store game score in the site end 

	// rsume the game start
	let resumeStatus = await resumeGame();
	if (resumeStatus) {
		await startGame();
	} else {
		console.log(`Thank You for playing the game. Visit again for more thrills.`);
		rl.close();
	}
	// resume the game end


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
