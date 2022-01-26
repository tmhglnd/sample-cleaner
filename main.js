// 
// sample-cleaner.js
// 
// written by Timo Hoogland (c) 2022, www.timohoogland.com
// MIT License
// 
// Batch process and convert audio files
// useful for:
// - trimming silence of end of file
// - summing files to mono
// - loudness normalization IBU R128
// 

const fg = require('fast-glob');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');

// input and output paths
let processPath = '';
let outputPath = '';

// default values for options
let thresh = -70;
let ldnm = false;
let mono = false;
let sr = false;
let format = 'wav';
let fadeIn = false;
let fadeOut = false;

// print the arguments and options
function help(){
	console.log(`Arguments:`);
	console.log(`  -> the path to process\n`);

	console.log(`Options:`);
	console.log(`t  -> threshold for silence to strip in dBFS (default=${thresh})`);
	console.log(`m  -> sum to mono (default=${mono})`);
	// console.log("- n -> normalize audio level in dBFS (default=false)");
	console.log(`l  -> loudness normalization level in dBLUFS (default=${ldnm})`);
	console.log(`f  -> output file format (default=${format})`);
	console.log(`sr -> change samplerate in Hz (default=${sr})`);
	console.log(``);
	console.log(`Example:`);
	console.log(`   -> m=1 t=-60 l=-16 f=mp3 sr=48000`);
}

// process arguments and options
if (process.argv.length > 2){
	let args = process.argv.slice(2);

	// is first argument a valid path?
	if (!fs.pathExistsSync(args[0])){
		console.log('Error: not a valid path as first argument\n');
		help();
		process.exit();
	} else {
		processPath = args[0];
	}

	// are there any arguments in the form letter=value or word=value
	for (let a in args){
		let v = args[a].split('=');
		if (v[0] === 'h' || v[0] === 'help' || v[0] === 'man'){
			help();
			process.exit();
		}
		else if (v[0] === 'm'){
			mono = (v[1] > 0);
		}
		else if (v[0] === 't'){
			thresh = v[1];
		}
		else if (v[0] === 'l'){
			ldnm = v[1];
		}
		else if (v[0] === 'f'){
			format = v[1];
		}
		else if (v[0] === 'sr'){
			sr = v[1];
		}
		else if (v[0] === 'o'){
			outputPath = v[1];
		}
		else if (v[0] === 'fi'){
			fadeIn = v[1];
		}
		else if (v[0] === 'fo'){
			fadeOut = v[1];
		}
	}

	// set the outputpath based on processpath 
	// if none is specified via argument
	if (!outputPath){
		outputPath = `${processPath}_processed`;
	}

	if (processPath === outputPath){
		console.log('Error: input and output paths can not be the same\n')
		process.exit();
	}

	// print settings and paths before processing
	console.log(`processing from:\n  ${processPath}\n`);
	console.log(`writing to:\n  ${outputPath}\n`);
	console.log(`Settings:`);
	console.log(`- trim silence threshold: ${thresh}`);
	console.log(`- sum audio to mono: ${mono}`);
	console.log(`- loudness normalization target: ${ldnm}\n`);

	processFiles(processPath);
} else {
	// error if no arguments provided, also show help file
	console.log('Error: please provide arguments\n');
	help();
}

// construct the ffmpeg command
function createCommand(i, o){
	let c = `ffmpeg -i ${i}`;

	// apply filters
	c += ` -af `
	
	// remove silence from start
	c += `silenceremove=start_periods=1:start_duration=0.005:start_threshold=${thresh}dB`;
	// remove silence from end
	c += `:stop_periods=1:stop_duration=0.005:stop_threshold=${thresh}dB`;

	// add loudness normalization
	if (ldnm){
		c += `,loudnorm=i=${ldnm}:tp=-2`;
		// set the samplerate to 44100 if none provided
		// because loudness norm upsamples to 192kHz
		if (!sr){
			sr = 44100;
		}
	}

	// todo: allow for fade-in and fade-out
	// c += `,afade=t=in:d=1s`
	// c += `,afade=t=out:d=1s`

	if (sr || ldnm){
		// change samplerate
		c += ` -ar ${sr}`;
	}
	// convert to mono
	if (mono){
		c += ` -ac 1`;
	}
	// if mp3 also set the bitrate to highest quality
	if (format === 'mp3'){
		c += ` -ab 320k`;
	}
	c += ` ${o}.${format}`;

	return c;
}

function processFiles(p){
	// find all soundfiles with fast-glob
	let glob = path.join(p, '**/*.+(wav|aiff|aif|flac|mp3)');
	let files = fg.sync(glob, { caseSensitiveMatch: false });

	files.forEach((f) => {
		// change the outputpath
		let out = path.join(outputPath, path.relative(processPath, f));
		let outPath = path.parse(out).dir;
		let outFile = path.join(outPath, path.parse(out).name);

		// make sure folder is created
		fs.ensureDir(outPath, (err) => {
			if (err) console.log('Error: folder was not created');
			else {
				fs.stat(`${outFile}.${format}`, (err, stats) => {
					if (!err) {
						console.log('Error: file already exists');
					} else {
						// let stats = exec(`ffprobe ${f} -of json`, (err, stderr, stdout) => {
						// 	if (err) 
						// 		console.log('Error: could not get file info');
						// 	else
						// 		console.log(stdout.match(/Duration: ([^,]+)/)[1]); 
						// });
						let cmd = createCommand(f, outFile);
						// console.log(cmd, '\n');
						exec(cmd, (err, stderr, stdout) => {
							if (err) console.log('Error: processing failed')
							console.log(`stderr: ${stderr}`);
							console.log(`stdout: ${stdout}`);
						});
					}
				});
			}
		});
	});
}
