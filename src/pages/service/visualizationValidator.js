/**
 * Visualization Plan Validator
 *
 * Plans will later come from Gemini, so nothing in them is trusted:
 * every field is type-checked, and the steps are replayed against the
 * scene so an action can never point at an object that does not exist
 * at that moment.
 *
 * Plan shape:
 *   {
 *     title: string,
 *     topic: string,
 *     scene: {
 *       type: "3d" | "2d",
 *       objects: [{ id, type, label, value?, position: [x, y, z], state? }],
 *       relationships: [{ id, from, to, label? }],
 *     },
 *     steps: [{ id, description, actions: [...] }],
 *     metadata?: object,
 *   }
 *
 * Actions, applied in order within a step:
 *   { type: "setState", targets: [id, ...], state }
 *   { type: "swap", targets: [id, id] }          exchange two objects' positions
 *   { type: "move", target: id, position: [x, y, z] }
 *   { type: "add", object: { ...same as scene.objects } }
 *   { type: "remove", target: id }
 *   { type: "link", relationship: { id, from, to, label? } }
 *   { type: "unlink", target: relationshipId }
 */

export const SCENE_TYPES = ["3d", "2d"];
export const OBJECT_TYPES = ["bar", "box", "node", "pointer", "label"];
export const OBJECT_STATES = [
  "idle",
  "active",
  "compare",
  "swap",
  "sorted",
  "found",
  "visited",
];
export const ACTION_TYPES = [
  "setState",
  "swap",
  "move",
  "add",
  "remove",
  "link",
  "unlink",
];

const MAX_OBJECTS = 100;
const MAX_STEPS = 300;

const isRecord = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isText = (value) => typeof value === "string" && value.trim() !== "";
const isPosition = (value) =>
  Array.isArray(value) && value.length === 3 && value.every(Number.isFinite);
const oneOf = (list) => `must be one of: ${list.join(", ")}`;

/**
 * Returns { valid, errors }. Each error names where the problem is,
 * e.g. 'steps[4].actions[1].target: no object "bar-9" exists at this step'.
 */
