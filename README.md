# funda-scraper

A simple node.js script that goes to funda.nl and get the last day(s) of listings and push it to a Telegram chat via the Telegram Bot API.

Read more about it here: https://javascript.plainenglish.io/using-node-js-and-github-action-to-find-a-house-on-the-web-ae03ed64670a

## How to use
1 - Add a search URL with your filters to the array `urls` in the file `main.js` around line 18
2 - Create an `CHAT_ID` and `BOT_API` environment variables with your Telegram Chat ID and Telegram Bot API key. [Check here how to create a Telegram Bot API key](https://core.telegram.org/bots/faq#how-do-i-create-a-bot) and [here how to find chat ID in Telegram](https://www.google.com/search?q=how+to+find+chat+id+in+telegram).

## Using Github Actions
You can simply clone this project and enable Github Actions to your cloned projects and the script will start running every 30 minutes. Don't forget to add the `CHAT_ID` and `BOT_API` environment variables to Github Actions, [check here how to that](https://docs.github.com/en/actions/security-guides/encrypted-secrets).

## License
MIT License

Copyright (c) 2022 blopa

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

