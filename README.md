# subscribed-hypercored

Forked from [hypercored](https://github.com/mafintosh/hypercored)

Basically the same thing, but you can set FEED_KEY in your environment
(or in a `.env` file) for a dat archive that contains a 'feeds' file.

Updating the feeds file in the archive will automatically cause any
subscribed-hypercored instance that is following it to sync the new
archives.

```
npm install -g subscribed-hypercored
```

For more info on how to run hypercored:

https://docs.datproject.org/server

## License

MIT
