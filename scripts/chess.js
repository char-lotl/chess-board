//import {makeBoard} from './makeBoard.js';
// START makeBoard.js
const rankLabels = [8, 7, 6, 5, 4, 3, 2, 1];
const fileLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

let b;
let knightMoves = [[], [], [], [], [], [], [], []];
const knightIntervals = [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]];

function generateKnightMoves () {
	for (i = 0; i < 8; i++) {
		knightMoves[i] = [[], [], [], [], [], [], [], []];
	}
	for (i = 0; i < 8; i++) {
		for (j = 0; j < 8; j++) {
			knightMoves[i][j] = generateKnightMovesFrom(i, j);
		}
	}
}

function generateKnightMovesFrom(r, f) {
	m = [];
	knightIntervals.forEach(i => {
		let mrank = r + i[0];
		let mfile = f + i[1];
		if (isInBounds(mrank, mfile)) {
			m.push(b[mrank][mfile]);
		}
	});
	return m;
}

function isInBounds(r, f) {
	return ((r >= 0) && (f >= 0) && (r < 8) && (f < 8));
}

function getLegalMoves(square) {
	let legalMoves = [];
	if (square.piece) switch (square.piece.type) {
		case 'rook':
			legalMoves = legalRookMovesFrom(square.rank, square.file);
			break;
		case 'knight':
			legalMoves = legalKnightMovesFrom(square.rank, square.file);
			break;
		case 'bishop':
			legalMoves = legalBishopMovesFrom(square.rank, square.file);
			break;
		case 'queen':
			legalMoves = legalQueenMovesFrom(square.rank, square.file);
			break;
		case 'king':
			legalMoves = legalKingMovesFrom(square.rank, square.file);
			break;
		case 'pawn':
			if (square.piece.color === 'white') {
				legalMoves = legalWhitePawnMovesFrom(square.rank, square.file);
			} else {
				legalMoves = legalBlackPawnMovesFrom(square.rank, square.file);
			}
			break;
		default:
			legalMoves = [];
			console.log('Invalid piece type for getting moves.');
			break;
	}
	return legalMoves;
}

function legalRookMovesFrom(r, f) {
	let rightRay = rayFromIntervalExtent(r, f, 0, 1);
	let upRay = rayFromIntervalExtent(r, f, -1, 0);
	let leftRay = rayFromIntervalExtent(r, f, 0, -1);
	let downRay = rayFromIntervalExtent(r, f, 1, 0);
	
	return rightRay.concat(upRay).concat(leftRay).concat(downRay);
}

function legalKnightMovesFrom(r, f) {
	return knightMoves[r][f];
}

function legalBishopMovesFrom(r, f) {
	let upRightRay = rayFromIntervalExtent(r, f, -1, 1);
	let upLeftRay = rayFromIntervalExtent(r, f, -1, -1);
	let downLeftRay = rayFromIntervalExtent(r, f, 1, -1);
	let downRightRay = rayFromIntervalExtent(r, f, 1, 1);
	
	return upRightRay.concat(upLeftRay).concat(downLeftRay).concat(downRightRay);
}

function legalQueenMovesFrom(r, f) {
	return legalRookMovesFrom(r, f)
	.concat(legalBishopMovesFrom(r, f));
}

function legalKingMovesFrom(r, f) {
	let rightStep = rayFromIntervalExtent(r, f, 0, 1, 1);
	let upRightStep = rayFromIntervalExtent(r, f, -1, 1, 1);
	let upStep = rayFromIntervalExtent(r, f, -1, 0, 1);
	let upLeftStep = rayFromIntervalExtent(r, f, -1, -1, 1);
	let leftStep = rayFromIntervalExtent(r, f, 0, -1, 1);
	let downLeftStep = rayFromIntervalExtent(r, f, 1, -1, 1);
	let downStep = rayFromIntervalExtent(r, f, 1, 0, 1);
	let downRightStep = rayFromIntervalExtent(r, f, 1, 1, 1);
	
	return rightStep.concat(upRightStep).concat(upStep)
	.concat(upLeftStep).concat(leftStep).concat(downLeftStep)
	.concat(downStep).concat(downRightStep);
}

function legalWhitePawnMovesFrom(r, f) {
	let upRay;
	if (r === 6) {
		upRay = rayFromIntervalExtent(r, f, -1, 0, 2);
	} else {
		upRay = rayFromIntervalExtent(r, f, -1, 0, 1);
	}
	return upRay;
}

function legalBlackPawnMovesFrom(r, f) {
	let downRay;
	if (r === 1) {
		downRay = rayFromIntervalExtent(r, f, 1, 0, 2);
	} else {
		downRay = rayFromIntervalExtent(r, f, 1, 0, 1);
	}
	return downRay;
}

function rayFromIntervalExtent(r, f, ri, fi, ext = 7) {
	i = r + ri;
	j = f + fi;
	k = 1;
	ray = [];
	while (isInBounds(i, j) && (k <= ext)) {
		ray.push(b[i][j]);
		i += ri;
		j += fi;
		k++;
	}
	return ray;
}

function squareClick (clickEvent) {
	if (b.selectedSquare) {
		b.deselect();
		b.unhighlight();
	} else {
		const clickedSquare = b[clickEvent.currentTarget.rank][clickEvent.currentTarget.file];
		if (clickedSquare.piece) { // only occupied squares can be selected
			b.selectSquare(clickedSquare);
			let candidateMoves = getLegalMoves(clickedSquare);
			b.highlightSquares(candidateMoves);
		}
	}
}

