let width = 320;
let height = 240;

let uploadedImage = null;
let isSelectingColor = false;

const toleranceSlider = $("tolerance-slider");
const redSlider = $("#red-slider");
const greenSlider = $("#green-slider") ;
const blueSlider = $("#blue-slider");
const presetSelect = $("#preset-select");
const downloadButton = $("#download-button");
const satSlider = $("#saturation-slider");
const colorBox = $("#color-box");

function setup() {
  createCanvas(width, height).parent("canvas-container");
  pixelDensity = 1;

  const htmlDropzone = select("#dropzone");
  htmlDropzone.dragOver(function () {
    htmlDropzone.addClass("dragover");
  });

  htmlDropzone.dragLeave(function () {
    htmlDropzone.removeClass("dragover");
  });

  htmlDropzone.drop(function (file) {
    uploadedImage = loadImage(file.data);
    htmlDropzone.removeClass("dragover");
  });
}

function draw() {
  background(100);
  if (uploadedImage === null) return;

  let canvasRatio = width / height;

  let imageWidth = uploadedImage.width;
  let imageHeight = uploadedImage.height;
  let imageRatio = imageWidth / imageHeight;

  let w, h;

  if (imageRatio > canvasRatio) {
    w = width;
    h = w / imageRatio;
  } else {
    h = height;
    w = imageRatio * h;
  }

  createCanvas(w, h).parent("canvas-container");
  image(uploadedImage, 0, 0, w, h);
  pixelDensity = 1;

  //filters

  loadPixels();

  
  if(isSelectingColor && mouseInCanvas()){
    
    x = Math.round(mouseX);
    y = Math.round(mouseY);
    
    let index = (y * width + x)*4;  
    
    sc_r = pixels[index+0];
    sc_g = pixels[index+1];
    sc_b = pixels[index+2];
    
    colorBox.css("background-color", `rgb(${sc_r}, ${sc_g}, ${sc_b})`);
    
    mouseClicked();
    
  }
  
  
  if (presetSelect.val() === "grayscale") {
    grayscale(pixels);
  } else if (presetSelect.val() === "bw") {
    bw(pixels);
  } else if (presetSelect.val() === "invert") {
    invert(pixels);
  }
   else if (presetSelect.val() === "saturation") { //este es brillo pero al querer cambiarle los nombres me daba error y ya no me dio tiempo de corregirlo
    satu(pixels);//este es brillo pero al querer cambiarle los nombres me daba error y ya no me dio tiempo de corregirlo
  } else if(presetSelect.val() === "sc"){
    singleColor(pixels);
  } else {
    
    defaultfilter(pixels);  
  }

  updatePixels();
}

///filters///

function singleColor(pixels){
  for (let pixel = 0; pixel < pixels.length / 4; pixel++) {
    let i = pixel * 4;
    
    let tolerance = Number(toleranceSlider.val());
    let difference= Math.abs(pixels [i] - sc_r )+Math.abs(pixels [i+1] - sc_g )+Math.abs(pixels [i+2] - sc_b );
    if(difference < tolerance) continue;
    
    let avg = (pixels[i + 0] + pixels[i + 1] + pixels[i + 2]) / 3;
    pixels[i + 0] = avg;
    pixels[i + 1] = avg;
    pixels[i + 2] = avg;
  }
}

function grayscale(pixels) {
  for (let pixel = 0; pixel < pixels.length / 4; pixel++) {
    let i = pixel * 4;
    let avg = (pixels[i + 0] + pixels[i + 1] + pixels[i + 2]) / 3;
    pixels[i + 0] = avg;
    pixels[i + 1] = avg;
    pixels[i + 2] = avg;
  }
}

function bw(pixels) {
  for (let pixel = 0; pixel < pixels.length / 4; pixel++) {
    let i = pixel * 4;
    let avg = (pixels[i + 0] + pixels[i + 1] + pixels[i + 2]) / 3;

    if (avg > 127) {
      pixels[i + 0] = 255;
      pixels[i + 1] = 255;
      pixels[i + 2] = 255;
    } else {
      pixels[i + 0] = 0;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;
    }
  }
}

/*function redscale(pixels) {

  for (let pixel = 0; pixel < pixels.length / 4; pixel++) {
    let i = pixel * 4;
    //let avg = (pixels[i + 0] + pixels[i + 1] + pixels[i + 2]) / 3;
    pixels[i + 0] =  pixels[i + 0] + pixels[i + 0]; 
    pixels[i + 1] =  pixels[i + 0] + pixels[i + 1];
    pixels[i + 2] =  pixels[i + 0] + pixels[i + 2];
  }
}*/


function invert(pixels) {

  for (let pixel = 0; pixel < pixels.length / 4; pixel++) {
    let i = pixel * 4;
    let avg = (pixels[i + 0] + pixels[i + 1] + pixels[i + 2]) / 3;
    pixels[i + 0] = 255 - pixels[i + 0] ;
    pixels[i + 1] = 255 - pixels[i + 1];
    pixels[i + 2] = 255 - pixels[i + 2];
  }
}

function satu(pixels) {

  
  let sats = Number(satSlider.val());
  
  for (let pixel = 0; pixel < pixels.length / 4; pixel++) {
    let i = pixel * 4;
    //let avg = (pixels[i + 0] + pixels[i + 1] + pixels[i + 2]) / 3;
    
    pixels[i + 0] = pixels[i + 0] + sats; 
    pixels[i + 1] =  pixels[i + 1] + sats;
    pixels[i + 2] =  pixels[i + 2] + sats;
  }
}


function defaultfilter(pixels) {
  let r = Number(redSlider.val());
  let g = Number(greenSlider.val());
  let b = Number(blueSlider.val());
  

  for (let pixel = 0; pixel < pixels.length / 4; pixel++) {
    let i = pixel * 4;
    pixels[i + 0] = pixels[i + 0] + r;
    pixels[i + 1] = pixels[i + 1] + g;
    pixels[i + 2] = pixels[i + 2] + b;
  }
}

//DOWNLOAD///
downloadButton.click(function () {
  uploadedImage.loadPixels();
  //backup pixel values//

  let pixelBackup = [];
  for (let i = 0; i < uploadedImage.pixels.length; i++) {
    pixelBackup.push(uploadedImage.pixels[i]);
  }

  //apply filters//
  if (presetSelect.val() === "grayscale") grayscale(uploadedImage.pixels);
  else if (presetSelect.val() === "bw") bw(uploadedImage.pixels);
  else defaultfilter(uploadedImage.pixels);

  uploadedImage.updatePixels();
  save(uploadedImage, "edit.png");

  //restore image values//
  uploadedImage.loadPixels();
  for (let i = 0; i < uploadedImage.pixels.length; i++) {
    uploadedImage.pixels[i] = pixelBackup[i];
  }
  uploadedImage.updatePixels();
});


//mouse//
function mouseInCanvas(){
  if(mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) return true; 
  else return false;
}

function mouseClicked(){
  if(mouseInCanvas()){ isSelectingColor = false;} 
}

colorBox.click(function(){
  isSelectingColor = true;

});
