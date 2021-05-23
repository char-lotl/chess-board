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

function invertColor(c) {
	if (c === 'white') return 'black';
	else return 'white';
}

function getLegalMoves(square) {
	let legalMoves = [];
	let p = square.piece;
	if (p) switch (p.type) {
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
			legalMoves = legalColorKingMovesFrom(p.color, square.rank, square.file);
			break;
		case 'pawn':
			legalMoves = legalColorPawnMovesFrom(p.color, square.rank, square.file);
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

function legalColorKingMovesFrom(c, r, f) {
	let allMoves = allKingMovesFrom(r, f);
	console.log(allMoves.length);
	let legalMoves = allMoves.filter(s => {
		return !s.isGuardedBy(invertColor(c));
	});
	return legalMoves;
}

function allKingMovesFrom(r, f) {
	let rightStep = rayFromIntervalExtent(r, f, 0, 1, 1);
	let upRightStep = rayFromIntervalExtent(r, f, -1, 1, 1);
	let upStep = rayFromIntervalExtent(r, f, -1, 0, 1);
	let upLeftStep = rayFromIntervalExtent(r, f, -1, -1, 1);
	let leftStep = rayFromIntervalExtent(r, f, 0, -1, 1);
	let downLeftStep = rayFromIntervalExtent(r, f, 1, -1, 1);
	let downStep = rayFromIntervalExtent(r, f, 1, 0, 1);
	let downRightStep = rayFromIntervalExtent(r, f, 1, 1, 1);
	
	let allMoves = rightStep.concat(upRightStep).concat(upStep)
	.concat(upLeftStep).concat(leftStep).concat(downLeftStep)
	.concat(downStep).concat(downRightStep);
	
	return allMoves;
}

function legalColorPawnMovesFrom(c, r, f) {
	let pawnMoves = [];
	let upRay;
	let isWhite = (c === 'white');
	let enemyColor = invertColor(c);
	let startRank = isWhite ? 6 : 1;
	let moveDir = isWhite ? -1 : 1;
	if (r === startRank) {
		pushRay = rayFromIntervalExtent(r, f, moveDir, 0, 2);
	} else {
		pushRay = rayFromIntervalExtent(r, f, moveDir, 0, 1);
	}
	if (b.hasColorPieceOn(enemyColor, r + moveDir, f - 1)) {
		pawnMoves.push(b[r + moveDir][f - 1]);
	}
	if (b.hasColorPieceOn(enemyColor, r + moveDir, f + 1)) {
		pawnMoves.push(b[r + moveDir][f + 1]);
	}
	return pawnMoves.concat(pushRay);
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
	const clickedSquare = b[clickEvent.currentTarget.rank][clickEvent.currentTarget.file];
	if (b.selectedSquare) {
		if (clickedSquare.isHighlighted) {
			b.moveSelectedToSquare(clickedSquare);
			b.switchTurn();
		}
		b.deselect();
	} else {
		if (clickedSquare.piece && (clickedSquare.piece.color == b.whoseTurn)) {
			// only occupied squares of the current turn's color can be selected
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
			b.unhighlight();
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
		get isHighlighted() {
			return this._model.highlighted;
		},
		isGuardedBy(color) {
			let gbp = this.isGuardedByPawn(color);
			//let gbn = this.isGuardedByKnight(color);
			//let gbk = this.isGuardedByKing(color);
			//let gf0 = this.isGuardedFromRight(color);
			//let gf45 = this.isGuardedFromUpRight(color);
			//let gf90 = this.isGuardedFromUp(color);
			//let gf135 = this.isGuardedFromUpLeft(color);
			//let gf180 = this.isGuardedFromLeft(color);
			//let gf225 = this.isGuardedFromDownLeft(color);
			//let gf270 = this.isGuardedFromDown(color);
			//let gf315 = this.isGuardedFromDownRight(color);
			return gbp; // placeholder functionality
		},
		isGuardedByPawn(c) {
			let vantages = legalColorPawnMovesFrom(invertColor(c), this.rank, this.file);
			let foundGuard = false;
			vantages.forEach(s => {
				foundGuard = foundGuard || b.hasColorTypePieceOn(c, 'pawn', s.rank, s.file);
			});
			return foundGuard;
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
			highlightedSquares: [],
			isWhitesTurn: true
		},
		hasColorPieceOn(c, r, f) {
			return (isInBounds(r, f) && this[r][f].piece && (this[r][f].piece.color === c));
		},
		hasColorTypePieceOn(c, t, r, f) {
			return (isInBounds(r, f) && this[r][f].piece
					&& (this[r][f].piece.color === c)
					&& (this[r][f].piece.type === t));
		},
		removePieceFromRankFile(r, f) {
			this[r][f].removePiece();
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
		moveSelectedToSquare(s) {
			let p = this.selectedSquare.piece;
			this.selectedSquare.removePiece();
			s.addPiece(p.color, p.type);
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
		},
		switchTurn() {
			this._model.isWhitesTurn = !(this._model.isWhitesTurn);
		},
		get whoseTurn() {
			return this._model.isWhitesTurn ? 'white' : 'black';
		},
		resetBoardVariables() {
			this._model.isWhitesTurn = true;
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

function getSquare(rankIndex, fileIndex) {
	return b[rankIndex][fileIndex];
}

function addPieceToRankFile(pieceColor, pieceType, rankIndex, fileIndex) {
	getSquare(rankIndex, fileIndex).addPiece(pieceColor, pieceType);
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
	b.resetBoardVariables();
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

resetBoard();
