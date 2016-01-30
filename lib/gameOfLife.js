/*
The MIT License (MIT)

Copyright (c) 2015 Oscar Triano García <teritriano@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
"use strict";

const defaultMS = 250;
const RESET_CURSOR = "\x1B[H";//set cursor to HOME position
const CLEAR = "\x1B[2J";//clear terminal
const X = 32;//Dead
const O = 79;//Alive

class Universe{
	constructor(width, height){
		this._ms = 0;
		this._width = width;
		this._states = [new Buffer(width*height), new Buffer(width*height)];
		this._current = 0;
		this._next = 1;
		this._interval = null;
		this._draw = null;
	}
	
	run (ms, draw) {
		if (this._interval !== null) return;
		if (typeof ms !== "number" && typeof draw !== "function") {
			this._interval = setInterval(Universe._step, this._ms, this);
			return;
		}
		this._draw = typeof draw !== "function" ? null : draw;
		this._randomizeCurrentState(X, O);
		ms = typeof ms !== "number" ? defaultMS :
		(isNaN(ms) ? defaultMS : ms);
		this._ms = ms;
		this._interval = setInterval(Universe._step, ms, this);
	}
	
	stop () {
		clearInterval(this._interval);
		this._interval = null;
	}
	
	change (width, height) {
		if (width === this.width && height === this.height)return;
		let stopped = this.stopped();
		if (!stopped){
			this.stop();
			stopped = true;
		}
		this._states = [new Buffer(width*height), new Buffer(width*height)];
		this._randomizeCurrentState(X, O);
		this._width = width;
		if (stopped) this.run();
	}
	
	stopped () {
		return this._interval === null;
	}
	
	_tick () {
		let currentState = this._states[this._current];
		let nextState = this._states[this._next];
		const bufferLength = currentState.length;
		const width = this._width;
		for (let i = 0; i < bufferLength; i++){
			nextState[i] = currentState[i] === X ?
			Universe._checkAround(currentState, i, width, O, (count) => count === 3, O, X) :
			Universe._checkAround(currentState, i, width, O, (count) => count < 2 || count > 3, X, O);
		}
	}
	
	static stdoutRender(buffer) {
		let stdout = process.stdout;
		stdout.write(RESET_CURSOR);
		stdout.write(buffer);
	}
	
	_update() {
		this._tick();
		this._current = this._current ? 0 : 1;
		this._next = this._next ? 0 : 1;
		//now 'next' is 'current'
		if (this._draw !== null)this._draw(this._states[this._current]);
	}

	_randomizeCurrentState (value1, value2) {
		const ceil = Math.ceil;
		const random = Math.random;
		let currentState = this._states[this._current];
		const bufferLength = currentState.length;
		for (let i = 0; i < bufferLength; i++){
			let v = ceil(random() * 10) % 2;
			currentState[i] = v === 1 ? value1 : value2;
		}
	}
	
	static _step (universe) {
		universe._update();
	}
	
	static _checkAround (buffer, i, width, value, checkCount, trueValue, falseValue) {
		let count = 0;
		const bufferLength = buffer.length;
		const topLeft = i-width-1;
		const top = i-width;
		const topRight = i-width+1;
		const left = i-1;
		const right = i+1;
		const bottomLeft = i+width-1;
		const bottom = i+width;
		const bottomRight = i+width+1;
		count += topLeft >= 0 && buffer[topLeft] === value ? 1 : 0;
		count += top >= 0 && buffer[top] === value ? 1 : 0;
		count += topRight >= 0 && buffer[topRight] === value ? 1 : 0;
		count += left >= 0 && buffer[left] === value ? 1 : 0;
		count += right < bufferLength && buffer[right] === value ? 1 : 0;
		count += bottomLeft < bufferLength && buffer[bottomLeft] === value ? 1 : 0;
		count += bottom < bufferLength && buffer[bottom] === value ? 1 : 0;
		count += bottomRight < bufferLength && buffer[bottomRight] === value ? 1 : 0;
		return checkCount(count) ? trueValue : falseValue;
	}
	
}

module.exports.Universe = Universe;
