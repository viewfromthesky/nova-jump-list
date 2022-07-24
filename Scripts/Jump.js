/**
 * @typedef {Object} HumanReadableJumpData
 * @property {String} fileName - The name of the file + extension related to this jump, without file path.
 * @property {String} filePath - The file's path on disk; for tooltip display.
 * @property {String} lineContent - The content of the line the jump targets.
 */

class Jump {
  documentURI;
  line;
  position;
  humanReadable = {
    fileName: "",
    filePath: "",
    lineContent: ""
  };

  /**
   * Construct a Jump.
   * @param {string} uri - The URI for the related document so we can find/compare against open editors.
   * @param {number} line - The line number where the jump occurred.
   * @param {number} position - The position of this jump within the list.
   * @param {HumanReadableJumpData} humanReadable - Some human readable data for display within the jump list.
   */
  constructor(uri, line, position, humanReadable) {
    this.documentURI = uri;
    this.position = position;
    this.line = line;
    this.humanReadable.fileName = humanReadable.fileName;
    this.humanReadable.filePath = humanReadable.filePath;
    this.humanReadable.lineContent = humanReadable.lineContent;
  }
}

module.exports = {
  Jump
};
