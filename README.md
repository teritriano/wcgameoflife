# Conway's Game of Life for nodejs

(made by a wolfcat)

## Installation

npm install -g wcgameoflife ('wc' comes from 'w'olf'c'at)

## Usage

### CLI

wcgameoflife [ms for each tick]

Press ctrl+C for exit

### As module

`const gameoflife = require("wcgameoflife");`

When is used as module it exposes the class Universe

* class wcgameoflife.Universe
* new wcgameoflife.Universe (width: number, height: number)

* Universe.run([ms: number, render(state: Buffer): function])

Without parameters the universe will continue if it has been stopped.
Use it with parameters to start running the universe with *ms* milliseconds between each tick
and a render function to display the current tick.

There is a convenient function to render the current state to stdout
*Universe.sdtoutRender*

`universe.run(44, toVideo(buffer, container) => container.render(buffer))`

`universe.run(16, Universe.sdtoutRender)`

* Universe.stop()

Stop the universe

* Universe.stopped() -> Boolean

Check whether the universe has been stopped

* Universe.change(width: number, height: number)

Change the universe dimension.
