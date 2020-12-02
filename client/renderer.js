const ipc = require("electron").ipcRenderer;

const buttonCreated = document.getElementById("upload");
const talkButton = document.getElementById("talk");

var flag = 0;
var speech;

buttonCreated.addEventListener("click", function (event) {
	ipc.send("open-file-dialog-for-file");
});

talkButton.addEventListener("click", () => {
	speak(speech, { speed: 90, pitch: 30 });
	console.log(speech);
});

ipc.on("text-generated", function (event, desc) {
	description = desc["description"].split(" ");
	let val = "";
	for (let i = 1; i < description.length - 1; i++) {
		val += description[i];
		val += " ";
	}
	speech = val;
	speak(speech, { speed: 90, pitch: 30 });
	console.log(speech);
	document.getElementById("text-desc").innerHTML = `<p id="text-desc" class="card-title">${speech}</p>`
});
ipc.on("selected-file", function (event, path) {

	var image = document.getElementById("output");
	image.src = path;

});