export function validateVisualizationPlan(plan) {
  const errors = [];
  const report = (path, message) => {
    errors.push(`${path}: ${message}`);
  };
  const result = () => ({ valid: errors.length === 0, errors });

  if (!isRecord(plan)) {
    report("plan", "must be an object");
    return result();
  }

  if (!isText(plan.title)) report("title", "must be a non-empty string");
  if (!isText(plan.topic)) report("topic", "must be a non-empty string");
  if (plan.metadata !== undefined && !isRecord(plan.metadata)) {
    report("metadata", "must be an object");
  }

  const { scene, steps } = plan;

  if (!isRecord(scene)) {
    report("scene", "must be an object");
    return result();
  }

  if (!SCENE_TYPES.includes(scene.type)) {
    report("scene.type", oneOf(SCENE_TYPES));
  }

  // Without these lists there is nothing to replay, so stop here.
  if (!Array.isArray(scene.objects)) report("scene.objects", "must be an array");
  if (!Array.isArray(scene.relationships)) {
    report("scene.relationships", "must be an array");
  }
  if (!Array.isArray(steps)) report("steps", "must be an array");
  if (errors.some((error) => /^(scene\.objects|scene\.relationships|steps):/.test(error))) {
    return result();
  }

  // What exists right now while the steps are replayed.
  const liveObjects = new Set();
  const liveRelationships = new Map();
  let peakObjects = 0;

  function checkTarget(id, path) {
    if (!isText(id)) {
      report(path, "must be an object id");
    } else if (!liveObjects.has(id)) {
      report(path, `no object "${id}" exists at this step`);
    }
  }

  function addObject(object, path) {
    if (!isRecord(object)) {
      report(path, "must be an object");
      return;
    }

    if (!OBJECT_TYPES.includes(object.type)) {
      report(`${path}.type`, oneOf(OBJECT_TYPES));
    }
    if (typeof object.label !== "string") {
      report(`${path}.label`, "must be a string");
    }
    if (object.type === "bar" && !Number.isFinite(object.value)) {
      report(`${path}.value`, "bars need a number for their height");
    } else if (object.value !== undefined && !Number.isFinite(object.value)) {
      report(`${path}.value`, "must be a finite number");
    }
    if (!isPosition(object.position)) {
      report(`${path}.position`, "must be [x, y, z] with finite numbers");
    }
    if (object.state !== undefined && !OBJECT_STATES.includes(object.state)) {
      report(`${path}.state`, oneOf(OBJECT_STATES));
    }

    if (!isText(object.id)) {
      report(`${path}.id`, "must be a non-empty string");
    } else if (liveObjects.has(object.id)) {
      report(`${path}.id`, `"${object.id}" is already used by another object`);
    } else {
      liveObjects.add(object.id);
      peakObjects = Math.max(peakObjects, liveObjects.size);
    }
  }

  function addRelationship(relationship, path) {
    if (!isRecord(relationship)) {
      report(path, "must be an object");
      return;
    }

    checkTarget(relationship.from, `${path}.from`);
    checkTarget(relationship.to, `${path}.to`);
    if (relationship.label !== undefined && typeof relationship.label !== "string") {
      report(`${path}.label`, "must be a string");
    }

    if (!isText(relationship.id)) {
      report(`${path}.id`, "must be a non-empty string");
    } else if (liveRelationships.has(relationship.id)) {
      report(
        `${path}.id`,
        `"${relationship.id}" is already used by another relationship`,
      );
    } else {
      liveRelationships.set(relationship.id, relationship);
    }
  }

  function applyAction(action, path) {
    if (!isRecord(action)) {
      report(path, "must be an object");
      return;
    }

    switch (action.type) {
      case "setState":
        if (!Array.isArray(action.targets) || action.targets.length === 0) {
          report(`${path}.targets`, "must be a non-empty array of object ids");
        } else {
          action.targets.forEach((id, index) =>
            checkTarget(id, `${path}.targets[${index}]`),
          );
        }
        if (!OBJECT_STATES.includes(action.state)) {
          report(`${path}.state`, oneOf(OBJECT_STATES));
        }
        break;

      case "swap":
        if (!Array.isArray(action.targets) || action.targets.length !== 2) {
          report(`${path}.targets`, "must be exactly two object ids");
        } else if (action.targets[0] === action.targets[1]) {
          report(`${path}.targets`, "cannot swap an object with itself");
        } else {
          action.targets.forEach((id, index) =>
            checkTarget(id, `${path}.targets[${index}]`),
          );
        }
        break;

      case "move":
        checkTarget(action.target, `${path}.target`);
        if (!isPosition(action.position)) {
          report(`${path}.position`, "must be [x, y, z] with finite numbers");
        }
        break;

      case "add":
        addObject(action.object, `${path}.object`);
        break;

      case "remove": {
        checkTarget(action.target, `${path}.target`);

        const attached = [...liveRelationships.values()]
          .filter(({ from, to }) => from === action.target || to === action.target)
          .map(({ id }) => `"${id}"`);

        if (attached.length > 0) {
          report(
            `${path}.target`,
            `"${action.target}" is still linked by ${attached.join(", ")}; unlink it first`,
          );
        }
        liveObjects.delete(action.target);
        break;
      }

      case "link":
        addRelationship(action.relationship, `${path}.relationship`);
        break;

      case "unlink":
        if (!liveRelationships.has(action.target)) {
          report(`${path}.target`, `no relationship "${action.target}" exists at this step`);
        }
        liveRelationships.delete(action.target);
        break;

      default:
        report(`${path}.type`, oneOf(ACTION_TYPES));
    }
  }

  scene.objects.forEach((object, index) =>
    addObject(object, `scene.objects[${index}]`),
  );
  scene.relationships.forEach((relationship, index) =>
    addRelationship(relationship, `scene.relationships[${index}]`),
  );

  if (scene.objects.length === 0) {
    report("scene.objects", "must contain at least one object");
  }
  if (steps.length === 0) report("steps", "must contain at least one step");
  if (steps.length > MAX_STEPS) {
    report("steps", `has ${steps.length} steps; the limit is ${MAX_STEPS}`);
  }

  const stepIds = new Set();

  steps.forEach((step, index) => {
    const path = `steps[${index}]`;

    if (!isRecord(step)) {
      report(path, "must be an object");
      return;
    }

    if (!isText(step.id)) {
      report(`${path}.id`, "must be a non-empty string");
    } else if (stepIds.has(step.id)) {
      report(`${path}.id`, `"${step.id}" is already used by another step`);
    } else {
      stepIds.add(step.id);
    }

    if (!isText(step.description)) {
      report(`${path}.description`, "must be a non-empty string");
    }

    if (!Array.isArray(step.actions)) {
      report(`${path}.actions`, "must be an array");
      return;
    }

    step.actions.forEach((action, actionIndex) =>
      applyAction(action, `${path}.actions[${actionIndex}]`),
    );
  });

  if (peakObjects > MAX_OBJECTS) {
    report(
      "scene",
      `shows up to ${peakObjects} objects at once; the limit is ${MAX_OBJECTS}`,
    );
  }

  return result();
}
