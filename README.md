![Jump List](./extension@4x.png "Jump List")
# Jump List for Nova

Other editors have jump lists. Nova didn't. Until now.

This is an attempt at adding rudimentary jump list functionality, the likes of which you might have seen in (neo)vim or BBEdit. It's not perfect as the APIs to build this aren't perfect and there's more information that Nova may be leaving on the table in terms of how and why you jump around different files in a project. But this could very much help with navigation around a project as it stands.

## Usage
Each time a new file is opened, the extension *aims* to add this to the jump list. You can see the jump list in the provided sidebar, with the current jump marked with an arrow. Each time you click around a file, Jump List will try to work out whether or not a useful jump has been made. The rules at the moment are:
* Moving the cursor at least 30 lines away from the last jump counts
* Moving the cursor to a line including the following reserved keywords counts:
    * `function`
    * `interface`
    * `class`

Languages with tailored support:
* JavaScript
* TypeScript
