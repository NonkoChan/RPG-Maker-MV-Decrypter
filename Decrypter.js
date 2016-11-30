/**
 * Try to Reads the Encryption-Code and insert it to the given input element
 *
 * @param {Element} systemFileEl - File-Picker for the System.json-File
 * @param {Element} codeTextEl - Text-Input for the Encryption-Key
 */
function getCode(systemFileEl, codeTextEl) {
	var reader = new FileReader();

	if(systemFileEl.files.length < 1) {
		alert('Please choose the System.json-File!');

		return;
	}

	reader.addEventListener("load", function() {
		var fileContent = JSON.parse('[' + this.result + ']');
		var encryptionKey = fileContent[0].encryptionKey;

		if(typeof encryptionKey === 'string') {
			codeTextEl.value = encryptionKey;
			codeTextEl.style.backgroundColor = '#B8FFAB';
			alert('Key found^^! (' + encryptionKey + ')');
		} else
			alert('Encryption-Key not found - Make sure that you select the correct file!');
	}, false);

	reader.readAsText(systemFileEl.files[0]);
}

/**
 *
 * @param fileUrlEl
 * @param decryptCodeEl
 */
function decryptFile(fileUrlEl, decryptCodeEl) {
	var decryptCode = decryptCodeEl.value;
	var i = 0;

	// Set Code
	if(! decryptCode)
		return;
	Decrypter.plainDecryptionCode = decryptCode;

	// Process every File
	for(; i < fileUrlEl.files.length; i++) {
		var reader = new FileReader();
		console.log('Try to decrypt the File "' + fileUrlEl.files[i].name + '" with Decryption-Code "' + decryptCode + '"...');

		reader.addEventListener("load", function() {
			var fileUrl = Decrypter.createBlobUrl(this.result);
			console.log('File read and loaded into "' + fileUrl + '".');

			// Decrypt Image
			Decrypter.decrypt(fileUrl);
			console.log('File decrypted with the given Key - Wrong keys will not give the expected output!');
		}, false);

		// Read File
		console.log('Try to read the File...');
		reader.readAsArrayBuffer(fileUrlEl.files[i]);
	}
}

function Decrypter() {
	throw new Error('This is a static class');
}

Decrypter.plainDecryptionCode = "";
Decrypter._headerlength = 16;
Decrypter._xhrOk = 400;
Decrypter._encryptionKey = "";
Decrypter.SIGNATURE = "5250474d56000000";
Decrypter.VER = "000301";
Decrypter.REMAIN = "0000000000";

Decrypter.decrypt = function(url) {
	var requestFile = new XMLHttpRequest();
	requestFile.open("GET", url);
	requestFile.responseType = "arraybuffer";
	requestFile.send();

	requestFile.onload = function () {
		if(this.status < Decrypter._xhrOk) {
			var arrayBuffer = Decrypter.decryptArrayBuffer(requestFile.response);
			var blobURL = Decrypter.createBlobUrl(arrayBuffer);

			document.getElementById('blob').innerHTML += '<a href="' + blobURL + '" target="_blank">' + blobURL + '</a><br>';
		}
	};
};

Decrypter.cutArrayHeader = function(arrayBuffer, length) {
	return arrayBuffer.slice(length);
};

Decrypter.decryptArrayBuffer = function(arrayBuffer) {
	if (!arrayBuffer) return null;
	var header = new Uint8Array(arrayBuffer, 0, this._headerlength);

	var i;
	var ref = this.SIGNATURE + this.VER + this.REMAIN;
	var refBytes = new Uint8Array(16);
	for (i = 0; i < this._headerlength; i++) {
		refBytes[i] = parseInt("0x" + ref.substr(i * 2, 2), 16);
	}
	for (i = 0; i < this._headerlength; i++) {
		if (header[i] !== refBytes[i]) {
			throw new Error("Header is wrong");
		}
	}

	arrayBuffer = this.cutArrayHeader(arrayBuffer, Decrypter._headerlength);
	var view = new DataView(arrayBuffer);
	this.readEncryptionkey();
	if (arrayBuffer) {
		var byteArray = new Uint8Array(arrayBuffer);
		for (i = 0; i < this._headerlength; i++) {
			byteArray[i] = byteArray[i] ^ parseInt(Decrypter._encryptionKey[i], 16);
			view.setUint8(i, byteArray[i]);
		}
	}

	return arrayBuffer;
};

Decrypter.createBlobUrl = function(arrayBuffer){
	var blob = new Blob([arrayBuffer]);
	return window.URL.createObjectURL(blob);
};

Decrypter.readEncryptionkey = function(){
	this._encryptionKey = this.plainDecryptionCode.split(/(.{2})/).filter(Boolean);
};