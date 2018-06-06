Simple example tracking the fluctuations in bitcoin prices between April 2013 and February 2018 using p5js

## Data

Bitcoin data was taken from the Kaggle dataset, [Cryptocurrency Historical Prices](https://www.kaggle.com/sudalairajkumar/cryptocurrencypricehistory). 
A simple python script was written to compute the one-day delta in closing price.

Audio samples were downloaded from [http://soundbible.com/](http://soundbible.com/). 


## Code

Code was shameleslly modified from the original [workshop github repo](https://github.com/handav/workshop).


## Creating a local server

There are many different ways to create a [local server](https://github.com/processing/p5.js/wiki/Local-server). Here are some:

If you use node and npm you can install `live-server`: 
```zsh
npm install -g live-server
```
And then run from the root:
```
live-server
```
If you use python 2:
```zsh
python -m SimpleHTTPServer
```
In python 3
```
python3 -m http.server
```

Then, in the browser of your choice (we'll be using Chrome), navigate to http://localhost:8000/ in your url bar.