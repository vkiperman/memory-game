(function(){
	'use strict';

	angular.module('MemoryGame', [])
	.controller('MemoryGameCtrl', ['$scope', '$timeout', function($scope, $timeout){
		var symbols = ['♚','♛','♜','♝','♞','♟','♔','♕','♖','♗','♘','♙'];
		var turnedCards = [];
		var UNTURN_DELAY = 1500;

		function reset(){
			turnedCards = [];
		}
		function checkMatch(){
			return turnedCards[0].value === turnedCards[1].value;
		}
		function createCard(symbol, i){
			return {
				value: 		symbol,
				name:  		i,
				show:  		false,
				matched: 	false
			};
		}
		function unTurn(card){
			card.show = false;
		}
		function markAsMatched(card){
			//unTurn(card);
			card.matched = true;
		}
		function shuffle(){
			$scope._cards.sort(function(a, b){ 
				var random = Math.round((Math.random() * 2) - 1) || 1;
				return random;
			});
		}
		function checkGameStatus(){
			if($scope.totalMatch === $scope.cards.length/2){
				gameOver();
			}
		}
		function gameOver(){
			$scope.start = false;
			$scope.timerStarted = false;
			++$scope.gamesPLayed;

			$scope.clearCards();
			$scope.setBestScore($scope.clicks);
			$scope.resetCards();

			$scope.clicks = 0;
			$scope.totalMatch = 0;

			shuffle();
			$scope.dealCards(0);
		}
		$scope.LOCAL_STORAGE = 'memory-game-local-storage';
		$scope.bestScore = false;
		$scope.start = false;
		$scope.unTurnPromise;
		$scope.markAsMatchedPromise;
		$scope.clicks = 0;
		$scope.totalMatch = 0;
		$scope.cards = [];
		$scope.gamesPLayed = 0;

		$scope._cards = symbols.map(createCard)
			.concat(symbols.map(createCard));

		$scope.resetCards = function resetCards(){
			$scope._cards.forEach(function(card){
				card.show = false;
				card.matched = false;
			});
		};

		$scope.dealCards = function dealCards(i){
			$scope.cards.push($scope._cards[i]);

			if($scope.cards.length < $scope._cards.length){
				$timeout(function(){
					$scope.dealCards(i+1);
				}, i * 8);
				return;
			}
			$scope.start = true;
		};
		$scope.clearCards = function clearCards(){
			$scope.cards = [];
		}
		$scope.getBestScore = function getBestScore(){
			$scope.bestScore = localStorage.getItem($scope.LOCAL_STORAGE);
		}
		$scope.setBestScore = function setBestScore(score){
			var fromStorage = localStorage.getItem($scope.LOCAL_STORAGE);
			if(score === null){
				localStorage.removeItem($scope.LOCAL_STORAGE);
				$scope.getBestScore();
				return;
			}
			if(!fromStorage || score < parseInt( fromStorage )){
				localStorage.setItem($scope.LOCAL_STORAGE, score);
				$scope.getBestScore();
			}
		}

		$scope.timer = 0;
		$scope.timerDelay = 1000/32;
		$scope.timerStarted = false;
		$scope.keepTime = function keepTime(n){
			if(!$scope.timerStarted) return;
			if(n===0)$scope.timer = n;
			$timeout(function(){
				$scope.timer++;
				$scope.keepTime();
			}, $scope.timerDelay);
		}

		$scope.pickCard = function(card){
			if(!$scope.start) return;
			if(!$scope.timerStarted){
				$scope.timerStarted = true;
				$scope.keepTime(0);
			}

			if(card.matched || card.show) return;
			++$scope.clicks;

			if(turnedCards.length === 2){
				$timeout.cancel($scope.markAsMatchedPromise);
				$timeout.cancel($scope.unTurnPromise);

				if(checkMatch()){
					turnedCards.forEach(markAsMatched);
				} else {
					turnedCards.forEach(unTurn);
				}
				reset();
			}

			turnedCards.push(card);
			card.show = true;

			if(turnedCards.length === 2){
				if(checkMatch()){
					++$scope.totalMatch;
					$scope.markAsMatchedPromise = $timeout(function(){
						turnedCards.forEach(markAsMatched);
						reset();

						checkGameStatus();

					}, UNTURN_DELAY);
				} else {
					//$scope.freezePlay = true;
					$scope.unTurnPromise = $timeout(function(){
						turnedCards.forEach(unTurn);
						reset();
					}, UNTURN_DELAY);
				}
			}
		}

		shuffle();
	}])
	.directive('game', function(){
		return {
			restrict: 'E',
			templateUrl: 'templates/game.html',
			link: function(scope){
				scope.dealCards(0);
				scope.getBestScore();
			}
		}
	});

})();