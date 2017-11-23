## DD Bulk Invite Program

1. Step 1, make sure you have node installed.
		* Open your terminal (command + space will open the spotlight search, then type in term)
		    * When you see the command line type node -v. If you see something like 6.11.4 then it is installed.
    * If not... [Download the node package](https://nodejs.org/en/download/). It installs like any other program and the LTS version should be just fine.

2. Clone this repo.
    * There's a green button in the top right of this page that says clone or download.
		* Download is probably the easiest. That will give you a zip file.

3. Unzip the files to some directory. Making a folder in the Documents folder might be a good idea.

4. Open the terminal again and if you installed this in Documents type in `cd ~/Documents/{the directory you created}`

5. Install the NPM packages. NPM was installed with node. It's the package manager for node.
   * Type in `npm install`
	 * You should see a bunch of stuff happen. If not, kick a developer until they fix it.

6. Now you can run the program!
   * Your command line input should look like `node index <inputFile.csv> <sessionid> <csrf token>`
	 * The rest should spit out on the command line.

7. If some things fail, you'll get a file that looks like `<An Annoying Date>-failed.csv` 
   * That is a file you can re-run because it looks like the original csv.
	 * They're time stamped so you can tell what is the most recent.