function makeSquare(rankIndex, fileLabel, fileIndex) {
	let s = document.createElement('div');
	s.id = 'square_' + rankIndex + fileIndex;
	s.className = 'square ' + (((fileIndex + rankIndex) % 2 === 1) ? 'dark' : 'light');
	s.rank = rankIndex;
	s.file = fileIndex;
	
	s.addEventListener('click', squareClick);
	
	return {
		_dom: s,
		_model: {
			rank: rankIndex,
			file: fileIndex,
			selected: false,
			highlighted: false,
			checked: false,
			containsPiece: false,
			pieceColor: '',
			pieceType: ''
		},
		get rank() {
			return this._model.rank;
		},
		get file() {
			return this._model.file;
		},
		addPiece(color, type) {
			this._model.pieceColor = color;
			this._model.pieceType = type;
			this._dom.setAttribute('piececolor', color);
			this._dom.setAttribute('piecetype', type);
		},
		removePiece() {
			// since model and DOM are synced, we can use a query on model
			// to avoid a DOM query
			if (this._model.pieceColor) {
				this._model.pieceColor = '';
				this._model.pieceType = '';
				this._dom.removeAttribute('piececolor');
				this._dom.removeAttribute('piecetype');
			}
		},
		get piece() {
			if (this._model.pieceColor) {
				return {color: this._model.pieceColor, type: this._model.pieceType};
			} else {
				return null;
			}
		},
		deselect() {
			if (this._model.selected) {
				this._model.selected = false;
				this._dom.removeAttribute('selected');
			}
		},
		select() {
			if (!(this._model.selected)) {
				this._model.selected = true;
				this._dom.setAttribute('selected', '');
			}
		},
		unhighlight() {
			if (this._model.highlighted) {
				this._model.highlighted = false;
				this._dom.removeAttribute('highlighted');
			}
		},
		highlight() {
			if (!(this._model.highlighted)) {
				this._model.highlighted = true;
				this._dom.setAttribute('highlighted', '');
			}
		},
		toggleSelected() {
			// fill this in in a sec
		}
	};
}

function makeRank(rankIndex) {
	let r = document.createElement('div');
	r.className = 'rank';
	r.id = 'rank_' + rankIndex;
	let rankSquares = fileLabels.map((fileLabel, fileIndex) => {
		return makeSquare(rankIndex, fileLabel, fileIndex);
	});
	rankObject = {
		_dom: r,
		_model: {
			rank: rankIndex
		}
	};
	for (i = 0; i < 8; i++) {
		r.appendChild(rankSquares[i]._dom);
		rankObject[i] = rankSquares[i];
	}
	return rankObject;
}

function makeBoard() {
	let b = document.createElement('div');
	b.className = 'board';
	b.id = 'board';
	boardObject = {
		_dom: b,
		_model: {
			selectedSquare: null,
			highlightedSquares: []
		},
		get selectedSquare() {
			return this._model.selectedSquare;
		},
		set selectedSquare(s) {
			this._model.selectedSquare = s;
		},
		selectSquare(s) {
			s.select();
			this._model.selectedSquare = s;
		},
		deselect() {
			this.selectedSquare.deselect();
			this.selectedSquare = null;
		},
		highlightSquares(squares) {
			squares.forEach(s => {
				this._model.highlightedSquares.push(s);
				s.highlight();
			});
		},
		unhighlight() {
			this._model.highlightedSquares.forEach(s => {
				s.unhighlight();
			});
			this._model.highlightedSquares = [];
		}
	};
	let boardRanks = rankLabels.map((rankLabel, rankIndex) => {
		return makeRank(rankIndex);
	});
	for (i = 0; i < 8; i++) {
		b.appendChild(boardRanks[i]._dom);
		boardObject[i] = boardRanks[i];
	}
	
	return boardObject;
}
// END makeBoard.js

b = makeBoard();

generateKnightMoves();


function deselectAll() {
	b.deselect();
}

function getSquare(rankIndex, fileIndex) {
	return b[rankIndex][fileIndex];
}

function addPieceToRankFile(pieceColor, pieceType, rankIndex, fileIndex) {
	getSquare(rankIndex, fileIndex).addPiece(pieceColor, pieceType);
}

function removePieceFromRankFile(rankIndex, fileIndex) {
	getSquare(rankIndex, fileIndex).removePiece();
}

function clearBoard() {
	for (i = 0; i < 8; i++) {
		for (j = 0; j < 8; j++) {
			b[i][j].removePiece();
		}
	}
}

function resetBoard() {
	clearBoard();
	backRank.forEach((t, i) => {
		addPieceToRankFile('black', t, 0, i);
		addPieceToRankFile('white', t, 7, i);
		addPieceToRankFile('black', 'pawn', 1, i);
		addPieceToRankFile('white', 'pawn', 6, i);
	});
}

const app = document.getElementById('app');

// statuses I need to track:
// what's selected
// what pieces are where
// whether the king is in check
// which pieces are highlighted

app.appendChild(b._dom);

const buttonReset = document.getElementById('button_reset');
buttonReset.addEventListener('click', resetBoard);

const buttonDeselect = document.getElementById('button_deselect');
buttonDeselect.addEventListener('click', deselectAll);


resetBoard();
