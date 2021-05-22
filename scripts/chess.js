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

function clearBoard() {
	for (i = 0; i < 8; i++) {
		for (j = 0; j < 8; j++) {
			removePieceFromRankFile(i, j);
		}
	}
}

function resetBoard() {
	clearBoard();
	
	addPieceToRankFile('black', 'rook', 0, 0);
	addPieceToRankFile('black', 'knight', 0, 1);
	addPieceToRankFile('black', 'bishop', 0, 2);
	addPieceToRankFile('black', 'queen', 0, 3);
	addPieceToRankFile('black', 'king', 0, 4);
	addPieceToRankFile('black', 'bishop', 0, 5);
	addPieceToRankFile('black', 'knight', 0, 6);
	addPieceToRankFile('black', 'rook', 0, 7);
	
	for (i = 0; i < 8; i++) {
		addPieceToRankFile('black', 'pawn', 1, i);
	}
	
	addPieceToRankFile('white', 'rook', 7, 0);
	addPieceToRankFile('white', 'knight', 7, 1);
	addPieceToRankFile('white', 'bishop', 7, 2);
	addPieceToRankFile('white', 'queen', 7, 3);
	addPieceToRankFile('white', 'king', 7, 4);
	addPieceToRankFile('white', 'bishop', 7, 5);
	addPieceToRankFile('white', 'knight', 7, 6);
	addPieceToRankFile('white', 'rook', 7, 7);
	
	for (i = 0; i < 8; i++) {
		addPieceToRankFile('white', 'pawn', 6, i);
	}
}

function deselectAll() {
	for (i = 0; i < 8; i++) {
		for (j = 0; j < 8; j++) {
			let s = getSquare(i, j);
			if (s.hasAttribute('selected')) s.removeAttribute('selected');
		}
	}
}

const app = document.getElementById('app');
const b = makeBoard();
app.appendChild(b);

const buttonReset = document.getElementById('button_reset');
buttonReset.addEventListener('click', resetBoard);

const buttonDeselect = document.getElementById('button_deselect');
buttonDeselect.addEventListener('click', deselectAll);


resetBoard();
