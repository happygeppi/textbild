const N = 64;

const html = {
  container: document.getElementById("container"),
  rows: [],
  chars: [],
};

const chars = [
  ".",
  ",",
  "'",
  "-",
  "_",
  "*",
  ":",
  ";",
  "+",
  "<",
  ">",
  "!",
  "|",
  "/",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  "?",
  "$",
  "&",
  "%",
  "#",
];

const $ = (id) => document.getElementById(id);
const $$ = (q) => document.querySelectorAll(q);

let TEXT;

function Init() {
  CreateHTML();
  LoadImage();
}

function CreateHTML() {
  html.container.style.setProperty("--num", N);

  for (let j = 0; j < N; j++) {
    const Row = document.createElement("div");
    Row.classList.add("row");
    html.container.append(Row);
    html.rows.push(Row);
    html.chars.push([]);

    for (let i = 0; i < N; i++) {
      const Char = document.createElement("div");
      Char.classList.add("char");
      Row.append(Char);
      html.chars[j].push(Char);

      Char.innerHTML = chars[Math.floor(Math.random() * chars.length)];
    }
  }
}

function LoadImage() {
  const url = "https://www.happygeppi.github.io/textbild/dynamo.png";
  
  fetch(url)
  .then((response) => response.blob())
  .then((blob) => {
    const file = new File([blob], url.split("/").pop(), {
      type: blob.type,
    });

    const dataTransfer = new DataTransfer();

    dataTransfer.items.add(file);

    $("file-input").files = dataTransfer.files;
  })
  .catch((error) => {
    console.error(error);
  });
}

function ProcessImage(pixels) {
  pixels = DownSize(pixels);
  TEXT = GetText(pixels);
  UpdateHTML(TEXT);
}

function DownSize(pixels) {
  // bring image to size N x N
  const imgSize = { w: pixels[0].length, h: pixels.length };
  const groupSize = {
    w: Math.ceil(imgSize.w / N),
    h: Math.ceil(imgSize.h / N),
  };

  const smaller = [];

  for (let j = 0; j < N; j++) {
    smaller.push([]);

    for (let i = 0; i < N; i++) {
      let brightness = 0;

      for (let y = 0; y < groupSize.h; y++) {
        for (let x = 0; x < groupSize.w; x++) {
          const index = i * groupSize.w + x;
          const jndex = j * groupSize.h + y;
          if (index >= imgSize.w || jndex >= imgSize.h) break;
          const pixel = pixels[jndex][index];
          brightness += (pixel.r + pixel.g + pixel.b) / 3;
        }
      }

      let numPixels = groupSize.w * groupSize.h;
      if (i == N - 1 && j == N - 1) {
        numPixels =
          (imgSize.w - N * groupSize.w) * (imgSize.h - N * groupSize.h);
      } else if (i == N - 1) {
        numPixels = (imgSize.w - N * groupSize.w) * groupSize.h;
      } else if (j == N - 1) {
        numPixels = groupSize.w * (imgSize.h - N * groupSize.h);
      }

      if (numPixels === 0) numPixels = groupSize.w * groupSize.h;

      brightness /= Math.abs(numPixels);
      smaller[j].push(brightness);
    }
  }

  return smaller;
}

function GetText(pixels) {
  // for each pixel get brightness and corresponding char
  let text = [];

  for (let j = 0; j < N; j++) {
    text.push([]);
    for (let i = 0; i < N; i++) {
      const char = Math.floor((pixels[j][i] / 256) * chars.length);
      if (char > chars.length - 1 || char < 0) console.log(pixels[j][i], j, i);

      text[j].push(chars[char]);
    }
  }

  return text;
}

function UpdateHTML(text) {
  // for each row for each char ...
  for (let j = 0; j < N; j++)
    for (let i = 0; i < N; i++) html.chars[j][i].innerHTML = text[j][i];
}

function SaveText() {
  let text = "";

  for (const row of TEXT) {
    for (const char of row) text += char;
    text += "\n";
  }

  const a = document.createElement("a");
  const file = new Blob([text]);
  a.href = URL.createObjectURL(file);
  a.download = "textbild.txt";
  a.click();
}

document.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    e.preventDefault();
    $("file-input").click();
  }
  if (e.key == "s") SaveText();
});

$("file-input").addEventListener("change", () => {
  const selectedFile = $("file-input").files[0];

  console.log(selectedFile);

  if (selectedFile && selectedFile.type.startsWith("image")) {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const pixelArray = [];

      for (let y = 0; y < img.height; y++) {
        pixelArray.push([]);
        for (let x = 0; x < img.width; x++) {
          const index = 4 * (y * img.width + x);
          const r = imageData.data[index + 0];
          const g = imageData.data[index + 1];
          const b = imageData.data[index + 2];
          pixelArray[y].push({ r, g, b });
        }
      }

      // console.log(pixelArray);
      ProcessImage(pixelArray);
    };

    img.src = URL.createObjectURL(selectedFile);
  }
});

Init();
