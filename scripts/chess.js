//import {makeBoard} from './makeBoard.js';
// START makeBoard.js
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const toggleSelected = function(clickEvent) {
	const clickedSquare = clickEvent.currentTarget;
	if (clickedSquare.hasAttribute('selected')) {
		clickedSquare.removeAttribute('selected');
	} else {
		clickedSquare.setAttribute('selected', '');
	}
}

function makeSquare(rankIndex, fileLabel, fileIndex) {
	let s = document.createElement('div');
	s.id = 'square_' + rankIndex + fileIndex;
	s.className = 'square ' + (((fileIndex + rankIndex) % 2 === 1) ? 'dark' : 'light');
	
	s.addEventListener('click', toggleSelected);
	
	return s;
}

function makeRank(rankIndex) {
	let r = document.createElement('div');
	r.className = 'rank';
	r.id = 'rank_' + rankIndex;
	let rankSquares = files.map((fileLabel, fileIndex) => {
		return makeSquare(rankIndex, fileLabel, fileIndex);
	});
	rankSquares.forEach(e => {
		r.appendChild(e);
	});
	return r;
}

function makeBoard() {
	let b = document.createElement('div');
	b.className = 'board';
	b.id = 'board';
	let boardRanks = ranks.map((rankLabel, rankIndex) => {
		return makeRank(rankIndex);
	});
	boardRanks.forEach(e => {
		b.appendChild(e);
	});
	
	return b;
}
// END makeBoard.js

function getSquare(rankIndex, fileIndex) {
	return document.getElementById('square_' + rankIndex + fileIndex);
}

function addPiecetoSquare(pieceColor, pieceType, square) {
	square.setAttribute('piececolor', pieceColor);
	square.setAttribute('piecetype', pieceType);
}

function addPieceToRankFile(pieceColor, pieceType, rankIndex, fileIndex) {
	addPiecetoSquare(pieceColor, pieceType, getSquare(rankIndex, fileIndex));
}

function removePieceFromSquare(s) {
	s.removeAttribute('piececolor');
	s.removeAttribute('piecetype');
}

function removePieceFromRankFile(rankIndex, fileIndex) {
	removePieceFromSquare(getSquare(rankIndex, fileIndex));
}

const app = document.getElementById('app');

const b = makeBoard();
app.appendChild(b);

addPieceToRankFile('white', 'knight', 3, 3);
addPieceToRankFile('black', 'rook', 2, 5);
