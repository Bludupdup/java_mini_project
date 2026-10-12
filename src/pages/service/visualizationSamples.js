/**
 * Sample visualization plans.
 * Temporary: later, Gemini will generate these plans, and its output must
 * follow the same shape (documented in visualizationValidator.js).
 *
 * Each builder runs the real algorithm and records what happens, so the
 * steps are always correct for the input values.
 */

const ROW_SPACING = 1.4;
const LIST_SPACING = 2.2;
const STACK_SPACING = 1.1;
const POINTER_OFFSET = 1.3;

// x position of item `index` when `count` items sit in a row centred on 0.
function rowX(index, count, spacing) {
  return (index - (count - 1) / 2) * spacing;
}

// Collects steps and numbers them step-1, step-2, ...
function createStepList() {
  const steps = [];
  const add = (description, actions = []) => {
    steps.push({ id: `step-${steps.length + 1}`, description, actions });
  };

  return { steps, add };
}

const setState = (targets, state) => ({ type: "setState", targets, state });
const move = (target, position) => ({ type: "move", target, position });

// Puts objects back to "idle". Returns no action when there is nothing to reset.
const resetState = (targets) =>
  targets.length > 0 ? [setState(targets, "idle")] : [];

/** Bubble Sort: compare neighbours, swap when out of order, repeat. */
export function buildBubbleSortPlan(values = [5, 1, 4, 2, 8]) {
  const order = values.map((_, index) => `bar-${index}`);
  const valueOf = Object.fromEntries(
    order.map((id, index) => [id, values[index]]),
  );

  const objects = order.map((id, index) => ({
    id,
    type: "bar",
    label: String(values[index]),
    value: values[index],
    position: [rowX(index, values.length, ROW_SPACING), 0, 0],
  }));

  const { steps, add } = createStepList();
  add(`Start with the unsorted array [${values.join(", ")}].`);

  let previousPair = [];

  for (let pass = 0; pass < values.length - 1; pass += 1) {
    let swapped = false;

    for (let j = 0; j < values.length - pass - 1; j += 1) {
      const left = order[j];
      const right = order[j + 1];
      const a = valueOf[left];
      const b = valueOf[right];
      const compare = [
        ...resetState(previousPair),
        setState([left, right], "compare"),
      ];

      if (a > b) {
        add(`Compare ${a} and ${b}: ${a} is bigger, so they swap.`, compare);
        add(`Swap ${a} and ${b}.`, [
          setState([left, right], "swap"),
          { type: "swap", targets: [left, right] },
        ]);
        order[j] = right;
        order[j + 1] = left;
        swapped = true;
      } else {
        add(`Compare ${a} and ${b}: already in order, no swap.`, compare);
      }

      previousPair = [order[j], order[j + 1]];
    }

    if (!swapped) {
      add(
        "No swaps in this pass, so the array is already sorted.",
        resetState(previousPair),
      );
      break;
    }

    const settled = order[values.length - pass - 1];
    add(`${valueOf[settled]} has bubbled up to its final position.`, [
      ...resetState(previousPair),
      setState([settled], "sorted"),
    ]);
    previousPair = [];
  }

  const sorted = order.map((id) => valueOf[id]);
  add(`Done! The array is sorted: [${sorted.join(", ")}].`, [
    setState(order, "sorted"),
  ]);

  return {
    title: `Bubble Sort on [${values.join(", ")}]`,
    scene: { type: "3d", objects, relationships: [] },
    steps,
  };
}

/** Arrays: linear search, checking one index at a time. */
export function buildLinearSearchPlan(values = [7, 3, 9, 4, 6], target = 4) {
  const cells = values.map((_, index) => `cell-${index}`);
  const xAt = (index) => rowX(index, values.length, ROW_SPACING);
  const pointerAt = (index) => [xAt(index), -POINTER_OFFSET, 0];

  const objects = [
    ...cells.map((id, index) => ({
      id,
      type: "box",
      label: String(values[index]),
      value: values[index],
      position: [xAt(index), 0, 0],
    })),
    { id: "target", type: "label", label: `target = ${target}`, position: [0, 1.6, 0] },
    { id: "i", type: "pointer", label: "i", position: pointerAt(0) },
  ];

  const { steps, add } = createStepList();
  add(`Search for ${target} by checking each element from left to right.`);

  const foundAt = values.indexOf(target);
  const lastChecked = foundAt === -1 ? values.length - 1 : foundAt;

  for (let index = 0; index <= lastChecked; index += 1) {
    const value = values[index];
    const actions =
      index === 0
        ? []
        : [setState([cells[index - 1]], "visited"), move("i", pointerAt(index))];

    add(
      value === target
        ? `Check index ${index}: ${value} matches the target.`
        : `Check index ${index}: ${value} is not ${target}, so keep going.`,
      [...actions, setState([cells[index]], "compare")],
    );
  }

  if (foundAt === -1) {
    add(`${target} is not in the array, so return -1.`, [
      setState([cells[lastChecked]], "visited"),
    ]);
  } else {
    add(`Found ${target} at index ${foundAt}, so return ${foundAt}.`, [
      setState([cells[foundAt]], "found"),
    ]);
  }

  return {
    title: `Linear search for ${target} in [${values.join(", ")}]`,
    scene: { type: "3d", objects, relationships: [] },
    steps,
  };
}

