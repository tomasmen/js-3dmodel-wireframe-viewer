import type { Object3D } from "./types";
import { rotateX, rotateY, translate } from "./math/mat";
import { vec3 } from "./math/vec";
import { clearCanvas, drawModel } from "./renderer";
import { parseObjFile } from "./parser";

const canvas = document.querySelector<HTMLCanvasElement>("#displayCanvas");
const fileInput = document.querySelector<HTMLInputElement>("#fileInput");
const fileStatusDiv = document.querySelector<HTMLDivElement>("#fileStatus")

// const FOREGROUND = "rgba(60, 255, 0, 1)";
// const FPS = 60;
const BACKGROUND = "#000000";
const SCROLL_SENS = 0.05;
const TRANSLATION_SENS = 1 / 7;

let ROTATION_SENS = Math.PI / (canvas ? canvas.width : 1);

if (!canvas) {
  console.log("Couldn't find a canvas element with id 'displayCanvas' to display on.");
}

const ctx = canvas?.getContext("2d");
const scene: Object3D[] = [];

function resizeCanvas(): void {
  const canvasSize = Math.min(window.innerWidth, window.innerHeight) * 0.9;
  const size = canvasSize - Math.max(50, canvasSize * 0.1);

  if (!canvas) return;

  canvas.width = size;
  canvas.height = size;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  ROTATION_SENS = Math.PI / (canvas ? canvas.width : 1);

  updateScene();
}


function updateFileStatus(message: string): void {
  if (!fileStatusDiv) return;
  fileStatusDiv.innerHTML = message;
  setTimeout(clearFileStatus, 3000);
}

function clearFileStatus(): void {
  if (!fileStatusDiv) return;
  fileStatusDiv.innerHTML = "";
}

let draggingTranslation = false;
let draggingRotation = false;
let last = { x: 0, y: 0 }

function getCanvasPos(e: MouseEvent): { x: number, y: number } {
  const r = canvas?.getBoundingClientRect();
  if (!r) return { x: 0, y: 0 };
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function onMouseDown(e: MouseEvent): void {
  if (e.button == 2) draggingTranslation = true;
  if (e.button == 0) draggingRotation = true;
  last = getCanvasPos(e);
}

function onMouseMove(e: MouseEvent): void {
  if (!draggingTranslation && !draggingRotation) return;

  let cur = getCanvasPos(e);
  const dx = cur.x - last.x;
  const dy = cur.y - last.y;
  last = cur;

  if (draggingTranslation) {
    for (let object of scene) {
      object.translation = translate(object.translation, vec3(dx * TRANSLATION_SENS, dy * -1 * TRANSLATION_SENS, 0));
    }
  }

  if (draggingRotation) {
    for (let object of scene) {
      object.rotation = rotateX(object.rotation, -1 * dy * ROTATION_SENS);
      object.rotation = rotateY(object.rotation, -1 * dx * ROTATION_SENS);
    }
  }

  updateScene();
}

function onScroll(e: WheelEvent): void {
  e.preventDefault();
  const dy = e.deltaY;

  for (let object of scene) {
    object.translation = translate(object.translation, vec3(0, 0, -1 * dy * SCROLL_SENS));
  }

  updateScene();
}

async function onInputChange(e: Event): Promise<void> {
  const input = e.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const objects = await parseObjFile(file);

  if (!objects) {
    updateFileStatus("Failed to read .obj file.");
    return;
  }

  for (let object of objects) {
    scene.push(object);
  }

  updateFileStatus("Success!");
  updateScene();
}

function updateScene(): void {
  if (!canvas || !ctx) return;

  clearCanvas(canvas, ctx, BACKGROUND);
  for (let object of scene) {
    drawModel(canvas, ctx, object);
  }
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);
fileInput?.addEventListener("change", onInputChange);
canvas?.addEventListener("mousedown", onMouseDown);
canvas?.addEventListener("mousemove", onMouseMove);
canvas?.addEventListener("mouseup", (e: MouseEvent) => {
  if (e.button == 2) draggingTranslation = false;
  if (e.button == 0) draggingRotation = false;
});
canvas?.addEventListener("wheel", onScroll);
canvas?.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});
