import fs from "fs";
const graph = JSON.parse(fs.readFileSync("generated/graph_edges.json", "utf8"));
const nodes = Object.keys(graph);

const visited = new Set();
const comps = [];

for (const start of nodes) {
  if (!visited.has(start)) {
    const comp = [];
    const q = [start];
    visited.add(start);
    comp.push(start);
    while(q.length > 0) {
      const u = q.shift()!;
      for(const e of graph[u] || []) {
        if (!visited.has(e.to)) {
          visited.add(e.to);
          q.push(e.to);
          comp.push(e.to);
        }
      }
    }
    comps.push(comp);
  }
}

const smallComp = comps.find(c => c.length < 100 && c.length > 1) || [];
const stops = JSON.parse(fs.readFileSync("generated/optimized_stops.json", "utf8"));
const smallNames = smallComp.map(id => {
  const s = stops.find((x: any) => x.stop_id === id);
  return s ? s.stop_name : id;
});
console.log("Disconnected stations:", smallNames);
