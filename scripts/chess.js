//import {makeBoard} from './makeBoard.js';
// START makeBoard.js
const rankLabels = [8, 7, 6, 5, 4, 3, 2, 1];
const fileLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

let b;
let knightMoves = [[], [], [], [], [], [], [], []];
const knightIntervals = [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]];

const rookDirs = [[0, 1], [-1, 0], [0, -1], [1, 0]];
const bishopDirs = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const queenDirs = rookDirs.concat(bishopDirs);

const pawnDir = {'black': 1, 'white': -1};

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

function getPin(square, color) {
	if (square.piece.type === 'king') return null; // kings can't be pinned!
	kingDir = [b.kingPosition[color].rank - square.rank,
			   b.kingPosition[color].file - square.file];
	let p = { direction: null, dirType: null };
	if (kingDir[0] === 0) {
		if (kingDir[1] > 0) {
			if (isColorPinnedFromDir(color, square.rank, square.file, 0, -1)) {
				p.direction = [0, -1];
				//p.dirType = 'ortho';
			}
		} else {
			if (isColorPinnedFromDir(color, square.rank, square.file, 0, 1)) {
				p.direction = [0, 1];
				//p.dirType = 'ortho';
			}
		}
	}
	if (kingDir[1] === 0) {
		if (kingDir[0] > 0) {
			if (isColorPinnedFromDir(color, square.rank, square.file, -1, 0)) {
				p.direction = [-1, 0];
				//p.dirType = 'ortho';
			}
		} else {
			if (isColorPinnedFromDir(color, square.rank, square.file, 1, 0)) {
				p.direction = [1, 0];
				//p.dirType = 'ortho';
			}
		}
	}
	if (kingDir[0] === kingDir[1]) {
		if (kingDir[0] > 0) {
			if (isColorPinnedFromDir(color, square.rank, square.file, -1, -1)) {
				p.direction = [-1, -1];
				//p.dirType = 'diag';
			}
		} else {
			if (isColorPinnedFromDir(color, square.rank, square.file, 1, 1)) {
				p.direction = [1, 1];
				//p.dirType = 'diag';
			}
		}
	}
	if (kingDir[0] + kingDir[1] === 0) {
		if (kingDir[0] > 0) {
			if (isColorPinnedFromDir(color, square.rank, square.file, -1, 1)) {
				p.direction = [-1, 1];
				//p.dirType = 'diag';
			}
		} else {
			if (isColorPinnedFromDir(color, square.rank, square.file, 1, -1)) {
				p.direction = [1, -1];
				//p.dirType = 'diag';
			}
		}
	}
	if (p.direction) {
		p.dirType = getDirType(p.direction[0], p.direction[1]);
		return p;
	}
	else return null;
}

function isColorKingFirstInDirFrom(c, r, f, ri, fi) {
	let p = firstUnselectedPieceInDirectionFrom(r, f, ri, fi);
	return (!!p && (p.type === 'king') && (p.color === c));
}

function isColorAttackedFromDir(c, r, f, ri, fi) {
	let p = firstUnselectedPieceInDirectionFrom(r, f, ri, fi);
	return (!!p && (p.color !== c) && canTypeAttackFromDir(p.type, ri, fi));
}

function isColorPinnedFromDir(c, r, f, ri, fi) {
	return (isColorKingFirstInDirFrom(c, r, f, -ri, -fi)
			&& isColorAttackedFromDir(c, r, f, ri, fi));
}

function canTypeAttackFromDir(t, ri, fi) {
	if (t === 'queen') return true;
	let dt = getDirType(ri, fi);
	return pieceHasDirType(t, dt);
}

function getDirType(ri, fi) {
	let p = (ri + fi + 2) % 2;
	if (p === 1) return 'ortho';
	else return 'diag';
}

function pieceHasDirType(pieceType, dirType) {
	if (pieceType === 'queen') return true;
	if (dirType === 'ortho') return (pieceType === 'rook');
	if (dirType === 'diag') return (pieceType === 'bishop');
	console.log('Invalid move type.');
	return false;
}

function getLegalMoves(square) {
	let legalMoves = [];
	let p = square.piece;
	let pin = getPin(square, p.color);
	if (!pin) {
		legalMoves = getUnpinnedLegalMoves(square, p.color, p.type);
	} else {
		if (pieceHasDirType(p.type, pin.dirType)) {
			let pinDirMoves = rayFromIntervalExtent(square.rank, square.file,
													pin.direction[0], pin.direction[1]);
			let kingDirMoves = rayFromIntervalExtent(square.rank, square.file,
													 -pin.direction[0], -pin.direction[1]);
			legalMoves = pinDirMoves.concat(kingDirMoves);
		}
	}
	// no capturing your own color!
	return legalMoves.filter(s => {
		return (!(s.piece) || (s.piece.color !== p.color));
	});
}

function getUnpinnedLegalMoves(square, pieceColor, pieceType) {
	let legalMoves;
	switch (pieceType) {
		case 'rook':
			legalMoves = legalColorRookMovesFrom(pieceColor, square.rank, square.file);
			break;
		case 'knight':
			legalMoves = legalKnightMovesFrom(square.rank, square.file);
			break;
		case 'bishop':
			legalMoves = legalColorBishopMovesFrom(pieceColor, square.rank, square.file);
			break;
		case 'queen':
			legalMoves = legalColorQueenMovesFrom(pieceColor, square.rank, square.file);
			break;
		case 'king':
			legalMoves = legalColorKingMovesFrom(pieceColor, square.rank, square.file);
			break;
		case 'pawn':
			legalMoves = legalColorPawnMovesFrom(pieceColor, square.rank, square.file);
			break;
		default:
			console.log('Invalid piece type for getting moves.');
			break;
	}
	return legalMoves;
}


