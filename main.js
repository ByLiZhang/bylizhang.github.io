$(document).ready(initializeApp);

var dataStorage = [{
	value: '',
	rank: '',
}];
var inputHistory = [];
var operators = ['+', '-', '*', '/', 'sin', 'cos', 'power', 'root', 'log', 'factorial'];
var ext_operators = ['sin', 'cos', 'power', 'root', 'log', 'factorial'];
var calculated = false;

function initializeApp() {
	addClickHandlers();
}

function addClickHandlers() {
	$('.clear button').on('click', handleClearClick);
	$('.operators button').on('click', handleOperatorClick);
	$('.ext_operators button').on('click', handleOperatorClick);
	$('.numbers button').on('click', handleNumberClick);
	$('.ext_operators .intro').on('click', displayIntro);
}

function handleClearClick() {
	if ($(this).text() === 'CE') {
		dataStorage.pop();
		if (dataStorage.length === 0) {
			insert(dataStorage);
		} 
	}
	if ($(this).text() === 'C') {
		dataStorage = [];
		insert(dataStorage);
		inputHistory = [];
		calculated = false;
	}
	updateDisplay(dataStorage);
}

function handleOperatorClick() {
	var operatorClicked = $(this).attr('value');
	var lastEntry = dataStorage[dataStorage.length-1];
	calculated = false;
	if ( operators.includes(lastEntry.value) && !ext_operators.includes(operatorClicked)) {
			lastEntry.value = operatorClicked; // only stores the last basic operator, for multiple/changing operands
	} else if ( lastEntry.value !== undefined){ 
		insert(dataStorage,operatorClicked, 2);
	}		
	updateDisplay(dataStorage);
}

function handleNumberClick() {
	var numberClicked = $(this).text();
	var lastEntry = dataStorage[dataStorage.length-1];
	if (numberClicked === '=') {
		handleEquals(dataStorage);		
	} else {
		if (numberClicked === '.'){
			if(lastEntry.value.toString().indexOf('.') === -1 && !operators.includes(lastEntry.value)) {
				storeValue(dataStorage,lastEntry.value += numberClicked, 1);
			} else if (operators.includes(lastEntry.value)){
				insert(dataStorage,numberClicked, 1);
			}
		} else if (isNumeric(numberClicked)) { 
			if (calculated) {
				dataStorage = [];
				insert(dataStorage);
				lastEntry = dataStorage[dataStorage.length-1];
				calculated = false;
			} 
			if ( lastEntry.value === undefined || !operators.includes(lastEntry.value)){
			storeValue(dataStorage,lastEntry.value += numberClicked, 1);
			} else if (operators.includes(lastEntry.value)){
				insert(dataStorage,numberClicked, 1);
			}
		} 
		updateDisplay(dataStorage);
	}
}

function isNumeric(num) {
	return !isNaN(parseFloat(num)) && isFinite(num);
}

function handleEquals(inputData) {
	var result;
	if(!calculated){	
		if (inputData[0].value === '' && inputData.length === 1 && inputHistory.length === 0) {		
			// for 'missing operands'
			var readyMsg = [];
			insert(readyMsg, 'Ready', 1);
			result = readyMsg;
			inputData = [];
			insert(inputData);
			calculated = false;
		} else if (inputData[0].value !== '' && inputData.length === 1 && inputHistory.length === 0) {
			// for 'missing operation'
			result = doMath(inputData);
			calculated = true;
		} else if(inputData.length === 2 && isNumeric(inputData[0].value) && operators.includes(inputData[1].value)){
			//for 'partial operand'
			duplicateLastNumber(inputData);
			result = doMath(inputData);
			calculated = true;
		} else if (isNumeric(inputData[inputData.length-2].value) && operators.includes(inputData[inputData.length-1].value)) {
			//for 'operation rollover'
			format(inputData);
			var lastOperand = JSON.parse(JSON.stringify(inputData.splice(inputData.length-1,1)));
			doMath(inputData);
			inputData.push(lastOperand[0]);
			duplicateLastNumber(inputData);
			result = doMath(inputData);
			calculated = true;
		}else {
			inputHistory = JSON.parse(JSON.stringify(inputData));
			format(inputData);
			result = doMath(inputData);
			calculated = true;
		}
	} else {
		if (operators.includes(inputData[inputData.length-1].value) && !ext_operators.includes(inputData[inputData.length-1].value)){
			duplicateLastNumber(inputData);
			result = doMath(inputData);
		} else if (!operators.includes(inputData[inputData.length-1].value)) {
			//for 'operation repeat'
			format(inputData);
			var lastOperation = inputHistory.slice(inputHistory.length-2);
			// Array.portotype.push.apply(inputData, lastOperation);
			inputData.push(lastOperation[0]);
			inputData.push(lastOperation[1]);
			inputHistory = JSON.parse(JSON.stringify(inputData));
			format(inputData);
			result = doMath(inputData);
		}
		calculated = true;
	}	
	updateDisplay(result);
}

