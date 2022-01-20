


/*
game.js for Perlenspiel 3.3.xd
Last revision: 2021-08-07 (LD)

A39
*/

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT delete this directive!

const G = ( function () {

	//Grid size
	let GRID_X = 16;
	let GRID_Y = 16;

	//for tracking how borders should be drawn
	//T = top border, B = bottom, L = left, R = right
	const FILL_COLOR = 0xe5ff00;
	const FILL_TL_COLOR = 0x0000ff;
	const FILL_L_COLOR = 0x00d3ff;
	const FILL_BL_COLOR = 0xff0000;
	const FILL_B_COLOR = 0xb800ff;
	const FILL_BR_COLOR = 0x68ff00;
	const FILL_R_COLOR = 0xff00af;
	const FILL_TR_COLOR = 0xfff300;
	const FILL_LR_COLOR = 0x00ffff;
	const FILL_TB_COLOR = 0x00ffb3;
	const FILL_T_COLOR = 0xff6700;
	const FILL_TLR_COLOR = 0xffb300;

	//general game colors
	const WORD_COLOR = 0x000000;
	const PAGE_COLOR = 0xffffff;
	const MOUSE_COLOR = 0x404040;

	//markers
	const FILLABLE_MARKER = "fillable";
	const BACKGROUND_MARKER = "unfillable";

	//planes
	const BACKGROUND_PLANE = 0;
	const PAGE_PLANE = 1;
	const WORD_PLANE = 2;
	const MOUSE_PLANE = 3;
	const ANIMATE_PLANE = 4;

	//for tracking mouse overlap
	let mouse;
	let current_cursor;
	let mouse_x;
	let mouse_y;
	let sprite_hovered_over;
	let word_hovered_over;

	//game logic
	let holdingWisdom = false;

	let timer_ID;
	let gameComplete = false;

	//ending animations
	let Frame_1;
	let Frame_2;
	let Village_Frame_1;
	let Village_Frame_2;
	let Factory_Frame_1;
	let Factory_Frame_2;
	let City_Frame_1;
	let City_Frame_2;
	let Mooncity_Frame_1;
	let Mooncity_Frame_2;
	let on_frame_1 = true;

	//level-specific data
	let current_level = 1;
	let block_place_text;
	let block_pickup_text;
	let level_win_text;
	let correct_blocks;
	let page_length = 5;
	let music_channel;

	// sprite identifiers for words
	let NUM_SPRITES = 35;
	let finishedSprites = 0;

	let Dash3;
	let Dash3_2;
	let Dot;
	let Dot_2;
	let Square;
	let Square_2;
	let Square_3;
	let Square_4;
	let Square3by4;
	let Square3by4_2;
	let I;
	let I_2;
	let I_3;
	let I_4;
	let I3;
	let I3_2;
	let I4;
	let I4_2;
	let I4_3;
	let I5;
	let Dash4;
	let Dash4_2;
	let Block3by2;
	let Block3by2_2;
	let Dash;
	let Dash_2;


	//basically just a list of all words so player can't put on top of each other; scrapped feature
	//does not appear to be way to test for *absence* of overlap in perlenspiel?
	var words = [];

	//for loading backgrounds
	var mapdata;
	var imagemap = {
		width : 0,
		height : 0,
		pixelSize : 1,
		data : []
	};

	//gets channel music is playing on
	const getChannel = function(data)
	{
		music_channel = data.channel;
	}

	//initial word placement, just for making sure sprite load is synced
	const placeWords = function ( level ) {

		PS.imageLoad("images/villagestart.gif", onBackgroundLoad, 1);

		switch(level)
		{
			case 1:
				PS.statusText("Society grows with wisdom...")
				break;
			default:
				break;
		}


	};

	//reports non-word sprite overlap
	const reporter = function ( s1, p1, s2, p2, type ) {
		if ( type === PS.SPRITE_TOUCH ) {
			type = "touched"
		}
		else {
			type = "overlapped";
			sprite_hovered_over = s2;
		}
		//PS.statusText( s1 + type + s2 );
	};

	//reports word overlap; non-word sprite and word sprite cannot be same, results in deletion of words
	const reporterWord = function ( s1, p1, s2, p2, type ) {
		if ( type === PS.SPRITE_TOUCH ) {
			type = "touched"
		}
		else {
			type = "overlapped";
			word_hovered_over = s1;
		}
		//PS.statusText( s1 + type + s2 );
	};

	//cue ending animation, reset game logic
	const endLevel = function () {
		PS.audioPlay("fx_powerup8", {volume: 0.5});
		gameComplete = true;
		switch(current_level)
		{
			case(1):
				PS.audioPlay("village", {path: "sounds/", volume: 0.5, loop: true, fileTypes: ["wav"], onLoad: getChannel});
				break;
			case(2):
				PS.audioPlay("factory", {path: "sounds/", volume: 0.5, loop: true, fileTypes: ["wav"], onLoad: getChannel});
				break;
			case(3):
				PS.audioPlay("city", {path: "sounds/", volume: 0.5, loop: true, fileTypes: ["wav"], onLoad: getChannel});
				break;
			case(4):
				PS.audioPlay("space", {path: "sounds/", volume: 0.5, loop: true, fileTypes: ["mp3"], onLoad: getChannel});
				break;
			default:
				break;
		}
		PS.statusText(level_win_text);
		word_hovered_over = null;
		sprite_hovered_over = null;
		current_level++;
	};

	//load next level after click on ending animation
	const loadNextLevel = function ( level ) {

		//keeps mouse from overlapping sprites
		mouse_x = GRID_X;
		mouse_y = GRID_Y;

		switch(current_level)
		{
			case(1):
				break;
			case(2):
				PS.audioStop(music_channel);
				break;
			case(3):
				PS.audioStop(music_channel);
				break;
			case(4):
				PS.audioStop(music_channel);
				break;
			default:
				break;
		}


		switch(current_level)
		{
			case(1):
				PS.statusText("A village...");
				level_win_text = "A wise society prospers...";
				block_place_text = "Used some wisdom...";
				block_pickup_text = "Found some wisdom...";
				correct_blocks = 18;
				Frame_1 = Village_Frame_1;
				Frame_2 = Village_Frame_2;
				gameComplete = false;
				PS.spriteMove(Frame_1, 0 , 0);
				PS.spriteMove(Frame_2, 0, 0);
				PS.spriteShow(Frame_1, false);
				PS.spriteShow(Frame_2, false);
				PS.spriteShow(Dash3, false);
				PS.spriteShow(Dash3_2, false);
				PS.spriteShow(Dash_2, true);
				PS.spriteShow(Dash, true);
				PS.spriteShow(Square, true);
				PS.spriteShow(Square_2, false);
				PS.spriteShow(Square3by4, false);
				PS.spriteShow(Square3by4_2, false);
				PS.spriteShow(Dash3_2, true);
				PS.spriteShow(I, true);
				PS.spriteShow(I_2, false);
				PS.spriteShow(I_3, false);
				PS.spriteShow(I_4, false);
				PS.spriteShow(I4_2, false);
				PS.spriteShow(I4_3, false);
				PS.spriteShow(Dot, true);
				PS.spriteShow(Dot_2, true);
				PS.spriteShow(Dash3, true);
				PS.spriteShow(Dash4, false);
				PS.spriteShow(Dash4_2, false);
				PS.spriteShow(Block3by2, false);
				PS.spriteShow(Block3by2_2, false);
				PS.spriteShow(I3_2, false);
				PS.spriteShow(Square_3, false);
				PS.spriteShow(I4, false);
				PS.spriteShow(Square_4, false);
				PS.spriteShow(I5, false);

				PS.spriteCollide(Dash3, reporterWord);
				PS.spriteCollide(I5, reporterWord);
				PS.spriteCollide(Dash3_2, reporterWord);
				PS.spriteCollide(Dash_2, reporterWord);
				PS.spriteCollide(Dash, reporterWord);
				PS.spriteCollide(Square, reporterWord);
				PS.spriteCollide(Square_2, reporterWord);
				PS.spriteCollide(Square_3, reporterWord);
				PS.spriteCollide(Square_4, reporterWord);
				PS.spriteCollide(Square3by4, reporterWord);
				PS.spriteCollide(Square3by4_2, reporterWord);
				PS.spriteCollide(Dash3_2, reporterWord);
				PS.spriteCollide(I, reporterWord);
				PS.spriteCollide(I_2, reporterWord);
				PS.spriteCollide(I3, reporterWord);
				PS.spriteCollide(I3_2, reporterWord);
				PS.spriteCollide(I_3, reporterWord);
				PS.spriteCollide(I_4, reporterWord);
				PS.spriteCollide(I4_2, reporterWord);
				PS.spriteCollide(I4_3, reporterWord);
				PS.spriteCollide(Dot, reporterWord);
				PS.spriteCollide(Dot_2, reporterWord);
				PS.spriteCollide(Dash3, reporterWord);
				PS.spriteCollide(Dash4, reporterWord);
				PS.spriteCollide(Dash4_2, reporterWord);
				PS.spriteCollide(Block3by2, reporterWord);
				PS.spriteCollide(Block3by2_2, reporterWord);


				PS.spriteMove(Dash_2, 2, 0);
				PS.spriteMove(Dash, 5, 0);
				PS.spriteMove(Square, 8, 0);
				PS.spriteMove(Dash3_2, 11, 0);
				PS.spriteMove(I, 2, 3);
				PS.spriteMove(Dot, 5, 3);
				PS.spriteMove(Dot_2, 8, 3);
				PS.spriteMove(Dash3, 11, 3);
				break;
			case(2):
				PS.statusText("A factory...");
				level_win_text = "Yet, wisdom can be used for evil.";
				block_place_text = "Exploited some wisdom...";
				block_pickup_text = "Claimed some wisdom...";
				correct_blocks = 39;
				PS.spriteShow(Village_Frame_1, false);
				PS.spriteShow(Village_Frame_2, false);
				Frame_1 = Factory_Frame_1;
				Frame_2 = Factory_Frame_2;
				holdingWisdom = false;
				sprite_hovered_over = null;
				word_hovered_over = null;
				current_cursor = mouse;
				gameComplete = false;
				PS.spriteShow(Frame_1, false);
				PS.spriteShow(Frame_2, false);
				PS.spriteShow(Dash3, false);
				PS.spriteShow(Dash3_2, false);
				PS.spriteShow(Dash_2, false);
				PS.spriteShow(Dash, false);
				PS.spriteShow(Square, false);
				PS.spriteShow(Square_2, false);
				PS.spriteShow(Square3by4, false);
				PS.spriteShow(Square3by4_2, false);
				PS.spriteShow(Dash3_2, false);
				PS.spriteShow(I4, true);
				PS.spriteShow(I, true);
				PS.spriteShow(I3, true);
				PS.spriteShow(I_2, true);
				PS.spriteShow(I_3, false);
				PS.spriteShow(I_4, false);
				PS.spriteShow(I4_2, true);
				PS.spriteShow(I4_3, true);
				PS.spriteShow(Dot, false);
				PS.spriteShow(Dot_2, false);
				PS.spriteShow(Dash3, false);
				PS.spriteShow(Dash4, true);
				PS.spriteShow(Dash4_2, true);
				PS.spriteShow(Block3by2, true);
				PS.spriteShow(Block3by2_2, true);
				PS.spriteShow(I3_2, false);
				PS.spriteShow(Square_3, false);
				PS.spriteShow(Square_4, false);
				PS.spriteShow(I5, false);

				PS.spriteMove(Block3by2, 12, 4);
				PS.spriteMove(Block3by2_2, 8, 3);
				PS.spriteMove(Dash4, 12, 0);
				PS.spriteMove(Dash4_2, 12, 2);
				PS.spriteMove(I3, 6, 0);
				PS.spriteMove(I, 10, 0);
				PS.spriteMove(I_2, 8, 0);
				PS.spriteMove(I4_3, 4, 0);
				PS.spriteMove(I4_2, 2, 0);
				PS.spriteMove(I4, 0, 0);

				break;
			case(3):
				PS.statusText("A city...");
				level_win_text = "But wisdom can raise cities...";
				block_place_text = "Utilized some wisdom...";
				block_pickup_text = "Distributed some wisdom...";
				correct_blocks = 45;
				PS.spriteShow(Factory_Frame_1, false);
				PS.spriteShow(Factory_Frame_2, false);
				Frame_1 = City_Frame_1;
				Frame_2 = City_Frame_2;
				holdingWisdom = false;
				sprite_hovered_over = null;
				word_hovered_over = null;
				current_cursor = mouse;
				gameComplete = false;
				PS.spriteShow(Frame_1, false);
				PS.spriteShow(Frame_2, false);
				PS.spriteShow(Dash3, false);
				PS.spriteShow(Dash3_2, false);
				PS.spriteShow(Dash_2, false);
				PS.spriteShow(Dash, false);
				PS.spriteShow(Square, true);
				PS.spriteShow(Square_2, true);
				PS.spriteShow(Square3by4, false);
				PS.spriteShow(Square3by4_2, false);
				PS.spriteShow(Dash3_2, false);
				PS.spriteShow(I, true);
				PS.spriteShow(I3, true);
				PS.spriteShow(I_2, true);
				PS.spriteShow(I_3, true);
				PS.spriteShow(I_4, false);
				PS.spriteShow(I4_2, false);
				PS.spriteShow(I4_3, false);
				PS.spriteShow(Dot, false);
				PS.spriteShow(Dot_2, false);
				PS.spriteShow(Dash3, false);
				PS.spriteShow(Dash4, false);
				PS.spriteShow(Dash4_2, false);
				PS.spriteShow(Block3by2, true);
				PS.spriteShow(Block3by2_2, true);
				PS.spriteShow(I3_2, true);
				PS.spriteShow(Square_3, true);
				PS.spriteShow(Square_4, true);
				PS.spriteShow(I5, true);

				PS.spriteMove(I3, 0, 2);
				PS.spriteMove(I3_2, 2, 2);
				PS.spriteMove(I5, 1, 0);
				PS.spriteMove(Block3by2, 4, 0);
				PS.spriteMove(Square, 8, 0);
				PS.spriteMove(Square_2, 11, 0);
				PS.spriteMove(Square_3, 14, 0);
				PS.spriteMove(I, 4, 3);
				PS.spriteMove(I_2, 6, 3);
				PS.spriteMove(Block3by2_2, 8, 3);
				PS.spriteMove(I_3, 12, 3);
				PS.spriteMove(Square_4, 14, 3);
				break;
			case(4):
				PS.statusText("The moon...");
				level_win_text = "And wisdom can carry us to the stars.";
				block_place_text = "Synthesized some wisdom...";
				block_pickup_text = "Identified some wisdom...";
				correct_blocks = 71;
				PS.spriteShow(City_Frame_1, false);
				PS.spriteShow(City_Frame_2, false);
				Frame_1 = Mooncity_Frame_1;
				Frame_2 = Mooncity_Frame_2;
				holdingWisdom = false;
				sprite_hovered_over = null;
				word_hovered_over = null;
				current_cursor = mouse;
				gameComplete = false;
				PS.spriteShow(Frame_1, false);
				PS.spriteShow(Frame_2, false);
				PS.spriteShow(Dash3, true);
				PS.spriteShow(Dash3_2, true);
				PS.spriteShow(Dash_2, false);
				PS.spriteShow(Dash, true);
				PS.spriteShow(Square, true);
				PS.spriteShow(Square_2, true);
				PS.spriteShow(Square3by4, true);
				PS.spriteShow(Square3by4_2, true);
				PS.spriteShow(I, true);
				PS.spriteShow(I3, true);
				PS.spriteShow(I_2, true);
				PS.spriteShow(I_3, true);
				PS.spriteShow(I_4, true);
				PS.spriteShow(I4, true);
				PS.spriteShow(I4_2, false);
				PS.spriteShow(I4_3, false);
				PS.spriteShow(Dot, false);
				PS.spriteShow(Dot_2, false);
				PS.spriteShow(Dash4, true);
				PS.spriteShow(Dash4_2, false);
				PS.spriteShow(Block3by2, true);
				PS.spriteShow(Block3by2_2, true);
				PS.spriteShow(I3_2, false);
				PS.spriteShow(Square_3, false);
				PS.spriteShow(Square_4, false);
				PS.spriteShow(I5, false);

				PS.spriteMove(Square3by4, 0, 0);
				PS.spriteMove(I4, 3, 1);
				PS.spriteMove(Square3by4_2, 4, 0);
				PS.spriteMove(Block3by2, 7, 0);
				PS.spriteMove(Square, 10, 0);
				PS.spriteMove(Square_2, 12, 0);
				PS.spriteMove(I, 14, 0);
				PS.spriteMove(I_2, 15, 0);
				PS.spriteMove(I_4, 14,5);
				PS.spriteMove(Block3by2_2, 7, 2);
				PS.spriteMove(Dash4, 10, 2);
				PS.spriteMove(Dash, 14, 2);
				PS.spriteMove(Dash3, 10, 4);
				PS.spriteMove(Dash3_2, 13, 4);
				PS.spriteMove(I3, 6, 4);
				PS.spriteMove(I_3, 15, 5);
				break;
			default:
				break;
		}
		PS.gridRefresh();

	};

	//load background for level and whitespace
	const onBackgroundLoad = function (image) {
		let i, x, y, data, pixel;

		if (image === PS.ERROR) {
			return;
		}

		mapdata = image; // save map data for later

		// Prepare grid for map drawing
		imagemap.width = GRID_X = image.width;
		imagemap.height = GRID_Y = image.height;

		PS.gridSize(GRID_X, GRID_Y);
		PS.border(PS.ALL, PS.ALL, 0);

		// Translate map pixels to data format expected by imagemap

		i = 0; // init pointer into imagemap.data array

		PS.gridPlane(BACKGROUND_PLANE);

		for (y = 0; y < GRID_Y; y += 1) {
			for (x = 0; x < GRID_X; x += 1) {
				data = BACKGROUND_MARKER; // assume background
				pixel = image.data[i];
				switch (pixel) {
					case FILL_COLOR:
						PS.color(x, y, PS.COLOR_WHITE);
						data = FILLABLE_MARKER;
						PS.data(x, y, FILLABLE_MARKER);
						break;
					case FILL_TL_COLOR:
						PS.color(x, y, PS.COLOR_WHITE);
						PS.border(x, y, {top: 1, left: 1, bottom: 0, right: 0});
						PS.data(x, y, FILLABLE_MARKER);
						break;
					case FILL_L_COLOR:
						PS.color(x, y, PS.COLOR_WHITE);
						data = FILLABLE_MARKER;
						PS.border(x, y, {top: 0, left: 1, bottom: 0, right: 0});
						PS.data(x, y, FILLABLE_MARKER);
						break;
					case FILL_BL_COLOR:
						PS.color(x, y, PS.COLOR_WHITE);
						data = FILLABLE_MARKER;
						PS.border(x, y, {top: 0, left: 1, bottom: 1, right: 0});
						PS.data(x, y, FILLABLE_MARKER);
						break;
					case FILL_B_COLOR:
						PS.color(x, y, PS.COLOR_WHITE);
						data = FILLABLE_MARKER;
						PS.border(x, y, {top: 0, left: 0, bottom: 1, right: 0});
						PS.data(x, y, FILLABLE_MARKER);
						break;
					case FILL_BR_COLOR:
						PS.color(x, y, PS.COLOR_WHITE);
						data = FILLABLE_MARKER;
						PS.border(x, y, {top: 0, left: 0, bottom: 1, right: 1});
						PS.data(x, y, FILLABLE_MARKER);
						break;
					case FILL_R_COLOR:
						PS.color(x, y, PS.COLOR_WHITE);
						data = FILLABLE_MARKER;
						PS.border(x, y, {top: 0, left: 0, bottom: 0, right: 1});
						PS.data(x, y, FILLABLE_MARKER);
						break;
					case FILL_TR_COLOR:
						PS.color(x, y, PS.COLOR_WHITE);
						data = FILLABLE_MARKER;
						PS.border(x, y, {top: 1, left: 0, bottom: 0, right: 1});
						PS.data(x, y, FILLABLE_MARKER);
						break;
					case FILL_LR_COLOR:
						PS.color(x, y, PS.COLOR_WHITE);
						data = FILLABLE_MARKER;
						PS.border(x, y, {top: 0, left: 1, bottom: 0, right: 1});
						PS.data(x, y, FILLABLE_MARKER);
						break;
					case FILL_TB_COLOR:
						PS.color(x, y, PS.COLOR_WHITE);
						data = FILLABLE_MARKER;
						PS.border(x, y, {top: 1, left: 0, bottom: 1, right: 0});
						PS.data(x, y, FILLABLE_MARKER);
						break;
					case FILL_TLR_COLOR:
						PS.color(x, y, PS.COLOR_WHITE);
						data = FILLABLE_MARKER;
						PS.border(x, y, {top: 1, left: 1, bottom: 0, right: 1});
						PS.data(x, y, FILLABLE_MARKER);
						break;
					case FILL_T_COLOR:
						PS.color(x, y, PS.COLOR_WHITE);
						data = FILLABLE_MARKER;
						PS.border(x, y, {top: 1, left: 0, bottom: 0, right: 0});
						PS.data(x, y, FILLABLE_MARKER);
						break;
					default:
						PS.color(x, y, pixel);
						data = BACKGROUND_MARKER;
						break;
				}
				imagemap.data[i] = data; // install translated data
				i += 1; // update array pointer
			}
		}

		switch(current_level)
		{
			case(1):
				page_length = 5;
				break;
			case(2):
				page_length = 6;
				break;
			case(3):
				page_length = 6;
				break;
			case(4):
				page_length = 7;
				break;
		}
		PS.gridPlane(PAGE_PLANE);
		let z,c;
		for(z=0; z<GRID_X; z++)
		{
			for(c=0; c<page_length; c++)
			{
				PS.color(z,c, PAGE_COLOR);
				PS.alpha(z,c, 255);
			}
		}
		PS.gridRefresh();
		loadNextLevel(current_level);

	};


	return {
		init : function () {

			const TEAM = "doublejump";

			PS.gridSize( GRID_X, GRID_Y ); // init grid
			PS.border( PS.ALL, PS.ALL, 0 ); // no borders
			PS.audioLoad( "fx_click" ); // preload sound

			//loaders to sync sprites, make sure nothing is accessed before loads
			//limitations of perlenspiel seem to prevent me from simplifying down to single method
			const onSpriteLoad_Dash3 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Dash3 = PS.spriteImage(image);
					PS.spritePlane(Dash3, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}

					words.push(Dash3);
				}
			};
			const onSpriteLoad_Dash3_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Dash3_2 = PS.spriteImage(image);
					PS.spritePlane(Dash3_2, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Dash3_2);
				}
			};
			const onSpriteLoad_Dot = function ( image ) {
				if(image !== PS.ERROR)
				{
					Dot = PS.spriteImage(image);
					PS.spritePlane(Dot, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Dot);

				}
			};
			const onSpriteLoad_Dot_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Dot_2 = PS.spriteImage(image);
					PS.spritePlane(Dot_2, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Dot_2);
				}
			};
			const onSpriteLoad_Square = function ( image ) {
				if(image !== PS.ERROR)
				{
					Square = PS.spriteImage(image);
					PS.spritePlane(Square, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Square);
				}
			};
			const onSpriteLoad_Square_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Square_2 = PS.spriteImage(image);
					PS.spritePlane(Square_2, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Square_2);
				}
			};
			const onSpriteLoad_Square_3 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Square_3 = PS.spriteImage(image);
					PS.spritePlane(Square_3, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Square_3);
				}
			};
			const onSpriteLoad_Square_4 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Square_4 = PS.spriteImage(image);
					PS.spritePlane(Square_4, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Square_4);
				}
			};
			const onSpriteLoad_Square3by4 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Square3by4 = PS.spriteImage(image);
					PS.spritePlane(Square3by4, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Square3by4);
				}

			};
			const onSpriteLoad_Square3by4_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Square3by4_2 = PS.spriteImage(image);
					PS.spritePlane(Square3by4_2, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Square3by4_2);
				}
			};
			const onSpriteLoad_I = function ( image ) {
				if(image !== PS.ERROR)
				{
					I = PS.spriteImage(image);
					PS.spritePlane(I, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(I);
				}
			};
			const onSpriteLoad_I_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					I_2 = PS.spriteImage(image);
					PS.spritePlane(I_2, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(I_2);
				}
			};
			const onSpriteLoad_I_3 = function ( image ) {
				if(image !== PS.ERROR)
				{
					I_3 = PS.spriteImage(image);
					PS.spritePlane(I_3, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(I_3);
				}
			};
			const onSpriteLoad_I_4 = function ( image ) {
				if(image !== PS.ERROR)
				{
					I_4 = PS.spriteImage(image);
					PS.spritePlane(I_4, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(I_4);
				}
			};
			const onSpriteLoad_I3 = function ( image ) {
				if(image !== PS.ERROR)
				{
					I3 = PS.spriteImage(image);
					PS.spritePlane(I3, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(I3);
				}
			};
			const onSpriteLoad_I3_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					I3_2 = PS.spriteImage(image);
					PS.spritePlane(I3_2, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(I3_2);
				}
			};
			const onSpriteLoad_I4 = function ( image ) {
				if(image !== PS.ERROR)
				{
					I4 = PS.spriteImage(image);
					PS.spritePlane(I4, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(I4);
				}
			};
			const onSpriteLoad_I4_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					I4_2 = PS.spriteImage(image);
					PS.spritePlane(I4_2, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(I4_2);
				}
			};
			const onSpriteLoad_I4_3 = function ( image ) {
				if(image !== PS.ERROR)
				{
					I4_3 = PS.spriteImage(image);
					PS.spritePlane(I4_3, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(I4_3);
				}
			};
			const onSpriteLoad_Dash4 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Dash4 = PS.spriteImage(image);
					PS.spritePlane(Dash4, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Dash4);
				}
			};
			const onSpriteLoad_I5 = function ( image ) {
				if(image !== PS.ERROR)
				{
					I5 = PS.spriteImage(image);
					PS.spritePlane(I5, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(I5);
				}
			};
			const onSpriteLoad_Dash4_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Dash4_2 = PS.spriteImage(image);
					PS.spritePlane(Dash4_2, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Dash4_2);
				}
			};
			const onSpriteLoad_Block3by2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Block3by2 = PS.spriteImage(image);
					PS.spritePlane(Block3by2, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Block3by2);
				}
			};
			const onSpriteLoad_Block3by2_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Block3by2_2 = PS.spriteImage(image);
					PS.spritePlane(Block3by2_2, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Block3by2_2);
				}
			};
			const onSpriteLoad_Dash = function ( image ) {
				if(image !== PS.ERROR)
				{
					Dash = PS.spriteImage(image);
					PS.spritePlane(Dash, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Dash);
				}
			};
			const onSpriteLoad_Dash_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Dash_2 = PS.spriteImage(image);
					PS.spritePlane(Dash_2, WORD_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
					words.push(Dash_2);
				}
			};
			const onSpriteLoad_Village_Frame_1 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Village_Frame_1 = PS.spriteImage(image);
					PS.spritePlane(Village_Frame_1, ANIMATE_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
				}
			};
			const onSpriteLoad_Village_Frame_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Village_Frame_2 = PS.spriteImage(image);
					PS.spritePlane(Village_Frame_2, ANIMATE_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
				}
			};
			const onSpriteLoad_Factory_Frame_1 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Factory_Frame_1 = PS.spriteImage(image);
					PS.spritePlane(Factory_Frame_1, ANIMATE_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
				}
			};
			const onSpriteLoad_Factory_Frame_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Factory_Frame_2 = PS.spriteImage(image);
					PS.spritePlane(Factory_Frame_2, ANIMATE_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
				}
			};
			const onSpriteLoad_City_Frame_1 = function ( image ) {
				if(image !== PS.ERROR)
				{
					City_Frame_1 = PS.spriteImage(image);
					PS.spritePlane(City_Frame_1, ANIMATE_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
				}
			};
			const onSpriteLoad_City_Frame_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					City_Frame_2 = PS.spriteImage(image);
					PS.spritePlane(City_Frame_2, ANIMATE_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
				}
			};
			const onSpriteLoad_Mooncity_Frame_1 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Mooncity_Frame_1 = PS.spriteImage(image);
					PS.spritePlane(Mooncity_Frame_1, ANIMATE_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
				}
			};
			const onSpriteLoad_Mooncity_Frame_2 = function ( image ) {
				if(image !== PS.ERROR)
				{
					Mooncity_Frame_2 = PS.spriteImage(image);
					PS.spritePlane(Mooncity_Frame_2, ANIMATE_PLANE);

					if(finishedSprites<NUM_SPRITES-1)
					{
						finishedSprites++;
					}
					else
					{
						placeWords(1);
					}
				}
			};

			const createMouse = function ()
			{
				//create sprite for mouse cursor (for detection of pieces)
				mouse = PS.spriteSolid( 1, 1 ); // Create 1x1 solid sprite, save its ID
				PS.spriteSolidColor( mouse, MOUSE_COLOR ); // assign color
				PS.spritePlane( mouse, MOUSE_PLANE ); // Move to assigned plane
				current_cursor = mouse;

				PS.spriteCollide(current_cursor, reporter);

				if(finishedSprites<NUM_SPRITES-1)
				{
					finishedSprites++;
				}
				else
				{
					placeWords(1);
				}
			}


			const animate = function ()
			{
				if(gameComplete)
				{
					if(on_frame_1)
					{
						PS.spriteMove(Frame_1, 0, 0);
						PS.spriteMove(Frame_2, 0, 0);
						PS.spriteShow(Frame_2, false);
						PS.spriteShow(Frame_1, true);
						on_frame_1 = false;
					}
					else
					{
						PS.spriteMove(Frame_1, 0, 0);
						PS.spriteMove(Frame_2, 0, 0);
						PS.spriteShow(Frame_1, false);
						PS.spriteShow(Frame_2, true);
						on_frame_1 = true;
					}
				}


			}

			PS.statusText("Loading...");
			//load word sprites for game usage
			createMouse();
			PS.imageLoad("images/Dash3.png", onSpriteLoad_Dash3);
			PS.imageLoad("images/Dash3.png", onSpriteLoad_Dash3_2);
			PS.imageLoad("images/Dot.png", onSpriteLoad_Dot);
			PS.imageLoad("images/Dot.png", onSpriteLoad_Dot_2);
			PS.imageLoad("images/Square.png", onSpriteLoad_Square);
			PS.imageLoad("images/Square.png", onSpriteLoad_Square_2);
			PS.imageLoad("images/Square.png", onSpriteLoad_Square_3);
			PS.imageLoad("images/Square.png", onSpriteLoad_Square_4);
			PS.imageLoad("images/Square3by4.png", onSpriteLoad_Square3by4);
			PS.imageLoad("images/Square3by4.png", onSpriteLoad_Square3by4_2);
			PS.imageLoad("images/I.png", onSpriteLoad_I);
			PS.imageLoad("images/I.png", onSpriteLoad_I_2);
			PS.imageLoad("images/I.png", onSpriteLoad_I_3);
			PS.imageLoad("images/I.png", onSpriteLoad_I_4);
			PS.imageLoad("images/I3.png", onSpriteLoad_I3);
			PS.imageLoad("images/I3.png", onSpriteLoad_I3_2);
			PS.imageLoad("images/I4.png", onSpriteLoad_I4);
			PS.imageLoad("images/I4.png", onSpriteLoad_I4_2);
			PS.imageLoad("images/I4.png", onSpriteLoad_I4_3);
			PS.imageLoad("images/Dash4.png", onSpriteLoad_Dash4);
			PS.imageLoad("images/Dash4.png", onSpriteLoad_Dash4_2);
			PS.imageLoad("images/Dash.png", onSpriteLoad_Dash);
			PS.imageLoad("images/Dash.png", onSpriteLoad_Dash_2);
			PS.imageLoad("images/Block3by2.png", onSpriteLoad_Block3by2);
			PS.imageLoad("images/Block3by2.png", onSpriteLoad_Block3by2_2);
			PS.imageLoad("images/I5.png", onSpriteLoad_I5);

			PS.imageLoad("images/Frame_1.png", onSpriteLoad_Village_Frame_1);
			PS.imageLoad("images/Frame_2.png", onSpriteLoad_Village_Frame_2);
			PS.imageLoad("images/Factory_Frame_1.png", onSpriteLoad_Factory_Frame_1);
			PS.imageLoad("images/Factory_Frame_2.png", onSpriteLoad_Factory_Frame_2);
			PS.imageLoad("images/City_Frame_1.png", onSpriteLoad_City_Frame_1);
			PS.imageLoad("images/City_Frame_2.png", onSpriteLoad_City_Frame_2);
			PS.imageLoad("images/Mooncity_Frame_1.png", onSpriteLoad_Mooncity_Frame_1);
			PS.imageLoad("images/Mooncity_Frame_2.png", onSpriteLoad_Mooncity_Frame_2);



			timer_ID = PS.timerStart(60, animate);




			PS.dbLogin( "imgd2900", TEAM, function ( id, user )
			{
				if ( user === PS.ERROR ) {
					return;
				}
				PS.dbEvent( TEAM, "startup", user );
				PS.dbSend( TEAM, PS.CURRENT, { discard : true } );
			}, { active : false } );
		},

		touch : function ( x, y )
		{
			PS.gridPlane(WORD_PLANE);
			if(!gameComplete) {
				if (holdingWisdom) {
					PS.spritePlane(current_cursor, WORD_PLANE);
					current_cursor = mouse;
					PS.spriteShow(mouse, true);
					PS.spriteMove(current_cursor, x, y);
					mouse_x = x;
					mouse_y = y;
					holdingWisdom = false;
					PS.audioPlay("fx_click", {volume: 0.5});
					PS.statusText(block_place_text);

					let l, k;
					let correctCount = 0;
					for (k = 0; k < GRID_Y; k++) {
						for (l = 0; l < GRID_X; l++) {
							if (PS.data(l, k) === FILLABLE_MARKER) {
								if (PS.color(l, k) === WORD_COLOR) {
									correctCount++;
								}
							}
						}
					}

					if (correctCount === correct_blocks) {
						endLevel();
					}

				}
				else if (!holdingWisdom) {
					PS.spriteShow(mouse, false);

					if(sprite_hovered_over != null)
					{
						current_cursor = sprite_hovered_over;
						PS.spritePlane(current_cursor, MOUSE_PLANE);
						holdingWisdom = true;
						PS.audioPlay("fx_click", {volume: 0.5});
						PS.statusText(block_pickup_text);
					}

				}
			}
			else
			{
				switch(current_level)
				{
					case 2:
						PS.imageLoad("images/factorystart.gif", onBackgroundLoad, 1);
						break;
					case 3:
						PS.imageLoad("images/citystart.gif", onBackgroundLoad, 1);
						break;
					case 4:
						PS.imageLoad("images/mooncitystart.gif", onBackgroundLoad, 1);
						break;
					default:
						PS.statusText("END");
						break;
				}
			}
		},

		enter : function (x, y)
		{
			PS.spriteMove(current_cursor, x, y);
			PS.spriteShow(current_cursor, true);
			mouse_x = x;
			mouse_y = y;
		},

		exitGrid : function ()
		{
			PS.spriteShow(current_cursor, false);
			PS.spriteMove(current_cursor, -1,-1);
			mouse_x = -5;
			mouse_y = -5;
		}



};
} () );
PS.init = G.init;
PS.touch = G.touch;
PS.enter = G.enter;
PS.exitGrid = G.exitGrid;
PS.keyDown = G.keyDown;