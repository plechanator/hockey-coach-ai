export const drawRink = (containerId: string, config: string) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 200 100");
  svg.setAttribute("width", "100%");
  svg.style.backgroundColor = "white";
  svg.style.border = "2px solid #0B1C2D";
  svg.style.borderRadius = "8px";

  // Basic Rink Outlines
  const rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("x", "0");
  rect.setAttribute("y", "0");
  rect.setAttribute("width", "200");
  rect.setAttribute("height", "100");
  rect.setAttribute("fill", "none");
  rect.setAttribute("stroke", "#0B1C2D");
  svg.appendChild(rect);

  // Red Line
  const redLine = document.createElementNS(svgNS, "line");
  redLine.setAttribute("x1", "100");
  redLine.setAttribute("y1", "0");
  redLine.setAttribute("x2", "100");
  redLine.setAttribute("y2", "100");
  redLine.setAttribute("stroke", "red");
  redLine.setAttribute("stroke-width", "2");
  svg.appendChild(redLine);

  container.innerHTML = "";
  container.appendChild(svg);
};