function duplicateLastNumber(inputData) {
	var repeatData = JSON.parse(JSON.stringify(inputData[inputData.length-2]));
	inputData.push(repeatData);
	format(inputData);
}

function insert(inputData, value, rank) {
	var itemToAdd = {};
		itemToAdd.value = value || '';
		itemToAdd.rank = rank || '';
		inputData.push(itemToAdd);
}

function storeValue(inputData, value, rank) {
		inputData[inputData.length-1].value = value;
		inputData[inputData.length-1].rank = rank;
}

function getValue(inputData) {
	var storedValue = [];
	for (var i = 0; i < inputData.length; i++) {
		storedValue.push(inputData[i].value);
	}
	return storedValue;
}

function format(inputData) {
	// if (operators.includes(inputData[inputData.length-1].value)){
	// 	inputData.pop();
	// }
	if (inputData[0].value == 0 && inputData[1].value !== '.') {
		inputData.shift();
	}
	while (inputData[0].value === '' || operators.includes(inputData[0].value) && !ext_operators.includes(inputData[0].value)){
		inputData.shift(); //for 'premature operation'
	}
	for (var i = 0; i < inputData.length; i++) {
	 	if (inputData[i].value === '*' || inputData[i].value === '/'){
	 	inputData[i].rank = 3;
	 	} else if (inputData[i].value === 'power' || inputData[i].value === 'root') {
	 	inputData[i].rank = 4;
	 	}else if (inputData[i].value === 'sin' || inputData[i].value === 'cos' || inputData[i].value === 'log' || inputData[i].value === 'factorial') {
	 	inputData[i].rank = 5;
	 	} else if (!operators.includes(inputData[i].value)){
	 		inputData[i].value = parseFloat(inputData[i].value);
	 	}
	}
}

function updateDisplay(inputData){
	var displayMessage = getValue(inputData).join(' ');
	$('.screen').text(displayMessage);
}

function factorial(num) {
	if (num >= 0) {
		var result = 1;
		for (var i = 2; i <= num; i++){
			result *= i;
		}
		return result;
	} else {
		return 'Error';
	}
}

function displayIntro() {
	dataStorage = [];
	inputHistory = [];
	var intro = "Greetings! My name is Mathy McMathface. May I help you with some math?";
	insert(dataStorage, intro, 1);
	updateDisplay(dataStorage);
	dataStorage = [];
	insert(dataStorage);
}

function doMath(inputData) {
	for (var i = 0; i < inputData.length; i++) {
		if (inputData[i].rank === 5){
			if (inputData[i].value === 'sin') {
				inputData[i].value = Math.sin( inputData[i+1].value * Math.PI / 180).toFixed(6);
			} else if (inputData[i].value === 'cos') {
				inputData[i].value = Math.cos( inputData[i+1].value * Math.PI / 180).toFixed(6);
			} else if (inputData[i].value === 'log'){
				inputData[i].value = Math.log10(inputData[i+1].value);
			} else if (inputData[i].value === 'factorial') {
				inputData[i].value = factorial(inputData[i+1].value);
			}
			inputData[i].rank = 1;
			inputData.splice(i+1, 1);
			i -= 1;
		// } else if (inputData[i].rank === 5 && !operators.includes(inputData[i-1].value)){
		// 	inputData = [{
		// 				value: 'Error'
		// 	}];
		}
	}
	for (var i = 0; i < inputData.length; i++) {
		if (inputData[i].rank === 4){
			if (inputData[i].value === 'power') {
				inputData[i-1].value = Math.pow( inputData[i-1].value, inputData[i+1].value).toFixed(6);
			} else if (inputData[i].value === 'root') {
				inputData[i-1].value = Math.pow( inputData[i-1].value, 1/inputData[i+1].value).toFixed(6);
			}
			inputData.splice(i, 2);
			i -= 2;
		}
	}
	for (var i = 0; i < inputData.length; i++){
		if (inputData[i].rank === 3){
			if (inputData[i].value === '*'){
				inputData[i-1].value *= inputData[i+1].value; 
				inputData.splice(i, 2);
			} else if (inputData[i].value === '/'){
				if (parseFloat(inputData[i+1].value) === 0) {
					inputData = [{
						value: 'Error'
					}];
				} else {
					inputData[i-1].value /= inputData[i+1].value; 
					inputData[i-1].value = Number(inputData[i-1].value).toFixed(6);
					inputData.splice(i, 2);
				}
			}
			i -= 2;
		}
	}
	for (var i = 0; i < inputData.length; i++) {
		if (inputData[i].rank === 2) {
			if (inputData[i].value === '+') {
				inputData[i-1].value = (parseFloat(inputData[i-1].value) + parseFloat(inputData[i+1].value)).toFixed(6);
			}
			if (inputData[i].value === '-') {
				inputData[i-1].value -= inputData[i+1].value; 
			}
			inputData.splice(i, 2);
			i -= 2;
		}
	}
	return inputData;
}
