/**
 * Author: Peter Dragicevic [peter-91@hotmail.de]
 * Authors-Website: http://petschko.org/
 * Date: 30.03.2017
 * Time: 23:05
 */

/**
 * Try to Reads the Encryption-Code and insert it to the given input element
 *
 * @param {string} systemFileElId - File-Picker-Id for the System.json-File
 * @param {string} codeTextElId - Text-Input-Id for the Encryption-Key
 */
function getCode(systemFileElId, codeTextElId) {
	var systemFileEl = document.getElementById(systemFileElId);
	var codeTextEl = document.getElementById(codeTextElId);

	if(systemFileEl.files.length < 1) {
		alert('Please choose the System.json-File!');
		return;
	}

	Decrypter.detectEncryptionCode(new RPGFile(systemFileEl.files[0], null), function(key) {
		if(key === null) {
			alert('Error: File-Content was invalid (Was not a JSON-File)');
			return;
		}

		if(typeof key === 'string' && key.length > 0) {
			codeTextEl.value = key;
			codeTextEl.className = removeValidationCssClasses(codeTextEl.className);
			codeTextEl.className = addCssClass(codeTextEl.className, 'valid');
			alert('Key found^^! (' + key + ')');
		} else
			alert('Error: Encryption-Key not found - Make sure that you select the correct file!');
	});
}

/**
 * Removes a CSS-Class
 *
 * @param {string} elementClasses - Element CSS-Classes
 * @param {string} removeClass - Class to remove
 * @returns {string} - New CSS-Classes
 */
function removeCssClass(elementClasses, removeClass) {
	var newClassNames = '';
	var classes = elementClasses.split(' ');

	// Check if element is in array else exit
	if(classes.indexOf(removeClass) === -1)
		return elementClasses;

	for(var i = 0; i < classes.length; i++) {
		if(classes[i] !== removeClass)
			newClassNames += classes[i] + ' ';
	}

	return newClassNames.trim();
}

/**
 * Adds a CSS-Class, it never adds an existing class twice
 *
 * @param {string} elementClasses - Element CSS-Classes
 * @param {string} addClass - Class to add
 * @returns {string} - New CSS-Classes
 */
function addCssClass(elementClasses, addClass) {
	var classes = elementClasses.split(' ');

	if(classes.indexOf(addClass) !== -1)
		return elementClasses;

	return (elementClasses + ' ' + addClass).trim();
}

/**
 * Get the Value of a Radio-Button-Group
 *
 * @param {string} radioButtonGroupName - Radio-Button-Group-Name
 * @param {string} fallback - Fallback-Value
 * @returns {string} - Current Value or Fallback-Value if group doesn't exists or nothing is selected
 */
function getRadioButtonValue(radioButtonGroupName, fallback) {
	var radioButtons = document.getElementsByName(radioButtonGroupName);
	var currentValue = fallback;

	for(var i = 0; i < radioButtons.length; i++) {
		if(radioButtons[i].checked) {
			currentValue = radioButtons[i].value;
			break;
		}
	}

	return currentValue;
}

/**
 * Removes all Validation-Classes
 *
 * @param {string} currentClasses - Current Element CSS-Classes
 * @returns {string} - CSS-Classes without validation ones
 */
function removeValidationCssClasses(currentClasses) {
	currentClasses = removeCssClass(currentClasses, 'invalid');
	currentClasses = removeCssClass(currentClasses, 'manualChange');
	currentClasses = removeCssClass(currentClasses, 'valid');

	return currentClasses;
}

/**
 * Changes the validation class to manualChange
 *
 * @param {string} elementId - Element-Id to where to change
 */
function manualChange(elementId) {
	var element = document.getElementById(elementId);

	element.className = removeValidationCssClasses(element.className);
	element.className = addCssClass(element.className, 'manualChange');
}

/**
 * Adds all Action-Listener
 */
function init() {
	var addMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
	// Get Elements
	var detectButton = document.getElementById('detectButton');
	var inputCode = document.getElementById('decryptCode');
	var decryptButton = document.getElementById('decrypt');

	// Add Listener
	detectButton[addMethod](window.addEventListener ? 'click' : 'onclick', function() {
		getCode('systemFile', 'decryptCode');
	}, false);
	decryptButton[addMethod](window.addEventListener ? 'click' : 'onclick', function() {
		decryptFiles(
			'encryptedImg',
			'decryptCode',
			'blob',
			!! parseInt(getRadioButtonValue('checkFakeHeader', '0')),
			'headerLen',
			'signature',
			'version',
			'remain'
		);
	}, false);
	inputCode[addMethod](window.addEventListener ? 'change' : 'onchange', function() {
		manualChange('decryptCode');
	}, false);
}

document.body[window.addEventListener ? 'addEventListener' : 'attachEvent'](
	window.addEventListener ? 'load' : 'onload', init(), false);

