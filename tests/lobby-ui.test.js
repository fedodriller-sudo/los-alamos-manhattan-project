import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const source = readFileSync(
  new URL("../js/nightshift.js", import.meta.url),
  "utf8",
);
const render = source.slice(
  source.indexOf("function renderLobby()"),
  source.indexOf("function receive(m)"),
);
function lobby(teams, yourId = "h", started = false) {
  const nodes = new Map();
  const node = () => ({
    hidden: false,
    disabled: false,
    dataset: {},
    className: "",
    textContent: "",
    querySelectorAll: () => [],
    replaceChildren() {},
    append() {},
  });
  const $ = (id) => {
    if (!nodes.has(id)) nodes.set(id, node());
    return nodes.get(id);
  };
  const context = {
    $,
    yourId,
    TEAMS: { personnel: { name: "Personale" }, spies: { name: "Spie" } },
    el: node,
    ownTeam: () => teams[0],
    renderSignaling() {},
    room: {
      hostId: "h",
      mode: "race",
      started,
      players: teams.map((team, i) => ({
        id: i ? "g" : "h",
        name: i ? "Ada" : "Host",
        team,
      })),
    },
  };
  vm.runInNewContext(render + "\nrenderLobby();", context);
  return $;
}
for (const teams of [
  ["personnel"],
  ["personnel", "personnel"],
  ["spies", "spies"],
])
  test(`missing team directs host to invitation: ${teams}`, () => {
    const $ = lobby(teams),
      missing = teams[0] === "personnel" ? "Spie" : "Personale";
    assert.match($("host-help").textContent, new RegExp(`Manca.*${missing}`));
    assert.match($("copy-invite").className, /gold/);
    assert.doesNotMatch($("start-button").className, /gold/);
    assert.equal($("start-button").disabled, true);
  });
test("both teams promote start and leave invite secondary", () => {
  const $ = lobby(["personnel", "spies"]);
  assert.equal($("start-button").disabled, false);
  assert.match($("start-button").className, /gold/);
  assert.doesNotMatch($("copy-invite").className, /gold/);
  assert.doesNotMatch($("copy-signal").className, /gold/);
});
test("guest has no host commands before game and can re-enter an active turn", () => {
  const waiting = lobby(["personnel", "personnel"], "g");
  assert.equal(waiting("start-button").hidden, true);
  assert.equal(waiting("copy-invite").hidden, true);
  assert.match(waiting("host-help").textContent, /Spie/);
  const active = lobby(["personnel", "spies"], "g", true);
  assert.equal(active("start-button").hidden, false);
  assert.equal(active("start-button").disabled, false);
  assert.equal(active("start-button").textContent, "Rientra nel turno");
});
