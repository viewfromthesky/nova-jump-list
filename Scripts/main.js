const { Jump } = require('./Jump');
const { JumpDataProvider } = require('./JumpDataProvider');
const {
  calculateLineColumnNumber,
  goToJump,
  reservedKeywords
} = require('./helpers');

let treeView = null;
/** @type {JumpDataProvider} */
let dataProvider = null;
/** @type {CompositeDisposable} */
let disposables = null;

exports.activate = function() {
  dataProvider = new JumpDataProvider();

  treeView = new TreeView("viewfromthesky.jumplist.jumps", {
    dataProvider
  });

  disposables = new CompositeDisposable();

  disposables.add(nova.config.onDidChange("jumpList.tooltip.content", (_) => {
    treeView.reload();
  }));

  disposables.add(nova.workspace.config.onDidChange("jumpList.tooltip.content", (_) => {
    treeView.reload();
  }));

  disposables.add(nova.workspace.onDidAddTextEditor((editor) => {
    // Don't add new jumps while moving through the list
    if(
      dataProvider.getCurrentPosition() >= dataProvider.getJumpListSize() - 1
    ) {
      dataProvider.addToJumpList(editor);

      treeView.reload();
    }

    // For each new active text editor, add the onDidChangeSelection listener
    disposables.add(nova.workspace.activeTextEditor?.onDidChangeSelection(
      (editor) => {
        const { line: newLine } = calculateLineColumnNumber(editor);
        const newLineRange = editor.document.getLineRangeForRange(editor.selectedRange);
        const newLineContent = editor.document.getTextInRange(newLineRange).trim();

        let objection = false;
        const currentJump = dataProvider.getCurrentJump();

        // If the new line contains with a significant reserved word, accept it anyway
        if(currentJump) {
          const { line: currentLine } = currentJump;

          const lineDifference = (currentLine - newLine) < 0 ?
            newLine - currentLine :
            currentLine - newLine;

          if(lineDifference > 0) {
            if(lineDifference < 30) {
              objection = true;
            }

            if(newLineContent.match(reservedKeywords)) {
              objection = false;
            }
          } else {
            objection = true;
          }
        }

        if(!objection) {
          dataProvider.addToJumpList(editor);

          treeView.reload();
        }
      }
    ));
  }));

  nova.subscriptions.add(treeView);
}

exports.deactivate = function() {
  disposables.dispose();
}

nova.commands.register("goToJump", (_) => {
  /** @type {Array<Jump>} */
  const [jump] = treeView.selection;

  goToJump(jump.position, dataProvider, treeView);
});

nova.commands.register("jumpBackwards", (_) => {
  goToJump(dataProvider.getCurrentPosition() - 1, dataProvider, treeView);
});

nova.commands.register("jumpForwards", (_) => {
  goToJump(dataProvider.getCurrentPosition() + 1, dataProvider, treeView);
});

nova.commands.register("clearJumpList", (_) => {
  dataProvider.emptyJumpList();
  treeView.reload();
});
