# subscribed-hypercored

Forked from [hypercored](https://github.com/mafintosh/hypercored)

Basically the same thing, but you can set FEED_KEY in your environment
(or in a `.env` file) for a dat archive that contains a simple `feeds` file with a list of feeds (same as hypercored).

Updating the feeds file in the archive will automatically cause any
subscribed-hypercored instance that is following it to sync the new
archives. So you can easily control a fleet of hypercored servers to back up all the dat archives you want!

![Animated demo](subscribed-hypercored.gif)

```
npm install -g subscribed-hypercored
```

Set up a `.env`:

```
FEED_KEY=<dat hex key>
```

Run it:

```
subscribed-hypercored
```

For more info on how to run hypercored:

https://docs.datproject.org/server

## License

MIT
