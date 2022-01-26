# Sample Cleaner

Batch process a folder of samples in different ways with ffmpeg.

# Features

- Recursively process all files in folder (including sub-directories)
- Trim silence from beginning and end of file
- EBU R128 Loudness normalisation 
- Sum channels to mono
- Convert samplerate
- Convert to various file formats

Example: Trim silence at beginning and end below -60dB, normalize the loudness to -14dBLUFS, sum to mono, change samplerate to 48kHz and convert to mp3

```
npm start <path-to-files> t=-60 l=-14 m=1 sr=48000 f=mp3
```

# Install 

First install `ffmpeg` https://ffmpeg.org/download.html

```
$ git clone https://github.com/tmhglnd/sample-cleaner.git
$ cd sample-cleaner
```

# Usage

By default the converter only trims silence at the beginning and end of the sample. 

```
$ npm start <path-to-directory>
```

## Options

Add various options to the converter in the format of `option=value`

### help

Print options in the terminal

```
$ npm start
```

### silence

Change the threshold for the silence detection in dbFS (default = `-70`).

```
$ npm start <path-to-directory> t=-60
```

### format

Change the output format for the file (default = `wav`).

```
$ npm start <path-to-directory> f=mp3
```

### loudness

Change the integrated loudness normalisation target level in dBLUFS. The TruePeak (tp) is set at maximum -2dBFS. This also upsamples the sound to 192kHz, but automatically downsampled afterwards to 44.1kHz. Change the samplerate with `sr`.

```
$ npm start <path-to-directory> l=-20
```

### mono

Sum the channels of the file to mono.

```
$ npm start <path-to-directory> m=1
```

### samplerate

Change the samplerate of the output file in Hz.

```
$ npm start <path-to-directory> sr=48000
```