function legalColorRookMovesFrom(c, r, f) {
	let rightRay = colorRayFromIntervalExtent(c, r, f, 0, 1);
	let upRay = colorRayFromIntervalExtent(c, r, f, -1, 0);
	let leftRay = colorRayFromIntervalExtent(c, r, f, 0, -1);
	let downRay = colorRayFromIntervalExtent(c, r, f, 1, 0);
	
	return rightRay.concat(upRay).concat(leftRay).concat(downRay);
}

function legalKnightMovesFrom(r, f) {
	return knightMoves[r][f];
}

function legalColorBishopMovesFrom(c, r, f) {
	let upRightRay = colorRayFromIntervalExtent(c, r, f, -1, 1);
	let upLeftRay = colorRayFromIntervalExtent(c, r, f, -1, -1);
	let downLeftRay = colorRayFromIntervalExtent(c, r, f, 1, -1);
	let downRightRay = colorRayFromIntervalExtent(c, r, f, 1, 1);
	
	return upRightRay.concat(upLeftRay).concat(downLeftRay).concat(downRightRay);
}

function legalColorQueenMovesFrom(c, r, f) {
	return legalColorRookMovesFrom(c, r, f).concat(legalColorBishopMovesFrom(c, r, f));
}

function legalColorKingMovesFrom(c, r, f) {
	let allMoves = allKingMovesFrom(r, f);
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
	let pushRay;
	let isWhite = (c === 'white');
	let enemyColor = invertColor(c);
	let startRank = isWhite ? 6 : 1;
	let moveDir = pawnDir[c];
	if (r === startRank) {
		pushRay = colorRayFromIntervalExtent(c, r, f, moveDir, 0, 2);
	} else {
		pushRay = colorRayFromIntervalExtent(c, r, f, moveDir, 0, 1);
	}
	if (pushRay[pushRay.length - 1].piece) pushRay.pop(); // no forward pawn caps
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

function colorRayFromIntervalExtent(c, r, f, ri, fi, ext = 7) {
	let ray = rayFromIntervalExtent(r, f, ri, fi, ext);
	let i = ray.findIndex(s => !!(s.piece)); // returns -1 if not found!
	if (i >= 0) {
		ray = ray.slice(0, i + 1);
	}
	return ray;
	// the logic for not capturing your own pieces is elsewhere
}

function firstUnselectedPieceInDirectionFrom(r, f, ri, fi) {
	let squareRay = rayFromIntervalExtent(r, f, ri, fi);
	let piecesOnRay = squareRay.filter(s => {
		return !!(s.piece) && (!s.isSelected);
	});
	if (piecesOnRay.length === 0) {
		return null;
	} else return piecesOnRay[0].piece;
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
		get isSelected() {
			return this._model.selected;
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
			let gbn = this.isGuardedByKnight(color);
			let gbk = this.isGuardedByKing(color);
			let gbr = this.isGuardedByRook(color);
			let gbb = this.isGuardedByBishop(color);
			let gbq = this.isGuardedByQueen(color);
			return gbp || gbn || gbk || gbr || gbb || gbq;
		},
		isGuardedByPawn(c) {
			let pdc = pawnDir[c];
			let vantageCoords = [[this.rank - pdc, this.file - 1],
								 [this.rank - pdc, this.file + 1]];
			vantageCoords = vantageCoords.filter(c => isInBounds(c[0], c[1]));
			let vantages = vantageCoords.map(c => b[c[0]][c[1]]);
			return vantages.reduce((a, s) => {
				return a || b.hasColorTypePieceOn(c, 'pawn', s.rank, s.file);
			}, false);
		},
		isGuardedByKnight(c) {
			let vantages = legalKnightMovesFrom(this.rank, this.file);
			return vantages.reduce((a, s) => {
				return a || b.hasColorTypePieceOn(c, 'knight', s.rank, s.file);
			}, false);
		},
		isGuardedByKing(c) {
			let vantages = allKingMovesFrom(this.rank, this.file);
			return vantages.reduce((a, s) => {
				return a || b.hasColorTypePieceOn(c, 'king', s.rank, s.file);
			}, false);
		},
		isGuardedFromDirByPiece(c, t, ri, fi) {
			let p = firstUnselectedPieceInDirectionFrom(this.rank, this.file, ri, fi);
			return !!p && (p.color === c) && (p.type === t);
		},
		isGuardedFromDirsByPiece(c, t, ds) {
			return ds.reduce((a, d) => {
				return a || this.isGuardedFromDirByPiece(c, t, d[0], d[1]);
			}, false);
		},
		isGuardedByRook(c) {
			return this.isGuardedFromDirsByPiece(c, 'rook', rookDirs);
		},
		isGuardedByBishop(c) {
			return this.isGuardedFromDirsByPiece(c, 'bishop', bishopDirs);
		},
		isGuardedByQueen(c) {
			return this.isGuardedFromDirsByPiece(c, 'queen', queenDirs);
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
			isWhitesTurn: true,
			kingPosition: { 'white': null, 'black': null }
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
			if (p.type === 'king') {
				this._model.kingPosition[p.color] = s;
			}
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
		get kingPosition() {
			return this._model.kingPosition;
		},
		resetBoardVariables() {
			this._model.isWhitesTurn = true;
			this._model.kingPosition['white'] = this[7][4];
			this._model.kingPosition['black'] = this[0][4];
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
