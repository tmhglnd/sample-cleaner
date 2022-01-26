# Sample Cleaner

Batch process a folder of samples in different ways with ffmpeg.

# Features

- Recursively process all files in folder (including sub-directories)
- Trim silence from beginning and end of file (custom silence threshold)
- EBU R128 Loudness normalisation (optional and custom target level)
- Sum channels to mono (optional)
- Convert samplerate (optional)
- Convert to various file formats (optional, default = wav)

Example: Trim silence at beginning and end below -60dB, normalize the loudness to -14dBLUFS, sum to mono, change samplerate to 48kHz and convert to mp3

```
npm start <path-to-files> t=-60 l=-14 m=1 sr=48000 f=mp3
```

# Install 

First install `ffmpeg` https://ffmpeg.org/download.html

```
$ git clone https://github.com/tmhglnd/sample-cleaner.git

$ cd sample-cleaner

$ npm install
```

# Usage

By default the converter only trims silence at the beginning and end of the sample. 

```
$ npm start <path-to-directory>
```

## Options

Add various options to the converter in the format of `option=value`. Options can be combined in any order you like. The processing order is: 

1. Trim silence
2. Upsample and normalise (if used)
3. Convert samplerate (if used)
4. Sum to mono (if true)
5. Convert format and output

### help

Print options in the terminal

```
$ npm start
```

### silence

Change the threshold for the silence detection in dbFS (default = `-70`).

```
$ npm start <path> t=-60
```

### format

Change the output format for the file (default = `wav`).

```
$ npm start <path> f=mp3
```

### loudness

Change the integrated loudness normalisation target level in dBLUFS. The TruePeak (tp) is set at maximum -2dBFS. This also upsamples the sound to 192kHz, but automatically downsampled afterwards to 44.1kHz. Change the samplerate with `sr`.

```
$ npm start <path> l=-20
```

### mono

Sum the channels of the file to mono.

```
$ npm start <path> m=1
```

### samplerate

Change the samplerate of the output file in Hz.

```
$ npm start <path> sr=48000
```

### output

Set a custom output directory. By default the output will be stored in the parentfolder of the directory provided. The folder will be renamed to `<folder-to-process>_processed`.

```
$ npm start <path> o=<path-to-output-directory>
```
