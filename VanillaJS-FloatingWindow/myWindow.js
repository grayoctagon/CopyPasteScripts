/*
 * Author: Michael Beck
 * Version: 2024-12-15
 * Date: 2024-12-15
 * License: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
 * License URL: https://creativecommons.org/licenses/by-sa/4.0/
 * Repository: https://github.com/grayoctagon/CopyPasteScripts
 * 
 * You are free to:
 * - Share: Copy and redistribute the material in any medium or format.
 * - Adapt: Remix, transform, and build upon the material for any purpose, even commercially.
 * 
 * Under the following terms:
 * - Attribution: You must give appropriate credit, provide a link to the license, and indicate if changes were made.
 * - ShareAlike: If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.
 * 
 * Disclaimer:
 * This work is provided "as is" without any warranties or guarantees of any kind.
 * 
 * Description: 
 * This code is designed to create interactive, movable, and resizable "windows" on a webpage, much like the windows you use on a computer desktop. Each window includes a title bar with controls to minimize, maximize, or close it, along with a space to display custom content. You can drag the windows around the screen by clicking and holding the title bar, and resize them by dragging the bottom-right corner. The minimize button shrinks the window and moves it to the top of the screen, while the maximize button makes it fill the entire screen. The close button removes the window, a condition to not do it may be added.
 * The system is designed to handle multiple windows at the same time, ensuring the one you interact with comes to the front. It saves certain settings, such as whether a window is minimized, so they can be restored the next time the page is loaded. The windows have a modern design with shadows and color styling, making them visually appealing and user-friendly. They can be used for various tasks, like displaying information or interacting with elements on the page, and work together without overlapping issues. This code essentially transforms a webpage into a dynamic, desktop-like environment where users can organize and interact with content efficiently.
 * Some parts were created with AI.
 * 
 */


