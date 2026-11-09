// DATI
let data;
let rivers = [];       // un oggetto per ogni fiume
let maxLength = 0;     // lunghezza massima (serve per le scale)
let maxDischarge = 0;  // portata massima (serve per le scale)
let selected = -1;     // fiume cliccato (-1 = nessuno)

// LAYOUT
let margin = 20;
let panelW = 300;      // larghezza del pannello a sinistra
let cols = 10;         // glifi per riga

// COLORE = CONTINENTE
let colorScale = {
  'Africa': '#EDA966',
  'Asia': '#ED66ED',
  'Europe': '#66A9ED',
  'North America': '#4CC94C',
  'South America': '#E04B4B',
  'Oceania': '#E6C619',
  'Australia': '#26B8B0',
};

async function setup() {
  createCanvas(windowWidth, windowHeight);

  // Carica il CSV (la prima riga contiene i nomi delle colonne)
  myTable = await loadTable("assets/rivers_world.csv", ",", "header");

  for (let i = 0; i < myTable.getRowCount(); i++) {
    let river = {
      name: myTable.getString(i, "name"),
      continent: myTable.getString(i, "continent"),
      length: myTable.getNum(i, "length"),
      discharge: myTable.getNum(i, "discharge"),
      // "Russia, Mongolia" -> 2 paesi
      countries: myTable.getString(i, "countries").split(",").length,
    };
    rivers.push(river);

    if (river.length > maxLength) maxLength = river.length;
    if (river.discharge > maxDischarge) maxDischarge = river.discharge;
  }
}

function draw() {
  background(245);

  let rows = ceil(rivers.length / cols);
  let cell = min((width - panelW - 2 * margin) / cols, (height - 2 * margin) / rows);
  let gridX = panelW + margin;
  let gridY = margin;

  let hovered = -1;

  for (let i = 0; i < rivers.length; i++) {
    // Centro della cella del glifo i
    let cx = gridX + (i % cols) * cell + cell / 2;
    let cy = gridY + floor(i / cols) * cell + cell / 2;

    // Rollover: il mouse è vicino al centro del glifo?
    if (dist(mouseX, mouseY, cx, cy) < cell / 2) {
      hovered = i;
    }

    // Sfondo chiaro dietro il glifo selezionato o in rollover
    if (i == hovered || i == selected) {
      noStroke();
      fill(225);
      circle(cx, cy, cell);
    }

    drawGlyph(rivers[i], cx, cy, cell / 2);
  }

  drawPanel();

  // Nome del fiume accanto al mouse
  if (hovered != -1) {
    noStroke();
    fill(0);
    textAlign(LEFT, TOP);
    textSize(12);
    text(rivers[hovered].name, mouseX + 10, mouseY + 10);
  }
}

// Un glifo = un fiume
function drawGlyph(river, cx, cy, maxR) {
  // Disco: raggio = lunghezza
  let R = map(river.length, 0, maxLength, maxR * 0.2, maxR * 0.7);
  // Nucleo: raggio = portata (radice quadrata per ridurre le differenze)
  let r = map(sqrt(river.discharge), 0, sqrt(maxDischarge), 2, R);

  noStroke();

  // Disco trasparente
  let c = color(colorScale[river.continent]);
  c.setAlpha(120);
  fill(c);
  circle(cx, cy, R * 2);

  // Nucleo pieno
  fill(colorScale[river.continent]);
  circle(cx, cy, r * 2);

  // Raggi: uno per ogni paese attraversato
  stroke(colorScale[river.continent]);
  strokeWeight(2);
  for (let k = 0; k < river.countries; k++) {
    let angle = (TWO_PI / river.countries) * k - HALF_PI;
    line(
      cx + cos(angle) * (R + 2), cy + sin(angle) * (R + 2),
      cx + cos(angle) * maxR * 0.95, cy + sin(angle) * maxR * 0.95
    );
  }
}

// Titolo, legenda e dettaglio del fiume cliccato
function drawPanel() {
  let x = margin;
  let y = margin;

  noStroke();
  fill(0);
  textAlign(LEFT, TOP);

  textSize(24);
  text("I fiumi del mondo", x, y);
  y += 34;

  textSize(12);
  text("Un glifo per ognuno dei 100 fiumi", x, y);
  y += 36;

  // Legenda colori
  text("COLORE = continente", x, y);
  y += 20;
  let names = Object.keys(colorScale);
  for (let i = 0; i < names.length; i++) {
    fill(colorScale[names[i]]);
    circle(x + 6, y + 7, 12);
    fill(0);
    text(names[i], x + 20, y);
    y += 18;
  }
  y += 14;

  // Legenda forme
  text("DISCO = lunghezza del fiume", x, y);
  y += 20;
  text("NUCLEO PIENO = portata", x, y);
  y += 20;
  text("RAGGI = numero di paesi attraversati", x, y);
  y += 30;

  fill(100);
  text("Passa il mouse: nome del fiume", x, y);
  y += 18;
  text("Clicca un glifo: dettagli", x, y);
  y += 36;

  // Dettagli del fiume selezionato
  if (selected != -1) {
    let r = rivers[selected];
    fill(0);
    textSize(14);
    text(r.name.substring(0, 28), x, y);
    textSize(12);
    y += 22;
    text("Continente: " + r.continent, x, y);
    y += 18;
    text("Lunghezza: " + r.length + " km", x, y);
    y += 18;
    text("Portata: " + r.discharge + " m³/s", x, y);
    y += 18;
    text("Paesi attraversati: " + r.countries, x, y);
  }
}

// Click: seleziona il glifo sotto il mouse (o nessuno se clicchi nel vuoto)
function mousePressed() {
  let rows = ceil(rivers.length / cols);
  let cell = min((width - panelW - 2 * margin) / cols, (height - 2 * margin) / rows);

  selected = -1;
  for (let i = 0; i < rivers.length; i++) {
    let cx = panelW + margin + (i % cols) * cell + cell / 2;
    let cy = margin + floor(i / cols) * cell + cell / 2;
    if (dist(mouseX, mouseY, cx, cy) < cell / 2) {
      selected = i;
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}