/**
 * Decrypt a bunch of MV-Encrypted-Files
 *
 * @param {string} fileUrlElId - Element-Id of the File(s)-Picker
 * @param {string} decryptCodeElId - Element-Id of the Decryption-Code Input Field
 * @param {string} outputElId - Output-Element-Id
 * @param {boolean} verifyHeader - Verify Header
 * @param {string} headerLenElId - Element-Id of the Header-Length
 * @param {string} signatureElId - Element-Id of the Signature
 * @param {string} versionElId - Element-Id of the Version
 * @param {string} remainElId - Element-Id of the Remain
 */
function decryptFiles(
	fileUrlElId,
	decryptCodeElId,
	outputElId,
	verifyHeader,
	headerLenElId,
	signatureElId,
	versionElId,
	remainElId
) {
	var outputEl = document.getElementById(outputElId);
	var fileUrlEl = document.getElementById(fileUrlElId);
	var encryptCodeEl = document.getElementById(decryptCodeElId);
	var encryptionCode = encryptCodeEl.value;
	var headerLen = null;
	var signature = null;
	var version = null;
	var remain = null;

	if(verifyHeader) {
		var headerLenEl = document.getElementById(headerLenElId);
		var signatureEl = document.getElementById(signatureElId);
		var versionEl = document.getElementById(versionElId);
		var remainEl = document.getElementById(remainElId);

		if(headerLenEl)
			headerLen = headerLenEl.value;
		if(signatureEl)
			signature = signatureEl.value;
		if(versionEl)
			version = versionEl.value;
		if(remainEl)
			remain = remainEl.value;
	}

	// Check if all required stuff is given
	if(! encryptionCode) {
		alert('Specify the En/Decryption-Code!');
		encryptCodeEl.className = removeValidationCssClasses(encryptCodeEl.className);
		encryptCodeEl.className = addCssClass(encryptCodeEl.className, 'invalid');

		return;
	}

	// Check if code just contain HEX-Chars
	if(! Decrypter.checkHexChars(encryptionCode)) {
		alert('En/Decryption-Code can just contain HEX-Chars (0-9 & A-F or a-f)!');
		encryptCodeEl.className = removeValidationCssClasses(encryptCodeEl.className);
		encryptCodeEl.className = addCssClass(encryptCodeEl.className, 'invalid');

		return;
	}

	// Set valid encryption class
	encryptCodeEl.className = removeValidationCssClasses(encryptCodeEl.className);
	encryptCodeEl.className = addCssClass(encryptCodeEl.className, 'valid');

	// Check if at least 1 File is given
	if(fileUrlEl.files.length < 1) {
		alert('Specify at least 1 File to decrypt...');

		return;
	}

	var decrypter = new Decrypter(encryptionCode);
	decrypter.ignoreFakeHeader = ! verifyHeader;
	if(verifyHeader) {
		// Handle Header details
		headerLenEl.className = removeValidationCssClasses(headerLenEl.className);
		if(! isNaN(headerLen) && Math.floor(headerLen) > 0)
			decrypter.headerLen = Math.floor(headerLen);
		else if(headerLen) {
			headerLenEl.className = addCssClass(headerLenEl.className, 'invalid');
			alert('Info: Header-Length must be a positive round Number! (Using default now: ' +
				decrypter.defaultHeaderLen + ')');
		}

		signatureEl.className = removeValidationCssClasses(signatureEl.className);
		if(Decrypter.checkHexChars(signature))
			decrypter.signature = signature;
		else if(signature) {
			signatureEl.className = addCssClass(signatureEl.className, 'invalid');
			alert('Info: Header-Signature can just contain HEX-Chars (0-9 & A-F or a-f)! (Using default now: ' +
				decrypter.defaultSignature + ')');
		}

		versionEl.className = removeValidationCssClasses(versionEl.className);
		if(Decrypter.checkHexChars(version))
			decrypter.version = version;
		else if(version) {
			versionEl.className = addCssClass(versionEl.className, 'invalid');
			alert('Info: Header-Version can just contain HEX-Chars (0-9 & A-F or a-f)! (Using default now: ' +
				decrypter.defaultVersion + ')');
		}

		remainEl.className = removeValidationCssClasses(remainEl.className);
		if(Decrypter.checkHexChars(remain))
			decrypter.remain = remain;
		else if(remain) {
			remainEl.className = addCssClass(remainEl.className, 'invalid');
			alert('Info: Header-Remain can just contain HEX-Chars (0-9 & A-F or a-f)! (Using default now: ' +
				decrypter.defaultRemain + ')');
		}
	}

	for(var i = 0; i < fileUrlEl.files.length; i++) {
		var rpgFile = new RPGFile(fileUrlEl.files[i], null);

		decrypter.decryptFile(rpgFile, function(rpgFile, exception) {
			// Output Decrypted files
			if(exception !== null)
				outputEl.appendChild(rpgFile.createOutPut(exception.toString()));
			else {
				rpgFile.convertExtension(true);
				outputEl.appendChild(rpgFile.createOutPut(null));
			}
		});
	}
}