function createMyWindow(
		//Arguments
		myTtle='My Window',
		closeCallback=()=>{
			console.log(myTtle+" closed");
			return true;
		},
		contentElement=document.createElement('div'),
		myID='myWindow'+(window.myMultiWindows?window.myMultiWindows.length:0),
		startPos=[200,200],
		startSize=[400,300],
		startZIndex=10001,
	){
	let mySettings={
		openMinimized:false,
	};
	let loadSettings=()=>{
		let loadedS=localStorage.getItem("myWindowSettings");
		if(typeof loadedS == 'string'){
			try {
				mySettings=JSON.parse(localStorage.getItem("myWindowSettings"));
//				console.log("did load Settings",mySettings);
			} catch (e) {
				console.error(["did not receive json",e]);
			}
		}else{
			console.log("no Settings");
		}
	};
	let saveSettings=()=>{
		localStorage.setItem("myWindowSettings",JSON.stringify(mySettings));
//		console.log("did save Settings",mySettings);
	};
	loadSettings();
	
		
	// Create the window element
	const windowElement = document.createElement('div');
	windowElement.id = myID;
	windowElement.style.left=startPos[0]+"px";
	windowElement.style.top=startPos[1]+"px";
	windowElement.style.width=startSize[0]+"px";
	windowElement.style.height=startSize[1]+"px";
	windowElement.style.zIndex=startZIndex;
	windowElement.classList.add('myWindowMainClass');

	// Create the title bar
	const titleBar = document.createElement('div');
	titleBar.classList.add('myWindowTitleBar');
	
	const title = document.createElement('div');
	title.classList.add('myWindowTitleEl');
	title.textContent = myTtle;
	titleBar.appendChild(title);

	const controls = document.createElement('div');
	controls.classList.add('myWindowControls');

	const minimizeButton = document.createElement('button');
	minimizeButton.classList.add('minimize');
	minimizeButton.textContent = '_';
	controls.appendChild(minimizeButton);

	const maximizeButton = document.createElement('button');
	maximizeButton.classList.add('maximize');
	maximizeButton.textContent = '□';
	controls.appendChild(maximizeButton);

	const closeButton = document.createElement('button');
	closeButton.classList.add('close');
	closeButton.textContent = '×';
	controls.appendChild(closeButton);

	titleBar.appendChild(controls);
	windowElement.appendChild(titleBar);

	// Create the content area
	const content = contentElement;
	content.classList.add('myWindowContent');
	content.addEventListener('mousedown', (e) => {
		moveToZindexTop();
	});
	windowElement.appendChild(content);

	// Create the resize handle
	const resizeHandle = document.createElement('div');
	resizeHandle.id = 'resize-br';
	resizeHandle.classList.add('myWindowResize-handle');
	windowElement.appendChild(resizeHandle);

	document.body.appendChild(windowElement);

	//helper function
	const moveToZindexTop=()=>{
		let maxZ=0
		window.myMultiWindows.forEach(myWin => {
			maxZ=Math.max(maxZ,parseInt("0"+myWin.style.zIndex));
		});
		windowElement.style.zIndex=maxZ+1;
	}
	// Add styles via JavaScript
	const style = document.createElement('style');
	style.textContent = `

		.myWindowMainClass {
			position: fixed;
			border: 1px solid #000;
			box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
			display: flex;
			flex-direction: column;
			resize: both;
			overflow: hidden;
			/*transition: width 0.3s, height 0.3s, top 0.3s, left 0.3s;*/
		}

		.myWindowMainClass.myWindowMinimized {
			/*width: 100px;
			height: auto;
			top: 0;
			left: 0;
		*/}

		.myWindowTitleBar {
			background: #0078d7;
			color: white;
			padding: 5px;
			cursor: move;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		.myWindowTitleBar .myWindowTitleEl {
			flex-grow: 1;
		}

		.myWindowTitleBar .myWindowControls {
			display: flex;
			gap: 5px;
		}

		.myWindowTitleBar .myWindowControls button {
			background: transparent;
			border: none;
			color: white;
			cursor: pointer;
			font-size: 16px;
			line-height: 1;
			padding: 0 5px;
		}

		.myWindowContent {
			background: blue;
			flex-grow: 1;
			padding: 3px;
		}

		.myWindowResize-handle {
			position: absolute;
			width: 10px;
			height: 10px;
			background: transparent;
			bottom: 0;
			right: 0;
			cursor: se-resize;
		}
	`;
	document.head.appendChild(style);

	// JavaScript for functionality
	let isDragging = false;
	let startX, startY, startWidth, startHeight, startLeft, startTop;

	titleBar.addEventListener('mousedown', (e) => {
		isDragging = true;
		startX = e.clientX;
		startY = e.clientY;
		startLeft = windowElement.offsetLeft;
		startTop = windowElement.offsetTop;
		document.addEventListener('mousemove', myWindowOnMouseMove);
		document.addEventListener('mouseup', myWindowOnMouseUp);
		moveToZindexTop();
	});
	

	const myWindowOnMouseMove = (e) => {
		if (!isDragging) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		
		const newLeft = startLeft + dx;
		const newTop = startTop + dy;

		// Check boundaries
		if (newLeft < 0 || newTop < 0 || newLeft + windowElement.offsetWidth > window.innerWidth || newTop + windowElement.offsetHeight > window.innerHeight) {
			return;
		}

		windowElement.style.left = `${newLeft}px`;
		windowElement.style.top = `${newTop}px`;
		//windowElement.style.left = `${startLeft + dx}px`;
		//windowElement.style.top = `${startTop + dy}px`;
		
		
		
		windowElement.classList.remove('myWindowMaximized');
		windowElement.classList.remove('myWindowMinimized');
	};

	const myWindowOnMouseUp = () => {
		isDragging = false;
		document.removeEventListener('mousemove', myWindowOnMouseMove);
		document.removeEventListener('mouseup', myWindowOnMouseUp);
	};
	let beforeMinification=[100,100,100,100];
	let toggleMinimized=()=>{
		windowElement.classList.toggle('myWindowMinimized');
//		console.log("before",windowElement.classList.contains('myWindowMinimized'),beforeMinification);
		if (windowElement.classList.contains('myWindowMinimized')) {
			//minimieren
			beforeMinification=[windowElement.offsetLeft,windowElement.offsetTop,windowElement.offsetWidth,windowElement.offsetHeight];
			windowElement.style.width = '300px';
			windowElement.style.height = document.getElementsByClassName("myWindowTitleBar")[0].getClientRects()[0].height+'px';
			windowElement.style.left = ((document.getElementsByClassName("myWindowMinimized").length-1)*300)+"px";
			windowElement.style.top = "0px";
		} else {
			//wieder groeser
			windowElement.style.left = beforeMinification[0] + 'px';
			windowElement.style.top = beforeMinification[1] + 'px';
			windowElement.style.width = beforeMinification[2] + 'px';
			windowElement.style.height = beforeMinification[3] + 'px';
//			console.log("after",[windowElement.style.left,windowElement.style.top,windowElement.style.width,windowElement.style.height]);
		}
		mySettings.openMinimized=windowElement.classList.contains('myWindowMinimized');
		saveSettings();
	};
	minimizeButton.addEventListener('click', toggleMinimized);
	if(mySettings.openMinimized){
		toggleMinimized();
	}

	maximizeButton.addEventListener('click', () => {
		if (windowElement.classList.contains('myWindowMaximized')) {
			windowElement.classList.remove('myWindowMaximized');
			windowElement.style.width = startWidth + 'px';
			windowElement.style.height = startHeight + 'px';
			windowElement.style.left = startLeft + 'px';
			windowElement.style.top = startTop + 'px';
		} else {
			startWidth = windowElement.offsetWidth;
			startHeight = windowElement.offsetHeight;
			startLeft = windowElement.offsetLeft;
			startTop = windowElement.offsetTop;
			windowElement.classList.add('myWindowMaximized');
			windowElement.style.width = '100%';
			windowElement.style.height = '100%';
			windowElement.style.left = '0';
			windowElement.style.top = '0';
		}
	});

	closeButton.addEventListener('click', () => {
		if(closeCallback())
			windowElement.remove();
	});

	let isResizing = false;

	resizeHandle.addEventListener('mousedown', (e) => {
		isResizing = true;
		startX = e.clientX;
		startY = e.clientY;
		startWidth = windowElement.offsetWidth;
		startHeight = windowElement.offsetHeight;
		document.addEventListener('mousemove', onResizeMove);
		document.addEventListener('mouseup', onResizeUp);
		windowElement.classList.remove('myWindowMaximized');
		windowElement.classList.remove('myWindowMinimized');
	});

	const onResizeMove = (e) => {
		if (!isResizing) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		windowElement.style.width = `${startWidth + dx}px`;
		windowElement.style.height = `${startHeight + dy}px`;
	};

	const onResizeUp = () => {
		isResizing = false;
		document.removeEventListener('mousemove', onResizeMove);
		document.removeEventListener('mouseup', onResizeUp);
	};
	
	if(!window.myMultiWindows){
		window.myMultiWindows=[];
	}
	window.myMultiWindows.push(windowElement);
	
	return windowElement;
}