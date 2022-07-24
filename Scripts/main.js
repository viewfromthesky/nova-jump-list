let treeView = null;
/** @type {JumpDataProvider} */
let dataProvider = null;

/**
 * @typedef {Object} HumanReadableJumpData
 * @property {String} fileName - The name of the file + extension related to this jump, without file path.
 * @property {String} filePath - The file's path on disk; for tooltip display.
 * @property {number} lineNumber - The calculated line number based on the range.
 * @property {String} lineContent - The content of the line the jump targets.
 */

 /**
  * @typedef {Object} EditorCursorPosition
  * @property {Number} line - The line number at the current cursor position.
  * @property {Number} column - The column number at the current cursor position.
  */

class Jump {
	documentURI;
	rangeStart;
	line;
	position;
	humanReadable = {
		fileName: "",
		filePath: "",
		lineContent: "",
		lineNumber: 0
	};

	/**
	 * Construct a Jump.
	 *
	 * @param {string} uri - The URI for the related document so we can find/compare against open editors.
	 * @param {number} rangeStart - The exact cursor position within the document.
	 * @param {number} position - The position of this jump within the list.
	 * @param {HumanReadableJumpData} humanReadable - Some human readable data for display within the jump list.
	 */
	constructor(uri, rangeStart, position, humanReadable) {
		this.documentURI = uri;
		this.rangeStart = rangeStart;
		this.position = position;
		this.line = humanReadable.lineNumber;
		this.humanReadable.fileName = humanReadable.fileName;
		this.humanReadable.filePath = humanReadable.filePath;
		this.humanReadable.lineContent = humanReadable.lineContent;
		this.humanReadable.lineNumber = humanReadable.lineNumber;
	}
}

class JumpDataProvider {
	_jumpList;
	_currentJumpPosition;

	constructor() {
		this._jumpList = [];
		this._currentJumpPosition = 0;
	}

	/**
	 * Add a new jump to the list.
	 *
	 * @param {TextEditor} editor
	 */
	addToJumpList(editor) {
		if(!editor || !(editor instanceof TextEditor)) return;

		const {
			document: {
				uri,
				path
			},
			selectedRange: {
				start: rangeStart
			}
		} = editor;

		if(uri && rangeStart && path) {
			const newJumpPosition = this.getJumpListSize();
			const { line: lineNumber } = calculateLineColumnNumber(editor);

			const lineRange = editor.document.getLineRangeForRange(editor.selectedRange);

			const filePathArray = path.split('/');

			this._jumpList.push(
				new Jump(uri, rangeStart, newJumpPosition, {
					fileName: filePathArray.slice(
							filePathArray.length - 2,
							filePathArray.length
						).join('/'),
					filePath: path,
					lineContent: editor.document.getTextInRange(lineRange).trim(),
					lineNumber
				})
			);

			this._currentJumpPosition = newJumpPosition;
		}
	}

	getJumpListSize() {
		return this._jumpList.length;
	}

	/**
	 * Get TreeItem children. Root element is always null, this TreeView doesn't support nesting.
	 *
	 * @param {Object} element
	 * @returns {Array<Jump>}
	 */
	getChildren(element) {
		if(element === null) {
			return this._jumpList;
		}

		return [];
	}

	/**
	 * Get a jump to add to the TreeView.
	 *
	 * @param {Jump} element - The jump to retrieve
	 */
	getTreeItem(element) {
		let item = new TreeItem(
			element.humanReadable.fileName,
			TreeItemCollapsibleState.None
		);

		item.descriptiveText = element.humanReadable.lineNumber;
		item.tooltip = element.humanReadable.lineContent;
		item.command = "goToJump";
		item.identifier = element.position;

		return item;
	}

	getCurrentPosition() {
		return this._currentJumpPosition;
	}

	setCurrentPosition(index) {
		this._currentJumpPosition = index;
	}

	getJump(index) {
		return this._jumpList.find((jump) => jump.position === index);
	}

	/**
	 * Get the currently selected jump.
	 * @returns {Jump}
	 */
	getCurrentJump() {
		return this._jumpList.find(
			(jump) => jump.position === this._currentJumpPosition
		);
	}
}

/**
 * Get line number and column number for selected range.
 *
 * @param {TextEditor} editor - The relevant text editor.
 * @returns {EditorCursorPosition}
 */
function calculateLineColumnNumber(editor) {
	const { document: { eol }, selectedRange } = editor;
	const editorContentRange = new Range(0, selectedRange.end);
	const editorContent = editor.getTextInRange(editorContentRange);
	const editorLines = editorContent.split(eol);

	return {
		line: editorLines.length,
		column: 0
	};
}

exports.activate = function() {
	dataProvider = new JumpDataProvider();

	treeView = new TreeView("viewfromthesky.jumplist.jumps", {
		dataProvider
	});

	nova.workspace.onDidAddTextEditor((editor) => {
		// Don't add new jumps while moving through the list
		if(dataProvider.getCurrentPosition() >= dataProvider.getJumpListSize() - 1) {
			dataProvider.addToJumpList(editor);

			treeView.reload();
		}

		nova.workspace.activeTextEditor.onDidChangeSelection((editor) => {
			// const { document: { uri: newURI } } = editor;
			const { line: newLine } = calculateLineColumnNumber(editor);
			const { line: currentLine } = dataProvider.getCurrentJump();

			const lineDifference = (currentLine - newLine) < 0 ?
				newLine - currentLine :
				currentLine - newLine;

			if(lineDifference > 29) {
				dataProvider.addToJumpList(editor);

				treeView.reload();
			}
		});
	});

	nova.subscriptions.add(treeView);
}

// exports.deactivate = function() {
//
// }

/**
 * Go to a specified jump. If the jumpIndex is out of range, then the request will do nothing.
 *
 * @param {number} jumpIndex - The index (position in the list) of the jump to go to.
 */
function goToJump(jumpIndex) {
	const jump = dataProvider.getJump(jumpIndex);

	if(jump) {
		dataProvider.setCurrentPosition(jumpIndex);

		nova.workspace.openFile(
			jump.documentURI,
			{
				line: jump.line
			}
		);
	}
}

nova.commands.register("goToJump", (_) => {
	/** @type {Array<Jump>} */
	const [jump] = treeView.selection;

	goToJump(jump.position);
});

nova.commands.register("jumpBackwards", (_) => {
	goToJump(dataProvider.getCurrentPosition() - 1);
});

nova.commands.register("jumpForwards", (_) => {
	goToJump(dataProvider.getCurrentPosition() + 1);
});
