/**
 * Replays a validated plan to find what the scene looks like at each step.
 *
 * frames[i] is the scene after steps[i]'s actions have run:
 *   { objects: [...], relationships: [...] }
 *
 * Objects are replaced, never mutated, so every frame stays independent and
 * a renderer can jump straight to any step.
 */
export function replayPlan(plan) {
  const objects = new Map(
    plan.scene.objects.map((object) => [object.id, { state: "idle", ...object }]),
  );
  const relationships = new Map(
    plan.scene.relationships.map((relationship) => [relationship.id, relationship]),
  );

  const update = (id, changes) => {
    objects.set(id, { ...objects.get(id), ...changes });
  };

  function apply(action) {
    switch (action.type) {
      case "setState":
        action.targets.forEach((id) => update(id, { state: action.state }));
        break;

      case "swap": {
        const [a, b] = action.targets;
        const positionOfA = objects.get(a).position;

        update(a, { position: objects.get(b).position });
        update(b, { position: positionOfA });
        break;
      }

      case "move":
        update(action.target, { position: action.position });
        break;

      case "add":
        objects.set(action.object.id, { state: "idle", ...action.object });
        break;

      case "remove":
        objects.delete(action.target);
        break;

      case "link":
        relationships.set(action.relationship.id, action.relationship);
        break;

      case "unlink":
        relationships.delete(action.target);
        break;
    }
  }

  return plan.steps.map((step) => {
    step.actions.forEach(apply);

    return {
      objects: [...objects.values()],
      relationships: [...relationships.values()],
    };
  });
}
