$(document).ready(initializeApp);

var first_card_clicked = null;
var match_counter = 0;
var attempt_counter = 0;
var anotherClickAllowed = true;
var cardArr = ['img/card-1.png', 'img/card-1.png', 'img/card-2.png', 'img/card-2.png',
			   'img/card-3.png', 'img/card-3.png', 'img/card-4.png', 'img/card-4.png',
			   'img/card-5.png', 'img/card-5.png', 'img/card-6.png', 'img/card-6.png',
			   'img/card-7.png', 'img/card-7.png', 'img/card-8.png', 'img/card-8.png',
			   'img/card-9.png', 'img/card-9.png'];

function initializeApp() {
	startCutScene();
	setTable();
}

function setTable() {
	shuffle(cardArr);
	makeCards(cardArr);
	var card = $('#game .card');
	$(card).on('click', handleClick);
	$('#game .stats .reset').on('click', reset);
}

function handleClick() {
	if (first_card_clicked === null && anotherClickAllowed) {
		first_card_clicked = this;
		flipBack(this);
	} else {
		if(!$(this).hasClass('flipper') && anotherClickAllowed ){
			anotherClickAllowed= false;
			var second_card_clicked = this;
			flipBack(this);
			attempt_counter++;
			compareCards(first_card_clicked, second_card_clicked);
		}
	}
}

function flipBack(card) {
	$(card).addClass('flipper');
}

function showBack(card) {
	$(card).removeClass('flipper');
}

function compareCards(card1, card2) {
	var cardName1 = $(card1).find('.front img').attr('src');
	var cardName2 = $(card2).find('.front img').attr('src');
	if (cardName1 === cardName2){
		match_counter++;
		updateStats(match_counter);
		anotherClickAllowed = true;
		first_card_clicked = null;  //no need to check if local variable second_card_clicked = null;
	} else {
		setTimeout(function(){
			showBack(card1);
			showBack(card2);
			setTimeout(function(){
			anotherClickAllowed = true;
			first_card_clicked = null;  //no need to check if second_card_clicked = null;
			}, 1050);
		}, 1500);
	}
}

function updateStats(score) {
	if (score%9 === 0 && score !== 0){
		var gameWon = (score/9).toString();
		$('#game .stats .games-played .value').text(gameWon);
		updateAttempts(attempt_counter.toString());
		updateAccuray((((score/attempt_counter)*100).toFixed(2)));
		displayWin();
	} 
}

function updateAttempts(num) {
	$('#game .stats .attempts .value').text((num).toString());
}

function updateAccuray(num) {
	$('#game .stats .accuracy .value').text(num + '%');
}

function displayWin() {
	setTimeout(function(){
		$('.win_message.hide').removeClass('hide');
		$('.win_message').css({
			'background-image':'url(img/Smaug.gif)',
			'background-position': 'center',
			'background-repeat': 'no-repeat',
			'background-size': 'cover'
		});
		sounds.roar.play();
		setTimeout(function(){
			$('.win_message span').text('You won');
			$('.win_message span').addClass('animation_fadeIn');
		}, 3000);
		setTimeout(function(){
			$('.win_message').css('background-image', '');
		}, 2600);
	}, 1500);
	anotherClickAllowed = false;
}

function reset() {
	$('#game-area').html('<div class="win_message hide"><span></span></div>');
	setTable();
	anotherClickAllowed = true;
}

function makeCards(cardArr) {
	var game_area = $('#game-area');
	for (var i = 0; i < cardArr.length; i++) {
		var card = $('<div>').addClass('card');
		var front = $('<div>').addClass('front');
		var back = $('<div>').addClass('back');
		var frontImg = $('<img>').attr('src', cardArr[i]);
		var backImg	= $('<img>').attr('src', 'img/card-back.png');
		front.append(frontImg);
		back.append(backImg);
		card.append(front);
		card.append(back);
		game_area.append(card);
	}
}

function shuffle(cards) {
	for (var i = 0; i < cards.length; i++) {
		var randomIndex = Math.floor(Math.random() * (i+1));
		var buffer = cards[i];
		cards[i] = cards[randomIndex];
		cards[randomIndex] = buffer;
	}
	return cardArr;
}

function startCutScene() {
	$('.win_message').removeClass('hide');
	$('.win_message').css({
			'background-image':'url(img/flyover.gif)',
			'background-repeat': 'no-repeat',
			'background-size': 'cover',
			'background-position': 'center'
		});
	sounds.wing.play();
	setTimeout(function(){
		$('.win_message').addClass('hide');
		}, 4200);
}

var sounds = {
	roar: new Howl({
		src: ['sounds/roar.mp3'],
		volume: 0.25
	}),
	wing: new Howl({
		src: ['sounds/wingflap.mp3'],
		volume: 1
	})
}