var samples = [];
var buffer = [];
var BUFFER_LENGTH = 20; 
var iterateTime = 250;
// Dimensions for visualization
var canvas_width = 1000;
var canvas_height = 500;
var canvas_padding = 100;

// Initialize sounds
// All sound clips downloaded from this source: 
// http://soundbible.com/
var currentSound;
var soundClips = [{'trigger': 'gain', 'file': 'yay.m4a', 'sound': null}, 
  {'trigger': 'loss', 'file': 'sad_trombone.m4a', 'sound': null}, 
  {'trigger': 'record_high', 'file': 'applause.m4a', 'sound': null}, 
  {'trigger': 'record_low', 'file': 'flush.m4a', 'sound': null}];


var data_lims = {'min_global' : Infinity, 'max_global' : -Infinity, 
  'min_local' : Infinity, 'max_local' : -Infinity,
  'max_pos' : 0, 'max_neg' : 0 };

function roundNumber(x) { 
  return Math.round(x * 100) / 100.0
}

function preload() {
  /* Data is the daily closing price of Bitcoin slightly modified from the Kaggle dataset: 
  https://www.kaggle.com/sudalairajkumar/cryptocurrencypricehistory
  */
  table = loadTable('../data/bitcoin_price_converted.csv', 'csv', function(success){
    console.log('success');
  }, function(err){
    console.log(err);
  });

  for (var i =0; i < soundClips.length; i++) {
    var filename = 'samples3/trimmed/' + soundClips[i].file ;
    console.log('loaded file ' + filename)
    soundClips[i].sound = loadSound(filename);
  }
}

function setup() {
  all_sightings = table.getRows();
  createCanvas(canvas_width, canvas_height);
  nextRow(0);
  textAlign(CENTER);
}


function toggleSounds(current, previous) {
  console.log('current: ' + current + ', previous = ' + previous);
  console.log(soundClips);
  //soundClips[0].sound.play();
  if (!current | (current == previous)) {
    console.log('No change or current does not exist');
    return null;
  } else {
    console.log('Updating current trigger to : ' + current + ' from ' + previous);
    currentSound = current;
    for (var i = 0; i < soundClips.length; i++) {
      console.log('i = ' + i + ': ' + soundClips[i].trigger);
      if (soundClips[i].trigger == currentSound) {
        if (!soundClips[i].sound.isPlaying()) {
          soundClips[i].sound.play();  
        }
        if (!soundClips[i].sound.isLooping()) {
          soundClips[i].sound.setLoop(true);
        }
      } else if (soundClips[i].sound.isPlaying() ){
        soundClips[i].sound.stop();
      }
    }
  }

}

function drawToScreen(i){
  background(0, 0, 40);
  textSize(18);
  let changeDirn = all_sightings[i]['arr'][8];
  if (changeDirn >= 0)  {
    fill(0, 180, 0);
    noStroke();
  } else {
    fill(240, 0, 0);
    noStroke();
  }
  let displayText = all_sightings[i]['arr'][0] + ' ' + all_sightings[i]['arr'][4] + ' (' + roundNumber(all_sightings[i]['arr'][7]) + '%)';
  // let displayText = 'row ' + i;
  // let displayText = cleanText(all_sightings[i]['arr'][7]);
  // Show date

  // Show price

  // Show change

  // Anything special? 

  text(displayText, 350, 100, 300, 300);

}

function updateBuffer(i) {
  if (buffer.length < BUFFER_LENGTH) {
    buffer.push(parseFloat(all_sightings[i]['arr'][4]));
  } else {
    buffer.shift();
    buffer.push(parseFloat(all_sightings[i]['arr'][4]));
  }
}
// Map actual values to points on the screen
function mapVal(val, min, max, range, padding) {
  var newVal = padding + (val+1) * (range - 2*padding) / (max + 1 - min);
  return newVal;  
}
function mapValY(val, min, max, range, padding) {
  var newVal = padding + ((max - val) * (range - 2*padding) / (max - min));
  return newVal;  
}
function drawPoints(buffer_arr) {
  var ymin = min(buffer_arr); 
  var ymax = max(buffer_arr); 

  var xmin = 0; 
  var xmax = buffer_arr.length;
  var x, x0;
  var y, y0;

  if (ymax > ymin) {
    for (var i =0; i<buffer_arr.length; i++){
      x = mapVal(i, xmin, xmax, canvas_width, 2*canvas_padding);
      y = mapValY(buffer_arr[i], ymin, ymax, canvas_height, 2*canvas_padding);
      // console.log('max =' + ymax + 'min = ' + ymin + ' actual = ' + buffer_arr[i] + ' mapped' + y);
      // console.log('Point: (' + x, ', ', y, ')')
      noStroke();
      
      if (i > 0) {
        x0 = mapVal(i-1, xmin, xmax, canvas_width, 2*canvas_padding);
        y0 = mapValY(buffer_arr[i-1], ymin, ymax, canvas_height, 2*canvas_padding);
        if (y < y0) {
          stroke(0, 180, 0);
          fill(0, 180, 0);
        } else {
          stroke(240, 0, 0);
          fill(240, 0, 0);
        }
        ellipse(x, y, 20, 20)
        line(x0, y0, x, y)
      } else {
        ellipse(x, y, 20, 20)
      }
    }  
  }  
}

function nextRow(i){
  updateBuffer(i);

  // Visualization
  drawToScreen(i);
  if (buffer) {
    drawPoints(buffer, i);  
  }
  let price = all_sightings[i]['arr'][4];
  console.log(all_sightings[i]);

  // let next_dirn = all_sightings[i+1]['arr'][8];
  // Map the relative magnitude of change to volume:
  var new_max;
  
  // Update local min and max 
  if (price > data_lims['max_global']) {
    data_lims['max_global'] = price;
    new_max = true; 
  } else if (price < data_lims['min_global']) {
    data_lims['min_global'] = price;  
    new_max = true; 
  } else {
    new_max = false;
  }
  var dirn;
  // Determine the direction of the change: 
  if (i >= 1) {
    // Use the previous change since playing the sound will be lagged by a cycle
    dirn = all_sightings[i-1]['arr'][7]; 
    /*dirn = all_sightings[i]['arr'][7]; */
  } else {
    dirn = +1.0; 
  }

  setTimeout(function(){

    
    let rel_change = Math.abs(dirn) / price;
    rel_change = (rel_change >= 1) ? 1.0 : rel_change; 
    console.log('i = ' + i + ', change = ' + dirn + ' (' +  100 * rel_change + '%)');
    // decide what to do with the sounds:
    var soundTrigger; 
    
    if (dirn >= 0 & (new_max == true)) { 
      soundTrigger = 'record_high';
    } else if (dirn >= 0 ) {
      soundTrigger = 'gain';
    } else if (dirn < 0 & (new_max == true)) { 
      soundTrigger = 'record_low';
    } else {
      soundTrigger = 'loss';
    }
    console.log('soundTrigger = ' + soundTrigger + ', currentSound = ' + currentSound);
    var prevTrigger = currentSound;
    toggleSounds(soundTrigger, prevTrigger);


    if (i  < all_sightings.length){
      nextRow(i+1);
    }
  }, iterateTime)
}