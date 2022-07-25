const { Jump } = require('./Jump');
const { calculateLineColumnNumber, getConfigItem } = require('./helpers');

/**
 * The data provider for this extension's tree view. Extensions have been added to manage the jump list as that data is all contained here.
 */
class JumpDataProvider {
  /** An array containing all available jumps. */
  _jumpList;
  /** The current of the jump currently in use. */
  _currentJumpPosition;

  constructor() {
    this._jumpList = [];
    this._currentJumpPosition = 0;
  }

  /**
   * Add a new jump to the list.
   * @param {TextEditor} editor - The editor instance to take the jump from.
   */
  addToJumpList(editor) {
    if(!editor || !(editor instanceof TextEditor)) return;

    const {
      document: {
        uri,
        path
      }
    } = editor;

    if(uri && path) {
      const newJumpPosition = this.getCurrentPosition() + 1;

      if(
        this.getJumpListSize() > newJumpPosition ||
        !!this.getJump(newJumpPosition)
      ) {
        // clear the jump list ahead of this jump before continuing
        this.emptyJumpList(this._currentJumpPosition);
      }
      const { line } = calculateLineColumnNumber(editor);

      const lineRange = editor.document.getLineRangeForRange(editor.selectedRange);

      const filePathArray = path.split('/');

      this._jumpList.push(
        new Jump(
          uri,
          line,
          newJumpPosition,
          {
            fileName: filePathArray.slice(
                filePathArray.length - 2,
                filePathArray.length
              ).join('/'),
            filePath: path,
            lineContent: editor.document.getTextInRange(lineRange).trim()
          }
        )
      );

      this._currentJumpPosition = newJumpPosition;
    }
  }

  /**
   * The length of the jump list.
   * @returns {number}
   */
  getJumpListSize() {
    return this._jumpList.length;
  }

  /**
   * Get TreeItem children. Root element is always null, this TreeView doesn't support nesting.
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
   * @param {Jump} element - The jump to retrieve
   */
  getTreeItem(element) {
    let item = new TreeItem(
      element.humanReadable.fileName,
      TreeItemCollapsibleState.None
    );

    item.descriptiveText = element.line;
    item.tooltip = element.humanReadable[getConfigItem("jumpList.tooltip.content")];
    item.command = "goToJump";
    item.identifier = element.position;
    if(element.position === this._currentJumpPosition) {
      item.image = "__builtin.next";
    }

    return item;
  }

  /**
   * Get the current jump in use.
   * @returns {number}
   */
  getCurrentPosition() {
    return this._currentJumpPosition;
  }

  /**
   * Set the jump currently in use.
   * @param {number} jumpIndex - The index of the jump you wish to set as current.
   */
  setCurrentPosition(jumpIndex) {
    this._currentJumpPosition = jumpIndex;
  }

  /**
   * Get a specific jump from the list.
   * @param {number} jumpIndex - The position of the jump in the list to get.
   */
  getJump(jumpIndex) {
    return this._jumpList.find((jump) => jump.position === jumpIndex);
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

  /**
   * Empty out all or part of the jump list.
   * @param {Number} jumpIndex - The jump index to start from; if provided, any jumps more recent than the identified jump will be removed from the list. If not provided, the list is emptied completely.
   */
  emptyJumpList(jumpIndex) {
    if(jumpIndex) {
      this._jumpList = this._jumpList.slice(0, jumpIndex);

      if(jumpIndex < this._currentJumpPosition) {
        this._currentJumpPosition = jumpIndex;
      }
    } else {
      this._jumpList = [];
      this._currentJumpPosition = -1;
    }
  }
}

module.exports = {
  JumpDataProvider
};
