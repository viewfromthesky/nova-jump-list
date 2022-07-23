let treeView = null;
/** @type {JumpDataProvider} */
let dataProvider = null;

/**
 * @typedef {Object} HumanReadableJumpData
 * @property {String} fileName - The name of the file + extension related to this jump, without file path.
 * @property {number} lineNumber - The calculated line number based on the range.
 */

class Jump {
	_documentURI;
	_rangeStart;
	_position;
	_humanReadable = {
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
		this._documentURI = uri;
		this._rangeStart = rangeStart;
		this._position = position;
		this._humanReadable.fileName = humanReadable.fileName;
		this._humanReadable.lineNumber = humanReadable.lineNumber;
	}

	getHumanReadableData() {
		return this._humanReadable;
	}

	getDocumentURI() {
		return this._documentURI;
	}

	getRangeStart() {
		return this._rangeStart;
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
	 * @param {string} uri - The URI of the document that was jumped to.
	 * @param {number} rangeStart - The exact numeric position of the cursor within the document.
	 */
	addToJumpList(uri, rangeStart) {
		const newJumpPosition = this.getJumpListSize();

		this._jumpList.push(
			new Jump(uri, rangeStart, newJumpPosition, {
				fileName: "test file name.ts",
				lineNumber: 5
			})
		);

		this._currentJumpPosition = newJumpPosition;
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
	 * summary
	 *
	 * @param {Jump} element - The jump to retrieve
	 */
	getTreeItem(element) {
		let item = new TreeItem(element.getHumanReadableData().fileName, TreeItemCollapsibleState.None);

		item.descriptiveText = element.getHumanReadableData().lineNumber;
		item.tooltip = `${element.getDocumentURI()}:${element.getRangeStart()}`;

		return item;
	}
}

exports.activate = function() {
	dataProvider = new JumpDataProvider();

	treeView = new TreeView("viewfromthesky.jumplist.jumps", {
		dataProvider
	});

	dataProvider.addToJumpList(
		nova.workspace.activeTextEditor.document.uri,
		nova.workspace.activeTextEditor.selectedRange.start
	);

	nova.workspace.onDidAddTextEditor((editor) => {
		dataProvider.addToJumpList(
			editor.document.uri,
			editor.selectedRange.start
		);

		treeView.reload();
	});

	nova.subscriptions.add(treeView);
}

// exports.deactivate = function() {
//
// }