/** Stacks & Queues: push and pop on a stack (last in, first out). */
export function buildStackPlan(
  operations = [
    { op: "push", value: 3 },
    { op: "push", value: 8 },
    { op: "push", value: 5 },
    { op: "pop" },
    { op: "push", value: 1 },
  ],
) {
  // Slot -1 is just below the first item, where "top" points while the stack is empty.
  const slotY = (slot) => slot * STACK_SPACING;
  const topPointerAt = (slot) => [-1.6, slotY(slot), 0];

  const objects = [
    { id: "bottom", type: "label", label: "bottom", position: [0, slotY(-1), 0] },
    { id: "top", type: "pointer", label: "top", position: topPointerAt(-1) },
  ];

  const { steps, add } = createStepList();
  add("The stack starts empty. Items can only be added or removed at the top.");

  const stack = [];
  const valueOf = {};
  let created = 0;

  for (const operation of operations) {
    const previousTop = stack.at(-1);

    if (operation.op === "push") {
      created += 1;
      const id = `item-${created}`;
      valueOf[id] = operation.value;
      stack.push(id);

      add(`Push ${operation.value}: it goes on top of the stack.`, [
        ...resetState(previousTop ? [previousTop] : []),
        {
          type: "add",
          object: {
            id,
            type: "box",
            label: String(operation.value),
            value: operation.value,
            position: [0, slotY(stack.length - 1), 0],
            state: "active",
          },
        },
        move("top", topPointerAt(stack.length - 1)),
      ]);
    } else {
      if (!previousTop) {
        throw new Error("Cannot pop from an empty stack.");
      }

      stack.pop();
      const newTop = stack.at(-1);

      add(`Pop removes ${valueOf[previousTop]}, the last item that was pushed.`, [
        { type: "remove", target: previousTop },
        move("top", topPointerAt(stack.length - 1)),
        ...(newTop ? [setState([newTop], "active")] : []),
      ]);
    }
  }

  const contents = stack.map((id) => valueOf[id]);
  add(
    contents.length > 0
      ? `The stack now holds [${contents.join(", ")}] from bottom to top, with ${contents.at(-1)} on top.`
      : "The stack is empty again.",
  );

  return {
    title: "Stack: push and pop",
    scene: { type: "3d", objects, relationships: [] },
    steps,
  };
}

/** Linked Lists: reverse the list by turning every next pointer around. */
export function buildLinkedListReversalPlan(values = [1, 2, 3]) {
  const nodes = values.map((_, index) => `node-${index + 1}`);
  // A "null" box on each side: the reversed list ends at the left one.
  const slots = ["null-start", ...nodes, "null-end"];
  const labelOf = Object.fromEntries([
    ["null-start", "null"],
    ["null-end", "null"],
    ...nodes.map((id, index) => [id, String(values[index])]),
  ]);

  const xOf = (id) => rowX(slots.indexOf(id), slots.length, LIST_SPACING);
  const below = (id) => [xOf(id), -POINTER_OFFSET, 0];
  const above = (id) => [xOf(id), POINTER_OFFSET, 0];

  const objects = [
    ...slots.map((id) => ({
      id,
      type: id.startsWith("null") ? "label" : "node",
      label: labelOf[id],
      ...(id.startsWith("null") ? {} : { value: values[nodes.indexOf(id)] }),
      position: [xOf(id), 0, 0],
    })),
    { id: "prev", type: "pointer", label: "prev", position: below("null-start") },
    { id: "curr", type: "pointer", label: "curr", position: below(nodes[0]) },
  ];

  const nextOf = (index) => (index + 1 < nodes.length ? nodes[index + 1] : "null-end");
  const relationships = nodes.map((id, index) => ({
    id: `next-${index + 1}`,
    from: id,
    to: nextOf(index),
    label: "next",
  }));

  const { steps, add } = createStepList();
  add(
    `Reverse ${values.join(" → ")} → null by turning every next pointer around.`,
  );

  let prev = "null-start";

  nodes.forEach((curr, index) => {
    const next = nextOf(index);

    add(`Save next = ${labelOf[next]} so the rest of the list isn't lost.`, [
      setState([curr], "active"),
      index === 0
        ? {
            type: "add",
            object: { id: "next", type: "pointer", label: "next", position: above(next) },
          }
        : move("next", above(next)),
    ]);

    add(`Point ${labelOf[curr]}.next back to prev (${labelOf[prev]}).`, [
      { type: "unlink", target: `next-${index + 1}` },
      {
        type: "link",
        relationship: { id: `reversed-${index + 1}`, from: curr, to: prev, label: "next" },
      },
    ]);

    add("Move prev and curr one step forward.", [
      setState([curr], "visited"),
      move("prev", below(curr)),
      move("curr", below(next)),
    ]);

    prev = curr;
  });

  const reversed = [...values].reverse();
  add(
    `curr is null, so prev (${labelOf[prev]}) is the new head: ${reversed.join(" → ")} → null.`,
    [{ type: "remove", target: "next" }, setState([prev], "found")],
  );

  return {
    title: `Reversing the linked list ${values.join(" → ")}`,
    scene: { type: "3d", objects, relationships },
    steps,
  };
}

// Topic id (from data/topics.js) → the sample plan for that topic.
export const samplePlanBuilders = {
  "bubble-sort": buildBubbleSortPlan,
  arrays: buildLinearSearchPlan,
  "stacks-queues": buildStackPlan,
  "linked-lists": buildLinkedListReversalPlan,
};
