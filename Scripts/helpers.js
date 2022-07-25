/**
 * @typedef {Object} EditorCursorPosition
 * @property {Number} line - The line number at the current cursor position.
 * @property {Number} column - The column number at the current cursor position.
 */

/**
 * Get line number and column number for selected range.
 * @param {TextEditor} editor - The editor session to retrieve a cursor position from.
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

/**
 * Go to a specified jump. If the jumpIndex is out of range, then the request will do nothing.
 * @param {number} jumpIndex - The index (position in the list) of the jump to go to.
 * @param {JumpDataProvider} dataProvider - The root data provider for the treeView.
 * @param {TreeView} treeView - The root TreeView instance powering the sidebar; required to reload when jumping so that the cursor follows the jump in use.
 */
function goToJump(jumpIndex, dataProvider, treeView) {
  const jump = dataProvider.getJump(jumpIndex);

  if(jump) {
    dataProvider.setCurrentPosition(jumpIndex);

    nova.workspace.openFile(
      jump.documentURI,
      {
        line: jump.line
      }
    );

    treeView.reload();
  }
}

function getConfigItem(key, coerce) {
  if(nova.workspace.config.get(key)) {
    return nova.workspace.config.get(key, coerce);
  }

  return nova.config.get(key, coerce);
}

const reservedKeywords = new RegExp("(function|class|interface)");

module.exports = {
  calculateLineColumnNumber,
  goToJump,
  reservedKeywords,
  getConfigItem
};
