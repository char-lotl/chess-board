//import {makeBoard} from './makeBoard.js';
// START makeBoard.js
const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

function makeSquare(rankIndex, fileLabel, fileIndex) {
	let s = document.createElement('div');
	s.id = 'square_' + rankIndex + fileIndex;
	s.className = 'square ' + (((fileIndex + rankIndex) % 2 === 1) ? 'dark' : 'light');
	s.rank = rankIndex;
	s.file = fileIndex;
	
	//s.addEventListener('click', toggleSelected);
	
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
		toggleSelected() {
			// fill this in in a sec
		}
	};
}

function makeRank(rankIndex) {
	let r = document.createElement('div');
	r.className = 'rank';
	r.id = 'rank_' + rankIndex;
	let rankSquares = files.map((fileLabel, fileIndex) => {
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
		deselectAll() {
			this.selectedSquare.deselect();
			this.selectedSquare = null;
		}
	};
	b.model = boardObject;
	let boardRanks = ranks.map((rankLabel, rankIndex) => {
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

function toggleSelected (clickEvent) {
	if (b.selectedSquare) {
		b.deselectAll();
	} else {
		const clickedSquare = b[clickEvent.currentTarget.rank][clickEvent.currentTarget.file];
		b.selectSquare(clickedSquare);
	}
}

function addButtons(b) {
	for (i = 0; i < 8; i++) {
		for (j = 0; j < 8; j++) {
			b[i][j]._dom.addEventListener('click', toggleSelected)
		}
	}
}

addButtons(b);

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
buttonDeselect.addEventListener('click', b.deselectAll);


resetBoard();
