const { Jump } = require('./Jump');
const { JumpDataProvider } = require('./JumpDataProvider');
const { calculateLineColumnNumber, goToJump } = require('./helpers');

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

	disposables.add(nova.workspace.onDidAddTextEditor((editor) => {
		// Don't add new jumps while moving through the list
		if(dataProvider.getCurrentPosition() >= dataProvider.getJumpListSize() - 1) {
			dataProvider.addToJumpList(editor);

			treeView.reload();
		}

		// For each new active text editor, add the onDidChangeSelection listener
		disposables.add(nova.workspace.activeTextEditor?.onDidChangeSelection((editor) => {
			const { line: newLine } = calculateLineColumnNumber(editor);

			let objection = false;

			if(dataProvider.getCurrentJump()) {
				const { line: currentLine }  = dataProvider.getCurrentJump();

				const lineDifference = (currentLine - newLine) < 0 ?
					newLine - currentLine :
					currentLine - newLine;

				if(lineDifference < 30) {
					objection = true;
				}
			}

			if(!objection) {
				dataProvider.addToJumpList(editor);

				treeView.reload();
			}
		}));
	}));

	nova.subscriptions.add(treeView);
}

exports.deactivate = function() {
	disposables?.clear();
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
