/**
 * @typedef {Object} HumanReadableJumpData
 * @property {String} fileName - The name of the file + extension related to this jump, without file path.
 * @property {String} filePath - The file's path on disk; for tooltip display.
 * @property {number} lineNumber - The calculated line number based on the range.
 * @property {String} lineContent - The content of the line the jump targets.
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

module.exports = {
	Jump
};
