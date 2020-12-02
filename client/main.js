const { app, BrowserWindow, dialog, Menu, MenuItem } = require("electron");
const path = require("path");
const os = require("os");
const ipc = require("electron").ipcMain;
const axios = require("axios");

const template = [
	{
		label: "Image-Desciption-features",
		click: function () {
			showFeatures();
		},
	},
	{
		label: "Edit",
		submenu: [
			{
				role: "undo",
			},
			{
				role: "redo",
			},
			{
				type: "separator",
			},
			{
				role: "cut",
			},
			{
				role: "copy",
			},
			{
				role: "paste",
			},
		],
	},

	{
		label: "View",
		submenu: [
			{
				role: "reload",
			},
			{
				role: "toggledevtools",
			},
			{
				type: "separator",
			},
			{
				role: "resetzoom",
			},
			{
				role: "zoomin",
			},
			{
				role: "zoomout",
			},
			{
				type: "separator",
			},
			{
				role: "togglefullscreen",
			},
		],
	},

	{
		role: "window",
		submenu: [
			{
				role: "minimize",
			},
			{
				role: "close",
			},
		],
	},
];

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1600,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: true,
		},
	});

	mainWindow.loadFile("index.html");

	mainWindow.webContents.openDevTools();
}

function showFeatures() {
	const homeWindow = new BrowserWindow({
		width: 800,
		height: 600,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: true,
		},
	});

	homeWindow.loadFile("home.html");

	homeWindow.show();
}
app.whenReady().then(() => {
	createWindow();
	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);

	app.on("activate", function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});

	ipc.on("open-file-dialog-for-file", function (event) {
		if (os.platform() === "linux" || os.platform() === "win32") {
			dialog
				.showOpenDialog({
					title: "Select the File to be uploaded",
					buttonLabel: "Upload",
					filters: [
						{
							name: "Image Files",
							extensions: ["png", "jpg"],
						},
					],
					properties: ["openFile"],
				})
				.then(async (file) => {
					if (!file.canceled) {
						global.filepath = file.filePaths[0].toString();
						let val;
						console.log(global.filepath);
						await axios.post("http://localhost:5000/api", { image: global.filepath.toString() }).then((result) => {
							// console.log(result.data);
							event.sender.send("text-generated", result.data);
						});
						event.sender.send("selected-file", global.filepath);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		} else {
			dialog
				.showOpenDialog({
					title: "Select the File to be uploaded",
					buttonLabel: "Upload",
					filters: [
						{
							name: "Text Files",
							extensions: ["jpg", "png"],
						},
					],
					properties: ["openFile", "openDirectory"],
				})
				.then(async (file) => {
					if (!file.canceled) {
						global.filepath = file.filePaths[0].toString();
						let val;
						console.log(global.filepath);
						await axios.post("http://localhost:5000/api", { image: global.filepath.toString() }).then((result) => {
							// console.log(result.data);
							event.sender.send("text-generated", result.data);
						});
						event.sender.send("selected-file", global.filepath);
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	});
});

app.on("window-all-closed", function () {
	if (process.platform !== "darwin") app.quit();
});
