/*
game.js for Perlenspiel 3.3.x
Last revision: 4-1-2021 (LD)

Lena Dias, Team Double Jump


The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these lines.
*/

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT delete this directive!


let MOUSE_DRAG = false;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 20;
const COLOR_GRID = 0xAEFBF8;
const COLOR_POND = PS.COLOR_WHITE;
const COLOR_WALL = 0xA8FEAB;
const SPEED = 6; // 10 fps
const SOUND_START = "fx_pop";
const SOUND_STOP = "fx_drip2";

const ripples = [];

const placeRipple = function(x,y)
{
	//for placing ripples
	let tempx;
	let tempy;

	//random distinct hue from perlenspiel
	let fadeColor = Math.floor(Math.random()*16777216) +1;

	for(tempx = -1; tempx<2; tempx++)
	{
		for(tempy = -1; tempy<2; tempy++)
		{
			if( !(tempx===0 && tempy===0 ) && (x+tempx > 0 ) && (y+tempy > 0) &&(x+tempx < GRID_WIDTH-1 ) && (y+tempy < GRID_HEIGHT -1)  )
			{
				//paint a ripple
				PS.color( x+tempx, y+tempy, fadeColor );
				PS.data( x+tempx, y+tempy, [tempx,tempy] );
				PS.audioPlay( SOUND_START ,{volume: 0.05});
				PS.fade(x+tempx, y+tempy,SPEED+10)
				PS.color(x+tempx, y+tempy, fadeColor);
				ripples.push([(x+tempx),(y+tempy), fadeColor]);

			}
			//otherwise, we are in the edges or center
			else
			{

			}

		}


	}
}

const animate = function () {

	//for each ripple..
	let len = ripples.length;
	let i = 0;
	while (i < len) {
		let ripple = ripples[i];
		//current location of pixel
		let x = ripple[0];
		let y = ripple[1];
		let fadeColor = ripple[2];
		//direction of pixel
		let dirx = PS.data(x, y)[0];
		let diry = PS.data(x, y)[1];

		//third pixel (add both x and y)
		if ((x + dirx > 0) && (y + diry > 0) && (x + dirx < GRID_WIDTH - 1) && (y + diry < GRID_HEIGHT - 1)) {
			//place a ripple
			PS.color(x + dirx, y + diry, fadeColor);
			PS.data(x + dirx, y + diry, [dirx, diry]);
			PS.fade(x+dirx, y+diry,SPEED+10)
			PS.color(x+dirx, y+diry, fadeColor);
			ripples.push([(x + dirx), (y + diry), fadeColor]);
		}
		//otherwise, we are in the edges or center
		else {
			PS.audioPlay(SOUND_STOP, {volume : 0.04});
		}

		//remove from list of ripples onscreen
		ripples.splice(i,1);
		PS.color(x,y, COLOR_POND);

		len--;
	}
};

PS.init = function( system, options ) {

	//had to remove space to get it to accept (said it had illegal characters)
	const TEAM = "doublejump";

	//grid
	PS.gridSize( GRID_WIDTH, GRID_HEIGHT );
	PS.gridColor( COLOR_GRID );

	//walls and pond
	PS.color( PS.ALL, PS.ALL, COLOR_POND );
	PS.color(0, PS.ALL, COLOR_WALL);
	PS.color(GRID_WIDTH-1,PS.ALL, COLOR_WALL);
	PS.color(PS.ALL, 0, COLOR_WALL);
	PS.color(PS.ALL, GRID_HEIGHT-1, COLOR_WALL);

	//borders
	PS.border( PS.ALL, PS.ALL, 0 );
	PS.border(0, PS.ALL, 1);
	PS.border(GRID_WIDTH-1,PS.ALL, 1);
	PS.border(PS.ALL, 0, 1);
	PS.border(PS.ALL, GRID_HEIGHT-1, 1);

	//etc
	PS.statusText( "" );
	PS.timerStart( SPEED, animate );

	PS.dbLogin( "imgd2900", TEAM, function ( id, user ) {
		if ( user === PS.ERROR ) {
			return;
		}
		PS.dbEvent( TEAM, "startup", user );
		PS.dbSend( TEAM, PS.CURRENT, { discard : true } );
	}, { active : false } );
};

PS.touch = function( x, y, data, options ) {

	placeRipple(x,y,data,options);
	MOUSE_DRAG = true;

};

PS.enter = function(x,y,data, options)
{
	"use strict";

	if(MOUSE_DRAG) {
		placeRipple(x, y, data, options);
	}
};

PS.release = function(x,y,data,options) {
	"use strict";
	MOUSE_DRAG = false;
};

PS.exitGrid = function (options)
{
	"use strict";
	MOUSE_DRAG = false;
}
