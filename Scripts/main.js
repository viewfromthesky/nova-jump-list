let treeView = null;
/** @type {JumpDataProvider} */
let dataProvider = null;

/**
 * @typedef {Object} HumanReadableJumpData
 * @property {String} fileName - The name of the file + extension related to this jump, without file path.
 * @property {number} lineNumber - The calculated line number based on the range.
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

		const { document: { uri }, selectedRange: { start: rangeStart }} = editor;

		if(uri && rangeStart) {
			const newJumpPosition = this.getJumpListSize();
			const { line: lineNumber } = calculateLineColumnNumber(editor);

			this._jumpList.push(
				new Jump(uri, rangeStart, newJumpPosition, {
					fileName: "test file name.ts",
					lineNumber
				})
			);

			this._currentJumpPosition = newJumpPosition;
		}
	}

	getJumpListSize() {
		return this._jumpList.length;
	}

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
		let item = new TreeItem(element.humanReadable.fileName, TreeItemCollapsibleState.None);

		item.descriptiveText = element.humanReadable.lineNumber;
		item.tooltip = `${element.documentURI}:${element.rangeStart}`;
		item.command = "goToJump";

		return item;
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
		dataProvider.addToJumpList(editor);

		treeView.reload();
	});

	nova.subscriptions.add(treeView);
}

// exports.deactivate = function() {
//
// }

nova.commands.register("goToJump", (_) => {
	/** @type {Array<Jump>} */
	const [jump] = treeView.selection;

	nova.workspace.openFile(
		jump.documentURI,
		{
			line: jump.line
		}
	);
})
