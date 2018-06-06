var samples = [];
var buffer = [];
var BUFFER_LENGTH = 20; 
var iterateTime = 2000;
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

var files_good = ['car_driving_away1.m4a', 'bull.m4a'];
var files_bad = ['flush.m4a', 'bear.m4a'];
var files_newhigh = ['applause.m4a'];
var files_newlow = ['sad_trombone.m4a'];
var samples_good = [];
var samples_bad = [];
var samples_newhigh = [];
var samples_newlow = [];

var data_lims = {'min_global' : Infinity, 'max_global' : -Infinity, 
  'min_local' : Infinity, 'max_local' : -Infinity,
  'max_pos' : 0, 'max_neg' : 0 };

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

  for (var i =0; i<files_good.length; i++){
    var filename = 'samples3/trimmed/' + files_good[i] ;
    var s = loadSound(filename);
    samples_good.push(s);
  }
  for (var i =0; i<files_bad.length; i++){
    var filename = 'samples3/trimmed/' + files_bad[i] ;
    console.log('loaded ' + filename);
    var s = loadSound(filename);
    samples_bad.push(s);
  }
  for (var i =0; i<files_newhigh.length; i++){
    var filename = 'samples3/trimmed/' + files_newhigh[i] ;
    console.log('loaded ' + filename);
    var s = loadSound(filename);
    samples_newhigh.push(s);
  }
  for (var i =0; i<files_newlow.length; i++){
    var filename = 'samples3/trimmed/' + files_newlow[i] ;
    console.log('loaded ' + filename);
    var s = loadSound(filename);
    samples_newlow.push(s);
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

function cleanText(text){
  text = text.replace(new RegExp("&#44", 'g'), ",");
  text = text.replace(new RegExp("&#39", 'g'), "'");
  text = text.replace(new RegExp("&amp;", 'g'), "&");
  text = text.replace(new RegExp("&#33", 'g'), "!");
  text = text.replace(new RegExp("&#8217", 'g'), "\'");
  text = text.replace(new RegExp("&#8230", 'g'), "...");
  text = text.replace(new RegExp("&quot;", 'g'), "\"");
  return text.trim();
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
  let displayText = all_sightings[i]['arr'][1] + ' ' + all_sightings[i]['arr'][5] + ' (' + all_sightings[i]['arr'][8] + '%)';
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
    buffer.push(parseFloat(all_sightings[i]['arr'][5]));
  } else {
    buffer.shift();
    buffer.push(parseFloat(all_sightings[i]['arr'][5]));
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

  drawToScreen(i);
  if (buffer) {
    drawPoints(buffer, i);  
  }
  let xpoint = all_sightings[i]['arr'][0];
  let price = all_sightings[i]['arr'][5];
  let dirn = all_sightings[i]['arr'][8];
  let next_dirn = all_sightings[i+1]['arr'][8];
  // Map the relative magnitude of change to volume:
  var new_max;
  let rel_change = Math.abs(dirn) / price;
  rel_change = (rel_change >= 1) ? 1.0 : rel_change; 


  console.log('x = ' + xpoint + ', change = ' + dirn + ' (' +  100 * rel_change + '%)');
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
  
  setTimeout(function(){

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
    // samples_good[1].play(); // just make sure we can still play a sound
    // samples_good[1].play();

    // if (dirn >= 0 & (new_max == true)) { 
    //   samples_newhigh[0].play();
    //   console.log('new high :)');
    //   samples_good[0].stop();
    //   samples_good[1].stop();
    //   samples_bad[0].stop();
    //   samples_bad[1].stop();
    //   samples_newlow[0].stop();
    // } else if (dirn >= 0 ) {
    //   // samples_good[index].setVolume(0.05);
    //   samples_good[0].play();
    //   samples_good[1].stop();
    //   samples_newhigh[0].stop();
    //   samples_bad[0].stop();
    //   samples_bad[1].stop();
    //   samples_newlow[0].stop();
    // } else if (dirn < 0 & (new_max == true)) { 
    //   samples_newlow[0].play();
    //   samples_bad[0].stop();
    //   samples_bad[1].stop();
    //   samples_good[0].stop();
    //   samples_good[1].stop();
    //   samples_newhigh[0].stop()
    // } else {
    //   let index = i % samples_bad.length;
    //   //samples_good[index].setVolume(rel_change);
    //   // samples_good[index].setVolume(0);
    //   samples_bad[0].play();
    //   samples_good[0].stop();
    //   samples_good[1].stop();
    //   samples_newlow[0].stop();
    //   samples_newhigh[0].stop();
    // }
    if (i + 1 < all_sightings.length){
      nextRow(i+1);
    }
  }, iterateTime)
}