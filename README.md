# subscribed-hypercored

Forked from [hypercored](https://github.com/mafintosh/hypercored)

Basically the same thing, but you can set FEED_KEY in your environment
(or in a `.env` file) for a dat archive that contains a simple `feeds` file with a list of feeds (same as hypercored).

Updating the feeds file in the archive will automatically cause any
subscribed-hypercored instance that is following it to sync the new
archives. So you can easily control a fleet of hypercored servers to back up all the dat archives you want!

![Animated demo](subscribed-hypercored.gif)

## Installation

via npm:

```
npm install -g subscribed-hypercored
```

No npm? Download the binary:

```
wget -qO- https://raw.githubusercontent.com/jimpick/subscribed-hypercored/master/download.sh | bash
```

If you are unable to use `npm`, use the binary distribution. The binary includes a copy of node and subscribed-hypercored packaged inside a single file, so you just have to download one file, with no other dependencies needed on your system.

## Usage

Set up a `.env`:

```
FEED_KEY=<dat hex key>
```

Run it:

```
subscribed-hypercored
```

```
Usage: subscribed-hypercored [key?] [options]

    --cwd         [folder to run in]
    --websockets  [share over websockets as well]
    --port        [explicit websocket port]
    --no-swarm    [disable swarming]
```

For more info on how to run hypercored:

https://docs.datproject.org/server

## License

MIT
