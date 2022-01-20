/*
game.js for Perlenspiel 3.3.x
Last revision: 4-22-21 (LD)

Lena Dias
A29
Main differences are the addition of new levels and keys.
*/
"use strict";

/* jshint browser : true, devel : true, esversion : 5, freeze : true */
/* globals PS : true */

var G = ( function () {
	//Grid size
	var GRID_X = 0;
	var GRID_Y = 0;
	var ROOM_SIZE = 7;

	//Image colors
	var GROUND_COLOR = 0x306082;
	var ACTOR_COLOR = 0x6abe30;
	var WALL_COLOR = 0x4b692f;
	var UI_COLOR = PS.COLOR_BLACK;
	var BACKGROUND_COLOR = 0x70767b;
	var STAIR_COLOR = 0x1679bf;
	var DOOR_COLOR = 0xb1b331;
	var DOOR_COLOR_2 = 0xac3232;
	var UI_KEY_COLOR = 0xE6E91C;
	var UI_KEY_COLOR_2 = 0xe20b0b;
	var KEY_COLOR = 0xE8EB1B;
	var KEY_COLOR_2 = 0xe40b0b;

	//for initializing walls
	var GROUND_RGB;
	var WALL_RGB;

	//markers for level elements
	var MAP_WALL = 0;
	var MAP_GROUND = 1;
	var STAIR_MARKER = "stair";
	var UI_MARKER = "ui";
	var KEY_MARKER = "type 1 key";
	var KEY_MARKER_2 = "type 2 key";
	var DOOR_MARKER = "type 1 door";
	var DOOR_MARKER_2 = "type 2 door";

	//planes
	var MAP_PLANE = 0;
	var KEY_PLANE = 4;
	var ACTOR_PLANE = 6;
	var UI_PLANE = 7;
	var STAIR_PLANE = 5;

	//key inventory
	var key_count = 0;
	var key_count_2 = 0;

	//actor info
	var actor_x = 1;
	var actor_y = 1;
	var actor_path = null;
	var actor_sprite;

	//level data
	var curr_level = 0;
		//initial level collision data
	let occupiedData = [false,true,true,true];//top left, top right, bottom left, bottom right

	//misc
	var pathmap;
	var mapdata;
	var imagemap = {
		width : 0,
		height : 0,
		pixelSize : 1,
        data : []
	};


	var is_wall = function ( x, y ) {
		var data;

		data = imagemap.data[ ((y)*GRID_X) + x];
		return ( data === MAP_WALL );
	};

	var key_find = function ( x, y, keynum ) {
		var oplane;

		oplane = PS.gridPlane();

		// remove key from grid
		PS.gridPlane( KEY_PLANE );
		PS.alpha( x, y, PS.ALPHA_TRANSPARENT );
		PS.glyph(x, y, "");
		PS.data( x, y, PS.DEFAULT );

		PS.audioPlay( "fx_coin2", {volume: 0.5} );

		PS.gridPlane(UI_PLANE);
		//update UI
		switch(keynum) //check key type
		{
			case 1:
				PS.color(0,0, UI_KEY_COLOR);
				PS.glyph(0,0, "⚷");
				key_count += 1;
				break;
			case 2:
				PS.color(1,0, UI_KEY_COLOR_2);
				PS.glyph(1,0, "⚷");
				key_count_2 += 1;
				break;
		}

		PS.gridPlane( oplane );
	};


	var actor_place = function ( x, y ) {
		var data, oplane;

		data = PS.data( x, y );

		//if door is encountered
		if ( data === DOOR_MARKER ) {
			//type 1 door/key
			if(key_count > 0)
			{
				oplane = PS.gridPlane();
				PS.gridPlane(KEY_PLANE);
				//remove door
				PS.audioPlay("fx_ding", {volume: 0.5});
				PS.data(x,y, MAP_GROUND);
				PS.color(x,y, GROUND_COLOR);
				PS.glyph(x,y, "");
				imagemap.data[ ((y)*GRID_X) + x] = 1;

				//remove key from UI
				key_count--;
				PS.gridPlane(UI_PLANE);
				PS.color(0,0, UI_COLOR);
				PS.gridPlane(oplane);
			}
			else {
				actor_path = false; // stops actor
				PS.audioPlay("fx_hoot", {volume: 0.5});
				return;
			}
		}
		else if (data ===DOOR_MARKER_2) {
			//type 2 door/key
			if (key_count_2 > 0) {
				oplane = PS.gridPlane();
				PS.gridPlane(KEY_PLANE);
				//remove door
				PS.audioPlay("fx_ding", {volume: 0.5});
				PS.data(x, y, MAP_GROUND);
				PS.color(x, y, GROUND_COLOR);
				PS.glyph(x, y, "");
				imagemap.data[((y) * GRID_X) + x] = 1;

				//remove key from UI
				key_count_2--;
				PS.gridPlane(UI_PLANE);
				PS.color(1, 0, UI_COLOR);
				PS.gridPlane(oplane);
			}
			else {
				actor_path = false; // stops actor
				PS.audioPlay("fx_hoot", {volume: 0.5});
				return;
			}
		}
		else if ( data === STAIR_MARKER ) {
			PS.spriteMove( actor_sprite, x, y );
			actor_x = x;
			actor_y = y;
			start_next_level();
		}

		//move to determined coordinates
		PS.spriteMove( actor_sprite, x, y );
		actor_x = x;
		actor_y = y;

		//found a key?
		if ( PS.data( x, y ) === KEY_MARKER )
		{
			key_find(x, y, 1);
		}
		else if(PS.data(x, y) === KEY_MARKER_2)
		{
				key_find(x,y, 2)
		}
	};

	var actor_step = function ( h, v ) {
		var nx, ny;

		// Calculate proposed new location.
		nx = actor_x + h;
		ny = actor_y + v;

		if ( is_wall( nx, ny ) ) {
			return;
		}

		// Is new location off the grid?
		// If so, exit without moving.
		if ( ( nx < 0 ) || ( nx >= GRID_X ) || ( ny < 0 ) || ( ny >= GRID_Y ) ) {
			return;
		}

		actor_path = null;
		actor_place( nx, ny );
	};


	var draw_map = function ( map ) {
		var oplane, i, x, y, data, color;

		oplane = PS.gridPlane();
		PS.gridPlane( MAP_PLANE );

		//iterate through every pixel on grid
		i = 0;
		for ( y = 0; y < map.height; y += 1 ) {
			for ( x = 0; x < map.width; x += 1 ) {
				data = map.data[ i ];
				switch ( data ) {
					case MAP_GROUND:
						color = GROUND_COLOR;
						break;
					case MAP_WALL:
						color = WALL_COLOR;
						break;
					default:
						//will show any unrecognized colors
						//PS.debug( "x : " + x + ", y : " + y + ", data : " + data + "\n" );
						color = PS.COLOR_WHITE;
						break;
				}
				PS.color( x, y, color );
				i += 1;
			}
		}

		PS.gridPlane( oplane );
	};

	var ui_key_place = function (x,y){
		var oplane = PS.gridPlane();

		PS.gridPlane( UI_PLANE );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, UI_MARKER );
		PS.color(0,0, UI_KEY_COLOR);
		PS.glyph(0,0, "⚷");

		PS.gridPlane( oplane );
	}
	var ui_key_place_2 = function (x,y){
		var oplane = PS.gridPlane();

		PS.gridPlane( UI_PLANE );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, UI_MARKER );
		PS.color(1,0, UI_KEY_COLOR_2);
		PS.glyph(1,0, "⚷");

		PS.gridPlane( oplane );
	}

	var key_place = function ( x, y ) {
		var oplane = PS.gridPlane();

		PS.gridPlane( KEY_PLANE );
		PS.color( x, y, KEY_COLOR );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, KEY_MARKER );
		PS.glyph(x, y, "⚷");


		PS.gridPlane( oplane );
	};
	var key_place_2 = function ( x, y ) {
		var oplane = PS.gridPlane();

		PS.gridPlane( KEY_PLANE );
		PS.color( x, y, KEY_COLOR_2 );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, KEY_MARKER_2 );
		PS.glyph(x, y, "⚷");


		PS.gridPlane( oplane );
	};

	var door_place = function ( x, y ) {
		var oplane = PS.gridPlane();

		PS.gridPlane( KEY_PLANE );
		PS.color( x, y, DOOR_COLOR );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, DOOR_MARKER);
		PS.glyph(x, y, "⍈");

		PS.gridPlane( oplane );
	};
	var door_place_2 = function ( x, y ) {
		var oplane = PS.gridPlane();

		PS.gridPlane( KEY_PLANE );
		PS.color( x, y, DOOR_COLOR_2 );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, DOOR_MARKER_2);
		PS.glyph(x, y, "⍈");

		PS.gridPlane( oplane );
	};

	var stair_place = function (x, y) {
		var oplane = PS.gridPlane();

		PS.gridPlane( STAIR_PLANE );
		PS.color( x, y, STAIR_COLOR );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, STAIR_MARKER );

		PS.gridPlane( oplane );
	};

	var ui_place = function (x, y) {
		var oplane = PS.gridPlane();

		PS.gridPlane( UI_PLANE );
		PS.color( x, y, UI_COLOR );
		PS.alpha( x, y, PS.ALPHA_OPAQUE );
		PS.data( x, y, UI_MARKER );

		PS.gridPlane( oplane );
	};

	var start_next_level = function()
	{
		PS.audioPlay("fx_powerup5", {volume: 0.5});
		key_count = 0;
		key_count_2 = 0;

		//initial collision data for each level; could be procedurally generated, but time constraints
		switch(curr_level)
		{
			case 0:
				PS.imageLoad( "images/level1.gif", onMapLoad, 1 );
				occupiedData[0] = true;
				occupiedData[1] = false;
				occupiedData[2] = true;
				occupiedData[3] = true;
				curr_level = 1;
				break;
			case 1:
				PS.imageLoad( "images/level2.gif", onMapLoad, 1 );
				occupiedData[0] = false;
				occupiedData[1] = true;
				occupiedData[2] = true;
				occupiedData[3] = true;
				curr_level = 2;
				break;
			case 2:
				PS.imageLoad( "images/level3.gif", onMapLoad, 1 );
				occupiedData[0] = false;
				occupiedData[1] = true;
				occupiedData[2] = true;
				occupiedData[3] = true;
				curr_level = 3;
				break;
			case 3:
				PS.imageLoad( "images/level4.gif", onMapLoad, 1 );
				occupiedData[0] = false;
				occupiedData[1] = true;
				occupiedData[2] = true;
				occupiedData[3] = true;
				curr_level = 4;
				break;
			case 4:
				PS.imageLoad( "images/level5.gif", onMapLoad, 1 );
				occupiedData[0] = true;
				occupiedData[1] = true;
				occupiedData[2] = true;
				occupiedData[3] = false;
				curr_level = 5;
				break;
			case 5:
				PS.imageLoad( "images/level6.gif", onMapLoad, 1 );
				occupiedData[0] = false;
				occupiedData[1] = true;
				occupiedData[2] = true;
				occupiedData[3] = true;
				curr_level = 6;
				break;
			case 6:
				PS.imageLoad( "images/level7.gif", onMapLoad, 1 );
				occupiedData[0] = true;
				occupiedData[1] = true;
				occupiedData[2] = true;
				occupiedData[3] = false;
				curr_level = 7;
				break;
			case 7:
				PS.imageLoad( "images/level8.gif", onMapLoad, 1 );
				occupiedData[0] = false;
				occupiedData[1] = true;
				occupiedData[2] = true;
				occupiedData[3] = true;
				curr_level = 8;
				break;
			case 8:
				PS.imageLoad( "images/level9.gif", onMapLoad, 1 );
				occupiedData[0] = false;
				occupiedData[1] = true;
				occupiedData[2] = true;
				occupiedData[3] = true;
				curr_level = 9;
				break;
			case 9:
				PS.imageLoad( "images/level9_5.gif", onMapLoad, 1 );
				occupiedData[0] = false;
				occupiedData[1] = true;
				occupiedData[2] = true;
				occupiedData[3] = true;
				curr_level = 10;
				break;
			case 10:
				PS.imageLoad( "images/level10.gif", onMapLoad, 1 );
				occupiedData[0] = false;
				occupiedData[1] = true;
				occupiedData[2] = true;
				occupiedData[3] = true;
				curr_level = 11;
				break;
			case 11:
				PS.imageLoad( "images/level11.gif", onMapLoad, 1 );
				occupiedData[0] = true;
				occupiedData[1] = false;
				occupiedData[2] = true;
				occupiedData[3] = true;
				curr_level = 12;
				break;
			case 12:
				PS.imageLoad( "images/level12.gif", onMapLoad, 1 );
				occupiedData[0] = true;
				occupiedData[1] = true;
				occupiedData[2] = true;
				occupiedData[3] = false;
				curr_level = 13;
				break;
			case 13:
				PS.imageLoad( "images/level13.gif", onMapLoad, 1 );
				occupiedData[0] = false;
				occupiedData[1] = true;
				occupiedData[2] = true;
				occupiedData[3] = true;
				curr_level = 14;
				break;
			case 14:
				PS.imageLoad( "images/level14.gif", onMapLoad, 1 );
				occupiedData[0] = true;
				occupiedData[1] = false;
				occupiedData[2] = true;
				occupiedData[3] = true;
				curr_level = 15;
				break;
			case 15:
				PS.imageLoad( "images/level15.gif", onMapLoad, 1 );
				occupiedData[0] = true;
				occupiedData[1] = true;
				occupiedData[2] = false;
				occupiedData[3] = true;
				curr_level = 16;
				break;
			case 16:
				PS.imageLoad( "images/level16.gif", onMapLoad, 1 );
				occupiedData[0] = true;
				occupiedData[1] = true;
				occupiedData[2] = false;
				occupiedData[3] = true;
				curr_level = 17;
				break;
			case 17:
				PS.imageLoad( "images/level17.gif", onMapLoad, 1 );
				occupiedData[0] = true;
				occupiedData[1] = true;
				occupiedData[2] = false;
				occupiedData[3] = true;
				curr_level = 0;
				break;
			default:
				break;
		}
	};

	var delete_quadrant = function(quadrant)
	{
		var x;
		var y;

		switch(quadrant)
		{
			case 0:
				for(x=0; x< ROOM_SIZE; x++)
				{
					for(y=0; y<ROOM_SIZE; y++)
					{
						var oplane = PS.gridPlane();
						//ground layer
						PS.color(x, y+1, GROUND_COLOR);
						//key layer
						PS.gridPlane(KEY_PLANE);
						PS.color(x, y+1, GROUND_COLOR);
						//stair layer
						PS.gridPlane(STAIR_PLANE);
						PS.color(x, y+1, GROUND_COLOR);
						//delete old actor
						PS.gridPlane(ACTOR_PLANE);
						PS.color(x,y+1, GROUND_COLOR);
						//back to original plane
						PS.gridPlane(oplane);
					}
				}
				break;
			case 1:
				for(x=0; x< ROOM_SIZE; x++)
				{
					for(y=0; y<ROOM_SIZE; y++)
					{
						var oplane = PS.gridPlane();
						//ground layer
						PS.color(x+7, y+1, GROUND_COLOR);
						//key layer
						PS.gridPlane(KEY_PLANE);
						PS.color(x+7, y+1, GROUND_COLOR);
						//stair layer
						PS.gridPlane(STAIR_PLANE);
						PS.color(x+7, y+1, GROUND_COLOR);
						//delete old actor
						PS.gridPlane(ACTOR_PLANE);
						PS.color(x+7,y+1, GROUND_COLOR);
						//back to original plane
						PS.gridPlane(oplane);
					}
				}
				break;
			case 2:
				for(x=0; x< ROOM_SIZE; x++)
				{
					for(y=0; y<ROOM_SIZE; y++)
					{
						var oplane = PS.gridPlane();
						//ground layer
						PS.color(x, y+8, GROUND_COLOR);
						//key layer
						PS.gridPlane(KEY_PLANE);
						PS.color(x, y+8, GROUND_COLOR);
						//stair layer
						PS.gridPlane(STAIR_PLANE);
						PS.color(x, y+8, GROUND_COLOR);
						//delete old actor
						PS.gridPlane(ACTOR_PLANE);
						PS.color(x,y+8, GROUND_COLOR);
						//back to original plane
						PS.gridPlane(oplane);
					}
				}
				break;
			case 3:
				for(x=0; x< ROOM_SIZE; x++) {
					for (y = 0; y < ROOM_SIZE; y++) {
						var oplane = PS.gridPlane();
						//ground layer
						PS.color(x + 7, y + 8, GROUND_COLOR);
						//key layer
						PS.gridPlane(KEY_PLANE);
						PS.color(x + 7, y + 8, GROUND_COLOR);
						//stair layer
						PS.gridPlane(STAIR_PLANE);
						PS.color(x + 7, y + 8, GROUND_COLOR);
						//delete old actor
						PS.gridPlane(ACTOR_PLANE);
						PS.color(x+7,y+8, GROUND_COLOR);
						//back to original plane
						PS.gridPlane(oplane);
					}
				}
				break;
			default:
				//PS.debug("couldn't delete room")
				break;
		}

	}



	var find_open_space = function(currQuadrant) {
		switch(currQuadrant)
		{
			case 0:
				//check quadrant 1
				if(!occupiedData[1])
				{
					if ((( (actor_x>=(GRID_X/2)) && (actor_x<GRID_X) ) && ( (actor_y>0) && (actor_y<(GRID_Y/2)) ))) {
						PS.audioPlay("fx_hoot",{volume: 0.5});
					}
					else{
						return 1;
					}
				}
				//check quadrant 2
				else if(!occupiedData[2])
				{	if ((( (actor_x>=0) && (actor_x<(GRID_X/2)) ) && ( (actor_y>(GRID_Y/2)) && (actor_y<(GRID_Y)) ))) {
					PS.audioPlay("fx_hoot",{volume: 0.5});
					}
					else{
						return 2;
					}
				}
				break;
			case 1:
				//check quadrant 0
				if(!occupiedData[0])
				{
					if((( (actor_x>=0) && (actor_x<(GRID_X/2)) ) && ( (actor_y>0) && (actor_y<(GRID_Y/2)) ))) {
						PS.audioPlay("fx_hoot",{volume: 0.5});
					}
					else
					{
						return 0;
					}
				}
				//check quadrant 3
				else if(!occupiedData[3])
				{
					if((( (actor_x>=(GRID_X/2)) && (actor_x<GRID_X) )  && ( (actor_y>(GRID_Y/2)) && (actor_y<(GRID_Y)) )))
					{
						PS.audioPlay("fx_hoot",{volume: 0.5});
					}
					else{
						return 3;
					}
				}
				break;
			case 2:
				//check quadrant 0
				if(!occupiedData[0])
				{
					if((( (actor_x>=0) && (actor_x<(GRID_X/2)) ) && ( (actor_y>0) && (actor_y<(GRID_Y/2)) ))) {
						PS.audioPlay("fx_hoot",{volume: 0.5});
					}
					else{
						return 0;
					}
				}
				//check quadrant 3
				else if(!occupiedData[3])
				{
					if((( (actor_x>=(GRID_X/2)) && (actor_x<GRID_X) )  && ( (actor_y>(GRID_Y/2)) && (actor_y<(GRID_Y)) ))){
						PS.audioPlay("fx_hoot",{volume: 0.5});
					}
					else {
						return 3;
					}
				}
				break;
			case 3:
				//check quadrant 1
				if(!occupiedData[1])
				{
					if ((( (actor_x>=(GRID_X/2)) && (actor_x<GRID_X) ) && ( (actor_y>0) && (actor_y<(GRID_Y/2)) ))) {
						PS.audioPlay("fx_hoot",{volume: 0.5});
					}
					else
					{
						return 1;
					}
				}
				else if(!occupiedData[2])
				{
					if ((( (actor_x>=0) && (actor_x<(GRID_X/2)) ) && ( (actor_y>(GRID_Y/2)) && (actor_y<(GRID_Y)) ))) {
						PS.audioPlay("fx_hoot",{volume: 0.5});
					}
					else {
						return 2;
					}
				}
				break;
			default:
				//PS.debug("No open space")
				break;
		}
	}

	var paste_room = function(copy, openSpace, currQuadrant)
	{
		switch (openSpace) {
			case 0:
				PS.imageBlit(copy, 0,1);
				delete_quadrant(currQuadrant);

				PS.audioPlay("fx_swoosh", {volume: 0.5});
				occupiedData[currQuadrant] = false;
				occupiedData[openSpace] = true;
				break;
			case 1:
				PS.imageBlit(copy, 7,1);
				delete_quadrant(currQuadrant);

				PS.audioPlay("fx_swoosh", {volume: 0.5});
				occupiedData[currQuadrant] = false;
				occupiedData[openSpace] = true;
				break;
			case 2:
				PS.imageBlit(copy, 0,8);
				delete_quadrant(currQuadrant);

				PS.audioPlay("fx_swoosh", {volume: 0.5});
				occupiedData[currQuadrant] = false;
				occupiedData[openSpace] = true;
				break;
			case 3:
				PS.imageBlit(copy, 7,8);
				delete_quadrant(currQuadrant);

				PS.audioPlay("fx_swoosh", {volume: 0.5});
				occupiedData[currQuadrant] = false;
				occupiedData[openSpace] = true;
				break;
			default:
				//PS.debug("no quadrant chosen");
				PS.audioPlay("fx_hoot");
				break;
		}


	}

	var onMapLoad = function ( image ) {
		var i, x, y, data, pixel;

		if ( image === PS.ERROR ) {
			//PS.debug( "onMapLoad(): image load error\n" );
			return;
		}

		mapdata = image; // save map data for later

		// Prepare grid for map drawing
		imagemap.width = GRID_X = image.width;
		imagemap.height = GRID_Y = image.height;

		PS.gridSize( GRID_X, GRID_Y );
		PS.border( PS.ALL, PS.ALL, 0 );

		// Translate map pixels to data format expected by imagemap

		i = 0; // init pointer into imagemap.data array

		for ( y = 0; y < GRID_Y; y += 1 ) {
			for ( x = 0; x < GRID_X; x += 1 ) {
				data = MAP_GROUND; // assume ground
				pixel = image.data[ i ];
				switch ( pixel ) {
					case GROUND_COLOR:
						break; // no need to do anything
					case BACKGROUND_COLOR:
						//data = MAP_WALL; //cannot walk on background
						break;
					case WALL_COLOR:
						data = MAP_WALL; // found a wall!
						break;
					case UI_COLOR:
						data = MAP_WALL; // can't walk on UI
						ui_place(x, y);
						break;
					case KEY_COLOR:
						key_place( x, y ); // found a type 1 key!
						break;
					case KEY_COLOR_2:
						key_place_2( x, y ); // found a type 2 key!
						break;
					case UI_KEY_COLOR:
						data = MAP_WALL; //for keeping inventory from disappearing
						ui_key_place(x,y);
						break;
					case UI_KEY_COLOR_2:
						data = MAP_WALL; //for keeping inventory from disappearing
						ui_key_place_2(x,y);
						break;
					case ACTOR_COLOR:
						actor_x = x; // establish initial location of actor
						actor_y = y;
						break;
					case DOOR_COLOR:
						door_place( x, y );
						break;
					case DOOR_COLOR_2:
						door_place_2(x,y);
						break;
					case STAIR_COLOR:
						stair_place( x, y );
						break;
					default:
						//PS.debug( "onMapLoad(): unrecognized pixel value\n" );
						break;
				}
				imagemap.data[ i ] = data; // install translated data
				i += 1; // update array pointer
			}
		}

		// Now we can complete the initialization

		GROUND_RGB = PS.unmakeRGB( GROUND_COLOR, {} );
		WALL_RGB = PS.unmakeRGB( WALL_COLOR, {} );
		draw_map( imagemap );

		actor_sprite = PS.spriteSolid( 1, 1 ); // Create 1x1 solid sprite, save its ID
		PS.spriteSolidColor( actor_sprite, ACTOR_COLOR ); // assign color
		PS.spritePlane( actor_sprite, ACTOR_PLANE ); // Move to assigned plane


		actor_place( actor_x, actor_y );
		pathmap = PS.pathMap( imagemap );
	};


	return {
		init : function () {
			// This function is called when the map image is loaded

			const TEAM = "doublejump";

			// Load the image map for the first level in format 1
			PS.imageLoad( "images/level0.gif", onMapLoad, 1 );
			PS.statusText("");

			PS.dbLogin( "imgd2900", TEAM, function ( id, user ) {
				if ( user === PS.ERROR ) {
					return;
				}
				PS.dbEvent( TEAM, "startup", user );
				PS.dbSend( TEAM, PS.CURRENT, { discard : true } );
			}, { active : false } );

		},
		touch : function ( x, y ) {

			var openSpace = 0;

			if(( (x>0) && (x<(GRID_X/2)) ) && ( (y>0) && (y<(GRID_Y/2)) )){

					//PS.debug("top left");

					openSpace = find_open_space(0);
					PS.color(actor_x,actor_y,ACTOR_COLOR);
					var copy = PS.imageCapture(1, {left: 0, top: 1, width: 7, height: 7});
					paste_room(copy, openSpace, 0);


			}
			else if (( (x>(GRID_X/2)) && (x<GRID_X) ) && ( (y>0) && (y<(GRID_Y/2)) )) {

					//PS.debug("top right");

					openSpace = find_open_space(1);
					PS.color(actor_x,actor_y,ACTOR_COLOR);
					var copy = PS.imageCapture(1, {left: 7, top: 1, width: 7, height: 7});
					paste_room(copy, openSpace, 1);



			}
			else if (( (x>0) && (x<(GRID_X/2)) ) && ( (y>(GRID_Y/2)) && (y<(GRID_Y)) )){

					//PS.debug("bottom left");

					openSpace = find_open_space(2);
					PS.color(actor_x,actor_y,ACTOR_COLOR);
					var copy = PS.imageCapture(1, {left: 0, top: 8, width: 7, height: 7});
					//PS.debug(openSpace);
					paste_room(copy, openSpace, 2);

			}
			else if (( (x>(GRID_X/2)) && (x<GRID_X) )  && ( (y>(GRID_Y/2)) && (y<(GRID_Y)) )){

					//PS.debug("bottom right");

					openSpace = find_open_space(3);
					PS.color(actor_x,actor_y,ACTOR_COLOR);
					var copy = PS.imageCapture(1, {left: 7, top: 8, width: 7, height: 7});
					paste_room(copy, openSpace, 3);


			}
			else{
				PS.audioPlay("fx_hoot",{volume: 0.5});
			}

			//update collision after move
			var newCollision = PS.imageCapture(1, {left: 0, top:0, width:GRID_X, height:GRID_Y});
			onMapLoad(newCollision);
		},


		keyDown : function ( key ) {
			//PS.debug( "PS.keyDown(): key=" + key + "\n" );

			switch ( key ) {
				case PS.KEY_ARROW_UP:
				case 119:
				case 87: {
					actor_step(0,-1)
					break;
				}
				case PS.KEY_ARROW_DOWN:
				case 115:
				case 83: {
					actor_step( 0, 1 ); // move DOWN (v = 1)
					break;
				}
				case PS.KEY_ARROW_LEFT:
				case 97:
				case 65: {
					actor_step( -1, 0 ); // move LEFT (h = -1)
					break;
				}
				case PS.KEY_ARROW_RIGHT:
				case 100:
				case 68: {
					actor_step( 1, 0 ); // move RIGHT (h = 1)
					break;
				}
			}
		}
	};
} () );

PS.init = G.init;
PS.touch = G.touch;
PS.release = G.release;
PS.keyDown = G.keyDown;

